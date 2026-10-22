const SYS = `Você é a assistente da "Fábrica de Tudo", um sandbox industrial no celular onde o usuário liga aparelhos com fios. Responda sempre em português, curto e prático.
REGRAS: fios não têm direção. Um Conjunto (hub) repassa o valor de quem envia para todos os outros ligados a ele. Aparelhos ligados direto só falam com o vizinho. Nunca crie loops (um aparelho que emite não pode estar ligado de volta a quem o alimenta).
APARELHOS (tipo: configurações): valor{v}, sw, ctl (envia cima/baixo/esquerda/direita/A/B), timer{ms}, hub, tela (16x16), disp{n:16|32|48|64} (Display Pixel; tocar nele envia "toque X Y"), pc{t}, comand{code}, lamp (liga com 1 ou nome de cor), som (número=Hz), calc{e: expressão com x}, filtro{e: condição com x}, atraso{ms}, mem (guarda; "ler" solta), cont (+1; "zerar"), dado{n}, slider, piano, placar, barra, texto{p,f}, vibra.
LINGUAGEM DO COMAND (uma instrução por linha, sem ponto e vírgula, se/repetir/para/enquanto sempre terminam com fim, não existe se em uma linha só): x = 5 | x += 1 | mostrar expr (envia aos ligados) | log expr | esperar ms | se cond entao ... senao ... fim | repetir n ... fim | para i de 1 ate 5 ... fim | enquanto cond ... fim | pixel x, y, "cor" | retangulo x, y, larg, alt, "cor" | linha x1, y1, x2, y2, "cor" | circulo x, y, r, "cor" | fundo "cor" | limpar | bip hz | vibrar ms | parar | # comentário. Operadores: + - * / % = != < > <= >= e ou nao (= compara). "entrada" = valor recebido; variáveis persistem entre execuções e valem 0 se nunca usadas. Funções: aleatorio(a,b) parte(texto,n) abs piso teto max min arredondar texto numero tamanho maiusculo minusculo raiz agora. Não existem listas nem funções definidas pelo usuário.
LISTAS: corpo = lista() | adicionar(corpo, 5) | removerprimeiro(corpo) | removerultimo(corpo) | corpo[0] | tamanho(corpo) | pegar(corpo, i) | contem(corpo, 5). Não há objetos nem matrizes: para pares x,y guarde x e y alternados na mesma lista.
ERROS COMUNS (evite): todo "se" termina com "entao" na mesma linha e com "fim"; "senao" fica sozinho em uma linha; não use then, end, chaves, ponto e vírgula, ==, &&, ||, def, function, var, let, if, else, while. Texto sempre entre aspas duplas. Cada linha é uma instrução simples.
JOGOS 2D (receita): 1) UM Conjunto no centro e ligados nele: Controle, Timer, Comand e Display Pixel. 2) O Timer faz o jogo andar (entrada é um número maior que 0 a cada tique); o Controle manda "cima", "baixo", "esquerda", "direita", "A", "B" (entrada é texto). 3) No Comand: inicialize em "se iniciado = 0 entao ... fim"; trate cada direção mudando variáveis; atualize a lógica só quando entrada > 0; no fim redesenhe tudo (fundo "cor", depois retangulo/pixel). Display 32 = grade de 16x16 células de 2 pixels: retangulo x * 2, y * 2, 2, 2, "cor". 4) Responda com DOIS blocos: ~~~comand (o código) e ~~~fabrica (só aparelhos e fios; no comand deixe "s":{} que o app junta o código sozinho). Fora dos blocos escreva no máximo 2 frases.
JAVASCRIPT RÁPIDO (jogos grandes, 3D, raycasting, estilo Doom): Comand com Linguagem JavaScript rápido. O código é o corpo de uma função que roda uma vez por evento (um quadro por tique do Timer; use Timer de 33 ms). Recebe: entrada, S (objeto de estado que persiste, ex: S.x), teclas (teclas.cima/baixo/esquerda/direita/A/B valem 1 enquanto o botão está pressionado), tela(w,h) que devolve o framebuffer fb com fb.limpar(cor), fb.px(x,y,cor), fb.vlinha(x,y0,y1,cor), fb.ret(x,y,larg,alt,cor) e fb.mostrar() (envia o quadro ao Display), rgb(r,g,b), enviar(v), log(v), esperar(ms), bip(hz), agora(), aleatorio(a,b). Use const/let normalmente; o que precisa durar entre quadros fica em S. Bloco de código com a tag jsx. O Display no mesmo Conjunto mostra o quadro e o jogador toca em Jogar em tela cheia.
PYTHON: Comand com Linguagem Python (Python 3 de verdade). As variáveis globais persistem entre execuções (inicialize com: if 'x' not in globals():). Disponíveis sem import: entrada, teclas["cima"] (0 ou 1; também baixo, esquerda, direita, A, B), enviar(v), log(v), await esperar(ms), pixel(x,y,"cor"), retangulo(x,y,l,a,"cor"), linha(x1,y1,x2,y2,"cor"), circulo(x,y,r,"cor"), fundo("cor"), limpar(), bip(hz), imagem("nome",x,y,l,a), tocar("nome"), dados("nome"), tela(w,h) (framebuffer igual ao JavaScript rápido), rgb(r,g,b). Bloco de código com a tag python.
BIBLIOTECA: o usuário importa arquivos (imagens, sons, textos/JSON, código) em menu ... > Biblioteca e usa pelo nome sem extensão. Comand fácil: imagem "nome", x, y, l, a | tocar "nome" | dados("nome"). JavaScript rápido: lib.dados(n), lib.tocar(n), lib.pixels(n) (devolve {w,h,d:Uint32Array}, útil para texturas) e fb.sprite(nome,x,y,l,a).
VARIÁVEIS E COMANDOS PRÓPRIOS (estilo Scratch): o usuário cria variáveis globais (menu ... > Variáveis) que todo Comand enxerga pelo nome (Comand fácil: pontos += 1; JavaScript rápido e Python: variaveis.pontos). Comandos próprios (menu ... > Meus comandos) têm nome, parâmetros e corpo em Comand fácil; são chamados como: quadrado 5, 3 (Comand fácil) ou await comando("quadrado",5,3) (Python e JavaScript rápido). Para criar junto com o sistema, o bloco fabrica aceita "variaveis":{"pontos":0} e "comandos":[{"nome":"quadrado","params":["x","y"],"corpo":"retangulo x * 2, y * 2, 2, 2, \"red\""}]. O aparelho vari (Variável, s:{n:"nome"}) mostra o valor ao vivo.
EXEMPLO de código (quadrado que anda):
se iniciado = 0 entao
  iniciado = 1
  px = 8
  py = 8
fim
se entrada = "direita" entao
  px = min(15, px + 1)
fim
se entrada = "esquerda" entao
  px = max(0, px - 1)
fim
fundo "#111"
retangulo px * 2, py * 2, 2, 2, "lime"
FORMATO: código do Comand dentro de bloco ~~~comand . Para montar um sistema completo use um bloco ~~~fabrica com JSON (tipo = exatamente um dos nomes da lista de aparelhos, fios = pares de ids): {"aparelhos":[{"id":1,"tipo":"ctl","x":20,"y":20},{"id":2,"tipo":"hub","x":215,"y":20},{"id":3,"tipo":"timer","x":215,"y":100,"s":{"ms":33}},{"id":4,"tipo":"comand","x":215,"y":230,"s":{}},{"id":5,"tipo":"disp","x":20,"y":200,"s":{"n":32}}],"fios":[[1,2],[3,2],[4,2],[5,2]]} (isto é só a ESTRUTURA de um jogo: use apenas os aparelhos que o pedido precisa e NUNCA copie valores de exemplo como "Oi"; se você escreveu código, o bloco fabrica DEVE ter um aparelho comand para rodá-lo). Cartões têm 170-230px de largura; espaçe x/y em uns 200px.`;
let HIST = [],
  CB = [],
  CL = [],
  CX = [];
