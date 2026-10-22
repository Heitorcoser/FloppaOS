// Testa a linha de produção nova (ex14) e uma cadeia avançada no modo livre
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 400, height: 860 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(500);
await p.evaluate(() => { localStorage.clear(); M = 250; ex14(); });
await p.waitForTimeout(20000);
console.log('ex14:', JSON.stringify(await p.evaluate(() => ({
  M: Math.round(M), fornalha: Object.values(D).find(d => d.type == 'fornalha').n,
  mercado: Object.values(D).find(d => d.type == 'mercado').nv, contrato: Object.values(D).find(d => d.type == 'contrato').s.c,
  nivel: PROG.lv, xp: PROG.xp, contadores: PROG.c }))));
// cadeia: cobre -> trefiladora (fio) ; petroleo+agua -> refinaria (plastico) ; fio+plastico -> eletronica (circuito) -> mercado
await p.evaluate(() => {
  reset(); ECO.f = 1;
  const ex = r => add('extrator', 0, 0, { res: r });
  const cu = ex('cobre'), pe = ex('petróleo'), ag = ex('água');
  const tr = add('trefiladora', 0, 0), rf = add('refinaria', 0, 0), el = add('eletronica', 0, 0, { r: 'circuito' }), me = add('mercado', 0, 0);
  [[cu, tr], [pe, rf], [ag, rf], [tr, el], [rf, el], [el, me]].forEach(([x, y]) => W.push([x.id, y.id]));
  wires(); [cu, pe, ag].forEach(x => extLiga(x, 1));
  window.__el = el.id; window.__me = me.id;
});
await p.waitForTimeout(25000);
console.log('cadeia:', JSON.stringify(await p.evaluate(() => ({ circuitos: D[__el].n || 0, inv: D[__el].inv, vendidos: D[__me].nv || 0 }))));
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS');
await b.close();
