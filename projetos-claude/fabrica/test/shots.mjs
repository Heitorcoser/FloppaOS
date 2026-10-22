// Prints da interface no tamanho de celular, claro e escuro
import { chromium } from 'playwright';
const [file, dir] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const tema of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, colorScheme: tema });
  await p.goto('file://' + file); await p.waitForTimeout(500);
  await p.evaluate(() => { localStorage.clear(); ex14(); });
  await p.waitForTimeout(4000);
  await p.evaluate(() => fit());
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${dir}/ui_${tema}_mesa.png` });
  await p.evaluate(() => sh()); await p.waitForTimeout(400);
  await p.screenshot({ path: `${dir}/ui_${tema}_catalogo.png` });
  await p.evaluate(() => { sh(); progressoUI(); }); await p.waitForTimeout(400);
  await p.screenshot({ path: `${dir}/ui_${tema}_progresso.png` });
  await p.evaluate(() => { cm(); ex7(); }); await p.waitForTimeout(600);
  await p.screenshot({ path: `${dir}/ui_${tema}_comand.png` });
  await p.close();
}
await b.close();
