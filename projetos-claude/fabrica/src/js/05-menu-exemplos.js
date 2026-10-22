/* ---- menu / exemplos ---- */
const CAT = {
  Entrada: ["valor", "sw", "ctl", "slider", "piano", "cor", "dado", "aleat", "inclina", "timer", "relogio", "pisca"],
  Lógica: ["filtro", "inverte", "porta", "calc", "mapa", "txtfx", "texto", "atraso", "seq", "hub"],
  Dados: ["vari", "mem", "cont", "fila", "stats"],
  Saída: ["tela", "disp", "lamp", "semaforo", "som", "falar", "vibra", "placar", "barra", "grafico", "copiar"],
  Extração: ["extrator", "mina"],
  Máquinas: [
    "fornalha",
    "serraria",
    "oficina",
    "tecelagem",
    "trefiladora",
    "refinaria",
    "eletronica",
    "montagem",
    "espacial",
    "fabrica",
    "montadora",
  ],
  "Logística e vendas": ["divisor", "filtroitem", "armazem", "mercado", "contrato", "venda"],
  Computação: ["cpu1", "cpu2", "cpu3", "cpu4", "rig", "bolsa", "console"],
  Programa: ["comand", "pc", "http", "nota"],
};
// categoria de cada tipo (define a cor do cartão)
const CATK = {};
Object.entries(CAT).forEach(([c, L], i) => L.forEach((k) => (CATK[k] = i)));
let SQ = "",
  ABA = "Todos";
function shl() {
  const q2 = SQ.trim().toLowerCase(),
    used = new Set(Object.values(CAT).flat()),
    C = { ...CAT, Outros: Object.keys(T).filter((k) => !used.has(k)) };
  $("#abas").innerHTML = ["Todos", ...Object.keys(C)]
    .map((c) => `<button class="aba${c == ABA ? " on" : ""}" onclick="ABA='${c}';shl()">${c}</button>`)
    .join("");
  let h = "";
  for (const c in C) {
    if (ABA != "Todos" && ABA != c && !q2) continue;
    const L = C[c].filter((k) => T[k] && (T[k].n.toLowerCase().includes(q2) || k.includes(q2)));
    if (L.length)
      h +=
        `<div class=ch>${c}</div>` +
        L.map((k) => {
          const t = T[k],
            trava = t.lv && !liberado(t.lv);
          return `<button class="it${trava ? " trava" : ""}" data-cat="${CATK[k] ?? 9}" onclick="addT('${k}')"><b>${t.i}</b><span>${t.n}</span>${trava ? `<small>🔒 nível ${t.lv}</small>` : t.price ? `<small>$${t.price.toLocaleString("pt-BR")}</small>` : ""}</button>`;
        }).join("");
  }
  $("#shl").innerHTML = h || '<div class=mu style="grid-column:1/-1">Nenhum aparelho encontrado</div>';
}
const sh = () => {
  const s = $("#sheet");
  if (s.classList.contains("open")) {
    s.classList.remove("open");
    return;
  }
  s.innerHTML = `<div class=sheethd><input id=sq placeholder="🔍 Buscar entre ${Object.keys(T).length} aparelhos" value="${esc(SQ)}" oninput="SQ=this.value;shl()"><button class=b onclick="sh()" aria-label="Fechar">✕</button></div><div id=abas></div><div id=shl></div>`;
  shl();
  s.classList.add("open");
};
const modal = (h) => {
    $("#mb").innerHTML = h;
    $("#modal").classList.add("open");
  },
  cm = () => $("#modal").classList.remove("open");
$("#modal").onclick = (e) => {
  if (e.target.id == "modal") cm();
};
const EXEMPLOS = [
  [14, "🏗️", "Linha de produção (fábricas novas)"],
  [12, "🏭", "Fábrica de dinheiro"],
  [13, "₿", "Mineração de Bitcoin"],
  [1, "📨", "Olá mundo"],
  [2, "🕹", "Mini jogo"],
  [3, "🏀", "Bolinha quicando"],
  [4, "🎲", "Contador e dado"],
  [5, "🟡", "Jogo pixel (pegar moedas)"],
  [6, "🐍", "Jogo da cobrinha"],
  [7, "🔫", "3D estilo Doom (raycaster)"],
  [8, "🧪", "Python (bolinha)"],
  [9, "🧩", "Variáveis e comando próprio"],
  [10, "📉", "Sorteio com gráfico"],
  [11, "🖼", "Foto/vídeo (importe a sua)"],
];
const grupo = (t, L) =>
  `<div class=ch>${t}</div><div class=mgrid>${L.map(([f, i, n]) => `<button class=it onclick="${f}"><b>${i}</b>${n}</button>`).join("")}</div>`;
