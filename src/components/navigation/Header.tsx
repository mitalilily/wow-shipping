import {useEffect,useRef,useState} from 'react';
import {site} from '../../content/site';
import {BrandMark} from '../shared/BrandMark';

export function Header(){
 const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(false);
 const toggle=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null);
 const current=location.pathname.replace(/\/$/,'')||'/';
 useEffect(()=>{
  const scroll=()=>setScrolled((innerWidth<=767?(document.querySelector('.body-inner')?.scrollTop||window.scrollY):window.scrollY)>40);
  const owner=document.querySelector('.body-inner');window.addEventListener('scroll',scroll,{passive:true});owner?.addEventListener('scroll',scroll,{passive:true});
  return()=>{window.removeEventListener('scroll',scroll);owner?.removeEventListener('scroll',scroll)};
 },[]);
 useEffect(()=>{
  if(!open)return;const first=menu.current?.querySelector<HTMLAnchorElement>('a');first?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus()}if(e.key==='Tab'){
   const links=[...(menu.current?.querySelectorAll<HTMLElement>('a,button')||[])];const first=links[0],last=links.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();toggle.current?.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();toggle.current?.focus()}
   else if(!e.shiftKey&&document.activeElement===toggle.current){e.preventDefault();first?.focus()}
   else if(e.shiftKey&&document.activeElement===toggle.current){e.preventDefault();last?.focus()}
  }};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
 },[open]);
 useEffect(()=>{const query=matchMedia('(min-width:1024px)');const change=()=>{if(query.matches)setOpen(false)};query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
 const links=site.nav.map(link=><a key={link.href} href={link.href} data-barba-prevent="all" aria-current={current===(link.href.replace(/\/$/,'')||'/')?'page':undefined} onClick={()=>setOpen(false)}>{link.label}<span aria-hidden="true">↗</span></a>);
 return <>
  <a className="wow-skip-link" href="#main-content">Skip to content</a>
  <header className={`wow-header ${scrolled?'is-scrolled':''} ${open?'is-open':''}`}>
   <a className="wow-header-brand" href="/" data-barba-prevent="all"><BrandMark/></a>
   <nav className="wow-desktop-nav" aria-label="Main navigation">{links}</nav>
   <a href="/contact/" className="wow-button wow-header-quote" data-barba-prevent="all">Get a Quote <span>↗</span></a>
   <button ref={toggle} className="wow-menu-toggle" aria-expanded={open} aria-controls="wow-mobile-menu" onClick={()=>setOpen(!open)}><span className="wow-menu-dots" aria-hidden="true">•••</span>{open?'Close':'Menu'}</button>
  </header>
  <div id="wow-mobile-menu" ref={menu} className="wow-mobile-menu" hidden={!open}>
   <p className="wow-eyebrow">A clearer next move.</p><nav aria-label="Mobile navigation">{links}</nav>
   <div className="wow-menu-contact"><a href={`mailto:${site.email}`}>{site.email}</a><a href={site.phoneHref}>{site.phone}</a><span>{site.location}</span></div>
  </div>
 </>;
}
