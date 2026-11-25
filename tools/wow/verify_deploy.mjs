import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin=new URL(process.env.TEST_ORIGIN||process.argv[2]).origin;
const report={origin,pages:[],assets:[],checks:{}};
for(const route of ['/','/about/','/tracking/','/contact/']){
 const response=await fetch(origin+route);assert.equal(response.status,200,route);const html=await response.text();assert.match(html,/<title>[^<]*WOW Shipping/);assert.ok(html.includes(`rel="canonical" href="${origin}${route}"`));assert.ok(html.includes(`${origin}/assets/wow/brand/social.png`));assert.match(response.headers.get('content-type')||'',/text\/html/);
 const entry=html.match(/src="([^"]+\/main-[^"]+\.js)"/);assert.ok(entry,'Production JavaScript entry exists');report.pages.push({route,status:response.status,canonical:true});
}
for(const path of ['/assets/wow/brand/social.png','/assets/images/6a44eec1ed1af2c4c403e809_cloud-template.avif','/assets/wow-runtime/main.js','/assets/wow/particle-text.js']){const response=await fetch(origin+path);assert.equal(response.status,200,path);report.assets.push({path,status:response.status,type:response.headers.get('content-type')});if(path.endsWith('/main.js'))assert.ok((await response.text()).includes(new URL(origin).hostname),'The animation runtime permits this production host')}
for(const path of ['/community/','/careers/','/industries/','/insights/'])assert.equal((await fetch(origin+path)).status,404,path);report.checks.removedRoutes=true;
const services=await fetch(origin+'/services',{redirect:'manual'});assert.equal(services.status,302);assert.ok(services.headers.get('location')?.endsWith('/#services'));report.checks.servicesRedirect=true;
const tracking=await fetch(origin+'/api/tracking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trackingNumber:'WOW-deployment-check'})});assert.equal(tracking.status,503);assert.equal((await tracking.json()).error.code,'NOT_CONFIGURED');assert.match(tracking.headers.get('cache-control')||'',/no-store/);report.checks.trackingFunction=true;
const invalid=await fetch(origin+'/api/tracking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trackingNumber:''})});assert.equal(invalid.status,422);report.checks.apiValidation=true;
report.passed=true;await fs.mkdir('reference/wow/deployment',{recursive:true});await fs.writeFile('reference/wow/deployment/http.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
