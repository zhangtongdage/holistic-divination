<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from '@dcloudio/uni-app'
import { useDivinationStore } from '../../stores/divination'

const route = useRoute()
const store = useDivinationStore()

const resultId = computed(() => route.query.id as string)
const result = computed(() => store.getResultById(resultId.value))

onMounted(() => {
 if (!result.value) {
 uni.showToast({ title: '未找到结果', icon: 'none' })
 setTimeout(() => uni.navigateBack(), 1500)
 }
})

function getHexagramSymbol(lines: boolean[]): string {
 return lines.map(line => line ? '━━━' : '━ ━').join('\n')
}

function goBack() {
 uni.navigateBack()
}

function shareResult() {
 uni.share({
 title: `${result.value?.hexagram.primary}卦 - ${result.value?.layers.yiLi.auspiciousness}`,
 desc: '全息人本古法卜算结果',
 path: `/pages/result/result?id=${resultId.value}`,
 })
}
</script>

<template>
 <view v-if="result" class="page-container result-page">
 <!-- Header -->
 <view class="result-header">
 <view class="back-btn" @click="goBack">←</view>
 <text class="header-title">卜算结果</text>
 <view class="share-btn" @click="shareResult">↗</view>
 </view>
 
 <!-- Hexagram Display -->
 <view class="hexagram-card">
 <view class="hexagram-main">
 <view class="primary-section">
 <text class="hexagram-name">{{ result.hexagram.primary }}</text>
 <text class="hexagram-symbol">{{ getHexagramSymbol(result.hexagram.lines) }}</text>
 <text v-if="result.hexagram.changingLines.length > 0" class="changing-info">
 第{{ result.hexagram.changingLines.join('、') }}爻动
 </text>
 </view>
 <view v-if="result.hexagram.secondary" class="arrow-section">
 <text class="arrow">→</text>
 </view>
 <view v-if="result.hexagram.secondary" class="secondary-section">
 <text class="hexagram-name secondary">{{ result.hexagram.secondary }}</text>
 <text class="secondary-label">变卦</text>
 </view>
 </view>
 
 <view class="hexagram-meta">
 <view class="meta-row">
 <text class="meta-label">本卦</text>
 <text class="meta-value">{{ result.hexagram.primary }}</text>
 </view>
 <view v-if="result.hexagram.secondary" class="meta-row">
 <text class="meta-label">变卦</text>
 <text class="meta-value">{{ result.hexagram.secondary }}</text>
 </view>
 <view class="meta-row">
 <text class="meta-label">吉凶</text>
 <text class="meta-value verdict" :class="result.layers.yiLi.auspiciousness">
 {{ result.layers.yiLi.auspiciousness }}
 </text>
 </view>
 </view>
 </view>
 
 <!-- Verdict -->
 <view class="verdict-card">
 <text class="card-title">📊 义理判断</text>
 <text class="verdict-text">{{ result.layers.yiLi.trendDescription }}</text>
 <view class="verdict-actions">
 <view class="action-item">
 <text class="action-label">行动</text>
 <text class="action-value">{{ result.layers.yiLi.advice.action }}</text>
 </view>
 <view class="action-item">
 <text class="action-label">时机</text>
 <text class="action-value">{{ result.layers.yiLi.advice.timing }}</text>
 </view>
 </view>
 </view>
 
 <!-- Timeline -->
 <view class="timeline-card">
 <text class="card-title">⏳ 应期推算</text>
 <view class="timeline-row">
 <text class="timeline-label">生效</text>
 <text class="timeline-value">{{ result.layers.yiLi.timeFrame.effective }}</text>
 </view>
 <view class="timeline-row">
 <text class="timeline-label">转折</text>
 <text class="timeline-value">{{ result.layers.yiLi.timeFrame.transition }}</text>
 </view>
 <view class="timeline-row">
 <text class="timeline-label">应期</text>
 <text class="timeline-value">{{ result.layers.yiLi.timeFrame.deadline }}</text>
 </view>
 </view>
 
 <!-- Six Layers Summary -->
 <view class="layers-card">
 <text class="card-title">⚙️ 六层分析</text>
 <view class="layer-list">
 <view class="layer-item">
 <text class="layer-name">机变</text>
 <text class="layer-value">{{ result.layers.jiBian.pattern }}</text>
 </view>
 <view class="layer-item">
 <text class="layer-name">取象</text>
 <text class="layer-value">{{ result.layers.quXiang.primarySymbol }}</text>
 </view>
 <view class="layer-item">
 <text class="layer-name">体</text>
 <text class="layer-value">日主{{ result.layers.tiYong.body.dayMaster }}</text>
 </view>
 <view class="layer-item">
 <text class="layer-name">用</text>
 <text class="layer-value">{{ result.layers.tiYong.application.questionCategory }}</text>
 </view>
 </view>
 </view>
 
 <!-- Citations -->
 <view class="citations-card">
 <text class="card-title">📚 典籍出处</text>
 <view v-for="(citation, index) in result.citations.slice(0, 3)" :key="index" class="citation-item">
 <view class="citation-header">
 <text class="citation-book">《{{ citation.title }}》</text>
 <text class="citation-chapter">{{ citation.chapter }}</text>
 </view>
 <text class="citation-quote">{{ citation.quote }}</text>
 </view>
 </view>
 
 <!-- AI Result (if available) -->
 <view v-if="result.aiInterpretation" class="ai-card">
 <text class="card-title">🤖 AI解读</text>
 <text class="ai-model">{{ result.aiInterpretation.modelUsed }}</text>
 <text class="ai-content">{{ result.aiInterpretation.content }}</text>
 </view>
 
 <!-- Disclaimer -->
 <view class="disclaimer-card">
 <text class="disclaimer-title">⚠️ 免责声明</text>
 <text class="disclaimer-text">{{ result.disclaimer }}</text>
 </view>
 </view>
 
 <view v-else class="loading-view">
 <text class="loading-text">加载中...</text>
 </view>
