// Treina a mosca por um tempo fixo e mede:
//  (a) o cenário do jogador: reta com obstáculo grande no canto e pequeno no meio logo depois
//  (b) pistas novas que ela nunca viu (níveis 5 a 9)
// Uso: node bench.js caminho/core.js segundos semente
const [corePath, secs = 120, seed = 1] = process.argv.slice(2);
const M = require(require('path').resolve(corePath));
const brain = M.buildBrain(require('../app/brain.json'));
const ev = new M.Evolution(brain, { pop: 24, seed: +seed });
const t0 = Date.now();
while (Date.now() - t0 < secs * 1000) ev.step();
const melhor = Float32Array.from(ev.genomes[0]);
if (process.env.SALVA) require('fs').writeFileSync(process.env.SALVA, JSON.stringify(Array.from(melhor)));
function roda(T) {
  const e = new M.Evolution(brain, { pop: 3, seed: 5 });
  e.genomes = [melhor, melhor, melhor]; e.level = T.level; e.track = T; e.fixa = true; e.startGen();
  while (!e.step());
  return e.lastResult.finished > 0;
}
let a = 0, na = 0;
for (const lado of [1, -1]) for (const gap of [0.04, 0.06, 0.08, 0.1]) for (const sm of [3.5, 5]) {
  const T = M.makeTrack(6, 1000 + na, { reta: true, obs: [{ s: 0.4, off: 0.95 * lado, r: 11 }, { s: 0.4 + gap, off: 0, r: sm }] });
  a += roda(T); na++;
}
let b = 0, nb = 0;
for (let lv = 5; lv <= 9; lv++) for (let k = 0; k < 6; k++) { b += roda(M.makeTrack(lv, 5000 + lv * 100 + k)); nb++; }
console.log(`${corePath}: treino ${secs}s -> nível ${ev.level}, geração ${ev.gen} | cenário grande+pequeno: ${a}/${na} | pistas novas: ${b}/${nb}`);
