import {useEffect,type RefObject} from 'react';
export function usePageMotion(root:RefObject<HTMLDivElement|null>){useEffect(()=>{
 let dispose=()=>{},cancelled=false;
 const url='/assets/wow-runtime/chunks/vendor-gsap-GRoENYFU.js';
 void import(/* @vite-ignore */url).then((module)=>{if(cancelled)return;const gsap=module.i,ScrollTrigger=module.r;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
  const ctx=gsap.context(()=>{
   mm.add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.from('[data-page-enter]',{y:28,opacity:0,duration:.9,ease:'power3.out',stagger:.1,clearProps:'all'});
    root.current?.querySelectorAll('[data-scroll-reveal]').forEach(element=>gsap.from(element,{y:30,opacity:0,duration:.8,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:element,start:'top 92%',once:true}}));
    root.current?.querySelectorAll('[data-parallax="road"]').forEach(element=>gsap.fromTo(element,{xPercent:-5},{xPercent:7,ease:'none',scrollTrigger:{trigger:element.parentElement,start:'top bottom',end:'bottom top',scrub:.5}}));
   });
  },root);
  // Enquiry drafts and tracking results change document flow after the initial measurement.
  let refreshFrame=0;const resize=new ResizeObserver(()=>{cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>{if(!cancelled)ScrollTrigger.refresh()})});const main=root.current?.querySelector('main');if(main)resize.observe(main);
  void document.fonts.ready.then(()=>{if(!cancelled)ScrollTrigger.refresh()});
  dispose=()=>{resize.disconnect();cancelAnimationFrame(refreshFrame);mm.revert();ctx.revert()};
 });
 return()=>{cancelled=true;dispose()};
},[root])}
