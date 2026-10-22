/* ---- fábricas novas: itens, receitas, extratores, máquinas e logística ---- */

// Itens: [emoji, preço base, nível em que libera]
const ITENS = {
  minério: ["⛰️", 1, 1],
  carvão: ["⚫", 1, 1],
  areia: ["🏖️", 1, 1],
  madeira: ["🪵", 1, 1],
  algodão: ["☁️", 2, 3],
  cobre: ["🟠", 2, 3],
  água: ["💧", 1, 3],
  petróleo: ["🛢️", 3, 4],
  peça: ["🔩", 6, 1],
  robô: ["🤖", 30, 1],
  "barra de ferro": ["🧱", 5, 1],
  tábua: ["🟫", 3, 1],
  móvel: ["🪑", 14, 1],
  vidro: ["🪟", 5, 2],
  "fio de cobre": ["🧵", 3, 3],
  tecido: ["🧶", 6, 3],
  roupa: ["👕", 16, 3],
  aço: ["🔗", 14, 3],
  engrenagem: ["⚙️", 13, 3],
  plástico: ["🧴", 10, 4],
  circuito: ["💾", 30, 5],
  bateria: ["🔋", 22, 5],
  "tela LCD": ["🖥️", 48, 5],
  motor: ["🔧", 45, 5],
  celular: ["📱", 140, 8],
  computador: ["💻", 210, 8],
  "robô avançado": ["🦾", 230, 8],
  carro: ["🚗", 420, 12],
  foguete: ["🚀", 2600, 16],
};
const BRUTOS = ["minério", "carvão", "areia", "madeira", "algodão", "cobre", "água", "petróleo"];
Object.entries(ITENS).forEach(([k, v]) => (PRICE[k] = v[1])); // a Venda antiga aceita todos os itens
const ic = (k) => (ITENS[k] ? ITENS[k][0] : "📦");

// Máquinas: tipo -> [emoji, nome, preço, fator de melhoria]
const MAQ = {
  fornalha: ["🔥", "Fornalha", 150, 3],
  serraria: ["🪚", "Serraria", 100, 2.5],
  oficina: ["🛠️", "Oficina", 300, 4],
  tecelagem: ["🧶", "Tecelagem", 250, 4],
  trefiladora: ["🧵", "Trefiladora", 300, 4],
  refinaria: ["🏭", "Refinaria", 800, 6],
  eletronica: ["💾", "Fábrica de Eletrônicos", 1500, 9],
  montagem: ["🏗️", "Linha de Montagem", 4000, 14],
  espacial: ["🚀", "Base Espacial", 50000, 40],
};
// Receitas: id -> {m: máquina, in: entradas, out: saída, q: quantidade, t: ms, lv: nível}
const RECEITAS = {
  barra: { m: "fornalha", in: { minério: 2, carvão: 1 }, out: "barra de ferro", q: 1, t: 1800, lv: 1 },
  vidro: { m: "fornalha", in: { areia: 2, carvão: 1 }, out: "vidro", q: 1, t: 1800, lv: 2 },
  aco: { m: "fornalha", in: { "barra de ferro": 2, carvão: 1 }, out: "aço", q: 1, t: 3000, lv: 3 },
  tabua: { m: "serraria", in: { madeira: 1 }, out: "tábua", q: 2, t: 1200, lv: 1 },
  movel: { m: "serraria", in: { tábua: 3 }, out: "móvel", q: 1, t: 3000, lv: 1 },
  peca: { m: "oficina", in: { minério: 2 }, out: "peça", q: 1, t: 1000, lv: 1 },
  robo: { m: "oficina", in: { peça: 2 }, out: "robô", q: 1, t: 1400, lv: 1 },
  engrenagem: { m: "oficina", in: { "barra de ferro": 2 }, out: "engrenagem", q: 1, t: 2000, lv: 3 },
  tecido: { m: "tecelagem", in: { algodão: 2 }, out: "tecido", q: 1, t: 1500, lv: 3 },
  roupa: { m: "tecelagem", in: { tecido: 2 }, out: "roupa", q: 1, t: 2500, lv: 3 },
  fio: { m: "trefiladora", in: { cobre: 1 }, out: "fio de cobre", q: 2, t: 1500, lv: 3 },
  plastico: { m: "refinaria", in: { petróleo: 1, água: 1 }, out: "plástico", q: 1, t: 2500, lv: 4 },
  circuito: { m: "eletronica", in: { "fio de cobre": 2, plástico: 1 }, out: "circuito", q: 1, t: 3000, lv: 5 },
  bateria: { m: "eletronica", in: { cobre: 1, plástico: 1, carvão: 1 }, out: "bateria", q: 1, t: 3000, lv: 5 },
  tela: { m: "eletronica", in: { vidro: 1, circuito: 1 }, out: "tela LCD", q: 1, t: 3500, lv: 5 },
  motor: { m: "montagem", in: { engrenagem: 2, "fio de cobre": 1 }, out: "motor", q: 1, t: 4000, lv: 5 },
  celular: { m: "montagem", in: { "tela LCD": 1, circuito: 1, bateria: 1 }, out: "celular", q: 1, t: 5000, lv: 8 },
  computador: { m: "montagem", in: { "tela LCD": 1, circuito: 2, plástico: 1 }, out: "computador", q: 1, t: 6000, lv: 8 },
  roboav: { m: "montagem", in: { motor: 1, circuito: 2, aço: 2 }, out: "robô avançado", q: 1, t: 7000, lv: 8 },
  carro: { m: "montagem", in: { motor: 2, aço: 4, vidro: 2, bateria: 1 }, out: "carro", q: 1, t: 10000, lv: 12 },
  foguete: { m: "espacial", in: { motor: 4, aço: 6, computador: 3, bateria: 2 }, out: "foguete", q: 1, t: 20000, lv: 16 },
};
// Velocidade de cada recurso no Extrator (1 = 1 a cada 1,5 s no nível 1)
const RITMO = { minério: 1, carvão: 1, areia: 0.9, madeira: 0.9, algodão: 1.2, cobre: 1.3, água: 0.7, petróleo: 1.8 };

