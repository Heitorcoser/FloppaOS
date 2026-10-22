const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let VARS = {},
  CMDS = {},
  D = {},
  W = [],
  nid = 1,
  V = { x: 10, y: 10, s: 1 },
  sel = null,
  cnt = 0,
  hu = 0,
  AC,
  tt;
const view = $("#view"),
  world = $("#world"),
  svg = $("#wires"),
  sl = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (d, s) => document.querySelector("#c" + d.id + " " + s),
  num = (v) => (typeof v == "string" && v.trim() !== "" && !isNaN(v) ? Number(v) : v);
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.style.display = "block";
  clearTimeout(tt);
  tt = setTimeout(() => (t.style.display = "none"), Math.max(2200, m.length * 60));
}
