/* ---- tutorial guiado e guia "Como jogar" ---- */
// Cada passo: título, texto, alvo (elemento destacado), ok (quando avança sozinho) e botões
const contou = (k) => (PROG.c[k] || 0) > (TUT.base[k] || 0);
const ultimo = (tipo) =>
  Object.values(D)
    .filter((d) => d.type == tipo)
    .sort((a, b) => b.id - a.id)[0];
const PASSOS = [
  {
    t: "Bem-vindo à Fábrica de Tudo! 🏭",
    d: "Aqui você liga aparelhos com fios para criar sistemas, jogos e fábricas inteiras. Leva 2 minutos para aprender o básico.",
    b: [["Começar", "tutProx()"], ["Agora não", "tutFim(1)"]],
  },
  {
    t: "1. Adicione um aparelho",
    d: "Toque no botão ＋ laranja aqui embaixo.",
    alvo: () => $("#dock .add"),
    ok: () => $("#sheet").classList.contains("open"),
  },
  {
    t: "2. Escolha o 💬 Valor",
    d: "Ele guarda um texto e envia quando você toca em Enviar. Está na aba Entrada.",
    alvo: () => ($("#sheet").classList.contains("open") ? $(`#shl .it[onclick="addT('valor')"]`) : $("#dock .add")),
    ok: () => contou("add:valor"),
  },
  {
    t: "3. Agora uma 💡 Lâmpada",
    d: "Abra o ＋ de novo e pegue a Lâmpada (aba Saída). Dica: dá para buscar pelo nome.",
    alvo: () => ($("#sheet").classList.contains("open") ? $(`#shl .it[onclick="addT('lamp')"]`) : $("#dock .add")),
    ok: () => contou("add:lamp"),
  },
  {
    t: "4. Ligue os dois com um fio",
    d: "Toque na bolinha colorida ● no título do Valor e depois na bolinha da Lâmpada.",
    alvo: () => {
      const v = ultimo(sel === null ? "valor" : "lamp");
      return v && $(`#c${v.id} .port`);
    },
    ok: () => contou("fio"),
  },
  {
    t: "5. Acenda a lâmpada!",
    d: "No Valor, apague o texto, escreva uma cor (por exemplo verde) e toque em Enviar.",
    alvo: () => {
      const v = ultimo("valor");
      return v && $(`#c${v.id} [data-a=send]`);
    },
    ok: () => contou("lamp"),
  },
  {
    t: "6. Andar pela mesa",
    d: "Arraste um cartão pelo título para mover. Arraste o fundo para andar. Use − ⌖ + (ou dois dedos) para o zoom. ⌖ centraliza tudo.",
    alvo: () => $("#zoom"),
    b: [["Próximo", "tutProx()"]],
  },
  {
    t: "7. Fábricas e dinheiro",
    d: "No ＋ estão Extração, Máquinas e Logística. O ⛏️ Extrator tira recursos, a 🔥 Fornalha transforma e o 🏪 Mercado vende. Cada máquina tem receitas para escolher.",
    b: [["Ver uma linha pronta", "exemplo(14);tutProx()"], ["Próximo", "tutProx()"]],
  },
  {
    t: "8. Missões e nível",
    d: "Aqui ficam seu nível e as missões. Cumprir dá dinheiro e XP, e cada nível libera máquinas e receitas novas.",
    alvo: () => $("#nvl"),
    b: [["Ver missões", "tutProx();progressoUI()"], ["Próximo", "tutProx()"]],
  },
  {
    t: "9. Programar e pedir ajuda",
    d: "O 📟 Comand roda código (fácil, JavaScript ou Python). A 🤖 IA escreve o código e monta sistemas para você.",
    alvo: () => $("#dock button:nth-child(2)"),
    b: [["Próximo", "tutProx()"]],
  },
  {
    t: "Pronto, engenheiro! 🎉",
    d: "O guia completo fica em ⋯ › Como jogar. Você ganhou 30 XP por terminar o tutorial.",
    b: [["Terminar", "tutFim()"], ["Abrir o guia", "tutFim();comoJogar()"]],
  },
];
const TUT = { i: -1, base: {}, h: 0 };
function tutorial(desdeInicio) {
  TUT.i = desdeInicio ? 1 : 0;
  TUT.base = { ...PROG.c };
  let c = $("#tut");
  if (!c) {
    c = document.createElement("div");
    c.id = "tut";
    c.setAttribute("role", "dialog");
    document.body.append(c);
    const r = document.createElement("div");
    r.id = "tutalvo";
    document.body.append(r);
  }
  tutMostra();
  clearInterval(TUT.h);
  TUT.h = setInterval(tutTique, 300);
}
function tutMostra() {
  const p = PASSOS[TUT.i],
    c = $("#tut");
  if (!p || !c) return;
  c.innerHTML = `<div class=tutn>${TUT.i ? `Passo ${TUT.i} de ${PASSOS.length - 2}` : "Tutorial"}<button class=x onclick="tutFim(1)" aria-label="Fechar tutorial">✕</button></div><b>${p.t}</b><p>${p.d}</p>${p.b ? `<div class=tutb>${p.b.map(([l, f], k) => `<button class="${k ? "it" : "ok"}" onclick="${f}">${l}</button>`).join("")}</div>` : `<div class=mu>Faça a ação para continuar · <a href="#" onclick="tutProx();return false">pular passo</a></div>`}`;
  c.style.display = "block";
  tutTique();
}
function tutTique() {
  const p = PASSOS[TUT.i],
    c = $("#tut"),
    r = $("#tutalvo");
  if (!p || !c) return;
  if (p.ok && p.ok()) return tutProx();
  const a = p.alvo && p.alvo(),
    vis = a && a.getClientRects().length,
    b = vis && a.getBoundingClientRect();
  // fica em cima quando o catálogo ou uma janela está aberta, ou quando o alvo está na metade de baixo
  const emCima =
    $("#sheet").classList.contains("open") ||
    $("#modal").classList.contains("open") ||
    (b && b.top + b.height / 2 > innerHeight * 0.45 && !a.closest("#dock"));
  c.classList.toggle("cima", !!emCima);
  if (vis) {
    Object.assign(r.style, { display: "block", left: b.left - 6 + "px", top: b.top - 6 + "px", width: b.width + 12 + "px", height: b.height + 12 + "px" });
  } else r.style.display = "none";
}
function tutProx() {
  TUT.i++;
  TUT.base = { ...PROG.c };
  if (TUT.i >= PASSOS.length) return tutFim();
  tutMostra();
}
function tutFim(pulou) {
  clearInterval(TUT.h);
  const c = $("#tut"),
    r = $("#tutalvo");
  if (c) c.style.display = "none";
  if (r) r.style.display = "none";
  let ja = 0;
  try {
    ja = localStorage.getItem("fabtut") == "feito";
    localStorage.setItem("fabtut", "feito");
  } catch (e) {}
  if (pulou) toast("Tutorial guardado em ⋯ › Tutorial guiado");
  else if (!ja) xp(30);
}

