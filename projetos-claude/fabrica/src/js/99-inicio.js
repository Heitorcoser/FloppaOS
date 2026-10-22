/* ---- início ---- */
try {
  const s = JSON.parse(localStorage.getItem("fab1") || "null");
  if (s && s.D.length) {
    Object.assign(VARS, s.VARS || {});
    Object.assign(CMDS, s.CMDS || {});
    nid = s.nid;
    V = s.V;
    W = s.W;
    s.D.forEach((d) => {
      if (T[d.type]) {
        D[d.id] = d;
        mk(d);
      }
    });
    W = W.filter((w) => D[w[0]] && D[w[1]]);
    apply();
  } else ex1();
} catch (e) {
  ex1();
}
apply();
requestAnimationFrame(wires);
addEventListener("resize", wires);
hudNivel();
// primeira vez: oferece o tutorial guiado
try {
  if (localStorage.getItem("fabtut") != "feito") setTimeout(() => tutorial(0), 1200);
} catch (e) {}
// save antigo com cartões um em cima do outro: sugere organizar
requestAnimationFrame(() => {
  const L = Object.values(D).map((d) => {
    const e = $("#c" + d.id);
    return { x: d.x, y: d.y, w: e ? e.offsetWidth : 170, h: e ? e.offsetHeight : 150 };
  });
  const cruza = L.some((a, i) => L.some((b, j) => j > i && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h));
  if (cruza && localStorage.getItem("fabtut") == "feito") toast("Tem cartões um em cima do outro. Use ⋯ › Organizar cartões");
});
