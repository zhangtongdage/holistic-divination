<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDivinationStore } from '../../stores/divination'

const store = useDivinationStore()
const currentStep = ref(0)
const totalSteps = 6

const steps = [
  { title: '基础人象', icon: '👤', required: true },
  { title: '核心问事', icon: '❓', required: true },
  { title: '当前境地', icon: '📍', required: true },
  { title: '发问状态', icon: '🧠', required: false },
  { title: '补充信息', icon: '📝', required: false },
  { title: '主观预期', icon: '🎯', required: false },
]

const formData = ref({
  name: '',
  gender: '',
  birthDate: '',
  birthHour: '',
  birthPlace: '',
  currentLocation: '',
  questionDomain: '',
  questionDesc: '',
  urgency: 'normal',
  lifeStage: '',
  coreDilemma: '',
})

const progressPercent = computed(() => {
  return ((currentStep.value + 1) / totalSteps) * 100
})

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return formData.value.name && formData.value.gender && formData.value.birthDate
  }
  if (currentStep.value === 1) {
    return formData.value.questionDomain && formData.value.questionDesc
  }
  if (currentStep.value === 2) {
    return formData.value.lifeStage && formData.value.coreDilemma
  }
  return true
})

const isCoreComplete = computed(() => {
  return currentStep.value >= 2 && canProceed.value
})

