# MeuOS 1.03 (Floppa Edition) - notas de atualizacao

**Versao final** (sem beta). ISO: `iso/meuos-v1.03.iso`

Tudo da 1.03 Beta (instalador avancado com dual boot, GParted, escolha do usuario e Floppa Games com
drivers de video, Vulkan e Steam) e mais:

## Instalador mais seguro
- Recusa instalar com **Secure Boot ligado** (o GRUB do MeuOS nao e assinado).
- Faz **copia de seguranca da tabela de particoes** antes de mexer no disco.
- **Confere tudo no fim** e **desfaz o que criou** se algo der errado no meio.
- Relogio certo ao conviver com o Windows (dual boot).

## Novas ferramentas
- **Tela azul do Floppa** (`floppa-bsod`): aparece quando o desktop (lightdm) falha e no modo de emergencia.
  No kernel panic tambem, se o driver de video suportar (DRM_PANIC).
- **Liberar espaco** (`meuos-limpar`): limpa cache, logs e pacotes que nao servem mais.
- **Recuperar arquivos** (`meuos-recuperar`, com PhotoRec): busca profunda de arquivos apagados.
- **Gerenciador de programas** (`floppa-programas`): programas por versao do MeuOS.
- **Floppa Update** com canal **estavel/beta** e comparacao de versoes certa (nao avisa de versao velha
  como se fosse nova). Corrigido o erro "stage/latest.tsv" quando rodava duas vezes ao mesmo tempo.

## Windows (Wine) bem melhor
- **Aviso de espaco** antes de rodar um instalador: na sessao live o disco e a RAM, e instaladores grandes
  acabavam com o espaco e davam "Falha de escrita".
- **Disco do Windows**: com a **Pasta Compartilhada** ligada, o MeuOS cria nela um disco de 24 GB so para o
  Windows. Seu Windows tem espaco de verdade e **nao some ao desligar**.
- **Erros em portugues**: se o programa der problema, o MeuOS le o registro do Wine e explica o que faltou
  (espaco, Visual C++, DirectX, .NET, funcao que o Wine ainda nao tem, travamento), com botao "Ver registro".
- **Instalar o essencial** (Visual C++, fontes, GDI+, MSXML, DirectX) e **O que deu errado?** no menu Windows.
- O mundo Windows novo ja nasce como Windows 10.

## Steam e jogos no disco do computador (Floppa Games)
- Na sessao live (CD) a Steam e os jogos ficavam na **RAM** e nao cabiam: o download falhava no meio.
  Agora, com a **Pasta Compartilhada** ligada, **Floppa Games > Jogos no disco do computador** cria nela um
  disco de 64 GB (so ocupa o que for usado) para a Steam e os jogos, que **nao somem ao desligar**.
  Ao abrir a Steam, o MeuOS liga esse disco sozinho.
- Mesmo assim, o jeito certo de jogar e **instalar o MeuOS no computador**. Em maquina virtual os jogos 3D
  rodam pelo processador e ficam muito lentos.

## Conteudo adicional
- **Importar conteudo adicional**: instala conteudo de terceiros de um arquivo `.tar.gz`, de uma **pasta com
  varios adicionais de uma vez** ou de outro servidor (por exemplo a pasta `extras` de um GitHub).
  O MeuOS **nao confere** conteudo de terceiros: importe so de quem voce confia.
- O **Floppa do FloppyMakes** agora ajuda em **Python, JavaScript, FloopyC** e Shell.

## Limites honestos
- Programas que mexem direto no disco (particionadores, clonadores), drivers, antivirus e jogos com
  anti-cheat nao funcionam no Wine nem no Linux.
- NVIDIA so com o driver livre (nouveau). Jogos 3D de verdade pedem placa AMD ou Intel.
