# Recovery architecture

Use React + TypeScript + Vite. Preserve the recovered homepage's real section structure and CSS rather than designing replacements.

1. Capture all four requested viewports, controlled forward/reverse scroll states, actual menu/FAQ behavior and computed layout values. Save reference observations before application initialization.
2. Recover all identified assets and record original URL, type, byte size, SHA-256, dimensions and local path. Preserve unmodified code/style bytes separately before localization.
3. Convert reviewed homepage section trees into React data, with named components for navigation, preloader, hero, introduction, freight journey, advantages, testimonials, partners, insights, FAQ, CTA and footer. Preserve original inline SVG geometry; remove executable inline scripts, tracking integrations, debug UI and unused commerce markup.
4. Localize the reviewed production animation modules and their exact vendor modules. Reuse the original GSAP timelines, frame lists and procedural WebGL renderers, avoiding invented animation coordinates or duplicate GSAP/Three.js copies. The owner's original deployment-domain guard gains only loopback development hosts. Ocean and globe data/texture URLs point to recovered local assets.
5. Mount the original motion runtime once after React commits the section trees and fonts are ready. Expose a small test/lifecycle bridge for scroll positioning, readiness, cleanup and inspection. Preserve the original resource-aware preloader.
6. Keep non-homepage navigation at original public destinations; do not turn unimplemented routes into copies of the homepage. Add keyboard equivalents for source FAQ and footer information controls. Provide a readable native-scroll reduced-motion view using extracted original text and static imagery, without loading the scene runtime.
7. Run development and production builds. Capture implementation at the same four viewport dimensions, compare computed typography/geometry and phase-aligned checkpoints, test interactions, reverse scroll, asset loading and errors. Run an independent Clone UI review after implementation.

This is source recovery with a React shell and reviewed local adaptations. It does not claim to reconstruct the unavailable original authoring repository. Any residual differences in time-driven particles, WebGL renderer, live news or out-of-scope pages must be recorded honestly.

One measured lifecycle fix is applied to the recovered Three.js vendor module: compileAsync drops a shader program that was disposed during a breakpoint resize rather than polling its missing isReady method. Normal live shader compilation is unchanged. The original unmodified vendor bytes and original hash remain archived; the adaptation is reproducible in prepare_react_source.py.
