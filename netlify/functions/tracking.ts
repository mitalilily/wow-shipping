import {handleTracking} from '../../server/tracking.ts';

/** Keep the same validated Web Request handler in local preview and on Netlify. */
export default async function tracking(request:Request):Promise<Response>{return handleTracking(request)}
export const config={
 path:'/api/tracking',
 rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'},
};
