# 贡献指南

感谢你对全息人本古法卜算系统的关注！本文档将帮助你快速参与贡献。

## 开发环境

### 环境要求

- Node.js 18+
- TypeScript 5.3+
- npm 或 pnpm

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/zhangtongdage/holistic-divination.git
cd holistic-divination

# 2. 安装依赖
cd core && npm install

# 3. 启动开发服务器
npm run dev

# 4. 运行测试
npm test
```

## 代码规范

### TypeScript 风格

- 使用 2 空格缩进
- 字符串使用单引号
- 行末不加逗号
- 使用 `const` 和 `let`，避免 `var`
- 所有公共 API 必须有 JSDoc 注释

### 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型(type)：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(divination): 添加紫微斗数排盘算法
fix(inference): 修复本地模型加载失败的问题
docs: 更新架构设计文档
```

## 贡献流程

### 1. 创建 Issue

- Bug 报告：请使用 Bug Report 模板
- 功能建议：请使用 Feature Request 模板
- 问题讨论：直接创建 Issue

### 2. Fork 并创建分支

```bash
git fork https://github.com/zhangtongdage/holistic-divination.git
git checkout -b feature/your-feature-name
```

### 3. 开发并测试

```bash
# 开发
npm run dev

# 测试
npm test

# 代码检查
npm run lint
```

### 4. 提交 PR

- 确保所有测试通过
- 更新相关文档
- PR 标题使用 Conventional Commits 格式
- 在 PR 描述中说明改动内容

## 项目结构

```
holistic-divination/
├── core/                    # 核心引擎 (TypeScript)
│   ├── src/
│   │   ├── inference/       # AI推理引擎
│   │   ├── space-time/      # 时空计算
│   │   ├── divination/      # 卜算算法
│   │   └── classics/        # 典籍数据库
│   └── tests/               # 测试
├── desktop/                 # Tauri桌面端
├── mobile/                  # UniApp X移动端
└── docs/                    # 文档
```

## 开发指南

### 添加新的术数体系

1. 在 `core/src/divination/` 下创建新目录
2. 实现排盘算法
3. 添加单元测试
4. 在 `core/src/index.ts` 中导出
5. 更新文档

### 改进 AI 推理

1. 训练数据放在 `xuanji-train/`
2. 运行 `train_qlora.py` 训练模型
3. 用 `convert_to_gguf.sh` 转换格式
4. 将模型放入 `core/models/`

### 修复 Bug

1. 在 Issue 中描述问题
2. 创建修复分支
3. 编写测试用例
4. 提交 PR

## 行为准则

- 尊重所有参与者
- 接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表示同理心

## 问题？

有任何问题，欢迎创建 Issue 或联系维护者。

感谢你的贡献！🙏
