"""Convert reviewed homepage structure into React data and localize audited runtime assets.

Run after reference capture and recovery. Does not execute the recovered runtime.
"""
import hashlib
import json
from pathlib import Path
import re
from bs4 import BeautifulSoup,Comment,NavigableString,Tag

ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'reference'
manifest=json.loads((REF/'asset-manifest.json').read_text(encoding='utf-8'))
mapping={a['originalUrl']:'/'+a['localPath'].removeprefix('public/') for a in manifest if a['recoveryStatus']=='recovered'}
replacements=sorted(mapping.items(),key=lambda pair:len(pair[0]),reverse=True)
def localize(text):
    for source,target in replacements:
        text=text.replace(source,target).replace(source.replace('&','&amp;'),target)
    return text

def node(element):
    if isinstance(element,Comment):return None
    if isinstance(element,NavigableString):return str(element)
    if not isinstance(element,Tag):return None
    if element.name in {'script','iframe','noscript'}:return None
    classes=element.get('class',[])
    if any(c in classes for c in ['debug-area','w-commerce-commercecartwrapper']):return None
    attrs={k:(' '.join(v) if isinstance(v,list) else v) for k,v in element.attrs.items()
           if not k.startswith('on') and k not in {'data-w-id','data-wf-bindings'}}
    for key in ('src','srcset','poster','style','href'):
        if key in attrs:attrs[key]=localize(attrs[key])
    if element.name=='a':
        href=attrs.get('href','')
        if href.startswith('/') and not href.startswith(('/assets/','//')) and href!='/':
            attrs['href']='https://unitedcarriers.com'+href
        if attrs.get('href','').startswith('https://unitedcarriers.com'):
            attrs['data-barba-prevent']='all'
    children=[n for child in element.children if (n:=node(child)) is not None]
    if element.name=='style':children=[localize(element.get_text())]
    return {'tag':element.name,'attrs':attrs,'children':children}

