import {PageShell} from './PageShell';
import {CallToAction} from '../components/shared/CallToAction';
import {media,site} from '../content/site';
import {ShipmentStory,type StoryChapter} from '../components/shared/ShipmentStory';
const chapters:StoryChapter[]=[
 {label:'Understand',title:'Your parcel. Your priorities.',description:'Tell us what you are sending, where it needs to go and what matters to you. We’ll help you gather the details for a useful shipping enquiry.',image:media.container,kind:'cargo',link:'/contact/',action:'Start a conversation'},
 {label:'Coordinate',title:'Find the way forward.',description:'Explore the available services, handling requirements and documentation with our team. Collection and carrier options are confirmed with your quote.',image:media.truck,kind:'road',link:'/#services',action:'Explore our services'},
 {label:'Stay connected',title:'A team you can reach.',description:'Ask about the next step, share an AWB or get in touch about a new shipment. A clearer conversation is always a good place to start.',image:media.plane,kind:'air',link:'/tracking/',action:'Track a shipment'},
];
export default function AboutPage(){return <PageShell className="wow-about-page">
 <section className="wow-inner-hero wow-about-hero"><div data-page-enter><p className="wow-eyebrow">ABOUT WOW SHIPPINGS</p><h1>Built around<br/><span>your shipment.</span></h1><p className="wow-lead">Practical shipping options and personal support for individuals and businesses.</p><a className="wow-button wow-button-light" href="/contact/">Discuss your shipment <span>↗</span></a></div><div className="wow-about-vehicle" data-page-enter><span className="wow-eyebrow">DOMESTIC · INTERNATIONAL</span><img data-parallax="road" src={media.truck} alt="Detailed transport vehicle, illustrating the shipping journey"/><a className="wow-image-caption wow-story-explore" href="#about-journey">EXPLORE THE JOURNEY <span>↓</span></a></div></section>
 <section className="wow-about-intro wow-section"><p className="wow-eyebrow">PERSONAL SERVICE. PRACTICAL SHIPPING.</p><h2>For personal parcels.<br/>For business shipments.<br/><span>Here to help with both.</span></h2><p>{site.intro.description}</p></section>
 <ShipmentStory id="about-journey" eyebrow="THE WOW APPROACH" title="Behind every move." chapters={chapters}/><CallToAction/>
 </PageShell>}
