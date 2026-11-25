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
  // The archived first-load reset can run after the visitor has already scrolled.
  // Keep native scroll position while the optional animation runtime starts.
  if(!text.includes('y(void 0),void 0,G.init(e)'))throw new Error('Inspect initial scroll reset before adapting');
  text=text.replace('y(void 0),void 0,G.init(e)','void 0,G.init(e)');
  if(!text.includes('beforeOnce(e){p.init()')||!text.includes('this.restoreBodyScroll(),s.refresh(),this.oncePlay(e)'))throw new Error('Inspect first-load scroll lifecycle before adapting');
  text=text.replace('beforeOnce(e){p.init()','beforeOnce(e){window.__WOW_START_SCROLL__=window.scrollY,p.init()');
  text=text.replace('this.restoreBodyScroll(),s.refresh(),this.oncePlay(e)','this.restoreBodyScroll(),s.refresh(),window.__WOW_START_SCROLL__>0&&p.lenis?.scrollTo(window.__WOW_START_SCROLL__,{immediate:!0,force:!0}),this.oncePlay(e)');
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
  const truckManifest=text.match(/S=JSON\.parse\('(\[[^']+\])'\)/);
  if(!truckManifest)throw new Error('Inspect truck sequence manifest before adapting');
  const truckFrames=JSON.parse(truckManifest[1]);
  truckFrames.forEach((frame,index)=>{frame.hostedUrl=`/assets/wow/brand/truck-sequence/frame_${String(index-index%2).padStart(2,'0')}.webp`});
  text=text.replace(truckManifest[0],`S=JSON.parse('${JSON.stringify(truckFrames)}')`);
 }
 if(relative.includes('my-flights-')){
  const pointsStart=text.indexOf('const[o,i]=await Promise.all([');
  const pointsEnd=text.indexOf(']);if(S)return',pointsStart);
  if(pointsStart<0||pointsEnd<0)throw new Error('Inspect globe sampling before adapting');
  text=text.slice(0,pointsStart)+'const[o,i]=await fetch("/assets/wow/brand/globe-points.json",{cache:"force-cache"}).then(r=>r.json()).then(d=>[{edge:new Float32Array(d.edge)},{fill:new Float32Array(d.fill)}])'+text.slice(pointsEnd+2);
  text=text.replace('q.add(p)}catch(t){}','q.add(p);k.domElement.dataset.landReady="true"}catch(t){console.error("Globe land geometry failed",t)}');
  text=text.replace('pointSize:.005','pointSize:.008');
  text=text.replace('u.textContent=t.country||"N/A",d.appendChild(u)','u.textContent=t.country||"N/A",u.dataset.country=t.country||"",d.appendChild(u)');
  text=text.replace('edgeColor:"#ffffff",fillColor:"#e2e8f0",fillOpacity:.1','edgeColor:"#09254b",fillColor:"#243b56",fillOpacity:.8');
  const atlas=mappings.find(([a])=>a.includes('land-110m.json'))?.[1];if(atlas)text=text.replace(/https:\/\/unpkg\.com\/world-atlas@[^/]+\/land-110m\.json/g,atlas);
  const cities=[
   ['MOH',30.7046,76.7179,'INDIA'],['DXB',25.2048,55.2708,'UAE'],['SIN',1.3521,103.8198,'SINGAPORE'],['LHR',51.5074,-.1278,'UNITED KINGDOM'],['MAD',40.4,-3.7,'SPAIN'],['FCO',41.9,12.5,'ITALY'],['CAI',30.04,31.24,'EGYPT'],['CPT',-33.9,18.42,'SOUTH AFRICA'],['SYD',-33.87,151.2,'AUSTRALIA'],['YYZ',43.65,-79.38,'CANADA'],['JFK',40.7,-74,'USA'],['KHI',24.86,67.01,'PAKISTAN'],['RUH',24.71,46.68,'SAUDI ARABIA'],['BKK',13.76,100.5,'THAILAND'],['CGK',-6.2,106.8,'INDONESIA'],['MNL',14.6,120.98,'PHILIPPINES'],['PEK',39.9,116.4,'CHINA'],['NRT',35.7,139.7,'JAPAN'],['NBO',-1.29,36.82,'KENYA'],
   ['KTM',27.72,85.32,'NEPAL'],['DAC',23.81,90.41,'BANGLADESH'],['CMB',6.93,79.86,'SRI LANKA'],['KUL',3.14,101.69,'MALAYSIA'],['HAN',21.03,105.85,'VIETNAM'],['ICN',37.46,126.44,'SOUTH KOREA'],['TPE',25.03,121.57,'TAIWAN'],['RGN',16.87,96.2,'MYANMAR'],['IST',41.01,28.98,'TURKEY'],['DOH',25.29,51.53,'QATAR'],['MCT',23.59,58.28,'OMAN'],['KWI',29.38,47.98,'KUWAIT'],['THR',35.69,51.39,'IRAN'],['AMM',31.95,35.93,'JORDAN'],['FRA',50.11,8.68,'GERMANY'],['CDG',49.01,2.55,'FRANCE'],['AMS',52.31,4.77,'NETHERLANDS'],['ZRH',47.46,8.55,'SWITZERLAND'],['ATH',37.98,23.73,'GREECE'],['ARN',59.65,17.92,'SWEDEN'],['OSL',59.91,10.75,'NORWAY'],['ADD',8.98,38.8,'ETHIOPIA'],['LOS',6.52,3.38,'NIGERIA'],['CMN',33.37,-7.59,'MOROCCO'],['GRU',-23.55,-46.63,'BRAZIL'],['MEX',19.43,-99.13,'MEXICO'],['EZE',-34.6,-58.38,'ARGENTINA'],['AKL',-36.85,174.76,'NEW ZEALAND']
  ];
  const airports=cities.map(([code,lat,lng,city])=>({text:code,size:1,country:city,city,lat:String(lat),lng:String(lng)}));
  const routeCodes=new Set(['DXB','SIN','LHR','MAD','FCO','CAI','CPT','SYD','YYZ','JFK']);
  const routes=cities.filter(([code])=>routeCodes.has(code)).map(([code,lat,lng],i)=>({type:'flight',order:i+1,from:'MOH',to:code,flightCode:`ILLUSTRATIVE-MOH-${code}`,status:true,startLat:30.7046,startLng:76.7179,endLat:lat,endLng:lng,arcAlt:.15+i*.015}));
  text=text.replace('export{R as i,I as n,k as r,B as t}',`I.airports=${JSON.stringify(airports)};B.flights=${JSON.stringify(routes)};export{R as i,I as n,k as r,B as t}`);
 }
 await fs.writeFile(path.join(dest,relative),text);patches.push(relative);
}
await fs.mkdir(path.join(root,'docs/wow'),{recursive:true});
await fs.writeFile(path.join(root,'docs/wow/runtime-adaptations.json'),JSON.stringify({source:'Original archived production modules; original files preserved',patches,changes:['WOW domain allowlist','Shared React header owns navigation','Only transport controllers are initialized','Local textures and globe data','Shader disposal guard preserved','India-facing globe entry','Runtime lifecycle bridge']},null,2));
console.log('WOW: adapted',patches.length,'runtime modules.');
