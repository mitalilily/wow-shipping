import { useEffect } from 'react';
import { startHomepage, stopHomepage } from '../runtime/bootstrap';

export function useHomepageRuntime() {
  useEffect(()=>{
    let mounted=true;
    let timer:ReturnType<typeof setInterval>|undefined;
    void startHomepage().then(()=>{
      if(!mounted)return;
      timer=setInterval(()=>{
        const runtime=window.__WOW_RUNTIME__;if(!runtime?.ready)return;
        clearInterval(timer);window.dispatchEvent(new Event('wow:ready'));
        const hash=window.__WOW_INITIAL_HASH__;if(!hash)return;
        const target=document.getElementById(hash.slice(1));if(!target)return;
        history.replaceState(null,'',hash);delete window.__WOW_INITIAL_HASH__;
        const y=target.getBoundingClientRect().top+(innerWidth<=767?(document.querySelector('.body-inner')?.scrollTop||0):scrollY)-88;
        const step=Math.floor(innerHeight*.8);let position=0;
        const advance=()=>{if(!mounted)return;position=Math.min(position+step,y);runtime.lenis?.scrollTo(position,{immediate:true,force:true});if(position<y)requestAnimationFrame(advance);else{target.tabIndex=-1;target.focus({preventScroll:true})}};
        requestAnimationFrame(advance);
      },100);
    }).catch(()=>{});
    return ()=>{mounted=false;if(timer)clearInterval(timer);stopHomepage();};
  },[]);
}
