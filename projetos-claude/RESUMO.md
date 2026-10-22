# Projetos feitos com o Claude (resumo para continuar em outra conversa)

| Pasta | O que é | Como gerar / usar |
|---|---|---|
| `mosca-pilota/` | App Android (v1.3: Doom com cérebro pré-treinado, Doom 64 em tela cheia que entra no jogo sozinho): moscas com cérebro do conectoma maleCNS. Três modos: 🏁 Pista (aprende a pilotar), 👹 Doom (labirinto com demônios: visão em 2 canais, claridade e vermelho/movimento, e gatilho; níveis com demônios parados, andando, perseguindo e cuspindo fogo) e 🎮 Doom 64 (EmulatorJS roda a ROM do jogador; a mosca vê a tela em 15 faixas e aperta o controle com o cérebro treinado no modo Doom, sem aprender lá). | `app/` = jogo (index.html, core.js, doom.js, doomview.js, doom64.js, brain.js). `./build.sh` gera o APK (precisa de `android/mosca.keystore`, não incluído). `test/doombench.js` mede o aprendizado no Doom; `test/doomui.mjs` testa a interface. A ROM não fica no repositório. |
| `surf3d/` | App Android "Tubo 3D": surf em 3D com Three.js, onda que quebra de verdade. | `app/` = jogo; `Tubo3D.apk`. |
| `fabrica/` | Rework da Fábrica de Tudo (código separado em `src/js/`, junta com `python3 build.py`). Fábricas novas, progressão, emulador com 23 sistemas, tutorial. | Resultado pronto: `Fabrica_de_Tudo_21.html` (v21: IA respeita o dinheiro do jogador; IA com Groq/OmniRoute/OpenRouter/Gemini, resposta ao vivo, planejador de linhas de produção sem IA, teste do código num Worker antes de montar, conversa salva). Testes em `fabrica/test/` (Playwright). |
| `tubo-perfeito/` | Jogo de surf 2D em HTML (artifact). | Abrir `tubo.html`. |
| `roblox-labirinto/` | Labirinto infinito para Roblox (Luau). `multi/` = 7 scripts com menos de 300 linhas cada. | Colar em ServerScriptService (5 ModuleScripts + 2 Scripts). |

## Para gerar APKs de novo
Os APKs foram montados sem Gradle (aapt2 + javac + d8 + zipalign + apksigner, Android SDK 34).
As chaves de assinatura (`.keystore`) NÃO foram salvas aqui. Sem elas, um APK novo não instala por cima do antigo:
desinstale o app antigo antes.

## Outros
- Graphify instalado com `uv tool install graphifyy` e `graphify install` (precisa refazer em container novo).
- OmniRoute roda no Termux do celular (`omniroute`, painel em http://localhost:20128).
