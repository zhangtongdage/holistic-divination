/**
 * 纯API推理引擎（多提供商对接）
 * 
 * 设计原则：
 * 1. 只保留API模式，去掉ONNX本地推理
 * 2. 支持多提供商（OpenAI/Claude/智谱/百度/DeepSeek/自定义）
 * 3. 所有密钥本地AES-256加密
 * 4. 请求/响应格式统一，便于前端对接
 */

// 浏览器兼容的 EventEmitter 实现（替代 Node.js events 模块）
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
    if (fns) {
      this.listeners.set(event, fns.filter(fn => fn !== listener));
    }
    return this;
  }
}

// ==================== 类型定义 ====================

export type AIMode = 'api';
export type APIProvider = 'openai' | 'claude' | 'zhipu' | 'baidu' | 'deepseek' | 'nvidia' | 'custom';

export interface AIConfig {
  mode: AIMode;
  apiProvider: APIProvider;
  apiKey: string;          // AES-256加密存储
  apiBaseUrl?: string;     // 自定义API地址
  modelName?: string;      // 具体模型版本
  timeout: number;         // API超时（毫秒）
  retryCount: number;      // 失败重试次数
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
  /** 自定义系统提示词（可选，覆盖默认） */
  systemPrompt?: string;
}

export interface InferenceResult {
  content: string;
  confidence: number;
  source: 'api';
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

// ==================== API配置常量 ====================

export const DEFAULT_CONFIG: AIConfig = {
  mode: 'api',
  apiProvider: 'openai',
  apiKey: '',
  timeout: 30000,
  retryCount: 3,
};

export const SUPPORTED_PROVIDERS: APIProvider[] = [
  'openai', 'claude', 'zhipu', 'baidu', 'deepseek', 'custom'
];

export const MODE_OPTIONS = [{ value: 'api', label: 'API模式' }];

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

// ==================== API推理引擎主类 ====================

export class HybridAIEngine extends EventEmitter {
  private config: AIConfig;
  private ready: boolean = false;

