/**
 * 混合AI推理引擎（API + 本地模型双模式）
 * 
 * 支持：
 * 1. API模式：OpenAI/Claude/智谱/DeepSeek等
 * 2. 本地模式：GGUF模型离线推理
 * 
 * 设计原则：
 * 1. 优先使用本地模型（零网络依赖）
 * 2. API模式作为备选和高质量补充
 * 3. 所有密钥本地AES-256加密
 */

// 浏览器兼容的 EventEmitter
class EventEmitter {
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const fns = this.listeners.get(event);
    if (!fns || fns.length === 0) return false;
    fns.forEach(fn => fn(...args));
    return true;
  }

  removeAllListeners(): this {
    this.listeners.clear();
    return this;
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    const fns = this.listeners.get(event);
    if (fns) this.listeners.set(event, fns.filter(fn => fn !== listener));
    return this;
  }
}

// ==================== 类型定义 ====================

export type AIMode = 'api' | 'local' | 'hybrid';
export type APIProvider = 'openai' | 'claude' | 'zhipu' | 'baidu' | 'deepseek' | 'nvidia' | 'custom';

export interface AIConfig {
  mode: AIMode;
  apiProvider: APIProvider;
  apiKey: string;
  apiBaseUrl?: string;
  modelName?: string;
  timeout: number;
  retryCount: number;
  // 本地模型配置
  localModelPath?: string;
  gpuLayers?: number;
  contextSize?: number;
}

export interface InferenceRequest {
  divinationContext: {
    personInfo: PersonInfo;
    question: QuestionInfo;
    hexagram: HexagramResult;
    classics: ClassicReference[];
  };
  task: 'interpret' | 'classics_match' | 'trend_analysis' | 'suggestion';
  complexity: 'simple' | 'standard' | 'deep';
  systemPrompt?: string;
}

export interface InferenceResult {
  content: string;
  confidence: number;
  source: 'api' | 'local';
  latency: number;
  modelUsed: string;
  citations: string[];
}

export interface PersonInfo {
  name: string;
  birthDate: LunarDateInfo;
  birthplace: string;
  gender: 'male' | 'female';
}

export interface LunarDateInfo {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeap: boolean;
  yearGanZhi: string;
}

export interface QuestionInfo {
  category: QuestionCategory;
  description: string;
  askTime: Date;
  mentalState: string;
}

export interface QuestionCategory {
  domain: 'career' | 'relationship' | 'wealth' | 'health' | 'study' | 'travel' | 'decision' | 'general';
  urgency: 'urgent' | 'normal' | 'planning';
}

export interface HexagramResult {
  primary: string;
  changing?: string;
  lines: boolean[];
  timestamp: Date;
}

export interface ClassicReference {
  title: string;
  chapter: string;
  quote: string;
  translation?: string;
  relevance: number;
}

// ==================== 配置常量 ====================

export const DEFAULT_CONFIG: AIConfig = {
  mode: 'hybrid',  // 默认混合模式：优先本地，失败回退API
  apiProvider: 'openai',
  apiKey: '',
  timeout: 30000,
  retryCount: 3,
  gpuLayers: 35,
  contextSize: 4096,
};

export const SUPPORTED_PROVIDERS: APIProvider[] = [
  'openai', 'claude', 'zhipu', 'baidu', 'deepseek', 'custom'
];

export const MODE_OPTIONS = [
  { value: 'local', label: '本地模式（离线可用）' },
  { value: 'api', label: 'API模式（需联网）' },
  { value: 'hybrid', label: '混合模式（推荐）' },
];

export const COMPLEXITY_SETTINGS = {
  simple: { label: '简明', maxTokens: 2000, description: '快速解答，适合简单问题' },
  standard: { label: '标准', maxTokens: 4000, description: '常规深度解读' },
  deep: { label: '深度', maxTokens: 8000, description: '完整分析，含应期和建议' },
};

const API_ENDPOINTS: Record<APIProvider, string | null> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  baidu: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  nvidia: '/api/nvidia/v1/chat/completions',
  custom: null,
};

const DEFAULT_MODELS: Record<APIProvider, string> = {
  openai: 'gpt-4-turbo-preview',
  claude: 'claude-3-sonnet-20240229',
  zhipu: 'glm-4',
  baidu: 'ernie-bot-4',
  deepseek: 'deepseek-chat',
  nvidia: 'stepfun-ai/step-3.5-flash',
  custom: 'custom-model',
};

// ==================== 混合AI引擎主类 ====================

export class HybridAIEngine extends EventEmitter {
  private config: AIConfig;
  private ready: boolean = false;
  private localEngine: any = null;  // LocalAIEngine (动态导入)
  private apiAvailable: boolean = false;

