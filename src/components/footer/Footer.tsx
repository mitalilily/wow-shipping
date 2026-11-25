import {site} from '../../content/site';
import {BrandMark} from '../shared/BrandMark';
import {ParticleSignature} from './ParticleSignature';
export function Footer(){return <footer className="wow-footer" data-wow-chapter="arrival">
 <div className="wow-footer-top"><p className="wow-eyebrow">SHIPPING. MADE SIMPLE.</p><span className="wow-footer-arrival"><span/> Here to help.</span></div>
 <div className="wow-footer-grid">
  <img className="wow-footer-map" src="/assets/images/6a44eec1ed1af2c4c403dfc5_map.png" alt="" aria-hidden="true" loading="lazy"/>
  <div><a href="/" aria-label="WOW Shippings home" data-barba-prevent="all"><BrandMark/></a><p>Personal parcels.<br/>Business shipments.</p></div>
  <nav aria-label="Footer navigation"><span className="wow-eyebrow">Explore</span>{site.nav.map(n=><a key={n.href} href={n.href} data-barba-prevent="all">{n.label}</a>)}<a href="/#services" data-barba-prevent="all">Services</a></nav>
  <div><span className="wow-eyebrow">Let’s talk shipping</span><a href={`mailto:${site.email}`}>{site.email}</a><a href={site.phoneHref}>{site.phone}</a><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp ↗</a></div>
  <div><span className="wow-eyebrow">Location</span><p>{site.location}</p><p className="wow-footer-note">Domestic · International</p></div>
 </div>
 <ParticleSignature/>
 <div className="wow-footer-bottom"><span>© {new Date().getFullYear()} WOW Shippings</span><a href={site.privacy} target="_blank" rel="noreferrer">Privacy policy ↗</a><span>Shipping, with WOW.</span></div>
 </footer>}
