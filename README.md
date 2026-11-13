<div align="center">

# 🐱 Floppa OS

### **Floppa OS 26 Basic** (antigo MeuOS · Floppa Edition)

Um sistema operacional feito do zero, com **Linux + XFCE**, o assistente **Floppa** e uma linguagem de programação própria, a **FloopyC**.

[![Baixar a ISO](https://img.shields.io/badge/⬇_Baixar_a_ISO-meuos--v26.iso-orange?style=for-the-badge)](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS26/meuos-v26.iso)
[![Versão](https://img.shields.io/badge/versão-26_Basic-blue?style=for-the-badge)](https://github.com/Heitorcoser/FloppaOS/releases/tag/FloppaOS26)
[![Linguagem](https://img.shields.io/badge/📖_Aprender-FloopyC-green?style=for-the-badge)](docs/index.md)

</div>

---

## ⬇️ Baixar

| Versão | Arquivo | Tamanho | Link |
|---|---|---|---|
| **26 Basic** (atual) | `meuos-v26.iso` | ~1,4 GB | [**Baixar agora**](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS26/meuos-v26.iso) |
| 1.03 | `meuos-v1.03.iso` | ~1,3 GB | [**Baixar**](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOSv103Final/meuos-v1.03.iso) |
| 1.03 beta | `meuos-v1.03-beta.iso` | — | Na página de [**Releases**](https://github.com/Heitorcoser/FloppaOS/releases) |
| 1.02 | `meuos-v1.02.iso` | ~1,3 GB | [**Baixar agora**](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS/meuos-v1.02.iso) |

> 💡 **Baixe bem mais rápido:** cole o link num gerenciador de downloads com várias conexões
> (ex.: **AB Download Manager**, IDM ou `aria2c -x 16 -s 16 LINK`) e use **16 conexões**.
> O GitHub manda cada conexão devagar, mas juntas somam: no teste, a ISO caiu de ~43 min para ~6 min.

**Conferir se a 26 baixou inteira (SHA-256):**

```
5513c0540291c1d24ef74a73e089636f9803969ca4bc0d2b5acfc928aa16676a
```

- Windows (PowerShell): `Get-FileHash .\meuos-v26.iso`
- Linux: `sha256sum meuos-v26.iso`

Todas as versões: [página de Releases](https://github.com/Heitorcoser/FloppaOS/releases).
Notas da versão: [`NOTAS-DE-ATUALIZACAO-26.md`](NOTAS-DE-ATUALIZACAO-26.md) (anteriores: [1.03](NOTAS-DE-ATUALIZACAO-1.03.md), [1.03 beta](NOTAS-DE-ATUALIZACAO-1.03-beta.md)).

---

## ✨ O que vem dentro

| | Recurso |
|---|---|
| 🧩 | **Floppa Mods** *(26)*: mude tudo com mods oficiais e da comunidade (temas, painel, fundos, atalhos, jogos). Cada mod passa pelo **Floppa Escudo**, fica **1 hora em quarentena** e roda numa **jaula**. Veja [`mods/`](mods/) |
| ⚙️ | **Floppa Central** *(26)*: todas as configurações num lugar só (Wi-Fi, Bluetooth, som, tela, energia, firewall, teclado, armazenamento) |
| 🎨 | **Visual novo** *(26)*: tema escuro/claro, ícones Papirus, efeitos que se adaptam ao PC, **Floppa Busca** (Alt+Espaço) |
| 🎮 | **Modo Jogo** *(26)*: Super+G deixa tudo no máximo para jogar; desligou, volta como estava. Com **GameMode** |
| ⚡ | **Otimizado** *(26)*: ~300 MB mais leve, zram ajustada à RAM, kernel `preempt=full`, boot mais rápido |
| 💻 | **Notebooks** *(26)*: Wi-Fi, Bluetooth, bateria, brilho, touchpad, luz noturna com horário |
| 🛡️ | **Mais seguro** *(26)*: firewall ligado de fábrica e conta root travada |
| 📋 | **Super+V** *(26)*: histórico da área de transferência, igual ao Windows |
| 🖥️ | Desktop **XFCE** leve, com tela de carregamento do Floppa |
| 💾 | **Instalador**: instala no disco do computador (BIOS e UEFI). O CD serve só para instalar |
| 🪟 | **Ao lado do Windows**: instala no espaço livre do disco, sem apagar nada, e o GRUB oferece o Windows no menu |
| 🧩 | **GParted**: crie, apague e encolha partições antes de instalar |
| 🛡️ | **Instalador seguro** *(1.03)*: confere o Secure Boot, guarda cópia da tabela de partições, confere tudo no fim e **desfaz** o que criou se der erro |
| 🎮 | **Floppa Games** *(1.03)*: drivers de vídeo AMD/Intel, Vulkan, **Steam com um clique** |
| 🧹 | **Liberar espaço** e **Recuperar arquivos** *(1.03)*: limpe o disco e recupere o que apagou |
| 📥 | **Gerenciador de programas** *(1.03)*: baixe programas feitos para a sua versão do MeuOS |
| 🟦 | **Tela azul do Floppa** *(1.03)*: quando a tela de entrada falha ou o sistema cai na emergência |
| ⚡ | **Floppa Otimizer**: ajusta o sistema conforme a memória, o processador, o vídeo e o disco |
| 🔄 | **Floppa Update**: o sistema se atualiza sozinho, com pacotes assinados |
| 📦 | **Conteúdo adicional**: baixe extras como o **FloppyMakes** |
| 🐍 | **Python**, **JavaScript** (Node) e **FloopyC** prontos para usar |
| 🍷 | **Wine**: roda programas e jogos do Windows (`.exe`) |
| 🎮 | Jogos feitos em FloopyC: cobra, adivinha o número, pedra-papel-tesoura, peixes, piano |
| 🔊 | **Som e voz**: o FloopyC toca notas e fala em voz alta |
| 🖼️ | Troca de **tela de fundo** e **histórico de versões** dentro do sistema |

---

## 🚀 Como instalar

1. Baixe a ISO e confira o SHA-256.
2. **Máquina virtual (VirtualBox):** crie uma VM Linux 64 bits com **4 GB de RAM** (mínimo 2 GB) e disco de **12 GB ou mais**. Coloque a ISO no leitor.
3. Ligue e escolha **"Instalar o Floppa OS 26 Basic neste computador"** no menu.
4. Siga o instalador (veja as opções abaixo) e confirme.
5. Quando terminar, **retire a ISO** e reinicie. O Floppa OS liga direto do disco.

Quer só experimentar? Escolha **"Experimentar o Floppa OS 26 Basic sem instalar"**.

### Jeitos de instalar

| Opção | O que faz |
|---|---|
| **Apagar um disco inteiro** | Usa o disco todo. Apaga tudo nele (pede para digitar `APAGAR`) |
| **Ao lado de outro sistema (Windows)** | Usa o maior espaço livre do disco. Não apaga, não formata e não redimensiona nada que já existe |
| **Em uma partição existente** | Só a partição escolhida é formatada |
| **Particionar na mão (GParted)** | Cria, apaga e encolhe partições antes de instalar |

O instalador mostra **o que vai fazer antes de mexer em qualquer coisa**.

> ⚠️ **Faça backup** antes de mexer em partições. O dual boot da 1.03 tem proteções (recusa com Secure Boot ligado, confere tudo no fim e desfaz o que criou se der erro), mas ainda foi pouco testado em PCs diferentes.
> Para instalar ao lado do Windows são necessários **12 GB livres seguidos** (use o GParted para encolher a partição do Windows).
> Em PC de verdade, desligue o **Secure Boot** (e o **BitLocker** do Windows, se for encolher a partição dele).

---

## 🐾 FloopyC

Linguagem do MeuOS, um misto de **HolyC** com **Lua**. Todo comando termina em `Bin`, `Flp` ou `Sch`.

```c
varFlp lista = [1, 2, 3];

foreachSch (v inBin lista) {
    ifFlp (v == 2) {
        SayBin("dois!");
    } elseifSch (v > 2) {
        SayBin("grande: ", v * 2);
    } elseBin {
        SayBin("pequeno");
    }
}
```

📖 **Guia completo da linguagem, do zero, com exemplos:** [`docs/index.md`](docs/index.md)
🌐 **Site:** <https://heitorcoser.github.io/FloppaOS/>

Dentro do sistema: `floopyc arquivo.flp` roda um programa, `floopyc --check arquivo.flp` confere a sintaxe,
e o **Floppa Studio** cria programas a partir de modelos. Referência em texto: `/usr/share/meuos/FloopyC.md`.

---

## 🌐 Servidores do MeuOS

Esta pasta também funciona como servidor de atualizações e de conteúdo adicional.

| Pasta | Para que serve | Quem lê |
|---|---|---|
| `update/` | Atualizações assinadas (Ed25519) do Floppa Update | `/etc/meuos/repo-update` |
| `extras/` | Catálogo de conteúdo adicional (FloppyMakes e outros) | `/etc/meuos/repo-extras` |
| `programas/` | Catálogo do Gerenciador de programas (por versão do MeuOS) | `/etc/meuos/repo-programas` |
| `docs/` | Guia e site da linguagem FloopyC | — |

Endereços usados dentro do MeuOS:

```
https://raw.githubusercontent.com/Heitorcoser/FloppaOS/main/update
https://raw.githubusercontent.com/Heitorcoser/FloppaOS/main/extras
https://raw.githubusercontent.com/Heitorcoser/FloppaOS/main/programas
```

Quer publicar conteúdo para o MeuOS? Veja [`extras/README.md`](extras/README.md).

---

## 🕓 Histórico

| Versão | Novidades |
|---|---|
| **26 Basic** | Novo nome (Floppa OS). Floppa Central, visual novo, Floppa Busca, Modo Jogo, Armazenamento, Super+V, luz noturna, notebooks, firewall, sistema ~300 MB mais leve e mais rápido |
| 1.03 | Instalador mais seguro, tela azul do Floppa, Liberar espaço, Recuperar arquivos, Gerenciador de programas, canal estável/beta no Floppa Update |
| 1.03 beta | Instalador ao lado do Windows (dual boot), em partição existente, GParted, escolha do nome de usuário, Floppa Games (Steam, drivers de vídeo) |
| **1.02** | Instalador no disco, Floppa Otimizer, notas de atualização, servidor de extras no GitHub |
| 1.02 beta | Otimização, Floppa Update, Python/JavaScript, Wine, FloppyMakes |
| 1.01 | Tela de carregamento e melhorias gerais |
| 1.0 beta | Som e voz, Floppa Studio, pasta compartilhada com o Windows |
| 0.3 | Troca de fundo, FloopyC e jogos |
| 0.2 | Desktop XFCE sobre Debian, ISO live |
| 0.1 | Kernel Linux + BusyBox |

<div align="center">

Feito com 🧡 para o Floppa.

</div>
