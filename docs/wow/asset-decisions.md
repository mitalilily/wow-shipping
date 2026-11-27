# Asset reuse and identity decisions

| Group | Decision | Reason |
|---|---|---|
| Globe geometry / point renderer | Reuse | Preserve detail and rendering quality; illustrative geography/routes are adapted |
| Crane/truck AVIF sequences | Reuse unchanged media | Frame continuity and mechanical detail retained; no invented 3D camera angles |
| Containers, tyres, ship, aircraft | Reuse | Brand-neutral transport objects, existing layered animation retained |
| Ocean shader, normal/env/overlay maps, wake | Reuse | Original water quality; local texture paths preserved |
| Clouds | Reuse and restage | Different arrangements, individual rotations and aircraft angle; no quality downgrade |
| Neutral wave/video and photographs | Reuse | No generation needed to meet the approved quality gate |
| Source wordmarks / footer logo masks / favicon | Replace | Original WOW vector identity; old source identities are not rendered |
| Client portraits and long reviews | Remove | Two selected existing WOW excerpts, no invented portraits or customer claims |
| Airline/shipping-line marks | Remove | Twelve courier names in a neutral framed directory |
| Courier marks | Text fallback | Authentic company names; no AI-rendered or falsely presented official logos |
| WOW-reference media | None imported | The brand site was used only for business information and selected reviews |
| WOW social preview | New | Code-authored SVG, rendered to a local PNG using Chrome |

Original downloaded-byte provenance is in `reference/asset-manifest.json`. Original unmodified code/style files remain under `reference/original-assets/`; current adaptation records are in `docs/wow/runtime-adaptations.json`. Structural inputs remain under `src/recovered/`; generated WOW trees are separate.

No AI still/video generation or external paid model calls were needed. No lower-quality replacement was substituted for existing transport media. Courier directory inclusion does not establish a partnership or tracking API integration. Original unused asset files remain available for recovery; they are not automatically rendered or fetched.

Latest footer revision: the retained `6a44eec1ed1af2c4c403dfc5_map.png` supplies the dotted world-map background. The original scatter engine is reused with a new code-typeset WOW SHIPPING alpha mask, replacing the old carrier mask. No external media was downloaded or generated. The user-requested ribbon removal changes decorative SVG rendering only; transport media remain intact.

Animated inner pages reuse the existing container, truck and aircraft at their original quality, with new scene compositions and restrained transform-based movement. The sea-to-air handoff reuses `6a44eec1ed1af2c4c403e809_cloud-template.avif` in two separately moving foreground banks. No new image generation, external imagery or additional rendering engine was required.


## Shipping support photograph — November 2026

- Asset: `public/assets/wow/brand/shipping-port.webp`, a 1400px WebP derivative.
- Photographer: Daniel Miksha, aerial container handling at the Port of Vancouver.
- Source: https://unsplash.com/photos/aerial-view-of-stacked-shipping-containers-at-a-port-37mW7MvAOvU
- License: https://unsplash.com/license — permits commercial use and redistribution in the website.
- The image illustrates freight handling; it does not identify a WOW-owned facility.
- The aircraft's existing SVG branding is centred over the fuselage and extended horizontally. Original aircraft imagery and other vehicle assets are preserved.
