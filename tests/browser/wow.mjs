import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
const sizes=[[1440,900],[1920,1080],[768,1024],[390,844],[870,668],[1531,668]];
const requested=process.argv.slice(2),results=[];
await fs.mkdir('reference/wow/browser',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const scroll=async(page,y)=>{await page.evaluate(y=>{const l=window.__WOW_RUNTIME__?.lenis;l?l.scrollTo(y,{immediate:true,force:true}):window.scrollTo(0,y)},y);await page.waitForTimeout(350)};
try{
 for(const [width,height] of sizes){
  if(requested.length&&!requested.includes(String(width)))continue;
  const folder=`reference/wow/browser/${width}`;await fs.mkdir(folder,{recursive:true});
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  for(const route of ['/','/about/','/tracking/','/contact/']){
   const page=await context.newPage();const errors=[],bad=[],external=[];page.on('pageerror',e=>errors.push(e.stack||String(e)));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/tracking'))bad.push({url:r.url(),status:r.status()})});page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))external.push(r.url())});
   const result={viewport:{width,height},route,errors,bad,external,checks:{}};results.push(result);
   try{
    await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForSelector('h1');
    if(route==='/'){
     await page.waitForFunction(()=>window.__WOW_RUNTIME__,null,{timeout:60000});await page.evaluate(()=>window.__WOW_RUNTIME__.gsap.ticker.lagSmoothing(0));await page.waitForFunction(()=>window.__WOW_RUNTIME__.ready,null,{timeout:60000});await page.waitForFunction(()=>document.querySelector('#globe')?.dataset.landReady==='true',null,{timeout:15000});await page.waitForTimeout(1500);
    }else await page.waitForTimeout(1200);
    assert.match(await page.title(),/WOW Shippings/);assert.equal(await page.locator('h1').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const nav=page.locator('.wow-desktop-nav');assert.equal(await nav.isVisible(),width>=1024);
    if(width>=1024){const boxes=await nav.locator('a').evaluateAll(a=>a.map(e=>e.getBoundingClientRect().y));assert.ok(Math.max(...boxes)-Math.min(...boxes)<2)}
    await page.screenshot({path:`${folder}/${route==='/'?'home':route.split('/')[1]}.png`,timeout:20000});result.checks.initial=true;
    if(width<1024){const toggle=page.locator('.wow-menu-toggle');await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.screenshot({path:`${folder}/${route==='/'?'home':route.split('/')[1]}-menu.png`});await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);result.checks.menu=true}
    if(route==='/'){
     const maximum=await page.evaluate(()=>{const owner=innerWidth<=767?document.querySelector('.body-inner'):document.documentElement;return owner.scrollHeight-innerHeight});const positions=[];for(let y=0;y<maximum;y+=Math.floor(height*.8))positions.push(y);positions.push(maximum);result.checkpoints=positions.length;result.height=maximum+height;
     for(let i=0;i<positions.length;i++){await scroll(page,positions[i]);if(i%5===0||i===positions.length-1)await page.screenshot({path:`${folder}/story-${String(i).padStart(3,'0')}.png`,timeout:20000})}
     await page.waitForTimeout(2000);await page.screenshot({path:`${folder}/footer.png`});
     const text=await page.locator('body').innerText();assert.ok(!/United\s*Carriers|APAC|2500|2,500|98\.2|Years in operation|Carbon Calculator|Live Tracking Portal|Thomas Munro|Francis Fung|Alex Hughes|PCI-DSS/i.test(text),'No source identity or unsupported claims');
     assert.ok(!/\bLocal\b/i.test(text),'Removed Local from customer-facing copy');assert.ok(await page.locator('.wow-courier img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),'All courier logos load');assert.equal(await page.locator('#awwwards').count(),0);assert.equal(await page.locator('.wow-review').count(),2);assert.equal(await page.locator('.wow-courier').count(),12);assert.equal(await page.locator('.wow-faq details').count(),6);
     const question=page.locator('.wow-faq summary').first();await scroll(page,await question.evaluate(e=>e.getBoundingClientRect().top+(innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY)-180));await question.press('Enter');assert.notEqual(await question.locator('..').getAttribute('open'),null);await question.press('Space');assert.equal(await question.locator('..').getAttribute('open'),null);
     await scroll(page,0);assert.ok(await page.evaluate(()=>innerWidth<=767?document.querySelector('.body-inner').scrollTop<2:scrollY<2));assert.ok(await page.locator('h1').innerText().then(s=>s.includes('From Your Door')&&s.includes('World.')));result.checks.story=true;result.checks.content=true;result.checks.faq=true;
     result.performance=await page.evaluate(async()=>{let last=performance.now();const samples=[];await new Promise(resolve=>{function tick(t){samples.push(t-last);last=t;if(samples.length<45)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});samples.sort((a,b)=>a-b);return{medianRafMs:samples[22],p95RafMs:samples[42],resources:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.transferSize,0)}});
    }
    if(route==='/tracking/'){
     await page.getByRole('button',{name:'Track a Shipment'}).click();await page.getByLabel('AWB / consignment number').fill('WOW-test-123');await page.getByRole('button',{name:'Track a Shipment'}).click();await page.getByRole('heading',{name:'Let’s get you a personal update.'}).waitFor();assert.equal(await page.locator('.wow-tracking-result').count(),0);result.checks.unconfiguredTracking=true;
     if(width===1440){
      for(const code of ['NOT_FOUND','CARRIER_REQUIRED','PROVIDER_UNAVAILABLE','TIMEOUT']){await page.route('**/api/tracking',r=>r.fulfill({status:code==='NOT_FOUND'?404:503,contentType:'application/json',body:JSON.stringify({error:{code,message:`Test ${code}`}})}));await page.getByRole('button',{name:'Track a Shipment'}).click();await page.getByRole('status').getByText(`Test ${code}`).waitFor();await page.unroute('**/api/tracking')}
      await page.route('**/api/tracking',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({trackingNumber:'WOW-test-123',carrier:'Test fixture courier',status:'in_transit',lastUpdated:'2026-11-08T10:00:00Z',events:[{status:'in_transit',description:'Test fixture transit event',timestamp:'2026-11-08T10:00:00Z',location:'Test city'}]})}));await page.getByRole('button',{name:'Track a Shipment'}).click();await page.locator('.wow-tracking-result').waitFor();assert.ok((await page.locator('.wow-tracking-result').innerText()).includes('In transit'));await page.unroute('**/api/tracking');result.checks.trackingStates=true;
     }
    }
    if(route==='/contact/'){
     await page.evaluate(()=>{window.__wowOpened=[];window.open=(url)=>{window.__wowOpened.push(String(url));return null}});
     await page.getByRole('button',{name:'Continue on WhatsApp'}).click();assert.equal(await page.evaluate(()=>window.__wowOpened.length),0);
     for(const [name,value]of [['name','Ravi Test'],['phone','+91 9000000000'],['origin','Mohali'],['destination','New Delhi'],['notes','Books & papers / fragile']])await page.locator(`[name="${name}"]`).fill(value);
     await page.locator('[name="service"]').selectOption({label:'Domestic shipping'});await page.getByRole('button',{name:'Continue on WhatsApp'}).click();await page.getByRole('heading',{name:'Your message is ready.'}).waitFor();const opened=await page.evaluate(()=>window.__wowOpened[0]);assert.ok(opened,'WhatsApp draft opens');const url=new URL(opened);assert.equal(url.pathname,'/917973546092');assert.ok(url.searchParams.get('text').includes('Books & papers / fragile'));assert.equal(await page.getByLabel('Your prepared enquiry message').inputValue(),url.searchParams.get('text'));result.checks.enquiry=true;
    }
    if(route!=='/')assert.equal(await page.evaluate(()=>!!window.__WOW_RUNTIME__),false);
    assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);result.checks.cleanBrowser=true;
   }catch(error){result.fatal=String(error);process.exitCode=1;console.error(width,route,result.fatal)}
   console.log(width,route,JSON.stringify({checks:result.checks,height:result.height,errors,bad,fatal:result.fatal}));await fs.writeFile('reference/wow/browser/results.json',JSON.stringify(results,null,2));await page.close();
  }
  await context.close();
 }
 if(!requested.length||requested.includes('reduced'))for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const result={viewport:{width,height:900},route:'reduced',checks:{}};results.push(result);
  try{await page.goto(origin,{waitUntil:'networkidle'});await page.mouse.move(width/2,400);await page.mouse.wheel(0,1000);await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>scrollY>100));assert.equal(await page.locator('canvas').count(),0);assert.equal(await page.evaluate(()=>!!window.__WOW_RUNTIME__),false);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const summary=page.locator('.wow-faq summary').first();await summary.press('Enter');assert.notEqual(await summary.locator('..').getAttribute('open'),null);await page.screenshot({path:`reference/wow/browser/reduced-${width}.png`});result.checks.reducedMotion=true}catch(e){result.fatal=String(e);process.exitCode=1}await page.close();console.log('reduced',width,JSON.stringify(result))
 }
}finally{await browser.close();await fs.writeFile('reference/wow/browser/results.json',JSON.stringify(results,null,2))}
