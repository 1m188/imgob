# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
- Vue 3 + Vite 工程（Composition API + `<script setup>`），本地图片浏览应用。
- 无测试框架、无 Pinia（状态由 composable 管理）、无路由器。

## Commands
- `npm run dev` — Vite 开发服务器（`localhost:5173`），需要 localhost 才能使用 File System Access API。
- `npm run build` — 生产构建至 `dist/`，产物是纯静态文件。
- `npm run preview` — 预览生产构建（推荐测试，因 `file://` 不支持 FSA API）。

## Architecture (Non-Obvious)
- 状态流：`useFolderPicker` → `useImages.loadFiles()` → `App.vue` props 向下分发 → 子组件 emit 向上。
- `useImages` 管理所有排序/导航状态。`useKeyboard` 只负责事件绑定，不持有状态。
- FolderSelector 包含两种模式：初始模式（未选择）和紧凑模式（已选择），由 `hasSelection` prop 控制。
- 全屏由 Fullscreen API + `fullscreenchange` 事件驱动，不与 Vue reactivity 系统耦合。
- 拖拽文件夹使用 `DataTransferItem.webkitGetAsEntry()` 递归读取条目树，不依赖 showDirectoryPicker。
- 主题通过 `useTheme.js` 管理，`html[data-theme="dark"|"light"]` 驱动 CSS 变量切换，持久化到 localStorage。

## Code Style
- Vue SFC：`<script setup>` + `<style scoped>`。无需 Options API。
- 文件顶部必须包含 JSDoc 块注释说明目的和边缘情况。
- 组件命名 PascalCase，composable 命名 useXxx，文件命名对应。
- CSS 变量统一在 `src/assets/main.css` 定义，组件内引用，不硬编码颜色值。
- 图片加载使用 `URL.createObjectURL()`（blob URL）而非 base64，切换文件夹时必须 revoke。
