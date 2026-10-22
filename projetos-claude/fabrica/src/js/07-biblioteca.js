const LIB = {},
  PYB = "https://cdn.jsdelivr.net/npm/pyodide@0.26.4/";
let PYP = null,
  IDBp = null;
const idb = () =>
  IDBp ||
  (IDBp = new Promise((ok, no) => {
    try {
      // versão 2: além da biblioteca, guarda os jogos do Console
      const r = indexedDB.open("fabrica", 2);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains("lib")) db.createObjectStore("lib", { keyPath: "name" });
        if (!db.objectStoreNames.contains("jogos")) db.createObjectStore("jogos", { keyPath: "name" });
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => no(r.error);
    } catch (e) {
      no(e);
    }
  }));
const lput = async (it) => {
  const db = await idb();
  return new Promise((ok, no) => {
    const t = db.transaction("lib", "readwrite");
    t.objectStore("lib").put(it);
    t.oncomplete = ok;
    t.onerror = () => no(t.error);
  });
};
const ldel = async (n) => {
  const db = await idb();
  return new Promise((ok) => {
    const t = db.transaction("lib", "readwrite");
    t.objectStore("lib").delete(n);
    t.oncomplete = ok;
  });
};
const lall = async () => {
  const db = await idb();
  return new Promise((ok) => {
    const r = db.transaction("lib").objectStore("lib").getAll();
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ok([]);
  });
};
function reg(it) {
  LIB[it.name] = it;
  if (it.kind == "img") {
    it.obj = new Image();
    it.obj.src = it.data;
  }
  if (it.kind == "video") {
    const v = (it.obj = document.createElement("video"));
    v.src = it.data;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
  }
  if (it.kind == "text") it.text = it.data;
}
function tocar(n) {
  const o = LIB[n];
  if (!o || o.kind != "audio") {
    toast("Som não encontrado: " + n);
    return;
  }
  try {
    new Audio(o.data).play();
  } catch (e) {}
}
const LIBAPI = {
  dados: (n) => LIB[n] && LIB[n].text,
  tocar: (n) => tocar(n),
  lista: (k) =>
    Object.values(LIB)
      .filter((o) => !k || o.kind == k)
      .map((o) => o.name),
  video: (n, a) => {
    const o = LIB[n];
    if (!o || o.kind != "video") return;
    const v = o.obj;
    if (a == "pause") v.pause();
    else if (a == "alternar") {
      v.paused ? v.play().catch(() => 0) : v.pause();
    } else v.play().catch(() => 0);
  },
  imagem: (n) => LIB[n] && LIB[n].obj,
  pixels: (n) => {
    const o = LIB[n];
    if (o && o.kind == "video") return vpix(o);
    if (!o || !o.obj || !o.obj.complete) return null;
    if (!o.px) {
      const c = document.createElement("canvas");
      c.width = o.obj.naturalWidth;
      c.height = o.obj.naturalHeight;
      const x = c.getContext("2d");
      x.drawImage(o.obj, 0, 0);
      o.px = {
        w: c.width,
        h: c.height,
        d: new Uint32Array(x.getImageData(0, 0, c.width, c.height).data.buffer.slice(0)),
      };
    }
    return o.px;
  },
};
function pyLoad() {
  return (
    PYP ||
    (PYP = new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = PYB + "pyodide.js";
      s.onload = () => loadPyodide({ indexURL: PYB }).then(ok, no);
      s.onerror = () =>
        no(
          new Error(
            "Não consegui baixar o Python (precisa de internet; no link do Claude é bloqueado, abra o arquivo no navegador)",
          ),
        );
      document.head.append(s);
    }).catch((e) => {
      PYP = null;
      throw e;
    }))
  );
}
lall()
  .then((a) => a.forEach(reg))
  .catch(() => {});
