import fs from 'node:fs/promises';
const base='public/assets/wow/brand';
const plane=await fs.readFile('public/assets/images/6a44eec1ed1af2c4c403e80a_plain.avif');
// Retain supplied-emblem aircraft asset.

for(const file of ['src/components/footer/Footer.tsx','src/pages/AboutPage.tsx','src/pages/ContactPage.tsx','src/features/contact/enquiry.ts','tools/wow/prepare_entries.mjs']){
 let t=await fs.readFile(file,'utf8');t=t.replaceAll('Domestic · International · Local','Domestic · International').replaceAll('Domestic, International & Local Shipping','Domestic & International Door-to-Door Shipping').replaceAll('Domestic and international','Domestic and international').replaceAll('domestic and international','domestic and international').replaceAll('Door-to-door delivery','Door-to-door delivery').replaceAll('Local Delivery','Door-to-Door Delivery').replaceAll("'Local'","'Door to door'");await fs.writeFile(file,t);
}
let t=await fs.readFile('src/content/site.ts','utf8');t=t.replace("plane:'/assets/images/6a44eec1ed1af2c4c403e80a_plain.avif'","plane:'/assets/wow/brand/plane-branded.svg'");await fs.writeFile('src/content/site.ts',t);
t=await fs.readFile('src/main.tsx','utf8');if(!t.includes('./styles/premium-theme.css'))t=t.replace("import './styles/inner-stories.css';","import './styles/inner-stories.css';\nimport './styles/premium-theme.css';");await fs.writeFile('src/main.tsx',t);
t=await fs.readFile('src/app/App.tsx','utf8');if(!t.includes('ThemeBranding')){t="import {ThemeBranding} from '../components/shared/ThemeBranding';\n"+t;t=t.replace('<Header />','<ThemeBranding/><Header />')}await fs.writeFile('src/app/App.tsx',t);
t=await fs.readFile('src/components/shared/CallToAction.tsx','utf8');if(!t.includes('wow-cta-plane'))t=t.replace('<div className="wow-cta-content">','<img className="wow-cta-plane" src="/assets/wow/brand/plane-branded.svg" alt="WOW Shippings branded aircraft" loading="lazy"/><div className="wow-cta-content">');await fs.writeFile('src/components/shared/CallToAction.tsx',t);
console.log('Prepared branded aircraft and theme wiring.');