def main():
    if (ROOT/'src/content/site.ts').exists():
        print('Original recovery generator is protected after the WOW rebrand. Use npm run prepare:site.')
        return
    soup=BeautifulSoup((REF/'source/raw.html').read_text(encoding='utf-8'),'html.parser')
    components={
      'GlobalDecor':soup.select_one('.component-global'),
      'Preloader':soup.select_one('.loader'),
      'PageTransition':soup.select_one('.trans'),
      'Header':soup.select_one('.header'),
    }
    page=soup.select_one('.main-inner')
    names={'page-css':'PageStyles','home-hero-wrap':'Hero','home-intro-wrap':'CompanyIntro',
      'home-service-wrap':'FreightJourney','home-why-wrap':'WhyUs','home-testi-wrap':'Testimonials',
      'home-partners-wrap':'Partners','home-ins-wrap':'Insights','home-faq-wrap':'FAQ',
      'home-cta-wrap':'FinalCTA','footer-wrap':'Footer'}
    for child in page.children:
        if isinstance(child,Tag):
            name=next((names[c] for c in child.get('class',[]) if c in names),None)
            if name:components[name]=child
    out=ROOT/'src/recovered'
    out.mkdir(parents=True,exist_ok=True)
    for name,element in components.items():
        (out/f'{name}.json').write_text(json.dumps(node(element),ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        directory=(ROOT/'src/components/navigation' if name=='Header' else
                   ROOT/'src/components/preloader' if name in {'Preloader','PageTransition'} else
                   ROOT/'src/components/footer' if name=='Footer' else
                   ROOT/'src/components/shared' if name in {'GlobalDecor','PageStyles'} else
                   ROOT/'src/sections'/name)
        directory.mkdir(parents=True,exist_ok=True)
        shared_import='./RecoveredTree' if directory.name=='shared' else '../../components/shared/RecoveredTree'
        source=(f"import tree from '../../recovered/{name}.json';\n"+
                f"import {{ RecoveredTree }} from '{shared_import}';\n\n"+
                f"/** Restored {name} structure; original SVGs and layout hooks retained. */\n"+
                f"export function {name}() {{ return <RecoveredTree tree={{tree}} />; }}\n")
        (directory/f'{name}.tsx').write_text(source,encoding='utf-8')
    # CSS/source are retained in original-assets; adaptations are made only in runtime copies.
    adapted=[]
    for item in manifest:
        path=ROOT/item['localPath']
        if item['recoveryStatus']!='recovered' or path.suffix not in {'.js','.css','.json'}:continue
        if path.suffix=='.js' and '/recovered/' not in str(path).replace('\\','/'):continue
        archive=REF/'original-assets'/path.relative_to(ROOT/'public/assets')
        text=(archive if archive.exists() else path).read_text(encoding='utf-8')
        text=localize(text)
        if path.name=='main.js':
            # Extend the recovered owner's deployment guard only to loopback development.
            marker='var E=['
            if marker in text:text=text.replace(marker,'var E=["localhost","127.0.0.1","[::1]",',1)
            else:
                marker='var E = ['
                assert marker in text,'Unrecognized domain guard; inspect before adaptation'
                text=text.replace(marker,marker+'\n  "localhost", "127.0.0.1", "[::1]",',1)
            # Test hooks expose existing controllers; they do not replace animation parameters.
            text+='\nwindow.__UC_RECONSTRUCTION__={gsap:t,ScrollTrigger:s,get lenis(){return p.lenis},get home(){return te.home},get ready(){return !!G.tlLoadMaster && G.tlLoadMaster.progress()>=1},destroy(){try{I.default.destroy()}catch{} try{te.home.destroy({current:{container:document.querySelector(".main-inner")},next:{container:document.querySelector(".main-inner")}})}catch{} P.destroy();s.getAll().forEach(st=>st.kill());p.lenis?.destroy();document.querySelectorAll("webflow-3d").forEach(el=>el.destroy?.())}};\n'
        if path.name.startswith('OceanScene-'):
            # Original origin-root asset base becomes the local recovered runtime root.
            text=text.replace('new URL("/",','new URL("/assets/recovered/",').replace('new URL("/", ','new URL("/assets/recovered/", ')
        if path.name=='vendor-three-DebrQqf4.js':
            # A resize/disposal can remove a program while compileAsync polls it.
            # Drop disposed entries; normal live-program readiness is unchanged.
            old='i.forEach(function(t){St.get(t).currentProgram.isReady()&&i.delete(t)})'
            new='i.forEach(function(t){const p=St.get(t).currentProgram;(!p||p.isReady())&&i.delete(t)})'
            assert text.count(old)==1,'Inspect changed Three.js async compilation source'
            text=text.replace(old,new)
        if 'my-flights-' in path.name:
            # world-atlas final redirected URL is mapped as well as the observed request URL.
            atlas=next((v for k,v in mapping.items() if 'land-110m.json' in k),None)
            if atlas:text=re.sub(r'https://unpkg\.com/world-atlas@[^/]+/land-110m\.json',atlas,text)
        path.write_text(text,encoding='utf-8')
        adapted.append({'path':str(path.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    # Shared exported stylesheet and original inline head style maintain the fluid sizing contract.
    stylesheet=soup.select_one('link[rel=stylesheet]')['href']
    styles='\n'.join(localize(e.get_text()) for e in soup.head.select('style'))
    (ROOT/'src/styles').mkdir(parents=True,exist_ok=True)
    (ROOT/'src/styles/recovered-head.css').write_text(styles,encoding='utf-8')
    favicon=next(k for k in mapping if 'Favicon' in k and 'ed3423' in k)
    metadata={'stylesheet':mapping[stylesheet],'favicon':mapping[favicon],
              'htmlAttributes':soup.html.attrs,'bodyClass':' '.join(soup.body.get('class',[])),
              'components':list(components),'runtimeAdaptations':adapted}
    (REF/'observations/recovery-build.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
    (ROOT/'src/recovered/metadata.json').write_text(json.dumps(metadata),encoding='utf-8')
    (ROOT/'index.html').write_text(f'''<!doctype html>
<html lang="en" class="w-mod-js" data-wf-page="6a44eec1ed1af2c4c403df38" data-wf-site="6a44eec1ed1af2c4c403df6b">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Freight forwarding, land transport, and customs brokerage, unified across APAC under one accountable team." />
    <meta name="theme-color" content="#111111" />
    <title>United Carriers | Global Freight Forwarding and Logistics</title>
    <link rel="icon" href="{metadata['favicon']}" />
    <link rel="stylesheet" href="{metadata['stylesheet']}" />
  </head>
  <body class="body">
    <div id="root"></div>
    <script src="/assets/vendor/jquery-3.5.1.min.js"></script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
''',encoding='utf-8')
    print('Prepared',len(components),'React section trees and',len(adapted),'localized code/style resources')

if __name__=='__main__':main()
