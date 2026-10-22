/* ---- economia ---- */
const FREEH = "296505269868603",
  h53 = (s, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, c; i < s.length; i++) {
      c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return String(4294967296 * (2097151 & h2) + (h1 >>> 0));
  };
let M = 250,
  BTC = 0,
  BTCP = 20000,
  BTCN = 0,
  PK = 0,
  PKR = null,
  CR = {},
  OID = "";
const ECO = { f: 0 },
  BTCH = [];
try {
  const o = JSON.parse(localStorage.getItem("fabeco"));
  if (o) {
    M = +o.M || 0;
    ECO.f = o.F === FREEH ? 1 : 0;
    BTC = +o.BTC || 0;
    BTCP = +o.P || 20000;
    BTCN = +o.N || 0;
    CR = o.CR || {};
    PKR = o.PKR || null;
    OID = o.OID || "";
  }
} catch (e) {}
BTCH.push(BTCP);
if (!OID) OID = Math.random().toString(36).slice(2, 8).toUpperCase();
const saveM = () => {
  clearTimeout(saveM.t);
  saveM.t = setTimeout(() => {
    try {
      localStorage.setItem(
        "fabeco",
        JSON.stringify({ M, F: ECO.f ? FREEH : 0, BTC, P: BTCP, N: BTCN, CR, PKR, OID }),
      );
    } catch (e) {}
  }, 500);
};
const fmtM = (n) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? (n / 1e3).toFixed(1) + "k" : String(Math.floor(n));
const hud = () => {
  const e = $("#mny");
  if (e) e.textContent = "💰 " + (ECO.f ? "∞" : fmtM(M)) + (BTC > 1e-6 ? " · ₿" + BTC.toFixed(4) : "");
};
function pay(n) {
  if (ECO.f) return true;
  if (M < n) {
    toast("💸 Faltam $" + (n - M));
    return false;
  }
  M -= n;
  saveM();
  hud();
  return true;
}
function gain(n) {
  if (ECO.f) return;
  M += n;
  saveM();
  hud();
  track("ganho", n);
}
const SRES = [16, 24, 32, 48, 64, 96],
  UPS = [0, 150, 600, 2500, 9000, 30000];
const CPU = [
  null,
  ["Chip 8-bit", 120, 24, 15, 350],
  ["Chip 16-bit", 900, 48, 30, 150],
  ["Chip 32-bit", 6000, 64, 45, 50],
  ["Chip 64-bit Quad", 35000, 96, 60, 0],
];
function cpuInfo(d) {
  let b = 0,
    bid = 0;
  W.forEach((w) => {
    if (!w.includes(d.id)) return;
    const o = D[w[0] == d.id ? w[1] : w[0]],
      m = o && /^cpu(\d)$/.exec(o.type);
    if (m && +m[1] > b) {
      b = +m[1];
      bid = o.id;
    }
  });
  return b
    ? { id: bid, pw: b, nm: CPU[b][0], cap: CPU[b][2], fps: CPU[b][3], delay: CPU[b][4] }
    : { pw: 0, nm: "sem processador", cap: 16, fps: 8, delay: 700 };
}
const effRes = (d) => (ECO.f ? 96 : Math.min(SRES[d.s.t || 0], cpuInfo(d).cap));
function scrUp(d) {
  const t = d.s.t || 0;
  if (t >= 5) {
    toast("Tela já está no máximo");
    return;
  }
  if (!pay(UPS[t + 1])) return;
  d.s.t = t + 1;
  save();
  econUI();
  toast("Tela agora tem " + SRES[t + 1] + " bits (precisa de processador bom para usar tudo)");
}
function econUI() {
  Object.values(D).forEach((d) => {
    if (d.type != "disp" && d.type != "pc" && d.type != "rig" && d.type != "console") return;
    const c = cpuInfo(d),
      e = q(d, ".eco");
    if (e) {
      const x = ECO.f
        ? "modo livre · sem limites"
        : d.type == "disp"
          ? `${c.nm} · ${effRes(d)}×${effRes(d)} · ${c.fps}fps`
          : `${c.nm}${c.delay ? " · lento (" + c.delay + "ms por linha)" : " · turbo"}`;
      if (e.textContent != x) e.textContent = x;
    }
    if (d.type == "disp") {
      const b = q(d, "[data-a=up]"),
        t = d.s.t || 0;
      if (b) {
        const x =
          t >= 5
            ? "Tela no máximo (" + SRES[5] + " bits)"
            : `⬆ Tela ${SRES[t]}→${SRES[t + 1]} bits (-$${UPS[t + 1]})`;
        if (b.textContent != x) b.textContent = x;
      }
    }
    if (d.type == "rig") rigText(d);
    if (d.type == "console") emuText(d);
  });
}
// Reduz um quadro (framebuffer) por um fator k < 1, pegando o pixel mais próximo
function reduzQuadro(f, k) {
  const w = Math.max(1, Math.floor(f.w * k)),
    h = Math.max(1, Math.floor(f.h * k)),
    od = new Uint8ClampedArray(w * h * 4),
    o = new Uint32Array(od.buffer),
    sr = new Uint32Array(f.d.buffer, f.d.byteOffset, f.d.length >> 2);
  for (let y = 0; y < h; y++) {
    const r = Math.floor(y / k) * f.w;
    for (let x = 0; x < w; x++) o[y * w + x] = sr[r + Math.floor(x / k)];
  }
  return { w, h, d: od };
}
for (let i = 1; i < 5; i++) {
  const c = CPU[i];
  T["cpu" + i] = {
    i: "🔲",
    n: "Processador " + c[0].replace("Chip ", ""),
    price: c[1],
    s: {},
    ui: () =>
      `<div class=term style="text-align:center">${c[0]}\nTela até ${c[2]}×${c[2]} · ${c[3]}fps</div><div class=mu>Ligue com um fio direto em uma Tela bit ou PC.</div>`,
  };
}
