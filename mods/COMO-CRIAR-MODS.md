# Como criar mods para o Floppa OS

Um mod deixa o Floppa OS do seu jeito: temas, cores, fundos, fontes, painel, busca, atalhos de teclado,
jogos e programas em FloopyC. Ele e um arquivo **`.floppamod`** (um `.tar.gz`) com um **`mod.json`** e os
seus arquivos.

## Seguranca: o que todo mod passa

1. **Floppa Escudo**: antes de instalar, o Floppa confere o pacote inteiro sem rodar nada. Bloqueia
   programas compilados (ELF/EXE), arquivos disfarcados, pacotes dentro do pacote, links, caminhos que
   saem da pasta do mod, bombas de compressao, SVG com codigo, virus conhecidos (lista negra e ClamAV, se
   instalado) e scripts que tentam virar administrador, baixar e rodar coisas, abrir acesso remoto, apagar
   arquivos, se esconder no sistema, roubar senhas, espionar o teclado ou minerar criptomoeda.
2. **Quarentena de 1 hora** (mods da comunidade): o mod espera 1 hora e passa pela checagem de novo, com a
   lista negra atualizada. Se alguem denunciar o mod nesse tempo, ele nao entra.
3. **Jaula**: programas de mods rodam isolados (bubblewrap). Eles NAO veem a sua pasta pessoal de verdade,
   nao mexem no sistema, nao usam a internet (a nao ser que o Escudo tenha avisado), nao falam com outros
   programas (D-Bus) e so podem gravar na "casa" deles.
4. **Nada como administrador**: mod nenhum instala nada no sistema. Tudo fica na sua pasta pessoal e
   **desativar desfaz tudo**.

Mods **oficiais** (feitos pelo Floppa) sao assinados: pulam a quarentena, mas tambem passam pelo Escudo.

## O mod.json

```json
{
  "id": "meu-mod",
  "nome": "Meu Mod",
  "autor": "Seu nome",
  "descricao": "O que o mod faz, numa frase.",
  "versao": "1.0",
  "tipo": "visual",
  "instalar": [
    {"de": "estilo.css", "para": "gtk-css/estilo.css"},
    {"de": "fundo.png", "para": "fundos/fundo.png"},
    {"de": "jogo.flp", "para": "programas/jogo.flp"}
  ],
  "fundo": "fundos/fundo.png",
  "configuracoes": [
    {"canal": "xsettings", "prop": "/Net/ThemeName", "tipo": "string", "valor": "Arc-Dark"}
  ],
  "aplicativos": [{"nome": "Meu Jogo", "executar": "programas/jogo.flp", "terminal": true}],
  "atalhos": [{"tecla": "<Super>F5", "executar": "programas/jogo.flp", "terminal": true}],
  "visual": "leve",
  "dock": false
}
```

- **id**: 3 a 40 letras minusculas, numeros e `-`.
- **tipo**: `tema`, `icones`, `cursor`, `fundos`, `fontes`, `painel`, `visual`, `busca`, `jogo`,
  `programa`, `script`, `atalhos` ou `pacote`.

### Para onde os arquivos podem ir (`"para"`)

| Pasta | O que vai | Aceita |
|---|---|---|
| `fundos/` | papeis de parede | png, jpg, svg, webp |
| `temas/` | temas GTK/xfwm4 (`temas/NomeDoTema/...`) | css, png, svg, rc, xpm, index.theme |
| `icones/`, `cursores/` | temas de icones e cursores | os mesmos dos temas |
| `fontes/` | fontes | ttf, otf, woff, woff2 |
| `gtk-css/` | ajustes de cor por cima do tema atual | css |
| `busca/` | tema da Floppa Busca (Alt+Espaco) | rasi |
| `sons/` | sons | ogg, oga, wav |
| `programas/` | jogos e programas do mod | flp, sh, py e arquivos de dados |

### Configuracoes permitidas (`"configuracoes"`)

- **xsettings**: `/Net/ThemeName`, `/Net/IconThemeName`, `/Gtk/FontName`, `/Gtk/MonospaceFontName`,
  `/Gtk/CursorThemeName`, `/Gtk/CursorThemeSize` (16-96), `/Xft/DPI` (72-192), `/Xft/Antialias`,
  `/Xft/HintStyle`, `/Net/SoundThemeName`, `/Net/EnableEventSounds`
- **xfwm4**: `/general/theme`, `/general/title_font`, `/general/button_layout` (ex.: `CHM|`),
  `/general/title_alignment` (left/center/right), `/general/use_compositing`, `/general/show_frame_shadow`,
  `/general/show_popup_shadow`, `/general/frame_opacity`, `/general/inactive_opacity`,
  `/general/workspace_count` (1-12)
- **xfce4-panel**: `/panels/dark-mode`, `/panels/panel-1/position` (`p=6;x=0;y=0` em cima,
  `p=8;x=0;y=0` embaixo), `/panels/panel-1/size`, `/panels/panel-1/icon-size`, `/panels/panel-1/length`
- **xfce4-notifyd**: `/theme`, `/notify-location` (0-3), `/expire-timeout`

Qualquer outra configuracao faz o Escudo **bloquear** o mod.

### Programas

So rodam `.flp` (FloopyC), `.sh` e `.py`, sempre dentro da jaula. A FloopyC e a mais segura: e a
preferida para jogos. Scripts `.sh`/`.py` sempre mostram um aviso que o usuario precisa confirmar.

## Montar o pacote

```
cd pasta-do-meu-mod
tar -czf ../meu-mod-1.0.floppamod mod.json estilo.css fundo.png jogo.flp
floppa-mods verificar ../meu-mod-1.0.floppamod
```

O `floppa-mods verificar` mostra o relatorio do Escudo. Para publicar na Loja de mods, envie o
`.floppamod` no GitHub do Floppa OS (pasta `mods/`); depois de aprovado ele entra no catalogo assinado.

## Os mods oficiais (exemplos)

| Mod | O que mostra |
|---|---|
| Floppa Neon | gtk-css, fundo SVG e configuracoes |
| Floppa estilo Mac | painel e botoes das janelas, dock |
| Fundos Pixel do Floppa | so fundos |
| Busca Arco-iris | tema da busca (rofi) |
| Floppa Diz | jogo FloopyC com som e recorde salvo |
| Cola do Floppa | atalho de teclado (Super+F1) abrindo programa no terminal |
