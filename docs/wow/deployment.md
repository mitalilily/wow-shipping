# Netlify deployment

`netlify.toml` publishes `dist`, uses the existing build command and bundles `netlify/functions/tracking.ts`. That wrapper exposes the shared validated request handler at `/api/tracking` with platform rate limiting. The Services alias redirects to the Home section; other missing pages retain HTTP 404.

The public origin defaults to `https://wow-shipping.netlify.app`. To change it, set `WOW_SITE_URL` before a local production build. On a Netlify-hosted build, `URL` supplies the origin automatically. Both the animation hostname allowlist and canonical/social metadata use this origin. No credentials belong in that variable or the public build.

The deployment CLI is isolated under `.codex-tools/netlify-cli`. Netlify's authenticated configuration and workspace `.netlify` state must remain local and ignored. Publish only `dist` and the bundled tracking function; source archives, attachments, browser captures and local tooling are not public deployment inputs.

After deployment, run `node tools/wow/verify_deploy.mjs <site-origin>`, then run the browser matrix with `TEST_ORIGIN` set to that same origin. The handler remains explicitly `NOT_CONFIGURED` until a live courier provider and credentials are selected; the support fallback stays available. Contact creates a WhatsApp draft for the visitor to send.

Published production URL: https://wow-shipping.netlify.app/.

Netlify project: `wow-shipping`, ID `5e6d5b48-0a27-49fa-9bb1-1de904523c03`. Production deploy: `6af0b68942192b734df173b7`. Dashboard: https://app.netlify.com/projects/wow-shipping. The site belongs to the existing `mitalilily` team and was deployed with its authorized account; it is not an anonymous or expiring preview. No custom-domain DNS or unrelated projects were changed.

The build and nine unit tests pass. The function was bundled and included in the production upload. Public endpoint checks pass for all four pages, canonical/social metadata, original cloud media, animation modules, Services redirect, removed-page 404s, tracking support response and input validation. Live Chrome verification passes eight route/viewport cases (four pages at 1440px and 390px) plus two reduced-motion cases. Full forward/reverse Home scrolling, mobile menus, FAQ, tracking UI states and prepared WhatsApp drafts pass without page errors or failed assets. Evidence: `reference/wow/deployment/http.json` and `browser.json`. No messages were sent by these checks.

## Git-based continuous deployment

The existing `wow-shipping` project is connected to `mitalilily/wow-shipping` on GitHub. Pushes to `main` trigger Netlify through an active repository webhook. Netlify checks out the repository with a read-only deploy key, runs `npm run build` at the repository root, publishes `dist`, and bundles `netlify/functions`.

Builds are enabled. Configuration remains in `netlify.toml` with Node 24. No Netlify credentials or deploy-key private material are stored in this repository. The integration state and account credentials remain outside tracked source.

For future updates, commit and push changes to `main`; manual CLI uploads are unnecessary. Check the [Netlify deploy history](https://app.netlify.com/projects/wow-shipping/deploys) for each build result. Failed builds do not replace the last successfully published site.
