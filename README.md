<div align="center">

# 🐱 FloppaOS / MeuOS

### Floppa Edition · estável **1.02** · beta **1.03**

Um sistema operacional feito do zero, com **Linux + XFCE**, o assistente **Floppa** e uma linguagem de programação própria, a **FloopyC**.

[![Baixar a ISO](https://img.shields.io/badge/⬇_Baixar_a_ISO-meuos--v1.02.iso-orange?style=for-the-badge)](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS/meuos-v1.02.iso)
[![Beta](https://img.shields.io/badge/beta-1.03-yellow?style=for-the-badge)](https://github.com/Heitorcoser/FloppaOS/releases)
[![Linguagem](https://img.shields.io/badge/📖_Aprender-FloopyC-green?style=for-the-badge)](docs/index.md)

</div>

---

## ⬇️ Baixar

| Versão | Arquivo | Tamanho | Link |
|---|---|---|---|
| **1.02** (estável) | `meuos-v1.02.iso` | ~1,3 GB | [**Baixar agora**](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS/meuos-v1.02.iso) |
| **1.03 beta** | `meuos-v1.03-beta.iso` | — | Na página de [**Releases**](https://github.com/Heitorcoser/FloppaOS/releases) |

**Conferir se a 1.02 baixou inteira (SHA-256):**

```
5377321ae94d4736903210ff98009822c712995a1248bee0ea24d88fbb0ecd6b
```

- Windows (PowerShell): `Get-FileHash .\meuos-v1.02.iso`
- Linux: `sha256sum meuos-v1.02.iso`

Todas as versões: [página de Releases](https://github.com/Heitorcoser/FloppaOS/releases).
Notas da versão beta: [`NOTAS-DE-ATUALIZACAO-1.03-beta.md`](NOTAS-DE-ATUALIZACAO-1.03-beta.md).

---

## ✨ O que vem dentro

| | Recurso |
|---|---|
| 🖥️ | Desktop **XFCE** leve, com tela de carregamento do Floppa |
| 💾 | **Instalador**: instala no disco do computador (BIOS e UEFI). O CD serve só para instalar |
| 🪟 | **Ao lado do Windows** *(1.03 beta)*: instala no espaço livre do disco, sem apagar nada, e o GRUB oferece o Windows no menu |
| 🧩 | **GParted** *(1.03 beta)*: crie, apague e encolha partições antes de instalar |
| 👤 | **Seu nome e seu usuário** *(1.03 beta)*: você escolhe nome, usuário, nome do computador e senha na instalação |
| 🎮 | **Floppa Games** *(1.03 beta)*: instala a **Steam** com um clique, com Vulkan, OpenGL, Proton, GameMode e MangoHud |
| 📺 | **Drivers de vídeo reais** *(1.03 beta)*: AMD, Intel e NVIDIA livre, com vídeo acelerado por hardware |
| 🎬 | **Codecs completos** *(1.03 beta)*: o Firefox toca vídeos do YouTube e similares |
| 🕹️ | **Controles** *(1.03 beta)*: Xbox, PlayStation e Steam funcionam |
| ⚡ | **Floppa Otimizer**: ajusta o sistema conforme a memória, o processador, o vídeo e o disco |
| 🔄 | **Floppa Update**: o sistema se atualiza sozinho, com pacotes assinados |
| 📦 | **Conteúdo adicional**: baixe extras como o **FloppyMakes** |
| 🐍 | **Python**, **JavaScript** (Node) e **FloopyC** prontos para usar |
| 🍷 | **Wine**: roda programas e jogos do Windows (`.exe`) |
| 🐟 | Jogos feitos em FloopyC: cobra, adivinha o número, pedra-papel-tesoura, peixes, piano |
| 🔊 | **Som e voz**: o FloopyC toca notas e fala em voz alta |
| 🖼️ | Troca de **tela de fundo** e **histórico de versões** dentro do sistema |

---

## 🚀 Como instalar

1. Baixe a ISO e confira o SHA-256.
2. **Máquina virtual (VirtualBox):** crie uma VM Linux 64 bits com **4 GB de RAM** (mínimo 2 GB) e disco de **12 GB ou mais**. Coloque a ISO no leitor.
3. Ligue e escolha **"Instalar o MeuOS neste computador"** no menu.
4. Siga o instalador (veja as opções abaixo) e confirme.
5. Quando terminar, **retire a ISO** e reinicie. O MeuOS liga direto do disco.

Quer só experimentar? Escolha **"Experimentar o MeuOS sem instalar"**.

### Jeitos de instalar

| Opção | Versão | O que faz |
|---|---|---|
| **Apagar um disco inteiro** | 1.02 e 1.03 beta | Usa o disco todo. Apaga tudo nele (pede para digitar `APAGAR`) |
| **Ao lado de outro sistema (Windows)** | 1.03 beta | Usa o maior espaço livre do disco. Não apaga, não formata e não redimensiona nada que já existe |
| **Em uma partição existente** | 1.03 beta | Só a partição escolhida é formatada |
| **Particionar na mão (GParted)** | 1.03 beta | Cria, apaga e encolhe partições antes de instalar |

O instalador da 1.03 beta pergunta o seu **nome**, o **usuário**, o **nome do computador** e a **senha**, e mostra **o que vai fazer antes de mexer em qualquer coisa**.

> ⚠️ **Faça backup** antes de mexer em partições. O dual boot da 1.03 é beta: foi pensado com cuidado, mas ainda foi pouco testado em PCs diferentes.
> Para instalar ao lado do Windows são necessários **12 GB livres seguidos** (use o GParted para encolher a partição do Windows).
> No Windows, desligue a **Inicialização rápida** e **desligue** o PC por completo antes de instalar.
> Em PC de verdade, desligue o **Secure Boot** (e suspenda o **BitLocker** do Windows, se for encolher a partição dele).

---

## 🎮 Jogar *(1.03 beta)*

O MeuOS 1.03 beta traz o que os jogos de PC precisam: drivers de vídeo **AMD** (amdgpu, radeon), **Intel** (i915) e **NVIDIA livre** (nouveau), **Vulkan**, **OpenGL (Mesa)**, vídeo acelerado por hardware (VA-API), **GameMode** e **MangoHud**.

**Como jogar:**

1. **Instale o MeuOS no computador.** Pelo CD tudo fica na memória RAM e some ao desligar.
2. Abra **Floppa Games > Instalar a Steam**. Precisa de internet e de uns 3 GB livres.
3. Abra a Steam, entre na sua conta e ligue **Steam Play para todos os títulos** (Proton).
4. Nas opções de inicialização do jogo, coloque: `gamemoderun mangohud %command%`

O **Floppa Games** também mostra o diagnóstico da placa de vídeo (OpenGL, Vulkan e VA-API) e traz dicas.

**Limites da beta:**

- Para jogos 3D de verdade, use placa **AMD ou Intel**. NVIDIA só com o driver livre (não há o driver proprietário).
- Em máquina virtual (VirtualBox, QEMU) os jogos 3D rodam pelo processador e ficam muito lentos.
- Recomendado: 8 GB de RAM e processador de 4 núcleos.
- Jogos com anti-cheat do Windows geralmente não funcionam no Linux.

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
| `docs/` | Guia e site da linguagem FloopyC | — |

Endereços usados dentro do MeuOS:

```
https://raw.githubusercontent.com/Heitorcoser/FloppaOS/main/update
https://raw.githubusercontent.com/Heitorcoser/FloppaOS/main/extras
```

Quer publicar conteúdo para o MeuOS? Veja [`extras/README.md`](extras/README.md).

---

## 🕓 Histórico

| Versão | Novidades |
|---|---|
| **1.03 beta** | **Floppa Games** (Steam, drivers de vídeo, Vulkan, codecs, controles), instalador ao lado do Windows (dual boot), em partição existente, GParted, escolha de nome e usuário, plano mostrado antes de mexer no disco |
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