const liberado = (lv) => ECO.f || nivel() >= lv;
const receitasDe = (m) => Object.keys(RECEITAS).filter((k) => RECEITAS[k].m == m);
const txtReceita = (r) =>
  Object.entries(r.in)
    .map(([k, n]) => n + " " + ic(k))
    .join(" + ") +
  " → " +
  r.q +
  " " +
  ic(r.out) +
  " " +
  r.out;
const dur = (d, ms) => ms / (1 + 0.6 * (lvl(d) - 1));
const btnUp = (d) => `<button data-a=up class=ok>⬆ Nível ${lvl(d) + 1} (-$${upc(d).toLocaleString("pt-BR")})</button>`;
const redesenha = (d) => {
  const b = q(d, ".bd");
  if (b) b.innerHTML = T[d.type].ui(d);
};
// Envia para todos os vizinhos menos um (normalmente quem mandou o item)
function emitExceto(d, v, exceto) {
  vizinhos(d).forEach((id) => id != exceto && emitTo(d, id, v));
}
function melhorar(d) {
  if (!pay(upc(d))) return;
  d.s.lv = lvl(d) + 1;
  track("melhoria");
  redesenha(d);
  save();
  return true;
}

/* -- Extrator: tira recursos da terra -- */
FAC.extrator = 1.5;
const ritmoExt = (d) => (1500 * (RITMO[d.s.res] || 1)) / (1 + 0.6 * (lvl(d) - 1));
function extLiga(d, on) {
  clearInterval(d.h);
  d.h = 0;
  if (on) d.h = setInterval(() => extTique(d), ritmoExt(d));
}
function extTique(d) {
  if (D[d.id] !== d) return clearInterval(d.h);
  const r = d.s.res;
  if (!liberado(ITENS[r][2])) return;
  emit(d, r);
  track("item", r);
  d.n = (d.n || 0) + 1;
  const t = q(d, ".term");
  if (t) t.textContent = `${ic(r)} ${r}: ${d.n} extraídos\n1 a cada ${(ritmoExt(d) / 1000).toFixed(2)}s`;
}
T.extrator = {
  i: "⛏️",
  n: "Extrator",
  price: 60,
  cat: "fab",
  s: { lv: 1, res: "minério" },
  ui: (d) =>
    `<select data-k=res onchange="extTroca(${d.id})">${BRUTOS.map((k) => {
      const lv = ITENS[k][2],
        ok = liberado(lv);
      return `<option value="${k}"${k == d.s.res ? " selected" : ""}${ok ? "" : " disabled"}>${ic(k)} ${k}${ok ? "" : " · 🔒 nível " + lv}</option>`;
    }).join("")}</select><div class=term>${ic(d.s.res)} ${d.s.res}: ${d.n || 0} extraídos\n1 a cada ${(ritmoExt(d) / 1000).toFixed(2)}s</div><button data-a=go>${d.h ? "⏸ Parar" : "▶ Iniciar"}</button>${btnUp(d)}`,
  act(d, a, el) {
    if (a == "up") {
      if (melhorar(d) && d.h) extLiga(d, 1);
      return;
    }
    extLiga(d, !d.h);
    el.textContent = d.h ? "⏸ Parar" : "▶ Iniciar";
  },
};
function extTroca(id) {
  const d = D[id];
  d.n = 0;
  if (d.h) extLiga(d, 1);
  redesenha(d);
}

