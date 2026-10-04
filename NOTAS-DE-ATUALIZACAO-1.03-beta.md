# MeuOS 1.03 beta (Floppa Edition) - Notas de atualizacao

**Versao beta.** ISO: `meuos-v1.03-beta.iso`

A 1.03 beta melhora o **instalador**: agora da para instalar o MeuOS **ao lado do Windows**, sem apagar
nada, em uma particao que ja existe, ou apagando um disco inteiro. Tambem traz o **GParted** para
particionar na mao e a escolha do **seu nome de usuario**.

## Novo no instalador

- **Instalar ao lado do Windows (dual boot).** O instalador usa o maior espaco livre do disco, sem
  apagar, formatar ou redimensionar nenhuma particao que ja existe. O GRUB oferece o Windows no menu.
  - Disco GPT (UEFI): reaproveita a particao EFI que ja existe (sem formatar) e cria a entrada
    "MeuOS" no UEFI. O Windows continua em `EFI/Microsoft`.
  - Disco MBR (BIOS): o GRUB e gravado no inicio do disco.
  - Precisa de **12 GB livres seguidos**. Se nao houver, abra o GParted e encolha a particao do Windows.
- **Instalar em uma particao que ja existe.** So a particao escolhida e formatada; o resto do disco
  nao e tocado.
- **Apagar um disco inteiro** (como na 1.02), com a confirmacao de digitar APAGAR.
- **GParted dentro do instalador**: criar, apagar e encolher particoes antes de instalar. Ao fechar o
  GParted, voce volta para o instalador.
- **Plano antes de mexer no disco**: o instalador mostra, em texto, exatamente o que vai fazer
  (quais particoes cria, o que reaproveita) e so continua se voce confirmar.
- **Seu proprio usuario**: voce escolhe o nome de usuario e o seu nome completo. Antes o usuario
  era sempre `meuos`. A senha vale tambem para o `root`.
- O disco do CD/pendrive nunca aparece como destino. So aparecem discos e particoes com 12 GB ou mais.
- Particoes EFI, swap, LVM, criptografadas e RAID nunca sao oferecidas para formatar.

## Mudancas no sistema

- Novos programas na ISO: **GParted**, `ntfs-3g` (para encolher a particao do Windows) e `exfatprogs`.
- `/etc/os-release` mostra `MeuOS 1.03-beta (Floppa Edition)`.
- O manual da linguagem FloopyC agora tem um site e um guia no GitHub:
  https://github.com/Heitorcoser/FloppaOS/tree/main/docs

## Limites desta versao (leia antes de instalar)

- **Faca backup antes de mexer em particoes**, principalmente no modo "ao lado do Windows" e no GParted.
  E uma versao beta: o dual boot foi pensado com cuidado, mas ainda nao foi testado em muitos computadores.
- **Secure Boot** precisa estar desligado (o GRUB do MeuOS nao e assinado).
- O BitLocker do Windows precisa estar desligado se voce for encolher a particao dele.
- Computadores muito novos podem precisar de drivers que o kernel do MeuOS ainda nao tem (rede sem fio,
  alguns videos). O MeuOS funciona melhor em maquina virtual e em PCs com hardware comum.
- Depois de instalar, retire o CD/pendrive antes de reiniciar.

## Como obter

- Gere a ISO com `sudo bash scripts/18-build-v103beta.sh` (rode depois do `16-build-v102.sh`).
- Teste a instalacao sem risco no QEMU: `bash scripts/17-testar-instalacao.sh 1`.
- O Floppa Update nao troca o instalador, que so existe no CD. A 1.03 beta vem pela ISO.
