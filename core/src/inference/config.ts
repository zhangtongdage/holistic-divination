/**
 * AI配置管理器
 * 处理用户配置读写、加密、验证
 */

import { AIConfig, AIMode, APIProvider } from './ai-engine';

export const DEFAULT_CONFIG: AIConfig = {
  mode: 'api',
  apiProvider: 'nvidia',
  apiKey: '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',
  apiBaseUrl: '/api/nvidia/v1/chat/completions',
  modelName: 'stepfun-ai/step-3.5-flash',
  timeout: 300000,
  retryCount: 2,
};

// 支持的API提供商配置
export const SUPPORTED_PROVIDERS: { 
  id: APIProvider; 
  name: string; 
  defaultUrl: string; 
  defaultModel: string;
  keyHint: string;
}[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    keyHint: 'sk-...',
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    defaultUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-haiku-20240307',
    keyHint: 'sk-ant-...',
  },
  {
    id: 'zhipu',
    name: '智谱AI',
    defaultUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultModel: 'glm-4-flash',
    keyHint: '从智谱AI开放平台获取',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    keyHint: '从DeepSeek开放平台获取',
  },
  {
    id: 'baidu',
    name: '百度文心',
    defaultUrl: '',
    defaultModel: '',
    keyHint: '从百度智能云控制台获取',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    defaultUrl: '/api/nvidia/v1/chat/completions',
    defaultModel: 'stepfun-ai/step-3.5-flash',
    keyHint: 'nvapi-...',
  },
  {
    id: 'custom',
    name: '自定义 (OpenAI兼容)',
    defaultUrl: 'https://your-api.com/v1/chat/completions',
    defaultModel: '',
    keyHint: '您自定义的API密钥',
  },
];

// 模式说明（仅API和混合两种模式）
export const MODE_OPTIONS: { value: AIMode; label: string; description: string }[] = [
  {
    value: 'api',
    label: 'API模式',
    description: '通过API远程AI推理，支持多种提供商，开箱即用',
  },
  {
    value: 'hybrid',
    label: '混合模式',
    description: '本地模型优先（Tauri桌面端），失败时自动回退API',
  },
];

// 模型复杂度对应的建议
export const COMPLEXITY_SETTINGS = {
  simple: {
    label: '简洁',
    description: '快速回答，适合简单问题',
    tokens: 500,
    prefers: 'api' as const,
  },
  standard: {
    label: '标准',
    description: '完整解读，适合大多数情况',
    tokens: 1500,
    prefers: 'api' as const,
  },
  deep: {
    label: '深入',
    description: '详尽分析，结合多典籍引用',
    tokens: 4096,
    prefers: 'api' as const,
  },
};
