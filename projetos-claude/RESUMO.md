# Projetos feitos com o Claude (resumo para continuar em outra conversa)

| Pasta | O que é | Como gerar / usar |
|---|---|---|
| `mosca-pilota/` | App Android: moscas com cérebro do conectoma maleCNS aprendem a pilotar pistas aleatórias (evolução). v1.1: 15 raios de visão, sente velocidade, reflexo visual direto, obstáculos mudam a cada geração, sobe de nível com 2 chegadas seguidas. | `app/` = jogo (index.html, core.js, brain.js). `data/build_brain.py` gera o cérebro (precisa de conexoes.csv e soma_sides.csv, não incluídos). `test/bench.js` mede o aprendizado. APK: `MoscaPilota.apk`. |
| `surf3d/` | App Android "Tubo 3D": surf em 3D com Three.js, onda que quebra de verdade. | `app/` = jogo; `Tubo3D.apk`. |
| `fabrica/` | Rework da Fábrica de Tudo (código separado em `src/js/`, junta com `python3 build.py`). Fábricas novas, progressão, emulador com 23 sistemas, tutorial. | Resultado pronto: `Fabrica_de_Tudo_19.html`. Testes em `fabrica/test/` (Playwright). |
| `tubo-perfeito/` | Jogo de surf 2D em HTML (artifact). | Abrir `tubo.html`. |
| `roblox-labirinto/` | Labirinto infinito para Roblox (Luau). `multi/` = 7 scripts com menos de 300 linhas cada. | Colar em ServerScriptService (5 ModuleScripts + 2 Scripts). |

## Para gerar APKs de novo
Os APKs foram montados sem Gradle (aapt2 + javac + d8 + zipalign + apksigner, Android SDK 34).
As chaves de assinatura (`.keystore`) NÃO foram salvas aqui. Sem elas, um APK novo não instala por cima do antigo:
desinstale o app antigo antes.

## Outros
- Graphify instalado com `uv tool install graphifyy` e `graphify install` (precisa refazer em container novo).
- OmniRoute roda no Termux do celular (`omniroute`, painel em http://localhost:20128).
