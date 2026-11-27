import {useEffect,useRef} from 'react';
import {media} from '../content/site';

export function FlightChapter(){
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{
  let disposed=false,release=()=>{};
  const timer=setInterval(()=>{
   if(!window.__WOW_RUNTIME__?.ready)return;
   clearInterval(timer);
   const url='/assets/wow-runtime/chunks/vendor-gsap-GRoENYFU.js';
   void import(/* @vite-ignore */url).then(module=>{
    if(disposed)return;
    const gsap=module.i,mm=gsap.matchMedia();
    const create=(phone:boolean)=>{
     const ctx=gsap.context(()=>{
      const scroller=phone?(document.querySelector('.body-inner')||window):window;
      // A light edge transition clears before the flight copy reaches its reading position.
      const bridge=gsap.timeline({scrollTrigger:{id:'wow-sea-air-atmosphere',trigger:root.current,start:'top bottom+=20%',end:'top 30%',scrub:.6,scroller}});
      bridge.fromTo('.wow-sea-air-bridge',{autoAlpha:0},{autoAlpha:.28,duration:.25,ease:'sine.inOut'},0)
       .to('.wow-sea-air-bridge',{autoAlpha:0,duration:.75,ease:'sine.inOut'},.25)
       .fromTo('.wow-bridge-cloud-left',{xPercent:-8,rotation:-8},{xPercent:-30,rotation:-8,duration:1,ease:'none'},0)
       .fromTo('.wow-bridge-cloud-right',{xPercent:8,rotation:10},{xPercent:30,rotation:10,duration:1,ease:'none'},0);
      // One timeline owns position, bank, scale and entry opacity: no competing tweens.
      const flight=gsap.timeline({scrollTrigger:{id:'wow-aircraft-flight',trigger:root.current,start:'top bottom',end:'bottom bottom',scrub:phone ? .65 : .9,scroller,invalidateOnRefresh:true}});
      flight.fromTo('.wow-flight-aircraft',{xPercent:phone?-8:-13,yPercent:8,rotation:-7,scale:.94,autoAlpha:0,force3D:true},{xPercent:-2,yPercent:0,rotation:-2,scale:1,autoAlpha:1,duration:.48,ease:'power1.out'},0)
       .to('.wow-flight-aircraft',{xPercent:phone?5:6,yPercent:-2,rotation:1,scale:1.015,duration:.52,ease:'sine.inOut'},.48)
       .fromTo('.wow-flight-cloud-back',{xPercent:6,yPercent:0},{xPercent:-8,yPercent:-9,duration:1,ease:'none'},0)
       .fromTo('.wow-flight-cloud-front',{xPercent:-5,yPercent:5},{xPercent:8,yPercent:-8,duration:1,ease:'none'},0);
     },root);
     return()=>ctx.revert();
    };
    mm.add('(min-width:768px)',()=>create(false));
    mm.add('(max-width:767px)',()=>create(true));
    release=()=>mm.revert();
   });
  },100);
  return()=>{disposed=true;clearInterval(timer);release()};
 },[]);
 return <section ref={root} className="wow-flight-section home-testi-wrap" data-wow-chapter="air" aria-labelledby="flight-title">
  <div className="wow-sea-air-bridge" aria-hidden="true"><div className="wow-bridge-fog"/><img className="wow-bridge-cloud-left" src={media.cloud} alt="" loading="lazy"/><img className="wow-bridge-cloud-right" src={media.cloud} alt="" loading="lazy"/></div>
  <div className="wow-flight-stage home-testi">
   <img className="wow-flight-cloud wow-flight-cloud-back" src={media.cloud} alt="" loading="lazy"/>
   <div className="wow-flight-copy"><p className="wow-eyebrow">INTERNATIONAL SHIPPING</p><h2 id="flight-title">GOING<br/><span>FURTHER.</span></h2><p>Explore the options for your<br/>next international shipment.</p><a className="wow-text-link" href="/contact/" data-barba-prevent="all">Discuss your shipment ↗</a></div>
   <img className="wow-flight-aircraft" src={media.plane} alt="WOW Shippings cargo aircraft illustrating international shipping" loading="eager" fetchPriority="low" decoding="async"/>
   <img className="wow-flight-cloud wow-flight-cloud-front" src={media.cloud} alt="" loading="lazy"/>
   <span className="wow-flight-caption">THE SHIPPING STORY / AIR</span>
  </div>
 </section>;
}