/* -- Máquinas com receitas -- */
function maqUI(d) {
  const r = RECEITAS[d.s.r],
    inv = d.inv || {};
  const ops = receitasDe(d.type)
    .map((k) => {
      const x = RECEITAS[k],
        ok = liberado(x.lv);
      return `<option value="${k}"${k == d.s.r ? " selected" : ""}${ok ? "" : " disabled"}>${ic(x.out)} ${x.out}${ok ? "" : " · 🔒 nível " + x.lv}</option>`;
    })
    .join("");
  const est = !r
    ? "escolha uma receita"
    : !liberado(r.lv)
      ? "🔒 libera no nível " + r.lv
      : Object.entries(r.in)
          .map(([k, n]) => `${ic(k)} ${inv[k] || 0}/${n}`)
          .join("  ") + `\nfeitos: ${d.n || 0} · ${(dur(d, r.t) / 1000).toFixed(1)}s cada`;
  return `<select data-k=r onchange="maqTroca(${d.id})">${ops}</select><div class=rc>${r ? txtReceita(r) : ""}</div><div class="term inv">${est}</div><div class=pbar><i></i></div>${btnUp(d)}`;
}
function maqTroca(id) {
  const d = D[id];
  d.inv = {};
  d.bz = 0;
  redesenha(d);
  save();
}
function maqTexto(d) {
  const t = q(d, ".inv"),
    r = RECEITAS[d.s.r];
  if (!t || !r) return;
  const inv = d.inv || {};
  t.textContent =
    Object.entries(r.in)
      .map(([k, n]) => `${ic(k)} ${inv[k] || 0}/${n}`)
      .join("  ") + `\nfeitos: ${d.n || 0} · ${(dur(d, r.t) / 1000).toFixed(1)}s cada`;
}
function maqTenta(d) {
  const r = RECEITAS[d.s.r];
  if (d.bz || !r || !liberado(r.lv)) return;
  const inv = (d.inv = d.inv || {});
  if (!Object.entries(r.in).every(([k, n]) => (inv[k] || 0) >= n)) return;
  Object.entries(r.in).forEach(([k, n]) => (inv[k] -= n));
  d.bz = 1;
  const ms = dur(d, r.t),
    bar = q(d, ".pbar i");
  if (bar) {
    bar.style.transition = "none";
    bar.style.width = "0";
    bar.offsetWidth; // reinicia a animação
    bar.style.transition = `width ${ms}ms linear`;
    bar.style.width = "100%";
  }
  setTimeout(() => {
    d.bz = 0;
    if (D[d.id] !== d) return;
    for (let i = 0; i < r.q; i++) emit(d, r.out);
    d.n = (d.n || 0) + r.q;
    track("item", r.out, r.q);
    maqTexto(d);
    maqTenta(d);
  }, ms);
  maqTexto(d);
}
Object.entries(MAQ).forEach(([k, [i, n, price, fac]]) => {
  FAC[k] = fac;
  T[k] = {
    i,
    n,
    price,
    cat: "fab",
    lv: Math.min(...receitasDe(k).map((x) => RECEITAS[x].lv)),
    s: { lv: 1, r: receitasDe(k)[0] },
    w: 1,
    ui: maqUI,
    act: (d, a) => a == "up" && melhorar(d),
    recv(d, v) {
      const r = RECEITAS[d.s.r];
      if (typeof v != "string" || !r || !r.in[v]) return;
      const inv = (d.inv = d.inv || {});
      if ((inv[v] || 0) >= r.in[v] * 4) return; // estoque de entrada cheio
      inv[v] = (inv[v] || 0) + 1;
      maqTexto(d);
      maqTenta(d);
    },
  };
});

