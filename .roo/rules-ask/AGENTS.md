# Ask Mode Rules (Non-Obvious Only)

- Vue 3 + Vite 项目，`src/` 为源码目录。入口 `index.html` 在项目根目录，Vite 自动注入 `<script type="module">`。
- 状态管理不使用 Pinia，全部通过 composable（`useImages`、`useFolderPicker`、`useKeyboard`、`useTheme`）在 `App.vue` 中调用。
- 组件间通信：父→子 props，子→父 emits。无跨层级事件总线。
- 文件顶部必须有 JSDoc 块注释说明用途和边缘情况——这是代码规范要求，不是可选项。
- 主题系统支持三模式：dark（默认）/ light / system（跟随操作系统）。持久化键名 `imgob-theme`。CSS 变量结构见 `src/assets/main.css`。
- `useImages.SORT_MODES` 导出 `['name', 'time', 'size']`（不含 `custom`）。`custom` 模式仅为内部使用，由拖拽排序触发，不暴露在 UI 中。
- 项目结构说明见 `PLAN.md` §3 及 `src/` 目录。
- GitHub Pages 部署：`docs/` 目录是发布源（Repository Settings → Pages → Source: Deploy from a branch → Folder: /docs）。
