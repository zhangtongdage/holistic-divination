<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<template>
  <view class="app-container dark-theme">
    <view class="safe-area-top"></view>
    <view class="app-content">
      <slot />
    </view>
    <TabBar />
    <view class="safe-area-bottom"></view>
    
    <!-- 固定免责声明 -->
    <view class="fixed-disclaimer">
      <text>⚠️ 卜筮乃辅助观心之具，下手处永远在己</text>
    </view>
  </view>
</template>

<style>
/* App-wide styles */
page {
  background-color: #1a1a2e;
  color: #e8e8e8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.app-content {
  flex: 1;
  padding-bottom: 120rpx; /* Space for tab bar */
}

.safe-area-top {
  height: var(--status-bar-height);
}

.safe-area-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}

.fixed-disclaimer {
  position: fixed;
  bottom: 100rpx;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 20rpx;
  text-align: center;
}

.fixed-disclaimer text {
  font-size: 22rpx;
  color: #888;
}

/* Common page styles */
.page-container {
  padding: 30rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #d4af37;
  text-align: center;
  margin-bottom: 40rpx;
  text-shadow: 0 2rpx 4rpx rgba(212, 175, 55, 0.3);
}

/* Card styles */
.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  color: #d4af37;
  margin-bottom: 20rpx;
}

/* Button styles */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 60rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: #1a1a2e;
  font-weight: 600;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

/* Form styles */
.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #e8e8e8;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  color: #e8e8e8;
  font-size: 28rpx;
}

/* Hexagram symbol styles */
.hexagram-lines {
  font-size: 48rpx;
  letter-spacing: -0.2em;
  line-height: 1;
  color: #d4af37;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>
