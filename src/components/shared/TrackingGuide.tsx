import {useRef,useState,type KeyboardEvent} from 'react';
import {media} from '../../content/site';
const stages=[
 {label:'Registered',title:'A number. A starting point.',text:'The courier has created a shipment record. A tracking number can exist before the first collection scan appears.',image:media.container,kind:'cargo'},
 {label:'In transit',title:'Between here and there.',text:'Your parcel is moving through the courier’s network. Updates appear when the courier records and shares a new scan.',image:media.truck,kind:'road'},
 {label:'Out for delivery',title:'The final delivery stage.',text:'The courier reports that the parcel is with its delivery team. Timing and delivery arrangements depend on the courier and the shipment.',image:media.truck,kind:'road'},
 {label:'Delivered',title:'A handover recorded.',text:'The courier has recorded delivery. If the parcel hasn’t reached you, keep your AWB ready and contact the team for help.',image:media.container,kind:'cargo'},
];
export function TrackingGuide(){const [active,setActive]=useState(0),tabs=useRef<HTMLDivElement>(null);
 const key=(e:KeyboardEvent<HTMLButtonElement>,i:number)=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%stages.length;else if(e.key==='ArrowLeft')next=(i-1+stages.length)%stages.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=stages.length-1;else return;e.preventDefault();setActive(next);tabs.current?.querySelectorAll('button')[next]?.focus()};
 return <section className="wow-tracking-guide" aria-labelledby="tracking-guide-title"><div className="wow-guide-heading" data-scroll-reveal><p className="wow-eyebrow">READING THE JOURNEY</p><h2 id="tracking-guide-title">What does that<br/><span>update mean?</span></h2><p>Explore common courier statuses.<br/>This guide is separate from your live tracking result.</p></div>
  <div className="wow-guide-content" data-scroll-reveal><div ref={tabs} role="tablist" aria-label="Courier status guide" className="wow-guide-tabs">{stages.map((s,i)=><button id={`guide-tab-${i}`} key={s.label} type="button" role="tab" aria-selected={active===i} aria-controls={`guide-panel-${i}`} tabIndex={active===i?0:-1} onKeyDown={e=>key(e,i)} onClick={()=>setActive(i)}><span>0{i+1}</span>{s.label}</button>)}</div>
  {stages.map((item,i)=><div key={item.label} hidden={active!==i} className="wow-guide-panel" id={`guide-panel-${i}`} role="tabpanel" aria-labelledby={`guide-tab-${i}`} tabIndex={0}><div className={`wow-guide-vehicle wow-guide-vehicle-${item.kind}`} aria-hidden="true"><img src={item.image} alt="" loading="lazy"/></div><div className="wow-guide-description"><p className="wow-eyebrow">{item.label}</p><h3>{item.title}</h3><p>{item.text}</p><a href="#tracking-number" className="wow-text-link">Check your AWB ↗</a></div></div>)}</div>
 </section>;
}
