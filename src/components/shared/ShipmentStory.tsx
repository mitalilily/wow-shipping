import {useEffect,useRef,useState} from 'react';

export interface StoryChapter{label:string;title:string;description:string;image:string;kind:'cargo'|'road'|'air';link:string;action:string}

/** Native scrolling owns the story; the media stage follows the chapter in view. */
export function ShipmentStory({id,eyebrow,title,chapters}:{id:string;eyebrow:string;title:string;chapters:StoryChapter[]}){
 const root=useRef<HTMLElement>(null),[active,setActive]=useState(0);
 useEffect(()=>{let cancelled=false,dispose=()=>{};const url='/assets/wow-runtime/chunks/vendor-gsap-GRoENYFU.js';
  void import(/* @vite-ignore */url).then(module=>{if(cancelled)return;const gsap=module.i,ScrollTrigger=module.r;gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
   const ctx=gsap.context(()=>{
    const steps=root.current?.querySelectorAll<HTMLElement>('.wow-story-step');steps?.forEach((step,i)=>{ScrollTrigger.create({trigger:step,start:'top 58%',end:'bottom 58%',onEnter:()=>setActive(i),onEnterBack:()=>setActive(i)});});
    mm.add('(prefers-reduced-motion: no-preference)',()=>{steps?.forEach((step,i)=>{const image=root.current?.querySelectorAll('.wow-story-object')[i];gsap.fromTo(image,{xPercent:chapters[i].kind==='cargo'?0:-7,yPercent:chapters[i].kind==='cargo'?8:0},{xPercent:chapters[i].kind==='cargo'?0:7,yPercent:chapters[i].kind==='cargo'?-8:0,ease:'none',scrollTrigger:{trigger:step,start:'top bottom',end:'bottom top',scrub:.5}})});});
   },root);dispose=()=>{mm.revert();ctx.revert()};
  });return()=>{cancelled=true;dispose()};
 },[chapters]);
 return <section ref={root} className="wow-shipment-story" id={id} aria-labelledby={`${id}-title`}>
  <div className="wow-story-heading" data-scroll-reveal><p className="wow-eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2><p>Scroll through the journey, or choose a chapter.</p></div>
  <div className="wow-story-layout">
   <div className="wow-story-stage" data-active-chapter={active}>
    <nav className="wow-story-chapter-nav" aria-label={`${eyebrow} chapters`}>{chapters.map((c,i)=><a key={c.label} href={`#${id}-${i}`} aria-current={active===i?'step':undefined} onClick={e=>{e.preventDefault();setActive(i);document.getElementById(`${id}-${i}`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'})}}><span>0{i+1}</span>{c.label}</a>)}</nav>
    <div className="wow-story-visual" aria-hidden="true">{chapters.map((c,i)=><div key={c.label} className={`wow-story-scene wow-story-scene-${c.kind}${active===i?' is-active':''}`}><span className="wow-story-ghost">{c.kind==='cargo'?'READY.':c.kind==='road'?'MOVING.':'CONNECTED.'}</span><img className="wow-story-object" src={c.image} alt="" loading="lazy"/>{c.kind==='air'&&<img className="wow-story-cloud" src="/assets/images/6a44eec1ed1af2c4c403e809_cloud-template.avif" alt="" loading="lazy"/>}</div>)}</div>
    <div className="wow-story-stage-caption"><span>0{active+1} / 0{chapters.length}</span><span>{chapters[active].label}</span></div>
   </div>
   <div className="wow-story-steps">{chapters.map((c,i)=><article className={`wow-story-step${active===i?' is-active':''}`} key={c.label} id={`${id}-${i}`}><p className="wow-eyebrow">0{i+1} / {c.label}</p><h3>{c.title}</h3><p>{c.description}</p><a className="wow-text-link" href={c.link}>{c.action} ↗</a></article>)}</div>
  </div>
 </section>;
}
