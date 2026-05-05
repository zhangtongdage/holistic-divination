<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
  // 初始化应用
  console.log('全息人本卜算系统已启动')
})
</script>

<template>
  <div id="app-container" class="dark-theme">
    <header class="app-header">
      <div class="logo">
        <span class="logo-icon">☯</span>
        <span class="logo-text">全息人本古法卜算</span>
      </div>
      <nav class="main-nav">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/divination" class="nav-item">起卦</router-link>
        <router-link to="/history" class="nav-item">历史</router-link>
        <router-link to="/settings" class="nav-item">设置</router-link>
      </nav>
    </header>
    
    <main class="app-main">
      <RouterView />
    </main>
    
    <footer class="app-footer">
      <div class="disclaimer">
        <p>⚠️ 卜筮乃辅助观心之具，下手处永远在己，而非问卜</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.dark-theme {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e8e8e8;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.logo-icon {
  font-size: 2rem;
  color: #d4af37;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}

.logo-text {
  background: linear-gradient(135deg, #d4af37, #f4d03f, #d4af37);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  padding: 0.5rem 1rem;
  color: #a0a0a0;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.nav-item.router-link-active {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.2);
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.disclaimer {
  text-align: center;
  font-size: 0.875rem;
  color: #888;
}

.disclaimer p {
  margin: 0;
}
</style>
