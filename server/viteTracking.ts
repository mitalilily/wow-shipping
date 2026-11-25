import type {Plugin} from 'vite';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {handleTracking} from './tracking.ts';
export function trackingApiPlugin():Plugin{
 const hits=new Map<string,{count:number;until:number}>();
 const middleware=async(req:IncomingMessage,res:ServerResponse,next:()=>void)=>{
  if(/^\/services\/?(?:\?.*)?$/.test(req.url||'')){res.writeHead(302,{Location:'/#services'});res.end();return}
  if(req.url?.split('?')[0]!=='/api/tracking'){next();return}
  const key=req.socket.remoteAddress||'local';const now=Date.now();for(const [k,v]of hits)if(v.until<now)hits.delete(k);
  const previous=hits.get(key);const current=previous&&previous.until>now?previous:{count:0,until:now+60000};current.count++;hits.set(key,current);
  if(current.count>60){res.writeHead(429,{'Content-Type':'application/json','Cache-Control':'no-store','Retry-After':'60'});res.end(JSON.stringify({error:{code:'RATE_LIMITED',message:'Please wait a moment before trying again.'}}));return}
  try{let body='';for await(const chunk of req){body+=chunk.toString();if(body.length>2048){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{code:'INVALID_INPUT',message:'This tracking request is too large.'}}));return}}
   const request=new Request('http://localhost/api/tracking',{method:req.method||'GET',headers:{'content-type':String(req.headers['content-type']||'')},...(!['GET','HEAD'].includes(req.method||'GET')?{body}:{})});const response=await handleTracking(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
  }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{code:'PROVIDER_UNAVAILABLE',message:'Please contact WOW Shipping for an update.'}}))}
 };
 return{name:'wow-tracking-api',configureServer(server){server.middlewares.use(middleware)},configurePreviewServer(server){server.middlewares.use(middleware)}};
}
