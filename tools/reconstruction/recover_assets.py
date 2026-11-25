"""Recover authorized static assets; keep originals, provenance and local runtime copies."""
import concurrent.futures
import hashlib
import io
import json
import mimetypes
from pathlib import Path
import re
import time
from urllib.parse import urlparse,unquote,urljoin
import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'reference'
PUBLIC=ROOT/'public/assets'
CDN='cdn.prod.website-files.com'
APP='united-carriers.netlify.app'
ALLOWED={CDN,APP,'unpkg.com','d3e54v103j8qbb.cloudfront.net'}
URL_RE=re.compile(r'https?://[^\s\x22\x27<>`\\]+?\.(?:avif|png|svg|jpe?g|webp|woff2?|ttf|otf|webm|mp4|glb|gltf|ktx2|wasm|js|css|json)(?:\?[^\s\x22\x27<>`\\)]*)?')
network=json.loads((REF/'observations/network.json').read_text(encoding='utf-8'))
raw=(REF/'source/raw.html').read_text(encoding='utf-8')
sources=[x for x in network['responses'] if x.get('sourceFile') and urlparse(x['url']).hostname in {CDN,APP}]
urls=set()
for text in [raw]+[(ROOT/x['sourceFile']).read_text(encoding='utf-8') for x in sources]:
    urls.update(u.replace('&amp;','&') for u in URL_RE.findall(text) if urlparse(u).hostname==CDN)
for request in network['requests']:
    if urlparse(request['url']).hostname in ALLOWED and request['type'] in {'image','font','media','stylesheet','fetch'}:
        urls.add(request['url'])
for source in sources:
    urls.add(source['url'])
urls={url for url in urls if urlparse(url).path not in {'','/'}}
# Exact public jQuery version observed on the reference.
urls.update(x['url'] for x in network['requests'] if 'jquery-3.5.1.min' in x['url'])
# Only source-observed module dependencies and /images paths, not speculative filenames.
for source in sources:
    if urlparse(source['url']).hostname!=APP: continue
    text=(ROOT/source['sourceFile']).read_text(encoding='utf-8')
    for value in re.findall(r'[\x22\x27]([^\x22\x27\n]+)[\x22\x27]',text):
        if re.search(r'\.(?:webp|png|jpg|avif|glb|gltf|ktx2|hdr|mp4|webm)$',value) and not value.startswith('http'):
            urls.add(urljoin(source['url'],value))

def location(url):
    p=urlparse(url)
    filename=unquote(p.path.rsplit('/',1)[-1]) or 'resource'
    filename=re.sub(r'[^\w.\-]+','-',filename)
    if p.hostname==APP:
        return Path('public/assets/recovered')/p.path.lstrip('/')
    if 'jquery-3.5.1.min' in filename:
        return Path('public/assets/vendor/jquery-3.5.1.min.js')
    suffix=Path(filename).suffix.lower()
    folder=('fonts' if suffix in {'.woff','.woff2','.ttf','.otf'} else
            'styles' if suffix=='.css' else 'data' if suffix=='.json' else 'vendor' if suffix=='.js' else
            'videos' if suffix in {'.mp4','.webm','.mov'} else
            'models' if suffix in {'.glb','.gltf','.bin'} else
            'svg' if suffix=='.svg' else 'sequences' if 'frame_' in filename else 'images')
    return Path('public/assets')/folder/filename

def download(url):
    local=location(url)
    dest=ROOT/local
    item={'originalUrl':url,'localPath':str(local).replace('\\','/'),'filename':dest.name,
          'fileType':dest.suffix.lstrip('.'),'recoveryStatus':'not recovered','confidence':'verified',
          'suspectedSection':'freight journey' if 'frame_' in dest.name else 'shared/homepage',
          'suspectedPurpose':'original browser-delivered resource','authorization':'User states authorized restoration of lost original project'}
    for attempt in range(3):
        try:
            if not dest.exists():
                response=requests.get(url,timeout=60)
                response.raise_for_status()
                data=response.content
                dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_bytes(data)
                item['contentType']=response.headers.get('content-type','')
            else:
                archive=REF/'original-assets'/local.relative_to('public/assets')
                # Runtime copies may already be localized. Keep the manifest's
                # provenance hash tied to original downloaded bytes on reruns.
                data=(archive if dest.suffix in {'.js','.css','.json'} and archive.exists() else dest).read_bytes()
                item['contentType']=mimetypes.guess_type(dest.name)[0]
            item.update(fileSize=len(data),sha256=hashlib.sha256(data).hexdigest(),recoveryStatus='recovered',dimensions=None)
            try:
                image=Image.open(io.BytesIO(data))
                item['dimensions']={'width':image.width,'height':image.height,'mode':image.mode}
            except Exception:pass
            # Preserve original bytes separately before any URL rewrites or adaptations.
            if dest.suffix in {'.js','.css','.json'}:
                archive=REF/'original-assets'/local.relative_to('public/assets')
                archive.parent.mkdir(parents=True,exist_ok=True)
                if not archive.exists():archive.write_bytes(data)
            return item
        except Exception as exc:
            item['notes']=str(exc)
            if attempt<2:time.sleep(1+attempt)
    return item

def main():
    print('Discovered static resources:',len(urls),flush=True)
    items=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for i,item in enumerate(pool.map(download,sorted(urls))):
            item['id']=f'asset-{i+1:04}'
            items.append(item)
            if (i+1)%40==0:print('Recovered',i+1,'/',len(urls),flush=True)
            (REF/'asset-manifest.json').write_text(json.dumps(items,indent=2),encoding='utf-8')
    total=sum(x.get('fileSize',0) for x in items)
    print('Recovered',sum(x['recoveryStatus']=='recovered' for x in items),'of',len(items),'bytes',total,flush=True)
    print('Failures:',[(x['originalUrl'],x.get('notes')) for x in items if x['recoveryStatus']!='recovered'])

if __name__=='__main__':main()
