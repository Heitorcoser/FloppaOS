/* ---- console: emulador de videogames (EmulatorJS) ---- */
// Sistemas: chave do EmulatorJS -> [nome, extensões, processador mínimo (1 = 8-bit ... 4 = 64-bit)]
const SIST = {
  nes: ["NES (Nintendinho)", ["nes", "unf", "fds"], 1],
  snes: ["Super Nintendo", ["sfc", "smc", "fig", "swc"], 2],
  gb: ["Game Boy / Color", ["gb", "gbc", "dmg"], 1],
  gba: ["Game Boy Advance", ["gba"], 2],
  nds: ["Nintendo DS", ["nds"], 3],
  n64: ["Nintendo 64", ["z64", "n64", "v64"], 3],
  vb: ["Virtual Boy", ["vb", "vboy"], 2],
  psx: ["PlayStation 1", ["cue", "chd", "pbp", "img", "m3u", "ccd", "ecm"], 2],
  psp: ["PSP", ["cso"], 4],
  segaMS: ["Master System", ["sms"], 1],
  segaGG: ["Game Gear", ["gg"], 1],
  segaMD: ["Mega Drive", ["md", "gen", "smd", "68k", "sgd"], 2],
  segaCD: ["Sega CD", [], 2],
  sega32x: ["Sega 32X", ["32x"], 2],
  segaSaturn: ["Sega Saturn", [], 3],
  pce: ["PC Engine / TurboGrafx", ["pce", "sgx"], 2],
  atari2600: ["Atari 2600", ["a26"], 1],
  atari7800: ["Atari 7800", ["a78"], 1],
  lynx: ["Atari Lynx", ["lnx"], 1],
  ngp: ["Neo Geo Pocket", ["ngp", "ngc"], 1],
  ws: ["WonderSwan", ["ws", "wsc"], 1],
  coleco: ["ColecoVision", ["col"], 1],
  arcade: ["Fliperama (Arcade)", ["zip"], 2],
};
const ACEITA = [...new Set(["iso", "bin", ...Object.values(SIST).flatMap((s) => s[1])])].map((e) => "." + e).join(",");
const LEGADO = { PS1: "psx", N64: "n64" }; // valores salvos pela versão antiga

