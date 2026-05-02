# Notes for AI agents (Claude Code, Codex, etc.)

This is a **Chrome MV3 extension, plain JavaScript, no build step**. The folder
`element-pointer-ext/` is what Chrome loads via "Load unpacked" — its contents
ship as-is. Treat that folder as the source of truth and the artifact at the same
time.

## Architecture in one paragraph

`background.js` is a tiny service worker. Its only job: when the user clicks the
toolbar icon (`chrome.action.onClicked`), it injects `content.js` into the active
tab using `chrome.scripting.executeScript({ files: ["content.js"], world: "MAIN" })`.
Everything else — the bottom bar, the element highlighter, the four-piece dim
overlay, the React fiber walker, the selector builder, the clipboard copy, the
mic recorder, the Deepgram call, the merge-transcript logic — lives in
`content.js` as a single IIFE that toggles `window.__elementPointerActive` so a
second toolbar click tears down the previous instance.

## Constraints — do not casually break these

- **No build step, no bundler, no npm.** `content.js` is loaded directly. Do not
  introduce `import`/`export`, TypeScript, JSX, or anything that needs compilation.
  If you genuinely need to split files, propose it first — splitting requires
  multiple `executeScript` calls or a bundler, both of which change the project
  shape.
- **MAIN world matters.** `content.js` runs in the page's JS world (not an
  isolated content-script world). That's why it can read React fibers off DOM
  nodes (`__reactFiber$…` keys are only on the page's React, not the extension's).
  Keep it that way; do not move logic into the isolated world.
- **Single IIFE, idempotent toggle.** The script must remain safe to inject
  twice. The `window.__elementPointerActive` / `__elementPointerTeardown` pattern
  at the top is load-bearing — when the user clicks the icon a second time, the
  previous run tears itself down before the new one starts.
- **All UI elements use the `__ep-` class prefix** and are filtered out by
  `isOurs(el)`. Any new DOM you add to the page must follow the same convention,
  or hover/click handlers will treat the extension's own UI as page content.
- **All UI must call `blockEvents(el)`** (defined in `content.js`). Page modals
  often close on outside-click; without `stopImmediatePropagation` on capture,
  clicking the bar would dismiss them. There's a comment in the code about this —
  don't strip it out.
- **Z-indexes are tuned.** The four tints sit at `2147483640`, highlight at
  `…641`, label at `…643`, bar at `…645`, toast/settings at `…646`. Pick something
  in this range for new UI; lower than `…640` and the page can cover you.

## How to test changes

1. Edit a file under `element-pointer-ext/`.
2. Tell the user to hit the **reload** icon on the extension's card at
   `chrome://extensions` (you cannot do this for them).
3. Ask them to test on a page that has React (e.g. a Next.js app — that's the
   intended target; the React-fiber walker only does anything useful there).
4. Have them open DevTools and watch the page console for the content-script
   logs / errors. The service worker logs are at `chrome://extensions` → the
   extension card → "service worker" link.

There are no automated tests. There is no linter. There is no formatter. Match
the existing style: 2-space indent, double quotes, terse one-line statements
inside the inlined CSS template, semicolons, no trailing commas in JS object
literals where the existing code omits them.

## When asked to add a feature

- If it's a new piece of bar UI: add a `__ep-…` element, append it to `bar` in
  the right slot, call `blockEvents` if it accepts pointer events, wire its
  handler.
- If it's a new way to describe the picked element: extend `buildElementPath`.
  The current output is plain text inside a `"""` fence — keep that shape; the
  whole point is that LLMs paste this directly.
- If it's a new transcription provider: add it alongside the Deepgram block in
  `transcribe()`, keep the API key in `localStorage` under a new namespaced key
  (current uses `ep_deepgram_key`, `ep_language`).

## When asked to change the manifest

`manifest.json` is MV3. Permissions currently: `activeTab`, `scripting`,
`clipboardWrite`. Adding host permissions, `tabs`, `storage`, etc., is fine but
note that the extension intentionally avoids `chrome.storage` — settings live in
the page's `localStorage` so each site has its own key/language. If you switch
to `chrome.storage`, the migration matters; ask the user first.

## What this extension is for (motivation)

The user is on a Mac, uses Codex / Claude Code to edit web apps, and wants a
fast way to say "fix *this* element." Selecting the element by hand and pasting
a CSS selector is awkward; this extension turns one click into a paste-ready
prompt fragment with the React component name, the surrounding context, and the
visible text. Record mode is the same idea over a longer session: speak the
intent, click the affected elements, get back one transcript that an LLM can act
on.

Keep that user story in mind when proposing changes — anything that adds clicks
or asks the user to confirm something is working against it.
