/**
 * 本地GGUF推理引擎 - 基于 node-llama-cpp
 * 
 * 在原有API模式基础上增加本地模型推理能力
 * 模型文件: models/xuanji-interpreter.gguf
 */

import { getLlama, LlamaChatSession, Llama, LlamaModel, LlamaContext } from 'node-llama-cpp';
import path from 'path';
import fs from 'fs';

// ==================== 类型定义 ====================

export type AIMode = 'api' | 'local';

export interface LocalAIConfig {
  mode: 'local';
  modelPath: string;        // GGUF模型路径
  contextSize: number;      // 上下文窗口大小
  gpuLayers: number;        // GPU加速层数 (0=纯CPU)
  temperature: number;
  maxTokens: number;
}

export interface InferenceRequest {
  divinationContext: {
    personInfo: any;
    question: any;
    hexagram: any;
    classics: any[];
  };
  task: 'interpret' | 'classics_match' | 'trend_analysis' | 'suggestion';
  complexity: 'simple' | 'standard' | 'deep';
  systemPrompt?: string;
}

export interface InferenceResult {
  content: string;
  confidence: number;
  source: 'local';
  latency: number;
  modelUsed: string;
  citations: string[];
}

// ==================== 默认配置 ====================

const DEFAULT_LOCAL_CONFIG: LocalAIConfig = {
  mode: 'local',
  modelPath: '',  // 运行时自动查找
  contextSize: 4096,
  gpuLayers: 35,  // RTX 4060 可以加速全部层
  temperature: 0.7,
  maxTokens: 2048,
};

// ==================== 本地推理引擎 ====================

export class LocalAIEngine {
  private config: LocalAIConfig;
  private llama: Llama | null = null;
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private session: LlamaChatSession | null = null;
  private ready: boolean = false;

  constructor(config: Partial<LocalAIConfig> = {}) {
    this.config = { ...DEFAULT_LOCAL_CONFIG, ...config };
  }

  /**
   * 查找模型文件
   */
  private findModelPath(): string {
    if (this.config.modelPath && fs.existsSync(this.config.modelPath)) {
      return this.config.modelPath;
    }

    // 按优先级查找
    const searchPaths = [
      // 开发环境
      path.join(process.cwd(), 'models', 'xuanji-interpreter.gguf'),
      path.join(process.cwd(), '..', 'models', 'xuanji-interpreter.gguf'),
      // Tauri打包环境
      path.join(process.cwd(), 'src-tauri', 'models', 'xuanji-interpreter.gguf'),
      // 安装环境
      path.join(process.env.HOME || '~', '.xuanji', 'models', 'xuanji-interpreter.gguf'),
      // 同级目录
      path.join(__dirname, '..', 'models', 'xuanji-interpreter.gguf'),
    ];

    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    throw new Error(
      '找不到模型文件 xuanji-interpreter.gguf\n' +
      '请将模型放在以下位置之一:\n' +
      searchPaths.map(p => `  - ${p}`).join('\n')
    );
  }

  /**
   * 初始化引擎
   */
  async initialize(): Promise<void> {
    console.log('[LocalAI] 初始化本地推理引擎...');

    const modelPath = this.findModelPath();
    console.log(`[LocalAI] 模型路径: ${modelPath}`);

    // 检查模型文件大小
    const stat = fs.statSync(modelPath);
    const sizeMB = stat.size / 1024 / 1024;
    console.log(`[LocalAI] 模型大小: ${sizeMB.toFixed(0)}MB`);

    // 初始化 llama.cpp
    this.llama = await getLlama();
    console.log('[LocalAI] llama.cpp 后端初始化完成');

    // 加载模型
    this.model = await this.llama.loadModel({
      modelPath,
      gpuLayers: this.config.gpuLayers,
    });
    console.log(`[LocalAI] 模型加载完成 (GPU层: ${this.config.gpuLayers})`);

    // 创建上下文
    this.context = await this.model.createContext({
      contextSize: this.config.contextSize,
    });

    // 创建对话会话
    this.session = new LlamaChatSession({
      contextSequence: this.context.getSequence(),
    });

    this.ready = true;
    console.log('[LocalAI] 引擎初始化完成 ✅');
  }

