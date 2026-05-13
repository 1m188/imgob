# Debug Mode Rules (Non-Obvious Only)

- No build tools, dev server, or source maps. Debug in browser DevTools by opening `index.html` directly.
- `vec[i].src` is set asynchronously inside `FileReader.onload`. If an image doesn't render, the base64 data URL may still be loading — check `vec[i].complete` and `vec[i].naturalWidth`.
- Canvas blank on navigation: `vec[0].onload` only handles the initial draw. Images loaded after vec[0] will render blank until their `onload` fires asynchronously. Wait for all images or add per-image `onload` handlers.
- Memory usage: all selected images are stored as base64 data URLs in memory. Large/high-resolution files will consume significant RAM with no cleanup mechanism. The `vec` array is never cleared between selections (overwritten, but old URLs may linger via closures).
- `overflow: hidden hidden` on `body, html` suppresses scrollbars — canvas content outside viewport is invisible with no scroll access.
