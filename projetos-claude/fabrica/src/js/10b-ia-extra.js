/* ---- IA mais esperta: planejador de fábricas, teste do código e contexto ---- */

/* -- Planejador: calcula a linha de produção completa de qualquer item, sem IA -- */
const nkI = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
const receitaDe = (it) => Object.keys(RECEITAS).find((k) => RECEITAS[k].out == it);
const nivelItem = (it) => (BRUTOS.includes(it) ? ITENS[it][2] : RECEITAS[receitaDe(it)].lv);
function planoFab(alvo) {
  const prof = {}; // item -> distância até o produto final (0 = o próprio)
  const visita = (it, d) => {
    if (prof[it] !== undefined && prof[it] >= d) return;
    prof[it] = d;
    if (BRUTOS.includes(it)) return;
    const r = RECEITAS[receitaDe(it)];
    if (!r) throw new Error("não sei fazer " + it);
    Object.keys(r.in).forEach((x) => visita(x, d + 1));
  };
  visita(alvo, 0);
  const itens = Object.keys(prof),
    brutos = itens.filter((it) => BRUTOS.includes(it)),
    feitos = itens.filter((it) => !BRUTOS.includes(it)),
    fundo = Math.max(0, ...feitos.map((it) => prof[it]));
  // extratores na coluna 0, máquinas da mais básica para a final, mercado no fim
  const maqs = feitos.map((it) => {
    const r = receitaDe(it);
    return { it, r, m: RECEITAS[r].m, col: 1 + fundo - prof[it] };
  });
  const custo =
    brutos.length * T.extrator.price + maqs.reduce((s, x) => s + T[x.m].price, 0) + T.mercado.price;
  const falta = ECO.f ? [] : itens.filter((it) => nivelItem(it) > nivel()).map((it) => [it, nivelItem(it)]);
  return { alvo, brutos, maqs, custo, falta, cols: feitos.length ? fundo + 2 : 1 };
}
function montaPlano(alvo) {
  let P;
  try {
    P = planoFab(alvo);
  } catch (e) {
    return toast(e.message);
  }
  if (P.falta.length) {
    const n = Math.max(...P.falta.map((x) => x[1]));
    return toast(`🔒 ${alvo} precisa do nível ${n} (você está no ${nivel()})`);
  }
  if (!pay(P.custo)) return;
  snap();
  // monta à direita do que já existe, para não cobrir nada
  const L = Object.values(D),
    ox = L.length ? Math.max(...L.map((d) => d.x)) + 320 : -V.x / V.s + 20,
    oy = L.length ? Math.min(...L.map((d) => d.y)) : -V.y / V.s + 20,
    lin = {},
    id = {},
    pos = (c) => [ox + c * 270, oy + (lin[c] = (lin[c] || 0) + 1) * 250 - 250];
  P.brutos.forEach((b) => (id[b] = add("extrator", ...pos(0), { res: b })));
  [...P.maqs].sort((a, b) => a.col - b.col).forEach((m) => (id[m.it] = add(m.m, ...pos(m.col), { lv: 1, r: m.r })));
  const mc = add("mercado", ...pos(P.cols));
  P.maqs.forEach((m) => Object.keys(RECEITAS[m.r].in).forEach((i) => W.push([id[i].id, id[m.it].id])));
  W.push([id[alvo].id, mc.id]);
  wires();
  save();
  P.brutos.forEach((b) => T.extrator.act(id[b], "go", q(id[b], "[data-a=go]")));
  $("#ai").classList.remove("open");
  fit();
  track("plano");
  toast(`🏭 Linha de ${alvo} montada: ${P.brutos.length} extratores, ${P.maqs.length} máquinas`);
}
// Acha o item citado num pedido como "monte uma linha de celulares"
const SINON = { moveis: "móvel", fio: "fio de cobre", fios: "fio de cobre", ferro: "barra de ferro", barras: "barra de ferro", lcd: "tela LCD" };
function achaItem(t) {
  const n = nkI(t);
  if (ITENS[t]) return t;
  for (const it of Object.keys(ITENS).sort((a, b) => b.length - a.length))
    if (new RegExp("(^|[^a-z])" + nkI(it) + "(e?s)?([^a-z]|$)").test(n)) return it;
  for (const [k, v] of Object.entries(SINON)) if (new RegExp("(^|[^a-z])" + k + "([^a-z]|$)").test(n)) return v;
  return null;
}
function itemPedido(t) {
  const n = nkI(t);
  if (/\b(jogo|game|codigo|programa|comand|script|python|javascript|display|emulador|console|explique|explica|erro)/.test(n)) return null;
  if (!/\b(faz|faca|fazer|monte|monta|montar|produz\w*|fabric\w*|linha|quero|constru\w*|cri[ae]r?|ger[ae]r?)\b/.test(n)) return null;
  return achaItem(t);
}
const PEDS = [];
function planoHTML(P, t) {
  const cab = P.maqs.length
    ? `🏭 <b>Linha de ${ic(P.alvo)} ${P.alvo}</b> · calculei aqui, sem gastar IA`
    : `⛏️ <b>${ic(P.alvo)} ${P.alvo}</b> é recurso bruto: um Extrator ligado no Mercado`;
  const lin = [
    `<div>⛏️ Extratores: ${P.brutos.map((b) => ic(b) + " " + b).join(", ")}</div>`,
    ...[...P.maqs]
      .sort((a, b) => a.col - b.col)
      .map((m) => `<div>${T[m.m].i} ${T[m.m].n}: ${esc(txtReceita(RECEITAS[m.r]))}</div>`),
    `<div>🏪 Mercado vende ${ic(P.alvo)} ${P.alvo} (preço base $${ITENS[P.alvo][1]})</div>`,
  ];
  const k = PEDS.push(t) - 1,
    bloq = P.falta.length
      ? `<div class="nota av">🔒 Precisa do nível ${Math.max(...P.falta.map((x) => x[1]))} (você está no ${nivel()}): ${P.falta.map((x) => x[0]).join(", ")}</div>`
      : "";
  return `${cab}<div class=plano>${lin.join("")}</div>${bloq}<div style="display:flex;gap:6px;margin-top:6px"><button class=it style="flex:1;padding:6px" onclick="montaPlano(${JSON.stringify(P.alvo).replace(/"/g, "&quot;")})"${P.falta.length ? " disabled" : ""}>🏗 Montar${ECO.f ? "" : " ($" + P.custo.toLocaleString("pt-BR") + ")"}</button><button class=it style="flex:1;padding:6px" onclick="ask(PEDS[${k}],1)">🤖 Perguntar à IA</button></div><div class=nota>Dica: depois toque em ⬆ Nível na máquina que mais demora.</div>`;
}
function pedidoLocal(t) {
  const it = itemPedido(t);
  if (!it) return false;
  let P;
  try {
    P = planoFab(it);
  } catch (e) {
    return false;
  }
  addMsg("u", t);
  const m = document.createElement("div");
  m.className = "msg";
  m.innerHTML = planoHTML(P, t);
  $("#msgs").append(m);
  $("#msgs").scrollTop = 1e6;
  HIST.push(
    { role: "user", content: t },
    {
      role: "assistant",
      content:
        "Linha de " + it + ": " + P.maqs.map((x) => T[x.m].n + " (" + x.r + ")").join(" → ") + " → Mercado. (planejador local)",
    },
  );
  guardaChat();
  return true;
}

