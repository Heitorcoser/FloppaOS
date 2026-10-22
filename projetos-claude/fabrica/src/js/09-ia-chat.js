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
      return [p[k + 1], l == "comand" ? "" : l == "jsx" ? "jsx" : l == "python" || l == "py" ? "py" : "js"];
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
  m.className = "msg" + (r == "u" ? " u" : "");
  if (r == "u") m.textContent = t;
  else m.innerHTML = fmt(t);
  $("#msgs").append(m);
  $("#msgs").scrollTop = 1e6;
  return m;
}
const semThink = (t) =>
  t
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<think>[\s\S]*$/, "")
    .trim();
// Mostra a resposta enquanto ela chega (blocos de código ainda abertos viram <pre>)
const fmtVivo = (t) =>
  semThink(t)
    .split("```")
    .map((x, i) => (i % 2 ? "<pre>" + esc(x.replace(/^\w*\n/, "")) + "</pre>" : md(x)))
    .join("");
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
  if (j.planejar) return montaPlano(achaItem(String(j.planejar)) || String(j.planejar));
  // aparelhos com preço são pagos, como no catálogo
  const custo = (j.aparelhos || j.devices || j.dispositivos || []).reduce((s, a) => {
    const k = nk(a.tipo || a.type),
      t = T[Object.hasOwn(T, k) ? k : AL[k]];
    return s + ((t && t.price) || 0);
  }, 0);
  if (custo && !pay(custo)) return;
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
async function ask(txt, direto) {
  const t = String(txt ?? $("#ain").value).trim();
  if (!t) return;
  track("ia");
  provGuarda();
  if (LAST && /^(continue|continua|continuar|segue|prossiga)\W*$/i.test(t)) {
    $("#ain").value = "";
    autoCont();
    return;
  }
  // pedidos de linha de produção são resolvidos aqui mesmo, sem gastar IA
  if (!direto && pedidoLocal(t)) {
    $("#ain").value = "";
    return;
  }
  if (!$("#ak").value.trim() && !PROV[PC.p].semChave) {
    toast("Cole sua chave em ⚙");
    $("#set").open = true;
    return;
  }
  LAST = null;
  $("#ain").value = "";
  addMsg("u", t);
  HIST.push({ role: "user", content: t });
  const w = addMsg("a", "…");
  WS = w;
  let tv = 0;
  const vivo = (a, pensa) => {
    const n = performance.now();
    if (n - tv < 90) return;
    tv = n;
    w.classList.add("digit");
    w.innerHTML = a.trim()
      ? fmtVivo(a)
      : `<span class=mu>💭 pensando${pensa ? " (" + pensa.length + " letras)" : ""}...</span>`;
    $("#msgs").scrollTop = 1e6;
  };
  try {
    const j = await groq(
      {
        model: $("#am").value.trim(),
        messages: [{ role: "system", content: mkSys() }, ...HIST.slice(-10)],
        temperature: 0.2,
      },
      vivo,
    );
    w.classList.remove("digit");
    const a = j.choices[0].message.content || "";
    if (!semThink(a))
      throw new Error(
        j.choices[0].finish_reason == "length"
          ? "a IA gastou todo o limite pensando e não respondeu. Aumente o tamanho em ⚙ ou desligue Pensar mais."
          : "a IA respondeu vazio. Tente outro modelo em ⚙.",
      );
    HIST.push({ role: "assistant", content: a });
    showAns(w, a, j);
    if (LAST && $("#auto").checked) await autoCont();
    if (!LAST) await post(w);
    guardaChat();
  } catch (e) {
    w.classList.remove("digit");
    HIST.pop();
    w.textContent =
      e instanceof TypeError
        ? PC.p == "omni"
          ? "Não achei o OmniRoute. Abra o Termux, rode omniroute e deixe aberto. Este HTML precisa estar aberto direto no navegador do celular."
          : "Não consegui falar com " +
            provNome() +
            ". Veja a internet. Se esta página está aberta pelo link do Claude, o navegador bloqueia chamadas externas: abra o arquivo HTML direto no navegador."
        : "Erro: " + e.message;
    if (/does not exist|not found|model/i.test(e.message)) setTimeout(listModels, 300);
  }
}
let LAST = null,
  WS = null;
