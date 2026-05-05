<script setup lang="ts">
import { ref } from 'vue'

const aiMode = ref('auto')
const apiProvider = ref('openai')
const apiKey = ref('')

type SettingItem = {
  key: string
  label: string
  icon: string
  type: 'mode' | 'select' | 'password' | 'toggle' | 'action'
  options?: { value: string; label: string }[]
}

const settingsGroups: SettingItem[][] = [
  [
    {
      key: 'aiMode',
      label: 'AI推理模式',
      icon: '🤖',
      type: 'mode',
      options: [
        { value: 'auto', label: '智能切换' },
        { value: 'local', label: '本地优先' },
        { value: 'api', label: 'API优先' }
      ]
    },
    {
      key: 'apiProvider',
      label: 'API提供商',
      icon: '🔌',
      type: 'select',
      options: [
        { value: 'openai', label: 'OpenAI' },
        { value: 'claude', label: 'Claude' },
        { value: 'zhipu', label: '智谱AI' },
        { value: 'deepseek', label: 'DeepSeek' },
        { value: 'custom', label: '自定义' }
      ]
    },
    {
      key: 'apiKey',
      label: 'API密钥',
      icon: '🔐',
      type: 'password'
    }
  ],
  [
    {
      key: 'notifications',
      label: '消息通知',
      icon: '🔔',
      type: 'toggle'
    },
    {
      key: 'darkMode',
      label: '深色模式',
      icon: '🌙',
      type: 'toggle'
    }
  ],
  [
    {
      key: 'export',
      label: '导出历史记录',
      icon: '📤',
      type: 'action'
    },
    {
      key: 'clear',
      label: '清除所有数据',
      icon: '🗑️',
      type: 'action'
    }
  ]
]

function handleAction(key: string) {
  if (key === 'export') {
    uni.showToast({ title: '导出功能开发中', icon: 'none' })
  } else if (key === 'clear') {
    uni.showModal({
      title: '确认清除',
      content: '确定清除所有本地数据？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  }
}
</script>

<template>
  <view class="page-container settings-page">
    <view class="page-title">设置</view>
    
    <!-- Settings Groups -->
    <view v-for="(group, gIndex) in settingsGroups" :key="gIndex" class="settings-group">
      <view v-for="item in group" :key="item.key" class="settings-item">
        <view class="item-icon">{{ item.icon }}</view>
        <view class="item-content">
          <text class="item-label">{{ item.label }}</text>
          
          <!-- Mode Selector -->
          <view v-if="item.type === 'mode'" class="mode-selector">
            <view
              v-for="opt in item.options"
              :key="opt.value"
              class="mode-option"
              :class="{ active: aiMode === opt.value }"
              @click="aiMode = opt.value"
            >
              <text>{{ opt.label }}</text>
            </view>
          </view>
          
          <!-- Select -->
          <picker
            v-else-if="item.type === 'select'"
            mode="selector"
            :range="item.options?.map(o => o.label)"
            @change="e => apiProvider = item.options?.[e.detail.value].value || ''"
          >
            <view class="picker-view">
              <text>{{ item.options?.find(o => o.value === apiProvider)?.label }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
          
          <!-- Password Input -->
          <input
            v-else-if="item.type === 'password'"
            v-model="apiKey"
            type="password"
            class="item-input"
            placeholder="点击输入密钥"
            password
          />
          
          <!-- Toggle -->
          <switch
            v-else-if="item.type === 'toggle'"
            :checked="true"
            color="#d4af37"
          />
          
          <!-- Action Button -->
          <view v-else-if="item.type === 'action'" class="action-arrow" @click="handleAction(item.key)">
            <text>›</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- About Card -->
    <view class="about-card">
      <text class="app-name">全息人本古法卜算</text>
      <text class="app-version">版本 1.0.0</text>
      <text class="app-desc">六层融合 · 千人千面 · 典籍溯源</text>
      
      <view class="divider"></view>
      
      <text class="disclaimer">
        本应用仅提供传统术数参考，
        不构成任何决策建议
      </text>
    </view>
  </view>
</template>

<style scoped>
.settings-page {
  padding: 30rpx;
  padding-bottom: 150rpx;
}

.page-title {
  font-size: 48rpx;
  color: #d4af37;
  text-align: center;
  margin-bottom: 50rpx;
}

.settings-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.05);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-icon {
  width: 60rpx;
  font-size: 40rpx;
  text-align: center;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.item-label {
  font-size: 30rpx;
  color: #e8e8e8;
}

/* Mode Selector */
.mode-selector {
  display: flex;
  gap: 12rpx;
}

.mode-option {
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.mode-option text {
  font-size: 24rpx;
  color: #888;
}

.mode-option.active {
  background: rgba(212, 175, 55, 0.2);
}

.mode-option.active text {
  color: #d4af37;
}

/* Picker */
.picker-view {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.picker-view text {
  font-size: 28rpx;
  color: #888;
}

.arrow {
  font-size: 40rpx;
  color: #666;
}

/* Input */
.item-input {
  width: 300rpx;
  text-align: right;
  font-size: 28rpx;
  color: #a0a0a0;
}

/* Action */
.action-arrow {
  width: 60rpx;
  text-align: right;
}

.action-arrow text {
  font-size: 40rpx;
  color: #666;
}

/* About Card */
.about-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  text-align: center;
  margin-top: 40rpx;
}

.app-name {
  font-size: 40rpx;
  color: #d4af37;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
}

.app-version {
  font-size: 26rpx;
  color: #888;
  display: block;
  margin-bottom: 16rpx;
}

.app-desc {
  font-size: 28rpx;
  color: #a0a0a0;
  display: block;
}

.divider {
  height: 2rpx;
  background: rgba(255, 255, 255, 0.1);
  margin: 30rpx 0;
}

.disclaimer {
  font-size: 24rpx;
  color: #888;
  line-height: 1.6;
}
</style>
