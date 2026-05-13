# Ask Mode Rules (Non-Obvious Only)

- Vue 3 + Vite 项目，`src/` 为源码目录。入口 `index.html` 在项目根目录，Vite 自动注入 `<script type="module">`。
- 状态管理不使用 Pinia，全部通过 composable（`useImages`、`useFolderPicker`、`useKeyboard`）在 `App.vue` 中调用。
- 组件间通信：父→子 props，子→父 emits。无跨层级事件总线。
- 文件顶部必须有 JSDoc 块注释说明用途和边缘情况——这是代码规范要求，不是可选项。
- 原版单文件 `index-old.html` 已被归档。当前项目结构见 `PLAN.md` 第 3 节。
