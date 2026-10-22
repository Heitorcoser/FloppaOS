/* ---- dispositivos ---- */
const pcw = (d, t) => {
  d.lg = (d.lg || []).concat(t).slice(-30);
  const o = q(d, ".term");
  o.textContent = d.lg.join("\n");
  o.scrollTop = 1e5;
};
const CODE = '# o valor recebido fica em "entrada"\nmostrar "Recebi: " + entrada';
const T = {
  valor: {
    i: "💬",
    n: "Valor",
    s: { v: "Oi" },
    ui: (d) => `<input data-k=v value="${esc(d.s.v)}"><button data-a=send>Enviar</button>`,
    act: (d) => emit(d, d.s.v),
  },
  sw: {
    i: "🔘",
    n: "Interruptor",
    s: { on: 0 },
    ui: (d) => `<button data-a=t>${d.s.on ? "LIGADO (1)" : "desligado (0)"}</button>`,
    act: (d, a, el) => {
      d.s.on = d.s.on ? 0 : 1;
      el.textContent = d.s.on ? "LIGADO (1)" : "desligado (0)";
      emit(d, d.s.on);
    },
  },
  ctl: {
    i: "🎮",
    n: "Controle",
    s: {},
    ui: () =>
      `<div class=pad><i></i><button data-a=cima>⬆</button><i></i><button data-a=esquerda>⬅</button><button data-a=A>A</button><button data-a=direita>➡</button><i></i><button data-a=baixo>⬇</button><button data-a=B>B</button></div>`,
    act: () => 0,
  },
  timer: {
    i: "⏱",
    n: "Timer",
    s: { ms: 1000 },
    ui: (d) => `<input data-k=ms type=number value="${d.s.ms}"><button data-a=go>▶ Iniciar</button>`,
    act: (d, a, el) => {
      if (d.h) {
        clearInterval(d.h);
        d.h = 0;
        el.textContent = "▶ Iniciar";
      } else {
        d.n = 0;
        d.h = setInterval(() => emit(d, ++d.n), Math.max(16, +d.s.ms || 1000));
        el.textContent = "⏸ Parar";
      }
    },
  },
  hub: {
    i: "🔗",
    n: "Conjunto",
    s: {},
    sm: 1,
    ui: () => `<div class=term style="text-align:center;min-height:18px">·</div>`,
  },
  tela: {
    i: "🖥",
    n: "Tela",
    s: {},
    ui: () => `<div class=term></div><canvas class=px width=16 height=16></canvas>`,
    recv(d, v) {
      const o = q(d, ".term"),
        c = q(d, "canvas").getContext("2d");
      if (typeof v == "object") {
        if (v.clr) c.clearRect(0, 0, 16, 16);
        else if (v.rc)
          try {
            c.fillStyle = v.rc[4];
            c.fillRect(v.rc[0], v.rc[1], v.rc[2], v.rc[3]);
          } catch (e) {}
        else
          try {
            c.fillStyle = v.px[2];
            c.fillRect(v.px[0] | 0, v.px[1] | 0, 1, 1);
          } catch (e) {}
      } else o.textContent = v;
    },
  },
  pc: {
    i: "💻",
    n: "PC",
    s: { t: "" },
    w: 1,
    ui: (d) =>
      `<div class=term style="min-height:70px"></div><input data-k=t placeholder="digite e envie" value="${esc(d.s.t)}"><button data-a=send>Enviar ⏎</button><div class="mu eco"></div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      // sem processador bom, o PC demora para mostrar cada linha
      const dl = ECO.f ? 0 : cpuInfo(d).delay;
      if (!dl) return pcw(d, String(v));
      const t = Math.max(Date.now(), d.pn || 0) + dl;
      if (t - Date.now() > 5000) return;
      d.pn = t;
      setTimeout(() => {
        if (D[d.id] === d) pcw(d, String(v));
      }, t - Date.now());
    },
    act(d) {
      pcw(d, "> " + d.s.t);
      emit(d, d.s.t);
    },
  },
  comand: {
    i: "📟",
    n: "Comand",
    s: { code: CODE },
    w: 1,
    ui: (d) =>
      `<select data-k=lang style="font-size:16px;padding:6px;background:var(--in);color:var(--tx);border:1px solid var(--bd);border-radius:8px"><option value="">Linguagem: Comand (fácil)</option><option value="js"${d.s.lang == "js" ? " selected" : ""}>Linguagem: JavaScript</option><option value="jsx"${d.s.lang == "jsx" ? " selected" : ""}>Linguagem: JavaScript rápido (jogos grandes)</option><option value="py"${d.s.lang == "py" ? " selected" : ""}>Linguagem: Python</option></select><textarea data-k=code rows=9 spellcheck=false autocapitalize=off autocorrect=off>${esc(d.s.code)}</textarea><div style="display:flex;gap:6px"><button data-a=run style="flex:1">▶ Rodar</button><button data-a=stop style="flex:1;background:#dc2626">⏹</button><button data-a=fix style="flex:1;background:#7c3aed">🤖 Consertar</button></div><div class="term log"></div>`,
    recv: (d, v) => {
      if (typeof v == "string") {
        const m = /^(-?)(cima|baixo|esquerda|direita|A|B)$/.exec(v);
        if (m) (d.keys = d.keys || {})[m[2]] = m[1] ? 0 : 1;
      }
      run(d, num(v));
    },
    act(d, a) {
      if (a == "run") {
        const e = lint(d.s.code, glang(d));
        if (e.length) clog(d, e.join("\n"), 1);
        run(d, "");
      } else if (a == "fix") fixCmd(d);
      else {
        d.stop = 1;
        d.pend = undefined;
      }
    },
  },
  lamp: {
    i: "💡",
    n: "Lâmpada",
    s: {},
    ui: () => `<div class=bulb></div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      const s = String(v).trim().toLowerCase(),
        b = q(d, ".bulb");
      if (["", "0", "off", "desligar", "falso", "false", "nao"].includes(s)) b.style.cssText = "";
      else {
        const c = isNaN(s) && CSS.supports("color", s) ? s : "#facc15";
        b.style.background = c;
        b.style.boxShadow = "0 0 24px " + c;
        track("lamp");
      }
    },
  },
  som: {
    i: "🔊",
    n: "Som",
    s: {},
    ui: () => `<div class=term style="text-align:center">número = Hz</div>`,
    recv(d, v) {
      try {
        AC = AC || new AudioContext();
        AC.resume();
        const o = AC.createOscillator(),
          g = AC.createGain();
        o.frequency.value = +v > 20 ? +v : 440;
        g.gain.value = 0.15;
        o.connect(g);
        g.connect(AC.destination);
        o.start();
        o.stop(AC.currentTime + 0.2);
      } catch (e) {}
    },
  },
  calc: {
    i: "➕",
    n: "Matemática",
    s: { e: "x * 2" },
    ui: (d) =>
      `<input data-k=e value="${esc(d.s.e)}"><div style="color:var(--mu);font-size:12px">x = valor recebido</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      try {
        emit(d, ev(d.s.e, mkEnv({ x: num(v) })));
      } catch (e) {
        toast("Matemática: " + e.message);
      }
    },
  },
  filtro: {
    i: "🔀",
    n: "Filtro",
    s: { e: "x > 5" },
    ui: (d) =>
      `<input data-k=e value="${esc(d.s.e)}"><div style="color:var(--mu);font-size:12px">só passa se for verdade</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      try {
        if (ev(d.s.e, mkEnv({ x: num(v) }))) emit(d, v);
      } catch (e) {
        toast("Filtro: " + e.message);
      }
    },
  },
  disp: {
    i: "🟦",
    n: "Display Pixel",
    s: { n: 16, t: 0 },
    w: 1,
    ui: (d) =>
      `<canvas class=px data-id=${d.id} width=16 height=16 style="width:210px;height:210px" onclick="tapd(event,this)"></canvas><button data-a=play>⛶ Jogar em tela cheia</button><div class="mu eco"></div><button data-a=up class=ok></button>`,
    act: (d, a) => (a == "up" ? scrUp(d) : gopen(d.id)),
    recv(d, v) {
      if (typeof v != "object") return;
      const cv = d.cv || (d.cv = q(d, "canvas"));
      try {
        const now = Date.now(),
          c = cpuInfo(d);
        if (!ECO.f && now - (d.lf || 0) < 1000 / c.fps) return; // limite de fps do processador
        d.lf = now;
        const R = effRes(d);
        if (v.fb) {
          let f = v.fb;
          const m = Math.max(f.w, f.h);
          if (m > R) f = reduzQuadro(f, R / m); // tela pequena demais: reduz o quadro
          if (cv.width != f.w || cv.height != f.h) {
            cv.width = f.w;
            cv.height = f.h;
            cv.style.height = "auto";
          }
          cv.getContext("2d").putImageData(new ImageData(f.d, f.w, f.h), 0, 0);
          track("disp");
        } else {
          if (cv.width != R || cv.height != R) {
            cv.width = cv.height = R;
            cv.style.height = "210px";
          }
          drw(cv.getContext("2d"), cv.width, v);
          if (!v.clr) track("disp");
        }
      } catch (e) {}
    },
  },
  vari: {
    i: "📈",
    n: "Variável",
    s: { n: "" },
    ui: (d) =>
      `<input data-k=n placeholder="nome da variável" value="${esc(d.s.n)}"><div class=term style="text-align:center;font-size:20px;min-height:30px">—</div><button data-a=ler>Enviar valor</button>`,
    act: (d) => emit(d, VARS[d.s.n] === undefined ? 0 : VARS[d.s.n]),
    recv(d, v) {
      if (typeof v == "object" || !d.s.n) return;
      VARS[d.s.n] = pv(v);
      save();
    },
  },
  mem: {
    i: "🧠",
    n: "Memória",
    s: {},
    ui: () =>
      `<div class=term style="text-align:center">vazia</div><div style="color:var(--mu);font-size:12px">guarda o valor; envie "ler" para soltar</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      if (v === "ler") emit(d, d.m === undefined ? 0 : d.m);
      else {
        d.m = v;
        q(d, ".term").textContent = String(v).slice(0, 14);
      }
    },
  },
  cont: {
    i: "🔢",
    n: "Contador",
    s: {},
    ui: () =>
      `<div class=term style="text-align:center">0</div><div style="color:var(--mu);font-size:12px">+1 a cada sinal; "zerar" volta a 0</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      d.c = v === "zerar" ? 0 : (d.c || 0) + 1;
      q(d, ".term").textContent = d.c;
      emit(d, d.c);
    },
  },
  dado: {
    i: "🎲",
    n: "Dado",
    s: { n: 6 },
    ui: (d) => `<input data-k=n type=number value="${d.s.n}"><button data-a=r>Rolar</button>`,
    act: (d) => emit(d, H.aleatorio(1, +d.s.n || 6)),
    recv(d, v) {
      if (typeof v != "object") emit(d, H.aleatorio(1, +d.s.n || 6));
    },
  },
  slider: {
    i: "🎚",
    n: "Slider",
    s: {},
    ui: () =>
      `<input type=range min=0 max=100 value=50 oninput="this.nextElementSibling.textContent=this.value;emit(D[this.closest('.card').id.slice(1)],+this.value)"><div class=term style="text-align:center;min-height:16px">50</div>`,
  },
  piano: {
    i: "🎹",
    n: "Piano",
    s: {},
    ui: () =>
      `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">` +
      [
        ["C", 262],
        ["D", 294],
        ["E", 330],
        ["F", 349],
        ["G", 392],
        ["A", 440],
        ["B", 494],
      ]
        .map(([n, f]) => `<button data-a=${f} style="padding:0">${n}</button>`)
        .join("") +
      `</div>`,
    act: (d, a) => emit(d, +a),
  },
  placar: {
    i: "📊",
    n: "Placar",
    s: {},
    ui: () => `<div class=term style="font-size:32px;text-align:center;min-height:44px">—</div>`,
    recv(d, v) {
      if (typeof v != "object") q(d, ".term").textContent = v;
    },
  },
  barra: {
    i: "📶",
    n: "Barra",
    s: {},
    ui: () =>
      `<div style="height:18px;background:var(--in);border:1px solid var(--bd);border-radius:9px;overflow:hidden"><div class=bar style="height:100%;width:0;background:#22c55e;transition:.2s"></div></div><div style="color:var(--mu);font-size:12px">0 a 100</div>`,
    recv(d, v) {
      if (typeof v != "object") q(d, ".bar").style.width = Math.min(100, Math.max(0, +v || 0)) + "%";
    },
  },
  texto: {
    i: "🔤",
    n: "Texto",
    s: { p: "Valor: ", f: "!" },
    ui: (d) =>
      `<input data-k=p value="${esc(d.s.p)}"><input data-k=f value="${esc(d.s.f)}"><div style="color:var(--mu);font-size:12px">prefixo e sufixo</div>`,
    recv(d, v) {
      if (typeof v != "object") emit(d, d.s.p + v + d.s.f);
    },
  },
  vibra: {
    i: "📳",
    n: "Vibrar",
    s: {},
    ui: () => `<div class=term style="text-align:center">vibra ao receber</div>`,
    recv() {
      navigator.vibrate && navigator.vibrate(150);
    },
  },
  atraso: {
    i: "⏳",
    n: "Atraso",
    s: { ms: 1000 },
    ui: (d) =>
      `<input data-k=ms type=number value="${d.s.ms}"><div style="color:var(--mu);font-size:12px">milissegundos</div>`,
    recv(d, v) {
      setTimeout(() => emit(d, v), +d.s.ms || 1000);
    },
  },
  nota: {
    i: "📝",
    n: "Nota",
    s: { t: "" },
    w: 1,
    ui: (d) => `<textarea data-k=t rows=4 placeholder="anotações...">${esc(d.s.t)}</textarea>`,
  },
  inverte: {
    i: "🔁",
    n: "Inverter",
    s: {},
    ui: () => `<div class=mu>0 vira 1, ligado vira desligado</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      emit(d, ["", "0", "off", "false", "falso", "nao"].includes(String(v).trim().toLowerCase()) ? 1 : 0);
    },
  },
  porta: {
    i: "🚪",
    n: "Porta",
    s: { open: 1 },
    ui: (d) =>
      `<button data-a=t>${d.s.open ? "ABERTA" : "fechada"}</button><div class=mu>aberta deixa passar. "abrir", "fechar" e "alternar" controlam</div>`,
    act: (d, a, el) => {
      d.s.open = d.s.open ? 0 : 1;
      el.textContent = d.s.open ? "ABERTA" : "fechada";
      save();
    },
    recv(d, v) {
      if (typeof v == "object") return;
      const b = q(d, "[data-a=t]");
      if (v === "abrir" || v === "fechar" || v === "alternar") {
        d.s.open = v === "alternar" ? (d.s.open ? 0 : 1) : v === "abrir" ? 1 : 0;
        b.textContent = d.s.open ? "ABERTA" : "fechada";
        save();
      } else if (d.s.open) emit(d, v);
    },
  },
  mapa: {
    i: "🗺",
    n: "Mapear",
    s: { a: 0, b: 100, c: 0, d: 255 },
    ui: (d) =>
      `<div class=mu>de (mín, máx) para (mín, máx)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><input data-k=a type=number value="${d.s.a}"><input data-k=b type=number value="${d.s.b}"><input data-k=c type=number value="${d.s.c}"><input data-k=d type=number value="${d.s.d}"></div>`,
    recv(d, v) {
      const x = +v,
        { a, b, c, d: e } = Object.fromEntries(Object.entries(d.s).map(([k, y]) => [k, +y]));
      if (typeof v == "object" || isNaN(x) || a == b) return;
      emit(d, Math.round((c + ((x - a) * (e - c)) / (b - a)) * 100) / 100);
    },
  },
  aleat: {
    i: "🎰",
    n: "Aleatório",
    s: { a: 1, b: 100 },
    ui: (d) =>
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><input data-k=a type=number value="${d.s.a}"><input data-k=b type=number value="${d.s.b}"></div><button data-a=r>Sortear</button>`,
    act: (d) => emit(d, H.aleatorio(+d.s.a || 0, +d.s.b || 0)),
    recv(d, v) {
      if (typeof v != "object") emit(d, H.aleatorio(+d.s.a || 0, +d.s.b || 0));
    },
  },
  relogio: {
    i: "🕐",
    n: "Relógio",
    s: { ms: 1000 },
    ui: (d) =>
      `<div class=term style="text-align:center;font-size:20px">--:--:--</div><input data-k=ms type=number value="${d.s.ms}"><button data-a=go>▶ Iniciar</button>`,
    act: (d, a, el) => {
      if (d.h) {
        clearInterval(d.h);
        d.h = 0;
        el.textContent = "▶ Iniciar";
      } else {
        const f = () => {
          const t = new Date().toLocaleTimeString("pt-BR");
          q(d, ".term").textContent = t;
          emit(d, t);
        };
        f();
        d.h = setInterval(f, Math.max(100, +d.s.ms || 1000));
        el.textContent = "⏸ Parar";
      }
    },
    recv(d, v) {
      if (typeof v != "object") emit(d, new Date().toLocaleTimeString("pt-BR"));
    },
  },
  cor: {
    i: "🎨",
    n: "Cor",
    s: { c: "#ff0000" },
    ui: (d) =>
      `<input data-k=c type=color value="${d.s.c}" style="height:44px;padding:2px" oninput="emit(D[this.closest('.card').id.slice(1)],this.value)"><div class=mu>envia o código da cor (ligue na Lâmpada)</div>`,
  },
  grafico: {
    i: "📉",
    n: "Gráfico",
    s: {},
    w: 1,
    ui: () =>
      `<canvas class=px width=240 height=100 style="width:100%;height:100px;image-rendering:auto"></canvas><div class=mu>desenha os números recebidos ("zerar" limpa)</div>`,
    recv(d, v) {
      if (v === "zerar") d.g = [];
      else {
        v = +v;
        if (typeof v == "object" || isNaN(v)) return;
        d.g = (d.g || []).concat(v).slice(-60);
      }
      const g = d.g,
        c = q(d, "canvas"),
        x = c.getContext("2d"),
        w = c.width,
        h = c.height,
        lo = Math.min(...g),
        hi = Math.max(...g),
        r = hi - lo || 1;
      x.clearRect(0, 0, w, h);
      if (!g.length) return;
      x.strokeStyle = "#22c55e";
      x.lineWidth = 2;
      x.beginPath();
      g.forEach((y, i) => {
        const px = i * (w / 59),
          py = h - 4 - ((y - lo) / r) * (h - 8);
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      });
      x.stroke();
      x.fillStyle = "#94a3b8";
      x.font = "10px monospace";
      x.fillText(hi, 2, 10);
      x.fillText(lo, 2, h - 2);
    },
  },
  fila: {
    i: "📋",
    n: "Fila",
    s: {},
    ui: () =>
      `<div class=term style="min-height:60px">vazia</div><div class=mu>guarda tudo que chega. "ler" solta o primeiro, "limpar" esvazia</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      const L = (d.f = d.f || []);
      if (v === "ler") {
        if (L.length) emit(d, L.shift());
      } else if (v === "limpar") d.f = [];
      else L.push(v);
      q(d, ".term").textContent = d.f.length ? d.f.map((x, i) => i + 1 + ". " + x).join("\n") : "vazia";
    },
  },
  seq: {
    i: "🎼",
    n: "Sequência",
    s: { l: "1,2,3", ms: 300 },
    ui: (d) =>
      `<input data-k=l value="${esc(d.s.l)}"><input data-k=ms type=number value="${d.s.ms}"><div class=mu>valores separados por vírgula, enviados um a um (ms entre eles)</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      const L = String(d.s.l)
          .split(",")
          .map((x) => num(x.trim())),
        k = (d.sq = (d.sq || 0) + 1);
      (async () => {
        for (const x of L) {
          if (d.sq != k || D[d.id] !== d) return;
          emit(d, x);
          await sl(+d.s.ms || 300);
        }
      })();
    },
  },
  pisca: {
    i: "💫",
    n: "Pisca",
    s: { ms: 500 },
    ui: (d) =>
      `<input data-k=ms type=number value="${d.s.ms}"><button data-a=go>▶ Iniciar</button><div class=mu>envia 1, 0, 1, 0...</div>`,
    act: (d, a, el) => {
      if (d.h) {
        clearInterval(d.h);
        d.h = 0;
        el.textContent = "▶ Iniciar";
      } else {
        d.n = 0;
        d.h = setInterval(() => emit(d, (d.n = 1 - (d.n || 0))), Math.max(50, +d.s.ms || 500));
        el.textContent = "⏸ Parar";
      }
    },
  },
  semaforo: {
    i: "🚦",
    n: "Semáforo",
    s: {},
    ui: () =>
      `<div class=sem><i></i><i></i><i></i></div><div class=mu>"vermelho", "amarelo", "verde" ou 1, 2, 3</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      const t = String(v).toLowerCase(),
        k = /verm|^1$/.test(t) ? 0 : /amar|^2$/.test(t) ? 1 : /verd|^3$/.test(t) ? 2 : -1,
        C = ["#ef4444", "#facc15", "#22c55e"];
      q(d, ".sem")
        .querySelectorAll("i")
        .forEach((e, i) => {
          e.style.background = i == k ? C[i] : "";
          e.style.boxShadow = i == k ? "0 0 16px " + C[i] : "";
        });
    },
  },
  stats: {
    i: "📐",
    n: "Estatística",
    s: {},
    ui: () =>
      `<div class=term style="text-align:center">sem dados</div><div class=mu>envia a média; "zerar" recomeça</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      if (v === "zerar") {
        d.st = 0;
        q(d, ".term").textContent = "sem dados";
        return;
      }
      v = +v;
      if (isNaN(v)) return;
      const t = (d.st = d.st || { n: 0, sm: 0, lo: v, hi: v });
      t.n++;
      t.sm += v;
      t.lo = Math.min(t.lo, v);
      t.hi = Math.max(t.hi, v);
      const m = Math.round((t.sm / t.n) * 100) / 100;
      q(d, ".term").textContent = "média " + m + "\nmín " + t.lo + " · máx " + t.hi + "\nqtd " + t.n;
      emit(d, m);
    },
  },
  txtfx: {
    i: "🔠",
    n: "Transformar texto",
    s: { m: "MAIÚSCULAS" },
    ui: (d) => SEL("m", ["MAIÚSCULAS", "minúsculas", "Título", "invertido", "sem espaços", "tamanho"], d.s.m),
    recv(d, v) {
      if (typeof v == "object") return;
      const t = String(v),
        m = d.s.m;
      emit(
        d,
        m == "MAIÚSCULAS"
          ? t.toUpperCase()
          : m == "minúsculas"
            ? t.toLowerCase()
            : m == "Título"
              ? t.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
              : m == "invertido"
                ? [...t].reverse().join("")
                : m == "sem espaços"
                  ? t.trim()
                  : t.length,
      );
    },
  },
  falar: {
    i: "🗣",
    n: "Falar",
    s: {},
    ui: () => `<div class=term style="text-align:center">lê em voz alta</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      try {
        const u = new SpeechSynthesisUtterance(String(v));
        u.lang = "pt-BR";
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      } catch (e) {}
    },
  },
  http: {
    i: "🌐",
    n: "Internet (GET)",
    s: { u: "https://api.github.com/zen" },
    w: 1,
    ui: (d) =>
      `<input data-k=u value="${esc(d.s.u)}"><div class=term style="min-height:40px"></div><button data-a=f>Buscar</button><div class=mu>use {x} na URL para colocar o valor recebido. Envia a resposta</div>`,
    act: (d) => T.http.recv(d, ""),
    recv(d, v) {
      if (typeof v == "object") return;
      fetch(String(d.s.u).replace("{x}", encodeURIComponent(v)))
        .then((r) => r.text())
        .then((t) => {
          q(d, ".term").textContent = t.slice(0, 200);
          emit(d, pv(t.slice(0, 4000)));
        })
        .catch((e) => toast("Internet: " + e.message));
    },
  },
  inclina: {
    i: "📱",
    n: "Inclinação",
    s: { e: "esq/dir" },
    ui: (d) =>
      `${SEL("e", ["esq/dir", "frente/trás"], d.s.e)}<div class=term style="text-align:center">0</div><button data-a=t>Ativar sensor</button>`,
    act: (d, a, el) => {
      const go = () => {
        const f = (e) => {
          if (D[d.id] !== d || !d.on) {
            removeEventListener("deviceorientation", f);
            return;
          }
          const n = Date.now();
          if (n - (d.lt || 0) < 100) return;
          d.lt = n;
          const v = Math.round(d.s.e == "frente/trás" ? e.beta : e.gamma) || 0;
          q(d, ".term").textContent = v;
          emit(d, v);
        };
        d.on = 1;
        addEventListener("deviceorientation", f);
        el.textContent = "Ativo (toque p/ parar)";
      };
      if (d.on) {
        d.on = 0;
        el.textContent = "Ativar sensor";
        return;
      }
      typeof DeviceOrientationEvent != "undefined" && DeviceOrientationEvent.requestPermission
        ? DeviceOrientationEvent.requestPermission().then((r) =>
            r == "granted" ? go() : toast("Permissão negada"),
          )
        : go();
    },
  },
  copiar: {
    i: "📎",
    n: "Copiar",
    s: {},
    ui: () => `<div class=term style="text-align:center">copia para a área de transferência</div>`,
    recv(d, v) {
      if (typeof v == "object") return;
      navigator.clipboard.writeText(String(v)).then(
        () => toast("Copiado"),
        () => toast("Não consegui copiar"),
      );
    },
  },
};
const SEL = (k, o, c) =>
  `<select data-k=${k} style="font-size:16px;padding:6px;background:var(--in);color:var(--tx);border:1px solid var(--bd);border-radius:8px">${o.map((x) => `<option${x == c ? " selected" : ""}>${x}</option>`).join("")}</select>`;
function mk(d) {
  const t = T[d.type],
    e = document.createElement("div");
  e.className = "card" + (t.w ? " wide" : "") + (t.sm ? " sm" : "");
  e.id = "c" + d.id;
  e.style.left = d.x + "px";
  e.style.top = d.y + "px";
  e.dataset.cat = CATK[d.type] ?? 9; // cor da categoria
  e.innerHTML = `<div class=hd><i class=ic>${t.i}</i><span>${t.n}</span><i class=port data-p=${d.id} title="Ligar fio"></i></div><div class=bd>${t.ui(d)}</div><div class=ft><small>#${d.id}</small><b class=x data-c=${d.id} title="Duplicar">⧉</b><b class=x data-x=${d.id} title="Apagar">✕</b></div>`;
  world.append(e);
}
function add(type, x, y, s) {
  const d = { id: nid++, type, x, y, s: { ...T[type].s, ...s } };
  if (type == "comand" && !d.s.lang) {
    const g = glang(d);
    if (g) d.s.lang = g;
  }
  D[d.id] = d;
  mk(d);
  track("add", type);
  return d;
}
function addT(k) {
  if (T[k].lv && !liberado(T[k].lv)) return toast(`🔒 ${T[k].n} libera no nível ${T[k].lv}. Veja as missões em 🎯`);
  const preco = T[k].price;
  if (preco) {
    if (CR[k] > 0 && !ECO.f) {
      CR[k]--;
      saveM();
      toast("🎁 Item do Starter Pack");
    } else if (!pay(preco)) return;
  }
  snap();
  $("#sheet").classList.remove("open");
  const d = add(k, (view.clientWidth / 2 - V.x) / V.s - 85, (view.clientHeight / 2 - V.y) / V.s - 80);
  lugarLivre(d);
  wires();
  save();
}
// Procura, em volta do centro da tela, um lugar onde o cartão novo não cubra nenhum outro
function lugarLivre(d) {
  const e = $("#c" + d.id),
    w = e.offsetWidth,
    h = e.offsetHeight,
    outros = Object.values(D)
      .filter((o) => o !== d)
      .map((o) => {
        const c = $("#c" + o.id);
        return { x: o.x, y: o.y, w: c ? c.offsetWidth : 170, h: c ? c.offsetHeight : 150 };
      }),
    livre = (x, y) => !outros.some((o) => x < o.x + o.w + 10 && o.x < x + w + 10 && y < o.y + o.h + 10 && o.y < y + h + 10);
  const x0 = d.x,
    y0 = d.y;
  for (let r = 0; r <= 30; r++)
    for (let i = -r; i <= r; i++)
      for (const [dx, dy] of [[i, -r], [i, r], [-r, i], [r, i]]) {
        const x = Math.round((x0 + dx * 36) / 12) * 12,
          y = Math.round((y0 + dy * 36) / 12) * 12;
        if (livre(x, y)) {
          d.x = x;
          d.y = y;
          e.style.left = x + "px";
          e.style.top = y + "px";
          // se saiu da tela, leva a câmera até ele
          const sx = x * V.s + V.x,
            sy = y * V.s + V.y;
          if (sx < 0 || sy < 0 || sx + w * V.s > view.clientWidth || sy + h * V.s > view.clientHeight) {
            V.x = view.clientWidth / 2 - (x + w / 2) * V.s;
            V.y = view.clientHeight / 2 - (y + h / 2) * V.s;
            apply();
          }
          return;
        }
      }
}
