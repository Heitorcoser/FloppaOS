# 🐾 FloopyC - a linguagem de programação do Floppa

**FloopyC** é a linguagem de programação do **MeuOS (Floppa Edition)**. Ela mistura o jeito do **HolyC**
(chaves `{ }` e ponto e vírgula `;`) com o jeito do **Lua** (listas que começam em 1, `..` para juntar texto,
`--` para comentários). É simples de aprender e já vem pronta no MeuOS, com jogos, som e voz.

> **A regra de ouro:** todo comando da linguagem termina em **`Bin`**, **`Flp`** ou **`Sch`**.
> `ifFlp`, `elseBin`, `whileFlp`, `SayBin`, `AskSch`... É a marca registrada do Floppa. 🐱

[⬇ Baixar o MeuOS](https://github.com/Heitorcoser/FloppaOS/releases) ·
[Código no GitHub](https://github.com/Heitorcoser/FloppaOS)

---

## Sumário

1. [Primeiro programa](#1-primeiro-programa)
2. [Variáveis e valores](#2-variáveis-e-valores)
3. [Decisões: se / senão](#3-decisões-se--senão)
4. [Repetições](#4-repetições)
5. [Funções](#5-funções)
6. [Listas e tabelas](#6-listas-e-tabelas)
7. [Conversar com o usuário](#7-conversar-com-o-usuário)
8. [Texto e números](#8-texto-e-números)
9. [Som e voz](#9-som-e-voz)
10. [Salvar dados e arquivos](#10-salvar-dados-e-arquivos)
11. [Jogos em tempo real](#11-jogos-em-tempo-real)
12. [Projeto completo: adivinhe o número](#12-projeto-completo-adivinhe-o-número)
13. [Referência rápida](#13-referência-rápida)
14. [Erros comuns](#14-erros-comuns)

---

## Como rodar

Dentro do MeuOS, abra o **Floppa Studio** (menu de aplicativos), que cria programas a partir de modelos,
edita e roda. Ou, pelo terminal:

```
floopyc meu-programa.flp        # roda o programa
floopyc --check meu-programa.flp   # só confere se a sintaxe está certa
```

Os arquivos de FloopyC terminam em **`.flp`**.

Onde achar exemplos dentro do MeuOS:

| O quê | Onde |
|---|---|
| Jogos prontos (cobra, peixes, adivinha, piano...) | `/usr/share/meuos/jogos/` ou o menu **Jogos do Floppa** |
| Modelos para começar (jogo, programa, música) | `/usr/share/meuos/modelos/` |
| Este manual, em texto | `/usr/share/meuos/FloopyC.md` |

---

## 1. Primeiro programa

```
SayBin("Olá, mundo! Eu sou o Floppa.");
```

- `SayBin(...)` escreve na tela **e pula a linha**.
- `PrintFlp(...)` escreve **sem** pular a linha.
- Todo comando termina com **`;`**.
- Comentários começam com `--` e vão até o fim da linha:

```
-- isto é um comentário, o computador ignora
SayBin("Isto aparece na tela");   -- este também
```

---

## 2. Variáveis e valores

Crie uma variável com **`varFlp`**:

```
varFlp nome = "Floppa";
varFlp idade = 3;
varFlp feliz = trueFlp;

SayBin("Meu nome é ", nome, " e tenho ", idade, " anos.");
idade += 1;                    -- agora idade vale 4
```

| Tipo | Exemplo |
|---|---|
| Número | `5`, `3.14` |
| Texto | `"oi"` (escapes: `\n` nova linha, `\t` tab, `\"` aspas, `\e` ESC para cores) |
| Lista | `[1, 2, 3]` |
| Tabela | `{nome: "Floppa", idade: 3}` |
| Verdadeiro / falso / nada | `trueFlp` / `falseBin` / `nilSch` |

**Operadores**

- Contas: `+  -  *  /  //  %`
- Juntar texto: `..` (por exemplo `"oi " .. nome`)
- Comparar: `==  !=  <  <=  >  >=`
- Lógica: `&&` (e), `||` (ou), `!` (não)
- Atalhos: `+=  -=  *=  /=`

**O que é falso?** Só `falseBin`, `nilSch` e o número `0`. Todo o resto é verdadeiro.

---

## 3. Decisões: se / senão

```
varFlp nota = 7;

ifFlp (nota >= 7) {
    SayBin("Passou!");
} elseifSch (nota >= 5) {
    SayBin("Recuperação.");
} elseBin {
    SayBin("Precisa estudar mais.");
}
```

| Palavra | Significa |
|---|---|
| `ifFlp (condição) { }` | se |
| `elseifSch (condição) { }` | senão se (também vale `elseifex`) |
| `elseBin { }` | senão |

---

## 4. Repetições

**`whileFlp`** repete enquanto a condição for verdadeira:

```
varFlp n = 3;
whileFlp (n > 0) {
    SayBin(n, "...");
    n -= 1;
}
SayBin("Já!");
```

**`forFlp`** conta de um número a outro (o terceiro número, opcional, é o passo):

```
forFlp (i = 1, 5) {
    SayBin("Volta ", i);
}

forFlp (i = 2, 10, 2) {        -- 2, 4, 6, 8, 10
    PrintFlp(i, " ");
}
SayBin("");
```

**`foreachSch`** percorre uma lista, as chaves de uma tabela ou as letras de um texto:

```
foreachSch (comida inBin ["peixe", "frango", "atum"]) {
    SayBin("O Floppa gosta de ", comida);
}
```

Para sair de um laço use **`breakBin;`**; para pular para a próxima volta, **`continueFlp;`**.

---

## 5. Funções

```
funcSch dobro(n) {
    returnBin n * 2;
}

funcSch saudacao(nome) {
    SayBin("Oi, ", nome, "!");
}

saudacao("Floppa");
SayBin("O dobro de 21 é ", dobro(21));
```

- `funcSch nome(a, b) { }` cria a função.
- `returnBin valor;` devolve um valor.
- Defina a função **antes** de usar.

---

## 6. Listas e tabelas

**Listas** começam na posição **1** (como no Lua):

```
varFlp frutas = ["uva", "maçã", "pera"];

SayBin(frutas[1]);             -- uva
SayBin("Tem ", #frutas, " frutas");
AddBin(frutas, "manga");       -- põe no fim
```

**Tabelas** guardam pares nome → valor:

```
varFlp gato = {nome: "Floppa", idade: 3};

SayBin(gato.nome);             -- Floppa
SayBin(gato["idade"]);         -- 3
gato.idade = 4;
```

| Função | O que faz |
|---|---|
| `LenFlp(x)` ou `#x` | tamanho |
| `AddBin(lista, valor)` | adiciona no fim |
| `InsertSch(lista, posição, valor)` | insere numa posição |
| `RemoveBin(lista, posição)` | tira uma posição |
| `ShuffleBin(lista)` | embaralha |
| `KeysSch(tabela)` | lista as chaves |
| `HasBin(x, item)` | tem o item? |

---

## 7. Conversar com o usuário

```
varFlp nome = AskSch("Qual é o seu nome? ");
SayBin("Prazer, ", nome, "!");

varFlp idade = NumBin(AskSch("Quantos anos você tem? "));
SayBin("No ano que vem você terá ", idade + 1);
```

- `AskSch("pergunta")` faz a pergunta e devolve o que a pessoa digitou (como **texto**).
- `NumBin(texto)` transforma texto em número.
- `KeySch()` espera o usuário apertar **uma tecla**.

---

## 8. Texto e números

```
SayBin(UpperFlp("floppa"));            -- FLOPPA
SayBin(SubSch("abcdef", 2, 4));        -- bcd
SayBin(RepeatBin("=", 20));            -- ====================
varFlp partes = SplitSch("a,b,c", ",");
SayBin(JoinFlp(partes, " + "));        -- a + b + c

SayBin(RandBin(1, 6));                 -- dado de 1 a 6
SayBin(RoundSch(3.14159, 2));          -- 3.14
SayBin(MaxSch(4, 9, 2));               -- 9
```

Quer uma frase aleatória do Floppa? `SayBin(FloppaFlp());` 🐱

---

## 9. Som e voz

O FloopyC toca tons, notas, arquivos de som e **fala em voz alta**.

```
NoteSch("C4", 300);               -- toca a nota Dó e espera 300 ms
BeepFlp(880, 80);                 -- toca um tom e já continua o programa (efeito de jogo)
SpeakFlp("Olá, eu sou o Floppa"); -- fala!
```

Notas: `C D E F G A B` (dó ré mi fá sol lá si), `#` sustenido, `b` bemol e um número para a oitava
(`C4`, `F#3`, `Bb5`).

**Uma musiquinha:**

```
funcSch toca(frase) {
    foreachSch (n inBin frase) {
        ifFlp (n[1] == "R") {
            RestFlp(n[2]);              -- pausa
        } elseBin {
            NoteSch(n[1], n[2]);
        }
    }
}

varFlp parte1 = [["C4", 300], ["D4", 300], ["E4", 300], ["C4", 300]];
toca(parte1);
toca(parte1);
```

| Função | O que faz |
|---|---|
| `BeepFlp(freq, ms)` | toca um tom **sem esperar** |
| `ToneBin(freq, ms)` | toca um tom e espera |
| `NoteSch("C4", ms)` | toca uma nota e espera |
| `NoteFreqBin("A4")` | devolve a frequência da nota |
| `RestFlp(ms)` | silêncio |
| `PlaySch("arq.wav")` / `PlayWaitFlp("arq.wav")` | toca um arquivo de som |
| `StopSoundBin()` | para todos os sons |
| `VolumeSch(0 a 100)` | muda o volume |
| `SpeakFlp("texto")` | fala em voz alta |

Sem som? Na máquina virtual, ligue o áudio (VirtualBox → Configurações → Áudio → Intel HD Audio)
e abra o **Som do MeuOS** para testar.

---

## 10. Salvar dados e arquivos

**Guardar um recorde** (fica em `~/.floopyc` e não some quando o programa fecha):

```
varFlp recorde = LoadSch("meu-jogo");
ifFlp (recorde == nilSch || NumBin(recorde) < 10) {
    SaveFlp("meu-jogo", 10);
    SayBin("Novo recorde!");
}
```

**Ler e escrever arquivos:**

```
WriteFileSch("/tmp/oi.txt", "Olá do Floppa");
ifFlp (ExistsFlp("/tmp/oi.txt")) {
    SayBin(ReadFileBin("/tmp/oi.txt"));
}
foreachSch (arq inBin ListFilesBin("/usr/share/meuos/jogos")) {
    SayBin(arq);
}
```

Outras: `DateSch("%d/%m/%Y %H:%M")` (data e hora), `TimeFlp()`, `SleepSch(segundos)`.

---

## 11. Jogos em tempo real

`KeyNowBin(segundos)` espera esse tempo e devolve a **última tecla** apertada (ou `""` se nenhuma).
Isso faz o jogo andar sozinho, sem esperar o jogador.

Teclas: `up  down  left  right  enter  space  esc` ou a própria letra.

```
ClearBin();
CursorSch(falseBin);                    -- esconde o cursor
varFlp x = 10;
varFlp rodando = trueFlp;

whileFlp (rodando) {
    MoveFlp(5, x);                      -- vai para linha 5, coluna x
    ColorSch(33);                       -- amarelo
    PrintFlp("@");
    ColorSch(0);                        -- cor normal

    varFlp t = KeyNowBin(0.1);          -- espera 0,1 s
    MoveFlp(5, x);
    PrintFlp(" ");                      -- apaga o rastro

    ifFlp (t == "left") {
        x = MaxSch(1, x - 1);
    } elseifSch (t == "right") {
        x = MinBin(40, x + 1);
    } elseifSch (t == "q") {
        rodando = falseBin;
    }
}
CursorSch(trueFlp);
```

| Função | O que faz |
|---|---|
| `ClearBin()` / `HomeSch()` | limpa a tela / volta ao canto |
| `MoveFlp(linha, coluna)` | move o cursor |
| `ColorSch(n)` | cor ANSI (31 vermelho, 32 verde, 33 amarelo, 36 ciano, 0 normal) |
| `CursorSch(trueFlp / falseBin)` | mostra / esconde o cursor |
| `WidthFlp()` / `HeightBin()` | tamanho do terminal |
| `RandBin(a, b)` / `RandFlp()` | número aleatório (inteiro / entre 0 e 1) |

Veja um jogo completo em `/usr/share/meuos/modelos/jogo.flp` (moedas, espinhos, vidas, som e recorde).

---

## 12. Projeto completo: adivinhe o número

```
-- O computador escolhe um número; você tenta adivinhar.
varFlp segredo = RandBin(1, 100);
varFlp tentativas = 0;

SayBin("Pensei num número de 1 a 100. Adivinhe!");

whileFlp (trueFlp) {
    varFlp palpite = NumBin(AskSch("Seu palpite: "));
    tentativas += 1;

    ifFlp (palpite == segredo) {
        SayBin("Acertou em ", tentativas, " tentativas!");
        SpeakFlp("Parabéns!");
        breakBin;
    } elseifSch (palpite < segredo) {
        SayBin("Maior!");
    } elseBin {
        SayBin("Menor!");
    }
}
SayBin(FloppaFlp());
```

Digite só números nos palpites. Quer melhorar? Limite o número de tentativas, guarde o recorde
com `SaveFlp` ou toque um som quando acertar.

---

## 13. Referência rápida

### Palavras da linguagem

| Comando | Significado |
|---|---|
| `varFlp x = 5;` | declara variável |
| `ifFlp (c) { }` | se |
| `elseifSch (c) { }` | senão se (também `elseifex`) |
| `elseBin { }` | senão |
| `whileFlp (c) { }` | enquanto |
| `forFlp (i = 1, 10) { }` | repete de 1 a 10 (3º número = passo, opcional) |
| `foreachSch (v inBin lista) { }` | percorre lista, tabela (chaves) ou texto |
| `funcSch nome(a, b) { }` | função |
| `returnBin x;` | devolve valor |
| `breakBin;` / `continueFlp;` | sai do laço / pula para a próxima volta |
| `trueFlp` `falseBin` `nilSch` | verdadeiro, falso, nada |

### Funções prontas

| Grupo | Funções |
|---|---|
| Tela | `PrintFlp`, `SayBin`, `ClearBin`, `HomeSch`, `MoveFlp`, `ColorSch`, `CursorSch` |
| Entrada | `AskSch`, `KeySch`, `KeyNowBin` |
| Números | `NumBin`, `RandBin`, `RandFlp`, `FloorFlp`, `CeilSch`, `RoundSch`, `AbsBin`, `SqrtFlp`, `MaxSch`, `MinBin` |
| Texto | `StrSch`, `UpperFlp`, `LowerBin`, `SubSch`, `FindFlp`, `RepeatBin`, `SplitSch`, `JoinFlp`, `TrimBin` |
| Listas | `LenFlp`, `AddBin`, `InsertSch`, `RemoveBin`, `ShuffleBin`, `KeysSch`, `HasBin` |
| Sistema | `SleepSch`, `TimeFlp`, `ExitBin`, `RunFlp("outro.flp")`, `ArgsSch`, `TypeSch` |
| Salvar | `SaveFlp`, `LoadSch` |
| Floppa | `FloppaFlp` |
| Som | `BeepFlp`, `ToneBin`, `NoteSch`, `NoteFreqBin`, `RestFlp`, `PlaySch`, `PlayWaitFlp`, `StopSoundBin`, `VolumeSch`, `SpeakFlp` |
| Extras | `DateSch`, `ReadFileBin`, `WriteFileSch`, `ListFilesBin`, `ExistsFlp`, `WidthFlp`, `HeightBin` |

---

## 14. Erros comuns

| Problema | Como resolver |
|---|---|
| Esqueci o `;` no fim do comando | Todo comando termina com `;`. Rode `floopyc --check arquivo.flp` para achar a linha. |
| Escrevi `if` ou `print` e não funciona | Os comandos têm o final do Floppa: `ifFlp`, `PrintFlp`, `SayBin`... |
| `elseif` não funciona | Use `elseifSch` (ou `elseifex`). |
| A lista não tem o item `0` | Listas começam em **1**: `lista[1]` é o primeiro. |
| Juntei texto com `+` | Para texto use `..`: `"oi " .. nome`. O `+` é para contas. |
| Usei uma função antes de criá-la | Escreva o `funcSch` **antes** da linha que chama a função. |
| Não sai som | Ligue o áudio da máquina virtual e teste no **Som do MeuOS**. |

---

<div align="center">

Feito com 🧡 para o Floppa · [Voltar ao MeuOS](https://github.com/Heitorcoser/FloppaOS)

</div>
