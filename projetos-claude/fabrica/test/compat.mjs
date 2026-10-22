// Cria um save na versão ANTIGA e abre na NOVA (mesmo navegador = mesmo localStorage/IndexedDB)
import { chromium } from 'playwright';
const [velho, novo, foto] = process.argv.slice(2);
const dir = '/tmp/claude-0/-home-user/aa5e4025-6737-51a8-9435-611819b4bb8c/scratchpad/perfil';
const ctx = await chromium.launchPersistentContext(dir, { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', viewport: { width: 400, height: 860 } });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + velho); await p.waitForTimeout(600);
await p.evaluate(async () => {
  localStorage.clear(); M = 777; saveM(); ex9();
  const c = add('console', 400, 20, { sis: 'PS1' }); add('mina', 400, 300); W.push([c.id, add('cpu2', 600, 20).id]); wires(); save();
  await lput({ name: 'teste', kind: 'text', ext: 'txt', data: 'ola', size: 3 });
});
await p.waitForTimeout(1500);
const antes = await p.evaluate(() => ({ cards: Object.keys(D).length, fios: W.length, vars: JSON.stringify(VARS), cmds: Object.keys(CMDS), M }));
await p.goto('file://' + novo); await p.waitForTimeout(1500);
const depois = await p.evaluate(async () => ({ cards: Object.keys(D).length, fios: W.length, vars: JSON.stringify(VARS), cmds: Object.keys(CMDS), M,
  console: q(Object.values(D).find(d => d.type == 'console'), 'select').value, lib: Object.keys(LIB), jogos: (await jogosTodos()).length }));
console.log('antes :', JSON.stringify(antes)); console.log('depois:', JSON.stringify(depois));
await p.evaluate(() => { tutFim(); fit(); }); await p.waitForTimeout(400);
await p.screenshot({ path: foto });
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS');
await ctx.close();