function nextStep() {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++
  } else {
    performDivination()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function skipStep() {
  nextStep()
}

async function performDivination() {
  uni.showLoading({ title: '正在起卦...' })
  
  try {
    // 构建上下文
    const context = {
      core: {
        name: formData.value.name,
        gender: formData.value.gender as any,
        birthDatetime: {
          gregorian: new Date(formData.value.birthDate),
          lunar: { year: 2024, month: 1, day: 1 }, // 需要农历转换
          timezone: 'Asia/Shanghai',
        },
        currentLocation: {
          province: formData.value.currentLocation.split('/')[0] || '',
          city: formData.value.currentLocation.split('/')[1] || '',
        },
        residenceDuration: 0,
      },
      question: {
        domain: formData.value.questionDomain as any,
        description: formData.value.questionDesc,
        urgency: formData.value.urgency as any,
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: formData.value.lifeStage as any,
        coreDilemma: formData.value.coreDilemma,
        stagnationMonths: 0,
        currentResources: [],
        majorChanges: false,
      },
    }
    
    // 执行卜算
    const resultId = await store.performDivination(context as any)
    
    uni.hideLoading()
    uni.navigateTo({ url: `/pages/result/result?id=${resultId}` })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '起卦失败', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="page-container collection-page">
    <!-- Progress -->
    <view class="progress-section">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <text class="progress-text">{{ currentStep + 1 }}/{{ totalSteps }}</text>
    </view>
    
    <!-- Step Indicator -->
    <view class="step-indicator">
      <view
        v-for="(step, index) in steps"
        :key="index"
        class="step-dot"
        :class="{
          active: currentStep === index,
          completed: currentStep > index,
          required: step.required
        }"
      >
        <text>{{ step.icon }}</text>
      </view>
    </view>
    
    <!-- Step Title -->
    <view class="step-title">
      <text class="step-icon">{{ steps[currentStep].icon }}</text>
      <text class="step-name">{{ steps[currentStep].title }}</text>
      <text v-if="steps[currentStep].required" class="required-tag">必填</text>
      <text v-else class="optional-tag">可选</text>
    </view>
    
    <!-- Core Complete Badge -->
    <view v-if="isCoreComplete" class="core-badge">
      <text>✅ 必填信息已完成，可生成卦局</text>
    </view>
    
    <!-- Form Content -->
    <view class="form-section">
      <!-- Step 1: Core Person -->
      <view v-if="currentStep === 0" class="form-step">
        <view class="form-group">
          <text class="form-label">姓名 *</text>
          <input v-model="formData.name" class="form-input" placeholder="请输入姓名" />
        </view>
        
        <view class="form-group">
          <text class="form-label">性别 *</text>
          <view class="radio-group">
            <view class="radio-item" :class="{ active: formData.gender === 'male' }" @click="formData.gender = 'male'">
              <text>男</text>
            </view>
            <view class="radio-item" :class="{ active: formData.gender === 'female' }" @click="formData.gender = 'female'">
              <text>女</text>
            </view>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">出生日期 *</text>
          <picker mode="date" :value="formData.birthDate" @change="e => formData.birthDate = e.detail.value">
            <view class="picker-view">
              <text>{{ formData.birthDate || '请选择出生日期' }}</text>
            </view>
          </picker>
        </view>
        
        <view class="form-group">
          <text class="form-label">出生时辰</text>
          <picker mode="selector" :range="['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']" @change="e => formData.birthHour = e.detail.value">
            <view class="picker-view">
              <text>{{ formData.birthHour ? ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][formData.birthHour] + '时' : '请选择时辰' }}</text>
            </view>
          </picker>
        </view>
        
        <view class="form-group">
          <text class="form-label">出生地点</text>
          <input v-model="formData.birthPlace" class="form-input" placeholder="省份/城市" />
        </view>
        
        <view class="form-group">
          <text class="form-label">常住地 *</text>
          <input v-model="formData.currentLocation" class="form-input" placeholder="省份/城市" />
        </view>
      </view>
      
      <!-- Step 2: Core Question -->
      <view v-else-if="currentStep === 1" class="form-step">
        <view class="form-group">
          <text class="form-label">问题领域 *</text>
          <picker mode="selector" :range="['事业', '财运', '情感', '家庭', '健康', '学业', '远行', '争讼', '失物', '其他']" @change="e => {
            const domains = ['career', 'wealth', 'relationship', 'family', 'health', 'study', 'travel', 'dispute', 'lost', 'general']
            formData.questionDomain = domains[e.detail.value]
          }">
            <view class="picker-view">
              <text>{{ formData.questionDomain ? ['事业', '财运', '情感', '家庭', '健康', '学业', '远行', '争讼', '失物', '其他'][['career', 'wealth', 'relationship', 'family', 'health', 'study', 'travel', 'dispute', 'lost', 'general'].indexOf(formData.questionDomain)] : '请选择领域' }}</text>
            </view>
          </picker>
        </view>
        
        <view class="form-group">
          <text class="form-label">问题描述 *</text>
          <textarea v-model="formData.questionDesc" class="form-textarea" placeholder="请详细描述您的问题..." maxlength="500" />
        </view>
        
        <view class="form-group">
          <text class="form-label">急迫程度</text>
          <view class="radio-group">
            <view class="radio-item" :class="{ active: formData.urgency === 'urgent' }" @click="formData.urgency = 'urgent'">
              <text>紧急</text>
            </view>
            <view class="radio-item" :class="{ active: formData.urgency === 'normal' }" @click="formData.urgency = 'normal'">
              <text>正常</text>
            </view>
            <view class="radio-item" :class="{ active: formData.urgency = 'planning' }" @click="formData.urgency = 'planning'">
              <text>规划</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Step 3: Current Situation -->
      <view v-else-if="currentStep === 2" class="form-step">
        <view class="form-group">
          <text class="form-label">人生阶段 *</text>
          <picker mode="selector" :range="['起步期', '积累期', '瓶颈期', '转型期', '危机期', '恢复期', '稳定期']" @change="e => {
            const stages = ['starting', 'accumulating', 'bottleneck', 'transition', 'crisis', 'recovery', 'stable']
            formData.lifeStage = stages[e.detail.value]
          }">
            <view class="picker-view">
              <text>{{ formData.lifeStage ? ['起步期', '积累期', '瓶颈期', '转型期', '危机期', '恢复期', '稳定期'][['starting', 'accumulating', 'bottleneck', 'transition', 'crisis', 'recovery', 'stable'].indexOf(formData.lifeStage)] : '请选择阶段' }}</text>
            </view>
          </picker>
        </view>
        
        <view class="form-group">
          <text class="form-label">核心困境 *</text>
          <input v-model="formData.coreDilemma" class="form-input" placeholder="最简洁描述您最大的困扰" />
        </view>
      </view>
      
      <!-- Step 4-6: Optional -->
      <view v-else class="form-step">
        <view class="optional-notice">
          <text class="notice-icon">📋</text>
          <text class="notice-text">此步为可选信息</text>
          <text class="notice-desc">填写可提升解读精确度</text>
        </view>
        
        <view class="form-group">
          <text class="form-label">补充信息</text>
          <textarea class="form-textarea" placeholder="其他您认为有助于解读的信息..." />
        </view>
      </view>
    </view>
    
    <!-- Actions -->
    <view class="action-bar">
      <view v-if="currentStep > 0" class="btn btn-secondary" @click="prevStep">
        <text>上一步</text>
      </view>
      <view v-if="currentStep < totalSteps - 1" class="btn btn-primary" :class="{ disabled: !canProceed }" @click="canProceed && nextStep()">
        <text>下一步</text>
      </view>
      <view v-if="currentStep >= 2 && currentStep < totalSteps - 1" class="btn btn-text" @click="skipStep">
        <text>跳过</text>
      </view>
      <view v-if="currentStep === totalSteps - 1" class="btn btn-primary btn-generate" @click="nextStep">
        <text>🎋 生成卦局</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.collection-page {
  padding: 40rpx;
}

