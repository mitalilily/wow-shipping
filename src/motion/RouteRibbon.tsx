import {useEffect,useRef} from 'react';
const chapters=[{selector:'.home-hero-wrap',label:'01 / DEPARTURE',points:[74,24,49,39,97,59,75,85]}, {selector:'.home-intro-wrap',label:'02 / THE NEXT STEP',points:[9,20,10,72,78,35,91,80]}, {selector:'.home-service-wrap',label:'03 / ON THE MOVE',points:[4,66,30,36,70,88,97,63]}, {selector:'.home-why-wrap',label:'04 / CONNECTIONS',points:[82,8,48,28,70,64,34,93]}, {selector:'.home-testi-wrap',label:'05 / NEW HORIZONS',points:[18,94,15,36,87,77,80,10]}];
export function RouteRibbon(){
 const path=useRef<SVGPathElement>(null),tip=useRef<SVGCircleElement>(null),svg=useRef<SVGSVGElement>(null),label=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let frame=0,last=-1;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return;
  const update=()=>{frame=0;const owner=innerWidth<=767?document.querySelector('.body-inner'):document.documentElement;const y=innerWidth<=767?owner?.scrollTop||0:scrollY;if(Math.abs(y-last)<.2&&last>=0)return;last=y;
   if(!window.__WOW_RUNTIME__?.ready)return;
   const rects=chapters.map(c=>document.querySelector(c.selector)?.getBoundingClientRect());let index=rects.findIndex(r=>r&&r.top<innerHeight*.6&&r.bottom>innerHeight*.4);if(index<0)index=0;
   const end=rects.at(-1);const active=!!end&&end.bottom>0;svg.current?.classList.toggle('is-visible',active);svg.current?.classList.toggle('is-flight',!!end&&end.top<innerHeight*.9&&end.bottom>0);label.current?.classList.toggle('is-visible',active);
   const rect=rects[index];const progress=rect?Math.max(0,Math.min(1,(innerHeight*.6-rect.top)/(rect.height+innerHeight*.2))):0;
   const from=chapters[index].points,to=chapters[Math.min(index+1,chapters.length-1)].points;const t=Math.max(0,(progress-.65)/.35);const p=from.map((v,i)=>(v+(to[i]-v)*t)*10);
   path.current?.setAttribute('d',`M${p[0]},${p[1]} C${p[2]},${p[3]} ${p[4]},${p[5]} ${p[6]},${p[7]}`);tip.current?.setAttribute('cx',String(p[6]));tip.current?.setAttribute('cy',String(p[7]));if(label.current)label.current.textContent=chapters[index].label;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};const owner=document.querySelector('.body-inner');owner?.addEventListener('scroll',schedule,{passive:true});window.addEventListener('scroll',schedule,{passive:true});const resize=()=>{last=-1;schedule()};window.addEventListener('resize',resize);const timer=setInterval(resize,1000);schedule();
  return()=>{cancelAnimationFrame(frame);clearInterval(timer);owner?.removeEventListener('scroll',schedule);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',resize)};
 },[]);
 return <><svg ref={svg} className="wow-route-ribbon" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path ref={path} d="M740 240C490 390 970 590 750 850" fill="none"/><circle ref={tip} cx="750" cy="850" r="4"/></svg><div className="wow-story-caption" aria-hidden="true"><span>THE SHIPPING STORY</span><div ref={label}/></div></>;
}
