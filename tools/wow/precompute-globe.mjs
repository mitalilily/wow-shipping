import fs from 'node:fs';
import vm from 'node:vm';
const sourceDir=fs.existsSync('reference/original-assets/recovered/chunks')?'reference/original-assets/recovered/chunks':'public/assets/recovered/chunks';
const chunk=fs.readdirSync(sourceDir).find(n=>n.startsWith('my-flights-'));
const text=fs.readFileSync(sourceDir+'/'+chunk,'utf8');
const topo=JSON.parse(fs.readFileSync('public/assets/data/land-110m.json','utf8'));
const arcs=topo.arcs.map(arc=>{let x=0,y=0;return arc.map(p=>{x+=p[0];y+=p[1];return [x*topo.transform.scale[0]+topo.transform.translate[0],y*topo.transform.scale[1]+topo.transform.translate[1]]})});
const ring=ids=>ids.flatMap((id,i)=>{const a=id<0?[...arcs[~id]].reverse():arcs[id];return i?a.slice(1):a});
const geos=[];for(const g of topo.objects.land.geometries){for(const poly of g.type==='Polygon'?[g.arcs]:g.arcs)geos.push({type:'Polygon',coordinates:poly.map(ring)})}
const polysIn=geos.map(p=>p.coordinates.map(r=>new Float32Array(r.flat())));
const codes=[...text.matchAll(/z\(("(?:[^"\\]|\\.)*"),\{(?:densityDeg|tileDeg):/g)].map(m=>JSON.parse(m[1]));
if(codes.length!==2)throw Error('Worker source count '+codes.length);
function run(code,data){let result;const context={Float32Array,Math,postMessage:r=>{result=r}};vm.createContext(context);vm.runInContext(code,context);context.onmessage({data});return result}
const edge=run(codes[0],{densityDeg:1.2,polysIn}).edge,fill=run(codes[1],{tileDeg:1.2,geos}).fill;
fs.writeFileSync('public/assets/wow/brand/globe-points.json',JSON.stringify({edge:Array.from(edge,n=>+n.toFixed(5)),fill:Array.from(fill,n=>+n.toFixed(5))}));
console.log({edge:edge.length/3,fill:fill.length/3,bytes:fs.statSync('public/assets/wow/brand/globe-points.json').size});