/* -- Logística -- */
T.divisor = {
  i: "🔀",
  n: "Divisor",
  price: 15,
  cat: "fab",
  lv: 2,
  s: {},
  sm: 1,
  ui: () => `<div class=mu>reparte os itens entre as saídas, um para cada (rodízio)</div>`,
  recv(d, v, info) {
    if (typeof v == "object") return;
    const L = vizinhos(d).filter((id) => id != info.de);
    if (!L.length) return;
    d.k = ((d.k || 0) + 1) % L.length;
    emitTo(d, L[d.k], v);
  },
};
T.filtroitem = {
  i: "🚦",
  n: "Filtro de itens",
  price: 20,
  cat: "fab",
  lv: 2,
  s: { item: "minério", modo: "só este" },
  ui: (d) =>
    `<select data-k=item>${Object.keys(ITENS)
      .map((k) => `<option value="${k}"${k == d.s.item ? " selected" : ""}>${ic(k)} ${k}</option>`)
      .join("")}</select>${SEL("modo", ["só este", "todos menos este"], d.s.modo)}<div class=mu>deixa passar só o item escolhido (ou todos menos ele)</div>`,
  recv(d, v, info) {
    if (typeof v != "string") return;
    const igual = v === d.s.item;
    if (d.s.modo == "só este" ? igual : !igual) emitExceto(d, v, info.de);
  },
};
FAC.armazem = 2;
const capArm = (d) => 100 * lvl(d);
function armTexto(d) {
  const t = q(d, ".term");
  if (!t) return;
  const e = Object.entries(d.est || {}).filter(([, n]) => n > 0),
    tot = e.reduce((a, [, n]) => a + n, 0);
  t.textContent = e.length
    ? e.map(([k, n]) => `${ic(k)} ${k}: ${n}`).join("\n") + `\ntotal ${tot}/${capArm(d)}`
    : `vazio · cabe ${capArm(d)}`;
}
function armSolta(d) {
  if (d.sol) return;
  d.sol = setInterval(() => {
    const e = Object.entries(d.est || {}).find(([, n]) => n > 0);
    if (!e || D[d.id] !== d) {
      clearInterval(d.sol);
      d.sol = 0;
      return;
    }
    d.est[e[0]]--;
    emit(d, e[0]);
    armTexto(d);
  }, 120);
}
T.armazem = {
  i: "📦",
  n: "Armazém",
  price: 80,
  cat: "fab",
  lv: 2,
  s: { lv: 1, pass: 0 },
  ui: (d) =>
    `<div class=term style="min-height:40px"></div><button data-a=pass>${d.s.pass ? "Passar adiante: ligado" : "Passar adiante: desligado"}</button><button data-a=sol>▶ Soltar tudo</button>${btnUp(d)}<div class=mu>guarda os itens. Ligado, deixa passar direto. Sinal "ler" solta tudo</div>`,
  act(d, a, el) {
    if (a == "up") return melhorar(d) && armTexto(d);
    if (a == "pass") {
      d.s.pass = d.s.pass ? 0 : 1;
      el.textContent = d.s.pass ? "Passar adiante: ligado" : "Passar adiante: desligado";
      save();
    } else armSolta(d);
  },
  recv(d, v, info) {
    if (typeof v != "string") return;
    if (v == "ler" || v == "soltar") return armSolta(d);
    if (d.s.pass) return emitExceto(d, v, info.de);
    if (!ITENS[v]) return;
    const est = (d.est = d.est || {}),
      tot = Object.values(est).reduce((a, n) => a + n, 0);
    if (tot >= capArm(d)) return;
    est[v] = (est[v] || 0) + 1;
    armTexto(d);
  },
};

