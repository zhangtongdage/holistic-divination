<script setup lang="ts">
import { computed } from 'vue'
import { useDivinationStore } from '../../stores/divination'

const store = useDivinationStore()
const history = computed(() => store.history)

function getHexagramSymbol(lines: boolean[]): string {
  return lines.map(line => line ? '⚊' : '⚋').join('')
}

function navigateToDetail(id: string) {
  uni.navigateTo({ url: `/pages/result/result?id=${id}` })
}

function deleteItem(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        store.deleteHistory(id)
      }
    }
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <view class="page-container history-page">
    <view class="page-title">历史记录</view>
    
    <!-- Empty State -->
    <view v-if="history.length === 0" class="empty-state">
      <text class="empty-icon">📜</text>
      <text class="empty-text">暂无历史记录</text>
      <view class="action-btn btn-primary" @click="uni.switchTab({ url: '/pages/index/index' })">
        <text>去起一卦</text>
      </view>
    </view>
    
    <!-- History List -->
    <view v-else class="history-list">
      <view
        v-for="item in history"
        :key="item.id"
        class="history-item"
        @click="navigateToDetail(item.id)"
      >
        <view class="item-main">
          <view class="hexagram-section">
            <text class="hexagram-name">{{ item.hexagram.primary }}</text>
            <text v-if="item.hexagram.secondary" class="hexagram-arrow">→</text>
            <text v-if="item.hexagram.secondary" class="hexagram-secondary">
              {{ item.hexagram.secondary }}
            </text>
            <view class="hexagram-preview">
              <text class="hexagram-lines">{{ getHexagramSymbol(item.hexagram.lines) }}</text>
            </view>
          </view>
          
          <view class="item-info">
            <view class="info-row">
              <text class="info-label">问者</text>
              <text class="info-value">{{ item.context.core?.name }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">问题</text>
              <text class="info-value ellipsis">
                {{ item.context.question?.description.slice(0, 15) }}...
              </text>
            </view>
            <view class="info-row">
              <text class="info-label">时间</text>
              <text class="info-value">{{ formatTime(item.timestamp.toString()) }}</text>
            </view>
          </view>
        </view>
        
        <view class="item-verdict">
          <text class="verdict-text" :class="item.layers.yiLi.auspiciousness">
            {{ item.layers.yiLi.auspiciousness }}
          </text>
        </view>
        
        <view class="delete-btn" @click.stop="deleteItem(item.id)">
          <text>×</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.history-page {
  padding: 30rpx;
  padding-bottom: 120rpx;
}

.page-title {
  font-size: 48rpx;
  color: #d4af37;
  text-align: center;
  margin-bottom: 40rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #888;
  margin-bottom: 40rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.history-item {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 30rpx;
  transition: all 0.3s ease;
}

.history-item:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.08);
}

.item-main {
  display: flex;
  gap: 20rpx;
}

.hexagram-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140rpx;
}

.hexagram-name {
  font-size: 48rpx;
  color: #d4af37;
  font-weight: 600;
}

.hexagram-arrow {
  font-size: 32rpx;
  color: #888;
  margin: 8rpx 0;
}

.hexagram-secondary {
  font-size: 36rpx;
  color: #888;
}

.hexagram-preview {
  margin-top: 12rpx;
}

.hexagram-lines {
  font-size: 32rpx;
  letter-spacing: -0.1em;
  line-height: 1.2;
  color: #a0a0a0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  min-width: 80rpx;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #a0a0a0;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-verdict {
  position: absolute;
  right: 80rpx;
  top: 50%;
  transform: translateY(-50%);
}

.verdict-text {
  font-size: 28rpx;
  font-weight: 600;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.verdict-text.大吉 {
  background: rgba(39, 174, 96, 0.2);
  color: #2ecc71;
}

.verdict-text.吉 {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
}

.verdict-text.平 {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.verdict-text.凶 {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.delete-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn text {
  font-size: 32rpx;
  color: #e74c3c;
}
</style>
