interface UnitedCarriersRuntime {
  ready: boolean;
  gsap: {
    globalTimeline: { timeScale: (value: number) => void };
    ticker: { lagSmoothing: (value: number) => void };
  };
  ScrollTrigger: { getAll: () => Array<{kill:()=>void}>; refresh: (safe?:boolean)=>void };
  lenis?: {scrollTo:(position:number,options?:Record<string,unknown>)=>void;destroy:()=>void;resize?:()=>void;options:Record<string,unknown>};
  destroy: () => void;
}
interface Window {
  __UC_RECONSTRUCTION__?: UnitedCarriersRuntime;
  __WOW_RUNTIME__?: UnitedCarriersRuntime;
  __WOW_INITIAL_HASH__?: string;
  __UC_BOOT_ERROR__?: string;
  jQuery?: unknown;
}
