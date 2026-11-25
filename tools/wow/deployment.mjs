/** Public deployment origin only; this configuration never contains credentials. */
const configured=process.env.WOW_SITE_URL||process.env.URL||'https://wow-shipping.netlify.app';
const parsed=new URL(configured);
if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw new Error('WOW_SITE_URL must be a public HTTP(S) origin.');
export const siteOrigin=parsed.origin;
export const siteHostname=parsed.hostname;
