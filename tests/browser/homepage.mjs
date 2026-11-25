import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
const sizes={'desktop-1440':[1440,900],'desktop-1920':[1920,1080],tablet:[768,1024],mobile:[390,844]};
const requested=process.argv.slice(2);
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
const probe=()=>{const scrollOwner=innerWidth<=767?document.querySelector('.body-inner'):document.documentElement;const scrollY=innerWidth<=767?scrollOwner.scrollTop:window.scrollY;return ({scrollY,scrollHeight:scrollOwner.scrollHeight,width:innerWidth,documentWidth:document.documentElement.scrollWidth,
  headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getBoundingClientRect().height).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {text:e.innerText,x:r.x,y:r.y,width:r.width,height:r.height,fontFamily:s.fontFamily,fontSize:s.fontSize,lineHeight:s.lineHeight,color:s.color}}),
  sections:[...document.querySelector('.main-inner').children].map(e=>({class:e.className,y:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height})),
  fontReady:document.fonts.status,ready:window.__UC_RECONSTRUCTION__?.ready,bootError:window.__UC_BOOT_ERROR__||null,
  triggers:window.__UC_RECONSTRUCTION__?.ScrollTrigger.getAll().length,
  canvases:[...document.querySelectorAll('canvas')].map(e=>({id:e.id,width:e.width,height:e.height}))})};
