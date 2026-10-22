#!/bin/bash
# Verifica a sintaxe do JS do HTML montado
set -e
R=$(dirname "$0")/..
T=$(mktemp --suffix=.js)
python3 - "$R/dist/Fabrica_de_Tudo.html" "$T" <<'PY'
import sys,re
s=open(sys.argv[1],encoding='utf-8').read()
open(sys.argv[2],'w').write(re.search(r'<script>\n(.*)\n</script></body>',s,re.S).group(1))
PY
node --check "$T" && echo SINTAXE_OK
rm -f "$T"
