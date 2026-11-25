import {useEffect, useRef, useState} from 'react';

export function CallToAction(){
 const section=useRef<HTMLElement>(null);
 const [visible,setVisible]=useState(false);

 useEffect(()=>{
  const element=section.current;
  if(!element)return;
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting))setVisible(true);
  },{threshold:.12});
  observer.observe(element);
  return()=>observer.disconnect();
 },[]);

 return <section ref={section} className={`wow-cta home-cta-wrap${visible?' is-in-view':''}`} data-wow-chapter="destination">
  <div className="wow-cta-orbit" aria-hidden="true"/>
  <div className="wow-cta-plane-stage" aria-hidden="true">
   <div className="wow-cta-plane-halo"/>
   <img className="wow-cta-plane" src="/assets/wow/brand/plane-branded.svg" alt="" loading="lazy"/>
   <div className="wow-cta-plane-glint"/>
  </div>
  <div className="wow-cta-content">
   <p className="wow-eyebrow">SHIPPING ENQUIRIES</p>
   <h2>LET’S GET<br/><span>YOUR SHIPMENT MOVING.</span></h2>
   <a href="/contact/" className="wow-button wow-button-light" data-barba-prevent="all">Get a Shipping Quote <span>↗</span></a>
  </div>
  <div className="wow-cta-coordinate" aria-hidden="true">PICKUP → DELIVERY <span>●</span></div>
 </section>;
}
