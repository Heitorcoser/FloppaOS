/* ---- rede ---- */
function flash(i) {
  const p = svg.querySelector(`[data-k="${i}"]`);
  if (p) {
    p.classList.add("on");
    setTimeout(() => p.classList.remove("on"), 300);
  }
}
function emit(src, v) {
  const seen = new Set([src.id]),
    qq = [src.id];
  while (qq.length) {
    const a = qq.shift();
    W.forEach((w, i) => {
      if (!w.includes(a)) return;
      const b = w[0] == a ? w[1] : w[0];
      if (seen.has(b)) return;
      seen.add(b);
      flash(i);
      const t = D[b];
      if (!t) return;
      if (t.type == "hub") {
        const o = q(t, ".term");
        if (o && typeof v != "object") o.textContent = String(v).slice(0, 14);
        qq.push(b);
      } else deliver(t, v, { de: a, origem: src.id });
    });
  }
}
// Envia só para um vizinho direto (usado por Divisor e máquinas que escolhem a saída).
function emitTo(src, alvo, v) {
  const i = W.findIndex((w) => w.includes(src.id) && w.includes(alvo));
  if (i < 0) return;
  flash(i);
  const t = D[alvo];
  if (!t) return;
  if (t.type == "hub") {
    const o = q(t, ".term");
    if (o && typeof v != "object") o.textContent = String(v).slice(0, 14);
    // o Conjunto repassa para todos os outros ligados nele, menos quem enviou
    const seen = new Set([src.id, alvo]),
      qq = [alvo];
    while (qq.length) {
      const a = qq.shift();
      W.forEach((w, k) => {
        if (!w.includes(a)) return;
        const b = w[0] == a ? w[1] : w[0];
        if (seen.has(b)) return;
        seen.add(b);
        flash(k);
        const u = D[b];
        if (!u) return;
        if (u.type == "hub") qq.push(b);
        else deliver(u, v, { de: a, origem: src.id });
      });
    }
  } else deliver(t, v, { de: src.id, origem: src.id });
}
// Vizinhos diretos de um aparelho (ids)
const vizinhos = (d) => W.filter((w) => w.includes(d.id)).map((w) => (w[0] == d.id ? w[1] : w[0]));
function deliver(d, v, info) {
  if (Date.now() < hu) return;
  if (++cnt > 4000) {
    halt();
    return;
  }
  setTimeout(() => {
    const r = T[d.type].recv;
    r && r(d, v, info || {});
  }, 0);
}
setInterval(() => (cnt = 0), 1000);
function halt(m) {
  hu = Date.now() + 1500;
  cnt = 0;
  Object.values(D).forEach((d) => {
    clearInterval(d.h);
    d.h = 0;
    d.stop = 1;
    d.pend = undefined;
  });
  document.querySelectorAll("[data-a=go]").forEach((b) => (b.textContent = "▶ Iniciar"));
  toast(m ? "⏹ Tudo parado" : "⚠ Loop detectado — tudo parado");
}
function port(id) {
  if (sel === null) {
    sel = id;
    mark();
    toast("Toque na porta ● de outro aparelho");
    return;
  }
  if (sel !== id) {
    snap();
    const i = W.findIndex((w) => w.includes(sel) && w.includes(id));
    if (i < 0) {
      W.push([sel, id]);
      track("fio");
      toast("Fio conectado");
    } else {
      W.splice(i, 1);
      toast("Fio removido");
    }
  }
  sel = null;
  mark();
  wires();
  save();
}
const mark = () =>
  document.querySelectorAll(".port").forEach((p) => p.classList.toggle("sel", +p.dataset.p === sel));
function del(id) {
  const _o = D[id];
  if (_o && T[_o.type].price && !ECO.f) gain(Math.floor(T[_o.type].price / 2));
  snap();
  const d = D[id];
  clearInterval(d.h);
  d.stop = 1;
  delete D[id];
  W = W.filter((w) => !w.includes(id));
  $("#c" + id).remove();
  if (sel === id) sel = null;
  wires();
  save();
}
function wires() {
  const wr = world.getBoundingClientRect();
  const pt = (id) => {
    const r = document.querySelector("#c" + id + " .port").getBoundingClientRect();
    return [(r.left + r.width / 2 - wr.left) / V.s, (r.top + r.height / 2 - wr.top) / V.s];
  };
  svg.innerHTML = W.map((w, i) => {
    const a = pt(w[0]),
      b = pt(w[1]),
      dx = Math.max(50, Math.abs(b[0] - a[0]) / 2),
      p = `M${a[0]} ${a[1]}C${a[0] + dx} ${a[1]} ${b[0] - dx} ${b[1]} ${b[0]} ${b[1]}`;
    return `<path class=v data-k=${i} d="${p}"/><path class=h data-i=${i} d="${p}"/>`;
  }).join("");
  econUI();
}
svg.addEventListener("click", (e) => {
  const i = e.target.dataset.i;
  if (i !== undefined) {
    snap();
    W.splice(+i, 1);
    wires();
    save();
    toast("Fio removido");
  }
});
