# 全息人本古法卜算 - 安装部署指南

## 📋 目录

1. [系统简介](#系统简介)
2. [系统要求](#系统要求)
3. [下载安装](#下载安装)
4. [首次配置](#首次配置)
5. [功能说明](#功能说明)
6. [常见问题](#常见问题)
7. [开发者指南](#开发者指南)

---

## 系统简介

全息人本古法卜算是一套融合中华传统术数的智能卜算系统，包含：

- **六层融合引擎**：义理层、机变层、取象层、体用层、天时层、地利层
- **AI智能解读**：支持本地模型和API双模式
- **完整数据库**：64卦典籍、300+爻辞、五行生克
- **真太阳时**：精确到分钟的天文计算
- **公历→农历转换**：支持1900-2100年

### 技术架构

```
┌─────────────────────────────────────────┐
│         桌面端 (Tauri + Vue 3)          │
├─────────────────────────────────────────┤
│              核心引擎                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 六层融合 │ │ AI推理  │ │ 典籍库  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│         Rust 后端 (Tauri)               │
│  - 本地存储 (AES-256加密)               │
│  - 文件系统访问                          │
│  - 系统集成                              │
└─────────────────────────────────────────┘
```

---

## 系统要求

### Windows
- **操作系统**：Windows 10 (1803+) 或 Windows 11
- **架构**：x64 (64位)
- **内存**：4GB RAM (推荐8GB)
- **磁盘空间**：200MB 可用空间
- **其他**：WebView2 Runtime (Windows 10 需要手动安装)

### macOS
- **操作系统**：macOS 10.15 Catalina 或更高
- **架构**：Intel (x64) 或 Apple Silicon (ARM64)
- **内存**：4GB RAM (推荐8GB)
- **磁盘空间**：200MB 可用空间

### Linux (Ubuntu/Debian)
- **操作系统**：Ubuntu 20.04+ / Debian 11+
- **架构**：x64 (64位)
- **内存**：4GB RAM (推荐8GB)
- **磁盘空间**：200MB 可用空间
- **依赖库**：
  ```bash
  sudo apt install -y webkit2gtk-4.1 libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

---

## 下载安装

### 方式一：下载安装包 (推荐)

#### Windows 用户
1. 下载 `全息人本卜算_1.0.0_x64-setup.exe` 或 `全息人本卜算_1.0.0_x64.msi`
2. 双击运行安装程序
3. 按照向导完成安装
4. 桌面会出现快捷方式

#### macOS 用户
1. 下载 `全息人本卜算_1.0.0_aarch64.dmg` (Apple Silicon)
   或 `全息人本卜算_1.0.0_x64.dmg` (Intel)
2. 双击打开 DMG 文件
3. 将应用拖入 Applications 文件夹
4. 首次打开需要在「系统偏好设置 → 安全性与隐私」中允许

#### Linux 用户
1. 下载 `全息人本卜算_1.0.0_amd64.deb` (Ubuntu/Debian)
   或 `全息人本卜算_1.0.0_amd64.AppImage` (通用)
2. **Deb 安装**：
   ```bash
   sudo dpkg -i 全息人本卜算_1.0.0_amd64.deb
   sudo apt install -f  # 修复依赖
   ```
3. **AppImage 运行**：
   ```bash
   chmod +x 全息人本卜算_1.0.0_amd64.AppImage
   ./全息人本卜算_1.0.0_amd64.AppImage
   ```

### 方式二：从源码构建

```bash
# 1. 克隆仓库
git clone https://github.com/zhangtongdage/holistic-divination.git
cd holistic-divination

# 2. 安装依赖
cd desktop
npm install

# 3. 构建前端
npm run build

# 4. 构建桌面应用
npx tauri build

# 安装包位于 src-tauri/target/release/bundle/
```

---

## 首次配置

### 1. 启动应用

双击桌面快捷方式或从开始菜单启动。

### 2. 配置 AI 解读 (可选)

AI 解读功能需要配置 API 密钥：

1. 点击左侧导航栏的「设置」
2. 选择 AI 提供商（推荐 NVIDIA NIM，有免费额度）
3. 输入 API 密钥
4. 点击「测试连接」确认可用
5. 点击「保存设置」

#### 支持的 AI 提供商

| 提供商 | 免费额度 | 推荐度 |
|--------|----------|--------|
| NVIDIA NIM | ✅ 有 | ⭐⭐⭐⭐⭐ |
| DeepSeek | ✅ 有 | ⭐⭐⭐⭐ |
| 智谱AI | ✅ 有 | ⭐⭐⭐⭐ |
| OpenAI | ❌ 无 | ⭐⭐⭐ |
| Claude | ❌ 无 | ⭐⭐⭐ |

> 💡 不配置 AI 也能使用，系统会提供基于算法的基础解读。

### 3. 开始卜算

1. 点击「起卦」
2. 输入姓名、性别、出生日期
3. 选择问事类型
4. 输入具体问题
5. 点击「开始卜算」

---

## 功能说明

### 核心功能

#### 六层融合分析
- **义理层**：基于《周易》经传的哲学解读
- **机变层**：卦象变化的动态分析
- **取象层**：卦象对应的自然、人事意象
- **体用层**：问事者与所问之事的关系
- **天时层**：时间因素的影响（节气、时辰）
- **地利层**：方位、环境因素

#### AI 智能解读
- 基于卦象数据的深度分析
- 个性化建议和指导
- 多路径预测分析
- 概率化趋势判断

#### 典籍引用
- 《周易》原文
- 《象传》解读
- 《彖传》解读
- 相关度评分

### 数据安全

- **本地存储**：所有数据保存在本地，不会上传
- **AES-256 加密**：API 密钥等敏感信息加密存储
- **离线可用**：核心功能无需联网

---

## 常见问题

### Q1: 启动后白屏？

**Windows**：
- 安装 WebView2 Runtime：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

**Linux**：
```bash
sudo apt install webkit2gtk-4.1
```

### Q2: AI 解读无法使用？

1. 检查网络连接
2. 确认 API 密钥正确
3. 在设置页面点击「测试连接」
4. 查看浏览器控制台错误信息（F12）

### Q3: 数据如何备份？

数据存储在：
- **Windows**：`%APPDATA%\com.holistic.divination\`
- **macOS**：`~/Library/Application Support/com.holistic.divination/`
- **Linux**：`~/.config/com.holistic.divination/`

备份整个文件夹即可。

### Q4: 如何卸载？

**Windows**：设置 → 应用和功能 → 全息人本卜算 → 卸载

**macOS**：将 Applications 中的应用拖入废纸篓

**Linux (deb)**：`sudo dpkg -r 全息人本卜算`

---

## 开发者指南

### 技术栈

- **前端**：Vue 3 + TypeScript + Vite
- **后端**：Rust (Tauri 2.x)
- **核心引擎**：TypeScript (可复用于 Node.js)
- **AI 推理**：支持 API 和本地 GGUF 模型

### 项目结构

```
holistic-divination/
├── core/                 # 核心引擎 (TypeScript)
│   ├── src/
│   │   ├── engine/       # 六层融合引擎
│   │   ├── inference/    # AI 推理引擎
│   │   ├── collection/   # 数据采集
│   │   └── data/         # 典籍数据库
│   └── models/           # 本地 GGUF 模型
├── desktop/              # 桌面应用 (Tauri)
│   ├── src/              # Vue 前端
│   ├── src-tauri/        # Rust 后端
│   └── dist/             # 构建产物
└── mobile/               # 移动端 (uni-app)
```

### 本地开发

```bash
# 启动开发服务器
cd desktop
npm run dev        # 前端热重载
npm run tauri:dev  # 完整 Tauri 开发

# 运行测试
cd core
npm test
```

### 构建发布

```bash
# 构建所有平台
npm run tauri build

# 产物位置
# src-tauri/target/release/bundle/
#   ├── deb/      Linux
#   ├── dmg/      macOS
#   ├── msi/      Windows
#   └── appimage/ Linux 通用
```

### 自定义构建

修改 `src-tauri/tauri.conf.json`：

```json
{
  "bundle": {
    "productName": "你的应用名",
    "identifier": "com.yourcompany.appname",
    "icon": ["icons/icon.ico", "icons/icon.icns", "icons/icon.png"]
  }
}
```

---

## 技术支持

- **GitHub Issues**：https://github.com/zhangtongdage/holistic-divination/issues
- **邮件**：(请在 GitHub 上联系)

---

## 许可证

本项目仅供学习研究使用。卜算结果仅供参考，不构成任何建议。

---

*卜算乃辅助观心之具，下手处永远在己，而非问卜*