</template>

<style scoped>
.result-page {
 padding: 30rpx;
 padding-bottom: 40rpx;
}

.result-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 margin-bottom: 30rpx;
}

.back-btn, .share-btn {
 width: 80rpx;
 height: 80rpx;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 48rpx;
 color: #d4af37;
}

.header-title {
 font-size: 36rpx;
 color: #e8e8e8;
 font-weight: 600;
}

/* Hexagram Card */
.hexagram-card {
 background: rgba(212, 175, 55, 0.05);
 border: 2rpx solid rgba(212, 175, 55, 0.2);
 border-radius: 24rpx;
 padding: 40rpx;
 margin-bottom: 30rpx;
}

.hexagram-main {
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 40rpx;
 margin-bottom: 40rpx;
}

.primary-section, .secondary-section {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 16rpx;
}

.hexagram-name {
 font-size: 60rpx;
 color: #d4af37;
 font-weight: 600;
}

.hexagram-name.secondary {
 font-size: 48rpx;
 color: #888;
}

.hexagram-symbol {
 font-size: 40rpx;
 line-height: 1.2;
 letter-spacing: -0.1em;
 color: #d4af37;
 font-family: monospace;
 white-space: pre-line;
 text-align: center;
}

.changing-info {
 font-size: 26rpx;
 color: #888;
}

.arrow-section {
 display: flex;
 align-items: center;
}

.arrow {
 font-size: 48rpx;
 color: #d4af37;
}

.secondary-label {
 font-size: 24rpx;
 color: #666;
}

.hexagram-meta {
 display: flex;
 flex-direction: column;
 gap: 16rpx;
 border-top: 2rpx solid rgba(255, 255, 255, 0.1);
 padding-top: 30rpx;
}

.meta-row {
 display: flex;
 justify-content: space-between;
 align-items: center;
}

.meta-label {
 font-size: 28rpx;
 color: #888;
}

.meta-value {
 font-size: 28rpx;
 color: #e8e8e8;
}

