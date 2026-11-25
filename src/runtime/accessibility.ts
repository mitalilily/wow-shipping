/** Add keyboard semantics without changing the recovered visual structure. */
export function enableKeyboardControls():()=>void {
  const items=[...document.querySelectorAll<HTMLElement>('.home-faq-main-item,.footer-info-btn')];
  const bindings:Array<()=>void>=[];
  const header=document.querySelector<HTMLElement>('.header');
  if(header){
    const toggles=[...header.querySelectorAll<HTMLElement>('.header-menu-toggle')];
    const update=()=>toggles.forEach(toggle=>toggle.setAttribute('aria-expanded',String(header.classList.contains('on-open-nav'))));
    const observer=new MutationObserver(update);observer.observe(header,{attributes:true,attributeFilter:['class']});update();
    bindings.push(()=>observer.disconnect());
  }
  for(const [index,item] of items.entries()) {
    const faq=item.classList.contains('home-faq-main-item');
    item.setAttribute('role',faq?'button':'tab');
    item.tabIndex=0;
    if(faq){
      const answer=item.querySelector<HTMLElement>('.home-faq-main-item-ans');
      if(answer){answer.id=`faq-answer-${index}`;item.setAttribute('aria-controls',answer.id);}
    }
    const update=()=>item.setAttribute(faq?'aria-expanded':'aria-selected',String(item.classList.contains('active')));
    const observer=new MutationObserver(update);
    observer.observe(item,{attributes:true,attributeFilter:['class']});
    update();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();item.click();}
    };
    item.addEventListener('keydown',onKey);
    bindings.push(()=>{item.removeEventListener('keydown',onKey);observer.disconnect();});
  }
  const onEscape=(event:KeyboardEvent)=>{
    const header=document.querySelector('.header');
    if(event.key==='Escape'&&header?.classList.contains('on-open-nav'))
      document.querySelector<HTMLButtonElement>('.header-menu-toggle')?.click();
  };
  document.addEventListener('keydown',onEscape);
  return ()=>{bindings.forEach(cleanup=>cleanup());document.removeEventListener('keydown',onEscape);};
}