/* -- Teste de verdade: roda o código JavaScript num Worker, simulando Timer e botões -- */
const TESTE_W = `const AF=(async()=>{}).constructor;
onmessage=async(ev)=>{
  const {code,lang,vars}=ev.data;let des=0,mos=0,env=0,usouTela=0,esp=0;
  const fbs={},conta=()=>{des++};
  const tela=(w,h)=>{usouTela=1;const k=w+"x"+h;return fbs[k]||(fbs[k]={w,h,limpar:conta,px:conta,vlinha:conta,ret:conta,sprite:conta,texto:conta,mostrar:()=>{mos++;des++}})};
  const seq=["direita","cima","A","esquerda","baixo","B"],teclas={},S={};
  const base={entrada:0,S,teclas,tela,enviar:()=>{env++},mostrar:()=>{env++;des++},log:()=>{},console:{log:()=>{}},esperar:()=>{if(!esp++)postMessage({esp:1});return new Promise(r=>setTimeout(r,1))},bip:()=>{},vibrar:()=>{},agora:()=>performance.now(),aleatorio:(a,b)=>Math.floor(Math.random()*(b-a+1))+a,rgb:(r,g,b)=>((255<<24)|((b&255)<<16)|((g&255)<<8)|(r&255))>>>0,lib:{dados:()=>null,tocar:()=>{},pixels:()=>null},variaveis:vars||{},comando:async()=>{},pixel:conta,retangulo:conta,linha:conta,circulo:conta,fundo:conta,limpar:conta,texto:conta,imagem:conta,tocar:()=>{},dados:()=>null,parar:()=>{throw "parado"}};
  const E=lang=="js"?new Proxy(base,{has:()=>true,get:(t,k)=>typeof k=="symbol"?undefined:k in t?t[k]:k in self?self[k]:0,set:(t,k,v)=>{t[k]=v;return true}}):base;
  let fn;try{fn=new AF("E","with(E){"+code+"\\n}")}catch(e){postMessage({err:"não compila: "+e.message});return}
  for(let i=0;i<60;i++){
    const b=seq[(i>>2)%6];for(const k of seq)teclas[k]=k==b&&i%4<2?1:0;
    E.entrada=i%4==3?b:i+1;
    try{await fn(E)}catch(e){if(e==="parado")break;postMessage({err:"ao rodar (quadro "+(i+1)+"): "+(e&&e.message||e)});return}
    postMessage({vivo:i});
  }
  postMessage({fim:1,des,mos,env,usouTela});
};`;
let TURL = null;
function testaCodigo(code, lang) {
  return new Promise((ok) => {
    let w;
    try {
      TURL = TURL || URL.createObjectURL(new Blob([TESTE_W], { type: "text/javascript" }));
      w = new Worker(TURL);
    } catch (e) {
      return ok({ pulou: 1 }); // navegador sem Worker: fica só a checagem de sintaxe
    }
    let q0 = -1,
      esp = 0;
    const fim = (r) => {
      clearTimeout(h);
      w.terminate();
      ok(r);
    };
    const h = setTimeout(
      () =>
        fim(
          lang == "jsx" || (q0 < 0 && !esp)
            ? { err: "travou: o código não termina (loop infinito?). Cada quadro deve rodar rápido e acabar; quem repete é o Timer." }
            : { fim: 1, des: 1, laco: 1 },
        ),
      2500,
    );
    w.onmessage = (e) => {
      if (e.data.esp) esp = 1;
      else if (e.data.vivo !== undefined) q0 = e.data.vivo;
      else fim(e.data);
    };
    w.onerror = (e) => {
      e.preventDefault();
      fim({ err: e.message });
    };
    w.postMessage({ code, lang, vars: JSON.parse(JSON.stringify(VARS)) });
  });
}
// Junta os códigos JavaScript de uma resposta (blocos soltos e Comands dentro do bloco fabrica)
function codigosJs(raw) {
  const out = [],
    re = /```(\w*)\n?([\s\S]*?)```/g,
    lg = (l, c) => (l == "jsx" ? "jsx" : /^(js|javascript)$/.test(l) ? "js" : l === "" || l === undefined ? glang({ s: { code: c } }) : l);
  let m;
  while ((m = re.exec(raw))) {
    const l = m[1].toLowerCase(),
      c = m[2];
    if (/^(js|jsx|javascript)$/.test(l)) out.push([c, lg(l), "bloco " + l]);
    else if (l == "fabrica")
      try {
        const j = pj(c);
        [...(j.aparelhos || []), ...(j.editar || [])].forEach((a) => {
          const s = a.s || {};
          if (s.code && /^(js|jsx|javascript)$/.test(lg(s.lang || "", s.code))) out.push([s.code, lg(s.lang || "", s.code), "aparelho " + (a.id ?? "?")]);
        });
      } catch (e) {}
  }
  return out;
}
async function testaResposta(raw) {
  const E = [],
    ok = [];
  for (const [c, l, nome] of codigosJs(raw).slice(0, 3)) {
    if (lint(c, l).length) continue; // erro de sintaxe já foi apontado
    const r = await testaCodigo(c, l);
    if (r.pulou) continue;
    if (r.err) E.push(nome + ", " + r.err);
    else if (r.usouTela && !r.mos) E.push(nome + ": chama tela() mas nunca fb.mostrar(), então nada aparece no Display");
    else if (!r.des && !r.env && /tela\(|fb\.|pixel|retangulo|fundo|circulo|texto\(/.test(c))
      E.push(nome + ": rodei 60 quadros apertando os botões e nada foi desenhado. Desenhe a tela em todo quadro.");
    else ok.push(nome);
  }
  return { E, ok };
}

/* -- Mais contexto para a IA: aparelhos que faltavam na lista, jogador e atalhos -- */
const FABK = ["extrator", "divisor", "filtroitem", "armazem", "mercado", "contrato", "venda", "mina", "fabrica", "montadora"];
function contextoExtra() {
  const lin = (SYS.match(/APARELHOS[^\n]*/) || [""])[0].replace(/\{[^}]*\}|\([^)]*\)/g, ""),
    ja = new Set(lin.split(/[,:.]/).map((s) => s.trim()));
  const outros = Object.entries(T)
    .filter(([k]) => !ja.has(k) && !MAQ[k] && !FABK.includes(k))
    .map(([k, t]) => k + " (" + t.n + (t.price ? ", $" + t.price : "") + (t.s && Object.keys(t.s).length ? ", s:" + JSON.stringify(t.s) : "") + ")")
    .join("; ");
  return `\nOUTROS APARELHOS (tipo (nome, preço, configurações padrão)): ${outros}.
JOGADOR: nível ${nivel()}, dinheiro $${Math.floor(M)}${ECO.f ? " (modo livre: tudo grátis)" : ""}. Aparelhos com preço são pagos do dinheiro do jogador quando você monta.
LINHA DE PRODUÇÃO COMPLETA: para montar tudo que faz um item, responda só com o bloco fabrica {"planejar":"nome do item"}. O app calcula extratores, máquinas, receitas e fios certos.
EXPLICAR OU ANALISAR o projeto: use o PROJETO ATUAL e responda em tópicos curtos, sem blocos de código, citando os aparelhos pelo id (#3).
TESTE: o app roda seu JavaScript simulando 60 tiques do Timer e os botões; se der erro ou não desenhar nada, você recebe o erro para corrigir.\n`;
}
