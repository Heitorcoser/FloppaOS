import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
p.on('pageerror', e => console.log('pageerror:', e.message, e.stack?.split('\n')[1]));
p.on('console', m => console.log('console:', m.type(), m.text()));
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(800);
console.log(await p.evaluate(() => typeof ex12 + ' ' + typeof ex1 + ' ' + typeof T));
await b.close();
