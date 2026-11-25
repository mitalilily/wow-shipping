# Workspace and source audit

Reference: https://unitedcarriers.com/ — inspected 2026-11-07 in isolated Chrome with Playwright, DPR 1.

- The starting workspace contains Codex skills, tooling, setup reports and an unborn `master` Git repository. There is no prior application, package manifest, React source or commit history to recover.
- No `united-carriers-recovery-kit.zip` was found in the project or the inspected Downloads location. No authenticated private repository, Webflow export or design-file connection was supplied.
- 180 project skills are available. Selected: Pixel Perfect Website Cloner, Clone UI, GSAP core/ScrollTrigger/React, and Three.js web guidance. The installed browser and Python tools are retained.
- Connected personal Chrome controls are not exposed in this chat. An isolated installed Chrome session was used instead. Playwright supplies rendered DOM, computed styles, resource requests, responsive captures and interactions. No personal browser profile was attached.
- The reference is Webflow HTML/CSS plus a custom deployed ES-module application at `united-carriers.netlify.app`. Public production modules contain the original homepage animation definitions. Raw and rendered HTML, stylesheet, module sources and request metadata are retained under `reference/`.
- The desktop document measures 28,229 CSS pixels at 1440×900 after initialization. Main observed content: hero, company/statistics, freight/service journey, reliability, ocean/advantages sequence, testimonials, partners, insights, FAQ, final CTA and footer. Hidden desktop/mobile variants are distinguished in the DOM inventory.
- Original fonts observed and recovered: BT Steinhart Medium/Bold, BT Steinhart Mono, and Helvetica Neue Roman/Medium.
- The hero globe is a procedural WebGL point/arc renderer. The ocean is a Three.js shader scene with localizable normal/environment/overlay textures. The cranes and truck turns use original AVIF image sequences and layered transparent images. No GLB/GLTF model was observed in the captured homepage requests or identified module resource lists.
- Reference Chrome's hardware-rendered capture stalled during the long ocean sequence. A capture retry uses Chrome's SwiftShader renderer to avoid the driver capture stall. Renderer differences are documented when comparing WebGL pixels.

Source restoration is authorized by the user's statement that this is their lost original project. Asset provenance is recorded in `reference/asset-manifest.json`. The deployed bundles are recoverable compiled source; original authoring files/source maps have not been recovered. No claim is made that these are the lost editable source files.

The restored application will omit analytics, CookieYes, Stripe/ecommerce integrations and unrelated route modules. Homepage navigation to other pages will retain the original public destination. No external publication is part of this task.
