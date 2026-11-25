export interface Enquiry{name:string;phone:string;email:string;service:string;origin:string;destination:string;weight:string;notes:string}
export function validateEnquiry(e:Enquiry):Partial<Record<keyof Enquiry,string>>{
 const errors:Partial<Record<keyof Enquiry,string>>={};
 for(const key of ['name','origin','destination','service'] as const)if(!e[key]?.trim())errors[key]=`Please enter ${key==='name'?'your name':key==='service'?'a service':`the ${key}`}.`;
 const digits=e.phone?.replace(/\D/g,'')||'';
 if(!/^[+0-9 ()-]+$/.test(e.phone||'')||digits.length<7||digits.length>15)errors.phone='Enter a contact phone number with 7 to 15 digits.';
 return errors;
}
export function formatEnquiry(e:Enquiry):string{return ['Hello WOW Shipping, I’d like a shipping quote.','',`Name: ${e.name.trim()}`,`Phone: ${e.phone.trim()}`,...(e.email.trim()?[`Email: ${e.email.trim()}`]:[]),`Service: ${e.service}`,`From: ${e.origin.trim()}`,`To: ${e.destination.trim()}`,...(e.weight.trim()?[`Approximate weight: ${e.weight.trim()} kg`]:[]),...(e.notes.trim()?['',`Shipment notes: ${e.notes.trim()}`]:[])].join('\n')}
