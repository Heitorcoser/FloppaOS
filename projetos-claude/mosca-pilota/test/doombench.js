// Treina o modo Doom no Node e mostra a evolução: node test/doombench.js [segundos] [semente]
const C = require('../app/core.js'), Dm = require('../app/doom.js');
const brain = C.buildBrain(require('../app/brain.json'));
const seg = +process.argv[2] || 120, ev = new Dm.DoomEvolution(brain, { pop: 24, seed: +process.argv[3] || 1 });
const t0 = Date.now(); let passos = 0;
while ((Date.now() - t0) / 1000 < seg) {
  passos++;
  if (ev.step()) {
    const r = ev.lastResult;
    if (r.gen % 5 == 0 || r.levelUp) console.log(`g${r.gen} N${r.level} mortes ${r.kills}/${r.total} limparam ${r.finished}${r.levelUp ? ' ↑ NÍVEL' : ''} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
}
console.log('nível final', ev.level, 'gerações', ev.gen, 'passos/s', Math.round(passos / seg), 'tempo de jogo/s real', (passos / 30 / seg).toFixed(1) + 'x');
// avalia o melhor cérebro em 20 mapas nunca vistos do nível atual: mira de verdade ou atira a esmo?
const g = ev.genomes[0], nv = Math.max(1, ev.level - 1); let m = 0, tot = 0, tiros = 0, erros = 0, limpos = 0, giro = 0, n = 0;
for (let s = 0; s < 20; s++) {
  const M = Dm.makeMap(nv, 9000 + s), j = Dm.novoJogo(M), c = Dm.controle(brain, g);
  for (let t = 0; t < (25 + 5 * M.spawns.length) * 30 && j.vivo; t++) { Dm.enxerga(M, j); Dm.passo(M, j, Dm.pensa(brain, c, j.par, j.dem, j.v / Dm.VMAX)); giro += Math.abs(j.steer); n++; }
  m += j.mortes; tot += j.inim.length; tiros += j.dano + j.erros; erros += j.erros; limpos += j.limpou;
}
console.log(`mapas novos nível ${nv}: mortes ${m}/${tot}, limpou ${limpos}/20, pontaria ${Math.round(100 * (tiros - erros) / Math.max(1, tiros))}%, giro médio ${(giro / n).toFixed(2)}`);