async function scroll(page,y){await page.evaluate(y=>{const l=window.__UC_RECONSTRUCTION__?.lenis;l?l.scrollTo(y,{immediate:true,force:true}):window.scrollTo(0,y)},y);await page.waitForTimeout(450)}
try{
 for(const [name,[width,height]] of Object.entries(sizes)){
  if(requested.length&&!requested.includes(name))continue;
  const dir=path.resolve('reference/local',name);await fs.mkdir(dir,{recursive:true});
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();const errors=[],failures=[],external=[],statuses=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()}));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))external.push(r.url())});
  page.on('response',r=>{if(r.status()>=400)statuses.push({url:r.url(),status:r.status()})});
  const result={name,viewport:{width,height},errors,failures,external,statuses,checkpoints:[],checks:{}};
  results.push(result);
  try{
   await page.goto(origin,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__UC_RECONSTRUCTION__,null,{timeout:60000});
   await page.evaluate(()=>window.__UC_RECONSTRUCTION__.gsap.ticker.lagSmoothing(0));
   await page.waitForFunction(()=>window.__UC_RECONSTRUCTION__?.ready,null,{timeout:90000});
   await page.waitForTimeout(2000);
   result.initial=await page.evaluate(probe);
   assert.equal(result.initial.bootError,null);assert.equal(result.initial.fontReady,'loaded');
   assert.ok(result.initial.documentWidth<=width+1,`Horizontal overflow: ${result.initial.documentWidth}`);
   result.checks.initial=true;
   await page.screenshot({path:path.join(dir,'hero.png'),timeout:15000});
   result.performance=await page.evaluate(async()=>{const intervals=[];let last=performance.now();await new Promise(resolve=>{let count=0;function frame(now){intervals.push(now-last);last=now;if(++count<60)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});intervals.sort((a,b)=>a-b);return {navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),resourceCount:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((sum,r)=>sum+r.transferSize,0),rafMedianMs:intervals[30],rafP95Ms:intervals[57],devicePixelRatio}});
   const links=await page.locator('.header a[href]').evaluateAll(links=>links.map(e=>e.getAttribute('href')));
   assert.ok(links.some(h=>h.includes('unitedcarriers.com/contact')));result.checks.navigation=true;
   const maximum=result.initial.scrollHeight-height;
   const step=Math.floor(height*.8);
   const positions=Array.from({length:Math.ceil(maximum/step)},(_,i)=>i*step).concat(maximum);
   for(let i=0;i<positions.length;i++){
    await scroll(page,positions[i]);
    result.checkpoints.push(await page.evaluate(probe));
    await page.screenshot({path:path.join(dir,`scroll-${String(i).padStart(3,'0')}-${String(positions[i]).padStart(5,'0')}.png`),timeout:15000}).catch(e=>errors.push('Capture: '+e.message.slice(0,100)));
    await fs.writeFile(path.join(dir,'results.json'),JSON.stringify(result,null,2));
   }
   await page.waitForTimeout(3000);await page.screenshot({path:path.join(dir,'footer-settled.png')});
   const faq=page.locator('.home-faq-main-item').first();
   await scroll(page,await faq.evaluate(e=>e.getBoundingClientRect().top+(innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY)-180));
   await page.waitForTimeout(900);
   const initialActive=await faq.evaluate(e=>e.classList.contains('active'));
   await faq.press('Enter');await page.waitForTimeout(500);
   assert.notEqual(await faq.evaluate(e=>e.classList.contains('active')),initialActive);
   await page.screenshot({path:path.join(dir,'faq-open.png')});
   await faq.press('Space');await page.waitForTimeout(500);
   assert.equal(await faq.evaluate(e=>e.classList.contains('active')),initialActive);
   result.checks.faqKeyboard=true;
   const tabs=page.locator('.footer-info-btn');
   if(await tabs.count()>1){
    await scroll(page,await tabs.first().evaluate(e=>e.getBoundingClientRect().top+(innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY)-200));
    await page.waitForTimeout(700);await tabs.nth(1).press('Enter');await page.waitForTimeout(500);
    assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');result.checks.footerKeyboard=true;
    await page.waitForTimeout(2000);await page.screenshot({path:path.join(dir,'footer-location.png')});
   }
   await scroll(page,0);await page.waitForTimeout(900);
   if(width<768){
    const menu=page.locator('.header-menu-toggle').first();await menu.click();await page.waitForTimeout(900);
    assert.ok(await page.locator('.header').evaluate(e=>e.classList.contains('on-open-nav')));
    await page.screenshot({path:path.join(dir,'menu-open.png')});await page.keyboard.press('Escape');await page.waitForTimeout(700);
    assert.equal(await page.locator('.header').evaluate(e=>e.classList.contains('on-open-nav')),false);result.checks.mobileMenu=true;
   }
   result.checks.localAssets=external.length===0&&statuses.length===0;
   result.checks.noPageErrors=errors.filter(e=>!e.startsWith('Capture:')).length===0;
   result.checks.reverseScroll=(await page.evaluate(()=>innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY))<2;
   assert.equal(failures.length,0,'No asset requests should fail');
   assert.ok(result.checks.localAssets,'All rendering assets should load locally');
   assert.ok(result.checks.noPageErrors,'No uncaught runtime errors');
   assert.ok(result.checks.reverseScroll,'Can return to the hero');
  }catch(e){result.fatal=String(e);process.exitCode=1;console.error(name,result.fatal)}
  await fs.writeFile(path.join(dir,'results.json'),JSON.stringify(result,null,2));
  console.log(name,JSON.stringify({height:result.initial?.scrollHeight,checkpoints:result.checkpoints.length,checks:result.checks,errors,failures,statuses,fatal:result.fatal}));
  await context.close();
 }
 if(!requested.length||requested.includes('reduced')){
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(origin,{waitUntil:'networkidle'});await page.mouse.wheel(0,1000);await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>scrollY>100),'Static mode must scroll natively');const details=page.locator('details').first();assert.equal(await details.locator('summary').innerText(),'What does United Carriers do?');await details.locator('summary').press('Enter');assert.ok(await details.getAttribute('open')!==null);
   assert.equal(await page.locator('canvas').count(),0);assert.equal(await page.evaluate(()=>!!window.__UC_RECONSTRUCTION__),false);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(errors.length,0);
   await page.screenshot({path:`reference/local/reduced-${width}.png`});results.push({name:`reduced-${width}`,checks:{nativeScroll:true,nativeDisclosure:true,noAnimationRuntime:true,noOverflow:true,noErrors:true}});await context.close();console.log(`reduced-${width}: passed`);
  }
 }
}finally{await browser.close();await fs.mkdir('reference/local',{recursive:true});const previous=JSON.parse(await fs.readFile('reference/local/browser-results.json','utf8').catch(()=>'[]'));const merged=[...previous.filter(p=>!results.some(r=>r.name===p.name)),...results];await fs.writeFile('reference/local/browser-results.json',JSON.stringify(merged,null,2))}
