/* ---- senha, pack Pix, console .iso, nuvem Google ---- */
const PIX_KEY = "hdcoser@gmail.com",
  PIX_NOME = "FABRICA DE TUDO",
  PIX_CIDADE = "BRASIL",
  PUBKEY = {
    kty: "EC",
    crv: "P-256",
    x: "oRl75L6dqNXT2uPveOFTijNg8Cz7wn9fK0Ue5TsZzrg",
    y: "fo1PrpmErplJ8KVrfQaaZULDzrEMDCe8vVc_TEohyeM",
  };
function freeTry() {
  if (h53($("#fp").value) === FREEH) {
    ECO.f = 1;
    saveM();
    hud();
    econUI();
    toast("🔓 Modo livre liberado");
    ecoMenu();
  } else toast("Senha errada");
}
function crc16(t) {
  let c = 0xffff;
  for (const ch of t) {
    c ^= ch.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
  }
  return c.toString(16).toUpperCase().padStart(4, "0");
}
function pixCode() {
  const f = (i, v) => i + String(v.length).padStart(2, "0") + v,
    p =
      f("00", "01") +
      f("01", "11") +
      f("26", f("00", "BR.GOV.BCB.PIX") + f("01", PIX_KEY)) +
      f("52", "0000") +
      f("53", "986") +
      f("54", "1.00") +
      f("58", "BR") +
      f("59", PIX_NOME) +
      f("60", PIX_CIDADE) +
      f("62", f("05", OID)) +
      "6304";
  return p + crc16(p);
}
async function pkVerify(oid, sig) {
  try {
    if (!(window.crypto && crypto.subtle)) {
      toast("Abra o arquivo em um navegador (Chrome) para validar o código");
      return false;
    }
    const k = await crypto.subtle.importKey("jwk", PUBKEY, { name: "ECDSA", namedCurve: "P-256" }, false, [
        "verify",
      ]),
      b = Uint8Array.from(atob(String(sig).replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/")), (c) =>
        c.charCodeAt(0),
      );
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      k,
      b,
      new TextEncoder().encode("FABRICA-PACK1:" + oid),
    );
  } catch (e) {
    return false;
  }
}
async function pkRedeem(code) {
  if (PK) {
    toast("Starter Pack já ativado");
    return;
  }
  if (!(await pkVerify(OID, code))) {
    toast("Código inválido para o seu ID " + OID);
    return;
  }
  PKR = { o: OID, s: String(code).replace(/\s/g, "") };
  PK = 1;
  M += 3000;
  CR.cpu2 = (CR.cpu2 || 0) + 1;
  saveM();
  hud();
  toast("🎁 Starter Pack ativado: +$3.000 e 1 Processador 16-bit grátis!");
  packUI();
}
function packUI() {
  modal(
    `<div style="font-weight:700">🎁 Starter Pack de Iniciante · R$ 1,00</div><div class=mu>Contém: $3.000 + 1 Processador 16-bit grátis (pegue no menu ＋).</div>${PK ? "<div class=term>✅ Pack já ativado</div>" : `<div class=mu>Seu ID do pedido: <b>${OID}</b></div><textarea id=pxc rows=4 readonly>${pixCode()}</textarea><button class=it onclick="navigator.clipboard.writeText($('#pxc').value).then(()=>toast('Copiado! Cole no app do banco (Pix Copia e Cola)'),()=>$('#pxc').select())">📋 Copiar Pix (copia e cola)</button><div class=mu>Chave Pix (e-mail): ${PIX_KEY} · R$ 1,00. Depois de pagar, envie o comprovante com o ID acima para esse e-mail. O código só é liberado depois que o Pix for conferido.</div><a class=it style="text-decoration:none;color:var(--tx)" href="mailto:${PIX_KEY}?subject=${encodeURIComponent("Starter Pack " + OID)}&body=${encodeURIComponent("ID do pedido: " + OID + "\nAnexe o comprovante do Pix.")}">✉ Enviar comprovante</a><textarea id=pkc rows=3 placeholder="cole aqui o código de liberação"></textarea><button class=it onclick="pkRedeem($('#pkc').value)">✅ Ativar pack</button>`}<button class=it onclick="cm()">Fechar</button>`,
  );
}
if (PKR)
  pkVerify(PKR.o, PKR.s).then((v) => {
    PK = v ? 1 : 0;
    if (!v && window.crypto && crypto.subtle) PKR = null;
  });
