let GP = null;
function gopen(id) {
  const cv = D[id].cv || (D[id].cv = q(D[id], "canvas"));
  GP = { cv, p: cv.parentNode, n: cv.nextSibling };
  $("#gcv").append(cv);
  $("#game").classList.add("open");
}
function gclose() {
  if (GP) {
    GP.p.insertBefore(GP.cv, GP.n);
    GP = null;
  }
  $("#game").classList.remove("open");
  wires();
}
function drw(c, n, v) {
  if (v.clr) {
    if (v.bg) {
      c.fillStyle = v.bg;
      c.fillRect(0, 0, n, n);
    } else c.clearRect(0, 0, n, n);
  } else if (v.rc) {
    c.fillStyle = v.rc[4];
    c.fillRect(v.rc[0], v.rc[1], v.rc[2], v.rc[3]);
  } else if (v.px) {
    c.fillStyle = v.px[2];
    c.fillRect(v.px[0] | 0, v.px[1] | 0, 1, 1);
  } else if (v.ln) {
    const [a, b, x, y, col] = v.ln,
      s = Math.max(Math.abs(x - a), Math.abs(y - b), 1);
    c.fillStyle = col;
    for (let i = 0; i <= s; i++)
      c.fillRect(Math.round(a + ((x - a) * i) / s), Math.round(b + ((y - b) * i) / s), 1, 1);
  } else if (v.img) {
    const o = LIB[v.img[0]];
    if (o && o.obj && o.obj.complete) {
      c.imageSmoothingEnabled = false;
      c.drawImage(o.obj, v.img[1] | 0, v.img[2] | 0, v.img[3] || o.obj.width, v.img[4] || o.obj.height);
    }
  } else if (v.tx) {
    const [t, x, y, col, sz] = v.tx;
    c.fillStyle = col;
    c.font = (sz >= 4 ? sz : 8 * (sz || 1)) + "px monospace";
    c.textBaseline = "top";
    c.fillText(t, x, y);
  } else if (v.ci) {
    const [a, b, r, col] = v.ci;
    c.fillStyle = col;
    for (let i = -r; i <= r; i++)
      for (let j = -r; j <= r; j++) if (i * i + j * j <= r * r) c.fillRect(a + i, b + j, 1, 1);
  }
}
function tapd(e, c) {
  const r = c.getBoundingClientRect(),
    d = D[c.dataset.id];
  emit(
    d,
    "toque " +
      Math.floor(((e.clientX - r.left) / r.width) * c.width) +
      " " +
      Math.floor(((e.clientY - r.top) / r.height) * c.height),
  );
}
function ex9() {
  reset();
  setVar("pontos", 0);
  defCmd("quadrado", "x,y,cor", "retangulo x * 4, y * 4, 4, 4, cor");
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    m = add("comand", 215, 110, {
      code: [
        "se iniciado = 0 entao",
        "  iniciado = 1",
        "  px = 3",
        "  py = 3",
        "  ox = 6",
        "  oy = 1",
        "fim",
        'se entrada = "direita" entao',
        "  px += 1",
        "fim",
        'se entrada = "esquerda" entao',
        "  px -= 1",
        "fim",
        'se entrada = "cima" entao',
        "  py -= 1",
        "fim",
        'se entrada = "baixo" entao',
        "  py += 1",
        "fim",
        "px = max(0, min(7, px))",
        "py = max(0, min(7, py))",
        "se px = ox e py = oy entao",
        "  pontos += 1",
        "  ox = aleatorio(0, 7)",
        "  oy = aleatorio(0, 7)",
        "  bip 660",
        "fim",
        'fundo "#111"',
        'quadrado ox, oy, "gold"',
        'quadrado px, py, "lime"',
      ].join("\n"),
    }),
    d = add("disp", 20, 200, { n: 32 }),
    v = add("vari", 20, 520, { n: "pontos" });
  W.push([c.id, h.id], [m.id, h.id], [d.id, h.id], [v.id, h.id]);
  wires();
  save();
  cm();
  toast("Use o controle. Veja o menu Variaveis e Meus comandos");
}
function ex8() {
  reset();
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    t = add("timer", 215, 100, { ms: 200 }),
    m = add("comand", 215, 230, {
      lang: "py",
      code: `if 'x' not in globals():
    x = 2
    dx = 1
x += dx
if x > 14 or x < 1:
    dx = -dx
fundo("#102")
retangulo(x * 2, 14, 3, 3, "cyan")
if teclas["A"]:
    log("A apertado em x=" + str(x))`,
    }),
    d = add("disp", 20, 200, { n: 32 });
  W.push([c.id, h.id], [t.id, h.id], [m.id, h.id], [d.id, h.id]);
  wires();
  save();
  cm();
  toast("Inicie o Timer. Na 1ª vez baixa o Python (~10 MB)");
}
function ex7() {
  reset();
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    t = add("timer", 215, 100, { ms: 33 }),
    m = add("comand", 215, 230, {
      lang: "jsx",
      code: `const W=160,H=100,fb=tela(W,H),t=teclas;
if(!S.ok){S.ok=1;S.x=3.5;S.y=3.5;S.a=0;S.m=['1111111111','1000000001','1011001101','1000000001','1000110001','1000010001','1011000101','1000000001','1000010001','1111111111']}
if(t.esquerda)S.a-=0.08;
if(t.direita)S.a+=0.08;
const v=(t.cima?1:0)-(t.baixo?1:0);
if(v){const nx=S.x+Math.cos(S.a)*v*0.12,ny=S.y+Math.sin(S.a)*v*0.12;
 if(S.m[ny|0][S.x|0]=='0')S.y=ny;
 if(S.m[S.y|0][nx|0]=='0')S.x=nx}
fb.limpar(rgb(25,25,40));
fb.ret(0,H/2,W,H/2,rgb(60,45,35));
for(let c=0;c<W;c++){
 const ra=S.a+(c/W-0.5)*1.05,dx=Math.cos(ra),dy=Math.sin(ra);
 let d=0,hit=0;
 while(d<16){d+=0.04;if(S.m[(S.y+dy*d)|0][(S.x+dx*d)|0]=='1'){hit=1;break}}
 if(hit){const h2=Math.min(H,H/(d*Math.cos(ra-S.a))),sh=Math.max(0.15,1-d/10);
  fb.vlinha(c,(H-h2)/2,(H+h2)/2,rgb(210*sh,60*sh,40*sh))}}
fb.mostrar();`,
    }),
    d = add("disp", 20, 200, { n: 32 });
  W.push([c.id, h.id], [t.id, h.id], [m.id, h.id], [d.id, h.id]);
  wires();
  save();
  cm();
  toast("Inicie o Timer e toque em Jogar em tela cheia");
}
function ex6() {
  reset();
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    t = add("timer", 215, 100, { ms: 250 }),
    m = add("comand", 215, 230, {
      code: [
        "se iniciado = 0 entao",
        "  iniciado = 1",
        "  corpo = lista()",
        "  adicionar(corpo, 8)",
        "  adicionar(corpo, 8)",
        "  dx = 1",
        "  dy = 0",
        "  mx = aleatorio(0, 15)",
        "  my = aleatorio(0, 15)",
        "  pontos = 0",
        "  vivo = 1",
        "fim",
        'se entrada = "cima" e dy = 0 entao',
        "  dx = 0",
        "  dy = -1",
        "fim",
        'se entrada = "baixo" e dy = 0 entao',
        "  dx = 0",
        "  dy = 1",
        "fim",
        'se entrada = "esquerda" e dx = 0 entao',
        "  dx = -1",
        "  dy = 0",
        "fim",
        'se entrada = "direita" e dx = 0 entao',
        "  dx = 1",
        "  dy = 0",
        "fim",
        'se entrada = "A" entao',
        "  iniciado = 0",
        "fim",
        "se entrada > 0 e vivo = 1 entao",
        "  n = tamanho(corpo)",
        "  hx = corpo[n - 2] + dx",
        "  hy = corpo[n - 1] + dy",
        "  se hx < 0 ou hx > 15 ou hy < 0 ou hy > 15 entao",
        "    vivo = 0",
        "  fim",
        "  para i de 0 ate n - 1",
        "    se i % 2 = 0 e corpo[i] = hx e corpo[i + 1] = hy entao",
        "      vivo = 0",
        "    fim",
        "  fim",
        "  se vivo = 1 entao",
        "    adicionar(corpo, hx)",
        "    adicionar(corpo, hy)",
        "    se hx = mx e hy = my entao",
        "      pontos += 1",
        "      mx = aleatorio(0, 15)",
        "      my = aleatorio(0, 15)",
        "      bip 660",
        "    senao",
        "      removerprimeiro(corpo)",
        "      removerprimeiro(corpo)",
        "    fim",
        "  fim",
        "fim",
        "se vivo = 1 entao",
        '  fundo "#111"',
        '  retangulo mx * 2, my * 2, 2, 2, "red"',
        "  para i de 0 ate tamanho(corpo) - 1",
        "    se i % 2 = 0 entao",
        '      retangulo corpo[i] * 2, corpo[i + 1] * 2, 2, 2, "lime"',
        "    fim",
        "  fim",
        "senao",
        '  fundo "#400"',
        '  log "Fim! Pontos: " + pontos + " (aperte A)"',
        "fim",
      ].join("\n"),
    }),
    d = add("disp", 20, 200, { n: 32 });
  W.push([c.id, h.id], [t.id, h.id], [m.id, h.id], [d.id, h.id]);
  wires();
  save();
  cm();
  toast("Inicie o Timer e use as setas do controle");
}
function ex5() {
  reset();
  const c = add("ctl", 20, 20),
    h = add("hub", 215, 20),
    m = add("comand", 215, 110, {
      code: [
        "se iniciado = 0 entao",
        "  iniciado = 1",
        "  px = 15",
        "  py = 15",
        "  ox = aleatorio(1, 28)",
        "  oy = aleatorio(1, 28)",
        "  pontos = 0",
        "fim",
        'se entrada = "direita" entao',
        "  px += 2",
        "fim",
        'se entrada = "esquerda" entao',
        "  px -= 2",
        "fim",
        'se entrada = "cima" entao',
        "  py -= 2",
        "fim",
        'se entrada = "baixo" entao',
        "  py += 2",
        "fim",
        "px = max(0, min(29, px))",
        "py = max(0, min(29, py))",
        "se abs(px - ox) < 3 e abs(py - oy) < 3 entao",
        "  pontos += 1",
        "  ox = aleatorio(1, 28)",
        "  oy = aleatorio(1, 28)",
        "  bip 660",
        "fim",
        'fundo "#111"',
        'retangulo ox, oy, 3, 3, "gold"',
        'retangulo px, py, 3, 3, "lime"',
        "mostrar pontos",
      ].join("\n"),
    }),
    t = add("disp", 20, 200, { n: 32 }),
    p = add("placar", 20, 520);
  W.push([c.id, h.id], [h.id, m.id], [h.id, t.id], [h.id, p.id]);
  wires();
  save();
  cm();
  toast("Aperte uma seta do controle");
}
