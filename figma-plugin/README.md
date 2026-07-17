# EazyPost Design System — Figma Generator

A one-shot Figma plugin that builds the design system from `../DESIGN_SYSTEM.md` as **real, editable Figma objects**: Color Styles, Text Styles, and reference frames for buttons, cards, inputs, and the radius scale — on a new page called "EazyPost — Design System".

This is not a hosted plugin — you run it locally, once, inside your own Figma file.

## Requirements

- **Figma desktop app** (plugin development requires local file access; the browser version doesn't support importing an unpublished manifest the same way).
- Any Figma file open (the plugin creates a new page inside whichever file is active — pick a file you're happy to add a page to, or create a fresh one).

## Steps

1. Open Figma desktop → open (or create) the file you want the design system page added to.
2. Menu (top-left icon) → **Plugins** → **Development** → **Import plugin from manifest...**
3. In the file picker, select `figma-plugin/manifest.json` from this repo.
4. Menu → **Plugins** → **Development** → **EazyPost Design System Generator** → click to run.
5. It runs in a few seconds with no UI, then closes itself with a confirmation message. A new page named **"EazyPost — Design System"** appears in your page list on the left — open it.

## What you get

- **Color Styles** registered under `EazyPost/Brand`, `EazyPost/Blue Variants`, `EazyPost/Ink`, `EazyPost/Neutrals`, `EazyPost/Utility` — pick them from the fill-color style picker on any shape, same as any other Figma style.
- **Text Styles** registered under `EazyPost/...` matching the type scale in the doc.
- Visual reference frames for the button variants, the four card shapes, the two input patterns + checkbox/radio, and the border-radius scale — all built with real Rubik/Rubik One text and the actual hex values, so designers can inspect, copy, or duplicate them directly.

## If fonts don't load

Figma auto-installs Google Fonts on demand, so **Rubik** and **Rubik One** should load automatically the first time the script runs (requires being online). If your Figma environment can't resolve them for any reason, the script falls back to **Inter** so it still completes rather than failing outright — if you see Inter instead of Rubik in the output, re-run the plugin after confirming Rubik/Rubik One are installed (Text tool → font picker → search "Rubik").

## Keeping it in sync

This script's token values (`COLORS`, `TYPE_SPECIMENS` at the top of `code.js`) are a hand-maintained mirror of `DESIGN_SYSTEM.md`. If the doc changes (a new color, a new type size), update `code.js` to match and re-run the plugin — it's safe to run repeatedly; each run creates a fresh page rather than overwriting the previous one, so old runs stay around until you delete them manually.
