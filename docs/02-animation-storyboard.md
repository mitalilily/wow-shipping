# Animation storyboard

The recovered `main.js`, `Home-CZ3JhV-m.js` and `layout-BqW6AIsF.js` contain the original GSAP timelines. They are reused, rather than approximating durations or object coordinates. Desktop and mobile branches are retained.

| Sequence | Trigger and behavior | Rendering / evidence |
|---|---|---|
| Preloader | Resource-aware original master timeline; body scrolling held until entry completes | DOM/SVG lettering and line treatments; initial timed screenshots |
| Hero entry | Headline masks, globe scale/translation, supporting copy and CTA reveal | `Hero` controller, original expo.out entry tweens of 1–1.2s |
| Hero exit | Scroll-linked transition from top −20% through center/top; opacity and scale transition | Original `scrub:true` timeline, no replacement eased scrolling |
| Globe | Continuously rotating globe with moving route particles/arcs; pause/resume by section visibility | `my-flights-DRrlP7HY.js`, local world-atlas geometry, procedural WebGL |
| Company | Sticky photographic introduction, word/line reveals and actual original counters | Source company markup and Home Intro controller |
| Freight introduction | Pinned/overlapping service presentation with crane sequence scrubbing and layered cargo | Original AVIF frame arrays, canvas and transparent images |
| Truck journey | Frame-scrubbed vehicle rotation, DOM wheels/trailer layers, speed display and road/milestone content | Original truck frame-sequence controller and GSAP scroll ranges |
| Reliability | Copy and indicators enter around the transport milestones | Original timeline positions; mobile uses source mobile composition |
| Ocean | Long ship passage, scrolling camera/content transition, animated water and wake | Original Three.js OceanScene and WakeSimulation, local normal/env/overlay textures; ship remains an original image |
| Airplane / clouds | Image-based airplane and cloud movement into the following content | DOM image layers driven by recovered timeline; no invented GLB |
| Advantages | Heading, icon and copy reveals as source section enters | Original Why controller and source SVGs |
| Testimonials | Source customer layout and timed reveals | Original text and Home Testi controller |
| Partners / insights | Partner marks, article image/text reveals and hover behavior | Original grid, marks, images and handlers |
| FAQ | One question expands; previous question closes; clicking again collapses | Original jQuery slideUp/slideDown, refresh after 200ms; keyboard equivalent added |
| CTA / footer | Large headline, mask/color reveals, image and particle lettering, information tabs | Original layout module; allow ≥3s dwell before settled screenshot comparison |
| Navigation | Source menu reveal, logo contraction, light/dark scroll states and overlay | Original Header controller, Escape close and aria-expanded added |

Forward and reverse tours use the existing Lenis instance with immediate controlled positions. At phone widths, `.body-inner` owns scrolling; root document height is not the page's content height. Source and local captures use the same viewport and DPR=1.

Ambient globe routes, water and particle lettering advance with time and can differ between independently started captures. Pixel differences in these regions are not proof of static geometry drift. Scroll checkpoints also include in-progress reveals; settled captures are separate. Shader timing and renderer output vary with the machine.

For reduced motion, a separate React view renders original source content and static imagery with native scrolling/disclosures. It loads no animation runtime, preloader, canvas, pinning or smooth scrolling. This is a deliberate accessibility alternative; normal mode preserves source choreography.
