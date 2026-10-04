<div align="center">

# 🐱 FloppaOS / MeuOS

### Floppa Edition 1.02

Um sistema operacional feito do zero, com **Linux + XFCE**, o assistente **Floppa** e uma linguagem de programação própria, a **FloopyC**.

[![Baixar a ISO](https://img.shields.io/badge/⬇_Baixar_a_ISO-meuos--v1.02.iso-orange?style=for-the-badge)](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS/meuos-v1.02.iso)
[![Versão](https://img.shields.io/badge/versão-1.02-blue?style=for-the-badge)](https://github.com/Heitorcoser/FloppaOS/releases)
[![Licença](https://img.shields.io/badge/Linux-XFCE-informational?style=for-the-badge)](#-o-que-vem-dentro)

</div>

---

## ⬇️ Baixar

| Arquivo | Tamanho | Link |
|---|---|---|
| `meuos-v1.02.iso` | ~1,3 GB | [**Baixar agora**](https://github.com/Heitorcoser/FloppaOS/releases/download/FloppaOS/meuos-v1.02.iso) |

**Conferir se baixou inteiro (SHA-256):**

```
5377321ae94d4736903210ff98009822c712995a1248bee0ea24d88fbb0ecd6b
```

- Windows (PowerShell): `Get-FileHash .\meuos-v1.02.iso`
- Linux: `sha256sum meuos-v1.02.iso`

Todas as versões: [página de Releases](https://github.com/Heitorcoser/FloppaOS/releases).

---

## ✨ O que vem dentro

| | Recurso |
|---|---|
| 🖥️ | Desktop **XFCE** leve, com tela de carregamento do Floppa |
| 💾 | **Instalador**: instala no disco do computador (BIOS e UEFI). O CD serve só para instalar |
| ⚡ | **Floppa Otimizer**: ajusta o sistema conforme a memória, o processador, o vídeo e o disco |
| 🔄 | **Floppa Update**: o sistema se atualiza sozinho, com pacotes assinados |
| 📦 | **Conteúdo adicional**: baixe extras como o **FloppyMakes** |
| 🐍 | **Python**, **JavaScript** (Node) e **FloopyC** prontos para usar |
| 🍷 | **Wine**: roda programas e jogos do Windows (`.exe`) |
| 🎮 | Jogos feitos em FloopyC: cobra, adivinha o número, pedra-papel-tesoura |
| 🖼️ | Troca de **tela de fundo** e **histórico de versões** dentro do sistema |

---

## 🚀 Como instalar

1. Baixe a ISO e confira o SHA-256.
2. **Máquina virtual (VirtualBox):** crie uma VM Linux 64 bits com **4 GB de RAM** (mínimo 2 GB) e disco de **12 GB ou mais**. Coloque a ISO no leitor.
3. Ligue e escolha **"Instalar o MeuOS neste computador"** no menu.
4. Siga o instalador: disco, nome, senha e confirme digitando `APAGAR`.
5. Quando terminar, **retire a ISO** e reinicie. O MeuOS liga direto do disco.

Quer só experimentar? Escolha **"Experimentar o MeuOS sem instalar"**.

> ⚠️ O instalador usa o **disco inteiro** e apaga tudo nele. Ainda não faz dual boot. Em PC de verdade, desligue o **Secure Boot**.

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

Referência completa dentro do sistema: `/usr/share/meuos/FloopyC.md`. Rodar: `floopyc arquivo.flp`.

---

## 🌐 Servidores do MeuOS

Esta pasta também funciona como servidor de atualizações e de conteúdo adicional.

| Pasta | Para que serve | Quem lê |
|---|---|---|
| `update/` | Atualizações assinadas (Ed25519) do Floppa Update | `/etc/meuos/repo-update` |
| `extras/` | Catálogo de conteúdo adicional (FloppyMakes e outros) | `/etc/meuos/repo-extras` |

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
| **1.02** | Instalador no disco, Floppa Otimizer, notas de atualização, servidor de extras no GitHub |
| 1.02 beta | Otimização, Floppa Update, Python/JavaScript, Wine, FloppyMakes |
| 1.01 | Tela de carregamento e melhorias gerais |
| 0.3 | Troca de fundo, FloopyC e jogos |
| 0.2 | Desktop XFCE sobre Debian, ISO live |
| 0.1 | Kernel Linux + BusyBox |

<div align="center">

Feito com 🧡 para o Floppa.

</div>
