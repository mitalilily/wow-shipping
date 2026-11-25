"""Capture responsive layouts, scroll checkpoints, interactions, styles and resource URLs."""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'reference'
VIEWPORTS={'desktop-1440':(1440,900),'desktop-1920':(1920,1080),'tablet':(768,1024),'mobile':(390,844)}
LENIS='https://united-carriers.netlify.app/chunks/lenis-_dxIi_hK.js'
STYLE_PROBE='''() => {
 const pick=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {
   tag:e.tagName,class:e.className,text:e.innerText?.slice(0,140),x:r.x,y:r.y,width:r.width,height:r.height,
   color:s.color,background:s.backgroundColor,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,padding:s.padding,margin:s.margin,display:s.display,position:s.position,transform:s.transform,opacity:s.opacity}};
 const scrollOwner=innerWidth<=767?document.querySelector('.body-inner'):document.documentElement;
 const scrollY=innerWidth<=767?scrollOwner.scrollTop:window.scrollY;
 return {scrollY,scrollHeight:scrollOwner.scrollHeight,dpr:devicePixelRatio,
   sections:[...document.querySelectorAll('main section,.main-inner section,.cta,footer')].filter(e=>e.getBoundingClientRect().height>0).map(e=>({...pick(e),documentY:e.getBoundingClientRect().top+scrollY})),
   headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getBoundingClientRect().height>0).map(pick),
   buttons:[...document.querySelectorAll('.header a,.home-hero-btn,.home-faq-main-item')].map(pick),
   media:[...document.querySelectorAll('img,canvas,webflow-3d')].filter(e=>{let r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}).map(e=>({...pick(e),src:e.currentSrc||e.src||null})),
   resources:performance.getEntriesByType('resource').map(e=>({url:e.name,type:e.initiatorType,size:e.transferSize}))};
}'''

async def scroll(page,y):
    await page.evaluate('''async ({url,y})=>{const m=await import(url); if(m.n?.lenis)m.n.lenis.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y)}''',{'url':LENIS,'y':y})
    await page.wait_for_timeout(450)

async def main():
    all_requests=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(channel='chrome',headless=True,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for name,(width,height) in VIEWPORTS.items():
            if len(sys.argv)>1 and name not in sys.argv[1:]:continue
            out=REF/'screenshots'/name
            out.mkdir(parents=True,exist_ok=True)
            context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
            page=await context.new_page()
            errors=[]
            page.on('request',lambda r:all_requests.append({'url':r.url,'type':r.resource_type}))
            page.on('pageerror',lambda e:errors.append(str(e)))
            await page.goto('https://unitedcarriers.com/',wait_until='domcontentloaded')
            await page.evaluate('''async ()=>{const m=await import('https://united-carriers.netlify.app/chunks/vendor-gsap-GRoENYFU.js');m.i.ticker.lagSmoothing(0)}''')
            await page.wait_for_timeout(11000)
            if width<=767:
                await page.wait_for_function("document.querySelector('.body-inner').scrollHeight>innerHeight*2",timeout=60000)
            await page.screenshot(path=str(out/'hero.png'),timeout=60000)
            data=await page.evaluate(STYLE_PROBE)
            snapshots=[]
            maximum=data['scrollHeight']-height
            positions=list(range(0,int(maximum),int(height*.8)))+[int(maximum)]
            previous=REF/'observations'/f'{name}-checkpoints.json'
            existing=json.loads(previous.read_text(encoding='utf-8')) if previous.exists() and width>767 else []
            for i,y in enumerate(positions):
                try:await scroll(page,y)
                except Exception as exc:errors.append('Scroll initialization '+str(y)+': '+str(exc)[:180])
                if i<len(existing):
                    snapshots.append(existing[i])
                    continue
                destination=out/f'scroll-{i:03}-{y:05}.png'
                if not destination.exists():
                    try:await page.screenshot(path=str(destination),timeout=15000)
                    except Exception as exc:errors.append('Screenshot '+str(y)+': '+str(exc)[:200])
                state=await page.evaluate(STYLE_PROBE)
                snapshots.append({k:v for k,v in state.items() if k!='resources'})
                (REF/'observations'/f'{name}-checkpoints.json').write_text(json.dumps(snapshots,indent=2),encoding='utf-8')
            await scroll(page,0)
            try:await page.screenshot(path=str(out/'full-page.png'),full_page=True,timeout=15000)
            except Exception as exc:errors.append('Full page capture: '+str(exc)[:200])
            # Inspect observed menu and FAQ controls by actual source selectors.
            controls=await page.locator('.header').evaluate('e=>[...e.querySelectorAll("a,button,[data-menu]")].map(e=>({tag:e.tagName,class:e.className,text:e.innerText}))')
            result={'viewport':{'width':width,'height':height,'dpr':1},'initial':data,'checkpoints':snapshots,'errors':errors,'headerControls':controls}
            (REF/'observations'/f'{name}.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
            for selector in ['.header-menu-toggle']:
                control=page.locator(selector).first
                if await control.count() and await control.is_visible():
                    try:
                        await control.click(timeout=5000)
                        await page.wait_for_timeout(900)
                        await page.screenshot(path=str(out/'menu-open.png'),timeout=15000)
                        await control.click(timeout=5000)
                    except Exception as exc:errors.append('Menu interaction: '+str(exc)[:300])
                    break
            faq=page.locator('.home-faq-main-item').first
            if await faq.count():
                y=await faq.evaluate('e=>e.getBoundingClientRect().top+scrollY-innerHeight*.3')
                try:
                    await scroll(page,y)
                    await faq.click(timeout=5000)
                    await page.wait_for_timeout(600)
                    await page.screenshot(path=str(out/'faq-open.png'),timeout=15000)
                    await faq.click(timeout=5000)
                except Exception as exc:errors.append('FAQ interaction: '+str(exc)[:300])
            # A reverse-scroll checkpoint proves whether scrubbed frames rewind.
            try:
                await scroll(page,maximum*.35)
                await page.screenshot(path=str(out/'reverse-35.png'),timeout=15000)
            except Exception as exc:errors.append('Reverse capture: '+str(exc)[:200])
            result={'viewport':{'width':width,'height':height,'dpr':1},'initial':data,'checkpoints':snapshots,'errors':errors,'headerControls':controls}
            (REF/'observations'/f'{name}.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
            print(name,'captured',len(positions),'scroll checkpoints; height',data['scrollHeight'],'errors',len(errors),flush=True)
            await context.close()
        await browser.close()
    unique={x['url']:x for x in all_requests}
    (REF/'observations/all-requests.json').write_text(json.dumps(list(unique.values()),indent=2),encoding='utf-8')

if __name__=='__main__':asyncio.run(main())
