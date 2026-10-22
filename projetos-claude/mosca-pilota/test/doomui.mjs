// Testa os modos Doom e Doom 64 no navegador: node test/doomui.mjs <pasta app> <rom.n64> <pasta das fotos>
import { chromium } from '/home/user/fabrica/test/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFileSync } from 'fs'; import { join, extname } from 'path';
const [app, rom, out] = process.argv.slice(2);
const srv = createServer((q, r) => { try { const f = join(app, decodeURIComponent(q.url.split('?')[0]) == '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0])); const dados = readFileSync(f); r.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' }[extname(f)] || 'application/octet-stream' }); r.end(dados); } catch (e) { r.writeHead(404); r.end(); } }).listen(8766);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(process.env.CEL ? { ...(await import('/home/user/fabrica/test/node_modules/playwright/index.mjs')).devices['Pixel 7'] } : { viewport: { width: 400, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8766/'); await p.waitForTimeout(800);
await p.click('.tabs button[data-m=doom]'); await p.click('#turbo'); await p.waitForTimeout(20000); await p.click('#turbo'); await p.waitForTimeout(1500);
console.log('doom:', await p.evaluate(() => [...document.querySelectorAll('.chip b')].map(x => x.textContent).join(' | ')));
await p.screenshot({ path: out + '/doom.png' });
if (rom) {
  await p.click('.tabs button[data-m=d64]'); await p.waitForTimeout(500);
  await p.setInputFiles('#romIn', rom);
  const t0 = Date.now(); let ult = '';
  while (Date.now() - t0 < 200000) { const st = await p.evaluate(() => document.getElementById('st64').textContent); if (st != ult) { console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', st); ult = st; } if (/mosca está jogando|Não consegui|Demorou/.test(st)) break; await p.waitForTimeout(1000); }
  await p.waitForTimeout(15000);
  console.log('d64:', await p.evaluate(() => { const S = MoscaDoom64.S; return { hud: MoscaDoom64.temHud(), steer: S.steer.toFixed(2), thrust: S.thrust.toFixed(2), fire: S.fire.toFixed(2), gamepadVisivel: !!document.querySelector('.ejs_virtualGamepad_parent') && getComputedStyle(document.querySelector('.ejs_virtualGamepad_parent')).display != 'none' }; }));
  await p.screenshot({ path: out + '/d64.png' });
  await p.evaluate(() => document.getElementById('joga').click()); await p.waitForTimeout(1500); await p.screenshot({ path: out + '/d64eu.png' });
}
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS'); await b.close(); srv.close();
