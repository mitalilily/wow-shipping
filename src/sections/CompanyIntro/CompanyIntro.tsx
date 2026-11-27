import tree from '../../story/structure/CompanyIntro.json';
import {RecoveredTree} from '../../components/shared/RecoveredTree';

const services = [
  {title:'Domestic',line:'Across India, from your city to every state.',detail:'Door-to-door pickup and delivery.',kind:'road'},
  {title:'International',line:'Global sea and air freight.',detail:'Guidance on customs, documentation and the next steps for your destination.',kind:'air'},
  {title:'Door to door',line:'Doorstep pickup. Doorstep delivery.',detail:'For personal parcels and business shipments. One team, end to end.',kind:'door'},
] as const;

function ServiceIcon({kind}:{kind:typeof services[number]['kind']}){
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='road'?<><path d="M3 8h16v15H3zM19 14h6l4 5v4H19"/><circle cx="9" cy="24" r="3"/><circle cx="24" cy="24" r="3"/><path d="M7 13h8"/></>:kind==='air'?<><path d="m3 17 11 2 5 10 3-1-2-10 9-9c2-2-1-5-3-3l-9 9-10-2zM12 12 9 4l3-1 7 8"/></>:<><path d="M6 28V5h20v23M12 28V15h9v13M10 9h2M20 9h2M17 21h.1"/><path d="M3 28h26"/></>}</svg>;
}

/** Content stays in normal flow; the transport runtime owns the surrounding journey. */
export function CompanyIntro(){return <div className="home-intro-wrap wow-support-wrap">
  <RecoveredTree tree={tree.children[0]}/>
  <section className="home-intro wow-support" aria-labelledby="support-title"><div className="wow-support-shell">
    <div className="wow-support-kicker"><span>SHIPPING SUPPORT</span><span>01 / THE WAY FORWARD</span></div>
    <div className="wow-support-heading-row"><h2 id="support-title">Shipping support.<br/><span>From enquiry<br/>to delivery.</span></h2><div className="wow-support-intro"><p className="wow-support-promise">We handle everything.<br/>You just tell us where it goes.</p><p>Tell us what you are sending and where it needs to go. We arrange pickup, documentation and delivery — for domestic and international shipments.</p></div></div>
    <div className="wow-support-body"><figure className="wow-support-photo"><img src="/assets/wow/brand/shipping-port.webp" alt="Aerial view of containers and cargo-handling equipment at a shipping terminal" width="1400" height="788" loading="lazy" decoding="async"/><div className="wow-support-photo-caption"><span>YOUR CARGO.</span><strong>Our promise.<br/>Delivered.</strong><span>DOMESTIC + INTERNATIONAL</span></div><figcaption>Freight connections, from road to sea.</figcaption></figure>
      <div className="wow-support-services"><p className="wow-support-services-label">WHAT WE DO</p>{services.map((service,index)=><a className="wow-support-service" key={service.kind} href="/contact/" data-barba-prevent="all" aria-label={`Enquire about ${service.title.toLowerCase()} shipping`}><span className="wow-support-number">0{index+1}</span><div className="wow-support-service-copy"><h3>{service.title}</h3><p>{service.line}<br/><span>{service.detail}</span></p></div><div className="wow-support-service-end"><ServiceIcon kind={service.kind}/><span aria-hidden="true">↗</span></div></a>)}</div>
    </div><div className="wow-support-footer"><p>One team, end to end.</p><a className="wow-button" href="/contact/" data-barba-prevent="all">LET’S PLAN YOUR SHIPMENT <span aria-hidden="true">↗</span></a></div>
  </div></section>
</div>}
