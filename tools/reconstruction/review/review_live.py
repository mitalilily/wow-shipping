import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path.cwd();OUT=ROOT/'reference/review';OUT.mkdir(exist_ok=True)
PROBE='''()=>({y:scrollY,height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,viewport:innerWidth,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getBoundingClientRect().height>0).map(e=>{let r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,class:e.className,text:e.innerText,x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontSize,opacity:s.opacity,transform:s.transform}}),broken:[...document.images].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.currentSrc),canvases:[...document.querySelectorAll('canvas')].map(e=>({id:e.id,w:e.width,h:e.height})),sections:[...document.querySelectorAll('.main-inner>div')].map(e=>({class:e.className,height:e.getBoundingClientRect().height}))})'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='chrome',headless=True)
  results=[]
  for name,w,h in [('desktop-1440',1440,900),('mobile',390,844)]:
   page=await browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1);errors=[];bad=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('response',lambda r:bad.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
   await page.goto('http://127.0.0.1:4173',wait_until='domcontentloaded',timeout=60000)
   await page.wait_for_function('window.__UC_RECONSTRUCTION__',timeout=30000)
   await page.evaluate('window.__UC_RECONSTRUCTION__.gsap.ticker.lagSmoothing(0)')
   await page.wait_for_function('window.__UC_RECONSTRUCTION__.ready',timeout=60000)
   await page.wait_for_timeout(1600)
   print(name,'ready',flush=True)
   data={'viewport':[w,h],'initial':await page.evaluate(PROBE),'snapshots':[]}
   await page.screenshot(path=str(OUT/f'{name}-hero.png'),timeout=10000)
   maximum=await page.evaluate('document.documentElement.scrollHeight-innerHeight')
   for i,y in enumerate(list(range(0,int(maximum),int(h*.8)))+[maximum]):
    await page.evaluate('(y)=>window.__UC_RECONSTRUCTION__.lenis.scrollTo(y,{immediate:true,force:true})',y)
    await page.wait_for_timeout(400)
    state=await page.evaluate(PROBE)
    data['snapshots'].append(state)
    if i%4==0 or y==maximum:
     try:await page.screenshot(path=str(OUT/f'{name}-{i:02}-{int(y):05}.png'),timeout=10000)
     except Exception as e:errors.append('capture:'+str(e)[:100])
   data.update(errors=errors,bad=bad,final=await page.evaluate(PROBE))
   (OUT/f'{name}.json').write_text(json.dumps(data,indent=2),encoding='utf-8');results.append(data)
   print(name,'done',maximum,'errors',errors,'bad',bad[:3],flush=True)
   await page.close()
  await browser.close()
asyncio.run(main())
