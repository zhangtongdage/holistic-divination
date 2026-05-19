/**
 * 本地GGUF模型推理引擎
 * 基于 node-llama-cpp 实现本地Qwen2推理
 */

import * as path from 'path';
import * as fs from 'fs';
import { InferenceRequest, InferenceResult } from './ai-engine';

let getLlama: any = null;
let LlamaChatSession: any = null;
let _importAttempted = false;

async function ensureNodeLlamaCpp(): Promise<boolean> {
  if (_importAttempted) return !!getLlama;
  _importAttempted = true;
  try {
    const nodeLlamaCpp = await import('node-llama-cpp');
    getLlama = nodeLlamaCpp.getLlama;
    LlamaChatSession = nodeLlamaCpp.LlamaChatSession;
    return true;
  } catch {
    return false;
  }
}

export interface LocalModelConfig {
  modelPath: string;
  contextSize?: number;      // 上下文窗口大小，默认2048
  gpuLayers?: number;        // GPU层数，-1=自动
  temperature?: number;      // 生成温度，默认0.7
  maxTokens?: number;        // 最大生成token数，默认1024
}

const DEFAULT_LOCAL_CONFIG: Required<LocalModelConfig> = {
  modelPath: '',
  contextSize: 2048,
  gpuLayers: -1,
  temperature: 0.7,
  maxTokens: 1024,
};

/**
 * 本地推理引擎 - 使用 node-llama-cpp 加载 GGUF 模型
 */
export class LocalInferenceEngine {
  private config: Required<LocalModelConfig>;
  private llama: any = null;
  private model: any = null;
  private context: any = null;
  private session: any = null;
  private initialized = false;

  constructor(config: LocalModelConfig) {
    this.config = { ...DEFAULT_LOCAL_CONFIG, ...config };
  }

  /**
   * 初始化：加载模型到内存/GPU，创建推理会话
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    const loaded = await ensureNodeLlamaCpp();
    if (!loaded || !getLlama) {
      throw new Error('node-llama-cpp 未安装。请运行: cd core && npm install node-llama-cpp');
    }

    const modelPath = path.resolve(this.config.modelPath);
    if (!fs.existsSync(modelPath)) {
      throw new Error(`模型文件不存在: ${modelPath}`);
    }

    // 加载 llama 后端
    this.llama = await getLlama();

    // 加载 GGUF 模型
    this.model = await this.llama.loadModel({
      modelPath,
      gpuLayers: this.config.gpuLayers,
    });

    // 创建推理上下文
    this.context = await this.model.createContext({
      contextSize: this.config.contextSize,
    });

    // 创建聊天会话（systemPrompt 在这里设置）
    this.session = new LlamaChatSession({
      contextSequence: this.context.getSequence(),
      systemPrompt: '你是一位精通中华传统术数的卜算大师，擅长六爻、八字、梅花易数、奇门遁甲。请根据卦象信息给出专业解读。',
    });

    this.initialized = true;
  }

  /**
   * 发送推理请求
   */
  async infer(request: InferenceRequest): Promise<InferenceResult> {
    if (!this.initialized || !this.session) {
      throw new Error('本地引擎未初始化，请先调用 initialize()');
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(request);
      const response = await this.session.prompt(prompt, {
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });
      return {
        content: response,
        confidence: 0.7,
        source: 'local',
        latency: Date.now() - startTime,
        modelUsed: path.basename(this.config.modelPath),
        citations: [],
      };
    } catch (error) {
      throw new Error(`本地推理失败: ${(error as Error).message}`);
    }
  }