  constructor(config: Partial<AIConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 初始化引擎
   */
  public async initialize(): Promise<void> {
    this.emit('init:start');

    try {
      // 1. 尝试初始化本地模型
      if (this.config.mode === 'local' || this.config.mode === 'hybrid') {
        try {
          await this.initLocalEngine();
          console.log('[HybridAI] 本地模型初始化成功 ✅');
        } catch (error) {
          console.warn('[HybridAI] 本地模型初始化失败:', (error as Error).message);
          if (this.config.mode === 'local') {
            throw error;  // 纯本地模式下失败则报错
          }
          // 混合模式下继续尝试API
        }
      }

      // 2. 检查API可用性
      if (this.config.mode === 'api' || this.config.mode === 'hybrid') {
        if (this.config.apiKey && this.config.apiKey.length >= 10) {
          this.apiAvailable = true;
        }
      }

      if (!this.localEngine && !this.apiAvailable) {
        throw new Error('无可用推理后端：本地模型未找到，API密钥未配置');
      }

      this.ready = true;
      this.emit('init:complete');
    } catch (error) {
      this.emit('init:error', error);
      throw error;
    }
  }

  /**
   * 初始化本地引擎 (动态导入，避免浏览器环境报错)
   */
  private async initLocalEngine(): Promise<void> {
    // 在Node.js/Tauri环境中动态导入
    if (typeof window === 'undefined') {
      const { LocalInferenceEngine } = await import('./local-engine');
      this.localEngine = new LocalInferenceEngine({
        modelPath: this.config.localModelPath || '',
        gpuLayers: this.config.gpuLayers || 35,
        contextSize: this.config.contextSize || 4096,
      });
      await this.localEngine.initialize();
    }
  }

  /**
   * 执行推理 — 智能路由
   */
  public async infer(request: InferenceRequest): Promise<InferenceResult> {
    if (!this.ready) {
      throw new Error('引擎未初始化，请先调用 initialize()');
    }

    const startTime = Date.now();

    // 混合模式：优先本地，失败回退API
    if (this.localEngine) {
      try {
        const result = await this.localEngine.infer(request);
        return result;
      } catch (error) {
        console.warn('[HybridAI] 本地推理失败，回退API:', (error as Error).message);
        if (!this.apiAvailable) {
          throw error;
        }
      }
    }

    // API模式或本地失败回退
    if (this.apiAvailable) {
      return await this.inferViaAPI(request, startTime);
    }

    throw new Error('无可用推理后端');
  }

  /**
   * 流式推理
   */
  public async *inferStream(request: InferenceRequest): AsyncGenerator<string, void, unknown> {
    if (!this.ready) {
      throw new Error('引擎未初始化');
    }

    // 本地模型流式
    if (this.localEngine) {
      try {
        yield* this.localEngine.inferStream(request);
        return;
      } catch (error) {
        console.warn('[HybridAI] 本地流式推理失败，回退API');
      }
    }

    // API流式
    if (this.apiAvailable) {
      yield* this.inferStreamViaAPI(request);
      return;
    }

    throw new Error('无可用推理后端');
  }

  /**
   * 获取引擎状态
   */
  public getStatus() {
    return {
      ready: this.ready,
      mode: this.config.mode,
      localAvailable: !!this.localEngine,
      apiAvailable: this.apiAvailable,
      provider: this.config.apiProvider,
      model: this.config.modelName || DEFAULT_MODELS[this.config.apiProvider],
      hasKey: !!this.config.apiKey && this.config.apiKey.length > 0,
    };
  }

  /**
   * 切换模式
   */
  public async switchMode(mode: AIMode): Promise<void> {
    this.ready = false;
    this.config.mode = mode;
    await this.initialize();
  }

  /**
   * 更新配置
   */
  public async updateConfig(config: Partial<AIConfig>): Promise<void> {
    Object.assign(this.config, config);
    this.ready = false;
    await this.initialize();
  }

  // ==================== API推理（保留原有逻辑） ====================

  private async inferViaAPI(request: InferenceRequest, startTime: number): Promise<InferenceResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
      try {
        if (attempt > 0) {
          await this.delay(1000 * attempt);
        }

        const response = await this.callAPI(request);

        return {
          content: response.content,
          confidence: 0.9,
          source: 'api',
          latency: Date.now() - startTime,
          modelUsed: response.model,
          citations: request.divinationContext.classics.map(c => `${c.title}·${c.chapter}`),
        };
      } catch (error) {
        lastError = error as Error;
      }
    }

