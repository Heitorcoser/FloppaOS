// Desenho do modo Doom: visão em primeira pessoa da mosca líder (raycasting em baixa resolução,
// estilo anos 90), demônios, bolas de fogo, arma, HUD e minimapa.
(function (root) {
  'use strict';
  const Dm = root.MoscaDoom, RAYS = root.MoscaCore.RAYS;
  // a altura da imagem acompanha o formato da tela (celular em pé mostra mais chão e teto)
  const LW = 200, FOV = Math.PI / 2, TF = Math.tan(FOV / 2), F = LW / 2 / TF;
  let LH = 0, img, px;
  const low = document.createElement('canvas'), lx = low.getContext('2d'), zb = new Float32Array(LW);
  function tamanho(h) {
    h = Math.max(110, Math.min(300, Math.round(h)));
    if (h === LH) return;
    LH = low.height = h; low.width = LW; img = lx.createImageData(LW, LH); px = new Uint32Array(img.data.buffer);
  }
  const cor = (r, g, b) => (255 << 24) | (b << 16) | (g << 8) | r;

  // sprite do demônio (desenhado uma vez, com formas simples)
  function fazImp(dor) {
    const c = document.createElement('canvas'); c.width = 32; c.height = 44; const x = c.getContext('2d');
    x.fillStyle = dor ? '#e8d0b0' : '#7a4a2a';
    x.beginPath(); x.ellipse(16, 26, 10, 13, 0, 0, 7); x.fill();            // corpo
    x.beginPath(); x.ellipse(16, 11, 7, 7, 0, 0, 7); x.fill();               // cabeça
    x.fillStyle = dor ? '#fff' : '#5a3218';
    x.fillRect(4, 20, 5, 14); x.fillRect(23, 20, 5, 14);                     // braços
    x.fillRect(9, 36, 5, 8); x.fillRect(18, 36, 5, 8);                       // pernas
    x.fillStyle = '#d9c9a3'; x.beginPath(); x.moveTo(10, 7); x.lineTo(7, 0); x.lineTo(12, 5); x.moveTo(22, 7); x.lineTo(25, 0); x.lineTo(20, 5); x.fill(); // chifres
    x.fillStyle = '#ff2a1a'; x.fillRect(12, 9, 3, 3); x.fillRect(18, 9, 3, 3); // olhos
    x.fillStyle = '#2a0d05'; x.fillRect(13, 15, 7, 2);                       // boca
    return c;
  }
  const IMP = fazImp(0), IMPD = fazImp(1);
  const CORPO = (() => { const c = document.createElement('canvas'); c.width = 32; c.height = 10; const x = c.getContext('2d'); x.fillStyle = '#6a1a0e'; x.beginPath(); x.ellipse(16, 6, 15, 4, 0, 0, 7); x.fill(); x.fillStyle = '#7a4a2a'; x.beginPath(); x.ellipse(13, 5, 7, 3, 0, 0, 7); x.fill(); return c; })();

  function primeiraPessoa(M, j) {
    const half = LH / 2;
    // teto e chão com escurecimento pela distância
    for (let y = 0; y < LH; y++) {
      const k = Math.min(1, Math.abs(y - half) / F * 1.6), s = 0.12 + 0.6 * k;
      const c = y < half ? cor(28 * s | 0, 22 * s | 0, 20 * s | 0) : cor(70 * s | 0, 62 * s | 0, 52 * s | 0);
      px.fill(c, y * LW, (y + 1) * LW);
    }
    for (let x = 0; x < LW; x++) {
      const da = Math.atan((x / (LW - 1) - 0.5) * 2 * TF), a = j.h + da, r = Dm.raio(M, j.x, j.y, a, 30);
      const d = Math.max(0.05, r.d * Math.cos(da)); zb[x] = d;
      const hx = j.x + Math.cos(a) * r.d, hy = j.y + Math.sin(a) * r.d, u = r.lado ? hx - Math.floor(hx) : hy - Math.floor(hy);
      const alt = Math.min(LH * 4, F / d * 1.3), y0 = Math.max(0, (half - alt / 2) | 0), y1 = Math.min(LH - 1, (half + alt / 2) | 0);
      const luz = Math.min(1, 1.25 / (1 + d * 0.28)) * (r.lado ? 0.78 : 1), cu = (u * 4) % 1 < 0.08;
      for (let y = y0; y <= y1; y++) {
        const v = (y - (half - alt / 2)) / alt, cv = (v * 3) % 1 < 0.06; // painéis metálicos
        let R = 120, G = 104, B = 86;
        if (cu || cv) { R = 52; G = 44; B = 36; } else if (((u * 4) | 0) % 2 == ((v * 3) | 0) % 2) { R = 104; G = 90; B = 76; }
        px[y * LW + x] = cor(R * luz | 0, G * luz | 0, B * luz | 0);
      }
    }
    lx.putImageData(img, 0, 0);
    // demônios, corpos e bolas de fogo, do mais longe para o mais perto
    const S = [];
    for (const e of j.inim) S.push({ x: e.x, y: e.y, t: e.hp > 0 ? (e.dor > 0 ? IMPD : IMP) : CORPO, h: e.hp > 0 ? 1.1 : 0.25, w: e.hp > 0 ? 0.8 : 0.9, chao: e.hp <= 0 });
    for (const b of j.bolas) S.push({ x: b.x, y: b.y, bola: 1, h: 0.25, w: 0.25 });
    for (const s of S) { const dx = s.x - j.x, dy = s.y - j.y; s.d = dx * Math.cos(j.h) + dy * Math.sin(j.h); s.a = Dm.angDif(Math.atan2(dy, dx) - j.h); }
    S.sort((a, b) => b.d - a.d);
    for (const s of S) {
      if (s.d < 0.2 || Math.abs(s.a) > FOV * 0.75) continue;
      const cx = (0.5 + Math.tan(s.a) / (2 * TF)) * LW, sh = F / s.d * s.h, sw = F / s.d * s.w, base = LH / 2 + F / s.d * 0.65;
      const x0 = Math.round(cx - sw / 2), x1 = Math.round(cx + sw / 2);
      for (let x = Math.max(0, x0); x < Math.min(LW, x1); x++) {
        if (zb[x] < s.d) continue;
        if (s.bola) { const k = (x - x0) / (x1 - x0) - 0.5, hh = Math.sqrt(Math.max(0, 0.25 - k * k)) * sw; lx.fillStyle = '#ffb21a'; lx.fillRect(x, LH / 2 - hh, 1, hh * 2); lx.fillStyle = '#fff3b0'; lx.fillRect(x, LH / 2 - hh * 0.4, 1, hh * 0.8); continue; }
        const sx = ((x - x0) / (x1 - x0)) * s.t.width;
        lx.drawImage(s.t, sx, 0, 1, s.t.height, x, base - sh, 1, sh);
      }
    }
    // arma e clarão do tiro
    const gx = LW / 2, gy = LH;
    if (j.flash > 0.3) { lx.fillStyle = 'rgba(255,220,120,.9)'; lx.beginPath(); lx.ellipse(gx, gy - 34, 10, 8, 0, 0, 7); lx.fill(); }
    lx.fillStyle = '#2b2b2b'; lx.fillRect(gx - 5, gy - 30 + j.flash * 4, 10, 30);
    lx.fillStyle = '#4a4a4a'; lx.fillRect(gx - 3, gy - 30 + j.flash * 4, 2, 30);
    lx.fillStyle = '#6b4a2a'; lx.fillRect(gx - 9, gy - 12 + j.flash * 4, 18, 12);
    // dor: tela vermelha
    if (j.vida < 100) { lx.fillStyle = `rgba(255,0,0,${Math.max(0, 0.35 - j.vida / 300)})`; lx.fillRect(0, 0, LW, LH); }
  }

  function minimapa(x, M, j, flies, X, Y, T) {
    const c = T / M.W;
    x.save(); x.globalAlpha = 0.85; x.fillStyle = '#0b0d09'; x.fillRect(X, Y, T, T); x.globalAlpha = 1;
    x.fillStyle = '#4a4232';
    for (let gy = 0; gy < M.H; gy++) for (let gx = 0; gx < M.W; gx++) if (!M.g[gy * M.W + gx]) x.fillRect(X + gx * c, Y + gy * c, c + 0.5, c + 0.5);
    for (const f of flies) if (f.vivo && f !== j) { x.fillStyle = 'rgba(210,235,255,.35)'; x.fillRect(X + f.x * c - 1, Y + f.y * c - 1, 2, 2); }
    for (const e of j.inim) { x.fillStyle = e.hp > 0 ? '#ff3b2f' : '#5a1a10'; x.fillRect(X + e.x * c - 1.5, Y + e.y * c - 1.5, 3, 3); }
    x.strokeStyle = 'rgba(79,209,255,.5)'; x.lineWidth = 1;
    RAYS.forEach((a, k) => { const d = j.dpar[k]; x.beginPath(); x.moveTo(X + j.x * c, Y + j.y * c); x.lineTo(X + (j.x + Math.cos(j.h + a) * d) * c, Y + (j.y + Math.sin(j.h + a) * d) * c); x.stroke(); });
    x.fillStyle = '#ffb000'; x.beginPath(); x.arc(X + j.x * c, Y + j.y * c, 2.5, 0, 7); x.fill();
    x.strokeStyle = '#2b3424'; x.strokeRect(X + .5, Y + .5, T - 1, T - 1); x.restore();
  }

  // o que a mosca "sente" em cada raio: claridade (parede) e vermelho (demônio)
  function olhos(x, par, dem, X, Y, Wd, Hd) {
    const n = par.length, bw = Wd / n;
    x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(X, Y, Wd, Hd);
    for (let k = 0; k < n; k++) {
      x.fillStyle = `rgba(216,206,178,${0.15 + 0.8 * par[k]})`; x.fillRect(X + k * bw + 1, Y + Hd / 2, bw - 2, Hd / 2 - 1);
      x.fillStyle = `rgba(255,59,47,${0.1 + 0.9 * dem[k]})`; x.fillRect(X + k * bw + 1, Y + 1, bw - 2, Hd / 2 - 2);
    }
  }

  function draw(x, W, H, M, j, flies, info) {
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    const hud = 34;
    tamanho(LW * (H - hud) / W);
    primeiraPessoa(M, j);
    // mantém a proporção da visão e deixa espaço para o HUD
    const s = Math.min(W / LW, (H - hud) / LH), vw = LW * s, vh = LH * s, ox = (W - vw) / 2, oy = (H - hud - vh) / 2;
    x.imageSmoothingEnabled = false; x.drawImage(low, ox, oy, vw, vh); x.imageSmoothingEnabled = true;
    // HUD estilo Doom
    x.fillStyle = '#1a1210'; x.fillRect(0, H - hud, W, hud);
    x.font = '900 11px ui-rounded,system-ui,sans-serif'; x.textBaseline = 'top'; x.textAlign = 'left';
    const campo = (t, v, X) => { x.fillStyle = '#9aa38c'; x.fillText(t, X, H - hud + 4); x.fillStyle = '#ff3b2f'; x.font = '900 15px ui-monospace,monospace'; x.fillText(v, X, H - hud + 16); x.font = '900 11px ui-rounded,system-ui,sans-serif'; };
    campo('VIDA', Math.max(0, Math.round(j.vida)) + '%', 10);
    campo('DEMÔNIOS', j.mortes + '/' + j.inim.length, W * 0.3);
    campo('MUNIÇÃO', j.municao, W * 0.58);
    campo('TEMPO', Math.max(0, Math.ceil(info.limite - info.tempo)) + 's', W * 0.8);
    const T = Math.min(W, H) * 0.3;
    minimapa(x, M, j, flies, W - T - 8, 8, T);
    olhos(x, j.par, j.dem, 8, 8, Math.min(150, W * 0.4), 26);
    x.fillStyle = '#9aa38c'; x.font = '800 9px ui-rounded,system-ui,sans-serif'; x.fillText('O QUE A MOSCA VÊ', 8, 37);
  }

  root.MoscaDoomView = { draw, olhos };
})(typeof self !== 'undefined' ? self : this);
