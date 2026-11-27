# Shipping support and flight refinements

The support introduction uses the supplied slide copy in a new editorial composition: a heading and promise, licensed freight photography, three linked service descriptions, and a direct quote invitation. Domestic, international and door-to-door services are retained; the earlier instruction to omit Local remains in effect. No 150-country coverage claim is introduced.

The original hero-to-introduction background is preserved. The custom introduction no longer uses the recovered Intro controller, which previously hid and split its text. It is also shared by the reduced-motion homepage.

Aircraft branding is moved towards the centre of the fuselage and extended horizontally by about 15%. The flight chapter uses a single scrubbed timeline for entry, translation, bank and scale. The scroll interval is longer, and copy opacity stays at 1. Cloud opacity is limited, the transition clears early, and clouds remain below the text.

The deployment at https://wow-shipping.onrender.com/ and the United Carriers reference were inspected in Chrome before editing. The initial local Chrome preview was blocked by a saved origin permission even after the user reported enabling access. Build and unit checks were run without bypassing that restriction. Published Render verification is recorded when completed.


Published verification: implementation commits `4173af4` and `4c86d69` were confirmed live at the Render URL. Chrome inspection confirmed the new desktop support layout, loaded photograph and service descriptions, no horizontal overflow, flight-copy opacity 1, cleared bridge fog at the reading position, and cloud opacities 0.16 / 0.10. The extension connection subsequently timed out; the previously authorized isolated Chrome runner completed the remaining checks against the public Render deployment, without accessing the blocked preview origin.

The public flight-transition test passed at 1440×900, 870×668 and 390×844. Six scroll positions per viewport verified loaded aircraft artwork, readable copy, restrained clouds and cleared transition fog. Forward movement, reverse-scroll retracing, horizontal overflow and browser errors were also checked. Desktop and phone screenshots were visually inspected: the branded aircraft is visible and the copy remains unobscured. These checks do not measure frame rate.

The shared support section was separately checked in the reduced-motion homepage at 1440×900 and 390×900. All three service descriptions, loaded photography and visible text bounds passed, with no horizontal overflow or browser errors. Both section screenshots were visually inspected.

The aircraft asset now reuses the existing small WebP emblem, is requested eagerly at low priority, and uses a versioned filename to avoid the old SVG cache. Its SVG payload is approximately 89 KB. The production build and all nine unit tests passed.
