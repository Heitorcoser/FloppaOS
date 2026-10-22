// Faz o tutorial inteiro como um jogador faria, tocando nos lugares destacados
import { chromium } from 'playwright';
const [file, dir] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, hasTouch: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + file); await p.waitForTimeout(1800);
const passo = async () => p.evaluate(() => TUT.i);
const shot = async n => p.screenshot({ path: `${dir}/tut_${n}.png` });
await shot(0);
await p.click('#tut .ok'); await p.waitForTimeout(400); await shot(1);           // Começar
await p.click('#dock .add'); await p.waitForTimeout(600); await shot(2);         // abre o +
await p.click(`#shl .it[onclick="addT('valor')"]`); await p.waitForTimeout(600);
await p.click('#dock .add'); await p.waitForTimeout(400);
await p.fill('#sq', 'lâmp'); await p.waitForTimeout(300);
await p.click(`#shl .it[onclick="addT('lamp')"]`); await p.waitForTimeout(600); await shot(4);
const v = await p.evaluate(() => ultimo('valor').id), l = await p.evaluate(() => ultimo('lamp').id);
await p.click(`#c${v} .port`); await p.waitForTimeout(200); await p.click(`#c${l} .port`); await p.waitForTimeout(600); await shot(5);
await p.fill(`#c${v} input[data-k=v]`, 'verde'); await p.click(`#c${v} [data-a=send]`); await p.waitForTimeout(700); await shot(6);
console.log('passo depois da lâmpada:', await passo());
for (let k = 0; k < 4; k++) { await p.click('#tut .tutb button:last-child'); await p.waitForTimeout(400); }
await shot(10);
await p.click('#tut .tutb button:first-child'); await p.waitForTimeout(400);
console.log('fim:', await p.evaluate(() => [localStorage.getItem('fabtut'), PROG.lv, PROG.xp, PROG.c.fio, PROG.c.lamp]));
await p.evaluate(() => comoJogar()); await p.waitForTimeout(300); await p.screenshot({ path: `${dir}/guia.png` });
await p.evaluate(() => menu()); await p.waitForTimeout(300); await p.screenshot({ path: `${dir}/menu.png` });
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS');
await b.close();
