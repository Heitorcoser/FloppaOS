import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 400, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
// IA falsa: 1ª resposta (streaming) tem um bug de execução; a correção vem certa
const ruim = 'const fb = tela(32,32);\nif(!S.ok){S.ok=1;S.x=16}\nif(teclas.direita) S.x++;\nfb.limpar("#000");\nfb.ret(S.x, 10, 2, 2, corJogador);\nfb.mostrar();';
const bom = ruim.replace('corJogador', '"lime"');
const resp = (c) => 'Aqui está:\n```jsx\n' + c + '\n```\n```fabrica\n{"aparelhos":[{"id":1,"tipo":"ctl"},{"id":2,"tipo":"hub"},{"id":3,"tipo":"timer","s":{"ms":33}},{"id":4,"tipo":"comand","s":{}},{"id":5,"tipo":"disp","s":{"n":32}}],"fios":[[1,2],[3,2],[4,2],[5,2]]}\n```';
let pedidos = [];
await p.route('https://api.groq.com/**', async (r) => {
  const body = JSON.parse(r.request().postData()); pedidos.push(body);
  if (body.stream) {
    const txt = resp(ruim), partes = txt.match(/[\s\S]{1,25}/g);
    const sse = partes.map(x => 'data: ' + JSON.stringify({ choices: [{ delta: { content: x } }] }) + '\n\n').join('') + 'data: ' + JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }] }) + '\n\ndata: [DONE]\n\n';
    return r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: sse });
  }
  return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content: resp(bom) }, finish_reason: 'stop' }] }) });
});
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(500);
await p.evaluate(() => { try { localStorage.setItem('fabtut', 'feito'); } catch (e) {} tutFim && tutFim(); });
// 1) teste de execução direto
console.log('teste ok:', JSON.stringify(await p.evaluate(() => testaCodigo('const fb=tela(32,32);fb.limpar("#000");fb.px(1,1,"red");fb.mostrar();', 'jsx'))));
console.log('teste bug:', JSON.stringify(await p.evaluate(() => testaCodigo('const fb=tela(32,32);fb.px(x,1,"red");fb.mostrar();', 'jsx'))));
console.log('teste loop:', JSON.stringify(await p.evaluate(() => testaCodigo('while(true){}', 'jsx'))));
console.log('teste js laço:', JSON.stringify(await p.evaluate(() => testaCodigo('while(true){ pixel(1,1,"red"); await esperar(100) }', 'js'))));
console.log('sem mostrar:', JSON.stringify(await p.evaluate(() => testaResposta('```jsx\nconst fb=tela(32,32);fb.px(1,1,"red");\n```'))));
// 2) planejador local
await p.evaluate(() => { reset(); ECO.f = 0; M = 999999; aiToggle(); ask('Monte uma linha de produção de foguete'); });
console.log('foguete travado:', await p.evaluate(() => [...document.querySelectorAll('#msgs .msg')].pop().innerText.replace(/\n+/g, ' | ').slice(0, 400)));
await p.evaluate(() => { ECO.f = 1; ask('quero fabricar celulares'); });
await p.evaluate(() => [...document.querySelectorAll('#msgs .msg button')].filter(x => /Montar/.test(x.textContent)).pop().click());
await p.waitForTimeout(300);
console.log('celular montado:', await p.evaluate(() => Object.values(D).map(d => d.type + (d.s.r ? ':' + d.s.r : '') + (d.s.res ? ':' + d.s.res : '')).join(', ') + ' | fios ' + W.length));
await p.waitForTimeout(25000);
console.log('celulares feitos:', await p.evaluate(() => Object.values(D).filter(d => d.s.r == 'celular').map(d => d.n || 0)), 'dinheiro', await p.evaluate(() => Math.floor(M)));
console.log('não confunde:', await p.evaluate(() => [itemPedido('faça um jogo de carro'), itemPedido('monte uma linha de robô avançado'), itemPedido('quero fazer móveis'), itemPedido('explique meu projeto')]));
// 3) IA com streaming + teste + correção sozinha
await p.evaluate(() => { reset(); ECO.f = 1; PC.p = 'groq'; provUI(); $('#ak').value = 'gsk_teste'; $('#apl').checked = true; ask('faça um jogo de quadrado que anda'); });
await p.waitForTimeout(4000);
console.log('pedidos:', pedidos.map(x => (x.stream ? 'stream' : 'normal') + ':' + x.model).join(', '));
console.log('última msg:', await p.evaluate(() => [...document.querySelectorAll('#msgs .msg')].pop().innerText.slice(-160).replace(/\n+/g, ' | ')));
console.log('montou:', await p.evaluate(() => Object.values(D).map(d => d.type).join(',')), '| código certo:', await p.evaluate(() => Object.values(D).some(d => d.type == 'comand' && /"lime"/.test(d.s.code))));
console.log('contexto tem catálogo:', await p.evaluate(() => { const s = mkSys(); return [/OUTROS APARELHOS[^\n]{0,120}/.exec(s)[0], /JOGADOR[^\n]*/.exec(s)[0]]; }));
// 4) memória e provedores
await p.reload(); await p.waitForTimeout(500);
console.log('conversa restaurada:', await p.evaluate(() => [HIST.length, document.querySelectorAll('#msgs .msg').length]));
await p.evaluate(() => { aiToggle(); $('#set').open = true; $('#ap').value = 'omni'; provTroca(); });
console.log('omni:', await p.evaluate(() => [$('#au').value, $('#au').style.display, $('#apd').textContent.slice(0, 40)]));
await p.screenshot({ path: process.argv[3] || '/tmp/ia2.png' });
console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'SEM ERROS'); await b.close();
