import fs from 'node:fs/promises';
import path from 'node:path';
import {site} from '../../src/content/site.ts';
import {siteOrigin} from './deployment.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const metadata=JSON.parse(await fs.readFile(path.join(root,'src/recovered/metadata.json'),'utf8'));
const pages=[{id:'home',title:'WOW Shippings | Domestic & International Door-to-Door Shipping',description:site.hero.description},{id:'about',title:'About WOW Shippings | Built Around Your Shipment',description:'Meet WOW Shippings, based in Mohali, Punjab. Domestic and international shipping enquiries, planned around your next move.'},{id:'tracking',title:'Track a Shipment | WOW Shippings',description:'Get help with your AWB or consignment number. Track a shipment or ask the WOW Shippings team for an update.'},{id:'contact',title:'Contact WOW Shippings | Get a Shipping Quote',description:'Request a shipping quote on WhatsApp, call +91 7973546092 or email info@wowshippings.com.'}];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
// Fetch the globe's module graph and point data while React's bundle loads.
// Reduced-motion visits use the static home and do not need these files.
const globeWarmup=`<script>
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const href of ['/assets/wow-runtime/main.js', '/assets/wow-runtime/chunks/Home-CZ3JhV-m.js', '/assets/wow-runtime/chunks/my-flights-DRrlP7HY.js', '/assets/wow-runtime/chunks/vendor-three-DebrQqf4.js']) {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    document.head.append(link);
  }
  const points = document.createElement('link');
  points.rel = 'preload';
  points.as = 'fetch';
  points.href = '/assets/wow/brand/globe-points.json';
  points.crossOrigin = 'anonymous';
  document.head.append(points);
}
</script>`;
for(const p of pages){const folder=p.id==='home'?root:path.join(root,p.id);await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'index.html'),`<!doctype html>
<html lang="en" class="w-mod-js" data-wf-page="6a44eec1ed1af2c4c403df38" data-wf-site="6a44eec1ed1af2c4c403df6b">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#fbf6ef"/><title>${p.title}</title><meta name="description" content="${escape(p.description)}"/><link rel="canonical" href="${siteOrigin}/${p.id==='home'?'':p.id+'/'}"/><meta property="og:title" content="${p.title}"/><meta property="og:description" content="${escape(p.description)}"/><meta property="og:type" content="website"/><meta property="og:image" content="${siteOrigin}/assets/wow/brand/social.png"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><link rel="icon" type="image/png" sizes="64x64" href="/assets/wow/brand/favicon.png"/><link rel="preload" as="image" href="/assets/wow/brand/emblem-small.webp"/>${p.id==='home'?'<link rel="preload" as="image" href="/assets/wow/brand/globe-first-paint.webp" fetchpriority="high"/>':''}${p.id==='home'?globeWarmup:''}<link rel="stylesheet" href="${metadata.stylesheet}"/></head>
<body class="body"><div id="root"></div>${p.id==='home'?'<script src="/assets/vendor/jquery-3.5.1.min.js"></script>':''}<script type="module" src="/src/main.tsx"></script></body></html>`)}
const brand=path.join(root,'public/assets/wow/brand');await fs.mkdir(brand,{recursive:true});
await fs.writeFile(path.join(brand,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#365cff"/><path d="M10 17 21 47 32 24 43 47 54 17" fill="none" stroke="white" stroke-width="5" stroke-linejoin="round"/><circle cx="32" cy="24" r="5" fill="white"/></svg>');
// Retain supplied-theme social image and emblem assets.
console.log('WOW: prepared four page entries and vector identity.');
