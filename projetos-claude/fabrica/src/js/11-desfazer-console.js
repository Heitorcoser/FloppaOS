let UH = [];
function snap() {
  RH.length = 0;
  if (!Object.keys(D).length && !W.length) return;
  UH.push(
    JSON.stringify({
      D: Object.values(D).map((d) => ({ id: d.id, type: d.type, x: d.x, y: d.y, s: d.s })),
      W,
      VARS,
      CMDS,
    }),
  );
  if (UH.length > 30) UH.shift();
}
function undo() {
  const j = UH.pop();
  if (!j) {
    toast("Nada para desfazer");
    return;
  }
  RH.push(stJ());
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
  toast("↩ Desfeito");
}
addEventListener("keydown", (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key == "z" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
  ) {
    e.preventDefault();
    undo();
  }
});
function glang(d) {
  const c = String(d.s.code || ""),
    l = d.s.lang || "";
  if (l) return l;
  if (/^\s*(def |import |from \w+ import)/m.test(c)) return "py";
  return /\b(const|let|function)\s|=>|\bfb\.|\bS\./.test(c) ? (/tela\(|\bfb\./.test(c) ? "jsx" : "js") : "";
}
const TC = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
const DN = ["pixel", "retangulo", "linha", "circulo", "fundo", "limpar", "mostrar", "texto", "parar"];
const DRAW = (d) => {
  const e = (v) => emit(d, v);
  return [
    (x, y, c) => e({ px: [x, y, c || "#fff"] }),
    (x, y, w, h, c) => e({ rc: [x, y, w, h, c || "#fff"] }),
    (a, b, x, y, c) => e({ ln: [a, b, x, y, c || "#fff"] }),
    (x, y, r, c) => e({ ci: [x, y, r, c || "#fff"] }),
    (c) => e({ clr: 1, bg: c }),
    () => e({ clr: 1 }),
    (v) => e(v),
    (t, x, y, c, z) => (d.fb ? d.fb.texto(t, x, y, c, z) : e({ tx: [String(t), x, y, c || "#fff", z || 8] })),
    () => {
      throw "parado";
    },
  ];
};
function nearCode(n) {
  const ok = (i) => ["comand", "javascript", "js", "jsx", "python", "py"].includes(CL[i]);
  let b = -1;
  for (let k = 0; k < 8 && b < 0; k++) {
    if (n - k >= 0 && ok(n - k)) b = n - k;
    else if (ok(n + k)) b = n + k;
  }
  if (b < 0) return [];
  const l = CL[b];
  return [CB[b], l == "comand" ? "" : l == "jsx" ? "jsx" : l == "python" || l == "py" ? "py" : "js"];
}
function copyTxt(t) {
  try {
    if (navigator.clipboard && window.isSecureContext)
      return navigator.clipboard.writeText(t).then(
        () => toast("Copiado"),
        () => copyTxt2(t),
      );
  } catch (e) {}
  copyTxt2(t);
}
function copyTxt2(t) {
  const a = document.createElement("textarea");
  a.value = t;
  a.style.cssText = "position:fixed;left:0;top:0;opacity:0";
  document.body.append(a);
  a.select();
  let ok = 0;
  try {
    ok = document.execCommand("copy");
  } catch (e) {}
  a.remove();
  if (ok) toast("Copiado");
  else {
    modal(
      "<div>Toque e segure no texto para copiar:</div><pre>" +
        esc(t) +
        '</pre><button class=it onclick="cm()">Fechar</button>',
    );
  }
}
const CMDHELP = `/jogo  monta Controle, Conjunto, Timer, Comand e Display ligados
/add tipo [x y]  cria aparelho (ex: /add lampada)
/ligar 1 2   ·   /desligar 1 2
/remover 3
/codigo 4 [js|jsx|py|comand]  as linhas seguintes viram o código do Comand #4
/var nome valor
/lista   ·   /limpar
Sem "/": cole a resposta de outra IA (blocos jsx, comand, fabrica ou JSON) e toque em Aplicar. O número #id aparece no título de cada aparelho.`;
function consoleUI() {
  modal(
    `<div style="font-weight:700">🧰 Comandos e outras IAs</div><div style="color:var(--mu);font-size:12px">1) Copie as instruções e cole na IA que preferir (ChatGPT, Claude, Gemini...). 2) Cole a resposta dela aqui e toque em Aplicar. Também aceita comandos que começam com / (veja /ajuda).</div><button class=it style="flex-direction:row" onclick="copyPrompt()">📋 Copiar instruções para outra IA</button><textarea id="cin" rows="8" spellcheck="false" autocapitalize="off" placeholder="Cole a resposta da outra IA ou digite comandos com /"></textarea><button class=it style="flex-direction:row" onclick="runIn()">▶ Aplicar</button><div id="clog" class="term" style="max-height:140px"></div><button class=it onclick="cm()">Fechar</button>`,
  );
}
function copyPrompt() {
  copyTxt(
    mkSys() +
      "\nPEDIDO DO USUÁRIO: (escreva aqui o que você quer). Responda só com os blocos de código pedidos acima.",
  );
}
function applyText(t) {
  t = t.trim();
  const p = t.split(/```(\w*)\n?([\s\S]*?)```/),
    OK = ["", "comand", "js", "jsx", "javascript", "python", "py"];
  let fab = null,
    code = null,
    lang = "";
  if (p.length > 1) {
    for (let k = 1; k < p.length; k += 3) {
      const l = p[k].toLowerCase(),
        c = p[k + 2];
      if (l == "fabrica" || (/^(json|)$/.test(l) && /"(aparelhos|devices)"/.test(c))) {
        fab = fab || c;
      } else if (!code && OK.includes(l)) {
        code = c;
        lang =
          l == "jsx" ? "jsx" : l == "python" || l == "py" ? "py" : l == "js" || l == "javascript" ? "js" : "";
      }
    }
  } else if (/^\{[\s\S]*\}$/.test(t)) fab = t;
  else code = t;
  if (code && !lang) lang = glang({ s: { code } });
  if (fab) return build(fab, code, lang);
  if (code) {
    snap();
    add("comand", (-V.x + view.clientWidth / 2) / V.s - 100, (-V.y + view.clientHeight / 2) / V.s - 100, {
      code,
      lang,
    });
    wires();
    save();
    toast("Comand criado");
    return;
  }
  throw new Error("Não achei código nem JSON");
}
function runIn() {
  const t = $("#cin").value,
    L = $("#clog"),
    out = (x) => {
      L.textContent += x + "\n";
      L.scrollTop = 1e5;
    };
  L.textContent = "";
  if (!t.trim()) {
    out("Nada para aplicar");
    return;
  }
  try {
    if (t.trim()[0] == "/") cmds(t, out);
    else {
      const E = chk(t);
      E.forEach((e) => out("⚠ " + e));
      applyText(t);
      out("✔ Aplicado" + (E.length ? " (com avisos)" : ""));
    }
  } catch (e) {
    out("✖ " + e.message);
  }
}
function cmds(t, out) {
  const ls = t.split("\n"),
    bx = -V.x / V.s + 20,
    by = -V.y / V.s + 20;
  let i = 0;
  while (i < ls.length) {
    const l = ls[i++].trim();
    if (!l) continue;
    const [w, ...a] = l.replace(/^\//, "").split(/\s+/),
      c = w.toLowerCase();
    if (c == "add" || c == "criar") {
      const k = nk(a[0]),
        ty = Object.hasOwn(T, k) ? k : AL[k];
      if (!ty) {
        out("✖ tipo desconhecido: " + a[0]);
        continue;
      }
      snap();
      const d = add(
        ty,
        a[1] !== undefined ? +a[1] : bx + Math.random() * 80,
        a[2] !== undefined ? +a[2] : by + Math.random() * 80,
      );
      wires();
      save();
      out("✔ " + T[ty].n + " #" + d.id);
    } else if (c == "ligar" || c == "desligar") {
      const x = +a[0],
        y = +a[1];
      if (!D[x] || !D[y] || x == y) {
        out("✖ ids inválidos");
        continue;
      }
      const j = W.findIndex((q) => q.includes(x) && q.includes(y));
      snap();
      if (c == "ligar") {
        if (j < 0) W.push([x, y]);
      } else if (j >= 0) W.splice(j, 1);
      wires();
      save();
      out("✔ " + c + " " + x + " " + y);
    } else if (c == "remover" || c == "apagar") {
      const x = +a[0];
      if (!D[x]) {
        out("✖ id inválido");
        continue;
      }
      del(x);
      out("✔ removido #" + x);
    } else if (c == "codigo") {
      const x = +a[0],
        b = [];
      while (i < ls.length && ls[i].trim()[0] != "/") b.push(ls[i++]);
      if (!D[x] || D[x].type != "comand") {
        out("✖ #" + a[0] + " não é um Comand");
        continue;
      }
      const code = b.join("\n").replace(/^\s*```\w*\n?|\n?```\s*$/g, ""),
        lg = a[1]
          ? ({ js: "js", jsx: "jsx", py: "py", python: "py", comand: "" }[a[1].toLowerCase()] ?? "")
          : glang({ s: { code } });
      build({ editar: [{ id: x, s: { code, lang: lg } }] });
      out("✔ código no Comand #" + x + " (" + (lg || "comand") + ")");
      lint(code, lg).forEach((e) => out("⚠ " + e));
    } else if (c == "jogo") {
      snap();
      const P = [
          ["ctl", 20, 20, {}],
          ["hub", 215, 20, {}],
          ["timer", 215, 100, { ms: 33 }],
          ["comand", 215, 230, {}],
          ["disp", 20, 200, { n: 32 }],
        ],
        d = P.map(([k, x, y, s]) => add(k, bx + x, by + y, s));
      [
        [0, 1],
        [2, 1],
        [3, 1],
        [4, 1],
      ].forEach(([p, q]) => W.push([d[p].id, d[q].id]));
      wires();
      save();
      out("✔ jogo montado. Comand é #" + d[3].id + ". Use: /codigo " + d[3].id + " jsx");
    } else if (c == "lista") {
      Object.values(D).forEach((d) => out("#" + d.id + " " + T[d.type].n));
      out("fios: " + (W.map((w) => w.join("-")).join("  ") || "nenhum"));
    } else if (c == "var") {
      setVar(a[0], a.slice(1).join(" "));
      out("✔ variável " + a[0]);
    } else if (c == "limpar") {
      reset();
      wires();
      save();
      out("✔ tudo apagado");
    } else if (c == "ajuda") out(CMDHELP);
    else out("✖ comando desconhecido: " + c + " (use /ajuda)");
  }
}
