# Executed verification

`npm run build` passes TypeScript checking and the Vite production build. Development server responds HTTP 200. Browser matrix was executed against production preview with installed Chrome, DPR=1. Source and local scroll tours warm intermediate sections before comparisons.

| Mode | Scroll checkpoints | Interaction and runtime checks |
|---|---:|---|
| desktop-1440 | 39 | initial, navigation, faqKeyboard, footerKeyboard, localAssets, noPageErrors, reverseScroll |
| desktop-1920 | 41 | initial, navigation, faqKeyboard, footerKeyboard, localAssets, noPageErrors, reverseScroll |
| reduced-1440 | 0 | nativeScroll, nativeDisclosure, noAnimationRuntime, noOverflow, noErrors |
| reduced-390 | 0 | nativeScroll, nativeDisclosure, noAnimationRuntime, noOverflow, noErrors |
| tablet | 35 | initial, navigation, faqKeyboard, footerKeyboard, localAssets, noPageErrors, reverseScroll |
| mobile | 34 | initial, navigation, faqKeyboard, footerKeyboard, mobileMenu, localAssets, noPageErrors, reverseScroll |

Normal mode: 149 forward checkpoints across four viewports. All recovered assets loaded without failed/HTTP-error requests; no external HTTP rendering dependencies and no uncaught page errors. FAQ Enter/Space, footer information tabs, source navigation destinations, return-to-top reverse scroll and mobile menu/Escape passed. Native reduced-motion FAQ controls, no scene runtime/canvas, no horizontal overflow and no errors passed at 1440px and 390px. Static mode was retested after correcting question extraction.

`node tests/browser/runtime.mjs` additionally tests desktop→phone→desktop resize and runtime destruction. It passes with no errors and zero remaining ScrollTriggers. An intermittent Three.js shader compilation/disposal race surfaced in the first supplemental run; that failure motivated the explicit disposal guard. A passing run after the guard is saved in `reference/local/runtime-results.json`.

Computed style comparison: 103 heading samples × 7 properties (font family, size, line-height, color, x, width, height), zero differences at all four viewports. This measures sampled headings only. Full homepage normalized text matches all 10,934 source characters (independent review).

Visual evidence: `reference/comparison/<viewport>/` contains side-by-side screenshots, hero overlay and amplified differences. Raw pixel metrics in `pixel-diff.json` include different ambient phases and in-progress reveals; they are not a fidelity percentage. `reference/local/<viewport>/footer-settled.png` is captured after an additional 3s dwell. Mobile menu/FAQ and footer tab states are saved individually. All captures were visually inspected through overview sheets, selected scene pairs and an independent review.

Clone UI passes: A sanity complete; B computed comparison complete (zero sampled differences); C four-view screenshot comparison complete with dynamic-phase caveat; D independent review complete, three verification defects corrected and closure reviewed; E drift/lessons report written.

Commands: `npm run test:browser` (preview must run), `node tests/browser/runtime.mjs`, optional recovery comparison `.codex-tools/venv/Scripts/python.exe tools/reconstruction/report_reconstruction.py`. Tests do not navigate away to submit forms or alter external systems. Cross-browser Safari/Firefox, physical devices, prolonged heap profiling and phase-synchronized pixel parity were not verified.
