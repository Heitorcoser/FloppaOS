// Doom 64 de verdade: o emulador (EmulatorJS, núcleo de N64) roda a ROM do jogador.
// A mosca vê a tela em 15 faixas, como os raios do modo Doom, e aperta o controle.
// Ela não aprende aqui (o jogo roda em tempo real, lento demais para evoluir): usa o
// cérebro treinado no modo Doom.
(function (root) {
  'use strict';
  const RAYS = root.MoscaCore.RAYS, R = RAYS.length, Dm = root.MoscaDoom;
  const CDN = 'https://cdn.emulatorjs.org/stable/data/';
  // botões do RetroPad no EmulatorJS (núcleo mupen64plus): B = A do N64, Y = B do N64, L2 = Z
  const BT = { A: 0, B: 1, START: 3, Z: 12, DIR: 16, ESQ: 17, FRENTE: 19, TRAS: 18 };
  const S = { pronto: false, joga: false, h: 0, prev: null, gB: 40, gM: 6, par: new Float32Array(R), dem: new Float32Array(R), steer: 0, thrust: 0, fire: 0, ctrl: null, usoT: 0, parado: 0 };
  const am = document.createElement('canvas'); am.width = 64; am.height = 40;
  const ax = am.getContext('2d', { willReadFrequently: true });

  // para ler a tela do WebGL depois de desenhada
  let patch = false;
  function preserva() {
    if (patch) return; patch = true;
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, o) { if (/webgl/.test(t)) o = Object.assign({}, o, { preserveDrawingBuffer: true }); return gc.call(this, t, o); };
  }
  function carrega(seletor, arquivo, aoComecar, aoErro) {
    if (S.carregou) return location.reload(); // o EmulatorJS só inicia uma vez por página
    S.carregou = true; preserva();
    Object.assign(root, {
      EJS_player: seletor, EJS_core: 'n64', EJS_gameName: arquivo.name.replace(/\.\w+$/, ''),
      EJS_gameUrl: URL.createObjectURL(arquivo) + '#/' + encodeURIComponent(arquivo.name),
      EJS_pathtodata: CDN, EJS_startOnLoaded: true, EJS_threads: false, EJS_language: 'pt-BR',
      EJS_color: '#ffb000', EJS_backgroundColor: '#000000',
      EJS_onGameStart: () => { S.pronto = true; aoComecar && aoComecar(); },
    });
    const s = document.createElement('script'); s.src = CDN + 'loader.js'; s.onerror = aoErro; document.body.append(s);
  }
  const em = () => root.EJS_emulator && root.EJS_emulator.gameManager;
  const tela = () => document.querySelector(root.EJS_player + ' canvas');
  function aperta(i, v) { const g = em(); if (g) g.simulateInput(0, i, v); }
  const toque = (i, ms = 160) => { aperta(i, 1); setTimeout(() => aperta(i, 0), ms); };
  // START, A, A, A: sai da demonstração, cria a nota, escolhe a dificuldade e começa
  function comeca() { [BT.START, BT.A, BT.A, BT.A].forEach((b, k) => setTimeout(() => toque(b), 600 + k * 2600)); }

  // o olho: claridade da coluna (no Doom perto é mais claro) e movimento/vermelho (demônios)
  const bri = new Float32Array(64), mov = new Float32Array(64), red = new Float32Array(64);
  function enxerga() {
    const c = tela(); if (!c || !c.width) return false;
    ax.drawImage(c, 0, 0, 64, 40);
    const d = ax.getImageData(0, 6, 64, 20).data, lum = new Float32Array(64 * 20);
    bri.fill(0); mov.fill(0); red.fill(0);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], l = (r + g + b) / 3;
      lum[y * 64 + x] = l; bri[x] += l / 20; red[x] += Math.max(0, r - (g + b) * 0.6) / 20;
      if (S.prev) mov[x] += Math.abs(l - S.prev[y * 64 + x]) / 20;
    }
    S.prev = lum;
    // o movimento de girar mexe a tela toda: sobra só o que mexe diferente (um demônio andando)
    const ord = Array.from(mov).sort((a, b) => a - b), med = ord[32];
    S.movGeral = med;
    let mxB = 1; for (let x = 0; x < 64; x++) mxB = Math.max(mxB, bri[x]);
    S.gB += (mxB - S.gB) * 0.05; // ganho automático: o Doom 64 é escuro
    for (let k = 0; k < R; k++) {
      const a = RAYS[k], dentro = Math.abs(a) <= Math.PI / 4;
      const sx = dentro ? Math.round((0.5 + Math.tan(a) / 2) * 63) : a < 0 ? 0 : 63, f = dentro ? 1 : 0.6;
      let b = 0, m = 0, rr = 0, n = 0;
      for (let x = Math.max(0, sx - 1); x <= Math.min(63, sx + 1); x++) { b += bri[x]; m += Math.max(0, mov[x] - med * 1.3); rr += red[x]; n++; }
      S.par[k] = f * Math.min(1, b / n / Math.max(8, S.gB));
      S.dem[k] = f * Math.min(1, (m / n) / S.gM + (rr / n) / 40);
    }
    return true;
  }
  function tique(brain) {
    if (!S.pronto || !S.joga || !S.ctrl) return;
    if (!enxerga()) return;
    const o = Dm.pensa(brain, S.ctrl, S.par, S.dem, Math.min(1, S.movGeral / 6));
    S.steer += (o.steer - S.steer) * 0.5; S.thrust += (o.thrust - S.thrust) * 0.5; S.fire = o.fire;
    const v = Math.round(Math.min(1, Math.abs(S.steer) * 1.3) * 0x7fff);
    aperta(BT.DIR, S.steer > 0.08 ? v : 0); aperta(BT.ESQ, S.steer < -0.08 ? v : 0);
    aperta(BT.FRENTE, S.thrust > 0.2 ? Math.round(S.thrust * 0x7fff) : 0);
    aperta(BT.Z, S.fire > 0.5 ? 1 : 0);
    // empacou andando para a frente (porta?): aperta "usar"
    S.parado = S.thrust > 0.5 && S.movGeral < 0.6 ? S.parado + 1 : 0;
    if (S.parado > 15 && performance.now() - S.usoT > 1500) { S.usoT = performance.now(); toque(BT.B); }
  }
  function liga(brain, genes, on) {
    S.joga = on;
    if (on) { S.ctrl = Dm.controle(Dm.prepara(brain), genes); clearInterval(S.h); S.h = setInterval(() => tique(brain), 66); }
    else { clearInterval(S.h); [BT.DIR, BT.ESQ, BT.FRENTE, BT.Z].forEach(b => aperta(b, 0)); }
  }

  // guarda a ROM neste aparelho para não precisar escolher toda vez
  const db = () => new Promise((ok, erro) => { const r = indexedDB.open('mosca', 1); r.onupgradeneeded = () => r.result.createObjectStore('rom'); r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error); });
  async function guardaRom(f) { const d = await db(); return new Promise(ok => { const t = d.transaction('rom', 'readwrite'); t.objectStore('rom').put(f, 'doom64'); t.oncomplete = ok; t.onerror = ok; }); }
  async function romSalva() { try { const d = await db(); return await new Promise(ok => { const r = d.transaction('rom').objectStore('rom').get('doom64'); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }); } catch (e) { return null; } }

  root.MoscaDoom64 = { S, carrega, comeca, liga, guardaRom, romSalva };
})(typeof self !== 'undefined' ? self : this);