async function waitUI(s) {
  for (let i = Math.ceil(s) + 1; i > 0; i--) {
    if (WS) WS.textContent = "⏳ Limite da " + provNome() + ": continuando em " + i + "s...";
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
// Fala com qualquer serviço no formato OpenAI. Com "vivo", recebe a resposta aos pedaços (streaming).
async function groq(body, vivo) {
  provGuarda();
  const k = $("#ak").value.trim(),
    url = provURL() + "/chat/completions";
  let mt = Math.max(200, +$("#at").value || 1200),
    ef = 1,
    rl = 0,
    st = !!vivo;
  for (let i = 0; i < 14; i++) {
    const b = { ...body, max_tokens: mt },
      h = { "Content-Type": "application/json" };
    if (st) b.stream = true;
    if (PC.p == "groq" && ef && !$("#think").checked) b.reasoning_effort = "none";
    if (k) h.Authorization = "Bearer " + k;
    const r = await fetch(url, { method: "POST", headers: h, body: JSON.stringify(b) });
    if (r.ok && st && /event-stream/.test(r.headers.get("content-type") || "")) return lerStream(r, vivo);
    let j = {};
    try {
      j = await r.json();
    } catch (e) {
      if (r.ok) throw new Error("resposta estranha do servidor");
    }
    if (Array.isArray(j)) j = j[0] || {};
    if (r.ok) return j;
    const m = String((j.error && (j.error.message || j.error)) || "erro " + r.status),
      lim = m.match(/Limit (\d+)/);
    if (/reasoning/i.test(m) && ef) {
      ef = 0;
      continue;
    }
    if (/stream/i.test(m) && st) {
      st = false;
      continue;
    }
    if (/too large|max_tokens/i.test(m) && lim && mt > 200) {
      mt = Math.max(200, Math.min(mt - 100, +lim[1] - 150));
      continue;
    }
    if (/rate limit|quota|429/i.test(m) || r.status == 429) {
      const t = m.match(/try again in (?:(\d+)m)?([\d.]+)s/i),
        w = t ? +(t[1] || 0) * 60 + +t[2] : 15;
      if (w <= 75 && rl++ < 4) {
        await waitUI(w);
        continue;
      }
      throw new Error("Limite da " + provNome() + " atingido. Tente de novo em " + Math.ceil(w) + "s.");
    }
    if (r.status == 401 || /api key|unauthorized|invalid.*key/i.test(m))
      throw new Error("chave recusada pela " + provNome() + ". Confira a chave em ⚙.");
    throw new Error(m);
  }
  throw new Error("Não deu certo depois de várias tentativas");
}
async function lerStream(r, vivo) {
  const rd = r.body.getReader(),
    dec = new TextDecoder();
  let buf = "",
    txt = "",
    pensa = "",
    fin = null;
  for (;;) {
    const { value, done } = await rd.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const l = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!l.startsWith("data:")) continue;
      const dd = l.slice(5).trim();
      if (dd == "[DONE]") continue;
      let j;
      try {
        j = JSON.parse(dd);
      } catch (e) {
        continue;
      }
      if (j.error) throw new Error(j.error.message || String(j.error));
      const c = j.choices && j.choices[0];
      if (!c) continue;
      const dt = c.delta || {};
      if (dt.content) txt += dt.content;
      if (dt.reasoning || dt.reasoning_content) pensa += dt.reasoning || dt.reasoning_content;
      if (c.finish_reason) fin = c.finish_reason;
      vivo(txt, pensa);
    }
  }
  return { choices: [{ message: { content: txt }, finish_reason: fin || "stop" }] };
}
async function listModels() {
  provGuarda();
  const k = $("#ak").value.trim();
  if (!k && !PROV[PC.p].semChave) {
    toast("Cole a chave primeiro");
    return;
  }
  const w = addMsg("a", "Buscando modelos…");
  try {
    const r = await fetch(provURL() + "/models", {
      headers: k ? { Authorization: "Bearer " + k } : {},
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || r.status);
    const ids = j.data
        .map((m) => m.id)
        .map((i) => i.replace(/^models\//, ""))
        .filter((i) => !/whisper|guard|tts|orpheus|embed|image|vision-only|audio/.test(i))
        .sort(),
      qw = PC.p == "groq" ? ids.filter((i) => /qwen/i.test(i)) : [],
      L = qw.length ? qw : ids;
    w.innerHTML =
      "<div>" +
      (qw.length
        ? "Modelos Qwen da sua conta. Toque para usar:"
        : "Modelos disponíveis, toque para usar:") +
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
  provGuarda();
  toast("Modelo: " + i);
}

/* ---- provedores de IA (todos no formato OpenAI) ---- */
const PROV = {
  groq: {
    n: "Groq (grátis)",
    url: "https://api.groq.com/openai/v1",
    m: "qwen/qwen3.6-27b",
    d: "Chave grátis em console.groq.com › API Keys (começa com gsk_).",
  },
  omni: {
    n: "OmniRoute (no celular)",
    url: "http://localhost:20128/v1",
    m: "",
    semChave: 1,
    d: "Rode omniroute no Termux e deixe aberto. Chave e modelo ficam no painel (localhost:20128). Abra este HTML direto no navegador.",
  },
  openrouter: {
    n: "OpenRouter",
    url: "https://openrouter.ai/api/v1",
    m: "qwen/qwen3-coder:free",
    d: "Chave em openrouter.ai/keys. Modelos que terminam em :free são grátis.",
  },
  gemini: {
    n: "Google Gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai",
    m: "gemini-2.5-flash",
    d: "Chave grátis em aistudio.google.com/apikey.",
  },
  outro: {
    n: "Outro (formato OpenAI)",
    url: "",
    m: "",
    semChave: 1,
    d: "Qualquer serviço no formato OpenAI: coloque o endereço que termina em /v1.",
  },
};
let PC = { p: "groq", k: {}, m: {}, u: {} };
try {
  Object.assign(PC, JSON.parse(localStorage.getItem("fabprov") || "{}"));
  // chave e modelo da versão antiga (só Groq)
  if (!PC.k.groq && localStorage.getItem("fabk")) PC.k.groq = localStorage.getItem("fabk");
  if (!PC.m.groq && localStorage.getItem("fabm2")) PC.m.groq = localStorage.getItem("fabm2");
} catch (e) {}
if (!PROV[PC.p]) PC.p = "groq";
const provURL = () =>
  ($("#au").value.trim() || PROV[PC.p].url).replace(/\/+$/, "").replace(/\/chat\/completions$/, "");
const provNome = () => PROV[PC.p].n.replace(/ \(.*/, "");
function provUI() {
  const P = PROV[PC.p];
  $("#ap").innerHTML = Object.entries(PROV)
    .map(([k, v]) => `<option value=${k}${k == PC.p ? " selected" : ""}>${v.n}</option>`)
    .join("");
  $("#ak").value = PC.k[PC.p] || "";
  $("#am").value = PC.m[PC.p] || P.m;
  $("#au").value = PC.u[PC.p] || P.url;
  $("#au").style.display = PC.p == "omni" || PC.p == "outro" ? "" : "none";
  $("#apd").textContent = P.d;
}
function provGuarda() {
  PC.k[PC.p] = $("#ak").value.trim();
  PC.m[PC.p] = $("#am").value.trim();
  PC.u[PC.p] = $("#au").value.trim();
  try {
    localStorage.setItem("fabprov", JSON.stringify(PC));
  } catch (e) {}
}
function provTroca() {
  provGuarda();
  PC.p = $("#ap").value;
  provUI();
}
provUI();

/* ---- conversa: memória, sugestões ---- */
function guardaChat() {
  try {
    localStorage.setItem("fabchat", JSON.stringify(HIST.slice(-16)));
  } catch (e) {}
}
function boasVindas() {
  const m = document.createElement("div");
  m.className = "mu";
  m.textContent =
    "Oi! Sou a assistente. Monto linhas de produção completas (sem gastar IA), escrevo jogos, explico e conserto seu projeto. Toque numa sugestão ou peça do seu jeito.";
  $("#msgs").append(m);
}
function novaConversa() {
  HIST = [];
  LAST = null;
  guardaChat();
  $("#msgs").innerHTML = "";
  boasVindas();
}
const CHIPS = [
  ["🏭 Linha de celular", "Monte uma linha de produção de celular"],
  ["🎮 Jogo da cobrinha", "Faça um jogo da cobrinha"],
  ["🔍 Explicar meu projeto", "Explique o que meu projeto atual faz, aparelho por aparelho, e diga o que melhorar."],
  ["🩺 Achar erros", "Ache e conserte os erros dos Comands do meu projeto (use editar)."],
  ["💰 O que construir?", "Olhando meu projeto, nível e dinheiro, o que devo construir agora para ganhar mais?"],
];
$("#chips").innerHTML = CHIPS.map(([l], i) => `<button onclick="ask(CHIPS[${i}][1])">${l}</button>`).join("");
try {
  HIST = JSON.parse(localStorage.getItem("fabchat") || "[]");
} catch (e) {}
if (!HIST.length) boasVindas();
HIST.forEach((h) => addMsg(h.role == "user" ? "u" : "a", h.content));
