/** Reproducible adaptations; never alter the original archived module bytes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {siteHostname} from './deployment.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const manifest=JSON.parse(await fs.readFile(path.join(root,'reference/asset-manifest.json'),'utf8'));
const mappings=manifest.filter(a=>a.recoveryStatus==='recovered').map(a=>[a.originalUrl,'/'+a.localPath.replace(/^public\//,'')]).sort((a,b)=>b[0].length-a[0].length);
const source=path.join(root,'public/assets/recovered');const dest=path.join(root,'public/assets/wow-runtime');
await fs.cp(source,dest,{recursive:true});
const list=await fs.readdir(path.join(dest,'chunks'));
const patches=[];
for(const relative of ['main.js',...list.filter(x=>x.endsWith('.js')).map(x=>'chunks/'+x)]){
 const original=path.join(root,'reference/original-assets/recovered',relative);
 let text;try{text=await fs.readFile(original,'utf8')}catch{text=await fs.readFile(path.join(source,relative),'utf8')}
 for(const [a,b]of mappings)text=text.replaceAll(a,b);
 if(relative==='main.js'){
  text=text.replace(/var E\s*=\s*\[[\s\S]*?\];/, `var E=${JSON.stringify([...new Set(['localhost','127.0.0.1','[::1]','wowshippings.com','www.wowshippings.com',siteHostname])])};`);
  text=text.replaceAll('T.init(e)','void 0');
  const min='Object.values(e).map(e=>new e)';
  const formatted='Object.values(e).map((e) => new e())';
  if(text.includes(min))text=text.replace(min,'Object.entries(e).filter(([k])=>!["Partners","Insight","Faq","Cta","Footer","Testi"].includes(k)).map(([,v])=>new v)');
  else if(text.includes(formatted))text=text.replace(formatted,'Object.entries(e).filter(([k])=>!["Partners","Insight","Faq","Cta","Footer","Testi"].includes(k)).map(([,v])=>new v())');
  else throw new Error('Inspect Home controller registry before adapting');
  text+='\nwindow.__WOW_RUNTIME__={gsap:t,ScrollTrigger:s,get lenis(){return p.lenis},get home(){return te.home},get ready(){return !!G.tlLoadMaster&&G.tlLoadMaster.progress()>=1},destroy(){try{I.default.destroy()}catch{}try{te.home.destroy({current:{container:document.querySelector(".main-inner")},next:{container:document.querySelector(".main-inner")}})}catch{}P.destroy();s.getAll().forEach(st=>st.kill());p.lenis?.destroy();document.querySelectorAll("webflow-3d").forEach(el=>el.destroy?.())}};window.__UC_RECONSTRUCTION__=window.__WOW_RUNTIME__;\n';
 }
 if(relative.includes('OceanScene-'))text=text.replaceAll('new URL("/",','new URL("/assets/wow-runtime/",');
 if(relative.includes('vendor-three-'))text=text.replace('i.forEach(function(t){St.get(t).currentProgram.isReady()&&i.delete(t)})','i.forEach(function(t){const p=St.get(t).currentProgram;(!p||p.isReady())&&i.delete(t)})');
 if(relative.includes('Home-')){
  text=text.replaceAll('this._globePhi=3.8','this._globePhi=2.8').replaceAll('this._globePhi = 3.8','this._globePhi = 2.8');
 }
 if(relative.includes('my-flights-')){
  const pointsStart=text.indexOf('const[o,i]=await Promise.all([');
  const pointsEnd=text.indexOf(']);if(S)return',pointsStart);
  if(pointsStart<0||pointsEnd<0)throw new Error('Inspect globe sampling before adapting');
  text=text.slice(0,pointsStart)+'const[o,i]=await fetch("/assets/wow/brand/globe-points.json",{cache:"force-cache"}).then(r=>r.json()).then(d=>[{edge:new Float32Array(d.edge)},{fill:new Float32Array(d.fill)}])'+text.slice(pointsEnd+2);
  text=text.replace('q.add(p)}catch(t){}','q.add(p);k.domElement.dataset.landReady="true"}catch(t){console.error("Globe land geometry failed",t)}');
  text=text.replace('pointSize:.005','pointSize:.008');
  text=text.replace('edgeColor:"#ffffff",fillColor:"#e2e8f0",fillOpacity:.1','edgeColor:"#09254b",fillColor:"#243b56",fillOpacity:.8');
  const atlas=mappings.find(([a])=>a.includes('land-110m.json'))?.[1];if(atlas)text=text.replace(/https:\/\/unpkg\.com\/world-atlas@[^/]+\/land-110m\.json/g,atlas);
  const cities=[['MOH',30.7046,76.7179,'INDIA'],['DXB',25.2048,55.2708,'UAE'],['SIN',1.3521,103.8198,'SINGAPORE'],['LHR',51.5074,-.1278,'UNITED KINGDOM'],['MAD',40.4,-3.7,'SPAIN'],['FCO',41.9,12.5,'ITALY'],['CAI',30.04,31.24,'EGYPT'],['CPT',-33.9,18.42,'SOUTH AFRICA'],['SYD',-33.87,151.2,'AUSTRALIA'],['YYZ',43.65,-79.38,'CANADA'],['JFK',40.7,-74,'USA']];
  const airports=cities.map(([code,lat,lng,city])=>({text:code,size:1,country:city,city,lat:String(lat),lng:String(lng)}));
  const routes=cities.slice(1).map(([code,lat,lng],i)=>({type:'flight',order:i+1,from:'MOH',to:code,flightCode:`ILLUSTRATIVE-MOH-${code}`,status:true,startLat:30.7046,startLng:76.7179,endLat:lat,endLng:lng,arcAlt:.15+i*.015}));
  text=text.replace('export{R as i,I as n,k as r,B as t}',`I.airports=${JSON.stringify(airports)};B.flights=${JSON.stringify(routes)};export{R as i,I as n,k as r,B as t}`);
 }
 await fs.writeFile(path.join(dest,relative),text);patches.push(relative);
}
await fs.mkdir(path.join(root,'docs/wow'),{recursive:true});
await fs.writeFile(path.join(root,'docs/wow/runtime-adaptations.json'),JSON.stringify({source:'Original archived production modules; original files preserved',patches,changes:['WOW domain allowlist','Shared React header owns navigation','Only transport controllers are initialized','Local textures and globe data','Shader disposal guard preserved','India-facing globe entry','Runtime lifecycle bridge']},null,2));
console.log('WOW: adapted',patches.length,'runtime modules.');