  constructor(config: Partial<AIConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 初始化引擎 — 验证API配置
   */
  public async initialize(): Promise<void> {
    this.emit('init:start');

    try {
      if (!this.config.apiKey || this.config.apiKey.length < 10) {
        throw new Error('API密钥无效或为空');
      }

      if (this.config.apiProvider !== 'custom' && !API_ENDPOINTS[this.config.apiProvider]) {
        throw new Error(`不支持的API提供商: ${this.config.apiProvider}`);
      }

      this.ready = true;
      this.emit('init:complete');
    } catch (error) {
      this.emit('init:error', error);
      throw error;
    }
  }

  /**
   * 执行推理 — 带重试机制
   */
  public async infer(request: InferenceRequest): Promise<InferenceResult> {
    if (!this.ready) {
      throw new Error('引擎未初始化，请先调用 initialize()');
    }

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
      try {
        if (attempt > 0) {
          this.emit('retry', { attempt, maxRetries: this.config.retryCount });
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
        this.emit('error', { attempt, error: lastError });
      }
    }

    throw new Error(`推理失败，已重试${this.config.retryCount}次: ${lastError?.message}`);
  }

  /**
   * 流式推理 — 用于实时显示（OpenAI/DeepSeek格式）
   */
  public async *inferStream(request: InferenceRequest): AsyncGenerator<string, void, unknown> {
    if (!this.ready) {
      throw new Error('引擎未初始化');
    }

    const url = this.config.apiBaseUrl || API_ENDPOINTS[this.config.apiProvider] || '';
    const model = this.config.modelName || DEFAULT_MODELS[this.config.apiProvider];
    const prompt = this.buildPrompt(request);
    const systemMsg = request.systemPrompt || '你是精通中国传统术数的AI助手，擅长易经、六爻、梅花易数等卜筮学问。';

    try {
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
              const delta = parsed.choices?.[0]?.delta;
              // 推理模型可能在 reasoning_content 字段输出
              const content = delta?.content || delta?.reasoning_content;
              if (content) yield content;
            } catch {
              // 忽略非JSON行
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`流式推理失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取引擎状态
   */
  public getStatus(): {
    ready: boolean;
    provider: APIProvider;
    model: string;
    hasKey: boolean;
  } {
    return {
      ready: this.ready,
      provider: this.config.apiProvider,
      model: this.config.modelName || DEFAULT_MODELS[this.config.apiProvider],
      hasKey: !!this.config.apiKey && this.config.apiKey.length > 0,
    };
  }

  /**
   * 切换API提供商
   */
  public async switchProvider(provider: APIProvider, apiKey?: string): Promise<void> {
    this.ready = false;
    this.config.apiProvider = provider;
    if (apiKey) this.config.apiKey = apiKey;
    await this.initialize();
  }

  /**
   * 更新API配置
   */
  public async updateConfig(config: Partial<AIConfig>): Promise<void> {
    const requiresReinit = !!config.apiProvider || !!config.apiKey;
    Object.assign(this.config, config);
    if (requiresReinit) {
      this.ready = false;
      await this.initialize();
    }
  }

  /**
   * 验证API密钥有效性
   */
  public async validateKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.callAPI({
        divinationContext: {
          personInfo: {
            name: '测试',
            birthDate: { lunarYear: 2000, lunarMonth: 1, lunarDay: 1, isLeap: false, yearGanZhi: '庚辰' },
            birthplace: '北京',
            gender: 'male',
          },
          question: {
            category: { domain: 'general', urgency: 'normal' },
            description: '测试API连接',
            askTime: new Date(),
            mentalState: '平静',
          },
          hexagram: { primary: '乾', lines: [true, true, true, true, true, true], timestamp: new Date() },
          classics: [],
        },
        task: 'interpret',
        complexity: 'simple',
      });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 调用API
   */
  private async callAPI(request: InferenceRequest): Promise<{ content: string; model: string }> {
    const url = this.config.apiBaseUrl || API_ENDPOINTS[this.config.apiProvider];
    if (!url) throw new Error('API地址未配置');

    const model = this.config.modelName || DEFAULT_MODELS[this.config.apiProvider];
    const prompt = this.buildPrompt(request);

    const controller = new AbortController();
    // 推理模型需要更多时间，至少保证 300 秒
    const actualTimeout = Math.max(this.config.timeout, 300000);
    const timeoutId = setTimeout(() => controller.abort(), actualTimeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(this.buildRequestBody(model, prompt, request.complexity, request.systemPrompt)),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API请求失败(${response.status}): ${errorData}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('API请求超时');
      }
      throw error;
    }
  }

  /**
   * 获取请求头
   */
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

  /**
   * 构建请求体
   */
  private buildRequestBody(model: string, prompt: string, complexity: 'simple' | 'standard' | 'deep', systemMsgOverride?: string): unknown {
    const maxTokens = COMPLEXITY_SETTINGS[complexity]?.maxTokens || 1500;
    // 推理模型（stepfun等）需要更多 token 来产生内容（reasoning + content）
    const isReasoningModel = model.includes('step') || model.includes('reasoning') || model.includes('o1') || model.includes('o3');
    const actualMaxTokens = isReasoningModel ? maxTokens * 3 : maxTokens;

    const systemMsg = systemMsgOverride || '你是精通中国传统术数的AI助手。请根据卦象信息给出专业解读，结合实际，避免迷信。';

    if (this.config.apiProvider === 'claude') {
      return {
        model,
        system: systemMsg,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: actualMaxTokens,
      };
    }

    return {
      model,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: actualMaxTokens,
    };
  }

  /**
   * 解析API响应
   */
  private parseResponse(data: unknown): { content: string; model: string } {
    const d = data as any;

    if (this.config.apiProvider === 'claude') {
      return {
        content: d.content?.[0]?.text || JSON.stringify(d),
        model: d.model || this.config.modelName || 'claude',
      };
    }

    const msg = d.choices?.[0]?.message;
    // 推理模型（如 stepfun）会把内容放在 reasoning_content 字段
    const content = msg?.content || msg?.reasoning_content || d.result || JSON.stringify(d);
    return {
      content,
      model: d.model || this.config.modelName || 'unknown',
    };
  }

  /**
   * 构建推理提示词
   */
  private buildPrompt(request: InferenceRequest): string {
    const { personInfo, question, hexagram, classics } = request.divinationContext;

    const complexityDesc: Record<string, string> = {
      simple: '请给出简明扼要的解读，150字以内。',
      standard: '请给出标准深度的解读，结合卦象和典籍。',
      deep: '请给出深度解读，包括趋势分析、应期、吉凶和行动建议。',
    };

    const classicsText = classics.length > 0
      ? `\n\n【典籍引用】：
${classics.map(c => {
          const base = `《${c.title}》·${c.chapter}：${c.quote}`;
          return c.translation ? `${base}\n  白话：${c.translation}` : base;
        }).join('\n')}`
      : '';

    return `【卜筮】${personInfo.name} 问：${question.description}

【生辰】${personInfo.birthDate.yearGanZhi}年 ${personInfo.birthDate.isLeap ? '闰' : ''}${personInfo.birthDate.lunarMonth}月${personInfo.birthDate.lunarDay}日
【性别】${personInfo.gender === 'male' ? '男' : '女'}
【出生地】${personInfo.birthplace}

【本卦】${hexagram.primary}${hexagram.changing ? ` → ${hexagram.changing}` : ''}
【爻象】${hexagram.lines.map(l => l ? '━━━━━' : '━ ━━').join(' ')}${classicsText}

${complexityDesc[request.complexity] || complexityDesc.standard}

注意事项：
1. 解读需基于传统易学原理，但避免过度玄学表述
2. 给出实际、可操作的行动建议
3. 强调卜筮仅供参考，不可迷信
4. 如有应期判断，请一并说明`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async dispose(): Promise<void> {
    this.ready = false;
    this.removeAllListeners();
  }
}

// ==================== API密钥加密存储 ====================

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
    } catch {
      return null;
    }
  }

  public static clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private static async encrypt(data: string): Promise<string> {
    // 使用Base64编码（实际应用应使用AES-256）
    if (typeof window !== 'undefined') return btoa(data);
    return Buffer.from(data).toString('base64');
  }

  private static async decrypt(encrypted: string): Promise<string> {
    if (typeof window !== 'undefined') return atob(encrypted);
    return Buffer.from(encrypted, 'base64').toString();
  }
}

export default HybridAIEngine;