import fs from 'node:fs/promises';
import path from 'node:path';
import {site} from '../../src/content/site.ts';
const root=path.resolve(import.meta.dirname,'../..');
const out=path.join(root,'src/story/structure');await fs.mkdir(out,{recursive:true});
const node=(tag,cls,children=[],attrs={})=>({tag,attrs:{...(cls?{class:cls}:{}),...attrs},children});
const txt=(text)=>node('div','txt',[text]);
const has=(n,c)=>typeof n!=='string'&&(n.attrs.class||'').split(' ').includes(c);
function walk(n,fn){if(typeof n==='string')return;fn(n);n.children.forEach(c=>walk(c,fn))}
function find(n,c){if(has(n,c))return n;if(typeof n!=='string')for(const child of n.children){const found=find(child,c);if(found)return found}}
function all(n,c){const arr=[];walk(n,x=>{if(has(x,c))arr.push(x)});return arr}
function set(n,c,text){const el=find(n,c);if(el)el.children=[text]}
function prune(n,test){if(typeof n==='string')return;n.children=n.children.filter(c=>typeof c==='string'||!test(c));n.children.forEach(c=>prune(c,test))}
function inside(n,cls,target,text){const el=find(n,cls);if(el)set(el,target,text)}
const names=['Hero','CompanyIntro','FreightJourney','WhyUs','Testimonials','Preloader','PageTransition','GlobalDecor','PageStyles'];
for(const name of names){
 const tree=JSON.parse(await fs.readFile(path.join(root,'src/recovered',name+'.json'),'utf8'));
 walk(tree,n=>{delete n.attrs['data-w-id'];if(n.tag==='a'){
  const href=n.attrs.href||'';n.attrs['data-barba-prevent']='all';
  if(href.includes('unitedcarriers.com'))n.attrs.href=href.includes('/about')?'/about/':href.includes('/services')?'#services':'/contact/';
 }});
 if(name==='GlobalDecor'){
  prune(tree,n=>n.attrs.id==='awwwards'||has(n,'awwwards-badge-link')||has(n,'debug-grid'));
  walk(tree,n=>{n.children=n.children.map(c=>typeof c==='string'?c.replaceAll('WORK','LET’S').replaceAll('WITH US','TALK'):c)});
 }
 if(name==='Hero'){
  find(tree,'home-hero-title').children=[node('h1','heading h1',site.hero.lines.flatMap((line,i)=>i? [node('br',''),line]:[line]),{'aria-label':'From Your Door To Theirs. Anywhere In The World.'})];
  inside(tree,'home-hero-sub','txt',site.hero.kicker);
  walk(tree,n=>{n.children=n.children.map(c=>typeof c==='string'&&c.trim()==='One operator'?site.hero.kicker:c)});
  inside(tree,'home-hero-desc','txt',site.hero.description);
  find(tree,'home-hero-label').children=[node('div','txt',[site.hero.kicker])];
  const description=find(tree,'home-hero-desc');description.children.unshift(node('p','wow-hero-subheading',[site.hero.subheading]));
  find(tree,'home-hero-globe').children.push(node('div','wow-globe-air',[
   node('span','wow-globe-air-route'),
   node('img','wow-globe-air-plane',[],{src:'/assets/wow/brand/globe-cargo-plane.webp',alt:'',loading:'eager',decoding:'async'})
  ],{'aria-hidden':'true'}));
  const links=[];walk(tree,n=>{if(n.tag==='a')links.push(n)});
  links.forEach((n,i)=>{n.attrs.href=i===0?'/contact/':'/tracking/';const t=find(n,'txt');if(t)t.children=[i===0?'Get a Quote':'Track a Shipment']});
  tree.attrs['data-wow-chapter']='origin';
 }
 walk(tree,n=>{if(n.tag==='img'){const src=n.attrs.src||'';if(src.includes('truck-static')||src.includes('only-container')){n.attrs.src=src.includes('truck-static')?'/assets/wow/brand/truck-branded.svg':'/assets/wow/brand/container-branded.svg';delete n.attrs.srcset;delete n.attrs.sizes}}});
 if(name==='CompanyIntro'){
  find(tree,'home-intro-title').children=[node('h2','heading h2',['Shipping support.',node('br',''),node('span','cl-note',['From enquiry']),node('br',''),'to delivery.'])];
  const description=find(tree,'home-intro-desc');if(description)description.children=[txt(site.intro.description),txt('Get in touch for service options, shipment details and a quote.')];
  const copy=all(tree,'txt');
  for(const n of copy){const text=n.children.filter(c=>typeof c==='string').join('');
   if(/With every service|That means no finger|From countless/.test(text))n.children=[/From countless/.test(text)?'Domestic. International. Door to door.':/That means/.test(text)?'Get in touch for service options, shipment details and a quote.':site.intro.description];
   if(/Learn more/.test(text))n.children=['Meet WOW Shippings'];
  }
  const counters=[];walk(tree,n=>{if(n.attrs['data-count-to']!==undefined||n.attrs['data-count']!==undefined||n.attrs['data-counter']!==undefined)counters.push(n)});
  walk(tree,n=>{for(const key of Object.keys(n.attrs))if(/count|target|number/.test(key)&&key.startsWith('data-'))delete n.attrs[key]});
  // Replace original numerical proof as a complete block; keep its outer layout hook.
  const blocks=[];walk(tree,n=>{if(n.attrs.class&&/home-intro.*(num|stat|fact)/.test(n.attrs.class))blocks.push(n.attrs.class)});
  const stats=find(tree,'home-intro-stats');
  if(stats){stats.attrs.class+=' wow-service-labels';stats.children=site.intro.labels.map((label,i)=>node('div','home-intro-stats-item wow-service-label',[node('span','wow-label-index',[`0${i+1}`]),node('div','home-intro-stats-item-desc',[node('h3','txt',[label])]),node('div','home-intro-stats-item-line')]))}
 }
 if(name==='FreightJourney'){
  tree.attrs.id='services';tree.attrs['data-wow-chapter']='cargo';
  for(const n of all(tree,'home-service-title')){const h=find(n,'heading');if(h)h.children=['Every shipment.',node('br',''),'A way forward.']}
  for(const n of all(tree,'home-service-mb-title')){const h=find(n,'heading');if(h)h.children=['Every shipment.',node('br',''),'A way forward.']}
  for(const n of all(tree,'home-service-desc')){const t=find(n,'txt');if(t)t.children=['Domestic and international shipping. Start with your destination. We’ll help with the next move.']}
  for(const c of ['home-service-sub','home-service-mb-desc'])for(const n of all(tree,c))n.children=[node('div','txt fs-16',['Domestic and international shipping. Start with your destination. We’ll help with the next move.'])];
  const groups=all(tree,'home-service-item');groups.forEach((n,i)=>{const s=site.services[i%site.services.length];const title=find(n,'home-service-item-title');if(title)title.children=[node('h3','heading h6',[s.title])];inside(n,'home-service-item-desc','txt',s.description)});
  const mb=all(tree,'home-service-item-mb');mb.forEach((n,i)=>{const s=site.services[i%6];const h=find(n,'home-service-item-title-mb');if(h)h.children=[node('h3','',[s.title])];const d=find(n,'home-service-item-desc-mb');if(d)d.children=[s.description]});
  const replacements=[['RELIABILITY AT EVERY MILESTONE','A CLEARER NEXT MOVE'],["Built for businesses that can't afford disruption.",'Built around what you need to send.'],['Real-Time Freight Tracking','Shipment support'],['Real-Time  Freight  Tracking','Shipment support'],['Global Network overage','Domestic & international'],['24/7 Customer Support','A team you can reach'],['Our Services','Explore shipping options']];
  walk(tree,n=>{n.children=n.children.map(c=>{if(typeof c!=='string')return c;let v=c;for(const [a,b]of replacements)v=v.replaceAll(a,b);if(/With every service under one roof/.test(v))return site.intro.description;return v})});
  // Individual mobile titles use a rich-text wrapper instead of the desktop item class.
  all(tree,'home-service-item-title-mb').forEach((n,i)=>{n.children=[node('h3','',[site.services[i%6].title])]});
  all(tree,'home-service-sub-item').forEach((n,i)=>{const r=site.reasons[i%3];const h=find(n,'home-service-sub-title');if(h)h.children=[node('h3','heading h6',[r.title])];const d=find(n,'home-service-sub-desc');if(d)d.children=[node('div','txt fs-16',[r.description])]});
 }
 if(name==='WhyUs'){
  tree.attrs['data-wow-chapter']='sea';
  inside(tree,'home-why-label','txt','Why WOW');
  inside(tree,'home-why-title','heading','Good shipping starts with a conversation.');
  const items=all(tree,'home-why-main-item');for(let i=0;i<items.length;i++){
   if(i>=3){prune(tree,n=>n===items[i]);continue}const r=site.reasons[i];inside(items[i],'home-why-main-item-title','heading',r.title);inside(items[i],'home-why-main-item-desc','txt',r.description);
  }
 }
 if(name==='Testimonials'){
  tree.attrs['data-wow-chapter']='air';
  // Keep the aircraft/overlap stage, render compact customer accounts separately in React.
  const content=find(tree,'home-testi-content');if(content)content.children=[];
 }
 if(name==='Preloader'||name==='PageTransition'){
  for(const c of ['loader-logo-ic','trans-logo'])for(const el of all(tree,c))el.children=[node('img','wow-loader-emblem',[],{src:'/assets/wow/brand/emblem.png',alt:'WOW Shippings'})];
  const countries=['SHIPPING','PICKUP','HANDLING','IN TRANSIT','CONNECTIONS','ARRIVAL','HANDOVER','SUPPORT','DELIVERY'];let count=0;
  walk(tree,n=>{n.children=n.children.map(c=>typeof c==='string'&&/^(Australia|New Zealand|Hong Kong|China|Vietnam|United States|THAILAND|Germany|United Kingdom)$/.test(c.trim())?countries[count++%countries.length]:c)});
  const serviceItems=all(tree,'loader-service-item');serviceItems.forEach((n,i)=>{const t=find(n,'txt');if(t)t.children=[site.services[i%6].title]});
 }
 await fs.writeFile(path.join(out,name+'.json'),JSON.stringify(tree));
 const dir=['GlobalDecor','PageStyles'].includes(name)?'components/shared':['Preloader','PageTransition'].includes(name)?'components/preloader':`sections/${name}`;
 const shared=dir==='components/shared'?'./RecoveredTree':'../../components/shared/RecoveredTree';
 if(name!=='Testimonials')await fs.writeFile(path.join(root,'src',dir,name+'.tsx'),`import tree from '../../story/structure/${name}.json';\nimport {RecoveredTree} from '${shared}';\nexport function ${name}(){return <RecoveredTree tree={tree}/>;}\n`);
}
console.log('WOW: prepared original transport structure with brand content.');
