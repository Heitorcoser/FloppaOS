// Mostra onde a mosca bate no cenário grande+pequeno
const M = require('../app/core.js'), brain = M.buildBrain(require('../app/brain.json'));
const g = Float32Array.from(JSON.parse(require('fs').readFileSync(process.argv[2])));
for (const [lado, gap, sm] of [[1, 0.06, 5], [-1, 0.06, 5], [1, 0.1, 3.5]]) {
  const T = M.makeTrack(6, 1000, { reta: true, obs: [{ s: 0.4, off: 0.95 * lado, r: 11 }, { s: 0.4 + gap, off: 0, r: sm }] });
  const e = new M.Evolution(brain, { pop: 3, seed: 5 }); e.genomes = [g, g, g]; e.level = 6; e.track = T; e.fixa = true; e.startGen();
  const f = e.flies[0], rast = []; let n = 0;
  while (!e.step()) { if (n++ % 15 == 0) rast.push(`(${f.x.toFixed(0)},${f.y.toFixed(0)} v${f.v.toFixed(0)} s${f.steer.toFixed(1)})`); }
  console.log(`lado ${lado} gap ${gap}: obs ${T.obs.map(o => o.x.toFixed(0) + ',' + o.y.toFixed(0) + ' r' + o.r).join(' ; ')} | ${f.done ? 'CHEGOU' : 'bateu em ' + f.x.toFixed(0) + ',' + f.y.toFixed(0)}`);
  console.log('  ', rast.filter((_, i) => i > 10).slice(0, 14).join(' '));
}
