# Ask Mode Rules (Non-Obvious Only)

- This is a single-file vanilla HTML/JS project (`index.html`). There are no modules, no external dependencies, no build system.
- All application logic is in a single `<script>` block at the bottom of `index.html`. There are no other source files.
- `README.md` is in Chinese and minimal. `index.html` is the canonical reference for understanding the app.
- The project has no documentation beyond `README.md` and `LICENSE`.
- Images are loaded via `FileReader.readAsDataURL()` — all data is client-side only, no server or persistence.
