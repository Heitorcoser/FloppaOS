# 🧩 Floppa Mods

Mods para o **Floppa OS 26**: temas, cores, fundos, painel, busca, atalhos e jogos em FloopyC.
Abra o **Floppa Mods** no menu (ou `floppa-mods`) e escolha na **Loja de mods**.

| Pasta/arquivo | Para que serve |
|---|---|
| `catalogo.tsv` + `.sig` | lista de mods (assinada com a chave do Floppa: ninguem consegue adulterar) |
| `lista-negra.tsv` + `.sig` | mods denunciados (bloqueados mesmo que alguem ja tenha baixado) |
| `pacotes/` | os arquivos `.floppamod` |

## Seguranca

Todo mod passa pelo **Floppa Escudo** (checagem sem rodar nada). Mods da **comunidade** ficam **1 hora em
quarentena** e sao conferidos de novo no fim, com a lista negra atualizada. Os programas dos mods rodam
numa **jaula** (sem a sua pasta pessoal, sem mexer no sistema, sem internet). Nada roda como administrador
e **desativar desfaz tudo**.

## Mods oficiais

| Mod | Tipo | O que faz |
|---|---|---|
| Floppa Neon | visual | detalhes rosa e ciano neon, titulos centralizados e fundo neon |
| Floppa estilo Mac | painel | barra em cima, dock embaixo, botoes das janelas na esquerda |
| Fundos Pixel do Floppa | fundos | 4 papeis de parede em pixel art com o Floppa |
| Busca Arco-iris | busca | Floppa Busca colorida com barra arco-iris |
| Floppa Diz | jogo | jogo de memoria com som (FloopyC) |
| Cola do Floppa | atalhos | Super+F1 mostra todos os atalhos do sistema |

## Enviar um mod

Leia o guia [`COMO-CRIAR-MODS.md`](COMO-CRIAR-MODS.md)
(dentro do Floppa OS: `/usr/share/meuos/floppa-mods/COMO-CRIAR-MODS.md`), confira com
`floppa-mods verificar meu-mod.floppamod` e envie o `.floppamod` numa *issue* ou *pull request*.
Mods aprovados entram em `comunidade.tsv` e no catalogo assinado.
