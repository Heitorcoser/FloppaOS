/* ---- progresso: nível, XP, missões e conquistas ---- */
let PROG = { lv: 1, xp: 0, c: {}, ok: {}, conq: {}, fx: 0 };
try {
  const o = JSON.parse(localStorage.getItem("fabprog"));
  if (o) PROG = { ...PROG, ...o, c: o.c || {}, ok: o.ok || {}, conq: o.conq || {} };
} catch (e) {}
const nivel = () => PROG.lv;
const xpNivel = (lv) => 60 + 40 * lv; // XP para passar do nível lv
const saveP = () => {
  clearTimeout(saveP.t);
  saveP.t = setTimeout(() => {
    try {
      localStorage.setItem("fabprog", JSON.stringify(PROG));
    } catch (e) {}
  }, 400);
};

// Missões em sequência: mostram 3 por vez. g = [contador, quantidade]
const MISSOES = [
  { id: "fio", t: "Primeiro fio", d: "Ligue dois aparelhos com um fio", g: ["fio", 1], $: 40, x: 20 },
  { id: "lamp", t: "Faça luz", d: "Acenda uma Lâmpada mandando um sinal para ela", g: ["lamp", 1], $: 30, x: 20 },
  { id: "run", t: "Programador", d: "Rode um Comand sem erro", g: ["run", 1], $: 50, x: 30 },
  { id: "disp", t: "Pixel art", d: "Desenhe algo num Display Pixel", g: ["disp", 1], $: 50, x: 30 },
  { id: "mina", t: "Primeira extração", d: "Coloque um Extrator ou uma Mina", g: ["add:extrai", 1], $: 60, x: 30 },
  { id: "barra", t: "Fundição", d: "Faça 10 barras de ferro numa Fornalha", g: ["item:barra de ferro", 10], $: 120, x: 50 },
  { id: "g500", t: "Primeiros lucros", d: "Ganhe $500 vendendo", g: ["ganho", 500], $: 100, x: 50 },
  { id: "cpu", t: "Upgrade", d: "Compre um Processador", g: ["add:cpu", 1], $: 100, x: 40 },
  { id: "robo", t: "Robótica", d: "Monte 5 robôs", g: ["item:robô", 5], $: 150, x: 60 },
  { id: "contr", t: "Negócio fechado", d: "Cumpra um Contrato", g: ["contrato", 1], $: 200, x: 80 },
  { id: "merc", t: "Feirante", d: "Venda 30 itens no Mercado", g: ["venda", 30], $: 200, x: 70 },
  { id: "div", t: "Logística", d: "Use um Divisor na linha", g: ["add:divisor", 1], $: 80, x: 40 },
  { id: "aco", t: "Siderurgia", d: "Faça 10 de aço", g: ["item:aço", 10], $: 300, x: 90 },
  { id: "plas", t: "Petroquímica", d: "Faça 10 plásticos", g: ["item:plástico", 10], $: 400, x: 100 },
  { id: "g10k", t: "Empresário", d: "Ganhe $10.000", g: ["ganho", 10000], $: 1000, x: 150 },
  { id: "circ", t: "Eletrônica", d: "Faça 5 circuitos", g: ["item:circuito", 5], $: 600, x: 150 },
  { id: "btc", t: "Minerador", d: "Ache 1 bloco de Bitcoin", g: ["bloco", 1], $: 300, x: 100 },
  { id: "cel", t: "Na palma da mão", d: "Faça 3 celulares", g: ["item:celular", 3], $: 1500, x: 250 },
  { id: "c5", t: "Fornecedor confiável", d: "Cumpra 5 contratos", g: ["contrato", 5], $: 1500, x: 250 },
  { id: "carro", t: "Montadora de carros", d: "Faça 1 carro", g: ["item:carro", 1], $: 4000, x: 400 },
  { id: "g100k", t: "Magnata", d: "Ganhe $100.000", g: ["ganho", 100000], $: 10000, x: 600 },
  { id: "fog", t: "Rumo às estrelas", d: "Lance 1 foguete", g: ["item:foguete", 1], $: 50000, x: 2000 },
];
// Conquistas: contador e marcos
const CONQ = [
  { id: "ind", i: "🏭", t: "Industrial", k: "itens", m: [100, 1000, 10000, 100000] },
  { id: "rico", i: "💰", t: "Dinheiro ganho", k: "ganho", m: [1000, 50000, 1000000, 50000000] },
  { id: "eng", i: "🧩", t: "Engenheiro (aparelhos colocados)", k: "add", m: [10, 50, 200, 1000] },
  { id: "prog", i: "📟", t: "Programador (Comands rodados)", k: "run", m: [10, 100, 1000, 10000] },
  { id: "con", i: "📜", t: "Contratos cumpridos", k: "contrato", m: [1, 10, 50, 200] },
  { id: "btc", i: "₿", t: "Blocos de Bitcoin", k: "bloco", m: [1, 20, 100, 500] },
  { id: "up", i: "⬆️", t: "Melhorias feitas", k: "melhoria", m: [5, 25, 100, 400] },
  { id: "game", i: "🎮", t: "Jogos abertos no Console", k: "jogo", m: [1, 10, 50, 200] },
];
const MEDALHA = ["🥉", "🥈", "🥇", "💎"];