$("#lf").onchange = async (e) => {
  for (const f of e.target.files) {
    const mx = f.type.startsWith("video/") ? 3e7 : 6e6;
    if (f.size > mx) {
      toast(f.name + " é grande demais (máx " + mx / 1e6 + " MB)");
      continue;
    }
    const ext = (f.name.split(".").pop() || "").toLowerCase(),
      name = f.name.replace(/\.[^.]+$/, ""),
      kind = f.type.startsWith("image/")
        ? "img"
        : f.type.startsWith("audio/")
          ? "audio"
          : f.type.startsWith("video/")
            ? "video"
            : "text";
    const data = await new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => ok(r.result);
      kind == "text" ? r.readAsText(f) : r.readAsDataURL(f);
    });
    const it = { name, kind, ext, data, size: f.size };
    try {
      await lput(it);
    } catch (x) {
      toast("Não consegui salvar (armazenamento bloqueado?)");
    }
    reg(it);
  }
  e.target.value = "";
  libUI();
  toast("Importado!");
};
async function libUI() {
  const a = Object.values(LIB),
    ic = { img: "🖼", audio: "🔊", video: "🎬", text: "📄" };
  const rows = a
    .map((it) => {
      const n = esc(it.name),
        B = (l, t) =>
          `<button class=it style="padding:6px 8px" data-n="${n}" onclick="libAct(this.dataset.n,'${l}')">${t}</button>`;
      return `<div style="display:flex;gap:6px;align-items:center;border:1px solid var(--bd);border-radius:10px;padding:6px">${it.kind == "img" ? `<img src="${it.data}" style="width:36px;height:36px;object-fit:contain;image-rendering:pixelated">` : ic[it.kind]}<span style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${n}<br><small style="color:var(--mu)">${it.kind}${it.ext ? " ." + it.ext : ""} · ${Math.ceil(it.size / 1024)} KB</small></span>${it.kind == "audio" || it.kind == "video" ? B("play", "▶") : ""}${it.kind == "text" && ["js", "py", "txt", "cmd"].includes(it.ext) ? B("cmd", "📟") : ""}${it.kind == "text" && it.ext == "json" ? (/"(aparelhos|devices)"/.test(it.text) ? B("build", "🏗") : B("proj", "📂")) : ""}${B("del", "🗑")}</div>`;
    })
    .join("");
  modal(
    '<div style="font-weight:700">📦 Biblioteca</div><div style="color:var(--mu);font-size:12px">Importe imagens, sons, textos/JSON, código (.js .py) ou projetos (.json). Fica salvo neste aparelho e vale para todos os projetos. Use pelo nome, sem extensão: imagem "nome", x, y, larg, alt · tocar "nome" · dados("nome")</div><label class=it for=lf style="flex-direction:row;padding:10px">📥 Importar arquivos</label>' +
      (rows || '<div style="color:var(--mu)">Biblioteca vazia</div>') +
      '<button class=it onclick="cm()">Fechar</button>',
  );
}
async function libAct(n, a) {
  const o = LIB[n];
  if (!o) return;
  if (a == "del") {
    await ldel(n).catch(() => 0);
    delete LIB[n];
    libUI();
    return;
  }
  if (a == "play") {
    o.kind == "video" ? LIBAPI.video(n, "alternar") : tocar(n);
    return;
  }
  if (a == "proj") {
    impJ(o.text);
    return;
  }
  if (a == "cmd") {
    add("comand", -V.x / V.s + 10, -V.y / V.s + 10, {
      code: o.text,
      lang: { py: "py", js: "jsx" }[o.ext] || "",
    });
    wires();
    save();
    cm();
    toast("Comand criado");
    return;
  }
  if (a == "build") {
    try {
      build(o.text);
      cm();
    } catch (e) {
      toast("Erro: " + e.message);
    }
  }
}
const RES = new Set([
  "mostrar",
  "enviar",
  "log",
  "esperar",
  "pixel",
  "limpar",
  "parar",
  "retangulo",
  "linha",
  "circulo",
  "fundo",
  "bip",
  "vibrar",
  "imagem",
  "tocar",
  "texto",
  "se",
  "senao",
  "fim",
  "repetir",
  "enquanto",
  "para",
  "entao",
]);
const pv = (v) => {
  if (typeof v != "string") return v;
  const t = v.trim();
  if (t !== "" && !isNaN(t)) return Number(t);
  if (/^[\[{]/.test(t)) {
    try {
      return JSON.parse(t);
    } catch (e) {}
  }
  return v;
};
function setVar(k, v) {
  VARS[k] = pv(v);
  save();
}
function defCmd(n, p, b) {
  n = String(n || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  if (!n || RES.has(n) || /^\d/.test(n)) throw new Error("Nome de comando inválido");
  CMDS[n] = {
    p: (typeof p == "string" ? p.split(",") : p).map((s) => String(s).trim()).filter(Boolean),
    body: String(b || ""),
  };
  save();
}
setInterval(
  () =>
    Object.values(D).forEach((d) => {
      if (d.type == "vari") {
        const o = q(d, ".term");
        if (o) {
          const v = VARS[d.s.n],
            t = v === undefined ? "—" : typeof v == "object" ? JSON.stringify(v) : String(v);
          if (o.textContent !== t) o.textContent = t;
        }
      }
    }),
  300,
);
function varUI() {
  const rows = Object.keys(VARS)
    .map(
      (k) =>
        `<div style="display:flex;gap:6px;align-items:center"><b style="min-width:70px;overflow:hidden;text-overflow:ellipsis">${esc(k)}</b><input data-n="${esc(k)}" value="${esc(typeof VARS[k] == "object" ? JSON.stringify(VARS[k]) : VARS[k])}" onchange="setVar(this.dataset.n,this.value)" style="flex:1"><button class=it style="padding:6px 8px" data-n="${esc(k)}" onclick="delVar(this.dataset.n)">🗑</button></div>`,
    )
    .join("");
  modal(
    `<div style="font-weight:700">🧮 Variáveis (valem para todos os Comands)</div><div style="color:var(--mu);font-size:12px">Use pelo nome no código. Comand fácil: direto (pontos += 1). JavaScript rápido e Python: variaveis.pontos. Aparelho 📈 Variável mostra o valor ao vivo.</div>${rows || '<div style="color:var(--mu)">Nenhuma ainda</div>'}<div style="display:flex;gap:6px"><input id="vn" placeholder="nome (ex: pontos)" style="flex:1"><input id="vv" placeholder="valor" value="0" style="width:90px"><button class=it style="padding:6px 12px" onclick="newVar()">+</button></div><button class=it onclick="cm()">Fechar</button>`,
  );
}
function newVar() {
  const n = $("#vn").value.trim();
  if (!/^[A-Za-z_]\w*$/.test(n)) {
    toast("Nome inválido: use letras, números e _");
    return;
  }
  setVar(n, $("#vv").value);
  varUI();
}
function delVar(k) {
  delete VARS[k];
  save();
  varUI();
}
function cmdUI() {
  const rows = Object.keys(CMDS)
    .map(
      (k) =>
        `<div style="display:flex;gap:6px;align-items:center;border:1px solid var(--bd);border-radius:10px;padding:6px"><span style="flex:1;overflow:hidden;text-overflow:ellipsis"><b>${esc(k)}</b> ${esc(CMDS[k].p.join(", "))}</span><button class=it style="padding:6px 8px" data-n="${esc(k)}" onclick="editCmd(this.dataset.n)">✏️</button><button class=it style="padding:6px 8px" data-n="${esc(k)}" onclick="delCmd(this.dataset.n)">🗑</button></div>`,
    )
    .join("");
  modal(
    `<div style="font-weight:700">🧩 Meus comandos</div><div style="color:var(--mu);font-size:12px">Crie um comando novo e use em qualquer Comand: <b>nome 1, 2</b> no Comand fácil, ou await comando("nome",1,2) no Python e no JavaScript rápido. Os parâmetros são locais; o resto é compartilhado com o Comand que chamou.</div>${rows || '<div style="color:var(--mu)">Nenhum ainda</div>'}<button class=it onclick="editCmd('')">+ Novo comando</button><button class=it onclick="cm()">Fechar</button>`,
  );
}
function editCmd(k) {
  const c = CMDS[k] || { p: [], body: "" };
  modal(
    `<div style="font-weight:700">${k ? "Editar" : "Novo"} comando</div><input id="cn" placeholder="nome (ex: quadrado)" value="${esc(k)}"><input id="cp" placeholder="parâmetros separados por vírgula (ex: x, y, cor)" value="${esc(c.p.join(", "))}"><textarea id="cb2" rows="9" spellcheck="false" autocapitalize="off">${esc(c.body)}</textarea><div style="color:var(--mu);font-size:12px">Escreva no Comand fácil. Para devolver um valor, grave em <b>resultado</b>.</div><button class=it data-o="${esc(k)}" onclick="saveCmd(this.dataset.o)">💾 Salvar</button><button class=it onclick="cmdUI()">Voltar</button>`,
  );
}
function saveCmd(old) {
  try {
    const n = $("#cn")
      .value.toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (old && old != n) delete CMDS[old];
    defCmd(n, $("#cp").value, $("#cb2").value);
    cmdUI();
    toast("Comando salvo");
  } catch (e) {
    toast(e.message);
  }
}
function delCmd(k) {
  delete CMDS[k];
  save();
  cmdUI();
}
