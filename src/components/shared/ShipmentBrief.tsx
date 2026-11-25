import {media} from '../../content/site';
import {validateEnquiry} from '../../features/contact/enquiry';
export interface Brief{service:string;origin:string;destination:string;name:string;phone:string}
export function ShipmentBrief({brief,onService}:{brief:Brief;onService:(service:string)=>void}){
 const international=brief.service==='International shipping',image=international?media.plane:brief.service==='Door-to-door delivery'?media.truck:media.container;
 const errors=validateEnquiry({...brief,email:'',weight:'',notes:''});
 const complete=[!errors.service,!errors.origin&&!errors.destination,!errors.name&&!errors.phone];
 return <div className="wow-shipment-brief"><div className="wow-brief-top"><span className="wow-eyebrow">YOUR SHIPMENT BRIEF</span><span>{complete.filter(Boolean).length} / 3 details ready</span></div>
  <div className={`wow-brief-visual${international?' is-air':''}`} aria-hidden="true"><img key={image} src={image} alt=""/></div>
  <fieldset className="wow-service-picker"><legend>What kind of shipment?</legend>{['Domestic shipping','International shipping','Door-to-door delivery'].map(service=><button type="button" key={service} aria-pressed={brief.service===service} onClick={()=>onService(service)}>{service.replace(' shipping','')}</button>)}</fieldset>
  <div className="wow-brief-route"><div><span>FROM</span><strong>{brief.origin.trim()||'Your origin'}</strong></div><span aria-hidden="true">↗</span><div><span>TO</span><strong>{brief.destination.trim()||'Your destination'}</strong></div></div>
  <ol className="wow-brief-checklist">{['Shipment','Route','Contact'].map((s,i)=><li key={s} className={complete[i]?'is-complete':''}><span aria-hidden="true">{complete[i]?'✓':`0${i+1}`}</span>{s}<span className="wow-sr-only">{complete[i]?' ready':' needed'}</span></li>)}</ol>
  <p className="wow-brief-note">Your brief takes shape as you fill in the form.</p>
 </div>;
}
