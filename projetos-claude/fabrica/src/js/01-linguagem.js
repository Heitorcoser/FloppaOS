/* ---- linguagem ---- */
const H = {
  Math,
  dados: (n) => LIB[n] && LIB[n].text,
  json: (s) => JSON.parse(s),
  tocar: (n) => tocar(n),
  Date,
  JSON,
  String,
  Number,
  Array,
  Object,
  parseInt,
  parseFloat,
  isNaN,
  parte: (s, i) => String(s).split(" ")[i],
  abs: Math.abs,
  piso: Math.floor,
  teto: Math.ceil,
  max: Math.max,
  min: Math.min,
  aleatorio: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  arredondar: Math.round,
  texto: String,
  numero: Number,
  tamanho: (s) => (Array.isArray(s) ? s.length : String(s).length),
  lista: (...a) => a,
  adicionar: (l, v) => l.push(v),
  removerprimeiro: (l) => l.shift(),
  removerultimo: (l) => l.pop(),
  pegar: (l, i) => l[i],
  contem: (l, v) => l.includes(v),
  maiusculo: (s) => String(s).toUpperCase(),
  minusculo: (s) => String(s).toLowerCase(),
  raiz: Math.sqrt,
  agora: () => Date.now(),
};
const mkEnv = (v) =>
  new Proxy(v, {
    has: () => true,
    get: (t, k) =>
      typeof k == "symbol" ? undefined : k in t ? t[k] : Object.hasOwn(VARS, k) ? VARS[k] : k in H ? H[k] : 0,
    set: (t, k, x) => {
      if (Object.hasOwn(VARS, k)) {
        VARS[k] = x;
        save();
      } else t[k] = x;
      return true;
    },
  });
