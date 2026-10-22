/* ---- pixels, jogo e IA ---- */
function kp(n, dn, el) {
  const L = el ? [D[el.closest(".card").id.slice(1)]] : Object.values(D).filter((x) => x.type == "ctl");
  L.forEach((c) => c && emit(c, dn ? n : "-" + n));
}
const pbn = (e) => {
  const b = e.target.closest && e.target.closest(".pad button");
  return b && b.dataset.a;
};
world.addEventListener("pointerdown", (e) => {
  const n = pbn(e);
  if (n) kp(n, 1, e.target);
});
["pointerup", "pointercancel", "pointerout"].forEach((t) =>
  world.addEventListener(t, (e) => {
    const n = pbn(e);
    if (n) kp(n, 0, e.target);
  }),
);
const KM = {
  ArrowUp: "cima",
  w: "cima",
  ArrowDown: "baixo",
  s: "baixo",
  ArrowLeft: "esquerda",
  a: "esquerda",
  ArrowRight: "direita",
  d: "direita",
  " ": "A",
  Enter: "B",
};
["keydown", "keyup"].forEach((t) =>
  addEventListener(t, (e) => {
    const n = KM[e.key];
    if (!n || e.repeat || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    e.preventDefault();
    kp(n, t == "keydown");
  }),
);
const rgb = (r, g, b) => ((255 << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0,
  CC = {},
  cx2 = document.createElement("canvas").getContext("2d");
function cl(c) {
  if (typeof c == "number") return c;
  if (Array.isArray(c)) return rgb(c[0], c[1], c[2]);
  if (CC[c] !== undefined) return CC[c];
  cx2.fillStyle = "#000";
  cx2.fillStyle = c;
  const h = cx2.fillStyle;
  return (CC[c] =
    h[0] == "#"
      ? rgb(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16))
      : 0xff000000);
}
function mkFb(d) {
  return (w, h) => {
    w |= 0;
    h |= 0;
    let f = d.fb;
    if (!f || f.w != w || f.h != h) {
      const bf = new ArrayBuffer(w * h * 4),
        u8 = new Uint8ClampedArray(bf),
        u = new Uint32Array(bf);
      f = d.fb = {
        w,
        h,
        limpar: (c) => u.fill(cl(c)),
        px: (x, y, c) => {
          x |= 0;
          y |= 0;
          if (x >= 0 && y >= 0 && x < w && y < h) u[y * w + x] = cl(c);
        },
        vlinha: (x, y0, y1, c) => {
          x |= 0;
          if (x < 0 || x >= w) return;
          y0 = Math.max(0, y0 | 0);
          y1 = Math.min(h - 1, y1 | 0);
          c = cl(c);
          for (let y = y0; y <= y1; y++) u[y * w + x] = c;
        },
        ret: (x, y, a, b2, c) => {
          c = cl(c);
          const x1 = Math.min(w, (x + a) | 0),
            y1 = Math.min(h, (y + b2) | 0);
          for (let j = Math.max(0, y | 0); j < y1; j++)
            for (let i = Math.max(0, x | 0); i < x1; i++) u[j * w + i] = c;
        },
        sprite: (n, x, y, a, b2) => {
          const p = LIBAPI.pixels(n);
          if (!p) return;
          a = a | 0 || p.w;
          b2 = b2 | 0 || p.h;
          for (let j = 0; j < b2; j++) {
            const yy = (y | 0) + j;
            if (yy < 0 || yy >= h) continue;
            const sr = (((j * p.h) / b2) | 0) * p.w;
            for (let i = 0; i < a; i++) {
              const xx = (x | 0) + i;
              if (xx < 0 || xx >= w) continue;
              const c2 = p.d[sr + (((i * p.w) / a) | 0)];
              if (c2 >>> 24 > 127) u[yy * w + xx] = c2;
            }
          }
        },
        texto: (t, x, y, c, sz) => {
          t = String(t);
          sz = sz >= 4 ? sz : 8 * (sz || 1);
          const g = TC.canvas;
          TC.font = sz + "px monospace";
          const tw = Math.ceil(TC.measureText(t).width) + 1,
            th = sz + 2;
          g.width = tw;
          g.height = th;
          TC.font = sz + "px monospace";
          TC.textBaseline = "top";
          TC.fillStyle = "#fff";
          TC.fillText(t, 0, 0);
          const im = TC.getImageData(0, 0, tw, th).data;
          c = cl(c || "#fff");
          for (let j = 0; j < th; j++)
            for (let i = 0; i < tw; i++) {
              const X = (x | 0) + i,
                Y = (y | 0) + j;
              if (im[(j * tw + i) * 4 + 3] > 110 && X >= 0 && Y >= 0 && X < w && Y < h) u[Y * w + X] = c;
            }
        },
        mostrar: () => emit(d, { fb: { w, h, d: u8.slice() } }),
      };
    }
    return f;
  };
}
const gb = (n, l, s) =>
  `<button style="${s}" onpointerdown="kp('${n}',1)" onpointerup="kp('${n}',0)" onpointerleave="kp('${n}',0)" onpointercancel="kp('${n}',0)">${l}</button>`;
$("#gpad").innerHTML =
  `<div class=g>${gb("cima", "⬆", "grid-area:1/2")}${gb("esquerda", "⬅", "grid-area:2/1")}${gb("direita", "➡", "grid-area:2/3")}${gb("baixo", "⬇", "grid-area:3/2")}</div><div class=g style="grid-template-columns:repeat(2,58px)">${gb("A", "A", "grid-area:1/2")}${gb("B", "B", "grid-area:2/1")}</div>`;