function xc(p) {
  for (let k = 1; k < p.length; k += 3) {
    const l = p[k].toLowerCase();
    if (l == "comand" || l == "javascript" || l == "js" || l == "jsx" || l == "python" || l == "py")
      return [p[k + 2], l == "comand" ? "" : l == "jsx" ? "jsx" : l == "python" || l == "py" ? "py" : "js"];
  }
  return [];
}
function aiToggle() {
  $("#ai").classList.toggle("open");
}
function langNote() {
  const l = $("#al").value;
  if (l == "comand") return "";
  const n = {
    jsx: "JavaScript rápido (jogos grandes)",
    javascript: "JavaScript",
    lua: "Lua (Roblox Studio)",
    python: "Python",
    csharp: "C#",
    java: "Java",
    cpp: "C++",
    html: "HTML/CSS/JS",
  }[l];
  return (
    "\nLINGUAGEM PEDIDA: o usuário escolheu " +
    n +
    ". Escreva o código em " +
    n +
    " (bloco de código com a tag " +
    l +
    ") e NÃO em Comand" +
    (l == "python"
      ? ". Esse Python roda dentro de um Comand com Linguagem Python (veja a seção PYTHON). Use a tag python no bloco."
      : l == "jsx"
        ? ". Esse JavaScript roda dentro de um Comand com Linguagem JavaScript rápido (veja a seção JAVASCRIPT RÁPIDO). Use a tag jsx no bloco."
        : l == "javascript"
          ? ". Esse JavaScript roda como JavaScript rápido (veja a seção JAVASCRIPT RÁPIDO e o item JAVASCRIPT e JAVASCRIPT RÁPIDO são o mesmo). Use a tag javascript."
          : ". Esse código não roda na Fábrica, é para o usuário copiar. Para montar sistemas da Fábrica continue usando o bloco fabrica.")
  );
}
const il = (s) =>
  s
    .replace(/`([^`]+)`/g, '<code style="background:var(--card);padding:1px 4px;border-radius:4px">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>");
function md(t) {
  return esc(t)
    .split("\n")
    .map((l) => {
      let m;
      if ((m = l.match(/^#{1,6}\s+(.*)$/)))
        return '<div style="font-weight:700;font-size:15px;margin:6px 0 2px">' + il(m[1]) + "</div>";
      if ((m = l.match(/^\s*[*\-•]\s+(.*)$/)))
        return '<div style="padding-left:16px;text-indent:-12px">• ' + il(m[1]) + "</div>";
      if ((m = l.match(/^\s*(\d+)[.)]\s+(.*)$/)))
        return '<div style="padding-left:20px;text-indent:-16px">' + m[1] + ". " + il(m[2]) + "</div>";
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) return '<hr style="border:0;border-top:1px solid var(--bd)">';
      return l.trim() ? "<div>" + il(l) + "</div>" : '<div style="height:6px"></div>';
    })
    .join("");
}
function fmt(t) {
  t = t
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<think>[\s\S]*$/, "")
    .trim();
  const p = t.split(/```(\w*)\n?([\s\S]*?)```/);
  let h = "";
  for (let i = 0; i < p.length; i += 3) {
    h += md(p[i] || "");
    if (i + 2 < p.length) {
      const l = p[i + 1].toLowerCase(),
        c = p[i + 2],
        n = CB.push(c) - 1,
        x = ((CL[n] = l), (CX[n] = xc(p))),
        bt = '<button class=it style="flex:1;padding:6px" onclick="cb(' + n + ",";
      h +=
        '<pre style="background:#000;color:#4ade80;padding:8px;border-radius:8px;overflow:auto;font-size:12px;margin:6px 0 2px">' +
        esc(c) +
        '</pre><div style="display:flex;gap:6px">' +
        bt +
        '0)">📋 Copiar</button>' +
        (l == "comand" || l == "javascript" || l == "js" || l == "jsx" || l == "python" || l == "py"
          ? bt + '1)">📟 Criar Comand</button>'
          : l == "fabrica" || (/^(json|)$/.test(l) && /"(aparelhos|devices|dispositivos)"/.test(c))
            ? bt + '2)">🏗 Montar sistema</button>'
            : "") +
        "</div>";
    }
  }
  return h;
}
function addMsg(r, t) {
  const m = document.createElement("div");
  m.style.cssText =
    "margin:6px 0;padding:8px;border-radius:10px;background:" +
    (r == "u" ? "var(--ac);color:#fff;white-space:pre-wrap" : "var(--in)");
  if (r == "u") m.textContent = t;
  else m.innerHTML = fmt(t);
  $("#msgs").append(m);
  $("#msgs").scrollTop = 1e6;
  return m;
}
const AL = {
  variavel: "vari",
  monitor: "vari",
  conjunto: "hub",
  central: "hub",
  interruptor: "sw",
  botao: "sw",
  switch: "sw",
  controle: "ctl",
  joystick: "ctl",
  lampada: "lamp",
  luz: "lamp",
  light: "lamp",
  matematica: "calc",
  calculadora: "calc",
  display: "disp",
  displaypixel: "disp",
  pixel: "disp",
  computador: "pc",
  terminal: "pc",
  memoria: "mem",
  contador: "cont",
  deslizante: "slider",
  teclado: "piano",
  vibrar: "vibra",
  vibracao: "vibra",
  temporizador: "timer",
  relogio: "timer",
  delay: "atraso",
  screen: "tela",
  command: "comand",
  comando: "comand",
  value: "valor",
};
const nk = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z_]/g, "");
function pj(t) {
  const a = t.indexOf("{"),
    b = t.lastIndexOf("}"),
    er =
      "JSON incompleto ou inválido (resposta cortada?). Aumente o limite de tokens em ⚙ ou peça um sistema menor.";
  if (a < 0 || b < a) throw new Error(er);
  try {
    return JSON.parse(t.slice(a, b + 1).replace(/,\s*([}\]])/g, "$1"));
  } catch (e) {
    throw new Error(er);
  }
}
function build(j, xc, xl) {
  if (typeof j == "string") j = pj(j);
  snap();
  (j.remover || []).forEach((i) => D[i] && del(+i));
  (j.editar || []).forEach((e) => {
    const d = D[e.id];
    if (!d) return;
    Object.assign(d.s, e.s || {});
    d.env = d.S = d.pn = d.fn = 0;
    d.cl = [];
    $("#c" + d.id).remove();
    mk(d);
  });
  Object.entries(j.variaveis || {}).forEach(([k, v]) => setVar(k, v));
  (j.comandos || []).forEach((c) => defCmd(c.nome || c.name, c.params || [], c.corpo || c.body || ""));
  let L = j.aparelhos || j.devices || j.dispositivos || [],
    F = j.fios || j.wires || j.conexoes || j.ligacoes || [],
    ox = -V.x / V.s + 10,
    oy = -V.y / V.s + 10,
    m = {},
    bad = [];
  if (
    xc &&
    !j.editar &&
    !L.some((a) => {
      const k = nk(a.tipo || a.type);
      return (AL[k] || k) == "comand";
    })
  ) {
    L = [
      { id: 1, tipo: "ctl", x: 20, y: 20 },
      { id: 2, tipo: "hub", x: 215, y: 20 },
      { id: 3, tipo: "timer", x: 215, y: 100, s: { ms: xl == "jsx" ? 33 : 200 } },
      { id: 4, tipo: "comand", x: 215, y: 230 },
      { id: 5, tipo: "disp", x: 20, y: 200, s: { n: 32 } },
    ];
    F = [
      [1, 2],
      [3, 2],
      [4, 2],
      [5, 2],
    ];
  }
  const isT = (a, t) => {
    const k = nk(a.tipo || a.type);
    return (AL[k] || k) == t;
  };
  if (
    !j.editar &&
    L.some((a) => isT(a, "comand")) &&
    !L.some((a) => isT(a, "disp") || isT(a, "tela")) &&
    /tela\(|fb\.|pixel|retangulo|texto\(|fundo/.test(
      (xc || "") + L.map((a) => (a.s && a.s.code) || "").join(""),
    )
  ) {
    const i2 = 100 + L.length,
      hb = L.find((a) => isT(a, "hub")) || L.find((a) => isT(a, "comand"));
    L.push({ id: i2, tipo: "disp", x: 20, y: 200, s: { n: 32 } });
    F.push([i2, hb.id !== undefined ? hb.id : L.indexOf(hb) + 1]);
  }
  L.forEach((a, i) => {
    const k = nk(a.tipo || a.type),
      t = Object.hasOwn(T, k) ? k : Object.hasOwn(AL, k) ? AL[k] : 0;
    if (!t) {
      bad.push(a.tipo || a.type);
      return;
    }
    const s = { ...(a.s || a.config || a.props || {}) };
    if (t == "comand" && xc && (!s.code || String(s.code).trim().length < 40)) {
      s.code = xc;
      if (xl) s.lang = xl;
    }
    if (t == "comand" && s.lang !== undefined) s.lang = { javascript: "js", python: "py" }[s.lang] ?? s.lang;
    Object.keys(a).forEach((x) => {
      if (!["id", "tipo", "type", "x", "y", "s", "config", "props"].includes(x)) s[x] = a[x];
    });
    m[a.id !== undefined ? a.id : i + 1] = add(
      t,
      ox + (Number(a.x) || (i % 3) * 200),
      oy + (Number(a.y) || Math.floor(i / 3) * 220),
      s,
    ).id;
  });
  let n = 0;
  F.forEach((w) => {
    const p = Array.isArray(w) ? w : [w.de ?? w.from ?? w.a, w.para ?? w.to ?? w.b];
    if (
      m[p[0]] &&
      m[p[1]] &&
      m[p[0]] !== m[p[1]] &&
      !W.some((x) => x.includes(m[p[0]]) && x.includes(m[p[1]]))
    ) {
      W.push([m[p[0]], m[p[1]]]);
      n++;
    }
  });
  wires();
  save();
  if (!Object.keys(m).length) {
    toast(
      j.variaveis || j.comandos || j.editar || j.remover
        ? "Alterações aplicadas"
        : "Nada montado. Tipos não reconhecidos: " + bad.join(", "),
    );
    return;
  }
  $("#ai").classList.remove("open");
  toast(
    "Montado: " +
      Object.keys(m).length +
      " aparelhos, " +
      n +
      " fios" +
      (bad.length ? " (ignorei: " + bad.join(", ") + ")" : ""),
  );
}
function cb(n, a) {
  const c = CB[n];
  try {
    if (a == 0) copyTxt(c);
    else if (a == 1) {
      snap();
      add("comand", -V.x / V.s + 10, -V.y / V.s + 10, {
        code: c,
        lang:
          CL[n] == "comand" ? "" : CL[n] == "jsx" ? "jsx" : CL[n] == "python" || CL[n] == "py" ? "py" : "js",
      });
      wires();
      save();
      aiToggle();
      toast("Comand criado");
    } else {
      const x = CX[n] && CX[n][0] ? CX[n] : nearCode(n);
      build(c, x[0], x[1]);
    }
  } catch (e) {
    toast("Erro: " + e.message);
  }
}
async function ask() {
  const k = $("#ak").value.trim(),
    t = $("#ain").value.trim();
  if (!t) return;
  track("ia");
  if (!k) {
    toast("Cole sua chave da Groq em ⚙");
    $("#set").open = true;
    return;
  }
  try {
    localStorage.setItem("fabk", k);
    localStorage.setItem("fabm2", $("#am").value);
  } catch (e) {}
  if (LAST && /^(continue|continua|continuar|segue|prossiga)\W*$/i.test(t)) {
    $("#ain").value = "";
    autoCont();
    return;
  }
  LAST = null;
  $("#ain").value = "";
  addMsg("u", t);
  HIST.push({ role: "user", content: t });
  const w = addMsg("a", "…");
  WS = w;
  try {
    const sys = mkSys();
    const j = await groq({
      model: $("#am").value.trim(),
      messages: [{ role: "system", content: sys }, ...HIST.slice(-10)],
      temperature: 0.2,
    });
    const a = j.choices[0].message.content;
    HIST.push({ role: "assistant", content: a });
    showAns(w, a, j);
    if (LAST && $("#auto").checked) await autoCont();
    if (!LAST) await post(w);
  } catch (e) {
    HIST.pop();
    w.textContent =
      e instanceof TypeError
        ? "Não consegui falar com a Groq. Se esta página está aberta pelo link do Claude, o navegador bloqueia chamadas para sites externos. Abra o arquivo HTML direto no navegador do aparelho."
        : "Erro: " + e.message;
    if (/does not exist/.test(e.message)) setTimeout(listModels, 300);
  }
}
let LAST = null,
  WS = null;
async function waitUI(s) {
  for (let i = Math.ceil(s) + 1; i > 0; i--) {
    if (WS) WS.textContent = "⏳ Limite da Groq: continuando em " + i + "s...";
    await sl(1000);
  }
}
function showAns(w, raw, j) {
  const cut = j.choices[0].finish_reason == "length",
    v = (raw.match(/```/g) || []).length % 2 ? raw + "\n```" : raw;
  w.innerHTML = fmt(v);
  if (cut) {
    w.querySelectorAll("pre+div").forEach((x) => x.remove());
    const b = document.createElement("button");
    b.className = "it";
    b.style.cssText = "width:100%;padding:8px;margin-top:6px;flex-direction:row";
    b.textContent = "⏩ Resposta cortada. Continuar de onde parou";
    b.onclick = () => autoCont();
    w.append(b);
    LAST = { raw, w };
  } else LAST = null;
}
async function contAns() {
  const L = LAST;
  if (!L) return;
  const b = L.w.lastChild,
    bt = b && b.tagName == "BUTTON" ? b : null;
  if (bt) bt.textContent = "⏳ Continuando...";
  WS = bt;
  try {
    const tail = L.raw.slice(-240),
      sys = mkSys();
    const j = await groq({
      model: $("#am").value.trim(),
      messages: [
        { role: "system", content: sys },
        ...HIST.slice(-10),
        {
          role: "user",
          content:
            "Sua resposta anterior foi cortada pelo limite de tamanho. CONTINUE exatamente de onde parou, escrevendo só o que falta, a partir do trecho seguinte ao final abaixo. Não repita nada, não recomece, não escreva introdução nem explicação, e não abra um novo bloco de código se o anterior ainda estava aberto. Final do que você já escreveu:\n" +
            tail,
        },
      ],
      temperature: 0.4,
    });
    let c = j.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, "");
    if ((L.raw.match(/```/g) || []).length % 2) c = c.replace(/^\s*```\w*\n/, "");
    if (L.raw.length > 80 && c.trim().startsWith(L.raw.trim().slice(0, 60)))
      throw new Error(
        "A IA recomeçou do zero em vez de continuar. Toque em Continuar de novo ou aumente o limite em ⚙.",
      );
    for (let n = Math.min(240, L.raw.length, c.length); n >= 15; n--)
      if (c.startsWith(L.raw.slice(-n))) {
        c = c.slice(n);
        break;
      }
    if (LAST !== L) return false;
    const raw = L.raw + c;
    HIST[HIST.length - 1] = { role: "assistant", content: raw };
    showAns(L.w, raw, j);
    return true;
  } catch (e) {
    if (bt) bt.textContent = "⏩ Resposta cortada. Continuar de onde parou";
    toast(e.message);
    return false;
  }
}
async function autoCont() {
  for (let i = 0; i < 8 && LAST; i++) {
    if (!(await contAns())) break;
  }
}
async function groq(body) {
  const k = $("#ak").value.trim();
  let mt = Math.max(200, +$("#at").value || 800),
    ef = 1,
    rl = 0;
  for (let i = 0; i < 14; i++) {
    const b = { ...body, max_tokens: mt };
    if (ef && !$("#think").checked) b.reasoning_effort = "none";
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + k },
      body: JSON.stringify(b),
    });
    const j = await r.json();
    if (r.ok) return j;
    const m = (j.error && j.error.message) || String(r.status),
      lim = m.match(/Limit (\d+)/);
    if (/reasoning/i.test(m) && ef) {
      ef = 0;
      continue;
    }
    if (/too large|max_tokens/i.test(m) && lim && mt > 200) {
      mt = Math.max(200, Math.min(mt - 100, +lim[1] - 150));
      continue;
    }
    if (/rate limit/i.test(m)) {
      const t = m.match(/try again in (?:(\d+)m)?([\d.]+)s/i),
        w = t ? +(t[1] || 0) * 60 + +t[2] : 15;
      if (w <= 75 && rl++ < 4) {
        await waitUI(w);
        continue;
      }
      throw new Error("Limite da Groq atingido. Tente de novo em " + Math.ceil(w) + "s.");
    }
    throw new Error(m);
  }
  throw new Error("Não deu certo depois de várias tentativas");
}
async function listModels() {
  const k = $("#ak").value.trim();
  if (!k) {
    toast("Cole a chave primeiro");
    return;
  }
  const w = addMsg("a", "Buscando modelos…");
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: "Bearer " + k },
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || r.status);
    const ids = j.data
        .map((m) => m.id)
        .filter((i) => !/whisper|guard|tts|orpheus/.test(i))
        .sort(),
      qw = ids.filter((i) => /qwen/i.test(i)),
      L = qw.length ? qw : ids;
    w.innerHTML =
      "<div>" +
      (qw.length
        ? "Modelos Qwen da sua conta. Toque para usar:"
        : "Sua conta não tem Qwen. Modelos disponíveis, toque para usar:") +
      "</div>" +
      L.map(
        (i) =>
          '<button class=it style="width:100%;padding:8px;margin-top:4px;flex-direction:row" data-m="' +
          esc(i) +
          '" onclick="useM(this.dataset.m)">' +
          esc(i) +
          "</button>",
      ).join("");
  } catch (e) {
    w.textContent = "Erro: " + e.message;
  }
}
function useM(i) {
  $("#am").value = i;
  try {
    localStorage.setItem("fabm2", i);
  } catch (e) {}
  toast("Modelo: " + i);
}
try {
  $("#ak").value = localStorage.getItem("fabk") || "";
  $("#am").value = localStorage.getItem("fabm2") || "qwen/qwen3.6-27b";
} catch (e) {}
