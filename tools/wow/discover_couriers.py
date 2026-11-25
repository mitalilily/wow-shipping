import concurrent.futures, json, re, urllib.request, urllib.parse
from pathlib import Path
out=Path('reference/wow/refresh');out.mkdir(parents=True,exist_ok=True)
sites={'blue-dart':'https://www.bluedart.com/','dtdc':'https://www.dtdc.com/','delhivery':'https://www.delhivery.com/','india-post':'https://www.indiapost.gov.in/','xpressbees':'https://www.xpressbees.com/','shadowfax':'https://www.shadowfax.in/','ekart':'https://www.ekartlogistics.in/','trackon':'https://www.trackon.in/','tci-express':'https://www.tciexpress.in/','professional':'https://www.tpcindia.com/','shree-maruti':'https://shreemaruti.com/','skyking':'https://skyking.co/'}
def get(item):
 key,url=item
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=22) as res:html=res.read().decode('utf-8','replace');base=res.url
  (out/(key+'.html')).write_text(html,encoding='utf8')
  candidates=[]
  for tag in re.findall(r'<(?:img|source)\b[^>]+>',html,re.I):
   if 'logo' not in tag.lower():continue
   for src in re.findall(r'(?:src|srcset|data-src)=["\']([^"\']+)',tag,re.I):
    if not src.startswith('data:'):candidates.append(urllib.parse.urljoin(base,src.split()[0]))
  for src in re.findall(r'["\']([^"\']*(?:logo|Logo)[^"\']*\.(?:svg|png|webp))["\']',html):candidates.append(urllib.parse.urljoin(base,src))
  return key,{'base':base,'candidates':list(dict.fromkeys(candidates))[:15]}
 except Exception as e:return key,{'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:result=dict(pool.map(get,sites.items()))
(out/'courier-candidates.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