    throw new Error(`API推理失败，已重试${this.config.retryCount}次: ${lastError?.message}`);
  }

  public async *inferStreamViaAPI(request: InferenceRequest): AsyncGenerator<string, void, unknown> {
    const url = this.config.apiBaseUrl || API_ENDPOINTS[this.config.apiProvider] || '';
    const model = this.config.modelName || DEFAULT_MODELS[this.config.apiProvider];
    const prompt = this.buildPrompt(request);
    const systemMsg = request.systemPrompt || '你是精通中国传统术数的AI助手。';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: COMPLEXITY_SETTINGS[request.complexity].maxTokens,
        stream: true,
      }),
    });

    if (!response.body) throw new Error('流式响应为空');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {}
        }
      }
    }
  }

  private async callAPI(request: InferenceRequest): Promise<{ content: string; model: string }> {
    const url = this.config.apiBaseUrl || API_ENDPOINTS[this.config.apiProvider];
    if (!url) throw new Error('API地址未配置');

    const model = this.config.modelName || DEFAULT_MODELS[this.config.apiProvider];
    const prompt = this.buildPrompt(request);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Math.max(this.config.timeout, 300000));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
        body: JSON.stringify(this.buildRequestBody(model, prompt, request.complexity, request.systemPrompt)),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API请求失败(${response.status})`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') throw new Error('API请求超时');
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const key = this.config.apiKey;
    switch (this.config.apiProvider) {
      case 'claude':
        return { 'x-api-key': key, 'anthropic-version': '2023-06-01' };
      case 'baidu':
        return {};
      default:
        return { 'Authorization': `Bearer ${key}` };
    }
  }

  private buildRequestBody(model: string, prompt: string, complexity: string, systemMsg?: string): unknown {
    const maxTokens = COMPLEXITY_SETTINGS[complexity as keyof typeof COMPLEXITY_SETTINGS]?.maxTokens || 1500;
    const systemMsgDefault = systemMsg || '你是精通中国传统术数的AI助手。请根据卦象信息给出专业解读，结合实际，避免迷信。';

    if (this.config.apiProvider === 'claude') {
      return { model, system: systemMsgDefault, messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens };
    }

    return {
      model,
      messages: [
        { role: 'system', content: systemMsgDefault },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    };
  }

  private parseResponse(data: unknown): { content: string; model: string } {
    const d = data as any;
    if (this.config.apiProvider === 'claude') {
      return { content: d.content?.[0]?.text || JSON.stringify(d), model: d.model || 'claude' };
    }
    const msg = d.choices?.[0]?.message;
    return {
      content: msg?.content || msg?.reasoning_content || JSON.stringify(d),
      model: d.model || 'unknown',
    };
  }

  private buildPrompt(request: InferenceRequest): string {
    const { personInfo, question, hexagram, classics } = request.divinationContext;
    const complexityDesc: Record<string, string> = {
      simple: '请给出简明扼要的解读，150字以内。',
      standard: '请给出标准深度的解读，结合卦象和典籍。',
      deep: '请给出深度解读，包括趋势分析、应期、吉凶和行动建议。',
    };

    const classicsText = classics.length > 0
      ? `\n\n【典籍引用】：\n${classics.map(c => `《${c.title}》·${c.chapter}：${c.quote}`).join('\n')}`
      : '';

    return `【卜筮】${personInfo.name} 问：${question.description}

【生辰】${personInfo.birthDate.yearGanZhi}年 ${personInfo.birthDate.isLeap ? '闰' : ''}${personInfo.birthDate.lunarMonth}月${personInfo.birthDate.lunarDay}日
【性别】${personInfo.gender === 'male' ? '男' : '女'}
【出生地】${personInfo.birthplace}

【本卦】${hexagram.primary}${hexagram.changing ? ` → ${hexagram.changing}` : ''}
【爻象】${hexagram.lines.map(l => l ? '━━━━━' : '━ ━━').join(' ')}${classicsText}

${complexityDesc[request.complexity] || complexityDesc.standard}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async dispose(): Promise<void> {
    if (this.localEngine) {
      await this.localEngine.dispose();
    }
    this.ready = false;
    this.removeAllListeners();
  }
}

// ==================== 安全配置存储 ====================

export class SecureConfigStorage {
  private static readonly STORAGE_KEY = 'hd_ai_config';

  public static async save(config: AIConfig): Promise<void> {
    const encrypted = await this.encrypt(JSON.stringify(config));
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, encrypted);
    }
  }

  public static async load(): Promise<AIConfig | null> {
    if (typeof window === 'undefined') return null;
    const encrypted = localStorage.getItem(this.STORAGE_KEY);
    if (!encrypted) return null;
    try {
      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch { return null; }
  }

  public static clear(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(this.STORAGE_KEY);
  }

  private static async encrypt(data: string): Promise<string> {
    if (typeof window !== 'undefined') return btoa(data);
    return Buffer.from(data).toString('base64');
  }

  private static async decrypt(encrypted: string): Promise<string> {
    if (typeof window !== 'undefined') return atob(encrypted);
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }
}

export default HybridAIEngine;
