# WOW verification results

## Public Netlify deployment

Production is live at https://wow-shipping.netlify.app/. All four pages return HTTP 200 with metadata pointing to that origin; required cloud, social and animation assets return their correct content types. Removed routes return 404, Services redirects correctly, and the deployed tracking function returns validated JSON with the explicit unconfigured-provider fallback. Public Chrome tests pass eight page/viewport combinations (1440 and 390px), two reduced-motion cases, full Home forward/reverse journeys, mobile navigation, FAQ, tracking response states and WhatsApp draft preparation. No page errors, failed required assets or unexpected external asset dependencies were observed. Evidence: `reference/wow/deployment/http.json` and `browser.json`.

## Animated inner pages and sea-to-air clouds

The current production build passes TypeScript and Vite, and all nine tracking/enquiry unit tests pass. `node tests/browser/inner-stories.mjs` passes 18 page/viewport combinations (About, Tracking, Contact at 390, 768, 870, 1440, 1531 and 1920px), plus all three pages with reduced motion. Checks cover forward/reverse chapter activation, direct chapter navigation, loaded original media, viewport resizing, tracking support fallback, status-guide pointer/keyboard navigation, synchronized service choices, live origin/destination previews and encoded WhatsApp drafts. No uncaught page errors or failed required assets were observed. Browser tests intercept WhatsApp opening and send no messages.

The first run exposed stale Contact scroll boundaries after a draft expanded. A scoped ResizeObserver now refreshes ScrollTrigger measurements when main content changes height; the full 21-case rerun passes. Evidence and screenshots: `reference/wow/inner-pages/results.json` and adjacent PNGs.

Final supplemental checks also pass: direct phone access to the enquiry form below the fixed header, brief completion using the same phone validation as submission, native wheel scrolling, live reduced-motion switching and valid tab/panel accessibility relationships. Evidence: `reference/wow/inner-pages/runtime.json`; status-guide section captures are stored alongside it.

`node tests/browser/cloud-transition.mjs` passes at 390×844, 870×668 and 1440×900. Six checkpoints per size show cloud cover arriving before the section boundary, opening to reveal the aircraft, and clearing completely. Reverse scrolling restores cloud cover. Measured aircraft translation remains nose-first. Overflow, media loading and page-error checks pass. Evidence: `reference/wow/inner-pages/clouds/results.json` and its screenshots. The existing cloud asset supplies both transition banks; transport geometry, ocean quality and source media remain unchanged.

## Latest four-comment revision

The blue route overlay is removed from the service journey, flight scene and footer. The aircraft now travels nose-first with fixed rotation and scale; the original footer scatter/reassembly physics uses WOW lettering; a subtle dotted world map sits behind footer information. Production build and all nine unit tests pass after these changes.

Targeted browser verification passes at 390×844, 870×668 and 1440×900. Measured aircraft translation increases monotonically with forward scroll and returns to its original position on reverse; rotation and scale stay constant. Pointer and keyboard scatter, map loading, readable links, overflow checks and standalone About footer normal/reduced-motion cases pass without page errors. Screenshots and measurements: `reference/wow/revisions/results.json` and adjacent PNG files.

The final follow-up checks pass after the independent review's focus-outline correction: computed focus is a visible 2px solid cobalt outline, desktop-to-phone resize stays within the viewport, and switching reduced motion live removes and restores the particle canvas correctly. Evidence: `reference/wow/revisions/footer-final.json`. The broader matrix below records the earlier full-site baseline; this revision reran the affected scenes and footer rather than repeating every unchanged page.

## Earlier full-site baseline

Production build and TypeScript checking pass. Nine focused unit tests pass. The four-page matrix passes at six viewport sizes, with two additional reduced-motion checks. All original transport/media inputs below were verified by original SHA-256.

| Width × height | Pages checked | Story checkpoints | Outcome |
|---|---:|---:|---|
| 1440×900 | 4 | 35 | Pass |
| 1920×1080 | 4 | 34 | Pass |
| 768×1024 | 4 | 31 | Pass |
| 390×844 | 4 | 27 | Pass |
| 870×668 | 4 | 36 | Pass |
| 1531×668 | 4 | 38 | Pass |

Total: 24 route/viewport combinations, 2 reduced-motion modes and 201 forward story checkpoints, plus reverse-to-hero checks. Direct page loads, horizontal desktop navigation, phone/tablet menu and Escape/focus restoration, source-identity removal, two short reviews, twelve courier entries, six native FAQs, real unconfigured tracking responses and prepared WhatsApp drafts pass. No uncaught page errors, failed required assets or external HTTP asset dependencies were observed in the matrix.

The final aircraft retiming was verified separately at all six widths, with three captures per width and loaded, visible aircraft at every sampled position. It keeps the original high-quality media while removing the old empty testimonial-linked hold. These final flight captures are under `reference/wow/flight/`. Other matrix screenshots are under `reference/wow/browser/`.

Supplemental runtime checks pass: initial Services hash anchor waits for readiness, desktop→phone→desktop resize, zero remaining ScrollTriggers after destruction, whitespace/punctuation rejection in the enquiry form and HTTP 404 for removed legacy routes. Evidence: `reference/wow/runtime/results.json`. Tracking tests distinguish configuration, validation, loading, success, not-found, carrier-required, timeout and unavailable states. Provider/result fixtures exist only in tests. No external messages were sent.

Asset verification: 790 original media/font/video/SVG resources match their original hashes. No generated replacements were needed. New identity assets are recorded in asset-verification.json.

## Independent review

Four findings were corrected: lower-phone-hero contrast, muted small-text contrast, contact whitespace/phone validation and clipped mobile footer lettering. The reviewer inspected the corrected screenshots and closed those findings. A raster social card now uses an absolute HTTPS metadata URL. See independent-review.md. The copy was revised after user feedback to “Shipping. Made simple.”; the geography-led slogans were removed.

## Performance observations

Local production preview, installed headless Chrome, DPR=1, same Intel/ANGLE machine as the original audit. Values below are 45 requestAnimationFrame interval samples after a complete tour and return to the hero. Transfer totals include the warmed tour, not just first load. These are observations, not sustained FPS/device guarantees.

| Width | Median interval | P95 interval | Tour transferred bytes |
|---|---:|---:|---:|
| 1440 | 17.0ms | 33.7ms | 6,935,394 |
| 1920 | 25.1ms | 58.4ms | 7,000,075 |
| 768 | 16.4ms | 24.9ms | 6,396,010 |
| 390 | 8.4ms | 16.6ms | 2,578,710 |
| 870 | 8.4ms | 16.7ms | 6,226,873 |
| 1531 | 16.5ms | 32.8ms | 6,950,823 |

The 1920px WebGL scene remains more expensive on this GPU. Physical-device Safari/Firefox coverage, prolonged heap/GPU-memory profiling and a universal 60fps target are not certified. Ambient water/globe phases differ between captures.

## Remaining integration prerequisites

Live tracking still requires a selected provider and its server-only adapter/credentials. The current endpoint deliberately returns NOT_CONFIGURED and offers personal support. Netlify now supplies the server-function binding and platform rate limiting; the local preview middleware retains its process-local limit. Contact intentionally opens a WhatsApp draft rather than storing/submitting an enquiry. The website has been published to the authorized Netlify account.