/* -- Mercado: preço muda com a procura -- */
let DEM = {};
try {
  DEM = JSON.parse(localStorage.getItem("fabdem")) || {};
} catch (e) {}
FAC.mercado = 5;
const precoMerc = (d, k) => Math.max(1, Math.round(ITENS[k][1] * 1.3 * (DEM[k] ?? 1) * (1 + 0.25 * (lvl(d) - 1))));
function mercTexto(d) {
  const t = q(d, ".term");
  if (!t) return;
  const vis = Object.keys(d.vend || {}).slice(-6);
  t.textContent =
    `vendidos ${d.nv || 0} · ganhou $${(d.tot || 0).toLocaleString("pt-BR")}` +
    (vis.length
      ? "\n" + vis.map((k) => `${ic(k)} ${k} $${precoMerc(d, k)} ${(DEM[k] ?? 1) < 0.9 ? "▼" : "▲"}`).join("\n")
      : "\nligue itens aqui para vender");
}
T.mercado = {
  i: "🏪",
  n: "Mercado",
  price: 200,
  cat: "fab",
  lv: 3,
  s: { lv: 1 },
  w: 1,
  ui: (d) =>
    `<div class=term style="min-height:60px"></div>${btnUp(d)}<div class=mu>paga 30% a mais que a Venda, mas o preço cai se vender demais do mesmo item e volta com o tempo</div>`,
  act: (d, a) => a == "up" && melhorar(d) && mercTexto(d),
  recv(d, v) {
    if (typeof v != "string" || !ITENS[v]) return;
    const g = precoMerc(d, v);
    gain(g);
    DEM[v] = Math.max(0.3, (DEM[v] ?? 1) * 0.985);
    d.tot = (d.tot || 0) + g;
    d.nv = (d.nv || 0) + 1;
    (d.vend = d.vend || {})[v] = 1;
    track("venda", v);
    mercTexto(d);
  },
};
setInterval(() => {
  Object.keys(DEM).forEach((k) => {
    DEM[k] += (1 - DEM[k]) * 0.02;
    if (DEM[k] > 0.995) delete DEM[k];
  });
  try {
    localStorage.setItem("fabdem", JSON.stringify(DEM));
  } catch (e) {}
  Object.values(D).forEach((d) => d.type == "mercado" && mercTexto(d));
}, 1000);