function menu() {
  modal(
    `<div class=mt>Menu</div>` +
      grupo("Aprender", [
        ["cm();tutorial(1)", "🎓", "Tutorial guiado"],
        ["comoJogar()", "📘", "Como jogar"],
        ["exemplosUI()", "🧪", "Exemplos prontos"],
        ["help()", "❓", "Linguagem do Comand"],
      ]) +
      grupo("Jogo", [
        ["progressoUI()", "🎯", "Missões e nível"],
        ["receitasUI()", "📖", "Itens e receitas"],
        ["ecoMenu()", "💰", "Economia e processadores"],
        ["packUI()", "🎁", "Starter Pack (R$ 1)"],
      ]) +
      grupo("Mesa", [
        ["arruma();cm()", "🧹", "Organizar cartões"],
        ["fit()", "⌖", "Centralizar tudo"],
        ["redo();cm()", "↪", "Refazer"],
        ["theme()", "🌓", "Tema claro/escuro"],
      ]) +
      grupo("Programar", [
        ["consoleUI()", "🧰", "Comandos / colar de outra IA"],
        ["varUI()", "🧮", "Variáveis"],
        ["cmdUI()", "🧩", "Meus comandos"],
        ["libUI()", "📦", "Biblioteca de arquivos"],
      ]) +
      grupo("Projeto", [
        ["exp()", "📤", "Exportar projeto"],
        ["imp()", "📥", "Importar projeto"],
        ["cloudUI()", "☁", "Salvar na conta Google"],
        ["clr()", "🗑", "Limpar tudo"],
      ]),
  );
}
function exemplosUI() {
  modal(
    `<div class=mt>🧪 Exemplos prontos</div><div class=mu>Cada exemplo substitui a mesa atual (dá para voltar com ↩ Desfazer).</div>` +
      grupo("", EXEMPLOS.map(([n, i, t]) => [`exemplo(${n})`, i, t])) +
      `<button class=it onclick="menu()">Voltar</button>`,
  );
}
function exemplo(n) {
  window["ex" + n]();
  requestAnimationFrame(() => {
    arruma();
    fit();
  });
}
// Empurra para baixo os cartões que estão um em cima do outro
function arruma() {
  const L = Object.values(D).sort((a, b) => a.y - b.y || a.x - b.x),
    caixa = (d) => {
      const e = $("#c" + d.id);
      return { x: d.x, y: d.y, w: e ? e.offsetWidth : 170, h: e ? e.offsetHeight : 150 };
    },
    cruza = (a, b) => a.x < b.x + b.w + 12 && b.x < a.x + a.w + 12 && a.y < b.y + b.h + 12 && b.y < a.y + a.h + 12;
  const feitos = [];
  L.forEach((d) => {
    let c = caixa(d),
      v = 0;
    for (let k = 0; k < 60; k++) {
      const o = feitos.find((f) => cruza(c, f));
      if (!o) break;
      c.y = o.y + o.h + 16;
      v = 1;
    }
    if (v) {
      d.y = Math.round(c.y / 12) * 12;
      c.y = d.y;
      const e = $("#c" + d.id);
      if (e) e.style.top = d.y + "px";
    }
    feitos.push(c);
  });
  wires();
  save();
}
const HELP = `COMO USAR
• Botão ＋ adiciona aparelhos.
• Arraste pelo título para mover; arraste o fundo para andar; − + dão zoom.
• Fio: toque na ● de um aparelho e depois na ● de outro. Repita para remover (ou toque no fio).
• Conjunto 🔗: tudo ligado a ele recebe o que qualquer aparelho enviar. Aparelhos ligados direto só falam com o vizinho.
• ⏹ para tudo (timers e scripts).

LINGUAGEM DO COMAND
x = 5          x += 1
mostrar "Oi " + x   (envia p/ Tela, PC...)
log x          (escreve no console do Comand)
esperar 500    (ms)
se x > 3 e x < 9 entao
  ...
senao
  ...
fim
repetir 5
  ...
fim
enquanto x < 10
  ...
fim
pixel x, y, "red"   (desenha na Tela 16x16)
retangulo x, y, larg, alt, "cor"
linha x1, y1, x2, y2, "cor"
circulo x, y, raio, "cor"
fundo "cor"   (pinta o fundo todo)
(Display Pixel: 16 a 64 pixels; tocar nele envia "toque X Y")
para i de 1 ate 5
  ...
fim
bip 440        (toca um som)
vibrar 200
limpar         (limpa a Tela)
parar
# comentário

"entrada" = valor que chegou. Variáveis guardam o valor entre execuções; as nunca usadas valem 0.
Listas: l = lista() · adicionar(l, 5) · removerprimeiro(l) · l[0] · tamanho(l)
Funções: aleatorio(1,6) parte(texto,n) abs() piso() teto() max() min() arredondar() texto() numero() tamanho() maiusculo() minusculo() raiz() agora()
Operadores: + - * / % = != < > <= >= e ou nao`;
const help = () => modal("<pre>" + esc(HELP) + '</pre><button class=it onclick="cm()">Fechar</button>');
function reset(u) {
  if (!u) snap();
  Object.values(D).forEach((d) => {
    clearInterval(d.h);
    d.stop = 1;
  });
  D = {};
  W = [];
  world.querySelectorAll(".card").forEach((e) => e.remove());
  sel = null;
  V = { x: 10, y: 10, s: 1 };
  apply();
}
function ex1() {
  reset();
  const a = add("valor", 20, 20, { v: "Oi" }),
    h = add("hub", 210, 30),
    p = add("pc", 20, 170),
    t = add("tela", 270, 170),
    l = add("lamp", 270, 400);
  W.push([a.id, h.id], [h.id, p.id], [h.id, t.id], [h.id, l.id]);
  wires();
  save();
  cm();
  toast("Toque em Enviar no Valor");
}
function ex2() {
  reset();
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    m = add("comand", 215, 110, {
      code: [
        "se iniciado = 0 entao",
        "  iniciado = 1",
        "  px = 8",
        "  py = 8",
        "fim",
        'se entrada = "direita" entao',
        "  px = px + 1",
        "fim",
        'se entrada = "esquerda" entao',
        "  px = px - 1",
        "fim",
        'se entrada = "cima" entao',
        "  py = py - 1",
        "fim",
        'se entrada = "baixo" entao',
        "  py = py + 1",
        "fim",
        "limpar",
        'pixel px, py, "lime"',
      ].join("\n"),
    }),
    t = add("tela", 20, 260);
  W.push([c.id, h.id], [h.id, m.id], [h.id, t.id]);
  wires();
  save();
  cm();
  toast("Use o controle 🎮");
}
function ex3() {
  reset();
  const t = add("timer", 20, 20, { ms: 200 }),
    m = add("comand", 20, 130, {
      code: [
        "se iniciado = 0 entao",
        "  iniciado = 1",
        "  px = 2",
        "  py = 3",
        "  dx = 1",
        "  dy = 1",
        "fim",
        "px += dx",
        "py += dy",
        "se px > 14 ou px < 1 entao",
        "  dx = 0 - dx",
        "fim",
        "se py > 14 ou py < 1 entao",
        "  dy = 0 - dy",
        "fim",
        "limpar",
        'retangulo px, py, 2, 2, "cyan"',
      ].join("\n"),
    }),
    s = add("tela", 20, 430);
  W.push([t.id, m.id], [m.id, s.id]);
  wires();
  save();
  cm();
  toast("Toque em Iniciar no Timer");
}
function ex4() {
  reset();
  const t = add("timer", 20, 20, { ms: 1000 }),
    c = add("cont", 20, 140),
    p = add("placar", 200, 140),
    v = add("valor", 20, 300, { v: "rolar" }),
    d = add("dado", 20, 400),
    p2 = add("placar", 200, 400);
  W.push([t.id, c.id], [c.id, p.id], [v.id, d.id], [d.id, p2.id]);
  wires();
  save();
  cm();
  toast("Inicie o Timer e toque em Enviar");
}
