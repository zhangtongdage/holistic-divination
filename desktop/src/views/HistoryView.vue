<script setup lang="ts">
import { computed } from 'vue'
import { useDivinationStore } from '@/stores/divination'
import { RouterLink } from 'vue-router'

const store = useDivinationStore()

const history = computed(() => store.history)

function getHexagramSymbol(lines: boolean[]): string {
  return lines.map(line => line ? '⚊' : '⚋').join('')
}

function deleteItem(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    store.deleteHistory(id)
  }
}

function clearAll() {
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
    store.clearHistory()
  }
}
</script>

<template>
  <div class="history-view">
    <div class="history-header">
      <h2>历史记录</h2>
      <button v-if="history.length > 0" class="btn btn-danger" @click="clearAll">
        清空全部
      </button>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <div class="empty-icon">📜</div>
      <p>暂无历史记录</p>
      <router-link to="/divination" class="btn btn-primary">去起一卦</router-link>
    </div>

    <div v-else class="history-list">
      <div v-for="item in history" :key="item.id" class="history-item" :class="item.layers.yiLi.auspiciousness">
        <router-link :to="`/result/${item.id}`" class="history-link">
          <div class="history-main">
            <div class="hexagram-info">
              <span class="hexagram-name">{{ item.hexagram.primary }}</span>
              <span v-if="item.hexagram.secondary" class="secondary-arrow">→</span>
              <span v-if="item.hexagram.secondary" class="secondary-name">
                {{ item.hexagram.secondary }}
              </span>
            </div>
            <div class="hexagram-symbol">{{ getHexagramSymbol(item.hexagram.lines) }}</div>
          </div>

          <div class="history-details">
            <div class="detail-row">
              <span class="detail-label">问卦人</span>
              <span class="detail-value">{{ item.context.core?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">问题</span>
              <span class="detail-value">{{ item.context.question?.description.substring(0, 20) }}...</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">时间</span>
              <span class="detail-value">{{ new Date(item.timestamp).toLocaleString('zh-CN') }}</span>
            </div>
          </div>

          <div class="history-verdict">
            <span class="verdict" :class="item.layers.yiLi.auspiciousness">
              {{ item.layers.yiLi.auspiciousness }}
            </span>
          </div>
        </router-link>

        <button class="delete-btn" @click.stop="deleteItem(item.id)">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  max-width: 900px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.history-header h2 {
  color: #d4af37;
  font-size: 1.75rem;
}

.btn-danger {
  background: rgba(231, 76, 60, 0.8);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: rgba(231, 76, 60, 1);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #888;
  margin-bottom: 1.5rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(8px);
}

.history-link {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.history-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.hexagram-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hexagram-name {
  font-size: 1.5rem;
  color: #d4af37;
 }

.secondary-arrow {
 color: #888;
}

.secondary-name {
 font-size: 1.2rem;
 color: #888;
}

.hexagram-symbol {
 font-size: 1.5rem;
 letter-spacing: -0.15em;
 color: #a0a0a0;
}

.history-details {
 flex: 1;
 display: flex;
 flex-direction: column;
 gap: 0.5rem;
}

.detail-row {
 display: flex;
 gap: 1rem;
 align-items: baseline;
}

.detail-label {
 color: #666;
 font-size: 0.85rem;
 min-width: 60px;
}

.detail-value {
 color: #a0a0a0;
 font-size: 0.9rem;
}

.history-verdict {
 min-width: 100px;
 text-align: center;
}

.verdict {
 display: inline-block;
 padding: 0.5rem 1rem;
 border-radius: 20px;
 font-weight: 500;
}

.verdict.大吉 { background: rgba(39, 174, 96, 0.2); color: #2ecc71; }
.verdict.吉 { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
.verdict.小吉 { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
.verdict.平 { background: rgba(149, 165, 166, 0.2); color: #95a5a6; }
.verdict.小凶 { background: rgba(241, 196, 15, 0.15); color: #f1c40f; }
.verdict.凶 { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
.verdict.大凶 { background: rgba(192, 57, 43, 0.2); color: #c0392b; }

.delete-btn {
 position: absolute;
 top: 0.5rem;
 right: 0.5rem;
 width: 28px;
 height: 28px;
 border-radius: 50%;
 background: rgba(231, 76, 60, 0.2);
 color: #e74c3c;
 border: none;
 font-size: 1.2rem;
 cursor: pointer;
 opacity: 0;
 transition: all 0.3s ease;
}

.history-item:hover .delete-btn {
 opacity: 1;
}

.delete-btn:hover {
 background: rgba(231, 76, 60, 0.3);
}
</style>
