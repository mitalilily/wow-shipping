"""Extract original content for the native-scroll accessibility mode."""
import json
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2]
soup=BeautifulSoup((ROOT/'reference/source/raw.html').read_text(encoding='utf-8'),'html.parser')
manifest=json.loads((ROOT/'reference/asset-manifest.json').read_text(encoding='utf-8'))
urls={a['originalUrl']:'/'+a['localPath'].removeprefix('public/') for a in manifest if a['recoveryStatus']=='recovered'}
sections=[]
for name,selector in [('Company','.home-intro-wrap'),('Services','.home-service-wrap'),('Why us','.home-why-wrap'),('Testimonials','.home-testi-wrap'),('Partners','.home-partners-wrap'),('Insights','.home-ins-wrap'),('Get in touch','.home-cta-wrap')]:
    el=soup.select_one(selector);blocks=[];seen=set()
    for node in el.select('h2,h3,.txt'):
        if node.find_parent(['h2','h3']) or any('txt' in p.get('class',[]) for p in node.parents if p!=el):continue
        text=node.get_text(' ',strip=True)
        if len(text)<4 or text in seen or text=='km/h':continue
        seen.add(text);blocks.append({'tag':node.name if node.name in ['h2','h3'] else 'p','text':text})
    images=[]
    if name in ['Company','Services','Insights']:
        for img in el.select('img[alt]'):
            if len(img.get('alt',''))>15 and img.get('src') in urls:
                images.append({'src':urls[img['src']],'alt':img['alt']})
                if len(images)>=(3 if name=='Insights' else 1):break
    sections.append({'name':name,'blocks':blocks,'images':images})
faq=[]
for item in soup.select('.home-faq-main-item'):
    answer=item.select_one('.home-faq-main-item-ans')
    question=item.select_one('.home-faq-main-item-title')
    faq.append({'question':question.get_text(' ',strip=True),'answer':answer.get_text(' ',strip=True)})
(ROOT/'src/recovered/ReducedMotionContent.json').write_text(json.dumps({'sections':sections,'faq':faq},ensure_ascii=False,indent=2),encoding='utf-8')
print('Static content:',len(sections),'sections,',len(faq),'questions')
