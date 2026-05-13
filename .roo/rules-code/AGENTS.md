# Code Mode Rules (Non-Obvious Only)

- Canvas height (`window.innerHeight * 0.95`) is tightly coupled to CSS `#control { height: 5% }`. Never change one without adjusting the other.
- Images load asynchronously via `FileReader.readAsDataURL()` — only `vec[0]` gets an `onload` handler. Adding handlers to other indices requires explicit `onload` assignments.
- `idx` starts at `-1` and is only set to `0` on new file input. Button clicks check `vec.length == 0` before operating; do not rely on `idx` validity alone.
- `left_btn` and `right_btn` use different wrapping logic (`--idx` with manual wrap vs `(idx + 1) % vec.length`). Keep this asymmetry when adding navigation features.
- DOM access uses `getElementsByTagName` / `getElementById` exclusively. Do not introduce `querySelector`.
- Element IDs follow `snake_case` (e.g., `left_btn`). New IDs should follow this convention.
