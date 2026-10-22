/* ---- bitcoin ---- */
const HASH = [0.3, 1, 4, 16, 64],
  btcDiff = () => 30 * 1.02 ** BTCN,
  btcReward = () => 0.001 / 2 ** Math.floor(BTCN / 100);
FAC.rig = 10;
function rigStat(d) {
  const c = cpuInfo(d),
    sh = c.pw ? W.filter((w) => w.includes(c.id)).length || 1 : 1,
    hs = (HASH[c.pw] * (1 + 0.5 * (lvl(d) - 1))) / sh;
  return { c, hs, en: ECO.f ? 0 : 0.05 + 0.05 * hs };
}
function rigText(d) {
  const t = q(d, ".term");
  if (!t) return;
  const { c, hs, en } = rigStat(d),
    x = `Nv ${lvl(d)} · ${hs.toFixed(2)} H/s · energia $${en.toFixed(2)}/s\n${d.low ? "⚠ sem dinheiro para a energia" : !c.pw ? "⚠ sem processador: ligue um 🔲 com fio" : d.h ? "⛏ minerando..." : "parado"}\nprogresso ${Math.floor(d.pg || 0)}/${Math.floor(btcDiff())} · blocos ${d.nb || 0}\n₿ minerados: ${(d.got || 0).toFixed(4)}`;
  if (t.textContent != x) t.textContent = x;
}
function rigTick(d) {
  const { hs, en } = rigStat(d);
  d.low = 0;
  if (en) {
    if (M < en) {
      d.low = 1;
      rigText(d);
      return;
    }
    M -= en;
    saveM();
    hud();
  }
  d.pg = (d.pg || 0) + hs;
  let n = 0;
  while (d.pg >= btcDiff() && n++ < 50) {
    d.pg -= btcDiff();
    const r = btcReward();
    BTC += r;
    BTCN++;
    track("bloco");
    d.nb = (d.nb || 0) + 1;
    d.got = (d.got || 0) + r;
    emit(d, "bloco");
  }
  if (n) {
    saveM();
    hud();
  }
  rigText(d);
}
T.rig = {
  i: "₿",
  n: "Minerador BTC",
  price: 300,
  s: { lv: 1 },
  ui: (d) =>
    `<div class=term style="min-height:84px"></div><button data-a=go>${d.h ? "⏸ Parar" : "▶ Iniciar"}</button><button data-a=up style="background:#16a34a">⬆ Melhorar (-$${upc(d)})</button><div class=mu>Ligue um 🔲 Processador por fio direto. Envia "bloco" a cada bloco achado.</div>`,
  act: (d, a, el) => {
    if (a == "up") {
      if (!pay(upc(d))) return;
      d.s.lv = lvl(d) + 1;
      q(d, ".bd").innerHTML = T.rig.ui(d);
      rigText(d);
      save();
      return;
    }
    if (d.h) {
      clearInterval(d.h);
      d.h = 0;
      el.textContent = "▶ Iniciar";
    } else {
      d.h = setInterval(() => rigTick(d), 1000);
      el.textContent = "⏸ Parar";
    }
    rigText(d);
  },
};
function btcSell(f) {
  const n = BTC * f;
  if (n <= 1e-9) {
    toast("Você não tem ₿");
    return;
  }
  BTC -= n;
  const g = Math.floor(n * BTCP * 0.99);
  gain(g);
  saveM();
  hud();
  toast("Vendeu ₿" + n.toFixed(4) + " por $" + g);
}
function btcBuy(v) {
  if (!pay(v)) return;
  BTC += (v * 0.99) / BTCP;
  saveM();
  hud();
}
function bolsaUI() {
  Object.values(D).forEach((d) => {
    if (d.type != "bolsa") return;
    const t = q(d, ".term"),
      c = q(d, "canvas");
    if (!t || !c) return;
    const a = BTCH.length > 1 ? (BTCP >= BTCH[BTCH.length - 2] ? "▲" : "▼") : "";
    t.textContent = `₿ ${BTC.toFixed(5)} (≈ $${Math.floor(BTC * BTCP).toLocaleString("pt-BR")})\nPreço: $${Math.round(BTCP).toLocaleString("pt-BR")} ${a}\nRede: dificuldade ${Math.floor(btcDiff())} · recompensa ₿${btcReward().toFixed(5)} · blocos ${BTCN}`;
    const x = c.getContext("2d"),
      w = c.width,
      h = c.height,
      lo = Math.min(...BTCH),
      hi = Math.max(...BTCH),
      r = hi - lo || 1;
    x.clearRect(0, 0, w, h);
    x.strokeStyle = BTCP >= BTCH[0] ? "#22c55e" : "#ef4444";
    x.lineWidth = 2;
    x.beginPath();
    BTCH.forEach((y, i) => {
      const px = i * (w / 59),
        py = h - 4 - ((y - lo) / r) * (h - 8);
      i ? x.lineTo(px, py) : x.moveTo(px, py);
    });
    x.stroke();
    x.fillStyle = "#94a3b8";
    x.font = "10px monospace";
    x.fillText(Math.round(hi), 2, 10);
    x.fillText(Math.round(lo), 2, h - 2);
  });
}
T.bolsa = {
  i: "📈",
  n: "Corretora BTC",
  price: 50,
  w: 1,
  s: { alvo: 0 },
  ui: (d) =>
    `<canvas class=px width=240 height=100 style="width:100%;height:100px;image-rendering:auto"></canvas><div class=term style="min-height:60px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button data-a=v1>Vender tudo</button><button data-a=v2>Vender metade</button><button data-a=c1>Comprar $100</button><button data-a=c2>Comprar $1000</button></div><div class=mu>Venda automática quando o preço chegar a (0 = desligada). Taxa de 1%. Sinais: "vender", "comprar", "preço".</div><input data-k=alvo type=number value="${d.s.alvo}">`,
  act: (d, a) => {
    a == "v1" ? btcSell(1) : a == "v2" ? btcSell(0.5) : a == "c1" ? btcBuy(100) : btcBuy(1000);
    bolsaUI();
  },
  recv(d, v) {
    if (typeof v == "object") return;
    v = String(v).toLowerCase();
    if (v == "vender") btcSell(1);
    else if (v == "comprar") btcBuy(100);
    else if (v == "preço" || v == "preco") emit(d, Math.round(BTCP));
    bolsaUI();
  },
};
setInterval(() => {
  const l = Math.log(BTCP);
  let n = l + (Math.log(20000) - l) * 0.02 + (Math.random() - 0.5) * 0.1;
  if (Math.random() < 0.03) {
    const up = Math.random() < 0.5;
    n += up ? 0.25 : -0.25;
    toast(up ? "📰 Bitcoin disparou!" : "📰 Bitcoin despencou!");
  }
  BTCP = Math.min(90000, Math.max(3000, Math.exp(n)));
  BTCH.push(BTCP);
  if (BTCH.length > 60) BTCH.shift();
  Object.values(D).forEach((d) => {
    if (d.type == "bolsa" && +d.s.alvo > 0 && BTCP >= +d.s.alvo && BTC > 1e-9) btcSell(1);
  });
  bolsaUI();
  hud();
  saveM();
}, 2000);
function ex13() {
  reset();
  const r = add("rig", 20, 20),
    c = add("cpu2", 20, 230),
    b = add("bolsa", 215, 20),
    t = add("tela", 20, 330);
  [
    [c, r],
    [r, t],
  ].forEach(([x, y]) => W.push([x.id, y.id]));
  wires();
  save();
  cm();
  T.rig.act(r, "go", q(r, "[data-a=go]"));
  toast("Minerando! Venda os ₿ na Corretora");
}
