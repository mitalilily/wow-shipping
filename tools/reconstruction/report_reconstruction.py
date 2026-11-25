"""Generate measured comparison evidence and indexes from captured artifacts."""
import json,collections,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageOps

ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'reference'
def read(path):return json.loads(path.read_text(encoding='utf-8'))
def write(path,value):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,indent=2,ensure_ascii=False),encoding='utf-8')
manifest=read(REF/'asset-manifest.json');recovered=[a for a in manifest if a['recoveryStatus']=='recovered']
types=collections.Counter(a['fileType'] for a in recovered)
scenes={
 'Hero':{'implementation':'Procedural point globe and animated flight arcs; original DOM headline','runtime':'my-flights-DRrlP7HY.js','assets':'world-atlas land-110m JSON; original hero blur images'},
 'CompanyIntro':{'implementation':'Original DOM, image and counters','assets':'company introduction photograph and original fonts'},
 'FreightJourney':{'implementation':'AVIF frame-sequence canvases, layered crane/truck/ship/airplane images; procedural Three.js ocean','runtime':'Home-CZ3JhV-m.js, frame-sequence-DVzLzLQ6.js, OceanScene-CggVSafL.js, WakeSimulation-BBrDm1Iz.js','assets':'crane/truck AVIF sequences, container layers, tires, ocean normal/env/overlay textures, ship, airplane, clouds'},
 'WhyUs':{'implementation':'Original SVG icon and DOM copy reveals'},
 'Testimonials':{'implementation':'Original customer text and portraits'},
 'Partners':{'implementation':'Original partner logo grid'},
 'Insights':{'implementation':'Original three article cards and public article links'},
 'FAQ':{'implementation':'Original accordion with keyboard equivalents'},
 'FinalCTA':{'implementation':'Original large typography and contact link'},
 'Footer':{'implementation':'Original DOM, static image and particle lettering, information switcher'}}
evidence=[]
for name,scene in scenes.items():
 tree=read(ROOT/f'src/recovered/{name}.json')
 text=json.dumps(tree)
 assets=[a['id'] for a in recovered if ('/'+a['localPath'].removeprefix('public/')) in text]
 evidence.append({'section':name,'source':f'reference/source/raw.html; src/recovered/{name}.json','scene':scene,'directDOMAssetIds':assets})
plan=ROOT/'.clone-ui/plan'
write(plan/'section-map.json',list(scenes));write(plan/'section-evidence.json',evidence)
write(plan/'assets.json',{'manifest':'reference/asset-manifest.json','count':len(recovered),'sceneEvidence':evidence})
write(plan/'embeds.json',{'scripts':'Reviewed original production ESM runtime with local URLs','externalIntegrationsExcluded':['Analytics','Unused Webflow commerce'],'gltfModelsObserved':0})
write(plan/'tokens.json',{'source':'Original recovered CSS and inline styles','fontFamilies':['BT Steinhart','BT Steinhart Mono','Helvetica Neue'],'note':'Computed comparisons in reference/comparison/style-diff.json'})
docs=ROOT/'docs'
(docs/'03-asset-inventory.md').write_text('# Recovered asset inventory\n\n'+f'{len(manifest)} exact resources discovered; {len(recovered)} recovered ({sum(a.get("fileSize",0) for a in recovered)/1024/1024:.2f} MiB). One unused default Webflow placeholder SVG returned HTTP 403. It is recorded rather than replaced with a fabricated URL.\n\n'+ '\n'.join(f'- {kind}: {count}' for kind,count in sorted(types.items()))+'\n\nThe canonical `reference/asset-manifest.json` records original URL, local path, MIME type, byte size, SHA-256, raster dimensions, discovery confidence, recovery status and the user’s restoration authorization. Manifest hashes describe original downloaded bytes. Runtime/CSS localization changes are separately hashed in `reference/observations/recovery-build.json`; original code/styles remain in `reference/original-assets/`.\n\nNo GLB/GLTF model was observed. The globe and ocean are procedural; crane/truck motion uses original image sequences. No AI-generated substitute assets were used. Fonts are the original five downloaded font files. Recovered Webflow/third-party artifacts retained for evidence are not automatically executed.\n\nContact sheets are under `reference/contact-sheets/`.\n',encoding='utf-8')
(docs/'04-asset-scene-map.md').write_text('# Asset and scene map\n\n| Section | Rendering | Original resources |\n|---|---|---|\n'+'\n'.join(f'| {name} | {s["implementation"]} | {s.get("assets", "Inline original SVG/DOM; direct paths indexed in .clone-ui/plan/section-evidence.json")} |' for name,s in scenes.items())+'\n\nAll scene controllers remain in the recovered homepage dependency graph. React section wrappers retain original selectors and data attributes. A strict one-to-one migration to newly invented scene coordinates would reduce fidelity; source module identities are intentionally preserved.\n',encoding='utf-8')
sections=[]
for name in ['desktop-1440','desktop-1920','tablet','mobile']:
 p=REF/f'observations/{name}.json'
 if p.exists():
  d=read(p);sections.append({'name':name,'viewport':d['viewport'],'height':d['initial']['scrollHeight'],'checkpoints':len(d['checkpoints']),'sections':d['initial']['sections']})
