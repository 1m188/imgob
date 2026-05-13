# Architect Mode Rules (Non-Obvious Only)

- 应用是纯前端 SPA，无路由、无后端。所有数据在客户端，刷新即丢失。
- File System Access API 是首选文件夹选择方式，`<input webkitdirectory>` 是降级方案。二者返回的 `File` 对象结构相同但 `type` 可靠性不同（Firefox 常返回空）。
- 图片使用 `URL.createObjectURL()` blob URL，非 base64。任一新增功能涉及图片上传/保存时必须先转换为 Blob。
- 排序是"排序 + 重置 currentIndex 到 0"的复合操作。添加新排序模式时必须在 `sortImages()` 中执行 `currentIndex.value = 0`。
- 全屏模式通过 Fullscreen API 实现，使用 `document.documentElement` 而非特定元素。退出全屏由浏览器 `fullscreenchange` 事件检测。
- 拖拽排序（`ThumbnailStrip`）通过 splice 重排数组并设置为 `custom` 排序模式。此模式在切换文件夹时需重置为 `name`。
