# 全息人本古法卜算全融合系统

## 项目简介

严格按照豆包AI完整落地方案实现的全息人本古法卜算系统，彻底打破术数体系壁垒，回归「人、时、空、事、念」五维全息共振的卜算本质。

## 核心特点

### 1. 六层融合统一架构

```
def class relational structure at the top of the organizational chart:
def organizational structure at the top of the organizational chart:
def organizational structure at the top of the organizational chart:
def organizational structure at the top of the organizational chart:
def organizational structure at the top of the organizational chart:
def organizational structure with the defined structure at the top of the organizational chart with the following structure

```

### 2. 全息人本信息采集

- **必填核心**（3层）: 基础人象 + 核心问事 + 当前境地
- **可选补充**（3层）: 发问状态 + 补充人象 + 主观预期

### 3. 唯一性卜算密钥

七维度混合同余：
1. 本命四柱先天数
2. 发问时空干支数
3. 问题汉字笔画数
4. 当前境地五行编码
5. 心念状态权重值
6. 地点经纬度哈希
7. 采集行为特征值

### 4. 混合AI架构

| 模式 | 说明 |
|------|------|
| 智能切换 | 本地ONNX优先，失败时API兜底 |
| 本地AI | INT4量化，CPU推理，完全离线 |
| API接入 | 支持OpenAI/Claude/智谱/DeepSeek/自定义 |

### 5. 典籍溯源

每句解读必须有出处，内置《周易》《象传》《彖传》等权威典籍

### 6. 版权归原作者所有

固定展示，不可关闭：「卜筮乃辅助观心之具，下手处永远在己」

## 项目结构

```
holistic-divination/
├── core/                          # 核心引擎（TypeScript）
│   src/
│   ├── inference/
│   │   ├── ai-engine.ts          # 混合AI推理引擎
│   │   └── config.ts             # AI配置管理
│   ├── collection/
│   │   └── holistic-collector.ts # 全息信息采集器
│   ├── engine/
│   │   ├── key-generator.ts      # 唯一性密钥生成
│   │   └── six-layer-engine.ts   # 六层融合引擎
│   └── index.ts                  # 导出声明
│
├── desktop/                       # 桌面端（Tauri + Vue3）
│   src/
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── DivinationView.vue
│   │   ├── ResultView.vue
│   │   ├── HistoryView.vue
│   │   └── SettingsView.vue
│   ├── stores/
│   │   └── divination.ts
│   ├── App.vue
│   ├── main.ts
│   ├── router/
│   └── src-tauri/                # Tauri配置
│
├── mobile/                        # 移动端（UniApp X）
│   pages/
│   ├── index/
│   │   └── index.vue
│   ├── collection/
│   │   └── collection.vue
│   ├── result/
│   │   └── result.vue
│   ├── history/
│   │   └── history.vue
│   ├── settings/
│   │   └── settings.vue
│   ├── App.vue
│   ├── main.ts
│   └── components/
│       └── TabBar.vue
│
└── docs/                          # 文档
```

## 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 核心引擎 | TypeScript | 纯算法，零依赖 |
| 桌面端 | Rust + Tauri 2.0 | Windows/macOS/Linux |
| 移动端 | UniApp X | Android/iOS/小程序 |
| AI推理 | ONNX Runtime / API | INT4量化 / 云端备选 |
| 本地存储 | SQLite + AES-256 | 加密存储，无云端 |

## 运行方法

### 桌面端

```bash
cd desktop
npm install
npm run tauri:dev    # 开发模式
npm run tauri:build  # 打包
```

### 移动端

```bash
cd mobile
npm install
npm run dev:app     # App开发
npm run dev:h5      # H5开发
npm run dev:android # Android开发
npm run dev:ios     # iOS开发
npm run build:app   # 打包
```

### 核心引擎测试

```bash
cd core
npm install
npm test
```

## 核心功能

### 1. 全息信息采集（3层6组）

| 层级 | 内容 | 字段数 |
|------|------|--------|
| 基础人象 | 姓名/出生时间/性别/出生地 | 7 |
| 核心问事 | 领域描述/急迫度 | 5 |
| 当前境地 | 人生阶段/困境/资源 | 5 |
| 发问状态 | 心绪/预兆/杂念 | 4 |
| 补充人象 | 职业/节点/人物 | 4 |
| 主观预期 | 期望/底线/风险 | 5 |

### 2. 唯一性保证

- 同一人在不同时刻 → 不同卦
- 不同人同时问事 → 不同卦  
- 同一问题不同心境 → 不同卦

### 3. 智能AI切换

- 本地推理失败 → 自动切换到API
- API过载 → 本地降级处理
- 无网络 → 纯本地运行

### 4. 典籍自动匹配

- 《周易》卦辞
- 《象传》大象
- 《彖传》彖辞
- 变爻爻辞

## 安全保证

- API密钥本地AES-256加密
- 所有数据本地存储，不上传
- 结果只存在于用户设备
- 严格遵守传统卜筮伦理

## 免责声明

**卜筮本是辅助观之具，结果非宿命**

1. 疑则筮之，吉则行之，凶则谋之
2. 筮不过三，三筮而中
3. 不信者不占，不诚者不告
4. 不可戏玩占

**下手处永远在己，而非问卜**

## 许可证

MIT - 开源但请遵守卜筮伦理

## 致谢

- 方案来源：豆包AI完整落地方案（2026-04-28）
- 典籍来源：《四库全书·术数类》
