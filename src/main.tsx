import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import App from './app/App';
import './styles/recovered-head.css';
import './styles/accessibility.css';
import './styles/wow.css';
import './styles/inner-stories.css';
import './styles/premium-theme.css';
import './styles/shipping-refinements.css';

const root=document.getElementById('root');
if(!root)throw new Error('Missing application root');
// The restored imperative animation runtime must mount once, outside StrictMode replay.
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced-motion',reduceMotion);
const page=location.pathname.split('/').filter(Boolean)[0]||'home';
if(page==='home'&&!reduceMotion&&location.hash){window.__WOW_INITIAL_HASH__=location.hash;history.replaceState(null,'',location.pathname+location.search)}
document.body.dataset.page=page;
document.body.classList.add(page==='home'&&!reduceMotion?'wow-home':'wow-inner-page');
// Keep each lazy import explicit so Vite attaches its CSS preload dependencies.
const OtherPage=page==='about'?lazy(()=>import('./pages/AboutPage')):page==='tracking'?lazy(()=>import('./pages/TrackingPage')):page==='contact'?lazy(()=>import('./pages/ContactPage')):lazy(()=>import('./app/ReducedMotionHome'));
createRoot(root).render(page==='home'&&!reduceMotion?<App/>:<Suspense fallback={null}><OtherPage/></Suspense>);

if(import.meta.hot)import.meta.hot.accept(()=>window.location.reload());
