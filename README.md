# Element Pointer

Chrome extension. Click any element on a page → copies a structured description of it
to your clipboard, formatted as context for an LLM. Optional record mode also captures
mic audio + clicks and produces a timestamped transcript via Deepgram.

The loadable extension lives in [`element-pointer-ext/`](./element-pointer-ext). Point
Chrome's "Load unpacked" at that folder.

## Install (load unpacked)

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked** and select the `element-pointer-ext/` folder in this repo.
4. Pin the extension from the puzzle-piece menu so the toolbar icon is visible.

After editing any file in `element-pointer-ext/`, hit the **reload** icon on the
extension's card in `chrome://extensions` to pick up changes. (You don't need to
re-load-unpacked.)

## Use

1. Open any page.
2. Click the **Element Pointer** toolbar icon → a dark bar appears at the bottom.
3. **Hover** any element to preview the selector.
4. **Click** to copy a `## User pointed at this element` block to your clipboard.
5. **↑ / ↓** walks the DOM up to parent / down to first child.
6. **Esc** exits.

The copied block includes: page path, viewport position, React component name (when
detectable), short CSS selector, sibling context ("3 of 6 Cards in a 3-col grid"),
visible text, tag, and pixel size. Designed to paste straight into a Claude / GPT
prompt as "this is the element I'm referring to."

## Record mode (Deepgram)

Click the red dot in the bar to start recording. Speak while clicking elements;
each click is logged with a timestamp. Click the stop square to send the audio to
Deepgram and get a merged transcript like:

```
[00:00] So this card here looks broken
  → [clicked at 00:03]:
  ## User pointed at this element
  ...
[00:06] and the spacing is wrong on this one too
  → [clicked at 00:09]:
  ...
```

Set your Deepgram API key via the gear icon in the bar. Key + language preference
are stored in `localStorage` for the page's origin (per-site).

## Files

```
element-pointer-ext/
├── manifest.json   # MV3 manifest
├── background.js   # Service worker — injects content.js when toolbar icon clicked
├── content.js      # The whole UI + DOM picker + recorder, single-file
├── icon32.png
└── icon128.png
```

See [`CLAUDE.md`](./CLAUDE.md) for the architecture notes / editing conventions
agents (Claude Code, Codex) should follow when modifying this code.