// Guia completo, sempre disponível no menu
const GUIA = [
  [
    "🧩 O básico",
    `Tudo é feito de <b>aparelhos</b> (os cartões) ligados por <b>fios</b>. Um aparelho envia um sinal (um número, um texto ou um item) e quem está ligado nele recebe.
• <b>＋</b> abre o catálogo: busque pelo nome ou use as abas.
• <b>Fio</b>: toque na bolinha ● de um aparelho e depois na de outro. Repita (ou toque no fio) para tirar.
• <b>🔗 Conjunto</b>: tudo ligado nele recebe o que qualquer um enviar. Ligados direto, os aparelhos só falam com o vizinho.
• <b>⏹ Parar</b> desliga timers e programas. <b>↩ Desfazer</b> volta o último passo.`,
  ],
  [
    "🗺️ A mesa",
    `Arraste o cartão pelo título para mover. Arraste o fundo para andar. Zoom com − e + ou com dois dedos; ⌖ centraliza tudo. No rodapé do cartão: ⧉ duplica e ✕ apaga (aparelho pago devolve metade). Em ⋯ › Organizar cartões, nada fica um em cima do outro.`,
  ],
  [
    "🏭 Fábricas",
    `Uma linha de produção vai da <b>extração</b> até a <b>venda</b>:
1. ⛏️ <b>Extrator</b>: escolha o recurso (minério, carvão, areia, madeira, cobre, água, petróleo, algodão) e toque em Iniciar.
2. <b>Máquinas</b> (🔥 Fornalha, 🪚 Serraria, 🛠️ Oficina, 🧵 Trefiladora, 🏭 Refinaria, 💾 Eletrônicos, 🏗️ Montagem, 🚀 Base Espacial): cada uma tem várias receitas na lista. Ela junta as entradas e solta o produto.
3. Venda no 💵 <b>Venda</b> (preço fixo) ou no 🏪 <b>Mercado</b> (paga mais, mas o preço cai se vender demais do mesmo item).
4. 📜 <b>Contratos</b> pedem uma quantidade de um item com prazo e pagam um prêmio grande.
Logística: 🔀 <b>Divisor</b> reparte entre as saídas, 🚦 <b>Filtro de itens</b> deixa passar só um item e 📦 <b>Armazém</b> guarda ou deixa passar.
Toque em ⬆ Nível para a máquina ficar mais rápida. Veja todas as receitas em ⋯ › Itens e receitas.`,
  ],
  [
    "🎯 Missões e níveis",
    `O botão <b>Nv</b> lá em cima mostra seu nível. Você ganha XP produzindo, vendendo, cumprindo contratos, missões e conquistas. Cada nível libera recursos, máquinas e receitas novas. A bolinha vermelha avisa que tem missão pronta para receber.`,
  ],
  [
    "💰 Economia",
    `O dinheiro vem das vendas. Compre 🔲 <b>Processadores</b> e ligue com fio direto numa Tela ou PC: sem processador a tela fica em 16×16 e o PC fica lento. ₿ <b>Minerador</b> acha Bitcoin usando processador e gastando energia; venda na 📈 Corretora. O 🎁 Starter Pack dá um empurrão no começo.`,
  ],
  [
    "📟 Programar",
    `O <b>Comand</b> roda código quando recebe um sinal. Linguagens: Comand (fácil, em português), JavaScript, JavaScript rápido (jogos grandes) e Python. Para jogos: ligue 🎮 Controle, ⏱ Timer, 📟 Comand e 🟦 Display Pixel num 🔗 Conjunto. Veja a linguagem em ⋯ › Linguagem do Comand e os 🧪 Exemplos prontos.`,
  ],
  [
    "🤖 Assistente",
    `A IA monta sistemas inteiros e escreve código. Ela usa uma chave grátis da Groq (⚙ no topo do painel). Também dá para usar outra IA: ⋯ › Comandos / colar de outra IA.`,
  ],
  [
    "🎮 Console de videogame",
    `O Console abre jogos de 23 sistemas (NES, SNES, Game Boy, GBA, DS, N64, PS1, PSP, Mega Drive, Atari e mais). Ligue um processador forte o bastante, escolha o arquivo do jogo e toque em Jogar. Os jogos ficam guardados em 📚 Meus jogos. Use só jogos que você possui; na primeira vez precisa de internet.`,
  ],
  [
    "💾 Salvar",
    `Tudo é salvo sozinho neste aparelho. Para levar para outro lugar: ⋯ › Exportar projeto (ou salvar na conta Google).`,
  ],
];
function comoJogar() {
  modal(
    `<div class=mt>📘 Como jogar</div>` +
      GUIA.map(([t, h], k) => `<details class=guia${k ? "" : " open"}><summary>${t}</summary><div>${h.replace(/\n/g, "<br>")}</div></details>`).join("") +
      `<button class=it onclick="cm();tutorial(1)">🎓 Fazer o tutorial guiado</button><button class=it onclick="receitasUI()">📖 Itens e receitas</button><button class=it onclick="help()">❓ Linguagem do Comand</button><button class=it onclick="cm()">Fechar</button>`,
  );
}
