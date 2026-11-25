import {useEffect,useRef} from 'react';
import {media} from '../content/site';
export function FlightChapter(){
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{let disposed=false,release=()=>{};
  const timer=setInterval(()=>{if(!window.__WOW_RUNTIME__?.ready)return;clearInterval(timer);const url='/assets/wow-runtime/chunks/vendor-gsap-GRoENYFU.js';
   void import(/* @vite-ignore */url).then(module=>{if(disposed)return;const gsap=module.i;const mm=gsap.matchMedia();
    const create=(phone:boolean)=>{const ctx=gsap.context(()=>{
     const scroller=phone?(document.querySelector('.body-inner')||window):window;
     const bridge=gsap.timeline({scrollTrigger:{trigger:root.current,start:'top bottom+=35%',end:'top top-=45%',scrub:.45,scroller}});
     bridge.fromTo('.wow-sea-air-bridge',{autoAlpha:0},{autoAlpha:1,duration:.2,ease:'power1.inOut'},0)
      .fromTo('.wow-bridge-cloud-left',{xPercent:-12,rotation:-8},{xPercent:-40,rotation:-8,duration:.6,ease:'power1.inOut'},.4)
      .fromTo('.wow-bridge-cloud-right',{xPercent:12,rotation:10},{xPercent:40,rotation:10,duration:.6,ease:'power1.inOut'},.4)
      .fromTo('.wow-bridge-fog',{opacity:1},{opacity:0,duration:.5,ease:'power1.inOut'},.45)
      .to('.wow-sea-air-bridge',{autoAlpha:0,duration:.35,ease:'power1.inOut'},.65);
     gsap.fromTo(['.wow-flight-aircraft','.wow-flight-copy','.wow-flight-caption'],{opacity:0},{opacity:1,ease:'none',scrollTrigger:{trigger:root.current,start:'top 25%',end:'top top-=25%',scrub:.35,scroller}});
     const timeline=gsap.timeline({scrollTrigger:{trigger:root.current,start:'top top',end:'bottom bottom',scrub:.45,scroller:phone?(document.querySelector('.body-inner')||window):window}});
     timeline.fromTo('.wow-flight-aircraft',{xPercent:-10,yPercent:0,rotation:-6,scale:1},{xPercent:10,yPercent:-2,rotation:-6,scale:1,ease:'none'},0)
      .fromTo('.wow-flight-cloud-back',{xPercent:8,yPercent:0},{xPercent:-12,yPercent:-15,ease:'none'},0)
      .fromTo('.wow-flight-cloud-front',{xPercent:-10,yPercent:12},{xPercent:15,yPercent:-18,ease:'none'},0);
    },root);return()=>ctx.revert()};
    mm.add('(min-width:768px)',()=>create(false));mm.add('(max-width:767px)',()=>create(true));release=()=>mm.revert();
   });
  },100);return()=>{disposed=true;clearInterval(timer);release()};
 },[]);
 return <section ref={root} className="wow-flight-section home-testi-wrap" data-wow-chapter="air" aria-labelledby="flight-title"><div className="wow-sea-air-bridge" aria-hidden="true"><div className="wow-bridge-fog"/><img className="wow-bridge-cloud-left" src={media.cloud} alt="" loading="lazy"/><img className="wow-bridge-cloud-right" src={media.cloud} alt="" loading="lazy"/></div><div className="wow-flight-stage home-testi"><img className="wow-flight-cloud wow-flight-cloud-back" src={media.cloud} alt="" loading="lazy"/><div className="wow-flight-copy"><p className="wow-eyebrow">INTERNATIONAL SHIPPING</p><h2 id="flight-title">GOING<br/><span>FURTHER.</span></h2><p>Explore the options for your<br/>next international shipment.</p><a className="wow-text-link" href="/contact/" data-barba-prevent="all">Discuss your shipment ↗</a></div><img className="wow-flight-aircraft" src={media.plane} alt="Detailed cargo aircraft illustrating international shipping" loading="lazy"/><img className="wow-flight-cloud wow-flight-cloud-front" src={media.cloud} alt="" loading="lazy"/><span className="wow-flight-caption">THE SHIPPING STORY / AIR</span></div></section>;
}
