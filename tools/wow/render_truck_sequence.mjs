/** Brand the original truck turntable frames without changing their camera motion. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const runtime = await fs.readFile(path.join(root, 'public/assets/recovered/chunks/Home-CZ3JhV-m.js'), 'utf8');
const match = runtime.match(/S=JSON\.parse\('(\[[^']+\])'\)/);
if (!match) throw new Error('Truck frame manifest was not found');
const frames = JSON.parse(match[1]);
const output = path.join(root, 'public/assets/wow/brand/truck-sequence');
await fs.mkdir(output, { recursive: true });
const emblem = `data:image/png;base64,${(await fs.readFile(path.join(root, 'public/assets/wow/brand/emblem.png'))).toString('base64')}`;
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
for (let index = 0; index < frames.length; index += 2) {
  const frame = frames[index];
  const source = path.join(root, 'public', frame.hostedUrl.slice(1));
  const image = `data:image/avif;base64,${(await fs.readFile(source)).toString('base64')}`;
  const dataUrl = await page.evaluate(async ({ image, emblem, progress }) => {
    const load = src => new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src;
    });
    const [photo, mark] = await Promise.all([load(image), load(emblem)]);
    const canvas = document.createElement('canvas');
    canvas.width = 2880; canvas.height = 809;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(photo, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rgba = pixels.data;
    const minY = Math.round(45 + 115 * progress);
    const maxY = Math.round(550 + 160 * progress);
    for (let y = minY; y < maxY; y++) {
      for (let x = 2280; x < 2850; x++) {
        const p = (y * 2880 + x) * 4;
        const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
        const light = (r + g + b) / 3;
        if (rgba[p + 3] < 25 || light > 175 || Math.max(r, g, b) - Math.min(r, g, b) > 24) continue;
        const blend = light < 125 ? .86 : .48;
        rgba[p] = r * (1 - blend) + (8 + light * .18) * blend;
        rgba[p + 1] = g * (1 - blend) + (76 + light * .48) * blend;
        rgba[p + 2] = b * (1 - blend) + (145 + light * .56) * blend;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    const logoY = 255 + 145 * progress;
    ctx.drawImage(mark, 665, logoY, 125, 125);
    ctx.fillStyle = '#0a2043';
    ctx.font = '700 96px Arial, sans-serif';
    ctx.fillText('WOWSHIPPINGS', 810, logoY + 94);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920; exportCanvas.height = 539;
    exportCanvas.getContext('2d').drawImage(canvas, 0, 0, 1920, 539);
    return exportCanvas.toDataURL('image/webp', .78);
  }, { image, emblem, progress: index / (frames.length - 1) });
  await fs.writeFile(path.join(output, `frame_${String(index).padStart(2, '0')}.webp`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
for (const [kind, filename] of [
  ['cab', '6a44eec1ed1af2c4c403e7fc_26b6ae8acf0aa553efea60b4e1e392fd_truck-top_view.avif'],
  ['container', '6a44eec1ed1af2c4c403e7fb_b1a1022bfd557e7d8d1325faf1c21241_container-top_view.avif']
]) {
  const image = `data:image/avif;base64,${(await fs.readFile(path.join(root, 'public/assets/images', filename))).toString('base64')}`;
  const dataUrl = await page.evaluate(async ({ image, emblem, kind }) => {
    const load = src => new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src;
    });
    const [photo, mark] = await Promise.all([load(image), load(emblem)]);
    const canvas = document.createElement('canvas');
    canvas.width = photo.width; canvas.height = photo.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(photo, 0, 0);
    if (kind === 'cab') {
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rgba = pixels.data;
      for (let y = 240; y < 1430; y++) for (let x = 4600; x < 5700; x++) {
        const p = (y * canvas.width + x) * 4;
        const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
        const light = (r + g + b) / 3;
        if (rgba[p + 3] < 25 || light > 175 || Math.max(r, g, b) - Math.min(r, g, b) > 24) continue;
        const blend = light < 125 ? .86 : .48;
        rgba[p] = r * (1 - blend) + (8 + light * .18) * blend;
        rgba[p + 1] = g * (1 - blend) + (76 + light * .48) * blend;
        rgba[p + 2] = b * (1 - blend) + (145 + light * .56) * blend;
      }
      ctx.putImageData(pixels, 0, 0);
    } else {
      ctx.drawImage(mark, 540, 460, 600, 600);
      ctx.fillStyle = '#0a2043';
      ctx.font = '700 365px Arial, sans-serif';
      ctx.fillText('WOWSHIPPINGS', 1300, 900);
    }
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920; exportCanvas.height = 539;
    exportCanvas.getContext('2d').drawImage(canvas, 0, 0, 1920, 539);
    return exportCanvas.toDataURL('image/webp', .78);
  }, { image, emblem, kind });
  await fs.writeFile(path.join(root, `public/assets/wow/brand/truck-top-${kind}.webp`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
await browser.close();
console.log(`WOW: branded ${Math.ceil(frames.length / 2)} truck frames and both overhead assets.`);
