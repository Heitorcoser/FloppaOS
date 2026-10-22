let GTOK = null,
  GEXP = 0,
  GAUTO = 0;
const gLoadLib = () =>
  new Promise((ok, no) => {
    if (window.google && google.accounts) return ok();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = ok;
    s.onerror = () => no(new Error("sem internet"));
    document.head.append(s);
  });
async function gAuth() {
  if (GTOK && Date.now() < GEXP) return GTOK;
  const id = localStorage.getItem("fabgcid");
  if (!id) throw new Error("Cole o ID do cliente Google primeiro");
  await gLoadLib();
  return new Promise((ok, no) =>
    google.accounts.oauth2
      .initTokenClient({
        client_id: id,
        scope: "https://www.googleapis.com/auth/drive.appdata",
        callback: (r) => {
          if (r.error) return no(new Error(r.error));
          GTOK = r.access_token;
          GEXP = Date.now() + (r.expires_in - 60) * 1000;
          ok(GTOK);
        },
        error_callback: (e) => no(new Error(e.type || "login cancelado")),
      })
      .requestAccessToken(),
  );
}
async function gF(u, o = {}) {
  const t = await gAuth(),
    r = await fetch(u, { ...o, headers: { ...(o.headers || {}), Authorization: "Bearer " + t } });
  if (!r.ok) throw new Error("Google respondeu " + r.status);
  return r;
}
const gFind = async () =>
  ((
    await (
      await gF(
        "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q=" +
          encodeURIComponent("name='fabrica-save.json'"),
      )
    ).json()
  ).files || [])[0]?.id;
async function gSave(quiet) {
  try {
    const body = JSON.stringify({
        proj: JSON.parse(stJ()),
        eco: { M, BTC, P: BTCP, N: BTCN, CR, PKR, OID },
        t: Date.now(),
      }),
      id = await gFind();
    if (id)
      await gF("https://www.googleapis.com/upload/drive/v3/files/" + id + "?uploadType=media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      });
    else
      await gF("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: { "Content-Type": "multipart/related; boundary=fab" },
        body:
          '--fab\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"fabrica-save.json","parents":["appDataFolder"]}\r\n--fab\r\nContent-Type: application/json\r\n\r\n' +
          body +
          "\r\n--fab--",
      });
    if (!quiet) toast("☁ Salvo na sua conta Google");
  } catch (e) {
    if (!quiet) toast("Erro ao salvar: " + e.message);
  }
}
async function gGet() {
  try {
    const id = await gFind();
    if (!id) {
      toast("Nenhum save na nuvem ainda");
      return;
    }
    const j = await (await gF("https://www.googleapis.com/drive/v3/files/" + id + "?alt=media")).json(),
      e = j.eco || {};
    impJ(JSON.stringify(j.proj));
    M = +e.M || 0;
    BTC = +e.BTC || 0;
    BTCP = +e.P || 20000;
    BTCN = +e.N || 0;
    CR = e.CR || {};
    if (e.PKR && (await pkVerify(e.PKR.o, e.PKR.s))) {
      PKR = e.PKR;
      OID = e.PKR.o;
      PK = 1;
    }
    saveM();
    hud();
    toast("☁ Save carregado da nuvem");
  } catch (e) {
    toast("Erro ao carregar: " + e.message);
  }
}
setInterval(() => {
  if (GAUTO && GTOK && Date.now() < GEXP) gSave(1);
}, 300000);
function cloudUI() {
  modal(
    `<div style="font-weight:700">☁ Salvar na conta Google</div><div class=mu>Guarda seu projeto, dinheiro, ₿ e pack numa pasta privada do seu Google Drive (só este app enxerga). Precisa de um ID de cliente OAuth (tipo Web, com a Drive API ativada) criado no Google Cloud Console, e o arquivo precisa estar em um endereço https ou localhost cadastrado nele. Não funciona abrindo como file://.</div><input id=gci placeholder="ID do cliente Google (...apps.googleusercontent.com)" value="${esc(localStorage.getItem("fabgcid") || "")}" onchange="localStorage.setItem('fabgcid',this.value.trim())"><button class=it onclick="localStorage.setItem('fabgcid',$('#gci').value.trim());gSave()">⬆ Entrar e salvar na nuvem</button><button class=it onclick="localStorage.setItem('fabgcid',$('#gci').value.trim());gGet()">⬇ Carregar da nuvem (substitui o atual)</button><label class=mu style="display:flex;gap:8px;align-items:center"><input type=checkbox style="width:auto" ${GAUTO ? "checked" : ""} onchange="GAUTO=this.checked?1:0">Salvar sozinho a cada 5 min (depois de entrar)</label><button class=it onclick="cm()">Fechar</button>`,
  );
}
hud();
