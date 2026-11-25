import type {TrackingErrorCode,TrackingResult} from '../src/features/tracking/types.ts';
export interface TrackingProvider{track(input:{trackingNumber:string;carrierId?:string},signal:AbortSignal):Promise<TrackingResult|null>}
export class TrackingProviderError extends Error{code:TrackingErrorCode;constructor(code:TrackingErrorCode,message:string){super(message);this.code=code}}
const reply=(status:number,code:TrackingErrorCode,message:string)=>Response.json({error:{code,message}},{status,headers:{'Cache-Control':'no-store'}});
/** Provider credentials and provider-specific requests belong in an adapter on the server. */
export function createTrackingHandler(provider?:TrackingProvider,{timeoutMs=10000}={}){return async(request:Request):Promise<Response>=>{
 if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
 if(!request.headers.get('content-type')?.includes('application/json'))return reply(415,'INVALID_INPUT','Please send a valid tracking request.');
 const raw=await request.text();if(raw.length>2048)return reply(413,'INVALID_INPUT','This tracking request is too large.');
 let data:unknown;try{data=JSON.parse(raw)}catch{return reply(400,'INVALID_INPUT','Please enter a valid tracking number.')}
 const input=data as {trackingNumber?:unknown;carrierId?:unknown};
 if(!input||typeof input.trackingNumber!=='string'||!input.trackingNumber.trim()||input.trackingNumber.trim().length>64||/[<>\x00-\x1f]/.test(input.trackingNumber)||input.carrierId!==undefined&&(typeof input.carrierId!=='string'||!/^[a-z0-9-]{1,40}$/.test(input.carrierId)))return reply(422,'INVALID_INPUT','Enter the AWB or consignment number from your shipment receipt.');
 if(!provider)return reply(503,'NOT_CONFIGURED','Online tracking is being connected. Share your AWB with our team for the latest available update.');
 const controller=new AbortController();let timeout:ReturnType<typeof setTimeout>|undefined;
 try{
  const result=await Promise.race([provider.track({trackingNumber:input.trackingNumber.trim(),...(input.carrierId?{carrierId:input.carrierId as string}:{})},controller.signal),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>{controller.abort();reject(new TrackingProviderError('TIMEOUT','The courier is taking longer to respond. Please try again.'))},timeoutMs)})]);
  if(!result)return reply(404,'NOT_FOUND','No record was returned for that number. Check your receipt or ask our team for help.');
  // Allowlist public fields. Never forward recipient addresses, phone numbers or raw payloads.
  return Response.json({trackingNumber:result.trackingNumber,carrier:result.carrier,status:result.status,lastUpdated:result.lastUpdated,...(result.estimatedDelivery?{estimatedDelivery:result.estimatedDelivery}:{}),events:result.events.map(e=>({status:e.status,description:e.description,timestamp:e.timestamp,...(e.location?{location:e.location}:{})}))},{headers:{'Cache-Control':'no-store'}});
 }catch(e){if(e instanceof TrackingProviderError)return reply(e.code==='CARRIER_REQUIRED'?409:e.code==='TIMEOUT'?504:503,e.code,e.message);return reply(503,'PROVIDER_UNAVAILABLE','Tracking updates are temporarily unavailable. Please try again or contact our team.')}finally{if(timeout)clearTimeout(timeout)}
}}
// Deliberately unconfigured: no provider has been selected or authorised.
export const handleTracking=createTrackingHandler();
