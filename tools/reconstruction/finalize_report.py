"""Summarize executed checks, without inventing scores or performance guarantees."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
results=read('reference/local/browser-results.json')
normal=[r for r in results if 'performance' in r]
runtime=read('reference/local/runtime-results.json')
diff=read('reference/comparison/style-diff.json')
assert all(not r.get('fatal') and all(r['checks'].values()) for r in results)
assert runtime['passed']
docs=ROOT/'docs'
perf='# Performance observations\n\nMeasured in task-specific headless installed Google Chrome, DPR=1, local production preview, on Intel UHD Graphics through ANGLE/D3D11. No CPU/network throttling. These are 60-frame requestAnimationFrame interval samples at the settled hero, not a sustained benchmark or paint/FPS guarantee.\n\n| Viewport | Median interval | P95 interval | Initial resources | Initial transferred bytes |\n|---|---:|---:|---:|---:|\n'
for r in normal:
 p=r['performance'];perf+=f'| {r["viewport"]["width"]}×{r["viewport"]["height"]} | {p["rafMedianMs"]:.1f} ms | {p["rafP95Ms"]:.1f} ms | {p["resourceCount"]} | {p["transferBytes"]:,} |\n'
perf+='\nThe 1920px WebGL hero costs substantially more on this GPU than the phone configuration. A universal 60fps claim would be false. Water/globe fidelity retains original scene settings; GPU rasterization and concurrent machine load affect results. Additional production device profiling is needed before promising sustained frame rate.\n\nProduction application chunks: shell/React 221.67kB (69.48kB gzip), normal homepage 405.98kB (72.67kB gzip), static alternative 12.51kB (4.69kB gzip). Recovered GSAP/Three.js/runtime files are separate local static modules. Original image sequences initialize progressively; a 22.56MiB recovered directory is not the initial network payload. No external HTTP asset request was observed in any full tour.\n\nVite only scans the application entry, excluding skill demos and tooling. Application modes are lazy-loaded separately. Reduced motion loads no WebGL/canvas/GSAP scene runtime. Original frame cache/disposal logic is preserved. One Three.js compileAsync disposal race is guarded reproducibly; breakpoint resize and cleanup tests finish with zero ScrollTriggers and no uncaught error. This is functional cleanup evidence, not a long-running heap/GPU-memory leak certification. No GPU memory allocation total was available; no invented memory figure is reported.\n'
(docs/'07-performance-report.md').write_text(perf,encoding='utf-8')
test='# Executed verification\n\n`npm run build` passes TypeScript checking and the Vite production build. Development server responds HTTP 200. Browser matrix was executed against production preview with installed Chrome, DPR=1. Source and local scroll tours warm intermediate sections before comparisons.\n\n| Mode | Scroll checkpoints | Interaction and runtime checks |\n|---|---:|---|\n'
for r in results:
 test+=f'| {r["name"]} | {len(r.get("checkpoints",[]))} | '+', '.join(k for k,v in r['checks'].items() if v)+' |\n'
test+='\nNormal mode: 149 forward checkpoints across four viewports. All recovered assets loaded without failed/HTTP-error requests; no external HTTP rendering dependencies and no uncaught page errors. FAQ Enter/Space, footer information tabs, source navigation destinations, return-to-top reverse scroll and mobile menu/Escape passed. Native reduced-motion FAQ controls, no scene runtime/canvas, no horizontal overflow and no errors passed at 1440px and 390px. Static mode was retested after correcting question extraction.\n\n`node tests/browser/runtime.mjs` additionally tests desktop→phone→desktop resize and runtime destruction. It passes with no errors and zero remaining ScrollTriggers. An intermittent Three.js shader compilation/disposal race surfaced in the first supplemental run; that failure motivated the explicit disposal guard. A passing run after the guard is saved in `reference/local/runtime-results.json`.\n\nComputed style comparison: '+str(sum(x['sourceHeadingCount'] for x in diff))+' heading samples × 7 properties (font family, size, line-height, color, x, width, height), zero differences at all four viewports. This measures sampled headings only. Full homepage normalized text matches all 10,934 source characters (independent review).\n\nVisual evidence: `reference/comparison/<viewport>/` contains side-by-side screenshots, hero overlay and amplified differences. Raw pixel metrics in `pixel-diff.json` include different ambient phases and in-progress reveals; they are not a fidelity percentage. `reference/local/<viewport>/footer-settled.png` is captured after an additional 3s dwell. Mobile menu/FAQ and footer tab states are saved individually. All captures were visually inspected through overview sheets, selected scene pairs and an independent review.\n\nClone UI passes: A sanity complete; B computed comparison complete (zero sampled differences); C four-view screenshot comparison complete with dynamic-phase caveat; D independent review complete, three verification defects corrected and closure reviewed; E drift/lessons report written.\n\nCommands: `npm run test:browser` (preview must run), `node tests/browser/runtime.mjs`, optional recovery comparison `.codex-tools/venv/Scripts/python.exe tools/reconstruction/report_reconstruction.py`. Tests do not navigate away to submit forms or alter external systems. Cross-browser Safari/Firefox, physical devices, prolonged heap profiling and phase-synchronized pixel parity were not verified.\n'
(docs/'08-test-results.md').write_text(test,encoding='utf-8')
status='''# Reconstruction status

The homepage is implemented locally in React, TypeScript and Vite with named section components, shared components, runtime/hooks, styles, data, original assets, tests and evidence directories. Development: `npm run dev` → http://127.0.0.1:5173. Production: `npm run build`, then `npm run preview` → http://127.0.0.1:4173.

Implemented: original header/menu/preloader, globe hero, company story and counters, extended crane/container/truck freight journey, reliability copy, ship/ocean and airplane/cloud transition, advantages, testimonials, partner marks, original insights, eight FAQ questions, final contact CTA and footer with information tabs/particle lettering. The original procedural WebGL and AVIF sequences are used. No replacement 3D models or AI-generated visuals were invented.

Recovered: 811 of 812 discovered resources, including original five font files, images, sequences, videos, SVGs, globe data, water textures, CSS and compiled runtime modules. One unused Webflow placeholder SVG returned 403. The manifest records exact URLs, local paths, original hashes, sizes, dimensions and authorization. Original unmodified code/style archives are retained separately. Runtime localizations and the narrowly scoped Three.js cleanup guard are recorded and reproducible.

Verified: production build, all four responsive browser tours (149 checkpoints), zero asset failures and uncaught page errors, original link destinations, FAQ and footer keyboard interactions, phone menu/Escape, reverse scrolling, two reduced-motion sizes, breakpoint resize and runtime cleanup. 103 heading probes across four viewports match all seven compared properties exactly. An independent reviewer found no further actionable static design drift after the capture fixes. See 08-test-results.md and 10-independent-review.md for evidence and limits.

Remaining differences and limitations:

- Independently started globe routes, ocean waves, particle lettering and rotating news ticker have different time phases. Source hero captures can contain unfinished CTA reveals; local settled controls are visible. Strict pixel-level parity is not claimed.
- The original authoring repository and source maps were unavailable. This is an editable React reconstruction around recovered compiled production modules and reviewed structural data. It is not a claim to have recovered the original development source.
- Reduced-motion preference intentionally selects a static layout using original content and imagery. It bypasses pinning, preloading and all scene animation; reload after changing that preference.
- News cards reflect the recovery snapshot. Other site pages, external portals, social links, and contact destinations remain original remote links. This homepage does not implement those sites or backend services. Analytics and unused commerce execution are excluded.
- Desktop WebGL on this Intel GPU has measurable frame cost, particularly at 1920px. Sustained 60fps, physical-device coverage, Safari/Firefox behavior and long-duration heap/GPU-memory stability are not certified.
- No deployment, external publication or Git commit was performed. Raw source/captures and tooling are excluded from the production bundle. Keep ignored reference archives with this local recovery if future regeneration is needed.

Files: README.md explains the complete structure and commands; docs/00–10 cover the audit, sections, animation storyboard, asset/scene maps, defects, architecture, performance, tests, status and independent review. reference/asset-manifest.json remains eligible for version control while large captures/archives stay ignored.
'''
(docs/'09-reconstruction-status.md').write_text(status,encoding='utf-8')
clone=ROOT/'.clone-ui';clone.mkdir(exist_ok=True)
(clone/'lessons.md').write_text('''# Reconstruction lessons

- Observe the actual scroll owner before testing page height. This source uses `.body-inner` on phones; document height produced a false loader failure.
- Separate transient animation frames from settled design comparisons. A 450ms stop can show blue/masked footer text; retain separate ≥3s dwell captures.
- Playwright Node timeout options belong in the third waitForFunction argument. A second-argument options object silently becomes page input.
- Preserve original animation module identities and reviewed SVG/layout hooks when authorized production source is recoverable; guessed scene coordinates would reduce fidelity.
- Exercise breakpoint resize and disposal separately from happy-path scroll. Three.js asynchronous shader polling can race disposal; drop disposed program entries while retaining live-program behavior.
- Verify native wheel scrolling as well as programmatic keyboard scrolling. A conditional lazy import lost the static view CSS dependency; explicit imports restore CSS loading and the original loader scroll lock must be reset.
- Scope the dev dependency scan in workspaces containing skill/demo HTML. Unrelated tooling files can otherwise delay or break application startup.
''',encoding='utf-8')
print('Wrote measured performance, tests, status and verification lessons.')