function xp(n) {
  PROG.xp += n;
  let subiu = 0;
  while (PROG.xp >= xpNivel(PROG.lv)) {
    PROG.xp -= xpNivel(PROG.lv);
    PROG.lv++;
    subiu = 1;
  }
  if (subiu) {
    const novos = Object.keys(ITENS).filter((k) => ITENS[k][2] == PROG.lv);
    toast(`⭐ Nível ${PROG.lv}!` + (novos.length ? " Liberou: " + novos.map((k) => ic(k) + " " + k).join(", ") : ""));
    // menus de receita e recurso mudam com o nível
    Object.values(D).forEach((d) => (T[d.type].cat == "fab" && T[d.type].ui ? redesenha(d) : 0));
  }
  saveP();
  hudNivel();
}
let chkP = 0;
function track(ev, a, n = 1) {
  const c = PROG.c,
    inc = (k, v = n) => (c[k] = (c[k] || 0) + v);
  if (ev == "add") {
    inc("add", 1);
    inc("add:" + a, 1);
    if (/^cpu/.test(a)) inc("add:cpu", 1);
    if (a == "extrator" || a == "mina") inc("add:extrai", 1);
  } else if (ev == "item") {
    inc("item:" + a);
    inc("itens");
    // um pouco de XP por produção, proporcional ao valor
    PROG.fx += ((ITENS[a] ? ITENS[a][1] : 1) * n) / 30;
    if (PROG.fx >= 1) {
      const g = Math.floor(PROG.fx);
      PROG.fx -= g;
      xp(g);
    }
  } else inc(ev, ev == "ganho" ? a : n);
  saveP();
  if (!chkP) chkP = setTimeout(checaProgresso, 300);
}
const prontas = () => MISSOES.filter((m) => !PROG.ok[m.id] && (PROG.c[m.g[0]] || 0) >= m.g[1]);
const ativas = () => MISSOES.filter((m) => !PROG.ok[m.id]).slice(0, 3);
function checaProgresso() {
  chkP = 0;
  prontas().forEach((m) => {
    if (!PROG.avisou?.[m.id]) {
      (PROG.avisou = PROG.avisou || {})[m.id] = 1;
      toast("🎯 Missão cumprida: " + m.t + ". Toque em 🎯 para receber");
    }
  });
  CONQ.forEach((k) => {
    const v = PROG.c[k.k] || 0,
      t = k.m.filter((x) => v >= x).length;
    if (t > (PROG.conq[k.id] || 0)) {
      PROG.conq[k.id] = t;
      xp(25 * t * t);
      toast(`${MEDALHA[t - 1]} Conquista: ${k.t} (${k.m[t - 1].toLocaleString("pt-BR")})`);
    }
  });
  saveP();
  hudNivel();
}
function receber(id) {
  const m = MISSOES.find((x) => x.id == id);
  if (!m || PROG.ok[id] || (PROG.c[m.g[0]] || 0) < m.g[1]) return;
  PROG.ok[id] = 1;
  M += ECO.f ? 0 : m.$;
  saveM();
  hud();
  xp(m.x);
  toast(`✅ ${m.t}: +$${m.$.toLocaleString("pt-BR")} e +${m.x} XP`);
  progressoUI();
}
function hudNivel() {
  const e = $("#nvl");
  if (!e) return;
  const p = Math.min(100, (100 * PROG.xp) / xpNivel(PROG.lv)),
    n = prontas().length;
  e.innerHTML = `<b>Nv ${PROG.lv}</b><span class=xpb><i style="width:${p}%"></i></span>${n ? `<em>${n}</em>` : ""}`;
}
const barra = (v, max) => `<div class=pbar><i style="width:${Math.min(100, (100 * v) / max)}%"></i></div>`;
function progressoUI() {
  const lv = PROG.lv,
    prox = Object.keys(ITENS).filter((k) => ITENS[k][2] == lv + 1),
    maqs = Object.keys(T).filter((k) => T[k].lv == lv + 1);
  const ms = [...prontas(), ...ativas().filter((m) => !prontas().includes(m))]
    .map((m) => {
      const v = Math.min(PROG.c[m.g[0]] || 0, m.g[1]),
        ok = v >= m.g[1];
      return `<div class="mis${ok ? " pronta" : ""}"><div><b>${m.t}</b><small>${m.d}</small>${barra(v, m.g[1])}<small>${v.toLocaleString("pt-BR")}/${m.g[1].toLocaleString("pt-BR")} · prêmio $${m.$.toLocaleString("pt-BR")} + ${m.x} XP</small></div>${ok ? `<button class=ok onclick="receber('${m.id}')">Receber</button>` : ""}</div>`;
    })
    .join("");
  const feitas = MISSOES.filter((m) => PROG.ok[m.id]).length;
  const cq = CONQ.map((k) => {
    const v = PROG.c[k.k] || 0,
      t = PROG.conq[k.id] || 0,
      alvo = k.m[Math.min(t, 3)];
    return `<div class=cq><span>${k.i}</span><div><b>${k.t}</b>${barra(v, alvo)}<small>${t ? MEDALHA[t - 1] + " " : ""}${v.toLocaleString("pt-BR")}${t < 4 ? " / " + alvo.toLocaleString("pt-BR") : " · máximo"}</small></div></div>`;
  }).join("");
  modal(`<div class=mt>🎯 Progresso</div>
<div class=lvbox><b>Nível ${lv}</b>${barra(PROG.xp, xpNivel(lv))}<small>${PROG.xp}/${xpNivel(lv)} XP · ganhe XP produzindo, vendendo, cumprindo missões e contratos</small>${prox.length || maqs.length ? `<small>Nível ${lv + 1} libera: ${[...maqs.map((k) => T[k].i + " " + T[k].n), ...prox.map((k) => ic(k) + " " + k)].join(", ")}</small>` : ""}</div>
<div class=ch>Missões (${feitas}/${MISSOES.length})</div>${ms || "<div class=mu>Todas as missões cumpridas! 🏆</div>"}
<div class=ch>Conquistas</div>${cq}
<button class=it onclick="receitasUI()">📖 Itens e receitas</button><button class=it onclick="cm()">Fechar</button>`);
}
function receitasUI() {
  const porMaq = Object.keys(MAQ)
    .map((m) => {
      const rs = receitasDe(m)
        .map((k) => {
          const r = RECEITAS[k],
            ok = liberado(r.lv);
          return `<div class="rec${ok ? "" : " trava"}">${txtReceita(r)} <small>${ok ? (r.t / 1000).toFixed(1) + "s · vale $" + ITENS[r.out][1] + " cada" : "🔒 nível " + r.lv}</small></div>`;
        })
        .join("");
      return `<div class=ch>${MAQ[m][0]} ${MAQ[m][1]} · $${MAQ[m][2].toLocaleString("pt-BR")}</div>${rs}`;
    })
    .join("");
  const brutos = BRUTOS.map((k) => `${ic(k)} ${k}${liberado(ITENS[k][2]) ? "" : " 🔒" + ITENS[k][2]}`).join(" · ");
  modal(
    `<div class=mt>📖 Itens e receitas</div><div class=mu>⛏️ Extrator tira: ${brutos}. Ligue o Extrator na máquina, a máquina em outra máquina ou no 🏪 Mercado / 💵 Venda / 📜 Contratos. 🔀 Divisor reparte, 🚦 Filtro escolhe o item e 📦 Armazém guarda.</div>${porMaq}<button class=it onclick="progressoUI()">Voltar</button>`,
  );
}
