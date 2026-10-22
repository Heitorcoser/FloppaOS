const RH = [],
  stJ = () =>
    JSON.stringify({
      D: Object.values(D).map((d) => ({ id: d.id, type: d.type, x: d.x, y: d.y, s: d.s })),
      W,
      VARS,
      CMDS,
    });
function redo() {
  const j = RH.pop();
  if (!j) {
    toast("Nada para refazer");
    return;
  }
  UH.push(stJ());
  const s = JSON.parse(j);
  reset(1);
  s.D.forEach((d) => {
    D[d.id] = d;
    mk(d);
  });
  W = s.W;
  VARS = s.VARS;
  CMDS = s.CMDS;
  wires();
  save();
  toast("↪ Refeito");
}
function fit() {
  const L = Object.values(D);
  if (!L.length) {
    cm();
    return;
  }
  const x0 = Math.min(...L.map((d) => d.x)),
    y0 = Math.min(...L.map((d) => d.y)),
    x1 = Math.max(...L.map((d) => d.x + 235)),
    y1 = Math.max(...L.map((d) => d.y + ($("#c" + d.id) || { offsetHeight: 150 }).offsetHeight)),
    s = Math.min(
      1.2,
      Math.max(0.25, Math.min(view.clientWidth / (x1 - x0 + 40), view.clientHeight / (y1 - y0 + 40))),
    );
  V.s = s;
  V.x = (view.clientWidth - (x1 - x0) * s) / 2 - x0 * s;
  V.y = (view.clientHeight - (y1 - y0) * s) / 2 - y0 * s;
  apply();
  wires();
  save();
  cm();
}
function theme() {
  const r = document.documentElement,
    dk = r.dataset.theme ? r.dataset.theme == "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme = dk ? "light" : "dark";
  try {
    localStorage.setItem("fabth", r.dataset.theme);
  } catch (e) {}
  cm();
}
try {
  const t = localStorage.getItem("fabth");
  if (t) document.documentElement.dataset.theme = t;
} catch (e) {}
function zat(px, py, f) {
  const r = view.getBoundingClientRect(),
    cx = px - r.left,
    cy = py - r.top,
    s = Math.min(2, Math.max(0.25, V.s * f)),
    k = s / V.s;
  V.x = cx - (cx - V.x) * k;
  V.y = cy - (cy - V.y) * k;
  V.s = s;
  apply();
  wires();
  save();
}
view.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    zat(e.clientX, e.clientY, e.deltaY < 0 ? 1.1 : 0.9);
  },
  { passive: false },
);
const PT = new Map();
let pd = 0;
view.addEventListener(
  "pointerdown",
  (e) => {
    PT.set(e.pointerId, [e.clientX, e.clientY]);
    if (PT.size == 2) {
      drag = null;
      pd = 0;
    }
  },
  true,
);
view.addEventListener(
  "pointermove",
  (e) => {
    if (!PT.has(e.pointerId)) return;
    PT.set(e.pointerId, [e.clientX, e.clientY]);
    if (PT.size != 2) return;
    const [a, b] = [...PT.values()],
      ds = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pd) zat((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, ds / pd);
    pd = ds;
    drag = null;
    e.stopImmediatePropagation();
  },
  true,
);
["pointerup", "pointercancel"].forEach((t) =>
  view.addEventListener(
    t,
    (e) => {
      PT.delete(e.pointerId);
      pd = 0;
    },
    true,
  ),
);
function ex10() {
  reset();
  const t = add("timer", 20, 20, { ms: 700 }),
    a = add("aleat", 20, 150, { a: 0, b: 100 }),
    g = add("grafico", 230, 20),
    b = add("barra", 230, 230),
    p = add("placar", 20, 300);
  W.push([t.id, a.id], [a.id, g.id], [a.id, b.id], [a.id, p.id]);
  wires();
  save();
  cm();
  toast("Toque em Iniciar no Timer");
}
function exp() {
  const j = stJ();
  modal(
    `<div style="font-weight:700">📤 Exportar projeto</div><textarea id=ej rows=6 readonly>${esc(j)}</textarea><button class=it onclick="navigator.clipboard.writeText($('#ej').value).then(()=>toast('Copiado!'),()=>{$('#ej').select();toast('Selecione e copie o texto')})">📋 Copiar texto</button><a class=it id=dl download="fabrica.json" style="text-decoration:none;color:var(--tx)">💾 Baixar arquivo .json</a><button class=it onclick="cm()">Fechar</button>`,
  );
  $("#dl").href = URL.createObjectURL(new Blob([j], { type: "application/json" }));
}
function imp() {
  modal(
    `<div style="font-weight:700">📥 Importar projeto</div><label class=it for=pf style="flex-direction:row;padding:10px">📁 Escolher arquivo .json</label><div class=mu>ou cole o texto do projeto aqui:</div><textarea id=pj rows=6 placeholder="cole aqui"></textarea><button class=it onclick="impJ($('#pj').value)">Importar texto</button><button class=it onclick="cm()">Fechar</button>`,
  );
}
function impJ(j) {
  try {
    const s = JSON.parse(j);
    if (!Array.isArray(s.D) || !Array.isArray(s.W)) throw 0;
    reset();
    const m = {};
    s.D.filter((d) => T[d.type]).forEach((d) => {
      m[d.id] = add(d.type, d.x, d.y, d.s).id;
    });
    Object.assign(VARS, s.VARS || {});
    Object.assign(CMDS, s.CMDS || {});
    W = s.W.map((w) => [m[w[0]], m[w[1]]]).filter((w) => w[0] && w[1]);
    wires();
    save();
    cm();
    fit();
    toast("Projeto importado");
  } catch (e) {
    toast("Projeto inválido (precisa ser um .json exportado daqui)");
  }
}
function clr() {
  modal(
    `<div style="font-weight:700">🗑 Apagar tudo?</div><div class=mu>Dá para desfazer com ↩ logo depois.</div><button class=it style="background:#dc2626;color:#fff" onclick="reset();wires();save();cm()">Sim, apagar</button><button class=it onclick="cm()">Cancelar</button>`,
  );
}
$("#pf").onchange = async (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f) impJ(await f.text());
};
const EX11 = `const N=48,t=tela(N,N),FX=['normal','P&B','negativo','vermelho','poster'];
const nomes=[...lib.lista('video'),...lib.lista('img')];
if(!nomes.length){
  t.limpar('#1e1b4b');
  t.texto('IMPORTE',5,5,'#fde047',7);
  t.texto('FOTO OU',5,16,'#fff',7);
  t.texto('VIDEO',5,26,'#fff',7);
  t.texto('Menu>Biblioteca',1,40,'#a5b4fc',4);
  t.mostrar();return;
}
if(teclas.B&&!S.pb)S.k=(S.k||0)+1;S.pb=teclas.B;
if(teclas.A&&!S.pa)S.fx=((S.fx||0)+1)%FX.length;S.pa=teclas.A;
const nome=nomes[(S.k||0)%nomes.length];
if(S.v!==nome){if(S.v)lib.video(S.v,'pause');S.v=nome;lib.video(nome,'play')}
if(teclas.cima&&!S.pc)lib.video(nome,'alternar');S.pc=teclas.cima;
const p=lib.pixels(nome);
if(!p){t.limpar('#000');t.texto('carregando',2,20,'#fff',5);t.mostrar();return}
const fx=S.fx||0,sc=Math.max(p.w,p.h)/N,ox=(N-p.w/sc)/2,oy=(N-p.h/sc)/2;
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const sx=Math.floor((x-ox)*sc),sy=Math.floor((y-oy)*sc);
  if(sx<0||sy<0||sx>=p.w||sy>=p.h){t.px(x,y,'#000');continue}
  const c=p.d[sy*p.w+sx];let r=c&255,g=(c>>8)&255,b=(c>>16)&255;
  if(fx==1){r=g=b=(r+g+b)/3}
  else if(fx==2){r=255-r;g=255-g;b=255-b}
  else if(fx==3){g*=.4;b*=.4}
  else if(fx==4){r=r>>6<<6;g=g>>6<<6;b=b>>6<<6}
  t.px(x,y,rgb(r,g,b));
}
t.ret(0,N-8,N,8,'#000');
t.texto(FX[fx],1,N-7,'#fde047',6);
t.mostrar();`;
function vpix(o) {
  const v = o.obj;
  if (v.readyState < 2 || !v.videoWidth) return null;
  const k = Math.min(1, 160 / v.videoWidth),
    w = Math.max(1, (v.videoWidth * k) | 0),
    h = Math.max(1, (v.videoHeight * k) | 0),
    c = o.cv || (o.cv = document.createElement("canvas"));
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(v, 0, 0, w, h);
  return { w, h, d: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer) };
}
function ex11() {
  reset();
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    t = add("timer", 215, 100, { ms: 50 }),
    m = add("comand", 215, 230, { code: EX11, lang: "jsx" }),
    d = add("disp", 20, 200, { n: 48 });
  [
    [c, h],
    [t, h],
    [m, h],
    [d, h],
  ].forEach(([a, b]) => W.push([a.id, b.id]));
  wires();
  save();
  cm();
  T.timer.act(t, "go", q(t, "[data-a=go]"));
  libUI();
  toast("Importe uma foto ou vídeo. Depois: A efeito, B próxima mídia, ⬆ pausa");
}
