// Abre um Console, escolhe uma ROM de teste de NES e confere se o emulador carrega
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 800, height: 450 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(500);
await p.evaluate(() => { reset(); ECO.f = 1; window.__c = add('console', 20, 20).id; wires(); });
await p.setInputFiles('#gf' + await p.evaluate(() => __c), process.argv[3]);
await p.waitForTimeout(800);
console.log('status:', await p.evaluate(() => q(D[__c], '.cs').textContent.replace('\n', ' | ')));
await p.evaluate(() => emuPlay(D[__c]));
await p.waitForTimeout(20000);
const f = p.frames().find(x => x !== p.mainFrame());
console.log('iframe:', f ? await f.evaluate(() => (document.querySelector('canvas') ? 'canvas ok ' : 'sem canvas ') + document.body.innerText.slice(0, 120).replace(/\s+/g, ' ')) : 'sem iframe');
await p.screenshot({ path: process.argv[4] });
console.log('jogos salvos:', await p.evaluate(async () => (await jogosTodos()).map(g => g.name + ':' + g.sys)));
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS');
await b.close();
