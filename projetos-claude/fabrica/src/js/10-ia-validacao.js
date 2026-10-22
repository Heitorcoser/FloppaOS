/* ---- IA esperta: validação, conserto, desfazer ---- */
const CMDW = [
  "mostrar",
  "enviar",
  "log",
  "esperar",
  "pixel",
  "limpar",
  "bip",
  "retangulo",
  "vibrar",
  "linha",
  "circulo",
  "fundo",
  "imagem",
  "tocar",
  "texto",
  "parar",
];
const okx = (e) => {
  try {
    new Function("E", "with(E){return(" + tr(e) + ")}");
    return 1;
  } catch (x) {
    return 0;
  }
};
function lint(code, lang) {
  const E = [];
  lang = lang || glang({ s: { code } });
  if (lang == "py") return E;
  if (lang == "js" || lang == "jsx") {
    try {
      new AF("E", "with(E){" + code + "\n}");
    } catch (e) {
      E.push("JS inválido: " + e.message);
    }
    if (/\[[^\]]*\]\s*=\s*tela\(/.test(code))
      E.push("tela() devolve o fb direto: use const fb = tela(32,32), sem desestruturar");
    return E;
  }
  let dp = 0;
  String(code)
    .split("\n")
    .forEach((r, i) => {
      const l = r.trim();
      if (!l || l[0] == "#") return;
      const p = "linha " + (i + 1) + ": ",
        w = l.split(/\s+/)[0].toLowerCase();
      let m;
      if ((m = l.match(/^se (.+) entao$/i))) {
        dp++;
        okx(m[1]) || E.push(p + "condição inválida");
      } else if (/^se\b/i.test(l)) E.push(p + '"se" precisa terminar com "entao"');
      else if (/^senao$/i.test(l)) {
        dp || E.push(p + "senao sem se");
      } else if (/^fim$/i.test(l)) {
        if (--dp < 0) {
          E.push(p + "fim sobrando");
          dp = 0;
        }
      } else if ((m = l.match(/^(repetir|enquanto) (.+)$/i))) {
        dp++;
        okx(m[2]) || E.push(p + "expressão inválida");
      } else if ((m = l.match(/^para (\w+) de (.+) ate (.+)$/i))) {
        dp++;
        (okx(m[2]) && okx(m[3])) || E.push(p + "expressão inválida");
      } else if (/^(if|else|elif|end|endif|while|for|def|function|print|return|let|var|const)\b/i.test(l))
        E.push(p + '"' + w + '" não existe no Comand (veja as regras)');
      else if ((m = l.match(/^([A-Za-z_]\w*)\s*(\+|-|\*|\/)?=(?!=)\s*(.+)$/)))
        okx(m[3]) || E.push(p + "expressão inválida");
      else if (CMDW.includes(w) || CMDS[w]) {
        const a = l.slice(w.length).trim();
        !a || okx("[" + a + "]") || E.push(p + 'argumentos inválidos em "' + w + '"');
      } else okx(l) || E.push(p + "não entendi: " + l);
    });
  if (dp > 0) E.push('falta "fim" (' + dp + ")");
  return E.slice(0, 8);
}
function chk(raw) {
  const E = [],
    re = /```(\w*)\n?([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(raw))) {
    const l = m[1].toLowerCase(),
      c = m[2];
    if (/^(comand|js|jsx|javascript|python|py)$/.test(l) && c.trim().length < 30)
      E.push("bloco " + l + " está vazio ou incompleto; escreva o código COMPLETO");
    if (l == "comand") lint(c, "").forEach((e) => E.push("bloco comand, " + e));
    else if (l == "jsx" || l == "js" || l == "javascript")
      lint(c, l == "jsx" ? "jsx" : "js").forEach((e) => E.push("bloco " + l + ", " + e));
    else if (l == "fabrica" || (/^(json|)$/.test(l) && /"(aparelhos|devices)"/.test(c)))
      try {
        const j = pj(c),
          ids = new Set();
        const cu = custoBloco(j);
        if (!ECO.f && cu > M)
          E.push(`custa $${cu} e o jogador só tem $${Math.floor(M)}. Use aparelhos mais baratos (veja PREÇOS; Venda $${T.venda.price} em vez de Mercado $${T.mercado.price}) ou diga quanto falta, sem bloco fabrica`);
        if (j.planejar && !achaItem(String(j.planejar)))
          E.push("planejar: item desconhecido. Use um destes: " + Object.keys(ITENS).join(", "));
        (j.aparelhos || j.devices || []).forEach((a, i) => {
          const k = nk(a.tipo || a.type);
          if (!Object.hasOwn(T, k) && !Object.hasOwn(AL, k))
            E.push("tipo de aparelho inexistente: " + (a.tipo || a.type));
          ids.add(a.id !== undefined ? a.id : i + 1);
          if (k == "comand" && a.s && a.s.code)
            lint(a.s.code, a.s.lang || "").forEach((e) => E.push("aparelho " + (a.id || i + 1) + ", " + e));
        });
        (j.fios || j.wires || []).forEach((w) => {
          if (!Array.isArray(w) || !ids.has(w[0]) || !ids.has(w[1]))
            E.push("fio com id inexistente: " + JSON.stringify(w));
        });
        (j.comandos || []).forEach((x) =>
          lint(x.corpo || x.body || "", "").forEach((e) =>
            E.push("comando " + (x.nome || x.name) + ", " + e),
          ),
        );
      } catch (e) {
        E.push("fabrica: " + e.message);
      }
  }
  return E.slice(0, 8);
}
const EXTRA = `\nMÉTODO (siga sempre): 1) decida o mínimo de aparelhos; 2) escreva o código; 3) RELEIA o código linha por linha contra as regras de sintaxe antes de responder; 4) responda só com os blocos. O app valida seu código e devolve os erros; corrija sem se desculpar.\nEDITAR O QUE JÁ EXISTE: o bloco fabrica também aceita "editar":[{"id":3,"s":{"code":"..."}}] (id do PROJETO ATUAL) e "remover":[ids]. Se o usuário pedir ajuste, edite em vez de recriar. Se um aparelho tiver "erros", conserte o código dele.\nBOAS PRÁTICAS: jogos com Timer de 100-250 ms (Comand fácil) ou 33 ms (JavaScript rápido); fim de jogo com placar e reinício na tecla A; sempre limite as bordas; use aleatorio() para itens.\nIA DE INIMIGOS (faça inteligente, não aleatória): persiga o jogador comparando coordenadas (se ex < px entao ex += 1 senao se ex > px entao ex -= 1), escolha o eixo de maior distância (abs(ex - px) > abs(ey - py)), mova a cada 2 ou 3 tiques para ser justo, desvie de paredes testando a próxima célula antes de entrar, fuja quando o jogador estiver forte, e acrescente um pouco de aleatoriedade para não ser previsível. Nunca teleporte.\nJAVASCRIPT e JAVASCRIPT RÁPIDO são o mesmo: use tela(w,h) com fb.* OU as funções diretas pixel(x,y,"cor"), retangulo(x,y,l,a,"cor"), linha(x1,y1,x2,y2,"cor"), circulo(x,y,r,"cor"), fundo("cor"), limpar() e texto(t,x,y,"cor",tamanho) (desenha letras; tamanho 1 = 8px). Estado fica em S (ex: S.vidas). Só chame fb.mostrar() se usar tela(). Não existe print, console nem document. Escreva o código COMPLETO e funcional, nunca vazio nem com "// resto aqui". tela(w,h) devolve o fb direto (NÃO é array). EXEMPLO: const fb = tela(32,32); if(!S.ok){S.ok=1;S.x=16} if(teclas.esquerda)S.x--; if(teclas.direita)S.x++; fb.limpar("#102"); fb.ret(S.x,28,4,2,"lime"); fb.texto("Oi",1,1,"white",8); fb.mostrar(); Todo jogo precisa de um Display Pixel ligado ao Conjunto.\n`;
function mkSys() {
  const P = Object.values(D).map((d) => {
    const o = { id: d.id, tipo: d.type };
    if (d.type == "comand") {
      o.lang = d.s.lang || "";
      o.code = String(d.s.code).slice(0, 700);
      const e = (d.cl || []).slice(-2).filter((x) => x.includes("⚠"));
      if (e.length) o.erros = e;
    } else {
      const x = JSON.stringify(d.s);
      if (x != "{}") o.s = d.s;
    }
    return o;
  });
  return (
    SYS.replace(/~~~/g, "```") +
    EXTRA +
    promptFabricas() +
    contextoExtra() +
    "\nPROJETO ATUAL: " +
    JSON.stringify({ aparelhos: P, fios: W, variaveis: VARS, comandos: Object.keys(CMDS) }).slice(0, 3500) +
    langNote()
  );
}
// Valida a sintaxe e roda o código de verdade; se achar erro, pede para a IA corrigir (até 2 vezes)
async function verifica(raw, w) {
  const E = chk(raw);
  if (E.length) return { E, ok: [] };
  if (w && codigosJs(raw).length) w.insertAdjacentHTML("beforeend", "<div class=nota>🧪 Testando o código...</div>");
  const r = await testaResposta(raw);
  if (w && w.lastChild && w.lastChild.className == "nota") w.lastChild.remove();
  return r;
}
async function post(w) {
  let raw = HIST[HIST.length - 1].content,
    V = await verifica(raw, w);
  for (let i = 0; i < 2 && V.E.length && $("#fix").checked; i++) {
    WS = w;
    w.textContent = "🔧 Achei " + V.E.length + " problema(s). Corrigindo sozinha...";
    try {
      const j = await groq({
        model: $("#am").value.trim(),
        messages: [
          { role: "system", content: mkSys() },
          ...HIST.slice(-9),
          {
            role: "user",
            content:
              "O app testou sua resposta e achou problemas:\n- " +
              V.E.join("\n- ") +
              "\nResponda de novo COMPLETO e corrigido, mesmos blocos, sem pedir desculpas.",
          },
        ],
        temperature: 0.1,
      });
      raw = j.choices[0].message.content;
      HIST[HIST.length - 1] = { role: "assistant", content: raw };
      showAns(w, raw, j);
      if (LAST) {
        await autoCont();
        raw = HIST[HIST.length - 1].content;
      }
    } catch (e) {
      w.textContent = "Erro: " + e.message;
      return;
    }
    V = await verifica(raw, w);
  }
  const n = document.createElement("div");
  if (V.E.length) {
    n.className = "nota av";
    n.textContent = "⚠ Ainda pode ter erro: " + V.E.slice(0, 3).join(" · ");
  } else if (V.ok.length) {
    n.className = "nota ok";
    n.textContent = "🧪 Testei: rodou 60 tiques com os botões, sem erro, e desenhou na tela.";
  }
  if (n.className) w.append(n);
  if (!V.E.length && $("#apl").checked) autoApply(raw);
}
function autoApply(raw) {
  const p = raw.split(/```(\w*)\n?([\s\S]*?)```/),
    x = xc(p)[0] ? xc(p) : nearCode(CB.length - 1);
  try {
    for (let k = 1; k < p.length; k += 3)
      if (p[k].toLowerCase() == "fabrica") return build(p[k + 1], x[0], x[1]);
    if (x[0]) {
      snap();
      add("comand", -V.x / V.s + 10, -V.y / V.s + 10, { code: x[0], lang: x[1] });
      wires();
      save();
      $("#ai").classList.remove("open");
      toast("Comand criado");
    }
  } catch (e) {
    toast("Erro: " + e.message);
  }
}
function fixCmd(d) {
  const e = (d.cl || []).slice(-6).join("\n");
  $("#ai").classList.add("open");
  $("#ain").value =
    "Conserte e melhore o Comand id " +
    d.id +
    ". Problema:\n" +
    (e || "(sem erro, mas não faz o que eu quero)") +
    '\nUse "editar" no bloco fabrica com o id ' +
    d.id +
    ".";
  ask();
}
