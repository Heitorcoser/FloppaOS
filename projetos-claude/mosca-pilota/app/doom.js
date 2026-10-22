// Modo Doom: labirinto com salas, demônios e tiro. Mesmo conectoma da pista, agora com
// duas "cores" de visão: paredes (claridade) e demônios (vermelho/movimento).
// Roda no navegador (window.MoscaDoom) e no Node (module.exports) para testes.
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.MoscaCore;
  const { rng, RAYS } = C;
  const R = RAYS.length, RANGE = 12; // alcance da visão em células

  // ---------- mapa: salas ligadas por corredores ----------
  function makeMap(level, seed) {
    const r = rng(seed), W = 30, H = 30, g = new Uint8Array(W * H).fill(1), rooms = [];
    const nRooms = Math.min(4 + Math.floor(level / 2), 9), larg = level <= 2 ? 2 : 1;
    for (let t = 0; t < 400 && rooms.length < nRooms; t++) {
      const w = 4 + Math.floor(r() * 4), h = 4 + Math.floor(r() * 4), x = 1 + Math.floor(r() * (W - w - 2)), y = 1 + Math.floor(r() * (H - h - 2));
      if (rooms.some(o => x < o.x + o.w + 1 && o.x < x + w + 1 && y < o.y + o.h + 1 && o.y < y + h + 1)) continue;
      rooms.push({ x, y, w, h, cx: x + w / 2, cy: y + h / 2 });
    }
    const cava = (x, y) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) g[y * W + x] = 0; };
    for (const o of rooms) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) cava(x, y);
    // cada sala liga na anterior com um corredor em L
    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1], b = rooms[i], ax = Math.floor(a.cx), ay = Math.floor(a.cy), bx = Math.floor(b.cx), by = Math.floor(b.cy);
      const hx = r() < 0.5;
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) for (let k = 0; k < larg; k++) cava(x, (hx ? ay : by) + k);
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) for (let k = 0; k < larg; k++) cava((hx ? bx : ax) + k, y);
    }
    // demônios: o primeiro na sala de largada (para ter o que ver logo), o resto espalhado
    const nE = Math.min(2 + level, 12), spawns = [];
    const s0 = rooms[0], h0 = r() * Math.PI * 2;
    for (let e = 0; e < nE; e++) {
      for (let t = 0; t < 50; t++) {
        const o = e == 0 ? s0 : rooms[1 + Math.floor(r() * (rooms.length - 1))];
        const x = o.x + 0.5 + r() * (o.w - 1), y = o.y + 0.5 + r() * (o.h - 1);
        if (e == 0 ? Math.hypot(x - s0.cx, y - s0.cy) > 1.8 : !spawns.some(s => Math.hypot(s.x - x, s.y - y) < 1.2)) { spawns.push({ x, y }); break; }
      }
    }
    return { level, seed, W, H, g, rooms, spawns, start: { x: s0.cx, y: s0.cy, h: h0 } };
  }
  const parede = (M, x, y) => { const gx = Math.floor(x), gy = Math.floor(y); return gx < 0 || gy < 0 || gx >= M.W || gy >= M.H || M.g[gy * M.W + gx] === 1; };
  // distância até a parede numa direção (DDA, exata)
  function raio(M, x, y, a, max) {
    const dx = Math.cos(a), dy = Math.sin(a);
    let mx = Math.floor(x), my = Math.floor(y);
    const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1, ddx = Math.abs(1 / dx), ddy = Math.abs(1 / dy);
    let tx = (dx < 0 ? x - mx : mx + 1 - x) * ddx, ty = (dy < 0 ? y - my : my + 1 - y) * ddy, d = 0, lado = 0;
    while (d < max) {
      if (tx < ty) { d = tx; tx += ddx; mx += sx; lado = 0; } else { d = ty; ty += ddy; my += sy; lado = 1; }
      if (mx < 0 || my < 0 || mx >= M.W || my >= M.H || M.g[my * M.W + mx] === 1) return { d: Math.min(d, max), lado, mx, my };
    }
    return { d: max, lado, mx, my };
  }
  const veLinha = (M, ax, ay, bx, by) => { const d = Math.hypot(bx - ax, by - ay); return raio(M, ax, ay, Math.atan2(by - ay, bx - ax), d + 0.01).d >= d - 0.05; };
  const angDif = a => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };

  // ---------- cérebro: mesmo conectoma, visão em dois canais e um gatilho ----------
  function prepara(brain) {
    if (brain.chan) return brain;
    const r = rng(11);
    brain.chan = new Int8Array(brain.N); // 0: claridade (paredes), 1: vermelho/movimento (demônios)
    for (let i = 0; i < brain.N; i++) if (brain.rayOf[i] >= 0) brain.chan[i] = r() < 0.5 ? 1 : 0;
    const F = brain.famNames.length, DF = brain.dnFamNames.length;
    brain.doomGenes = F + 2 * R + 3 * DF + 4 + 4 * R;
    return brain;
  }
  function controle(brain, g) {
    const F = brain.famNames.length, DF = brain.dnFamNames.length, ew = new Float32Array(brain.E);
    for (let e = 0; e < brain.E; e++) ew[e] = brain.w[e] * 3 * Math.tanh(g[brain.nFam[brain.pre[e]]]);
    let o = F; const fat = n => { const s = g.slice(o, o + n); o += n; return s; };
    const gW = fat(R).map(v => 2 * v), gE = fat(R).map(v => 2 * v), sW = fat(DF), tW = fat(DF), fW = fat(DF), b = fat(4), rSw = fat(R), rSe = fat(R), rT = fat(R), rF = fat(R);
    return { ew, gW, gE, sW, tW, fW, bS: b[0], bT: b[1], bF: b[2], gSpd: 2 * b[3], rSw, rSe, rT, rF, x: new Float32Array(brain.N), acc: new Float32Array(brain.N) };
  }
  function pensa(brain, c, par, dem, vel) {
    const { N, E, pre, post, rayOf, spdN, chan } = brain, x = c.x, acc = c.acc, ew = c.ew;
    for (let sub = 0; sub < 2; sub++) {
      acc.fill(0);
      for (let e = 0; e < E; e++) acc[post[e]] += ew[e] * x[pre[e]];
      for (let k = 0; k < spdN.length; k++) acc[spdN[k]] += c.gSpd * vel;
      for (let i = 0; i < N; i++) {
        let I = acc[i]; const ry = rayOf[i];
        if (ry >= 0) I += chan[i] ? c.gE[ry] * dem[ry] : c.gW[ry] * par[ry];
        x[i] = 0.5 * x[i] + 0.5 * Math.tanh(I);
      }
    }
    const DF = brain.dnFamNames.length, m = new Float32Array(DF * 2);
    for (let i = 0; i < N; i++) { const f = brain.dnFam[i]; if (f >= 0 && brain.lado[i] < 2) m[f * 2 + brain.lado[i]] += x[i]; }
    let s = c.bS, t = c.bT, f = c.bF;
    for (let k = 0; k < R; k++) { s += (c.rSw[k] * par[k] + c.rSe[k] * dem[k]) * 1.5; t += c.rT[k] * par[k] * 1.5; f += c.rF[k] * dem[k] * 1.5; }
    for (let q = 0; q < DF; q++) {
      const L = brain.dnCount[q * 2] ? m[q * 2] / brain.dnCount[q * 2] : 0, Rr = brain.dnCount[q * 2 + 1] ? m[q * 2 + 1] / brain.dnCount[q * 2 + 1] : 0;
      s += c.sW[q] * (Rr - L) * 4; t += c.tW[q] * (Rr + L) * 2; f += c.fW[q] * (Rr + L) * 2;
    }
    return { steer: Math.tanh(s), thrust: 1 / (1 + Math.exp(-t)), fire: 1 / (1 + Math.exp(-f)) };
  }

  // ---------- jogo ----------
  const DT = 1 / 30, VMAX = 3.2, TURN = 3.2, RAD = 0.25;
  function regras(level) {
    return {
      anda: level >= 2, persegue: level >= 3, atira: level >= 4,
      vel: level >= 3 ? Math.min(2.4, 0.9 + 0.15 * level) : 0.6,
      hp: level >= 3 ? 2 : 1, recarga: Math.max(1.2, 3 - 0.15 * level),
    };
  }
  function novoJogo(M) {
    const P = regras(M.level);
    return {
      x: M.start.x, y: M.start.y, h: M.start.h, v: 0, vida: 100, municao: M.spawns.length * 4 + 6, cd: 0,
      steer: 0, thrust: 0, fire: 0, flash: 0, mortes: 0, dano: 0, erros: 0, ferido: 0, t: 0, parado: 0,
      vivo: true, morto: false, limpou: false, visit: new Uint8Array(M.W * M.H), nVisit: 0,
      par: new Float32Array(R), dem: new Float32Array(R), dpar: new Float32Array(R),
      inim: M.spawns.map((s, i) => ({ x: s.x, y: s.y, hp: P.hp, cd: 1 + i * 0.3, h: i, viu: 0, dor: 0 })), bolas: [], P,
    };
  }
  function anda(M, o, dx, dy) {
    const nx = o.x + dx, ny = o.y + dy;
    if (!parede(M, nx + Math.sign(dx) * RAD, o.y)) o.x = nx;
    if (!parede(M, o.x, ny + Math.sign(dy) * RAD)) o.y = ny;
  }
  // o que a mosca vê: claridade da parede (perto = claro) e demônios/bolas de fogo em cada raio
  function enxerga(M, j) {
    for (let k = 0; k < R; k++) { const d = raio(M, j.x, j.y, j.h + RAYS[k], RANGE).d; j.dpar[k] = d; j.par[k] = 1 - d / RANGE; j.dem[k] = 0; }
    const ve = (ex, ey, raioAlvo, forca) => {
      const dx = ex - j.x, dy = ey - j.y, d = Math.hypot(dx, dy);
      if (d > RANGE) return;
      const a = angDif(Math.atan2(dy, dx) - j.h), w = Math.atan(raioAlvo / Math.max(d, 0.3)) + 0.07;
      for (let k = 0; k < R; k++) if (Math.abs(RAYS[k] - a) < w && d < j.dpar[k] + 0.3) j.dem[k] = Math.max(j.dem[k], forca * (0.45 + 0.55 * (1 - d / RANGE)));
    };
    for (const e of j.inim) if (e.hp > 0) ve(e.x, e.y, 0.35, 1);
    for (const b of j.bolas) ve(b.x, b.y, 0.15, 0.8);
  }
  function passo(M, j, o) {
    const P = j.P;
    j.steer += (o.steer - j.steer) * 0.35; j.thrust += (o.thrust - j.thrust) * 0.35; j.fire = o.fire;
    j.h += j.steer * TURN * DT;
    j.v += (j.thrust * VMAX - j.v) * 4 * DT;
    anda(M, j, Math.cos(j.h) * j.v * DT, Math.sin(j.h) * j.v * DT);
    j.t += DT; j.cd -= DT; j.flash = Math.max(0, j.flash - DT * 6); j.parado += DT;
    const cel = Math.floor(j.y) * M.W + Math.floor(j.x);
    if (!j.visit[cel]) { j.visit[cel] = 1; j.nVisit++; j.parado = 0; }
    // tiro: acerta o demônio mais perto na mira
    if (j.fire > 0.5 && j.cd <= 0 && j.municao > 0) {
      j.cd = 0.45; j.municao--; j.flash = 1; let alvo = null, ad = 1e9;
      for (const e of j.inim) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(e.x - j.x, e.y - j.y), a = Math.abs(angDif(Math.atan2(e.y - j.y, e.x - j.x) - j.h));
        if (a < Math.atan(0.42 / d) + 0.02 && d < ad && veLinha(M, j.x, j.y, e.x, e.y)) { alvo = e; ad = d; }
      }
      if (alvo) { alvo.hp--; alvo.dor = 0.3; j.dano++; j.parado = 0; if (alvo.hp <= 0) j.mortes++; } else j.erros++;
    }
    // demônios
    for (const e of j.inim) {
      if (e.hp <= 0) continue;
      e.dor = Math.max(0, e.dor - DT); e.cd -= DT;
      const dx = j.x - e.x, dy = j.y - e.y, d = Math.hypot(dx, dy);
      const vendo = d < 10 && veLinha(M, e.x, e.y, j.x, j.y);
      if (vendo) e.viu = 1;
      if (P.persegue && e.viu && d > 0.7 && !e.dor) anda(M, e, dx / d * P.vel * DT, dy / d * P.vel * DT);
      else if (P.anda && !e.viu) { e.h += (Math.sin(j.t * 1.3 + e.cd) * 2) * DT; anda(M, e, Math.cos(e.h) * P.vel * 0.5 * DT, Math.sin(e.h) * P.vel * 0.5 * DT); }
      if (P.persegue && d < 0.75) { j.vida -= 15 * DT; j.ferido += 15 * DT; }
      if (P.atira && vendo && d < 8 && e.cd <= 0) { e.cd = P.recarga; j.bolas.push({ x: e.x, y: e.y, vx: dx / d * 4.5, vy: dy / d * 4.5 }); }
    }
    for (const b of j.bolas) {
      b.x += b.vx * DT; b.y += b.vy * DT;
      if (Math.hypot(b.x - j.x, b.y - j.y) < 0.4) { b.fim = 1; j.vida -= 12; j.ferido += 12; }
      else if (parede(M, b.x, b.y)) b.fim = 1;
    }
    j.bolas = j.bolas.filter(b => !b.fim);
    if (j.vida <= 0) { j.vivo = false; j.morto = true; }
    else if (j.mortes == j.inim.length) { j.vivo = false; j.limpou = true; }
    else if (j.parado > 8) j.vivo = false; // parou de explorar e de acertar
  }

  // ---------- evolução (mesma receita da pista) ----------
  function DoomEvolution(brain, opts) {
    this.brain = prepara(brain);
    this.pop = (opts && opts.pop) || 24;
    this.r = rng((opts && opts.seed) || (Date.now() & 0xffffff));
    this.gen = 1; this.level = 1; this.history = []; this.seguidas = 0;
    this.genomes = [];
    for (let i = 0; i < this.pop; i++) this.genomes.push(this.randomGenome());
    this.startGen();
  }
  const D = DoomEvolution.prototype;
  D.randomGenome = function () { const g = new Float32Array(this.brain.doomGenes); for (let i = 0; i < g.length; i++) g[i] = this.r.n() * 0.8; return g; };
  D.startGen = function () {
    // mapa novo a cada geração: precisa aprender a caçar, não decorar o caminho
    this.map = makeMap(this.level, Math.floor(this.r() * 1e9));
    this.flies = this.genomes.map(g => Object.assign(novoJogo(this.map), { ctrl: controle(this.brain, g), genes: g }));
    this.time = 0; this.limit = 25 + 5 * this.map.spawns.length;
  };
  D.step = function () {
    let vivos = 0;
    for (const j of this.flies) {
      if (!j.vivo) continue;
      enxerga(this.map, j);
      passo(this.map, j, pensa(this.brain, j.ctrl, j.par, j.dem, j.v / VMAX));
      if (j.vivo) vivos++;
    }
    this.time += DT;
    if (!vivos || this.time > this.limit) { this.endGen(); return true; }
    return false;
  };
  D.fitness = function (j) {
    return j.mortes * 300 + j.dano * 60 + j.nVisit * 3 - j.erros * 4 - j.ferido * 1.5 - (j.morto ? 150 : 0) +
      (j.limpou ? 800 + Math.max(0, this.limit - j.t) * 15 : 0);
  };
  D.endGen = function () {
    const sc = this.flies.map(j => ({ g: j.genes, s: this.fitness(j), m: j.mortes, n: j.inim.length, ok: j.limpou })).sort((a, b) => b.s - a.s);
    const limpou = this.flies.filter(j => j.limpou).length;
    this.history.push({ gen: this.gen, level: this.level, best: sc[0].m / sc[0].n, done: limpou });
    if (this.history.length > 200) this.history.shift();
    const next = [sc[0].g, sc[1].g, sc[2].g].map(g => Float32Array.from(g));
    const pick = () => { let b = null; for (let k = 0; k < 3; k++) { const c = sc[Math.floor(this.r() * Math.ceil(this.pop * 0.5))]; if (!b || c.s > b.s) b = c; } return b.g; };
    while (next.length < this.pop) {
      const a = pick(), b = pick(), g = new Float32Array(a.length), sigma = this.r() < 0.2 ? 0.6 : 0.2;
      for (let i = 0; i < g.length; i++) { g[i] = this.r() < 0.5 ? a[i] : b[i]; if (this.r() < 0.12) g[i] += this.r.n() * sigma; }
      next.push(g);
    }
    if (this.r() < 0.3) next[next.length - 1] = this.randomGenome();
    this.genomes = next;
    this.lastResult = { gen: this.gen, best: sc[0].m / sc[0].n, kills: sc[0].m, total: sc[0].n, finished: limpou, level: this.level };
    this.gen++;
    // sobe de nível limpando o mapa em 2 gerações seguidas (mapas diferentes)
    this.seguidas = limpou ? this.seguidas + 1 : 0;
    this.lastResult.quase = this.seguidas == 1;
    if (this.seguidas >= 2) { this.seguidas = 0; this.level++; this.lastResult.levelUp = true; }
    this.startGen();
  };
  D.melhor = function () { return this.genomes[0]; };
  D.save = function () {
    return JSON.stringify({ v: 1, gen: this.gen, level: this.level, history: this.history, genomes: this.genomes.map(g => Array.from(g, v => Math.round(v * 1000) / 1000)) });
  };
  D.load = function (s) {
    const d = JSON.parse(s);
    if (d.v !== 1 || !d.genomes || d.genomes[0].length !== this.brain.doomGenes) return false;
    this.gen = d.gen; this.level = d.level; this.history = d.history || []; this.pop = d.genomes.length;
    this.genomes = d.genomes.map(g => Float32Array.from(g)); this.startGen();
    return true;
  };

  const api = { makeMap, raio, parede, angDif, prepara, controle, pensa, enxerga, passo, novoJogo, DoomEvolution, RANGE, VMAX, DT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MoscaDoom = api;
})(typeof self !== 'undefined' ? self : this);
