/* ---- interação ---- */
world.addEventListener("input", (e) => {
  const k = e.target.dataset.k;
  if (!k) return;
  D[e.target.closest(".card").id.slice(1)].s[k] = e.target.value;
  save();
});
world.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.p) return port(+t.dataset.p);
  if (t.dataset.c) {
    snap();
    const o = D[t.dataset.c];
    if (T[o.type].price && !pay(T[o.type].price)) return;
    add(o.type, o.x + 20, o.y + 20, JSON.parse(JSON.stringify(o.s)));
    wires();
    save();
    return;
  }
  if (t.dataset.x) return del(+t.dataset.x);
  const a = t.dataset.a;
  if (a) {
    const d = D[t.closest(".card").id.slice(1)];
    T[d.type].act(d, a, t);
  }
});
let drag = null;
view.addEventListener("pointerdown", (e) => {
  $("#sheet").classList.remove("open");
  const t = e.target;
  if (t.dataset.p || t.dataset.x || t.classList.contains("h")) return;
  const hd = t.closest(".hd");
  if (hd) {
    const d = D[hd.parentNode.id.slice(1)];
    drag = { d, sx: e.clientX, sy: e.clientY, ox: d.x, oy: d.y };
  } else if (!t.closest(".card")) drag = { pan: 1, sx: e.clientX, sy: e.clientY, ox: V.x, oy: V.y };
});
view.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.sx,
    dy = e.clientY - drag.sy;
  if (!drag.mv && Math.hypot(dx, dy) < 5) return;
  if (!drag.mv) {
    drag.mv = 1;
    try {
      view.setPointerCapture(e.pointerId);
    } catch (x) {}
  }
  if (drag.pan) {
    V.x = drag.ox + dx;
    V.y = drag.oy + dy;
    apply();
  } else {
    const d = drag.d;
    d.x = drag.ox + dx / V.s;
    d.y = drag.oy + dy / V.s;
    const c = $("#c" + d.id);
    c.style.left = d.x + "px";
    c.style.top = d.y + "px";
    wires();
  }
});
const up = () => {
  if (drag) {
    if (drag.pan && !drag.mv && sel !== null) {
      sel = null;
      mark();
    }
    if (drag.d && drag.mv) {
      const d = drag.d,
        c = $("#c" + d.id);
      d.x = Math.round(d.x / 12) * 12;
      d.y = Math.round(d.y / 12) * 12;
      c.style.left = d.x + "px";
      c.style.top = d.y + "px";
      wires();
    }
    drag = null;
    save();
  }
};
view.addEventListener("pointerup", up);
view.addEventListener("pointercancel", up);
function apply() {
  world.style.transform = `translate(${V.x}px,${V.y}px) scale(${V.s})`;
  view.style.backgroundPosition = V.x + "px " + V.y + "px";
  view.style.backgroundSize = 24 * V.s + "px " + 24 * V.s + "px";
}
function zm(f) {
  const cx = view.clientWidth / 2,
    cy = view.clientHeight / 2,
    s = Math.min(2, Math.max(0.4, V.s * f)),
    k = s / V.s;
  V.x = cx - (cx - V.x) * k;
  V.y = cy - (cy - V.y) * k;
  V.s = s;
  apply();
  wires();
  save();
}
function save() {
  clearTimeout(save.t);
  save.t = setTimeout(() => {
    try {
      localStorage.setItem(
        "fab1",
        JSON.stringify({
          D: Object.values(D).map((d) => ({ id: d.id, type: d.type, x: d.x, y: d.y, s: d.s })),
          W,
          nid,
          V,
          VARS,
          CMDS,
        }),
      );
    } catch (e) {}
  }, 300);
}
// O navegador às vezes rola a mesa sozinho (ex.: ao focar um campo). Convertemos em movimento da câmera.
view.addEventListener("scroll", () => {
  if (!view.scrollLeft && !view.scrollTop) return;
  V.x -= view.scrollLeft;
  V.y -= view.scrollTop;
  view.scrollLeft = view.scrollTop = 0;
  apply();
  wires();
});
