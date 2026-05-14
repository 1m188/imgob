# imgob 重构计划 — Vue 3 + Vite

## 1. 项目概述

将单文件 vanilla HTML/JS 图片查看器重构为 Vue 3 + Vite 工程化项目。核心改动：**从选择多个文件 → 选择整个文件夹**，新增排序功能、主题切换，优化图片展示。

## 2. 技术栈（已实现）

| 层面 | 选型 | 状态 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | ✅ |
| 构建 | Vite 6 | ✅ |
| 包管理 | npm（`node_modules` 在项目根目录） | ✅ |
| 代码格式化 | Prettier（`.prettierrc`） | ✅ |
| 代码检查 | 无 ESLint（用户自行处理测试） | — |
| CSS | Scoped `<style>` + CSS custom properties（双主题） | ✅ |
| 状态管理 | Vue Composition API（ref / reactive） | ✅ |
| 图片加载 | `URL.createObjectURL()` | ✅ |
| 部署 | GitHub Pages（`docs/` 目录发布） | ✅ |

## 3. 项目结构（当前）

```
imgob/
├── index.html                     # Vite 入口 HTML
├── package.json
├── vite.config.js
├── .prettierrc
├── .gitignore
├── AGENTS.md                      # AI 助手指南
├── PLAN.md                        # 本文件
├── README.md
├── LICENSE
├── .roo/                          # Roo Code 模式隔离规则
│   ├── rules-code/AGENTS.md
│   ├── rules-debug/AGENTS.md
│   ├── rules-ask/AGENTS.md
│   └── rules-architect/AGENTS.md
├── docs/                          # GitHub Pages 发布源
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
├── public/
│   └── favicon.svg
└── src/
    ├── main.js                    # Vue 应用入口（导入 main.css）
    ├── App.vue                    # 根组件（装配所有子组件）
    ├── components/
    │   ├── ImageCanvas.vue        # 图片展示核心（absolute + object-fit）
    │   ├── FolderSelector.vue     # 文件夹选择入口 + 拖拽区域
    │   ├── Toolbar.vue            # 排序/主题/全屏/缩略图按钮
    │   └── ThumbnailStrip.vue     # 底部缩略图条（拖拽自定义排序）
    ├── composables/
    │   ├── useImages.js           # 图片列表状态、加载、排序、导航
    │   ├── useKeyboard.js         # 键盘快捷键管理
    │   ├── useFolderPicker.js     # 文件夹选择（FSA + webkitdirectory 降级）
    │   └── useTheme.js            # 主题模式管理（dark/light/system）
    └── assets/
        └── main.css               # 全局 reset + 双主题 CSS 变量
```

## 4. 组件树 & 数据流

```
useFolderPicker → useImages.loadFiles() → App.vue props 向下分发
useTheme → App.vue → Toolbar (props + emit cycle-theme)
useKeyboard → App.vue → useImages 导航方法

Toolbar          → emit sort-change / toggle-* / cycle-theme
ThumbnailStrip   → emit select / reorder
ImageCanvas      → emit prev / next / toggle-fullscreen / load-error
```

- **状态集中在 `useImages`**：`imageList`、`currentIndex`、`sortMode`、`sortAsc`。
- **主题集中在 `useTheme`**：`themeMode`，持久化到 localStorage（键名 `imgob-theme`）。
- 无跨组件状态共享需求 — 不引入 Pinia。

## 5. 已实现功能

### 5.1 文件夹选择
- File System Access API (`showDirectoryPicker({ mode: 'read' })`)
- 降级方案：`<input webkitdirectory>`
- 支持拖拽文件夹到页面

### 5.2 排序
- 按名称（localeCompare 自然排序）/ 时间 / 大小
- 升序/降序切换
- 自定义排序：拖拽缩略图（sortMode = 'custom'，不在 Toolbar 按钮组显示）

### 5.3 图片显示
- `<img>` + CSS `position: absolute; inset: 0; object-fit: contain`
- 加载中/加载失败占位符
- `image-orientation: from-image` 处理 EXIF 方向
- 导航箭头：内嵌 SVG（40×40 viewBox，圆圈 `border-radius: 50%`）

### 5.4 导航
- 键盘：← → Home End F（全屏） T（缩略图） S（排序切换）
- 点击图片左右 30%/70% 区域
- 移动端触摸手势（> 50px 水平滑动）
- 缩略图条点击跳转
- 循环导航

### 5.5 主题
- 三模式：黑夜（默认）/ 白天 / 跟随系统
- `html[data-theme="dark"|"light"]` 驱动 CSS 变量
- 持久化到 localStorage（键名 `imgob-theme`）
- system 模式跟随 `prefers-color-scheme` 实时变化

### 5.6 全屏模式
- Fullscreen API：`document.documentElement.requestFullscreen()`
- 全屏下工具栏和缩略图条隐藏
- 底部浮动条（hover 显示）

### 5.7 内存管理
- `URL.createObjectURL()` 替代 base64
- `useImages.cleanup()` 在切换文件夹时 revoke 所有旧 URL

### 5.8 部署
- GitHub Pages 从 `docs/` 目录发布
- `vite.config.js` 中 `base: '/imgob/'` 仅 `NODE_ENV=production` 时生效
- 部署流程：`npm run build` → 复制 `dist/` 到 `docs/` → 推送

## 6. 边缘情况 & 容错（已实现）

| 场景 | 处理 |
|------|------|
| 空文件夹 | FolderSelector 显示提示 |
| 单张图片 | 隐藏缩略图条 |
| 损坏的图片文件 | `img.onerror` 捕获，显示错误占位符 |
| 不支持的格式 | 静默跳过 |
| 文件夹权限被拒 | 捕获异常，显示错误 + 重试按钮 |
| File System Access API 不可用 | 自动降级 webkitdirectory |
| 未选择文件夹 | ImageCanvas 隐藏（`v-if="count > 0"`） |

## 7. 不做的事项（明确排除）

- 单元测试 / E2E 测试
- 图片编辑功能
- 云端存储 / 上传
- URL 状态持久化
- 国际化（仅中文 UI）
- PWA / Service Worker
- 子目录递归扫描