write(plan/'observed-sections.json',sections)
(docs/'01-section-inventory.md').write_text('# Observed homepage sections\n\nThe original homepage order is preserved: header and preloader; globe hero; company introduction and counters; extended freight/service journey (crane, containers, truck, reliability, ship/ocean, airplane/clouds); advantages; testimonials; partners; insights; FAQ; contact CTA; footer.\n\n| Viewport | Content height | Scroll checkpoints |\n|---|---:|---:|\n'+'\n'.join(f'| {d["viewport"]["width"]}×{d["viewport"]["height"]} | {d["height"]}px | {d["checkpoints"]} |' for d in sections)+'\n\nDesktop/tablet use document scrolling; phone widths use the original `.body-inner` scroll wrapper. Heights describe the initial settled page before expanding accordions. Original content, exact element classes, bounding boxes, computed typography and resource entries are recorded in `reference/observations/<viewport>.json`. Hero preload timing screenshots are separate from the fully loaded tour.\n\nOther navigation destinations remain original public URLs, including the live tracking portal and calculator. No other page is presented as a reconstructed local route.\n',encoding='utf-8')
out=REF/'contact-sheets';out.mkdir(parents=True,exist_ok=True)
for name in ['desktop-1440','desktop-1920','tablet','mobile']:
 files=sorted((REF/'screenshots'/name).glob('scroll-*.png'))[::3]
 if not files:continue
 cellw=300;cellh=240;sheet=Image.new('RGB',(cellw*4,cellh*math.ceil(len(files)/4)),'#e6e6e6');draw=ImageDraw.Draw(sheet)
 for i,p in enumerate(files):
  thumb=ImageOps.contain(Image.open(p).convert('RGB'),(290,210));x=i%4*cellw;y=i//4*cellh;sheet.paste(thumb,(x,y+23));draw.text((x+4,y+4),p.name,fill='black')
 sheet.save(out/f'{name}-overview.jpg',quality=86)
# Distinct original stills and sampled sequences, without hundreds of near-identical frames.
files=[ROOT/a['localPath'] for a in recovered if a['fileType'] in ['png','jpg','jpeg','avif','webp'] and ('/sequences/' not in a['localPath'])][:120]
sheet=Image.new('RGB',(1200,180*math.ceil(len(files)/6)),'#dedede');draw=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
 try:
  img=Image.open(p).convert('RGBA');bg=Image.new('RGBA',img.size,'#cccccc');bg.alpha_composite(img);thumb=ImageOps.contain(bg.convert('RGB'),(190,145));x=i%6*200;y=i//6*180;sheet.paste(thumb,(x,y));draw.text((x+3,y+148),p.name[-29:],fill='black')
 except Exception:pass
sheet.save(out/'original-stills.jpg',quality=85)
comparison=REF/'comparison';comparison.mkdir(parents=True,exist_ok=True)
computed=[];pixels=[]
for name in ['desktop-1440','desktop-1920','tablet','mobile']:
 local=REF/f'local/{name}/results.json'
 if not local.exists():continue
 d=read(local);r=read(REF/f'observations/{name}.json')
 if 'initial' not in d:continue
 source=r['initial']['headings'];actual=d['initial']['headings'];diff=[]
 def normalize(s):return ' '.join(s.split())
 for i,(a,b) in enumerate(zip(source,actual)):
  for key in ['fontFamily','fontSize','lineHeight','color','x','width','height']:
   if a.get(key)!=b.get(key):diff.append({'index':i,'heading':normalize(a['text']),'property':key,'source':a.get(key),'local':b.get(key)})
 computed.append({'viewport':name,'sourceHeadingCount':len(source),'localHeadingCount':len(actual),'comparedProperties':7,'diff':diff})
 step=math.floor(d['viewport']['height']*.8)
 candidates=['hero.png']+[f'scroll-{i:03}-{min(i*step,d["initial"]["scrollHeight"]-d["viewport"]["height"]):05}.png' for i in range(0,len(d['checkpoints']),5)]
 for filename in candidates:
  a=REF/f'screenshots/{name}/{filename}';b=REF/f'local/{name}/{filename}'
  if not a.exists() or not b.exists():continue
  ai=Image.open(a).convert('RGB');bi=Image.open(b).convert('RGB')
  if ai.size!=bi.size:continue
  arr=np.abs(np.asarray(ai,dtype=np.float32)-np.asarray(bi,dtype=np.float32));pixels.append({'viewport':name,'file':filename,'meanAbsoluteChannelDifference':float(arr.mean()),'changedPixelFractionOver16':float((arr.max(axis=2)>16).mean()),'note':'Unmasked independent-time capture; includes ambient phases and in-progress text reveals, not a static fidelity score.'})
  dest=comparison/name;dest.mkdir(exist_ok=True)
  pair=Image.new('RGB',(ai.width*2,ai.height));pair.paste(ai,(0,0));pair.paste(bi,(ai.width,0));ImageOps.contain(pair,(1920,1400)).save(dest/f'{Path(filename).stem}-pair.jpg',quality=87)
  if filename=='hero.png':Image.blend(ai,bi,.5).save(dest/'hero-overlay.png');Image.fromarray(np.clip(arr*4,0,255).astype('uint8')).save(dest/'hero-diff-4x.png')
write(comparison/'style-diff.json',computed);write(comparison/'pixel-diff.json',pixels)
print(json.dumps({'recovered':len(recovered),'types':types,'computed':[{'viewport':d['viewport'],'headings':d['sourceHeadingCount'],'differences':len(d['diff'])} for d in computed],'pixelPairs':len(pixels)}))
