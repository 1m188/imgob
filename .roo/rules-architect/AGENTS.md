# Architect Mode Rules (Non-Obvious Only)

- Single-file monolithic architecture: all HTML, CSS, and JS in `index.html`. Any new feature must stay within this single-file constraint unless explicitly directed otherwise.
- Canvas is the sole rendering surface. There is no DOM-based image display — all images are drawn to `<canvas>` via `ctx.drawImage()`.
- `#control` div occupies exactly 5% of viewport height; `canvas` fills the remaining 95% via `window.innerHeight * 0.95`. This hardcoded split is the only layout mechanism.
- No state management: `vec` (Image array) and `idx` (current index) are the only application state. No persistence, no URL state, no localStorage.
- File input accepts `multiple` — the app is designed for browsing multiple local images with left/right navigation.
- All data is transient and client-side. Closing or refreshing the page loses all loaded images.