.progress-section {
  margin-bottom: 30rpx;
}

.progress-bar {
  height: 6rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f4d03f);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 28rpx;
  color: #888;
  margin-top: 16rpx;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.step-dot {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #d4af37;
  transform: scale(1.2);
}

.step-dot.completed {
  background: rgba(212, 175, 55, 0.5);
}

.step-dot.required {
  border: 2rpx solid rgba(212, 175, 55, 0.3);
}

.step-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.step-icon {
  font-size: 48rpx;
}

.step-name {
  font-size: 40rpx;
  color: #d4af37;
  font-weight: 600;
}

.required-tag {
  font-size: 24rpx;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.optional-tag {
  font-size: 24rpx;
  color: #888;
  background: rgba(255, 255, 255, 0.05);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.core-badge {
  background: rgba(39, 174, 96, 0.1);
  border: 2rpx solid rgba(39, 174, 96, 0.3);
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.core-badge text {
  color: #2ecc71;
  font-size: 28rpx;
}

.form-section {
  margin-bottom: 40rpx;
}

.form-step {
  animation: fadeIn 0.3s ease;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #e8e8e8;
  margin-bottom: 16rpx;
}

.picker-view {
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  color: #888;
}

.radio-group {
  display: flex;
  gap: 20rpx;
}

.radio-item {
  flex: 1;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.radio-item.active {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #d4af37;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  color: #e8e8e8;
  font-size: 28rpx;
}

.optional-notice {
  text-align: center;
  padding: 40rpx;
  margin-bottom: 40rpx;
}

.notice-icon {
  font-size: 72rpx;
  display: block;
  margin-bottom: 20rpx;
}

.notice-text {
  display: block;
  font-size: 36rpx;
  color: #d4af37;
  margin-bottom: 10rpx;
}

.notice-desc {
  display: block;
  font-size: 26rpx;
  color: #888;
}

.action-bar {
  display: flex;
  gap: 20rpx;
}

.action-bar .btn {
  flex: 1;
}

.btn.disabled {
  opacity: 0.5;
}

.btn-text {
  background: transparent;
  color: #888;
}

.btn-generate {
  background: linear-gradient(135deg, #d4af37, #b8941f);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
