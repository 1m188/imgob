# Code Mode Rules (Non-Obvious Only)

- 图片使用 `position: absolute; inset: 0; width: 100%; height: 100%` 填满父容器，由 `object-fit: contain` 负责缩放居中。不要用 flex 或 transform 居中，flex 中 `max-height: 100%` 会解析为图片自身高度导致溢出。
- Blob URL 生命周期：`useImages.loadFiles()` 内部先调 `cleanup()` revoke 所有旧 URL，再创建新 URL。如果新增创建 blob URL 的路径，必须在不再使用时调用 `URL.revokeObjectURL()`。
- 主题 CSS 变量通过 `html[data-theme="dark"|"light"]` 切换。添加新颜色必须同时在 `:root`（dark）和 `html[data-theme='light']` 两处定义，且使用 `var(--color-xxx)` 引用而非硬编码。
- `SORT_MODES` 导出数组不含 `custom`（仅 `['name', 'time', 'size']`），`custom` 模式仅由拖拽排序触发。Toolbar 通过 `v-for="mode in SORT_MODES"` 渲染按钮，不要把 `custom` 加回去。
- `showDirectoryPicker({ mode: 'read' })` — 正确的枚举值是 `'read'`，不是 `'readonly'`。
- ImageCanvas 的导航箭头使用内嵌 SVG（38×38 viewBox），圆圈 40×40 `border-radius: 50%`。不要改用文本字符（字体基线偏移导致不居中）。
- 未选择文件夹时 ImageCanvas 不可见（`v-if="count > 0"`），防止与 FolderSelector 重叠。
- `eslint.config.js` 不存在 — 项目未配置 ESLint，不要引用。
