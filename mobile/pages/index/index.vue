<script setup lang="ts">
function navigateToDivination() {
  uni.navigateTo({ url: '/pages/collection/collection' })
}

function navigateToHistory() {
  uni.navigateTo({ url: '/pages/history/history' })
}
</script>

<template>
  <view class="page-container index-page">
    <view class="hero-section">
      <text class="hero-title">全息人本<br/>古法卜算</text>
      <text class="hero-subtitle">打破术数壁垒 · 回归卜算本质</text>
      <text class="hero-desc">千人千面 · 唯一卦局 · 典籍有源</text>
      
      <view class="features-list">
        <view class="feature-item">☯ 六层融合架构</view>
        <view class="feature-item">👤 人象绝对核心</view>
        <view class="feature-item">📚 全典籍溯源</view>
        <view class="feature-item">🔒 纯本地运行</view>
      </view>
    </view>
    
    <view class="actions-section">
      <view class="action-btn btn-primary" @click="navigateToDivination">
        <text>🎋 开始起卦</text>
      </view>
      <view class="action-btn btn-secondary" @click="navigateToHistory">
        <text>📜 查看历史</text>
      </view>
    </view>
    
    <view class="disclaimer-card">
      <text class="disclaimer-icon">⚠️</text>
      <text class="disclaimer-title">重要声明</text>
      <text class="disclaimer-text">
        卜筮本是辅助观心之具，结果非宿命。
        下手处永远在己，而非问卜。
      </text>
      <text class="disclaimer-text">
        先贤有云：疑则筮之，吉则行之，凶则谋之。
        不信者不占，不诚者不告。
      </text>
    </view>
  </view>
</template>

<style scoped>
.index-page {
  min-height: 100vh;
  padding: 60rpx 40rpx;
}

.hero-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.hero-title {
  display: block;
  font-size: 72rpx;
  font-weight: 400;
  color: #d4af37;
  line-height: 1.3;
  margin-bottom: 30rpx;
  letter-spacing: 0.05em;
  text-shadow: 0 0 40rpx rgba(212, 175, 55, 0.3);
}

.hero-subtitle {
  display: block;
  font-size: 32rpx;
  color: #a0a0a0;
  margin-bottom: 16rpx;
}

.hero-desc {
  display: block;
  font-size: 28rpx;
  color: #888;
  margin-bottom: 60rpx;
}

.features-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  max-width: 500rpx;
  margin: 0 auto;
}

.feature-item {
  font-size: 26rpx;
  color: #888;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12rpx;
}

.actions-section {
  margin-bottom: 60rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  font-size: 36rpx;
}

.action-btn text {
  font-weight: 600;
}

.action-btn.btn-primary {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: #1a1a2e;
  box-shadow: 0 8rpx 30rpx rgba(212, 175, 55, 0.3);
}

.action-btn.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #a0a0a0;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.disclaimer-card {
  background: rgba(212, 175, 55, 0.05);
  border: 2rpx solid rgba(212, 175, 55, 0.2);
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
}

.disclaimer-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 20rpx;
}

.disclaimer-title {
  display: block;
  font-size: 32rpx;
  color: #d4af37;
  margin-bottom: 20rpx;
}

.disclaimer-text {
  display: block;
  font-size: 26rpx;
  color: #888;
  line-height: 1.8;
  margin-bottom: 16rpx;
}
</style>
