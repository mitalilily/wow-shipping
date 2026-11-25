import {useEffect,useRef,useState} from 'react';

interface Particle{vx:number;vy:number;ease:number;originX:number;originY:number}
interface Scatter{dpr:number;canvas:HTMLCanvasElement;effect:{particlesArray:Particle[];handleMouseMove:(e:MouseEvent)=>void;mouse:{x:number;y:number;radius:number;actualRadius:number;isActive:boolean;timeout:ReturnType<typeof setTimeout>|null}};destroy:()=>void}

/** Original scatter/reassembly physics with a WOW mask and local pointer ownership. */
export function ParticleSignature(){
 const button=useRef<HTMLButtonElement>(null),canvas=useRef<HTMLCanvasElement>(null),source=useRef<HTMLImageElement>(null),scene=useRef<Scatter|null>(null);
 const [ready,setReady]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
 useEffect(()=>{
  setReady(false);if(reduced)return;let disposed=false,started=false,poll:ReturnType<typeof setInterval>|undefined;
  const start=async()=>{
   if(started||disposed)return;started=true;
   await document.fonts.load('800 180px Manrope');
   if(disposed||!source.current||!canvas.current)return;
   const mask=document.createElement('canvas');mask.width=1600;mask.height=220;const context=mask.getContext('2d');if(!context)return;
   context.font='800 180px Manrope';const size=Math.min(180,1480/context.measureText('WOW SHIPPINGS').width*180);context.font=`800 ${size}px Manrope`;context.fillStyle='#838c81';context.textAlign='center';context.textBaseline='middle';context.fillText('WOW SHIPPINGS',800,110);source.current.src=mask.toDataURL('image/png');
   const url='/assets/wow/particle-text.js';const module=await import(/* @vite-ignore */url);if(disposed||!canvas.current)return;
   const instance=new module.ParticleText(canvas.current,{imageSelector:'#wow-particle-source',scale:1}) as Scatter;scene.current=instance;
   // Pointer coordinates are relative to the live canvas, including the phone scroll wrapper.
   window.removeEventListener('mousemove',instance.effect.handleMouseMove);
   instance.effect.mouse.actualRadius=60*instance.dpr;instance.effect.mouse.radius=(60*instance.dpr)**2;
   poll=setInterval(()=>{if(disposed)return;if(instance.effect.particlesArray.length){setReady(true);if(button.current)button.current.dataset.particles=String(instance.effect.particlesArray.length);clearInterval(poll)}},50);
  };
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))void start().catch(()=>{if(!disposed)setReady(false)})},{rootMargin:'200px'});if(button.current)observer.observe(button.current);
  return()=>{disposed=true;observer.disconnect();if(poll)clearInterval(poll);scene.current?.destroy();scene.current=null};
 },[reduced]);
 const scatterPointer=(event:React.PointerEvent)=>{const instance=scene.current;if(!instance||reduced)return;const rect=instance.canvas.getBoundingClientRect();const mouse=instance.effect.mouse;mouse.x=(event.clientX-rect.left)*instance.dpr;mouse.y=(event.clientY-rect.top)*instance.dpr;mouse.isActive=true;if(mouse.timeout)clearTimeout(mouse.timeout);mouse.timeout=setTimeout(()=>mouse.isActive=false,100)};
 const burst=()=>{const instance=scene.current;if(!instance||reduced)return;for(const p of instance.effect.particlesArray){const angle=Math.random()*Math.PI*2,speed=(8+Math.random()*14)*instance.dpr;p.vx+=Math.cos(angle)*speed;p.vy+=Math.sin(angle)*speed;p.ease=.055}};
 return <button ref={button} className={`wow-footer-signature wow-particle-signature${ready?' is-ready':''}`} type="button" disabled={reduced} aria-label={reduced?'WOW Shippings':'Scatter the WOW Shippings wordmark'} onPointerMove={scatterPointer} onPointerLeave={()=>{if(scene.current)scene.current.effect.mouse.isActive=false}} onClick={burst}>
  <span className="wow-particle-fallback" aria-hidden="true">WOW SHIPPINGS</span>{!reduced&&<canvas ref={canvas} className="wow-particle-canvas" aria-hidden="true"/>}<img ref={source} id="wow-particle-source" hidden alt=""/>
 </button>;
}
