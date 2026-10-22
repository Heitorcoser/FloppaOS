const PM = { fabrica: ["minério", "peça", 2], montadora: ["peça", "robô", 2] },
  PRICE = { minério: 1, peça: 6, robô: 30 },
  BASE = { mina: 1600, fabrica: 1000, montadora: 1400 },
  FAC = { mina: 1, fabrica: 2.5, montadora: 6, venda: 4 };
const lvl = (d) => d.s.lv || 1,
  upc = (d) => Math.round(30 * 1.8 ** (lvl(d) - 1) * FAC[d.type]),
  rate = (d) => BASE[d.type] / (1 + 0.6 * (lvl(d) - 1));
function info(d) {
  const l = lvl(d);
  if (d.type == "mina") return `Nv ${l} · 1 minério a cada ${(rate(d) / 1000).toFixed(2)}s`;
  if (d.type == "venda")
    return `Nv ${l} · preço +${25 * (l - 1)}%\nitens: ${d.nv || 0} · ganhou $${d.tot || 0}`;
  const p = PM[d.type];
  return `Nv ${l} · ${p[2]} ${p[0]} → 1 ${p[1]}\nfila ${d.n || 0}/${p[2]} · ${(rate(d) / 1000).toFixed(2)}s`;
}
function minaTique(d) {
  emit(d, "minério");
  track("item", "minério");
}
const pui = (d) =>
  `<div class=term>${info(d)}</div>${d.type == "mina" ? `<button data-a=go>${d.h ? "⏸ Parar" : "▶ Iniciar"}</button>` : ""}<button data-a=up style="background:#16a34a">⬆ Melhorar (-$${upc(d)})</button>`;
function pup(d) {
  if (!pay(upc(d))) return;
  d.s.lv = lvl(d) + 1;
  if (d.h) {
    clearInterval(d.h);
    d.h = setInterval(() => minaTique(d), rate(d));
  }
  q(d, ".bd").innerHTML = pui(d);
  save();
}
function ff(d) {
  const p = PM[d.type],
    t = q(d, ".term");
  if (t) t.textContent = info(d);
  if (d.n >= p[2] && !d.bz) {
    d.bz = 1;
    setTimeout(() => {
      d.bz = 0;
      if (D[d.id] !== d) return;
      d.n -= p[2];
      emit(d, p[1]);
      track("item", p[1]);
      ff(d);
    }, rate(d));
  }
}
T.mina = {
  i: "⛏",
  n: "Mina",
  price: 40,
  s: { lv: 1 },
  ui: pui,
  act: (d, a, el) => {
    if (a == "up") return pup(d);
    if (d.h) {
      clearInterval(d.h);
      d.h = 0;
      el.textContent = "▶ Iniciar";
    } else {
      d.h = setInterval(() => minaTique(d), rate(d));
      el.textContent = "⏸ Parar";
    }
  },
};
["fabrica", "montadora"].forEach((k, j) => {
  T[k] = {
    i: j ? "🤖" : "🏭",
    n: j ? "Montadora" : "Fábrica",
    price: j ? 350 : 120,
    s: { lv: 1 },
    ui: pui,
    act: (d, a) => a == "up" && pup(d),
    recv(d, v) {
      if (v !== PM[k][0] || (d.n || 0) >= 20) return;
      d.n = (d.n || 0) + 1;
      ff(d);
    },
  };
});
T.venda = {
  i: "💵",
  n: "Venda",
  price: 20,
  s: { lv: 1 },
  ui: pui,
  act: (d, a) => a == "up" && pup(d),
  recv(d, v) {
    const p = PRICE[v];
    if (!p) return;
    const g = Math.round(p * (1 + 0.25 * (lvl(d) - 1)));
    gain(g);
    track("venda", v);
    d.tot = (d.tot || 0) + g;
    d.nv = (d.nv || 0) + 1;
    q(d, ".term").textContent = info(d);
  },
};
function ecoMenu() {
  modal(
    `<div style="font-weight:700">💰 Economia</div><div class=term>Dinheiro: ${ECO.f ? "∞ (modo livre)" : "$" + Math.floor(M).toLocaleString("pt-BR")}</div><div class=mu>1. Monte fábricas: ⛏️ Extrator → máquinas (🔥 Fornalha, 🛠️ Oficina...) → 🏪 Mercado, 💵 Venda ou 📜 Contratos (ligue com fios em fila). Veja todas as receitas em ⋯ › Itens e receitas. A versão clássica (⛏ Mina → 🏭 Fábrica → 🤖 Montadora) continua funcionando.<br>2. Compre 🔲 Processadores no menu ＋ e ligue com um fio direto em uma Tela bit ou PC. Sem processador a tela fica em 16×16 e 8 fps, e o PC fica lento.<br>3. Aumente os bits da Tela (botão verde nela) e melhore as fábricas com dinheiro.<br>4. ₿ Minerador de Bitcoin: ligue um processador com fio direto (a força é dividida entre tudo que estiver ligado nele). Gasta energia em $ e acha blocos que viram ₿; venda na 📈 Corretora BTC. O preço oscila, a dificuldade sobe e a recompensa cai pela metade a cada 100 blocos.<br>Apagar um aparelho pago devolve metade.</div>${ECO.f ? '<button class=it onclick="ECO.f=0;saveM();hud();econUI();ecoMenu()">🔒 Desligar modo livre</button>' : '<div class=mu>🔐 Modo livre (precisa de senha):</div><input id=fp type=password placeholder="senha" autocomplete=off><button class=it onclick="freeTry()">Liberar modo livre</button>'}<button class=it onclick="packUI()">🎁 Starter Pack (R$ 1)</button><button class=it onclick="M=250;saveM();hud();ecoMenu()">♻ Recomeçar com $250</button><button class=it onclick="cm()">Fechar</button>`,
  );
}
function ex12() {
  reset();
  const m = add("mina", 20, 20),
    f = add("fabrica", 215, 20),
    a = add("montadora", 215, 200),
    v = add("venda", 20, 200),
    t = add("disp", 20, 380),
    c = add("cpu1", 215, 380);
  [
    [m, f],
    [f, a],
    [a, v],
    [c, t],
  ].forEach(([x, y]) => W.push([x.id, y.id]));
  wires();
  save();
  cm();
  T.mina.act(m, "go", q(m, "[data-a=go]"));
  toast("Fábrica rodando! Junte dinheiro e melhore a Tela");
}
