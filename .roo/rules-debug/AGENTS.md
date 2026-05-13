# Debug Mode Rules (Non-Obvious Only)

- `npm run dev` 启动 Vite 开发服务器在 `localhost:5173`。File System Access API 需要 localhost（不是 `file://` 或 `0.0.0.0`）。
- Blob URL 内存泄漏：`useImages.cleanup()` 在 `loadFiles()` 入口处调用。切换文件夹后浏览器内存飙升 → 检查 cleanup 是否被正确调用。
- 图片不显示但 loading 状态正确：检查 CSS — `.image-canvas__img` 使用 `position: absolute; inset: 0; width: 100%; height: 100%`。如果父容器 `.image-canvas` 没有 `height`，图片会是 0 像素。确认 `#app` 和 `body/html` 的 `height: 100%` 链完整，且 `main.css` 已被导入。
- 全屏模式工具栏可见性：`.app__fullscreen-bar` 默认 `opacity: 0`，hover 才 `opacity: 1`。这是设计如此，不是 bug。
- 主题在 system 模式下不跟随系统变化：`useTheme.js` 通过 `matchMedia('(prefers-color-scheme: light)')` 监听。检查是否在 `onMounted` 中注册了 `change` 事件监听器。
- 拖拽文件夹后图片不加载：`FolderSelector.handleDrop` 使用 `webkitGetAsEntry()` 异步读取，有 ~200ms 延迟。Firefox 中拖拽的 `File` 可能缺少 `type` 属性 → `useFolderPicker` 在末尾用扩展名二次过滤。
