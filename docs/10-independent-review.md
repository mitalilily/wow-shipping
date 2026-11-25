# Independent reconstruction review

Reviewed the recovered source, React section trees, source captures and local desktop captures independently of implementation. This review does not certify pixel-level parity.

## Findings

1. **Mobile verification used the wrong scroll owner.** The recovered Lenis module selects `.body-inner` as wrapper and `.main` as content at widths at or below 767px (`public/assets/recovered/chunks/lenis-_dxIi_hK.js:1`). The document can correctly remain one viewport tall while that wrapper contains the full page. `tools/reconstruction/capture_reference.py` and the initial browser test waited for document height to grow, producing an incomplete mobile capture and a false loader failure. Read and scroll the actual wrapper; compare wrapper-relative offsets. This is a verification defect, not evidence that the responsive reconstruction is broken.

2. **Scroll snapshots can capture time-based reveals before completion.** Local `scroll-038-27328.png` showed partly masked, blue footer text while the source image had settled black text. The same layout and content are present, and the recovered module animates their masks and colors. Dwell for at least 2–3 seconds before judging settled footer and CTA typography. The 450ms tour is useful for motion, but cannot alone establish static parity.

3. **Playwright timeout options were passed as the evaluation argument.** Initial `tests/browser/homepage.mjs` used `waitForFunction(fn, {timeout: 90000})`; the Node API expects `waitForFunction(fn, null, {timeout: 90000})`. The intended extended timeout therefore was not applied. This affects confidence in slow-device/mobile verification, not production rendering.

## Evidence and scope

- All 26 visible desktop heading probes match source font family, font size, line height, color, x position, width and height exactly in the recorded 1440×900 initial state.
- Normalized homepage text from the recovered React trees matches the original main container exactly: 10,934 characters. No invented homepage text was found.
- Independently viewed side-by-side captures at offsets 0, 2880, 5760, 8640, 11520, 14400, 17280 and 20160, then the main agent's remaining desktop captures through 27328. Crane, truck, ship, clouds, testimonials, partner grids, insights and FAQ geometry/assets closely align. Dynamic globe/ocean phases differ, and time-based text reveals require settled captures.
- No production runtime errors occurred in the independent partial tour. The complete browser matrix and keyboard/reduced-motion changes remain the main agent's verification responsibility.

No confirmed static design substitution or invented content was found in this scope. The initial one-viewport mobile capture was insufficient; see the corrected verification below.

## Closure after corrected verification

The main agent corrected the mobile scroll owner, timeout arguments and settled-state captures. Its complete four-viewport tours contain 149 checkpoints (39 + 41 + 35 + 34), with the mobile wrapper measuring 22,950px. `reference/comparison/style-diff.json` records zero differences across seven measured heading properties at all four viewports (26/26/25/26 headings respectively). This is computed-style evidence, not a whole-page pixel equality claim.

Independently inspected the corrected mobile source/local menu and open FAQ images, the truck/reliability section around offset 6750, the ocean/ship view around 13500, and the settled mobile and desktop footers. Original assets, type hierarchy, wrapping, section composition and mobile menu geometry closely align. Local FAQ focus has the intentionally added visible keyboard outline. The FAQ captures use different vertical offsets; their differing top position/header color does not establish a layout regression. Mobile scroll checkpoints differ by a few pixels because the two capture scripts round their increments differently.

The previously blue/masked local footer text settles to readable black text. Its particle wordmark and marquee continue through their original time-based phases, so the source snapshot and settled local snapshot differ dynamically. The source menu/hero capture also contains unfinished text/CTA reveals while the local image is settled. These phase differences remain outside any strict pixel-parity claim.

No further actionable visual drift was found in these corrected captures. Browser keyboard checks and the deliberately separate native-scroll reduced-motion view have their own main-agent test results; this review did not launch another browser or certify a physical mobile device.
