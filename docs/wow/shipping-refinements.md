# Shipping support and flight refinements

The support introduction uses the supplied slide copy in a new editorial composition: a heading and promise, licensed freight photography, three linked service descriptions, and a direct quote invitation. Domestic, international and door-to-door services are retained; the earlier instruction to omit Local remains in effect. No 150-country coverage claim is introduced.

The original hero-to-introduction background is preserved. The custom introduction no longer uses the recovered Intro controller, which previously hid and split its text. It is also shared by the reduced-motion homepage.

Aircraft branding is moved towards the centre of the fuselage and extended horizontally by about 15%. The flight chapter uses a single scrubbed timeline for entry, translation, bank and scale. The scroll interval is longer, and copy opacity stays at 1. Cloud opacity is limited, the transition clears early, and clouds remain below the text.

The deployment at https://wow-shipping.onrender.com/ and the United Carriers reference were inspected in Chrome before editing. The initial local Chrome preview was blocked by a saved origin permission even after the user reported enabling access. Build and unit checks were run without bypassing that restriction. Published Render verification is recorded when completed.


Published verification: commit `4173af4` was confirmed live at the Render URL. Chrome inspection confirmed the new desktop support layout, loaded photograph and service descriptions, no horizontal overflow, flight-copy opacity 1, cleared bridge fog at the reading position, and cloud opacities 0.16 / 0.10. The Chrome connection timed out during further aircraft/responsive checks; no completed mobile or full motion run is claimed. The aircraft asset now reuses the existing small WebP emblem, is requested eagerly at low priority, and uses a versioned filename to avoid the old SVG cache.
