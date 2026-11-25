import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const width of [1440,390]){
const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
const probe=()=>({class:document.documentElement.className,scrollY,scrolling:document.scrollingElement?.tagName,nodes:[document.documentElement,document.body,document.querySelector('#root'),document.querySelector('.static-home')].map(e=>{const s=getComputedStyle(e);return {tag:e.tagName,height:e.getBoundingClientRect().height,scrollHeight:e.scrollHeight,scrollTop:e.scrollTop,overflow:s.overflow,position:s.position,maxHeight:s.maxHeight,touchAction:s.touchAction}})});
console.log(width,'styles',await page.evaluate(()=>[...document.styleSheets].map(s=>({href:s.href,disabled:s.disabled,rule:[...s.cssRules].map(r=>r.cssText).filter(t=>t.includes('reduced-motion')).slice(0,5)}))));console.log(width,'before',await page.evaluate(probe));await page.mouse.move(width/2,450);await page.mouse.wheel(0,1000);await page.waitForTimeout(1000);console.log(width,'after',await page.evaluate(probe));await page.screenshot({path:`reference/local/reduced-debug-${width}.png`});await page.close()}
await browser.close();