  /**
   * 执行推理
   */
  async infer(request: InferenceRequest): Promise<InferenceResult> {
    if (!this.ready || !this.session) {
      throw new Error('引擎未初始化，请先调用 initialize()');
    }

    const startTime = Date.now();
    const prompt = this.buildPrompt(request);
    const systemMsg = request.systemPrompt || 
      '你是一位精通中国传统术数的AI解卦师，擅长易经六爻、梅花易数、奇门遁甲、子平八字等卜筮学问。请根据卦象信息给出专业、准确、实用的解读。';

    try {
      // 使用 system prompt + 用户 prompt
      const response = await this.session.prompt(prompt, {
        systemPrompt: systemMsg,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      });

      return {
        content: response,
        confidence: 0.85,
        source: 'local',
        latency: Date.now() - startTime,
        modelUsed: 'xuanji-1.5b',
        citations: request.divinationContext.classics.map(
          (c: any) => `${c.title}·${c.chapter}`
        ),
      };
    } catch (error) {
      throw new Error(`本地推理失败: ${(error as Error).message}`);
    }
  }

  /**
   * 流式推理
   */
  async *inferStream(request: InferenceRequest): AsyncGenerator<string, void, unknown> {
    if (!this.ready || !this.session) {
      throw new Error('引擎未初始化');
    }

    const prompt = this.buildPrompt(request);
    const systemMsg = request.systemPrompt || 
      '你是一位精通中国传统术数的AI解卦师。';

    // node-llama-cpp 的 stream 支持
    const response = await this.session.prompt(prompt, {
      systemPrompt,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      yieldDelayedTokens: true,
    });

    // 简化实现：直接返回完整结果
    yield response;
  }

  /**
   * 获取引擎状态
   */
  getStatus() {
    return {
      ready: this.ready,
      mode: 'local' as const,
      modelPath: this.config.modelPath,
      gpuLayers: this.config.gpuLayers,
      contextSize: this.config.contextSize,
    };
  }

  /**
   * 构建提示词
   */
  private buildPrompt(request: InferenceRequest): string {
    const { personInfo, question, hexagram, classics } = request.divinationContext;

    const complexityDesc: Record<string, string> = {
      simple: '请给出简明扼要的解读，150字以内。',
      standard: '请给出标准深度的解读，结合卦象和典籍。',
      deep: '请给出深度解读，包括趋势分析、应期、吉凶和行动建议。',
    };

    const classicsText = classics.length > 0
      ? `\n\n【典籍引用】：\n${classics.map((c: any) => {
          const base = `《${c.title}》·${c.chapter}：${c.quote}`;
          return c.translation ? `${base}\n  白话：${c.translation}` : base;
        }).join('\n')}`
      : '';

    return `【卜筮】${personInfo.name} 问：${question.description}

【生辰】${personInfo.birthDate.yearGanZhi}年 ${personInfo.birthDate.isLeap ? '闰' : ''}${personInfo.birthDate.lunarMonth}月${personInfo.birthDate.lunarDay}日
【性别】${personInfo.gender === 'male' ? '男' : '女'}
【出生地】${personInfo.birthplace}

【本卦】${hexagram.primary}${hexagram.changing ? ` → ${hexagram.changing}` : ''}
【爻象】${hexagram.lines.map((l: boolean) => l ? '━━━━━' : '━ ━━').join(' ')}${classicsText}

${complexityDesc[request.complexity] || complexityDesc.standard}`;
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
    if (this.model) {
      await this.model.dispose();
    }
    this.ready = false;
  }
}

export default LocalAIEngine;
