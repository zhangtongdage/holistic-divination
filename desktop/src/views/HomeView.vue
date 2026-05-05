<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="line1">全息人本</span>
          <span class="line2">古法卜算</span>
        </h1>
        <p class="hero-subtitle">
          打破术数壁垒 · 回归卜算本质
        </p>
        <p class="hero-desc">
          千人千面 · 唯一卦局 · 典籍有源
        </p>
        <div class="hero-features">
          <div class="feature">
            <span class="icon">☯</span>
            <span>六层融合</span>
          </div>
          <div class="feature">
            <span class="icon">👤</span>
            <span>人象核心</span>
          </div>
          <div class="feature">
            <span class="icon">📚</span>
            <span>典籍溯源</span>
          </div>
          <div class="feature">
            <span class="icon">🔒</span>
            <span>本地运行</span>
          </div>
        </div>
        <div class="hero-actions">
          <router-link to="/divination" class="btn btn-primary">
            <span>开始起卦</span>
            <span class="btn-arrow">→</span>
          </router-link>
          <router-link to="/history" class="btn btn-secondary">
            <span>查看历史</span>
          </router-link>
        </div>
      </div>
    </section>
    
    <section class="disclaimer-section">
      <div class="disclaimer-box">
        <h3>⚠️ 重要声明</h3>
        <p>卜筮本是辅助观心之具，结果非宿命。下手处永远在己，而非问卜。</p>
        <ul>
          <li>疑则筮之，吉则行之，凶则谋之</li>
          <li>不信者不占，不诚者不告</li>
          <li>同一问题不宜反复占卜</li>
          <li>任何决定的责任归于问者自身</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.hero-content {
  max-width: 700px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: 0.1em;
}

.hero-title .line1 {
  display: block;
  color: #d4af37;
  text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
}

.hero-title .line2 {
  display: block;
  color: #f4d03f;
  background: linear-gradient(135deg, #f4d03f, #d4af37);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #a0a0a0;
  margin-bottom: 0.5rem;
}

.hero-desc {
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 2rem;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #a0a0a0;
}

.feature .icon {
  font-size: 2rem;
}

.feature span:last-child {
  font-size: 0.875rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: #1a1a2e;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #d4af37;
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.btn:hover .btn-arrow {
  transform: translateX(4px);
}

.disclaimer-section {
  padding: 2rem;
}

.disclaimer-box {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.disclaimer-box h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.disclaimer-box p {
  color: #a0a0a0;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.disclaimer-box ul {
  color: #888;
  padding-left: 1.5rem;
  line-height: 2;
}

.disclaimer-box li {
  margin-bottom: 0.5rem;
}
</style>
