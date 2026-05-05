#!/bin/bash
# 全息人本卜算 - 一键构建脚本
# 使用方法: bash build.sh [平台]
# 平台选项: linux, windows, mac, all (默认: 当前平台)

set -e

echo "=========================================="
echo "   全息人本古法卜算 - 构建脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
check_deps() {
    echo -e "\n${YELLOW}[1/4] 检查依赖...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo "请安装 Node.js 18+: https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}❌ Rust 未安装${NC}"
        echo "请安装 Rust: https://rustup.rs/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
    echo -e "${GREEN}✅ Rust $(rustc --version | cut -d' ' -f2)${NC}"
}

# 安装依赖
install_deps() {
    echo -e "\n${YELLOW}[2/4] 安装依赖...${NC}"
    
    cd desktop
    
    if [ ! -d "node_modules" ]; then
        echo "安装 npm 依赖..."
        npm install
    else
        echo "npm 依赖已存在，跳过"
    fi
    
    cd ..
}

# 构建前端
build_frontend() {
    echo -e "\n${YELLOW}[3/4] 构建前端...${NC}"
    
    cd desktop
    npm run build
    cd ..
    
    echo -e "${GREEN}✅ 前端构建完成${NC}"
}

# 构建桌面应用
build_desktop() {
    echo -e "\n${YELLOW}[4/4] 构建桌面应用...${NC}"
    
    cd desktop
    
    case "$1" in
        windows)
            echo "构建 Windows 版本..."
            npx tauri build --target x86_64-pc-windows-msvc 2>/dev/null || \
            echo -e "${YELLOW}⚠️ 交叉编译 Windows 需要在 Windows 环境或配置 cross工具链${NC}"
            ;;
        mac)
            echo "构建 macOS 版本..."
            npx tauri build --target aarch64-apple-darwin 2>/dev/null || \
            npx tauri build --target x86_64-apple-darwin 2>/dev/null || \
            echo -e "${YELLOW}⚠️ 交叉编译 macOS 需要在 macOS 环境${NC}"
            ;;
        linux|*)
            echo "构建 Linux 版本..."
            npx tauri build
            ;;
    esac
    
    cd ..
}

# 显示结果
show_result() {
    echo -e "\n=========================================="
    echo -e "${GREEN}✅ 构建完成！${NC}"
    echo -e "=========================================="
    
    BUNDLE_DIR="desktop/src-tauri/target/release/bundle"
    
    if [ -d "$BUNDLE_DIR" ]; then
        echo -e "\n📦 安装包位置:"
        
        if [ -d "$BUNDLE_DIR/deb" ]; then
            echo -e "  ${GREEN}Linux (Debian/Ubuntu):${NC}"
            ls -lh $BUNDLE_DIR/deb/*.deb 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
        fi
        
        if [ -d "$BUNDLE_DIR/appimage" ]; then
            echo -e "  ${GREEN}Linux (通用):${NC}"
            ls -lh $BUNDLE_DIR/appimage/*.AppImage 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
        fi
        
        if [ -d "$BUNDLE_DIR/dmg" ]; then
            echo -e "  ${GREEN}macOS:${NC}"
            ls -lh $BUNDLE_DIR/dmg/*.dmg 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
        fi
        
        if [ -d "$BUNDLE_DIR/msi" ]; then
            echo -e "  ${GREEN}Windows:${NC}"
            ls -lh $BUNDLE_DIR/msi/*.msi 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
        fi
    fi
    
    echo -e "\n💡 提示:"
    echo "  - Linux 用户需要安装 webkit2gtk-4.1"
    echo "  - Windows 用户需要 WebView2 Runtime"
    echo "  - macOS 用户首次运行需要在安全设置中允许"
    echo ""
}

# 主流程
PLATFORM=${1:-linux}

echo "目标平台: $PLATFORM"

check_deps
install_deps
build_frontend
build_desktop "$PLATFORM"
show_result
