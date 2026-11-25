/** Reuse the original, reviewed footer scatter physics without unrelated page controllers. */
import fs from 'node:fs/promises';
let original;
try{original=await fs.readFile('reference/original-assets/recovered/chunks/layout-BqW6AIsF.js','utf8')}
catch{original=await fs.readFile('public/assets/recovered/chunks/layout-BqW6AIsF.js','utf8')}
const start=original.indexOf('xt={imageSelector:');const end=original.indexOf('Lt=new',start);
if(start<0||end<0)throw new Error('Inspect original footer particle class boundaries before regenerating.');
let classes=original.slice(start,end).replace(/,$/,';');
classes=classes.replace('this.dpr=window.devicePixelRatio||1','this.dpr=Math.min(window.devicePixelRatio||1,2)');
classes=classes.replace('const i=Math.sqrt(n),','const i=Math.sqrt(n)||.001,');
await fs.mkdir('public/assets/wow',{recursive:true});
await fs.writeFile('public/assets/wow/particle-text.js','/* Original footer scatter physics, isolated for WOW. Original source archived. */\nimport{i as e}from"../wow-runtime/chunks/vendor-gsap-GRoENYFU.js";\nconst '+classes+'\nexport{bt as ParticleText};\n');
console.log('WOW: prepared original footer scattering engine.');
