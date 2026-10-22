// Abre o jogo, roda todos os exemplos e confere erros. Uso: node smoke.mjs arquivo.html
import { chromium } from 'playwright';
const file = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 400, height: 860 } });
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|ERR_/.test(m.text())) errs.push('console: ' + m.text()); });
await p.goto('file://' + file);
await p.waitForTimeout(800);
const ex = await p.evaluate(() => Object.keys(window).filter(k => /^ex\d+$/.test(k) && typeof window[k] == 'function').sort((a, b) => +a.slice(2) - +b.slice(2)));
const out = [];
for (const e of ex) {
  await p.evaluate(e => { try { window[e](); } catch (x) { console.error(e + ': ' + x.message) } }, e);
  await p.waitForTimeout(500);
  out.push(e + ':' + await p.evaluate(() => document.querySelectorAll('.card').length));
}
// fábrica de dinheiro rodando por um tempo
await p.evaluate(() => { localStorage.clear(); M = 250; ex12(); });
await p.waitForTimeout(9000);
const money = await p.evaluate(() => M);
// comand rodando
await p.evaluate(() => { ex5(); const c = Object.values(D).find(d => d.type == 'ctl'); emit(c, 'direita'); });
await p.waitForTimeout(800);
const log = await p.evaluate(() => (Object.values(D).find(d => d.type == 'comand').cl || []).join('|'));
console.log(out.join(' '));
console.log('dinheiro apos 9s de fabrica:', money, '| log comand:', log || '(vazio)');
if (process.argv[3]) await p.screenshot({ path: process.argv[3] });
console.log(errs.length ? 'ERROS:\n' + errs.join('\n') : 'SEM ERROS');
await b.close();
