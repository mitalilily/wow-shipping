# Performance observations

Measured in task-specific headless installed Google Chrome, DPR=1, local production preview, on Intel UHD Graphics through ANGLE/D3D11. No CPU/network throttling. These are 60-frame requestAnimationFrame interval samples at the settled hero, not a sustained benchmark or paint/FPS guarantee.

| Viewport | Median interval | P95 interval | Initial resources | Initial transferred bytes |
|---|---:|---:|---:|---:|
| 1440×900 | 25.2 ms | 41.6 ms | 53 | 2,278,694 |
| 1920×1080 | 41.1 ms | 75.5 ms | 52 | 2,173,408 |
| 768×1024 | 33.4 ms | 66.6 ms | 61 | 2,142,729 |
| 390×844 | 25.0 ms | 41.4 ms | 46 | 1,443,073 |

The 1920px WebGL hero costs substantially more on this GPU than the phone configuration. A universal 60fps claim would be false. Water/globe fidelity retains original scene settings; GPU rasterization and concurrent machine load affect results. Additional production device profiling is needed before promising sustained frame rate.

Production application chunks: shell/React 221.67kB (69.48kB gzip), normal homepage 405.98kB (72.67kB gzip), static alternative 12.51kB (4.69kB gzip). Recovered GSAP/Three.js/runtime files are separate local static modules. Original image sequences initialize progressively; a 22.56MiB recovered directory is not the initial network payload. No external HTTP asset request was observed in any full tour.

Vite only scans the application entry, excluding skill demos and tooling. Application modes are lazy-loaded separately. Reduced motion loads no WebGL/canvas/GSAP scene runtime. Original frame cache/disposal logic is preserved. One Three.js compileAsync disposal race is guarded reproducibly; breakpoint resize and cleanup tests finish with zero ScrollTriggers and no uncaught error. This is functional cleanup evidence, not a long-running heap/GPU-memory leak certification. No GPU memory allocation total was available; no invented memory figure is reported.
