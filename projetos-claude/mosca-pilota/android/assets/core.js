// Núcleo da simulação: cérebro do conectoma, pista aleatória, física da mosca e evolução.
// Roda no navegador (window.MoscaCore) e no Node (module.exports) para testes.
(function (root) {
  'use strict';

  // ---------- aleatório com semente ----------
  function rng(seed) {
    let s = seed >>> 0 || 1;
    const f = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    f.n = () => { let u = 0, v = 0; while (!u) u = f(); while (!v) v = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    return f;
  }

  // ---------- cérebro ----------
  const RAYS = [-80, -60, -45, -33, -23, -15, -8, 0, 8, 15, 23, 33, 45, 60, 80].map(d => d * Math.PI / 180);
  const MEIO = (RAYS.length - 1) / 2; // raio da frente: os dois olhos veem
  const RAY_RANGE = 130;

  function buildBrain(B) {
    const N = B.ids.length, E = B.pre.length;
    const fam = t => (t.match(/^[A-Za-z]+/) || ['x'])[0];
    // famílias de tipo dos neurônios pré-sinápticos (ganho evoluído = sinal e força)
    const famNames = [], famIdx = new Map(), nFam = new Int16Array(N);
    for (let i = 0; i < N; i++) {
      const f = fam(B.tipos[B.tipo[i]]);
      if (!famIdx.has(f)) { famIdx.set(f, famNames.length); famNames.push(f); }
      nFam[i] = famIdx.get(f);
    }
    // famílias de DN para a leitura motora
    const dnFamNames = [], dnFamIdx = new Map(), dnFam = new Int16Array(N).fill(-1);
    for (let i = 0; i < N; i++) if (B.papel[i] === 2) {
      const t = B.tipos[B.tipo[i]], f = (t.match(/^DN[a-z]+/) || ['DN'])[0];
      if (!dnFamIdx.has(f)) { dnFamIdx.set(f, dnFamNames.length); dnFamNames.push(f); }
      dnFam[i] = dnFamIdx.get(f);
    }
    const dnCount = new Float32Array(dnFamNames.length * 2);
    for (let i = 0; i < N; i++) if (dnFam[i] >= 0 && B.lado[i] < 2) dnCount[dnFam[i] * 2 + B.lado[i]]++;
    // olhos: neurônios visuais do lado esquerdo recebem os raios da esquerda, e o direito, os da direita
    const r = rng(7), rayOf = new Int8Array(N).fill(-1);
    for (let i = 0; i < N; i++) if (B.papel[i] === 1 && B.lado[i] < 2) {
      const k = Math.floor(r() * (MEIO + 1));      // posição dentro de cada olho
      rayOf[i] = B.lado[i] === 0 ? k : MEIO + k;   // olho esquerdo: raios 0..MEIO, direito: MEIO..fim
    }
    const spdN = [];
    for (let i = 0; i < N; i++) if (B.papel[i] === 0 && r() < 0.12) spdN.push(i);
    const pre = Int32Array.from(B.pre), post = Int32Array.from(B.post), w = Float32Array.from(B.w);
    // + reflexo visual direto: um peso por raio para a curva e outro para a velocidade
    const nGenes = famNames.length + RAYS.length + dnFamNames.length * 2 + 3 + RAYS.length * 2;
    return { N, E, pre, post, w, nFam, famNames, dnFam, dnFamNames, dnCount, rayOf, spdN: Int32Array.from(spdN), lado: Int8Array.from(B.lado), papel: Int8Array.from(B.papel), nGenes, raw: B };
  }

  // decodifica o genoma em ganhos por sinapse (pré-calculados por indivíduo)
  function makeController(brain, genes) {
    const F = brain.famNames.length, R = RAYS.length, DF = brain.dnFamNames.length;
    const ew = new Float32Array(brain.E);
    for (let e = 0; e < brain.E; e++) ew[e] = brain.w[e] * 3 * Math.tanh(genes[brain.nFam[brain.pre[e]]]);
    return {
      ew, gin: genes.slice(F, F + R).map(g => 2 * g),
      steerW: genes.slice(F + R, F + R + DF), thrW: genes.slice(F + R + DF, F + R + 2 * DF),
      bS: genes[F + R + 2 * DF], bT: genes[F + R + 2 * DF + 1], gSpd: 2 * genes[F + R + 2 * DF + 2],
      rS: genes.slice(F + R + 2 * DF + 3, F + 2 * R + 2 * DF + 3), rT: genes.slice(F + 2 * R + 2 * DF + 3, F + 3 * R + 2 * DF + 3),
      x: new Float32Array(brain.N), acc: new Float32Array(brain.N),
    };
  }

  function think(brain, c, sens, vel) {
    const { N, E, pre, post, rayOf, spdN } = brain, x = c.x, acc = c.acc, ew = c.ew;
    for (let sub = 0; sub < 2; sub++) {
      acc.fill(0);
      for (let e = 0; e < E; e++) acc[post[e]] += ew[e] * x[pre[e]];
      for (let k = 0; k < spdN.length; k++) acc[spdN[k]] += c.gSpd * vel; // sente a própria velocidade
      for (let i = 0; i < N; i++) {
        let I = acc[i];
        const ry = rayOf[i];
        if (ry >= 0) I += c.gin[ry] * sens[ry];
        x[i] = 0.5 * x[i] + 0.5 * Math.tanh(I);
      }
    }
    // leitura dos neurônios descendentes por família e lado
    const DF = brain.dnFamNames.length, m = new Float32Array(DF * 2);
    for (let i = 0; i < N; i++) { const f = brain.dnFam[i]; if (f >= 0 && brain.lado[i] < 2) m[f * 2 + brain.lado[i]] += x[i]; }
    let s = c.bS, t = c.bT;
    // reflexo visual direto (como a fibra gigante da mosca, que liga o olho direto aos músculos)
    for (let k = 0; k < sens.length; k++) { s += c.rS[k] * sens[k] * 1.5; t += c.rT[k] * sens[k] * 1.5; }
    for (let f = 0; f < DF; f++) {
      const L = brain.dnCount[f * 2] ? m[f * 2] / brain.dnCount[f * 2] : 0, Rr = brain.dnCount[f * 2 + 1] ? m[f * 2 + 1] / brain.dnCount[f * 2 + 1] : 0;
      s += c.steerW[f] * (Rr - L) * 4; t += c.thrW[f] * (Rr + L) * 2;
    }
    return { steer: Math.tanh(s), thrust: 1 / (1 + Math.exp(-t)) };
  }

  // ---------- pista aleatória ----------
  const CELL = 2;
  function makeTrack(level, seed, opt = {}) {
    const r = rng(seed);
    const width = Math.max(24, 74 - 4.5 * (level - 1));
    const nSeg = 16 + 4 * level, segLen = 34;
    const maxTurn = opt.reta ? 0 : Math.min(0.22 + 0.06 * level, 0.95);
    let pts;
    for (let attempt = 0; attempt < 80; attempt++) {
      pts = [[0, 0]]; let h = -Math.PI / 2, k = 0, ok = true;
      for (let i = 1; i <= nSeg && ok; i++) {
        if (i > 2) k = 0.55 * k + (r() * 2 - 1) * maxTurn * (attempt > 40 ? 0.6 : 1);
        h += k;
        const p = pts[i - 1]; const q = [p[0] + Math.cos(h) * segLen, p[1] + Math.sin(h) * segLen];
        for (let j = 0; j < i - 3; j++) { const d = Math.hypot(q[0] - pts[j][0], q[1] - pts[j][1]); if (d < width * 1.6 + 8) { ok = false; break; } }
        pts.push(q);
      }
      if (ok) break;
    }
    // subdivide a linha central para progresso suave
    const c = [];
    for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < 4; s++) { const a = pts[i], b = pts[i + 1], t = s / 4; c.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    c.push(pts[pts.length - 1]);
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const p of c) { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); }
    const pad = width + 20; minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const gw = Math.ceil((maxX - minX) / CELL), gh = Math.ceil((maxY - minY) / CELL), grid = new Uint8Array(gw * gh);
    const hw = width / 2;
    for (let i = 0; i < c.length - 1; i++) {
      const a = c[i], b = c[i + 1];
      const x0 = Math.floor((Math.min(a[0], b[0]) - hw - minX) / CELL), x1 = Math.ceil((Math.max(a[0], b[0]) + hw - minX) / CELL);
      const y0 = Math.floor((Math.min(a[1], b[1]) - hw - minY) / CELL), y1 = Math.ceil((Math.max(a[1], b[1]) + hw - minY) / CELL);
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      for (let gy = Math.max(0, y0); gy < Math.min(gh, y1); gy++) for (let gx = Math.max(0, x0); gx < Math.min(gw, x1); gx++) {
        const px = minX + (gx + .5) * CELL, py = minY + (gy + .5) * CELL;
        let t = ((px - a[0]) * dx + (py - a[1]) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        if (Math.hypot(px - a[0] - dx * t, py - a[1] - dy * t) <= hw) grid[gy * gw + gx] = 1;
      }
    }
    // parede atrás da largada
    const st = c[0], d0 = [c[1][0] - st[0], c[1][1] - st[1]], dl = Math.hypot(d0[0], d0[1]);
    const ux = d0[0] / dl, uy = d0[1] / dl;
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      const px = minX + (gx + .5) * CELL - st[0], py = minY + (gy + .5) * CELL - st[1];
      if (px * ux + py * uy < -6 && Math.hypot(px, py) < width * 1.5) grid[gy * gw + gx] = 0;
    }
    const segL = [];
    let total = 0; for (let i = 0; i < c.length - 1; i++) { segL.push(total); total += Math.hypot(c[i + 1][0] - c[i][0], c[i + 1][1] - c[i][1]); }
    segL.push(total);
    const T = { level, seed, width, c, obs: [], base: grid, grid, gw, gh, minX, minY, total, segL, startH: Math.atan2(uy, ux) };
    placeObs(T, seed + 1, opt.obs);
    return T;
  }
  // Obstáculos (a partir do nível 3). Dá para sortear de novo na mesma pista, assim a mosca
  // precisa aprender a desviar em vez de decorar onde eles ficam.
  function placeObs(T, seed, lista) {
    const r = rng(seed), c = T.c, hw = T.width / 2, level = T.level;
    T.grid = T.base.slice(); T.obs = [];
    const pedidos = lista || [];
    const nObs = lista ? lista.length : level >= 3 ? Math.min(40, (level - 2) * 2) : 0;
    for (let o = 0; o < nObs; o++) {
      const p = pedidos[o];
      const i = p ? Math.floor(p.s * (c.length - 2)) : 8 + Math.floor(r() * (c.length - 14)), a = c[i], b = c[i + 1];
      const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty), nx = -ty / tl, ny = tx / tl;
      const rad = p ? p.r : 4 + r() * 3 + Math.min(4, level * 0.3), off = (p ? p.off : r() * 2 - 1) * Math.max(0, hw - rad - 9);
      const ox = a[0] + nx * off, oy = a[1] + ny * off;
      if (!p && T.obs.some(q => Math.hypot(q.x - ox, q.y - oy) < q.r + rad + 14)) continue;
      T.obs.push({ x: ox, y: oy, r: rad });
      for (let gy = Math.floor((oy - rad - T.minY) / CELL); gy <= Math.ceil((oy + rad - T.minY) / CELL); gy++) for (let gx = Math.floor((ox - rad - T.minX) / CELL); gx <= Math.ceil((ox + rad - T.minX) / CELL); gx++) {
        if (gx < 0 || gy < 0 || gx >= T.gw || gy >= T.gh) continue;
        if (Math.hypot(T.minX + (gx + .5) * CELL - ox, T.minY + (gy + .5) * CELL - oy) <= rad) T.grid[gy * T.gw + gx] = 0;
      }
    }
  }
  const free = (T, x, y) => { const gx = ((x - T.minX) / CELL) | 0, gy = ((y - T.minY) / CELL) | 0; return gx >= 0 && gy >= 0 && gx < T.gw && gy < T.gh && T.grid[gy * T.gw + gx] === 1; };

  function sense(T, f, out) {
    for (let k = 0; k < RAYS.length; k++) {
      const a = f.h + RAYS[k], ca = Math.cos(a), sa = Math.sin(a);
      let d = 0;
      while (d < RAY_RANGE && free(T, f.x + ca * d, f.y + sa * d)) d += 3;
      out[k] = 1 - Math.min(d, RAY_RANGE) / RAY_RANGE;
      f.ray[k] = Math.min(d, RAY_RANGE);
    }
    return out;
  }

  function progressOf(T, f) {
    let best = f.seg, bd = 1e9;
    for (let i = Math.max(0, f.seg - 3); i < Math.min(T.c.length - 1, f.seg + 6); i++) {
      const a = T.c[i], b = T.c[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      let t = ((f.x - a[0]) * dx + (f.y - a[1]) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const d = Math.hypot(f.x - a[0] - dx * t, f.y - a[1] - dy * t);
      if (d < bd) { bd = d; best = i; f._t = t; }
    }
    f.seg = best;
    return T.segL[best] + (T.segL[best + 1] - T.segL[best]) * f._t;
  }

  // ---------- população ----------
  const DT = 1 / 30, VMAX = 70, TURN = 3.2;
  function newFly(T) { return { x: T.c[0][0], y: T.c[0][1], h: T.startH, v: 10, alive: true, done: false, seg: 0, _t: 0, prog: 0, bestProg: 0, stall: 0, t: 0, ray: new Float32Array(RAYS.length), steer: 0, thrust: 0, wing: Math.random() * 6 }; }

  function Evolution(brain, opts) {
    this.brain = brain;
    this.pop = (opts && opts.pop) || 24;
    this.r = rng((opts && opts.seed) || (Date.now() & 0xffffff));
    this.gen = 1; this.level = 1; this.bestEver = 0; this.history = [];
    this.genomes = [];
    for (let i = 0; i < this.pop; i++) this.genomes.push(this.randomGenome());
    this.newTrack();
  }
  Evolution.prototype.randomGenome = function () { const g = new Float32Array(this.brain.nGenes); for (let i = 0; i < g.length; i++) g[i] = this.r.n() * 0.8; return g; };
  Evolution.prototype.newTrack = function () { this.track = makeTrack(this.level, Math.floor(this.r() * 1e9)); this.startGen(); };
  Evolution.prototype.startGen = function () {
    // obstáculos em lugares novos a cada geração: obriga a aprender a desviar, não a decorar
    if (this.track.level >= 3 && !this.fixa) { placeObs(this.track, Math.floor(this.r() * 1e9)); this.obsMudou = true; }
    this.flies = this.genomes.map(g => Object.assign(newFly(this.track), { ctrl: makeController(this.brain, g), genes: g }));
    this.time = 0; this.limit = 8 + this.track.total / (VMAX * 0.35); this.finished = 0; this.sens = new Float32Array(RAYS.length);
  };
  Evolution.prototype.step = function () {
    const T = this.track; let alive = 0;
    for (const f of this.flies) {
      if (!f.alive) continue;
      sense(T, f, this.sens);
      const o = think(this.brain, f.ctrl, this.sens, f.v / VMAX);
      // músculos não mudam de uma vez: suaviza os comandos (evita ficar tremendo)
      f.steer += (o.steer - f.steer) * 0.35; f.thrust += (o.thrust - f.thrust) * 0.35;
      f.h += f.steer * TURN * DT;
      f.v += ((0.3 + 0.7 * f.thrust) * VMAX - f.v) * 2.5 * DT; // mosca não fica parada no ar: mínimo de 30% da velocidade
      f.x += Math.cos(f.h) * f.v * DT; f.y += Math.sin(f.h) * f.v * DT; f.t += DT; f.wing += DT * 60;
      if (!free(T, f.x, f.y)) { f.alive = false; continue; }
      f.prog = progressOf(T, f);
      if (f.prog > f.bestProg + 0.5) { f.bestProg = f.prog; f.stall = 0; } else if ((f.stall += DT) > 2.5) { f.alive = false; continue; }
      if (f.seg >= T.c.length - 2 && f._t > 0.9) { f.alive = false; f.done = true; f.bestProg = T.total; this.finished++; continue; }
      alive++;
    }
    this.time += DT;
    if (!alive || this.time > this.limit) { this.endGen(); return true; }
    return false;
  };
  Evolution.prototype.fitness = function (f) { return f.bestProg + (f.done ? 400 + Math.max(0, this.limit - f.t) * 20 : 0); };
  Evolution.prototype.endGen = function () {
    const scored = this.flies.map(f => ({ g: f.genes, s: this.fitness(f), p: f.bestProg / this.track.total, done: f.done })).sort((a, b) => b.s - a.s);
    const bestP = scored[0].p;
    this.history.push({ gen: this.gen, level: this.level, best: bestP, done: this.finished });
    if (this.history.length > 200) this.history.shift();
    const next = [scored[0].g, scored[1].g, scored[2].g].map(g => Float32Array.from(g));
    const pick = () => { let b = null; for (let k = 0; k < 3; k++) { const c = scored[Math.floor(this.r() * Math.ceil(this.pop * 0.5))]; if (!b || c.s > b.s) b = c; } return b.g; };
    while (next.length < this.pop) {
      const a = pick(), b = pick(), g = new Float32Array(a.length);
      const sigma = this.r() < 0.2 ? 0.6 : 0.2;
      for (let i = 0; i < g.length; i++) { g[i] = this.r() < 0.5 ? a[i] : b[i]; if (this.r() < 0.12) g[i] += this.r.n() * sigma; }
      next.push(g);
    }
    if (this.r() < 0.3) next[next.length - 1] = this.randomGenome(); // sangue novo
    this.genomes = next;
    this.lastResult = { gen: this.gen, best: bestP, finished: this.finished, level: this.level };
    this.gen++;
    // só sobe de nível chegando ao fim em 2 gerações seguidas (obstáculos em lugares diferentes): sem sorte
    this.seguidas = this.finished > 0 ? (this.seguidas || 0) + 1 : 0;
    this.lastResult.quase = this.seguidas == 1 && this.track.level >= 3;
    if (this.seguidas >= (this.track.level >= 3 ? 2 : 1)) { this.seguidas = 0; this.level++; this.newTrack(); this.lastResult.levelUp = true; }
    else this.startGen();
  };
  Evolution.prototype.save = function () {
    return JSON.stringify({ v: 1, gen: this.gen, level: this.level, pop: this.pop, history: this.history, trackSeed: this.track.seed, genomes: this.genomes.map(g => Array.from(g, v => Math.round(v * 1000) / 1000)) });
  };
  Evolution.prototype.load = function (s) {
    const d = JSON.parse(s);
    if (d.v !== 1 || !d.genomes || d.genomes[0].length !== this.brain.nGenes) return false;
    this.gen = d.gen; this.level = d.level; this.history = d.history || []; this.pop = d.genomes.length;
    this.genomes = d.genomes.map(g => Float32Array.from(g));
    this.track = makeTrack(this.level, d.trackSeed); this.startGen();
    return true;
  };

  const api = { rng, buildBrain, makeTrack, placeObs, Evolution, RAYS, RAY_RANGE, CELL, free, VMAX };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MoscaCore = api;
})(typeof self !== 'undefined' ? self : this);
