// Testa os modos Doom e Doom 64 no navegador: node test/doomui.mjs <pasta app> <rom.n64> <pasta das fotos>
import { chromium } from '/home/user/fabrica/test/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFileSync } from 'fs'; import { join, extname } from 'path';
const [app, rom, out] = process.argv.slice(2);
const srv = createServer((q, r) => { try { const f = join(app, decodeURIComponent(q.url.split('?')[0]) == '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0])); const dados = readFileSync(f); r.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' }[extname(f)] || 'application/octet-stream' }); r.end(dados); } catch (e) { r.writeHead(404); r.end(); } }).listen(8766);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 400, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8766/'); await p.waitForTimeout(800);
await p.click('.tabs button[data-m=doom]'); await p.click('#turbo'); await p.waitForTimeout(20000); await p.click('#turbo'); await p.waitForTimeout(1500);
console.log('doom:', await p.evaluate(() => [...document.querySelectorAll('.chip b')].map(x => x.textContent).join(' | ')));
await p.screenshot({ path: out + '/doom.png' });
if (rom) {
  await p.click('.tabs button[data-m=d64]'); await p.waitForTimeout(500);
  await p.setInputFiles('#romIn', rom);
  await p.waitForFunction(() => MoscaDoom64.S.pronto, null, { timeout: 120000 });
  await p.waitForTimeout(8000); await p.click('#comeca'); await p.waitForTimeout(16000);
  await p.click('#joga'); await p.waitForTimeout(20000);
  console.log('d64:', await p.evaluate(() => { const S = MoscaDoom64.S; return { par: Array.from(S.par, v => v.toFixed(2)).join(','), dem: Array.from(S.dem, v => v.toFixed(2)).join(','), steer: S.steer.toFixed(2), thrust: S.thrust.toFixed(2), fire: S.fire.toFixed(2) }; }));
  await p.screenshot({ path: out + '/d64.png' });
  console.log('rom salva:', await p.evaluate(async () => (await MoscaDoom64.romSalva())?.name));
}
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS'); await b.close(); srv.close();
