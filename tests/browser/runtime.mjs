import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.stack||String(e)));
const result={errors,resize:[]};
try{
 await page.goto(process.env.TEST_ORIGIN||'http://127.0.0.1:4173');
 await page.waitForFunction(()=>window.__UC_RECONSTRUCTION__,null,{timeout:60000});await page.evaluate(()=>window.__UC_RECONSTRUCTION__.gsap.ticker.lagSmoothing(0));await page.waitForFunction(()=>window.__UC_RECONSTRUCTION__.ready,null,{timeout:60000});
 result.renderer=await page.evaluate(()=>[...document.querySelectorAll('canvas')].map(c=>{const gl=c.getContext('webgl2')||c.getContext('webgl');if(!gl)return null;const ext=gl.getExtension('WEBGL_debug_renderer_info');return {width:c.width,height:c.height,vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}}).filter(Boolean));
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(3000);
  const state=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,title:document.querySelector('h1').innerText,canvases:document.querySelectorAll('canvas').length}));assert.ok(state.documentWidth<=width+1);assert.ok(state.title.includes('SHIPPING.'));result.resize.push(state);
 }
 await page.evaluate(()=>window.__UC_RECONSTRUCTION__.destroy());await page.waitForTimeout(500);
 result.triggersAfterDestroy=await page.evaluate(()=>window.__UC_RECONSTRUCTION__.ScrollTrigger.getAll().length);assert.equal(result.triggersAfterDestroy,0);assert.equal(errors.length,0);
 result.passed=true;
}catch(error){result.fatal=String(error);process.exitCode=1}
finally{await browser.close();await fs.writeFile('reference/local/runtime-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result))}
