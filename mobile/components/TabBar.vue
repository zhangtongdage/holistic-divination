<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref(0)

const tabs = [
  { path: '/pages/index/index', icon: '☯', text: '首页' },
  { path: '/pages/collection/collection', icon: '🎋', text: '起卦' },
  { path: '/pages/history/history', icon: '📜', text: '历史' },
  { path: '/pages/settings/settings', icon: '⚙️', text: '设置' },
]

function switchTab(index: number) {
  currentTab.value = index
  uni.switchTab({ url: tabs[index].path })
}
</script>

<template>
  <view class="tab-bar">
    <view
      v-for="(tab, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: currentTab === index }"
      @click="switchTab(index)"
    >
      <text class="tab-icon">{{ tab.icon }}</text>
      <text class="tab-text">{{ tab.text }}</text>
    </view>
  </view>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 2rpx solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 20rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  transform: scale(1.1);
}

.tab-icon {
  font-size: 48rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #888;
  transition: color 0.3s ease;
}

.tab-item.active .tab-text {
  color: #d4af37;
}
</style>
