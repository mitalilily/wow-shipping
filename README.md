# WOW Shippings

Production destination: [wow-shipping.netlify.app](https://wow-shipping.netlify.app/). The repository contains the latest local build; publishing is a separate step.

A four-page React/TypeScript/Vite website built around the preserved cinematic transport journey. The globe, crane and truck sequences, ship, ocean, aircraft, clouds and neutral imagery retain their original quality. WOW has its own identity, animated page chapters, navigation, concise content and enquiry flows.

```powershell
npm ci
npm run dev
```

Development: http://127.0.0.1:5173. Production preview:

```powershell
npm run build
npm run preview
```

Open http://127.0.0.1:4173. Keep preview running for browser checks:

```powershell
npm run test:unit
npm run test:browser
node tools/wow/verify_runtime.mjs
node tests/browser/flight.mjs
node tests/browser/inner-stories.mjs
node tests/browser/cloud-transition.mjs
```

Browser tests use installed Google Chrome through Playwright. Restrict widths with `npm run test:browser -- 1440 390 reduced`. Screenshots/results are in `reference/wow/browser/`. Avoid rebuilding while a browser tour runs: rebuilding replaces `dist/` and can cause transient missing assets in that tour.

## Pages and content

- `/` — shipping services, original transport story, two short reviews, twelve-entry courier directory, FAQ and enquiry CTA.
- `/about/` — three scroll-linked transport chapters with a sticky visual stage and direct chapter navigation.
- `/tracking/` — AWB form, honest provider/result/error states and an interactive courier-status guide.
- `/contact/` — live shipment brief, enquiry builder, animated next-step chapters, prepared WhatsApp message, phone and email.

Services are at `/#services`; `/services` redirects there. Removed legacy destinations are not homepage aliases. Update business details, reviews, navigation, services and courier listings in **`src/content/site.ts`**. The hero uses “From Your Door To Theirs. Anywhere In The World.” with the supplied doorstep pickup/delivery copy. The cream, navy and orange theme uses locally hosted Source Sans 3, the supplied four-colour emblem, branded aircraft and original courier logos. Globe country labels and routes are illustrative.

## Structure

```text
src/
  app/                  Animated and reduced-motion Home composition
  pages/                About, Tracking, Contact and shared page shell
  components/
    navigation/         Shared React-owned header and mobile menu
    footer/             WOW footer, dotted map and particle-scatter wordmark
    shared/             Story chapters, shipment brief, status guide and shared UI
  content/              Central typed business content
  features/
    tracking/           Public tracking result/error types
    contact/            Enquiry validation and message formatting
  motion/               Scroll-driven route ribbon and lightweight page reveals
  hooks/                Home runtime lifecycle and Services anchor readiness
  runtime/              Original transport bootstrap
  story/structure/      Generated WOW structure, retaining transport layout hooks
  recovered/            Original structural input, preserved for provenance
  styles/               Original shared styles and WOW identity/responsive rules
server/                 Provider-independent tracking handler and local middleware
api/                    Portable Web Request API entry for a future hosting adapter
public/assets/
  wow/brand/            Original WOW favicon and social-preview artwork
  wow-runtime/          Adapted transport runtime with local dependencies
  images/ sequences/    Preserved original transport media
  fonts/ videos/ data/  Preserved fonts, background media and globe geometry
tools/wow/              Deterministic content/runtime/page preparation and evidence
tests/unit/             Tracking and enquiry behavior tests
tests/browser/          Real Chrome verification
docs/wow/               Current implementation, media decisions and QA reports
reference/              Ignored original evidence and current browser captures
```

`npm run prepare:site` runs automatically before dev/build. It generates brand-aware structural data from the preserved trees, adapts the original runtime and creates the four HTML entries. It never rewrites the original archive. A clean checkout builds using the committed `public/assets/recovered/` source modules when the private reference capture folder is absent. Precomputed globe points are committed; regenerate them with `node tools/wow/precompute-globe.mjs` only when changing globe sampling. The old recovery generator is protected against overwriting WOW. Original source-reconstruction documentation remains in `docs/00–10`; current project documentation is under `docs/wow/`.

## Tracking configuration

**No live tracking provider has been selected.** The real local `POST /api/tracking` endpoint returns HTTP 503 with `NOT_CONFIGURED`, and the page offers personal support. It does not fabricate shipments or misreport an unperformed lookup as “not found.”

To connect a provider, implement `TrackingProvider.track()` in a server-only adapter and pass it to `createTrackingHandler`. Keep credentials on the server. The public response only includes the allowed tracking fields. The handler supports validation, not-found, carrier-required, timeout and unavailable states. Netlify publishes the wrapper in `netlify/functions/tracking.ts` at `/api/tracking` with platform rate limiting. Dev/preview middleware retains a process-local rate limit. For a different host, adapt `api/tracking.ts` to its server-function interface; static-only hosting does not run that endpoint automatically.

## Enquiries

Contact requests become a draft at `https://wa.me/917973546092`; the visitor sends it in WhatsApp. The form does not submit to a server or claim a message was sent. A copyable draft and direct phone/email links remain available. Browser tests intercept the draft opening and never send messages externally.

The supplied WOW emblem was cleaned for transparent use. Courier tiles use original courier logo assets; directory inclusion does not imply a verified partnership. Selected geography on the globe is illustrative, not a live tracking feed or promised carrier coverage.

The social card is code-authored vector artwork with a PNG render. After changing its artwork, run `node tools/wow/prepare_entries.mjs` then `node tools/wow/render_social.mjs`, and rebuild. The latter requires installed Chrome.

See [implementation notes](docs/wow/implementation.md), [asset decisions](docs/wow/asset-decisions.md), [QA results](docs/wow/qa.md), [independent review](docs/wow/independent-review.md), and [Netlify deployment](docs/wow/deployment.md).
