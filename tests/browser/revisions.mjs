import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const dir='reference/wow/revisions';await fs.mkdir(dir,{recursive:true});const footerOnly=process.argv.includes('--footer-only'),reportFile=`${dir}/${footerOnly?'footer-final':'results'}.json`;
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{
 for(const [width,height]of (footerOnly?[]:[[870,668],[390,844],[1440,900]])){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));const result={width,height,errors};results.push(result);
  try{
   await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.__WOW_RUNTIME__,null,{timeout:60000});await page.evaluate(()=>window.__WOW_RUNTIME__.gsap.ticker.lagSmoothing(0));await page.waitForFunction(()=>window.__WOW_RUNTIME__.ready,null,{timeout:60000});
   const move=async y=>{await page.evaluate(y=>window.__WOW_RUNTIME__.lenis.scrollTo(y,{immediate:true,force:true}),y);await page.waitForTimeout(220)};
   const stage=await page.locator('.wow-flight-section').evaluate(e=>({top:e.getBoundingClientRect().top+(innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY),height:e.offsetHeight}));
   for(let y=0;y<stage.top;y+=Math.floor(height*.8))await move(y);
   const positions=[];for(const progress of [0,.5,1,0]){await move(stage.top+progress*(stage.height-height));await page.waitForTimeout(900);positions.push(await page.locator('.wow-flight-aircraft').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return{x:m.m41,angle:Math.atan2(m.b,m.a),scale:Math.hypot(m.a,m.b)}}))}
   assert.ok(positions[1].x>positions[0].x+5&&positions[2].x>positions[1].x+5,'Forward scroll must move the right-facing aircraft right');assert.ok(Math.abs(positions[3].x-positions[0].x)<3,'Reverse scroll returns to its starting position');for(const p of positions){assert.ok(Math.abs(p.angle-positions[0].angle)<.001);assert.ok(Math.abs(p.scale-1)<.001)}result.aircraft=positions;
   await move(stage.top+(stage.height-height)*.5);await page.waitForTimeout(800);await page.screenshot({path:`${dir}/air-${width}.png`});assert.equal(await page.locator('.wow-route-ribbon,.wow-flight-route,.wow-footer-signature svg').count(),0);
   const max=await page.evaluate(()=>{const e=innerWidth<=767?document.querySelector('.body-inner'):document.documentElement;return e.scrollHeight-innerHeight});for(let y=stage.top;y<max;y+=height*.8)await move(y);await move(max);
   await page.waitForSelector('.wow-particle-signature.is-ready',{timeout:15000});await page.waitForTimeout(1500);const signature=page.locator('.wow-particle-signature');result.particles=Number(await signature.getAttribute('data-particles'));assert.ok(result.particles>100);
   const map=await page.locator('.wow-footer-map').evaluate(e=>({loaded:e.complete&&e.naturalWidth>0,opacity:Number(getComputedStyle(e).opacity),pointerEvents:getComputedStyle(e).pointerEvents}));assert.ok(map.loaded&&map.opacity>0&&map.opacity<.2&&map.pointerEvents==='none');result.map=map;
   await page.screenshot({path:`${dir}/footer-${width}.png`});const before=await page.locator('.wow-particle-canvas').evaluate(e=>e.toDataURL());await signature.click();await page.waitForTimeout(100);const scattered=await page.locator('.wow-particle-canvas').evaluate(e=>e.toDataURL());assert.notEqual(before,scattered);await page.screenshot({path:`${dir}/scatter-${width}.png`});await page.mouse.move(0,0);await page.waitForTimeout(1500);await signature.focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.notEqual(await page.locator('.wow-particle-canvas').evaluate(e=>e.toDataURL()),before);result.pointerAndKeyboardScatter=true;
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);result.passed=true;
  }catch(e){result.fatal=String(e);process.exitCode=1}console.log(JSON.stringify(result));await fs.writeFile(reportFile,JSON.stringify(results,null,2));await page.close();
 }
 for(const reducedMotion of ['no-preference','reduce']){
  const page=await browser.newPage({viewport:{width:870,height:668},reducedMotion}),errors=[];page.on('pageerror',e=>errors.push(String(e)));const result={page:'about',reducedMotion,errors};results.push(result);
  try{await page.goto('http://127.0.0.1:4173/about/');await page.locator('.wow-footer-signature').scrollIntoViewIfNeeded();if(reducedMotion==='reduce'){assert.equal(await page.locator('canvas').count(),0);assert.equal(await page.locator('.wow-particle-signature.is-ready').count(),0)}else{
   await page.waitForSelector('.wow-particle-signature.is-ready');assert.ok(Number(await page.locator('.wow-particle-signature').getAttribute('data-particles'))>100);
   await page.keyboard.press('Tab');await page.locator('.wow-footer-signature').focus();result.focus=await page.locator('.wow-footer-signature').evaluate(e=>({visible:e.matches(':focus-visible'),style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.ok(result.focus.visible&&result.focus.style==='solid'&&result.focus.width==='2px');
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.locator('.wow-footer-signature').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));result.resize=true;
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);assert.equal(await page.locator('canvas').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForSelector('.wow-particle-signature.is-ready');result.liveMotionPreference=true;
  }assert.deepEqual(errors,[]);result.passed=true}catch(e){result.fatal=String(e);process.exitCode=1}console.log(JSON.stringify(result));await fs.writeFile(reportFile,JSON.stringify(results,null,2));await page.close();
 }
}finally{await browser.close()}
