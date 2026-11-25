let boot:Promise<void>|undefined;

/** One recovered animation owner; React owns the stable section structure. */
export function startHomepage():Promise<void> {
  if(boot)return boot;
  boot=(async()=>{
    await Promise.all([
      document.fonts.load('400 16px "Source Sans 3"'),
      document.fonts.load('600 16px "Source Sans 3"'),
      document.fonts.load('800 16px "Source Sans 3"'),
    ]);
    await document.fonts.ready;
    const runtimeURL='/assets/wow-runtime/main.js';
    await import(/* @vite-ignore */ runtimeURL);
  })().catch((error:unknown)=>{
    window.__UC_BOOT_ERROR__=String(error);
    console.error('Homepage runtime initialization failed',error);
    throw error;
  });
  return boot;
}

export function stopHomepage() {
  window.__UC_RECONSTRUCTION__?.destroy();
}