.verdict.大吉 { color: #2ecc71; }
.verdict.吉 { color: #27ae60; }
.verdict.小吉 { color: #2ecc71; opacity: 0.8; }
.verdict.平 { color: #95a5a6; }
.verdict.小凶 { color: #f1c40f; }
.verdict.凶 { color: #e74c3c; }
.verdict.大凶 { color: #c0392b; }

/* Cards */
.verdict-card, .timeline-card, .layers-card, .citations-card, .ai-card, .disclaimer-card {
 background: rgba(255, 255, 255, 0.05);
 border-radius: 20rpx;
 padding: 30rpx;
 margin-bottom: 30rpx;
}

.card-title {
 font-size: 32rpx;
 color: #d4af37;
 margin-bottom: 24rpx;
 display: block;
}

.verdict-text {
 font-size: 30rpx;
 color: #e8e8e8;
 line-height: 1.8;
 margin-bottom: 30rpx;
}

.verdict-actions {
 display: flex;
 gap: 20rpx;
}

.action-item {
 flex: 1;
 padding: 20rpx;
 background: rgba(255, 255, 255, 0.03);
 border-radius: 12rpx;
}

.action-label {
 display: block;
 font-size: 24rpx;
 color: #888;
 margin-bottom: 8rpx;
}

.action-value {
 font-size: 28rpx;
 color: #e8e8e8;
}

/* Timeline */
.timeline-row {
 display: flex;
 align-items: center;
 padding: 16rpx 0;
 border-bottom: 2rpx solid rgba(255, 255, 255, 0.05);
}

.timeline-row:last-child {
 border-bottom: none;
}

.timeline-label {
 width: 120rpx;
 font-size: 28rpx;
 color: #888;
}

.timeline-value {
 flex: 1;
 font-size: 28rpx;
 color: #e8e8e8;
}

/* Layers */
.layer-list {
 display: flex;
 flex-direction: column;
 gap: 20rpx;
}

.layer-item {
 display: flex;
 align-items: center;
 padding: 20rpx;
 background: rgba(255, 255, 255, 0.03);
 border-radius: 12rpx;
}

.layer-name {
 width: 100rpx;
 font-size: 26rpx;
 color: #d4af37;
}

.layer-value {
 flex: 1;
 font-size: 28rpx;
 color: #e8e8e8;
}

/* Citations */
.citation-item {
 padding: 24rpx 0;
 border-bottom: 2rpx solid rgba(255, 255, 255, 0.05);
}

.citation-item:last-child {
 border-bottom: none;
}

.citation-header {
 display: flex;
 align-items: center;
 gap: 16rpx;
 margin-bottom: 12rpx;
}

.citation-book {
 font-size: 28rpx;
 color: #d4af37;
 font-weight: 500;
}

.citation-chapter {
 font-size: 24rpx;
 color: #888;
}

.citation-quote {
 font-size: 28rpx;
 color: #e8e8e8;
 line-height: 1.8;
 padding-left: 24rpx;
 border-left: 6rpx solid #d4af37;
}

/* AI */
.ai-card {
 background: rgba(77, 171, 247, 0.05);
 border: 2rpx solid rgba(77, 171, 247, 0.2);
}

.ai-model {
 font-size: 24rpx;
 color: #888;
 margin-bottom: 16rpx;
 display: block;
}

.ai-content {
 font-size: 28rpx;
 color: #a0a0a0;
 line-height: 1.8;
}

/* Disclaimer */
.disclaimer-card {
 background: rgba(231, 76, 60, 0.05);
 border: 2rpx solid rgba(231, 76, 60, 0.2);
}

.disclaimer-title {
 font-size: 30rpx;
 color: #e74c3c;
 margin-bottom: 16rpx;
 display: block;
}

.disclaimer-text {
 font-size: 24rpx;
 color: #888;
 line-height: 1.6;
}

/* Loading */
.loading-view {
 display: flex;
 align-items: center;
 justify-content: center;
 height: 60vh;
}

.loading-text {
 font-size: 32rpx;
 color: #888;
}
</style>
