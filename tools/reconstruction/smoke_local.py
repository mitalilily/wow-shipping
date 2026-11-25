import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'reference/local'
async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='chrome',headless=True)
        page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
        errors=[];failed=[];console=[];urls=[]
        page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e)[:500],flush=True)))
        page.on('console',lambda e:console.append({'type':e.type,'text':e.text}) if e.type in {'error','warning'} else None)
        page.on('requestfailed',lambda r:failed.append({'url':r.url,'error':r.failure}))
        page.on('request',lambda r:urls.append(r.url))
        origin=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4173'
        await page.goto(origin+'/',wait_until='domcontentloaded',timeout=120000)
        print('Document loaded',origin,flush=True)
        await page.wait_for_timeout(2000)
        print('Initial state',await page.evaluate('''()=>({ready:window.__UC_RECONSTRUCTION__?.ready,bootError:window.__UC_BOOT_ERROR__,height:document.documentElement.scrollHeight,triggers:window.__UC_RECONSTRUCTION__?.ScrollTrigger.getAll().length})'''),flush=True)
        for seconds in (1,4,12):
            await page.wait_for_timeout((seconds-(0 if seconds==1 else 1 if seconds==4 else 4))*1000)
            try:await page.screenshot(path=str(OUT/f'load-{seconds:02}.png'),timeout=10000)
            except Exception as exc:print('Screenshot error',str(exc)[:120],flush=True)
        result=await page.evaluate('''()=>({title:document.title,height:document.documentElement.scrollHeight,ready:window.__UC_RECONSTRUCTION__?.ready,bootError:window.__UC_BOOT_ERROR__,triggers:window.__UC_RECONSTRUCTION__?.ScrollTrigger.getAll().length,h1:document.querySelector('h1')?.innerText,bodyFont:getComputedStyle(document.body).fontFamily,canvas:[...document.querySelectorAll('canvas')].map(e=>({class:e.className,width:e.width,height:e.height}))})''')
        result.update(errors=errors,failed=failed,console=console,externalRequests=[u for u in urls if not u.startswith(origin)])
        (OUT/'smoke.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
        print(json.dumps(result,indent=2))
        await browser.close()
if __name__=='__main__':asyncio.run(main())
