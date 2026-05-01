<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import router from '@/router'
import { useDivinationStore } from '@/stores/divination'
import type { HolisticPersonContext, CollectionSection, CollectionField } from '@core/collection/holistic-collector'
import { COLLECTION_SCHEMA, CollectionPhase, CollectionUrgency } from '@core/collection/holistic-collector'
import { LunarCalendarConverter } from '@core/utils/lunar-calendar'

const store = useDivinationStore()

// 当前所处采集阶段
const currentPhase = ref<CollectionPhase>(CollectionPhase.CORE_PERSON)

// 表单数据 - 扁平存储，提交时转嵌套结构
const formData = ref<Record<string, unknown>>({})

const isSubmitting = ref(false)

// 计算当前阶段之前的必填项是否已完成
const canProceed = computed(() => {
  const schema = getCurrentSchema()
  if (!schema) return false
  
  return schema.fields
    .filter(f => f.urgency === CollectionUrgency.REQUIRED && f.key !== 'birthDateCalendar')
    .every(f => {
      const value = getFieldValue(f.key)
      return value !== undefined && value !== '' && value !== null
    })
})

// 获取当前阶段的schema
function getCurrentSchema(): CollectionSection | undefined {
  return COLLECTION_SCHEMA.find(s => s.phase === currentPhase.value)
}

// 获取字段值
function getFieldValue(key: string): unknown {
  const parts = key.split('.')
  let value: unknown = formData.value
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return value
}

// 设置字段值
function setFieldValue(key: string, value: unknown): void {
  const parts = key.split('.')
  let target: Record<string, unknown> = formData.value
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in target) || typeof target[part] !== 'object') {
      target[part] = {}
    }
    target = target[part] as Record<string, unknown>
  }
  
  target[parts[parts.length - 1]] = value
}

// 日期时间字段特殊处理 - 使用 hidden datetime-local + 显示文本
const birthDateDisplay = computed(() => getFieldValue('birthDate') as string || '')
const birthDateISO = ref('')

function onBirthDateCalendarInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  birthDateISO.value = val
  if (val) {
    // 转换为显示格式 "YYYY年MM月DD日"
    const d = new Date(val)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setFieldValue('birthDate', `${y}-${m}-${day}`)
  }
}