// Descobre o sistema pela escolha do usuário ou pela extensão (e tamanho, quando é ambíguo)
function emuSys(d) {
  const s = LEGADO[d.s.sis] || d.s.sis;
  if (SIST[s]) return s;
  const f = d.file;
  if (!f) return "";
  const e = f.name.split(".").pop().toLowerCase();
  if (e == "iso") return f.size > 750e6 ? "psp" : "psx";
  if (e == "bin") return f.size < 8e6 ? "segaMD" : "psx";
  return Object.keys(SIST).find((k) => SIST[k][1].includes(e)) || "";
}
function emuText(d) {
  const e = q(d, ".cs");
  if (!e) return;
  const sy = emuSys(d),
    c = cpuInfo(d);
  e.textContent =
    (d.file ? "📀 " + d.file.name + " (" + Math.ceil(d.file.size / 1e6) + " MB)" : "nenhum jogo escolhido") +
    "\n" +
    (sy
      ? SIST[sy][0] +
        " · precisa de " +
        CPU[SIST[sy][2]][0] +
        " ou melhor · " +
        (ECO.f || c.pw >= SIST[sy][2] ? "✅ ok" : "❌ ligado: " + c.nm)
      : d.file
        ? "não reconheci o sistema: escolha na lista"
        : "aceita " + Object.keys(SIST).length + " sistemas");
}
// Jogos ficam guardados no aparelho (IndexedDB) para abrir de novo sem procurar o arquivo
const jogoPut = async (it) => {
  const db = await idb();
  return new Promise((ok, no) => {
    const t = db.transaction("jogos", "readwrite");
    t.objectStore("jogos").put(it);
    t.oncomplete = ok;
    t.onerror = () => no(t.error);
  });
};
const jogoDel = async (n) => {
  const db = await idb();
  return new Promise((ok) => {
    const t = db.transaction("jogos", "readwrite");
    t.objectStore("jogos").delete(n);
    t.oncomplete = ok;
  });
};
const jogosTodos = async () => {
  const db = await idb();
  return new Promise((ok) => {
    const r = db.transaction("jogos").objectStore("jogos").getAll();
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ok([]);
  });
};
async function gfPick(id, el, bios) {
  const d = D[id],
    f = el.files[0];
  if (!f) return;
  if (bios) d.bios = f;
  else {
    d.file = f;
    if (d.s.guardar !== 0)
      jogoPut({ name: f.name, sys: emuSys(d), size: f.size, t: Date.now(), file: f })
        .then(() => toast("💾 Jogo guardado no aparelho"))
        .catch(() => toast("Não consegui guardar o jogo (espaço cheio?). Ele ainda abre agora."));
  }
  emuText(d);
}
async function meusJogos(id) {
  const L = (await jogosTodos().catch(() => [])).sort((a, b) => b.t - a.t);
  const rows = L.map(
    (g) =>
      `<div class=lin><span>🎮 <b>${esc(g.name)}</b><small>${SIST[g.sys] ? SIST[g.sys][0] : "sistema ?"} · ${Math.ceil(g.size / 1e6)} MB</small></span><button class=it data-n="${esc(g.name)}" onclick="jogoAbrir(${id},this.dataset.n)">▶</button><button class=it data-n="${esc(g.name)}" onclick="jogoDel(this.dataset.n).then(()=>meusJogos(${id}))">🗑</button></div>`,
  ).join("");
  modal(
    `<div class=mt>📚 Meus jogos</div><div class=mu>Jogos que você abriu neste aparelho. Use só jogos que você possui.</div>${rows || '<div class=mu>Nenhum jogo guardado ainda. Toque em "Escolher jogo" no Console.</div>'}<button class=it onclick="cm()">Fechar</button>`,
  );
}
async function jogoAbrir(id, nome) {
  const g = (await jogosTodos()).find((x) => x.name == nome),
    d = D[id];
  if (!g || !d) return;
  d.file = new File([g.file], g.name);
  g.t = Date.now();
  jogoPut(g).catch(() => 0);
  cm();
  emuText(d);
  emuPlay(d);
}
document.addEventListener("change", (e) => {
  const c = e.target.closest && e.target.closest(".card"),
    d = c && D[c.id.slice(1)];
  if (d && d.type == "console") setTimeout(() => emuText(d), 0);
});
function emuClose() {
  const w = $("#emu");
  if (!w) return;
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    screen.orientation && screen.orientation.unlock && screen.orientation.unlock();
  } catch (e) {}
  URL.revokeObjectURL(w.dataset.u);
  if (w.dataset.b) URL.revokeObjectURL(w.dataset.b);
  w.remove();
}
function emuTela() {
  const w = $("#emu");
  if (!w) return;
  const p = w.requestFullscreen ? w.requestFullscreen() : null;
  Promise.resolve(p)
    .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape"))
    .catch(() => toast("Este navegador não deixou entrar em tela cheia"));
}
function emuPlay(d) {
  emuText(d);
  const sy = emuSys(d);
  if (!d.file) return toast("Escolha um jogo primeiro");
  if (!sy) return toast("Escolha o sistema na lista do Console");
  const c = cpuInfo(d),
    need = SIST[sy][2];
  if (!ECO.f && c.pw < need) return toast("Ligue um " + CPU[need][0] + " (🔲) com fio neste Console");
  emuClose();
  const u = URL.createObjectURL(d.file),
    b = d.bios ? URL.createObjectURL(d.bios) : "",
    nm = d.file.name.replace(/\.[^.]+$/, ""),
    cfg = {
      EJS_player: "#game",
      EJS_core: sy,
      EJS_gameUrl: u + "#/" + encodeURIComponent(d.file.name),
      EJS_gameName: nm,
      EJS_pathtodata: "https://cdn.emulatorjs.org/stable/data/",
      EJS_language: "pt-BR",
      EJS_color: "#f59e0b",
      EJS_backgroundColor: "#000000",
      EJS_startOnLoaded: true,
      EJS_threads: typeof SharedArrayBuffer == "function",
    };
  if (b) cfg.EJS_biosUrl = b;
  const html =
    '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>html,body,#game{margin:0;width:100%;height:100%;background:#000}</style><div id=game></div><script>' +
    Object.entries(cfg)
      .map(([k, v]) => k + "=" + JSON.stringify(v) + ";")
      .join("") +
    '</script><script src="https://cdn.emulatorjs.org/stable/data/loader.js" onerror="document.body.style.cssText=\'color:#fff;font:16px sans-serif;padding:20px\';document.body.textContent=\'Não consegui carregar o emulador. Ele precisa de internet na primeira vez.\'"></script>';
  const w = document.createElement("div");
  w.id = "emu";
  w.dataset.u = u;
  w.dataset.b = b;
  w.innerHTML = `<div class=emubar><b>🎮 ${esc(nm)}</b><span>${SIST[sy][0]}</span><button onclick="emuTela()">⛶ Tela cheia</button><button class=sair onclick="emuClose()">✕ Sair</button></div><iframe allow="autoplay;fullscreen;gamepad" title="${esc(nm)}"></iframe>`;
  document.body.append(w);
  w.querySelector("iframe").srcdoc = html;
  emit(d, 1);
  track("jogo");
}
T.console = {
  i: "🎮",
  n: "Console de videogame",
  price: 400,
  w: 1,
  s: { sis: "auto", guardar: 1 },
  ui: (d) =>
    `<div class="term cs" style="min-height:50px"></div><select data-k=sis onchange="emuText(D[${d.id}])"><option value=auto>Sistema: descobrir pelo arquivo</option>${Object.entries(
      SIST,
    )
      .map(([k, s]) => `<option value="${k}"${(LEGADO[d.s.sis] || d.s.sis) == k ? " selected" : ""}>${s[0]}</option>`)
      .join("")}</select><label class=it for=gf${d.id}>📀 Escolher jogo</label><input type=file id=gf${d.id} hidden accept="${ACEITA}" onchange="gfPick(${d.id},this)"><button data-a=play class=ok>▶ Jogar</button><button data-a=lista>📚 Meus jogos</button><label class=it for=gb${d.id}>🧩 BIOS (opcional; obrigatória no Sega CD e Saturn)</label><input type=file id=gb${d.id} hidden onchange="gfPick(${d.id},this,1)"><div class=mu>${Object.keys(SIST).length} sistemas: NES, SNES, Game Boy, GBA, DS, N64, PS1, PSP, Mega Drive, Atari e mais. Use jogos que você possui. Na primeira vez precisa de internet. Dá para salvar o progresso pelo menu do próprio emulador.</div>`,
  act: (d, a) => (a == "lista" ? meusJogos(d.id) : emuPlay(d)),
};
