// Gera app/doom_treinado.js a partir de um treino salvo: node test/exporta.js treino.json
const d = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));
const o = { v: 1, gen: d.gen, level: d.level, genomes: d.genomes.slice(0, 24).map(g => g.map(v => Math.round(v * 100) / 100)) };
require('fs').writeFileSync(__dirname + '/../app/doom_treinado.js', '// Cérebro pré-treinado no modo Doom (nível ' + d.level + ', geração ' + d.gen + ' do treino no computador)\nwindow.DOOM_TREINADO=' + JSON.stringify(o) + ';\n');
console.log('ok', o.level, o.gen, o.genomes.length + ' genomas');
