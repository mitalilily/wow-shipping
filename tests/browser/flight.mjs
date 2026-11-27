import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];await fs.mkdir('reference/wow/flight',{recursive:true});
try{for(const [width,height]of [[1440,900],[1920,1080],[768,1024],[390,844],[870,668],[1531,668]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.stack||String(e)));const result={width,height,errors,captures:[]};results.push(result);
 try{await page.goto(origin);await page.waitForFunction(()=>window.__WOW_RUNTIME__,null,{timeout:60000});await page.evaluate(()=>window.__WOW_RUNTIME__.gsap.ticker.lagSmoothing(0));await page.waitForFunction(()=>window.__WOW_RUNTIME__.ready,null,{timeout:60000});
  const stage=await page.locator('.wow-flight-section').evaluate(e=>({top:e.getBoundingClientRect().top+(innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY),height:e.getBoundingClientRect().height}));
  const move=async y=>{await page.evaluate(y=>window.__WOW_RUNTIME__.lenis.scrollTo(y,{immediate:true,force:true}),y);await page.waitForTimeout(220)};
  for(let y=0;y<stage.top;y+=Math.floor(height*.8))await move(y);
  for(const t of [0,.5,1]){const y=stage.top+t*Math.max(0,stage.height-height);await move(y);await page.waitForTimeout(700);const plane=await page.locator('.wow-flight-aircraft').evaluate(e=>{const r=e.getBoundingClientRect();return{visible:r.right>0&&r.left<innerWidth&&r.bottom>72&&r.top<innerHeight,loaded:e.complete&&e.naturalWidth>0}});assert.ok(plane.visible&&plane.loaded);assert.ok(await page.locator('#flight-title').isVisible());assert.ok(await page.locator('#flight-title').evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(Math.min(innerWidth-2,r.left+r.width/2),Math.min(innerHeight-2,r.top+r.height/2));return !!hit&&!!e.closest('.wow-flight-section')?.contains(hit)}),'The flight chapter must not be covered by the earlier pinned scene');const file=`${width}-${t}.png`;await page.screenshot({path:'reference/wow/flight/'+file});result.captures.push(file)}
  await move(stage.top+stage.height);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);result.passed=true;
 }catch(e){result.fatal=String(e);process.exitCode=1}console.log(JSON.stringify(result));await fs.writeFile('reference/wow/flight/results.json',JSON.stringify(results,null,2));await page.close()
}}finally{await browser.close()}
