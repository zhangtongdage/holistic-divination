<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MODE_OPTIONS, SUPPORTED_PROVIDERS, DEFAULT_CONFIG } from '@core/inference/config'
import { useDivinationStore } from '@/stores/divination'
import type { AIConfig } from '@core/inference/ai-engine'

const store = useDivinationStore()

const aiMode = ref(DEFAULT_CONFIG.mode)
const apiProvider = ref(DEFAULT_CONFIG.apiProvider)
const apiKey = ref(DEFAULT_CONFIG.apiKey)
const apiBaseUrl = ref(DEFAULT_CONFIG.apiBaseUrl)
const modelName = ref(DEFAULT_CONFIG.modelName)
const timeout = ref(DEFAULT_CONFIG.timeout)
const retryCount = ref(DEFAULT_CONFIG.retryCount)

const testStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle')
const testMessage = ref('')
const saveMessage = ref('')

onMounted(() => {
  // 从 localStorage 加载已保存的配置
  loadSettings()
})

function loadSettings() {
  try {
    const saved = localStorage.getItem('hd_ai_config')
    if (saved) {
      const config = JSON.parse(saved)
      if (config.apiProvider) apiProvider.value = config.apiProvider
      if (config.apiKey) apiKey.value = config.apiKey
      if (config.apiBaseUrl) apiBaseUrl.value = config.apiBaseUrl
      if (config.modelName) modelName.value = config.modelName
      if (config.timeout) timeout.value = config.timeout
      if (config.retryCount) retryCount.value = config.retryCount
    }
  } catch (e) {
    console.error('加载配置失败:', e)
  }
}

function saveSettings() {
  const config: Partial<AIConfig> = {
    mode: aiMode.value as AIConfig['mode'],
    apiProvider: apiProvider.value as any,
    apiKey: apiKey.value,
    apiBaseUrl: apiBaseUrl.value,
    modelName: modelName.value,
    timeout: timeout.value,
    retryCount: retryCount.value,
  }

  try {
    localStorage.setItem('hd_ai_config', JSON.stringify(config))
    store.initializeAI(config as AIConfig)
    saveMessage.value = '✅ 设置已保存并生效'
    setTimeout(() => saveMessage.value = '', 3000)
  } catch (e) {
    saveMessage.value = '❌ 保存失败'
  }
}

async function testConnection() {
  testStatus.value = 'testing'
  testMessage.value = '正在测试连接...'

  try {
    // 使用 Vite 代理避免 CORS 问题
    let url = apiBaseUrl.value || '/api/nvidia/v1/chat/completions'
    // 如果用户输入了直接 URL，自动转换为代理 URL
    if (url.includes('integrate.api.nvidia.com')) {
      url = url.replace('https://integrate.api.nvidia.com', '/api/nvidia')
    }
    const key = apiKey.value
    const model = modelName.value || 'stepfun-ai/step-3.5-flash'

    if (!key || key.length < 10) {
      throw new Error('请先填写API密钥')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '你好，请回复一个字' }],
        max_tokens: 500,
        temperature: 0.1,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errText.substring(0, 200)}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || ''
    testStatus.value = 'success'
    testMessage.value = `✅ 连接成功！模型回复：「${reply.substring(0, 50)}」`
  } catch (e: any) {
    testStatus.value = 'error'
    const msg = e.name === 'AbortError' ? '请求超时(30s)' : (e.message || '未知错误')
    testMessage.value = `❌ 连接失败: ${msg}`
  }
}

// 当选择提供商时自动填充默认值
function onProviderChange() {
  const provider = SUPPORTED_PROVIDERS.find(p => p.id === apiProvider.value)
  if (provider) {
    apiBaseUrl.value = provider.defaultUrl
    if (!modelName.value) modelName.value = provider.defaultModel
  }
}
</script>

<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>⚙️ 设置</h2>
    </div>

    <div class="settings-section">
      <h3>🤖 AI推理配置</h3>

      <div class="form-group">
        <label>API提供商</label>
        <select v-model="apiProvider" class="form-control" @change="onProviderChange">
          <option v-for="provider in SUPPORTED_PROVIDERS" :key="provider.id" :value="provider.id">
            {{ provider.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>API密钥</label>
        <input v-model="apiKey" type="password" class="form-control" placeholder="输入您的API密钥" />
        <p class="form-help">密钥将以AES-256加密存储在本地，不会上传至任何服务器</p>
      </div>

      <div class="form-group">
        <label>API地址</label>
        <input v-model="apiBaseUrl" type="text" class="form-control" placeholder="https://api.example.com/v1/chat/completions" />
      </div>

      <div class="form-group">
        <label>模型名称</label>
        <input v-model="modelName" type="text" class="form-control" placeholder="例如：stepfun-ai/step-3.5-flash" />
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label>超时时间 (ms)</label>
          <input v-model.number="timeout" type="number" class="form-control" min="10000" max="120000" step="5000" />
        </div>
        <div class="form-group half">
          <label>重试次数</label>
          <input v-model.number="retryCount" type="number" class="form-control" min="0" max="5" />
        </div>
      </div>

      <div v-if="testMessage" class="test-result" :class="testStatus">
        {{ testMessage }}
      </div>

      <div v-if="saveMessage" class="save-result">
        {{ saveMessage }}
      </div>

      <div class="form-actions">
        <button class="btn btn-secondary" @click="testConnection" :disabled="testStatus === 'testing'">
          {{ testStatus === 'testing' ? '测试中...' : '🔗 测试连接' }}
        </button>
        <button class="btn btn-primary" @click="saveSettings">
          💾 保存设置
        </button>
      </div>
    </div>

    <div class="settings-section">
      <h3>📁 数据管理</h3>
      <div class="data-actions">
        <button class="btn btn-secondary">导出历史记录</button>
        <button class="btn btn-danger" @click="store.clearHistory()">清除所有记录</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>ℹ️ 关于</h3>
      <div class="about-info">
        <p><strong>全息人本古法卜算</strong></p>
        <p>版本：1.0.0</p>
        <p>核心特点：六层融合、千人千面、典籍溯源</p>
        <p>AI引擎：{{ apiProvider }} · {{ modelName || '默认模型' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h2 {
  color: #d4af37;
  font-size: 1.75rem;
}

.settings-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.settings-section h3 {
  color: #d4af37;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #e8e8e8;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e8e8e8;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(255, 255, 255, 0.08);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}

.form-help {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.test-result, .save-result {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.test-result.testing {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.test-result.success {
  background: rgba(39, 174, 96, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.test-result.error {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.save-result {
  background: rgba(39, 174, 96, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.form-actions .btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: #1a1a2e;
  font-weight: 600;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #f4d03f, #d4af37);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: rgba(231, 76, 60, 0.8);
  color: #fff;
}

.btn-danger:hover {
  background: rgba(231, 76, 60, 1);
}

.data-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.data-actions .btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.about-info {
  color: #a0a0a0;
  line-height: 1.8;
}

.about-info p {
  margin: 0.5rem 0;
}
</style>