/* -- Contratos: pedidos com prazo e prêmio -- */
function novoContrato(d) {
  const ok = Object.keys(ITENS).filter((k) => !BRUTOS.includes(k) && liberado(ITENS[k][2]));
  const k = ok[Math.floor(Math.random() * ok.length)],
    p = ITENS[k][1],
    n = Math.max(2, Math.round((40 / Math.sqrt(p)) * (0.6 + Math.random() * 0.6))),
    seg = Math.min(900, Math.round(60 + n * Math.sqrt(p) * 5));
  d.s.c = { item: k, n, got: 0, fim: Date.now() + seg * 1000, premio: Math.round(p * n * 2.2 + 25) };
  save();
}
function conTexto(d) {
  const c = d.s.c,
    t = q(d, ".term"),
    b = q(d, ".pbar i");
  if (!c || !t) return;
  const s = Math.max(0, Math.ceil((c.fim - Date.now()) / 1000));
  t.textContent = `📜 Entregar ${c.n} ${ic(c.item)} ${c.item}\nentregues ${c.got}/${c.n} · prêmio $${c.premio.toLocaleString("pt-BR")}\nprazo ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  if (b) b.style.width = (100 * c.got) / c.n + "%";
}
T.contrato = {
  i: "📜",
  n: "Contratos",
  price: 100,
  cat: "fab",
  lv: 2,
  s: {},
  w: 1,
  ui: (d) =>
    `<div class=term style="min-height:54px"></div><div class=pbar><i></i></div><button data-a=novo>🔄 Trocar pedido</button><div class=mu>entregue os itens antes do prazo e ganhe o prêmio + XP</div>`,
  act(d) {
    if (Date.now() - (d.tr || 0) < 15000) return toast("Espere um pouco para trocar de novo");
    d.tr = Date.now();
    novoContrato(d);
    conTexto(d);
  },
  recv(d, v) {
    if (typeof v != "string") return;
    if (!d.s.c) novoContrato(d);
    const c = d.s.c;
    if (v !== c.item) return;
    c.got++;
    if (c.got >= c.n) {
      gain(c.premio);
      track("contrato", c.item);
      xp(Math.round(20 + Math.sqrt(c.premio)));
      toast(`📜 Contrato cumprido! +$${c.premio.toLocaleString("pt-BR")}`);
      novoContrato(d);
    }
    save();
    conTexto(d);
  },
};
setInterval(() => {
  Object.values(D).forEach((d) => {
    if (d.type != "contrato") return;
    if (!d.s.c || Date.now() > d.s.c.fim) {
      if (d.s.c) toast("📜 Um contrato venceu. Pedido novo chegou.");
      novoContrato(d);
    }
    conTexto(d);
  });
}, 1000);

/* -- O que a IA precisa saber para montar fábricas (gerado das tabelas, sempre atualizado) -- */
function promptFabricas() {
  const maq = Object.keys(MAQ)
    .map((m) => m + "{r: " + receitasDe(m).map((k) => `${k} (${Object.entries(RECEITAS[k].in).map(([i, n]) => n + " " + i).join(" + ")} → ${RECEITAS[k].q} ${RECEITAS[k].out}, nível ${RECEITAS[k].lv})`).join("; ") + "}")
    .join("\n");
  return `\nFÁBRICAS (itens viajam como texto pelos fios; nível atual do jogador: ${nivel()}${ECO.f ? ", modo livre: tudo liberado" : ""}; só use receitas e recursos liberados):
extrator{res: ${BRUTOS.map((k) => k + "(nível " + ITENS[k][2] + ")").join(", ")}} (comece ligado ao montar: o usuário toca em Iniciar)
${maq}
divisor (reparte entre as saídas), filtroitem{item, modo:"só este"|"todos menos este"}, armazem{pass:1 deixa passar, 0 guarda}, mercado (vende qualquer item), contrato (pedidos com prazo), venda (preço fixo). Também existem mina, fabrica (2 minério→peça), montadora (2 peça→robô).
Monte em fila: extrator(es) → máquina → máquina → mercado. Cada máquina precisa receber TODAS as entradas da receita escolhida (ligue um extrator para cada recurso). Use "s":{"r":"id_da_receita"} nas máquinas.\n`;
}

/* -- Exemplo: linha de produção nova -- */
function ex14() {
  reset();
  const e1 = add("extrator", 20, 20, { res: "minério" }),
    e2 = add("extrator", 20, 280, { res: "carvão" }),
    f = add("fornalha", 220, 20),
    a = add("armazem", 220, 300, { pass: 1 }),
    dv = add("divisor", 480, 250),
    m = add("mercado", 480, 360),
    c = add("contrato", 480, 20);
  [[e1, f], [e2, f], [f, a], [a, dv], [dv, m], [dv, c]].forEach(([x, y]) => W.push([x.id, y.id]));
  wires();
  save();
  cm();
  [e1, e2].forEach((x) => T.extrator.act(x, "go", q(x, "[data-a=go]")));
  toast("Minério + carvão → barras de ferro → divididas entre Mercado e Contratos");
}
