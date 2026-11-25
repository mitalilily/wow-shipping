import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const origin='http://127.0.0.1:4181';
const out='reference/wow/repair';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
 for(const [width,height] of [[1440,900],[390,844],[768,1024],[1531,668]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  for(const route of (width===1440||width===390?['/','/about/','/tracking/','/contact/']:['/'])){
   const page=await context.newPage();const errors=[],bad=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/'))bad.push({url:r.url(),status:r.status()})});
   await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForSelector('h1');await page.evaluate(()=>document.fonts.ready);
   if(route==='/'){await page.waitForFunction(()=>window.__WOW_RUNTIME__?.ready,null,{timeout:90000});await page.waitForFunction(()=>document.querySelector('#globe')?.dataset.landReady==='true',null,{timeout:15000});await page.waitForTimeout(1200)}
   else await page.waitForTimeout(1000);
   const name=route==='/'?'home':route.split('/')[1];
   await page.screenshot({path:out+'/'+width+'-'+name+'.png',timeout:30000});
   const metrics=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}};return{viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth+1,title:box('h1'),header:box('.wow-header'),nav:[...document.querySelectorAll('.wow-desktop-nav a')].map(e=>{const r=e.getBoundingClientRect();return{y:r.y,h:r.height}}),text:document.querySelector('main')?.innerText,fonts:document.fonts.check('400 16px "Source Sans 3"')}});
   const result={width,height,route,errors,bad,metrics};results.push(result);
   if(route==='/'){
    const maximum=await page.evaluate(()=>{const owner=innerWidth<=767?document.querySelector('.body-inner'):document.documentElement;return owner.scrollHeight-innerHeight});
    const step=Math.floor(height*.75);
    for(let y=0;y<=maximum+step;y+=step){await page.evaluate(y=>{const l=window.__WOW_RUNTIME__?.lenis;l?l.scrollTo(y,{immediate:true,force:true}):window.scrollTo(0,y)},Math.min(y,maximum));await page.waitForTimeout(80)}
    await page.waitForTimeout(600);await page.screenshot({path:out+'/'+width+'-footer.png'});
    const logos=await page.locator('.wow-courier img').evaluateAll(images=>images.map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})));result.logos=logos;
   }
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(results,null,2))}
console.log(JSON.stringify(results.map(({width,height,route,errors,bad,metrics,logos})=>({width,height,route,errors,bad,overflow:metrics.overflow,title:metrics.title,fonts:metrics.fonts,logos})),null,2));

