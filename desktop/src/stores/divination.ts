import { defineStore } from 'pinia'
import type { HolisticPersonContext, CollectionProgress } from '@core/collection/holistic-collector'
import type { FinalDivinationResult } from '@core/engine/six-layer-engine'
import { HolisticInfoCollector } from '@core/collection/holistic-collector'
import { SixLayerFusionEngine } from '@core/engine/six-layer-engine'
import type { AIConfig } from '@core/inference/ai-engine'

// Divination store state
export const useDivinationStore = defineStore('divination', {
  state: () => ({
    // 当前采集的上下文
    currentContext: null as HolisticPersonContext | null,
    // 采集进度
    progress: null as CollectionProgress | null,
    // 历史记录
    history: [] as FinalDivinationResult[],
    // 当前结果
    currentResult: null as FinalDivinationResult | null,
    // 采集器实例
    collector: null as HolisticInfoCollector | null,
    // 引擎实例
    engine: null as SixLayerFusionEngine | null,
    // 是否正在加载
    isLoading: false,
    // 错误信息
    error: null as string | null,
  }),

  getters: {
    // 是否有正在进行的卜算
    hasActiveDivination: (state) => state.collector !== null,
    // 核心信息是否完整
    isCoreComplete: (state) => {
      if (!state.currentContext) return false
      return !!(
        state.currentContext.core &&
        state.currentContext.question &&
        state.currentContext.situation
      )
    },
    // 获取指定ID的结果
    getResultById: (state) => (id: string) => {
      return state.history.find(r => r.id === id) || null
    },
  },

  actions: {
    /**
     * 开始新的卜算
     */
    startNewDivination(): void {
      this.collector = new HolisticInfoCollector()
      this.currentContext = null
      this.currentResult = null
      this.error = null
      this.updateProgress()
    },

    /**
     * 更新采集进度
     */
    updateProgress(): void {
      if (this.collector) {
        this.progress = this.collector.getProgress()
      }
    },

    /**
     * 设置核心人象
     */
    setCorePerson(data: HolisticPersonContext['core']): void {
      if (!this.collector) {
        this.startNewDivination()
      }
      this.collector!.setCorePerson(data)
      this.updateProgress()
    },

    /**
     * 设置核心问事
     */
    setCoreQuestion(data: HolisticPersonContext['question']): void {
      if (!this.collector) return
      this.collector!.setCoreQuestion(data)
      this.updateProgress()
    },

    /**
     * 设置当前境地
     */
    setCoreSituation(data: HolisticPersonContext['situation']): void {
      if (!this.collector) return
      this.collector!.setCoreSituation(data)
      this.updateProgress()
    },

    /**
     * 验证上下文是否可生成卦
     */
    validateContext(context: Partial<HolisticPersonContext>): boolean {
      const validation = this.collector?.validateForGeneration()
      return validation?.valid ?? false
    },

    /**
     * 执行卜算
     */
    async performDivination(context: HolisticPersonContext): Promise<string> {
      this.isLoading = true
      this.error = null

      try {
        // 从 localStorage 加载 AI 配置并初始化引擎
        if (!this.engine) {
          this.engine = new SixLayerFusionEngine()
        }
        
        // 加载 AI 配置：优先 localStorage，否则用默认配置
        try {
          let config: any = null
          const savedConfig = localStorage.getItem('hd_ai_config')
          if (savedConfig) {
            config = JSON.parse(savedConfig)
          }
          // 如果 localStorage 为空或没有 apiKey，使用默认配置
          if (!config || !config.apiKey || config.apiKey.length < 10) {
            config = {
              mode: 'hybrid',  // 混合模式：优先本地GGUF模型，失败回退API
              apiProvider: 'nvidia',
              apiKey: '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',
              apiBaseUrl: '/api/nvidia/v1/chat/completions',
              modelName: 'stepfun-ai/step-3.5-flash',
              localModelPath: './models/xuanji-1.5b.gguf',
              timeout: 300000,
              retryCount: 1,
            }
          }
          await this.engine.initializeAI(config)
        } catch (e) {
          console.warn('AI配置加载失败，将使用纯算法模式:', e)
        }

        // 执行卜算（含 AI 增强解读）
        const result = await this.engine.divinate(context)
        
        // 保存到历史
        this.history.unshift(result)
        this.currentResult = result
        this.currentContext = context

        // 保存到本地存储
        this.saveToStorage()

        return result.id
      } catch (err) {
        this.error = err instanceof Error ? err.message : '未知错误'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 初始化AI引擎
     */
    async initializeAI(config: AIConfig): Promise<void> {
      if (!this.engine) {
        this.engine = new SixLayerFusionEngine()
      }
      await this.engine.initializeAI(config)
    },

    /**
     * 加载指定结果
     */
    loadResult(id: string): FinalDivinationResult | null {
      const result = this.history.find(r => r.id === id)
      if (result) {
        this.currentResult = result
      }
      return result || null
    },

    /**
     * 删除历史记录
     */
    deleteHistory(id: string): void {
      this.history = this.history.filter(r => r.id !== id)
      this.saveToStorage()
    },

    /**
     * 清空历史
     */
    clearHistory(): void {
      this.history = []
      this.saveToStorage()
    },

    /**
     * 保存到本地存储
     */
    saveToStorage(): void {
      try {
        const data = {
          history: this.history,
          lastVisit: new Date().toISOString(),
        }
        // BigInt 安全序列化
        const jsonString = JSON.stringify(data, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        );
        localStorage.setItem('holistic_divination_data', jsonString)
      } catch (err) {
        console.error('保存到本地存储失败:', err)
      }
    },

    /**
     * 从本地存储加载
     */
    loadFromStorage(): void {
      try {
        const data = localStorage.getItem('holistic_divination_data')
        if (data) {
          const parsed = JSON.parse(data)
          if (parsed.history && Array.isArray(parsed.history)) {
            this.history = parsed.history
          }
        }
      } catch (err) {
        console.error('从本地存储加载失败:', err)
      }
    },
  },
})
