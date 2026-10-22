# Extrai do conectoma (conexoes.csv + soma_sides do malecns) o circuito
# olhos (neurônios visuais) -> cérebro -> neurônios descendentes (DN), em até 3 sinapses.
import csv, collections, re, json
K = 3
side = {r['body']: r['soma_side'] for r in csv.DictReader(open('soma_sides.csv'))}
rows = list(csv.DictReader(open('conexoes.csv')))
typ = {}
for r in rows: typ[r['pre']] = r['pre_type'] or 'sem_tipo'; typ[r['post']] = r['post_type'] or 'sem_tipo'
is_vis = lambda t: bool(re.match(r'(LC|LPLC|LT|LoVP|LPT|MeLo|LLPC|VS|HS)', t))
is_dn = lambda t: t.startswith('DN')
V = {i for i, t in typ.items() if is_vis(t) and side.get(i) in ('L', 'R')}
DN = {i for i, t in typ.items() if is_dn(t) and side.get(i) in ('L', 'R')}
out = collections.defaultdict(list); inn = collections.defaultdict(list)
for r in rows: out[r['pre']].append(r['post']); inn[r['post']].append(r['pre'])
def bfs(src, adj):
    d = {s: 0 for s in src}; fr = list(src)
    for l in range(1, K + 1):
        nf = []
        for u in fr:
            for v in adj[u]:
                if v not in d: d[v] = l; nf.append(v)
        fr = nf
    return d
f = bfs(V, out); b = bfs(DN, inn)
keep = {n for n in f if n in b and f[n] + b[n] <= K}
ids = sorted(keep, key=lambda i: (0 if i in V else 2 if i in DN else 1, typ[i], i))
idx = {i: k for k, i in enumerate(ids)}
types = sorted({typ[i] for i in ids}); tix = {t: k for k, t in enumerate(types)}
E = [(idx[r['pre']], idx[r['post']], int(r['weight'])) for r in rows if r['pre'] in idx and r['post'] in idx and r['pre'] != r['post']]
tot = collections.Counter()
for a, p, w in E: tot[p] += w
brain = {
  'fonte': 'maleCNS (Janelia FlyEM / Cambridge) — conexoes.csv + soma_sides',
  'ids': [int(i) for i in ids],
  'tipo': [tix[typ[i]] for i in ids],
  'lado': [0 if side.get(i) == 'L' else 1 if side.get(i) == 'R' else 2 for i in ids],
  'papel': [1 if i in V else 2 if i in DN else 0 for i in ids],
  'tipos': types,
  'pre': [e[0] for e in E], 'post': [e[1] for e in E],
  'w': [round(e[2] / tot[e[1]], 4) for e in E],
  'sinapses': [e[2] for e in E],
}
json.dump(brain, open('../app/brain.json', 'w'), separators=(',', ':'))
c = collections.Counter(brain['papel'])
print('neurônios', len(ids), 'visuais', c[1], 'DN', c[2], 'intermediários', c[0], 'conexões', len(E), 'tipos', len(types))
print('DN lados', collections.Counter(brain['lado'][k] for k in range(len(ids)) if brain['papel'][k] == 2))
