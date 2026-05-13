# Debug Mode Rules (Non-Obvious Only)

- `npm run dev` starts the Vite dev server on `localhost:5173`. File System Access API requires localhost (not `file://` or `0.0.0.0`).
- Blob URL 内存泄漏排查：检查 `useImages.loadFiles()` 是否在调用前调用了 `cleanup()`。每次切换文件夹必须 revoke 所有旧 URL。
- 图片加载失败但不显示错误：检查 `ImageCanvas.vue` 的 `loadingState` 过渡，`v-show` 只在 `loaded` 状态下显示 `<img>`。
- 全屏模式下工具栏不可见属于正常行为（opacity:0 在非 hover 状态）。检查 `.app__fullscreen-bar:hover` 规则。
- 拖拽文件夹后图片不加载：`handleFilesDropped` 依赖 `webkitGetAsEntry` 且异步读取需 ~200ms 延迟。firefox 中拖拽的 `File` 对象可能缺少 `type` 属性。
