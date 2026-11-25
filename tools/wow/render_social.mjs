/** Render the code-authored vector identity; no AI media or external assets. */
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
try{const svg=await fs.readFile('public/assets/wow/brand/social.svg','utf8');await page.setContent(`<style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}svg{display:block}</style>${svg}`);await page.screenshot({path:'public/assets/wow/brand/social.png'});}finally{await browser.close()}
