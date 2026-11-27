import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
const dir='reference/wow/inner-pages/clouds';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{for(const [width,height]of [[870,668],[390,844],[1440,900]]){
 const page=await browser.newPage({viewport:{width,height}}),errors=[],report={width,height,errors,frames:[]};results.push(report);page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__WOW_RUNTIME__?.ready,null,{timeout:60000});
  await page.waitForFunction(()=>window.__WOW_RUNTIME__?.ScrollTrigger.getById('wow-aircraft-flight'),null,{timeout:15000});
  const top=await page.locator('.wow-flight-section').evaluate(e=>e.getBoundingClientRect().top+(innerWidth<=767?document.querySelector('.body-inner').scrollTop:scrollY));
  const move=async y=>{await page.evaluate(y=>window.__WOW_RUNTIME__.lenis.scrollTo(y,{immediate:true,force:true}),y);await page.waitForTimeout(1050)};
  for(let y=0;y<top-height;y+=height*.8){await page.evaluate(y=>window.__WOW_RUNTIME__.lenis.scrollTo(y,{immediate:true,force:true}),y);await page.waitForTimeout(80)}
  for(const fraction of [-.8,-.5,-.2,0,.25,.6]){
   await move(top+height*fraction);
   const frame=await page.locator('.wow-flight-section').evaluate(e=>{
    const style=s=>getComputedStyle(e.querySelector(s));const plane=e.querySelector('.wow-flight-aircraft');const m=new DOMMatrix(style('.wow-flight-aircraft').transform);const title=e.querySelector('#flight-title'),r=title.getBoundingClientRect();
    return {bridgeOpacity:Number(style('.wow-sea-air-bridge').opacity),copyOpacity:Number(style('.wow-flight-copy').opacity),frontCloudOpacity:Number(style('.wow-flight-cloud-front').opacity),backCloudOpacity:Number(style('.wow-flight-cloud-back').opacity),x:m.m41,planeOpacity:Number(style('.wow-flight-aircraft').opacity),planeLoaded:plane.complete&&plane.naturalWidth>0,titleInView:r.top>=72&&r.bottom<innerHeight};
   });report.frames.push({fraction,...frame});
   assert.ok(frame.bridgeOpacity<=.3,'The transition must stay translucent');assert.equal(frame.copyOpacity,1,'Copy stays readable throughout the transition');assert.ok(frame.frontCloudOpacity<=.12&&frame.backCloudOpacity<=.18,'Clouds remain restrained');assert.ok(frame.planeLoaded);
   await page.screenshot({path:`${dir}/${width}-${fraction}.png`});
  }
  const reading=report.frames.filter(f=>f.fraction>=0);assert.ok(reading.every(f=>f.planeOpacity>.95));assert.ok(reading.at(-1).x>reading[0].x+5,'The aircraft glides forwards');assert.ok(reading.at(-1).bridgeOpacity<.02,'Clouds clear the reading area');
  await move(top);const reversed=await page.locator('.wow-flight-aircraft').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41);assert.ok(Math.abs(reversed-reading[0].x)<4,'Reverse scrolling retraces the flight');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);report.passed=true;
 }catch(e){report.fatal=String(e);process.exitCode=1}
 console.log(JSON.stringify(report));await fs.writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));await page.close();
}}finally{await browser.close()}
