# Floppa OS 26 Basic - notas de atualizacao

O MeuOS (Floppa Edition) agora se chama **Floppa OS**. A versao 26 **Basic** traz tudo da 1.03 e muda
o jeito de usar o sistema: mais opcoes, num lugar so, e mais leve. ISO: `iso/meuos-v26.iso`

## Otimizado: mais leve e mais rapido
- **ISO e sistema mais enxutos**: saem os manuais, a documentacao e as traducoes de idiomas que nao sao
  portugues ou ingles (uns 300 MB a menos). O CD liga e instala mais rapido, e as atualizacoes nao trazem
  isso de volta.
- **Memoria comprimida (zram) melhor**: agora usa o **zstd** (cabe ~30% mais coisa que antes) e o tamanho
  se ajusta a RAM: PC com pouca memoria ganha mais zram.
- **Desktop mais responsivo**: o kernel agora roda em modo `preempt=full` (o mouse, o som e as janelas
  nao engasgam com o processador ocupado) e sem o "cao de guarda" que acordava o processador a toa.
- **Copiar para pendrive nao trava mais a tela**: o sistema grava em pedacos menores e mais cedo.
- **Floppa Otimizer** recalibrado para a zram (e se a zram estiver desligada ele percebe e se ajusta).
- **Login mais rapido**: os efeitos visuais nao testam mais a placa de video toda vez que voce entra
  (so quando a placa ou o driver mudam); em maquina virtual nem testam.
- **Boot mais rapido**: saem mais servicos que so atrasavam (ifupdown antigo, backup diario do dpkg).
- **Floppa Central mais agil**: a pagina de Rede abre na hora (o Bluetooth carrega em segundo plano) e o
  medidor do processador nao mostra mais 0% quando a pagina abre.

## Novidades da atualizacao
- **Modo Jogo** (**Super + G** ou Floppa Central > Energia): perfil Desempenho, efeitos visuais e luz
  noturna desligados e avisos em "nao perturbe". Desligou, tudo volta como estava. Vem com o **GameMode**:
  na Steam, coloque `gamemoderun %command%` nas opcoes do jogo.
- **Armazenamento** na Floppa Central: quanto espaco sobra em cada disco e pendrive, quanto ocupa cada
  pasta (Downloads, Documentos, Imagens...), a lixeira (com botao para esvaziar) e o cache dos programas.
- **Historico da area de transferencia** (**Super + V**, igual ao Windows): as ultimas coisas que voce copiou.
- **Luz noturna com horario**: escolha a hora que liga e desliga sozinha.
- **Copiar informacoes do sistema** (Floppa Central > Sistema): um resumo do PC para colar quando for pedir ajuda.

## Floppa Central: todas as configuracoes num lugar so
Abra pelo menu do Floppa, pelo icone na area de trabalho ou com **Super + I**. Tem uma busca no topo
("wifi", "tema", "teclado"...) e cada pagina so carrega quando voce abre (abre rapido mesmo em PC fraco).

- **Sistema** ao vivo: processador, memoria, zram, disco, temperatura, bateria e tempo ligado.
- **Aparencia**: tema escuro ou claro, tamanho do texto, papel de parede, efeitos visuais, icones na area de
  trabalho, barra de tarefas embaixo ou em cima e **dock estilo Mac** (opcional).
- **Tela**: **luz noturna** (manual ou sozinha das 19h as 7h, com intensidade), brilho e monitores.
- **Energia**: bateria (com a saude dela), perfis **Economia / Equilibrado / Desempenho** e o Floppa Otimizer.
- **Rede e Bluetooth**: liga/desliga Wi-Fi, **modo aviao**, lista as redes Wi-Fi e conecta (pede a senha so
  quando precisa), **ponto de acesso (hotspot)**, Bluetooth e aparelhos pareados.
- **Som**: volume, microfone, mudo, escolher a saida (alto-falante/fone/HDMI), teste e mixer.
- **Seguranca e privacidade**: firewall, senha ao voltar da suspensao, bloquear a tela, apagar rastros
  (arquivos recentes e miniaturas) e trocar a senha.