const cc = {};
function tr(e) {
  return e
    .split(/("(?:[^"\\]|\\.)*")/)
    .map((p, i) =>
      i % 2
        ? p
        : p
            .replace(/\bverdadeiro\b/g, "true")
            .replace(/\bfalso\b/g, "false")
            .replace(/\be\b/g, "&&")
            .replace(/\bou\b/g, "||")
            .replace(/\bnao\b/g, "!")
            .replace(/(?<![<>!=])=(?!=)/g, "=="),
    )
    .join("");
}
function ev(e, env) {
  const f = cc[e] || (cc[e] = new Function("E", "with(E){return(" + tr(e) + ")}"));
  return f(env);
}
function parse(src) {
  const L = src
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && s[0] != "#");
  let i = 0;
  function blk() {
    const out = [];
    while (i < L.length) {
      const l = L[i];
      if (/^(fim|senao)$/i.test(l)) break;
      let m;
      if ((m = l.match(/^se (.+) entao$/i))) {
        i++;
        const a = blk();
        let b = [];
        if (/^senao$/i.test(L[i] || "")) {
          i++;
          b = blk();
        }
        i++;
        out.push({ t: "se", c: m[1], a, b });
      } else if ((m = l.match(/^repetir (.+)$/i))) {
        i++;
        const b = blk();
        i++;
        out.push({ t: "rep", c: m[1], b });
      } else if ((m = l.match(/^enquanto (.+)$/i))) {
        i++;
        const b = blk();
        i++;
        out.push({ t: "enq", c: m[1], b });
      } else if ((m = l.match(/^para (\w+) de (.+) ate (.+)$/i))) {
        i++;
        const b = blk();
        i++;
        out.push({ t: "for", v: m[1], a: m[2], z: m[3], b });
      } else {
        out.push({ t: "c", l });
        i++;
      }
    }
    return out;
  }
  const r = [];
  while (i < L.length) {
    r.push(...blk());
    i++;
  }
  return r;
}
function clog(d, t, err) {
  d.cl = (d.cl || []).concat((err ? "⚠ " : "") + t).slice(-20);
  const o = q(d, ".log");
  if (o) {
    o.textContent = d.cl.join("\n");
    o.scrollTop = 1e5;
  }
}
const AF = (async () => {}).constructor;
async function run(d, entrada) {
  if (d.run) {
    d.pend = entrada;
    return;
  }
  d.run = 1;
  d.stop = 0;
  let steps = 0;
  const env = d.env || (d.env = mkEnv({}));
  env.entrada = entrada;
  env.teclas = d.keys = d.keys || {};
  async function cmd(l) {
    let m;
    if ((m = l.match(/^([A-Za-z_]\w*)\s*(\+|-|\*|\/)?=(?!=)\s*(.+)$/))) {
      env[m[1]] = ev(m[2] ? m[1] + m[2] + "(" + m[3] + ")" : m[3], env);
      return;
    }
    const w = l.split(/\s+/)[0],
      a = l.slice(w.length).trim();
    if (CMDS[w.toLowerCase()]) {
      await callC(w, a ? ev("[" + a + "]", env) : []);
      return;
    }
    switch (w.toLowerCase()) {
      case "mostrar":
      case "enviar":
        emit(d, ev(a, env));
        break;
      case "log":
        clog(d, String(ev(a, env)));
        break;
      case "esperar":
        await sl(Number(ev(a, env)));
        break;
      case "pixel": {
        const [x, y, c] = ev("[" + a + "]", env);
        emit(d, { px: [x, y, c || "#fff"] });
        break;
      }
      case "limpar":
        emit(d, { clr: 1 });
        break;
      case "bip":
        T.som.recv(d, ev(a, env));
        break;
      case "retangulo": {
        const [x, y, w, h, c] = ev("[" + a + "]", env);
        emit(d, { rc: [x, y, w, h, c || "#fff"] });
        break;
      }
      case "vibrar":
        navigator.vibrate && navigator.vibrate(+ev(a || "100", env));
        break;
      case "linha": {
        const [x, y, x2, y2, c] = ev("[" + a + "]", env);
        emit(d, { ln: [x, y, x2, y2, c || "#fff"] });
        break;
      }
      case "circulo": {
        const [x, y, r, c] = ev("[" + a + "]", env);
        emit(d, { ci: [x, y, r, c || "#fff"] });
        break;
      }
      case "fundo":
        emit(d, { clr: 1, bg: ev(a, env) });
        break;
      case "imagem": {
        const [n, x, y, w, h] = ev("[" + a + "]", env);
        emit(d, { img: [n, x, y, w, h] });
        break;
      }
      case "tocar":
        tocar(ev(a, env));
        break;
      case "texto": {
        const [t, x, y, c, z] = ev("[" + a + "]", env);
        emit(d, { tx: [String(t), x, y, c || "#fff", z || 8] });
        break;
      }
      case "parar":
        throw "parado";
      default:
        try {
          ev(l, env);
        } catch (e) {
          throw e instanceof SyntaxError ? "não entendi: " + l : e;
        }
    }
  }
  async function ex(bl) {
    for (const n of bl) {
      if (d.stop) throw "parado";
      if (++steps > 40000) throw "muitos passos (loop infinito?)";
      if (steps % 100 == 0) await sl(0);
      if (n.t == "se") await ex(ev(n.c, env) ? n.a : n.b);
      else if (n.t == "rep") {
        const k = Number(ev(n.c, env));
        for (let j = 0; j < k; j++) await ex(n.b);
      } else if (n.t == "for") {
        const z = Number(ev(n.z, env));
        for (env[n.v] = Number(ev(n.a, env)); env[n.v] <= z; env[n.v]++) await ex(n.b);
      } else if (n.t == "enq") {
        while (ev(n.c, env)) {
          await ex(n.b);
          if (++steps > 40000) throw "loop infinito";
        }
      } else await cmd(n.l);
    }
  }
  async function runJs() {
    const api = {
      enviar: (v) => emit(d, v),
      mostrar: (v) => emit(d, v),
      log: (v) => clog(d, String(v)),
      esperar: (ms) => sl(ms),
      pixel: (x, y, c) => emit(d, { px: [x, y, c || "#fff"] }),
      retangulo: (x, y, w, h, c) => emit(d, { rc: [x, y, w, h, c || "#fff"] }),
      linha: (a, b, x, y, c) => emit(d, { ln: [a, b, x, y, c || "#fff"] }),
      circulo: (x, y, r, c) => emit(d, { ci: [x, y, r, c || "#fff"] }),
      fundo: (c) => emit(d, { clr: 1, bg: c }),
      limpar: () => emit(d, { clr: 1 }),
      bip: (f) => T.som.recv(d, f),
      vibrar: (ms) => navigator.vibrate && navigator.vibrate(ms || 100),
      parar: () => {
        throw "parado";
      },
      console: { log: (v) => clog(d, String(v)) },
    };
    Object.assign(env, api);
    await new AF("E", "with(E){" + d.s.code + "\n}")(env);
  }
  async function runJsx() {
    if (!d.fn || d.fc !== d.s.code) {
      d.fc = d.s.code;
      d.fn = new AF("E", "with(E){" + d.s.code + "\n}");
    }
    d.S = d.S || {};
    const dr = DRAW(d),
      E = {
        entrada,
        S: d.S,
        teclas: d.keys,
        tela: mkFb(d),
        enviar: (v) => emit(d, v),
        log: (v) => clog(d, String(v)),
        esperar: sl,
        bip: (f) => T.som.recv(d, f),
        vibrar: (ms) => navigator.vibrate && navigator.vibrate(ms || 100),
        agora: () => performance.now(),
        aleatorio: H.aleatorio,
        rgb,
        lib: LIBAPI,
        variaveis: VARS,
        comando: (n, ...a) => callC(n, a),
      };
    DN.forEach((k, i) => (E[k] = dr[i]));
    await d.fn(E);
  }
  let depth = 0;
  async function callC(name, args) {
    const c = CMDS[String(name).toLowerCase()];
    if (!c) throw "comando desconhecido: " + name;
    if (depth >= 80) throw "recursão demais";
    depth++;
    const sv = c.p.map((k) => env[k]);
    c.p.forEach((k, i) => (env[k] = args[i] === undefined ? 0 : args[i]));
    try {
      await ex(parse(c.body));
    } finally {
      depth--;
      c.p.forEach((k, i) => (env[k] = sv[i]));
    }
  }
  async function runPy() {
    if (!PYP) clog(d, "⏳ Carregando Python (só na 1ª vez, ~10 MB)...");
    const py = await pyLoad();
    let ns = d.pn;
    if (!ns) {
      ns = d.pn = py.globals.get("dict")();
      const tj = (v) => (v && v.toJs ? v.toJs() : v);
      Object.entries({
        enviar: (v) => emit(d, tj(v)),
        mostrar: (v) => emit(d, tj(v)),
        log: (v) => clog(d, String(tj(v))),
        esperar: sl,
        bip: (f) => T.som.recv(d, f),
        vibrar: (ms) => navigator.vibrate && navigator.vibrate(ms || 100),
        agora: () => performance.now(),
        aleatorio: H.aleatorio,
        rgb,
        tela: mkFb(d),
        dados: LIBAPI.dados,
        tocar,
        pixels: LIBAPI.pixels,
        pixel: (x, y, c) => emit(d, { px: [x, y, c || "#fff"] }),
        retangulo: (x, y, w, h, c) => emit(d, { rc: [x, y, w, h, c || "#fff"] }),
        linha: (a, b, x, y, c) => emit(d, { ln: [a, b, x, y, c || "#fff"] }),
        circulo: (x, y, r, c) => emit(d, { ci: [x, y, r, c || "#fff"] }),
        fundo: (c) => emit(d, { clr: 1, bg: c }),
        limpar: () => emit(d, { clr: 1 }),
        imagem: (n, x, y, w, h) => emit(d, { img: [n, x, y, w, h] }),
        variaveis: VARS,
        comando: (n, ...a) => callC(n, a.map(tj)),
      }).forEach(([k, f]) => ns.set(k, f));
    }
    ns.set("entrada", entrada);
    ns.set("teclas", py.toPy({ cima: 0, baixo: 0, esquerda: 0, direita: 0, A: 0, B: 0, ...d.keys }));
    try {
      await py.runPythonAsync(d.s.code, { globals: ns });
    } catch (e) {
      throw new Error(String(e.message).trim().split("\n").slice(-3).join(" | "));
    }
  }
  try {
    const lg = glang(d);
    if (lg != (d.s.lang || "")) {
      d.s.lang = lg;
      const e = q(d, "[data-k=lang]");
      if (e) e.value = lg;
      save();
    }
    if (lg == "py") await runPy();
    else if (lg == "jsx" || lg == "js") await runJsx();
    else await ex(parse(d.s.code));
    track("run");
  } catch (e) {
    if (e !== "parado") clog(d, e.message || String(e), 1);
  }
  d.run = 0;
  if (d.pend !== undefined) {
    const p = d.pend;
    d.pend = undefined;
    run(d, p);
  }
}
