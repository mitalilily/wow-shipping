"""Capture the authorized reference without executing downloaded code in Node/Python."""
import asyncio
import hashlib
import json
from pathlib import Path
import time
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
REF = ROOT / 'reference'

async def main():
    (REF/'screenshots/desktop-1440').mkdir(parents=True,exist_ok=True)
    (REF/'observations').mkdir(parents=True,exist_ok=True)
    (REF/'source').mkdir(parents=True,exist_ok=True)
    requests=[]
    errors=[]
    responses=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(channel='chrome',headless=True)
        page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
        page.on('request',lambda r:requests.append({'url':r.url,'type':r.resource_type,'method':r.method}))
        page.on('pageerror',lambda e:errors.append(str(e)))
        async def response(r):
            row={'url':r.url,'status':r.status,'contentType':r.headers.get('content-type','')}
            responses.append(row)
            if r.request.resource_type in {'document','stylesheet','script'} and r.status==200:
                try:
                    data=await r.body()
                    ext={'document':'.html','stylesheet':'.css','script':'.js'}[r.request.resource_type]
                    name=hashlib.sha256(r.url.encode()).hexdigest()[:16]+ext
                    (REF/'source'/name).write_bytes(data)
                    row['sourceFile']='reference/source/'+name
                except Exception as exc: row['saveError']=str(exc)
        pending=[]
        page.on('response',lambda r:pending.append(asyncio.create_task(response(r))))
        started=time.monotonic()
        await page.goto('https://unitedcarriers.com/',wait_until='domcontentloaded',timeout=60000)
        for seconds in (0,1,3,6,12):
            await asyncio.sleep(max(0,seconds-(time.monotonic()-started)))
            await page.screenshot(path=str(REF/f'screenshots/desktop-1440/load-{seconds:02}.png'))
        await page.screenshot(path=str(REF/'screenshots/desktop-1440/full-initial.png'),full_page=True)
        data=await page.evaluate('''() => ({
          title:document.title,url:location.href,dpr:devicePixelRatio,width:innerWidth,height:innerHeight,
          scrollHeight:document.documentElement.scrollHeight,text:document.body.innerText,
          html:document.documentElement.outerHTML,
          headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({tag:e.tagName,text:e.innerText,class:e.className,y:e.getBoundingClientRect().top+scrollY})),
          sections:[...document.querySelectorAll('section,header,footer')].map(e=>({tag:e.tagName,id:e.id,class:e.className,y:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height})),
          links:[...document.querySelectorAll('a')].map(e=>({text:e.innerText,href:e.href,class:e.className})),
          images:[...document.images].map(e=>({src:e.currentSrc||e.src,alt:e.alt,w:e.naturalWidth,h:e.naturalHeight,class:e.className})),
          canvases:[...document.querySelectorAll('canvas')].map(e=>({width:e.width,height:e.height,class:e.className})),
          fonts:[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status})),
          globals:{gsap:!!window.gsap,ScrollTrigger:!!window.ScrollTrigger,THREE:!!window.THREE,Lenis:!!window.Lenis},
          styles:[...document.querySelectorAll('h1,h2,header,nav,body')].map(e=>{let s=getComputedStyle(e);return {tag:e.tagName,class:e.className,text:e.innerText.slice(0,120),font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,color:s.color,background:s.backgroundColor,padding:s.padding,position:s.position}})
        })''')
        (REF/'source/rendered.html').write_text(data.pop('html'),encoding='utf-8')
        (REF/'observations/initial-audit.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
        await asyncio.gather(*pending,return_exceptions=True)
        (REF/'observations/network.json').write_text(json.dumps({'requests':requests,'responses':responses,'errors':errors,'browserVersion':browser.version},indent=2),encoding='utf-8')
        print(json.dumps({k:v for k,v in data.items() if k in ['title','scrollHeight','headings','sections','canvases','globals','fonts']},indent=2))
        print('Requests:',len(requests),'Errors:',errors)
        await browser.close()

if __name__=='__main__': asyncio.run(main())
