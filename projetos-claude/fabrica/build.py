# Junta src/ num único HTML (o jogo roda como um arquivo só, inclusive no celular).
import glob, os, sys
R = os.path.dirname(os.path.abspath(__file__))
css = open(f'{R}/src/style.css', encoding='utf-8').read()
body = open(f'{R}/src/body.html', encoding='utf-8').read()
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(f'{R}/src/js/*.js')))
# dentro de <script>, "</script" fecharia a tag: escapa (em JS, <\/ é igual a </)
js = js.replace('</script', '<\\/script')
html = ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n'
        '<title>Fábrica de Tudo</title>\n<style>\n' + css + '\n</style></head><body>\n' + body + '\n<script>\n' + js + '\n</script></body></html>\n')
out = sys.argv[1] if len(sys.argv) > 1 else f'{R}/dist/Fabrica_de_Tudo.html'
open(out, 'w', encoding='utf-8').write(html)
print(out, len(html), 'bytes')
