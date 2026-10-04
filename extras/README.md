# Conteúdo adicional do MeuOS

O MeuOS lista aqui o que aparece em **Conteúdo adicional** (menu de aplicativos). Quem quiser pode
também **importar conteúdo de terceiros**: um arquivo `.tar.gz` ou o endereço de outro servidor
(por exemplo a pasta `extras` de outro GitHub).

> Conteúdo de terceiros **não é conferido** pelo MeuOS e roda como programa no computador de quem
> instala. Importe só de quem você confia.

## Como publicar um conteúdo

### 1. Monte o pacote

Tudo dentro de **uma pasta com o mesmo nome do ID** (letras minúsculas, números, `-` e `_`):

```
meujogo/
├── extra.json
└── main.py        (seus arquivos)
```

`extra.json`:

```json
{
  "nome": "Meu Jogo",
  "versao": "1.0",
  "descricao": "Uma frase sobre o que é.",
  "icone": "applications-games",
  "comando": "python3 {dir}/main.py"
}
```

- `{dir}` vira a pasta onde o conteúdo foi instalado.
- `icone` é um nome de ícone do sistema ou um arquivo dentro do pacote.
- Sem links simbólicos, sem `..` e sem caminhos absolutos no pacote.

Gere o pacote:

```bash
tar -czf meujogo-1.0.tar.gz meujogo/
sha256sum meujogo-1.0.tar.gz
stat -c %s meujogo-1.0.tar.gz
```

### 2. Importar direto (sem servidor)

No MeuOS: **Conteúdo adicional → Importar conteúdo adicional → escolher o arquivo .tar.gz**,
ou no terminal: `meuos-extras importar meujogo-1.0.tar.gz`.

### 3. Publicar num servidor (GitHub)

Crie uma pasta `extras/` no seu repositório com o `.tar.gz` e um `extras.tsv`:

```
# id|nome|tipo|versao|arquivo|sha256|tamanho|descricao
meujogo|Meu Jogo|Jogo|1.0|meujogo-1.0.tar.gz|<sha256>|<bytes>|Uma frase sobre o que é.
```

Quem quiser usar adiciona o endereço da pasta (a versão "raw"):

```
https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/extras
```

em **Conteúdo adicional → Importar conteúdo adicional → adicionar servidor**, ou no terminal:
`meuos-extras servidor <endereço>`. Os itens aparecem na mesma lista, marcados como de terceiros,
e nunca substituem os oficiais.
