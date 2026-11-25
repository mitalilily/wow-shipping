# Visual and verification defects

| Finding | Resolution | Evidence |
|---|---|---|
| Cold dev server scanned unrelated skill/demo HTML files | Restrict Vite dependency entries to index.html and ignore tooling/evidence directories | Local dev HTTP 200; vite.config.ts |
| Original runtime refused localhost | Extend owner's deployment allowlist only with localhost, 127.0.0.1 and ::1 | Original archive retained; localized main.js |
| Ocean texture URLs resolved against origin root | Point original OceanScene asset base to /assets/recovered/ | Browser network tour checks |
| Globe requested world-atlas remotely | Localized exact discovered geometry JSON | No external HTTP asset requests in browser tests |
| Initial mobile capture contained one viewport | Correct capture/test scroll owner to .body-inner; original page was not stuck | Independent review finding 1; full mobile source tour 34 checkpoints |
| FAQ/footer keyboard adaptation used guessed footer selector | Use observed .footer-info-btn and source .on-open-nav class | Keyboard tests |
| Node Playwright timeout supplied as argument | Pass timeout options in third parameter | Independent review finding 3 |
| Footer and CTA captures showed half-revealed blue text | Add separate settled capture dwell; retain transient frames as motion evidence | Independent review finding 2 |
| Initial single application chunk exceeded 500kB | Lazy-load selected homepage mode; 221kB shell, 406kB normal app, 12kB static view | Production build output |
| Reduced-motion CSS dependency was omitted by a conditional lazy import | Give each mode its own explicit lazy import; reset original preloader scroll locks for the static view | Production native wheel/disclosure tests at 1440px and 390px |
| Resize/disposal raced an asynchronous Three.js shader readiness poll | Drop disposed program entries from the pending compilation set; preserve normal live-program behavior | Supplemental runtime test, zero remaining ScrollTriggers |

Known differences: independently started ambient globe/water/particle phases; platform GPU rasterization; intentional static accessibility mode. Captured news content reflects recovery time. Other site pages remain original remote destinations. No exact pixel-parity claim is made for dynamic frames.
