# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
- Single-file vanilla HTML/JS app (`index.html`) — a local image viewer using Canvas.
- No build system, package manager, tests, or linter. Open `index.html` directly in browser.

## Key Patterns (Non-Obvious)
- Canvas height is `window.innerHeight * 0.95`, coupled to `#control` being exactly `height: 5%` in CSS. Changing one requires updating the other.
- Images load via `FileReader.readAsDataURL()` — all images become base64 data URLs in memory, which can be memory-intensive for large/high-res images.
- Only `vec[0]` gets an `onload` handler for the initial draw. If vec[0] loads before others, subsequent manual navigation may show blank images until those images finish loading asynchronously.
- `left_btn` and `right_btn` use asymmetric index wrapping: `--idx` with manual wrap vs. `(idx + 1) % vec.length`.

## Code Style
- Inline CSS in `<style>` block, inline JS in `<script>` block. No modules, no external files.
- DOM elements accessed via `getElementsByTagName`/`getElementById` (no querySelector).
- Hungarian-like naming: `left_btn`, `right_btn` (snake_case for element IDs).
