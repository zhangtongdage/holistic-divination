# 全息人本古法卜算全融合系统 v2.0

**彻底打破术数体系壁垒，回归「人、时、空、事、念」五维全息共振的卜算本质**

## 核心特性

- 🧠 **本地AI推理** — 基于Qwen2-1.5B微调的专用卜算模型，100%离线运行
- 📚 **全量典籍知识库** — 《四库全书·术数类》《增删卜易》《卜筮正宗》结构化内置
- 🔮 **六层融合架构** — 公理→体用→机变→取象→义理→占断完整体系
- 🎯 **唯一性卜算密钥** — 7维度混合同余，真正千人千面
- 💻 **全平台支持** — 桌面端(Tauri) + 移动端(UniApp X) + Web

## 快速开始

### 1. 安装依赖

```bash
cd core
npm install
```

### 2. 下载模型

模型文件约950MB，请手动下载：

```bash
# 创建模型目录
mkdir -p core/models

# 方式一：从GitHub Release下载
# 访问 https://github.com/zhangtongdage/holistic-divination/releases
# 下载 xuanji-interpreter.gguf 放入 core/models/

# 方式二：从网盘下载
# 链接会在Release页面提供
```

### 3. 运行

```bash
# 开发模式
npm run dev

# 构建
npm run build
```

## 模型信息

| 项目 | 说明 |
|------|------|
| 基座模型 | Qwen2-1.5B |
| 训练方法 | QLoRA微调 |
| 训练数据 | 2000+条卜算问答对 |
| 量化格式 | GGUF Q4_K_M |
| 文件大小 | ~950MB |
| 推理速度 | RTX 4060: ~30 tokens/s |

## 项目结构

```
holistic-divination/
├── core/                          # 核心引擎
│   ├── src/
│   │   ├── inference/
│   │   │   ├── ai-engine.ts       # 混合推理引擎(API+本地)
│   │   │   └── local-engine.ts    # 本地GGUF推理
│   │   ├── space-time/            # 时空计算
│   │   ├── divination/            # 卜算算法
│   │   └── classics/              # 典籍数据库
│   ├── models/                    # 模型文件(需下载)
│   └── package.json
├── desktop/                       # Tauri桌面端
├── mobile/                        # UniApp X移动端
└── docs/                          # 文档
```

## 推理模式

### 本地模式（推荐）
- 完全离线，无需网络
- 隐私安全，数据不出本地
- 基于Qwen2-1.5B微调模型

### API模式
- 支持OpenAI/Claude/智谱/DeepSeek等
- 需要网络和API密钥
- 解读质量更高

### 混合模式（默认）
- 优先使用本地模型
- 本地失败自动回退API
- 兼顾速度和质量

## 技术栈

- **Core**: TypeScript纯算法
- **Desktop**: Tauri 2.0 + Vue 3
- **Mobile**: UniApp X (Android/iOS)
- **AI推理**: node-llama-cpp + GGUF
- **训练**: PyTorch + LoRA + QLoRA

## 免责声明

本系统仅供中华传统文化研究与学术参考，不具备科学依据。所有解读内容均来自公版古籍，不构成任何决策建议。请理性看待，切勿沉迷。

## 许可证

MIT License