// 进入下一阶段
function nextPhase(): void {
  const phases = Object.values(CollectionPhase)
  const currentIndex = phases.indexOf(currentPhase.value)
  if (currentIndex < phases.length - 1) {
    currentPhase.value = phases[currentIndex + 1]
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 上一阶段
function prevPhase(): void {
  const phases = Object.values(CollectionPhase)
  const currentIndex = phases.indexOf(currentPhase.value)
  if (currentIndex > 0) {
    currentPhase.value = phases[currentIndex - 1]
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 计算当前进度
const progress = computed(() => {
  const phases = Object.values(CollectionPhase)
  const currentIndex = phases.indexOf(currentPhase.value)
  return Math.round(((currentIndex + 1) / phases.length) * 100)
})

// 核心层是否完成
const isCoreComplete = computed(() => {
  const corePhases = [CollectionPhase.CORE_PERSON, CollectionPhase.CORE_QUESTION, CollectionPhase.CORE_SITUATION]
  const currentIndex = Object.values(CollectionPhase).indexOf(currentPhase.value)
  const coreLastIndex = Object.values(CollectionPhase).indexOf(corePhases[corePhases.length - 1])
  return currentIndex > coreLastIndex
})

/**
 * 将扁平表单数据转换为 HolisticPersonContext 嵌套结构
 */
function buildContext(): HolisticPersonContext {
  const d = formData.value
  
  // 解析出生日期字符串为 Date 对象
  const birthDateStr = (d.birthDate as string) || ''
  const birthHour = (d.birthHour as string) || '11-13'
  let birthDate = new Date()
  if (birthDateStr) {
    const parts = birthDateStr.split('-')
    if (parts.length === 3) {
      const hourStart = parseInt(birthHour.split('-')[0])
      birthDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
        hourStart + 1, // 取时辰中间值
        0
      )
    }
  }

  // 解析常住地 - 尝试拆分为省/市
  const currentLocStr = (d.currentLocation as string) || ''
  const locParts = currentLocStr.split(/[省市区县镇村]/)
  
  // 解析出生地
  const birthPlaceStr = (d.birthPlace as string) || ''

  // 构建核心人象
  const core: HolisticPersonContext['core'] = {
    name: (d.name as string) || '',
    birthDatetime: {
      gregorian: birthDate,
      lunar: LunarCalendarConverter.solarToLunar(birthDate),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isExact: true,
      isDaylightSaving: false,
    },
    gender: (d.gender as 'male' | 'female' | 'other') || 'male',
    currentLocation: {
      province: locParts[0] || currentLocStr,
      city: locParts[1] || '',
      district: locParts[2] || '',
      village: locParts[3] || '',
      fullAddress: currentLocStr,
    } as any,
    residenceDuration: Number(d.residenceYears) || 0,
    birthPlace: birthPlaceStr, // 保留出生地精确地址
  } as any

  // 构建核心问事
  const question: HolisticPersonContext['question'] = {
    domain: (d.domain as any) || 'general',
    description: (d.description as string) || '',
    urgency: (d.urgency as 'urgent' | 'normal' | 'planning') || 'normal',
    askTime: new Date(),
    similarAsks: Number(d.similarAsks) || 0,
  }

  // 构建当前境地
  const situation: HolisticPersonContext['situation'] = {
    lifeStage: (d.lifeStage as any) || 'stable',
    coreDilemma: (d.coreDilemma as string) || '',
    stagnationMonths: Number(d.stagnationMonths) || 0,
    currentResources: Array.isArray(d.currentResources) ? d.currentResources as string[] : [],
    majorChanges: d.majorChanges === 'yes',
    changeDetails: (d.changeDetails as string) || undefined,
  }

  // 构建可选：发问状态
  const mental: HolisticPersonContext['mental'] | undefined = 
    (d.emotionalState || d.physicalState) ? {
      emotionalState: (d.emotionalState as any) || 'calm',
      premonitions: Array.isArray(d.premonitions) ? d.premonitions as string[] : [],
      physicalState: (d.physicalState as string) || '',
      distraction: Number(d.distraction) || 0,
    } : undefined

  // 构建可选：补充人象
  const supplementary: HolisticPersonContext['supplementary'] | undefined =
    (d.occupation || d.financialStatus) ? {
      occupation: (d.occupation as string) || undefined,
      financialStatus: (d.financialStatus as any) || undefined,
      keyLifeEvents: d.keyLifeEvents ? [{
        year: new Date().getFullYear(),
        event: d.keyLifeEvents as string,
        impact: 'neutral' as const,
        isTurningPoint: false,
      }] : undefined,
      relatedPersons: d.relatedPersons ? [{
        relation: '相关',
        name: d.relatedPersons as string,
        relevance: '与当前问题相关',
      }] : undefined,
    } : undefined

  // 构建可选：主观预期
  const expectation: HolisticPersonContext['expectation'] | undefined =
    (d.desiredOutcome || d.riskTolerance) ? {
      desiredOutcome: (d.desiredOutcome as string) || '',
      minimalAcceptable: (d.minimalAcceptable as string) || '',
      actionPlan: (d.actionPlan as string) || undefined,
      riskTolerance: (d.riskTolerance as any) || 'medium',
      timeHorizon: (d.timeHorizon as any) || 'medium',
    } : undefined

  return {
    core,
    question,
    situation,
    mental,
    supplementary,
    expectation,
    meta: {
      startTime: new Date(),
      lastUpdated: new Date(),
      collectionTimeSeconds: 0,
      dataSource: ['manual'],
      version: '1.0.0',
    },
  } as HolisticPersonContext
}

// 执行卜算
async function performDivination(): Promise<void> {
  const context = buildContext()
  
  if (!context.core.name || !context.question.description) {
    alert('请填写必要的基础信息')
    currentPhase.value = CollectionPhase.CORE_PERSON
    return
  }

  isSubmitting.value = true
  try {
    const resultId = await store.performDivination(context)
    router.push({ name: 'result', params: { id: resultId } })
  } catch (error) {
    console.error('卜算失败:', error)
    alert('卜算过程中出现错误，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 获取当前schema
const currentSchema = computed(() => getCurrentSchema())

// 打开日期选择器
function openCalendar() {
  const el = document.querySelector('.hidden-datetime') as HTMLInputElement | null
  if (el) el.showPicker?.()
}

// 是否有日期字段需要特殊处理
function isDateField(field: CollectionField): boolean {
  return field.key === 'birthDate'
}

// 是否是隐藏的日期选择器
function isHiddenCalendar(field: CollectionField): boolean {
  return field.key === 'birthDateCalendar'
}
</script>

<template>
  <div class="divination-view">
    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-text">{{ progress }}% 完成</div>
      <div v-if="isCoreComplete" class="core-complete-badge">
        ✅ 必填信息已完成，可生成卦局
      </div>
    </div>

    <!-- 阶段标题 -->
    <div v-if="currentSchema" class="phase-header">
      <h2 class="phase-title">{{ currentSchema.title }}</h2>
      <p class="phase-subtitle">{{ currentSchema.subtitle }}</p>
      <p class="phase-desc">{{ currentSchema.description }}</p>
      <p class="phase-meta">
        预计用时 {{ currentSchema.estimatedTime }} 秒
        <span v-if="currentSchema.skipable" class="skipable">（可跳过）</span>
      </p>
    </div>

    <!-- 表单区域 -->
    <div v-if="currentSchema" class="form-container">
      <div 
        v-for="field in currentSchema.fields" 
        :key="field.key"
        class="form-field"
        :class="{ 'required': field.urgency === CollectionUrgency.REQUIRED }"
      >
        <!-- 跳过隐藏的日历选择器字段 -->
        <template v-if="isHiddenCalendar(field)">
          <input
            type="datetime-local"
            class="hidden-datetime"
            :value="birthDateISO"
            @input="onBirthDateCalendarInput"
          />
        </template>

        <template v-else>
          <label class="field-label">
            {{ field.label }}
            <span v-if="field.urgency === CollectionUrgency.REQUIRED" class="required-mark">*</span>
            <span v-if="field.urgency === CollectionUrgency.RECOMMENDED" class="recommended-mark">（建议）</span>
          </label>
          <p v-if="field.description" class="field-description">{{ field.description }}</p>

          <!-- 文本输入 -->
          <template v-if="field.type === 'text'">
            <div class="field-input-wrapper">
              <input
                type="text"
                class="field-input"
                :value="String(getFieldValue(field.key) ?? '')"
                @input="e => setFieldValue(field.key, (e.target as HTMLInputElement).value)"
                :placeholder="field.placeholder"
              />
              <!-- 日期字段显示日历图标 -->
              <button 
                v-if="isDateField(field)" 
                class="calendar-btn"
                @click="openCalendar"
                type="button"
              >
                📅
              </button>
            </div>
          </template>

          <!-- 数字输入 -->
          <template v-else-if="field.type === 'number'">
            <input
              type="number"
              class="field-input"
              :value="String(getFieldValue(field.key) ?? field.defaultValue ?? '')"
              @input="e => setFieldValue(field.key, Number((e.target as HTMLInputElement).value))"
              :placeholder="field.placeholder"
            />
          </template>

          <!-- 下拉选择 -->
          <template v-else-if="field.type === 'select'">
            <select
              class="field-select"
              :value="String(getFieldValue(field.key) ?? field.defaultValue ?? '')"
              @change="e => setFieldValue(field.key, (e.target as HTMLSelectElement).value)"
            >
              <option value="">请选择...</option>
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}<span v-if="opt.description" class="option-desc"> - {{ opt.description }}</span>
              </option>
            </select>
          </template>

          <!-- 多选 -->
          <template v-else-if="field.type === 'multiselect'">
            <div class="field-multiselect">
              <label
                v-for="opt in field.options"
                :key="opt.value"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="opt.value"
                  :checked="(getFieldValue(field.key) as string[] || []).includes(opt.value)"
                  @change="(e) => {
                    const current = (getFieldValue(field.key) as string[]) || []
                    const value = opt.value
                    if ((e.target as HTMLInputElement).checked) {
                      setFieldValue(field.key, [...current, value])
                    } else {
                      setFieldValue(field.key, current.filter(v => v !== value))
                    }
                  }"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </template>

          <!-- 文本域 -->
          <template v-else-if="field.type === 'textarea'">
            <textarea
              class="field-textarea"
              :value="String(getFieldValue(field.key) ?? '')"
              @input="e => setFieldValue(field.key, (e.target as HTMLTextAreaElement).value)"
              :placeholder="field.placeholder"
              rows="4"
            ></textarea>
          </template>

          <!-- 位置选择（已改为文本输入，支持精确地址） -->
          <template v-else-if="field.type === 'location'">
            <div class="field-location">
              <input
                type="text"
                class="field-input"
                :value="String(getFieldValue(field.key) ?? '')"
                @input="e => setFieldValue(field.key, (e.target as HTMLInputElement).value)"
                :placeholder="field.placeholder"
              />
            </div>
          </template>

          <p v-if="field.helpText && field.type !== 'location'" class="field-help">{{ field.helpText }}</p>
          <p v-if="field.helpText && field.type === 'location'" class="field-help">{{ field.helpText }}</p>
        </template>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="form-actions">
      <button 
        v-if="currentPhase !== CollectionPhase.CORE_PERSON"
        class="btn btn-secondary"
        @click="prevPhase"
      >
        ← 上一步
      </button>
      
      <button 
        v-if="currentPhase !== CollectionPhase.OPT_EXPECTATION"
        class="btn btn-primary"
        :disabled="!canProceed"
        @click="nextPhase"
      >
        下一步 →
      </button>
      
      <button 
        v-else
        class="btn btn-primary btn-generate"
        :disabled="!canProceed || isSubmitting"
        @click="performDivination"
      >
        <span v-if="isSubmitting">正在起卦...</span>
        <span v-else>🎋 生成卦局</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.divination-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.hidden-datetime {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
  overflow: hidden;
}

.progress-bar {
  margin-bottom: 2rem;
}

.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f4d03f);
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  color: #888;
  font-size: 0.875rem;
}

.core-complete-badge {
  background: rgba(39, 174, 96, 0.2);
  border: 1px solid rgba(39, 174, 96, 0.5);
  color: #2ecc71;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.phase-header {
  text-align: center;
  margin-bottom: 2rem;
}

.phase-title {
  font-size: 1.75rem;
  color: #d4af37;
  margin-bottom: 0.5rem;
}

.phase-subtitle {
  font-size: 1.1rem;
  color: #a0a0a0;
  margin-bottom: 0.5rem;
}

.phase-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.phase-meta {
  color: #888;
  font-size: 0.8rem;
}

.phase-meta .skipable {
  color: #d4af37;
}

.form-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field.required .field-label {
  color: #f4d03f;
}

.field-label {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #e8e8e8;
}

.required-mark {
  color: #e74c3c;
  margin-left: 4px;
}

.recommended-mark {
  color: #d4af37;
  font-size: 0.875rem;
}

.field-description {
  color: #888;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input-wrapper .field-input {
  flex: 1;
  padding-right: 3rem;
}

.calendar-btn {
  position: absolute;
  right: 8px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.calendar-btn:hover {
  background: rgba(212, 175, 55, 0.3);
  border-color: #d4af37;
}

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e8e8e8;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(255, 255, 255, 0.08);
}

.field-select option {
  background: #1a1a2e;
  color: #e8e8e8;
  padding: 0.5rem;
}

.option-desc {
  color: #666;
  font-size: 0.8rem;
}

.field-textarea {
  resize: vertical;
  min-height: 100px;
}

.field-multiselect {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.06);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #d4af37;
}

.field-location {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-help {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: #1a1a2e;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f4d03f, #d4af37);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e8e8e8;
}

.btn-generate {
  background: linear-gradient(135deg, #27ae60, #1e8449);
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
}

.btn-generate:hover:not(:disabled) {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}
</style>
