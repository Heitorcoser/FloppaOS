import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(500);
const s = await p.evaluate(() => promptFabricas());
console.log(s.slice(0, 900));
// a IA monta uma linha com o bloco fabrica (como se viesse da resposta)
await p.evaluate(() => { reset(); ECO.f = 1; build({ aparelhos: [{ id: 1, tipo: 'extrator', s: { res: 'minério' } }, { id: 2, tipo: 'extrator', s: { res: 'carvão' } }, { id: 3, tipo: 'fornalha', s: { r: 'barra' } }, { id: 4, tipo: 'mercado' }], fios: [[1, 3], [2, 3], [3, 4]] }); });
console.log('montado:', await p.evaluate(() => Object.values(D).map(d => d.type + (d.s.r ? ':' + d.s.r : '') + (d.s.res ? ':' + d.s.res : '')).join(', ') + ' | fios ' + W.length));
console.log('chk erros:', await p.evaluate(() => chk('```fabrica\n{"aparelhos":[{"id":1,"tipo":"extrator"},{"id":2,"tipo":"refinaria","s":{"r":"plastico"}}],"fios":[[1,2]]}\n```')));
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS'); await b.close();