- **Inicializacao**: liga e desliga os programas que abrem sozinhos (desktop pronto mais rapido).
- **Data, idioma e teclado**: fuso horario, relogio pela internet, layout do teclado (com campo de teste) e
  nome do computador.
- **Ferramentas do Floppa**: Update, Programas, Otimizer, Liberar espaco, Recuperar arquivos, Windows (Wine),
  Floppa Games, Floppa Studio e o resto, com um clique.

## Visual novo, que se adapta ao seu computador
- Tema **Arc** (escuro de fabrica), icones **Papirus**, fonte **Inter**, tela de login nova.
- Barra de tarefas nova: **menu do Floppa** (com busca, favoritos e desligar/reiniciar), janelas abertas,
  bandeja, som, bateria, avisos, relogio e "mostrar a area de trabalho".
- **Efeitos visuais automaticos** (`floppa-visual`): o Floppa olha a memoria, a placa de video e se e maquina
  virtual e escolhe sozinho:
  - **Desligado** em PC com pouca memoria (o mais rapido);
  - **Leve** (sombras, quase nao pesa) em maquina virtual e PC sem placa de video;
  - **Completo** (cantos arredondados, sombras, desfoque, animacoes) com placa de video de verdade.
    Em jogo de tela cheia os efeitos saem da frente sozinhos (mais FPS).
- **Floppa Busca**: aperte **Alt + Espaco** (ou Super + S) e digite: programas, janelas abertas e arquivos.

## Atalhos de teclado (estilo Windows)
| Atalho | O que faz |
|---|---|
| Super | menu do Floppa |
| Alt + Espaco / Super + S | Floppa Busca |
| Super + E | arquivos |
| Ctrl + Alt + T / Super + Enter | terminal |
| Super + I | Floppa Central |
| Super + A | Wi-Fi e Bluetooth |
| Super + L | bloquear a tela |
| Super + D | mostrar a area de trabalho |
| Super + setas | janela na metade esquerda/direita, maximizar, minimizar |
| Ctrl + Shift + Esc / Ctrl + Alt + Del | gerenciador de tarefas |
| Print / Super + Shift + S | capturar a tela / uma area |
| Super + N | liga/desliga a luz noturna |
| Super + G | liga/desliga o Modo Jogo |
| Super + V | historico da area de transferencia |

## Notebooks
- Kernel com **Wi-Fi** (Intel, Realtek, Atheros, Broadcom, MediaTek), **Bluetooth**, bateria, brilho, teclas
  especiais, **touchpad** e tela de toque, camera, leitor de cartao, USB-C e o som dos modelos novos (SOF).
- Firmware das placas de Wi-Fi, Bluetooth e som ja vem no sistema.
- Perfis de energia (power-profiles-daemon) e controle de brilho.

## Mais seguro
- **Firewall ligado de fabrica**: bloqueia conexoes que chegam de fora. Navegador, jogos, Steam e atualizacoes
  continuam funcionando normalmente. Desligar pede a sua senha.
- No sistema instalado a **conta root fica travada**: tarefas de administrador usam a SUA senha (sudo).
  O modo de recuperacao continua abrindo o terminal.

## Mais rapido
- Servicos que so atrasavam o boot foram desligados (esperar a rede, tarefas do apt e do man-db).
- A Floppa Central so mede o sistema enquanto a pagina Sistema esta aberta.
- Efeitos visuais so ligam onde o computador aguenta.
- TRIM semanal no SSD do sistema instalado.

## Instalador
- Escolhe **fuso horario** e **layout do teclado**.
- O menu de boot do computador mostra **Floppa OS 26**.

## Novos programas
Visualizador de imagens (Ristretto), compactador de arquivos (Xarchiver, direto no gerenciador de arquivos),
calculadora (Galculator), gerenciador de tarefas, captura de tela, mixer de som e player de video (mpv).

## Limites honestos
- Wi-Fi e Bluetooth nao aparecem em maquina virtual (la a rede e sempre "cabo").
- Os efeitos "Completo" pedem placa de video com OpenGL; em VM o Floppa usa o modo Leve.
- NVIDIA continua so com o driver livre (nouveau).
- Wi-Fi Broadcom antigo (driver "wl") nao funciona: so as placas suportadas pelo kernel.