  /**
   * 构建推理提示词
   */
  private buildPrompt(request: InferenceRequest): string {
    const ctx = request.divinationContext;
    const parts: string[] = [];

    // 人象信息
    if (ctx.personInfo) {
      const p = ctx.personInfo;
      parts.push(`【求测人信息】`);
      parts.push(`姓名：${p.name || '匿名'}`);
      if (p.birthDate) {
        parts.push(`生辰：农历${p.birthDate.lunarYear}年${p.birthDate.lunarMonth}月${p.birthDate.lunarDay}日${p.birthDate.isLeap ? '(闰月)' : ''}`);
        if (p.birthDate.yearGanZhi) parts.push(`年柱：${p.birthDate.yearGanZhi}`);
      }
      if (p.birthplace) parts.push(`出生地：${p.birthplace}`);
      parts.push(`性别：${p.gender === 'female' ? '女' : '男'}`);
    }

    // 问事信息
    if (ctx.question) {
      const q = ctx.question;
      parts.push('');
      parts.push(`【问事信息】`);
      parts.push(`类别：${q.category?.domain || '综合'}`);
      parts.push(`问题：${q.description || '综合询问'}`);
      if (q.mentalState) parts.push(`心绪：${q.mentalState}`);
    }

    // 补充人象（supplementary 字段透传）
    if (ctx.supplementary) {
      const supp = ctx.supplementary;
      parts.push('');
      parts.push(`【补充信息】`);
      if (supp.occupation) parts.push(`职业：${supp.occupation}`);
      if (supp.financialStatus) parts.push(`财务状况：${supp.financialStatus}`);
      if (supp.keyLifeEvents) parts.push(`人生关键事件：${supp.keyLifeEvents}`);
      if (supp.relatedPersons) parts.push(`相关人物：${supp.relatedPersons}`);
    }

    // 主观预期（expectation 字段透传）
    if (ctx.expectation) {
      const exp = ctx.expectation;
      parts.push('');
      parts.push(`【问者预期】`);
      if (exp.desiredOutcome) parts.push(`期望结果：${exp.desiredOutcome}`);
      if (exp.minimalAcceptable) parts.push(`可接受底线：${exp.minimalAcceptable}`);
      if (exp.actionPlan) parts.push(`打算行动：${exp.actionPlan}`);
      if (exp.riskTolerance) parts.push(`风险承受度：${exp.riskTolerance}`);
      if (exp.timeHorizon) parts.push(`期望周期：${exp.timeHorizon}`);
    }

    // 卦象信息
    if (ctx.hexagram) {
      const h = ctx.hexagram;
      parts.push('');
      parts.push(`【卦象信息】`);
      parts.push(`本卦：${h.primary}`);
      if (h.changing) parts.push(`变卦：${h.changing}`);
      if (h.lines) parts.push(`爻变：${h.lines.join(' ')}`);
    }

    // 经典引用
    if (ctx.classics && ctx.classics.length > 0) {
      parts.push('');
      parts.push(`【相关典籍】`);
      for (const c of ctx.classics) {
        parts.push(`《${c.title}》${c.chapter ? `·${c.chapter}` : ''}：${c.quote}`);
        if (c.translation) parts.push(`  白话：${c.translation}`);
      }
    }

    parts.push('');
    parts.push(`请结合以上所有信息，从${ctx.question?.category?.domain || '综合'}角度给出详细的、高度个性化的卜算解读。务必考虑求测人的职业、财务状况、人生事件和主观预期。`);

    return parts.join('\n');
  }
  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    this.session = null;
    if (this.context) {
      this.context.dispose();
      this.context = null;
    }
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.llama = null;
    this.initialized = false;
  }

  /**
   * 是否可用
   */
  isAvailable(): boolean {
    return !!getLlama && this.initialized;
  }
}

/**
 * 检查本地引擎是否可用（node-llama-cpp 已安装）
 * 注意：首次调用会触发异步导入，建议在初始化流程中使用
 */
export async function isLocalEngineAvailableAsync(): Promise<boolean> {
  return ensureNodeLlamaCpp();
}

/**
 * 同步检查（可能返回 false，即使模块可用但尚未导入）
 */
export function isLocalEngineAvailable(): boolean {
  return _importAttempted && !!getLlama;
}

/**
 * 快速创建本地引擎实例
 */
export function createLocalEngine(modelPath: string, options?: Partial<LocalModelConfig>): LocalInferenceEngine {
  return new LocalInferenceEngine({
    modelPath,
    ...options,
  });
}