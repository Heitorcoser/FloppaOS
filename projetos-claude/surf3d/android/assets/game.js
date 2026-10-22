// Tubo 3D: onda que quebra de verdade, gerada por perfil procedural a cada quadro.
(() => {
'use strict';
const T = THREE, $ = id => document.getElementById(id);
const H = 4;          // altura da onda (unidades do mundo)
const D = 30;         // distância entre a curva (peel) e o ponto onde o lábio fecha
const DX = 1, NX = 180, NS = 88, XB = -110; // malha da onda ao redor do surfista
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t), rnd = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => ease(clamp((x - a) / (b - a), 0, 1));
const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), u = ease(x - xi), v = ease(y - yi), h = (a, b) => hash(a * 57 + b * 131);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}

/* ---------- cena ---------- */
const canvas = $('c');
const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
renderer.outputEncoding = T.sRGBEncoding;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(60, 1, 0.05, 1200);

const SUN = new T.Vector3(-0.38, 0.36, -0.85).normalize(); // sol baixo do lado da praia: luz dourada na parede
const HORIZON = new T.Color('#f6d6aa');
const skyMat = new T.ShaderMaterial({
  side: T.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new T.Color('#1b5fae') }, hor: { value: HORIZON }, sun: { value: SUN } },
  vertexShader: 'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform vec3 top;uniform vec3 hor;uniform vec3 sun;varying vec3 vDir;
    void main(){vec3 d=normalize(vDir);float h=max(d.y,0.);vec3 c=mix(hor,top,pow(h,.5));
    if(d.y<0.)c=mix(hor,vec3(.05,.3,.36),clamp(-d.y*6.,0.,1.));
    float s=max(dot(d,sun),0.);c+=vec3(1.,.86,.62)*pow(s,900.)*4.+vec3(1.,.72,.45)*pow(s,10.)*.45;
    gl_FragColor=vec4(c,1.);}`
});
const sky = new T.Mesh(new T.SphereGeometry(900, 32, 16), skyMat);
scene.add(sky);
{
  const pm = new T.PMREMGenerator(renderer), env = new T.Scene();
  env.add(new T.Mesh(new T.SphereGeometry(10, 32, 16), skyMat));
  scene.environment = pm.fromScene(env, 0.02).texture;
}
scene.fog = new T.Fog(new T.Color('#cfd9cf'), 90, 420);
scene.add(new T.HemisphereLight('#cfeeff', '#0a3a44', 0.6));
const sunLight = new T.DirectionalLight('#ffe0b5', 1.55);
sunLight.position.copy(SUN).multiplyScalar(100);
scene.add(sunLight);

function waterTexture(force = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * 256, len = 20 + Math.random() * 110, x0 = Math.random() * 256;
    x.strokeStyle = `rgba(0,40,60,${(0.03 + Math.random() * 0.08) * force})`;
    x.lineWidth = 0.8 + Math.random() * 2.4;
    for (const off of [0, -256, 256]) {
      x.beginPath(); x.moveTo(x0 + off, y);
      x.bezierCurveTo(x0 + off + len * .3, y + rnd(-3, 3), x0 + off + len * .6, y + rnd(-3, 3), x0 + off + len, y + rnd(-2, 2));
      x.stroke();
    }
  }
  for (let i = 0; i < 90; i++) { // brilhos claros
    x.fillStyle = `rgba(255,255,255,${(0.2 + Math.random() * 0.3) * force})`;
    x.fillRect(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 20, 1);
  }
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}
const waterTex = waterTexture();
const oceanTex = waterTexture(0.45); oceanTex.repeat.set(90, 90);

const DEEP = new T.Color(0.008, 0.085, 0.13), MID = new T.Color(0.015, 0.25, 0.32), LIGHT = new T.Color(0.09, 0.6, 0.55), FOAM = new T.Color(0.9, 0.95, 0.96);

const ocean = new T.Mesh(new T.PlaneGeometry(2400, 2400), new T.MeshStandardMaterial({
  color: DEEP, map: oceanTex, roughness: 0.12, metalness: 0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4,
}));
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

/* ---------- malha da onda ---------- */
const NV = NX * NS, wPos = new Float32Array(NV * 3), wCol = new Float32Array(NV * 3), wUv = new Float32Array(NV * 2);
const waveGeo = new T.BufferGeometry();
{
  const idx = new Uint32Array((NX - 1) * (NS - 1) * 6); let k = 0;
  for (let i = 0; i < NX - 1; i++) for (let j = 0; j < NS - 1; j++) {
    const a = i * NS + j, b = a + NS;
    idx[k++] = a; idx[k++] = b; idx[k++] = a + 1; idx[k++] = b; idx[k++] = b + 1; idx[k++] = a + 1;
  }
  waveGeo.setIndex(new T.BufferAttribute(idx, 1));
  waveGeo.setAttribute('position', new T.BufferAttribute(wPos, 3).setUsage(T.DynamicDrawUsage));
  waveGeo.setAttribute('color', new T.BufferAttribute(wCol, 3).setUsage(T.DynamicDrawUsage));
  waveGeo.setAttribute('uv', new T.BufferAttribute(wUv, 2).setUsage(T.DynamicDrawUsage));
}
const waveMat = new T.MeshStandardMaterial({ vertexColors: true, map: waterTex, roughness: 0.16, metalness: 0, side: T.DoubleSide, envMapIntensity: 1 });
waveMat.onBeforeCompile = s => { // a água acesa por dentro: parede e lábio parecem translúcidos
  s.fragmentShader = s.fragmentShader.replace('#include <emissivemap_fragment>',
    '#include <emissivemap_fragment>\n#ifdef USE_COLOR\ntotalEmissiveRadiance += vColor.rgb * 0.13;\n#endif');
};
const waveMesh = new T.Mesh(waveGeo, waveMat);
waveMesh.frustumCulled = false;
scene.add(waveMesh);

// parâmetros do perfil para uma fase p (p<0 ombro, 0.3..1 lábio sendo lançado, >1 fechando, >1.25 espuma)
function waveParams(p, o) {
  const st = ease(clamp((p + 0.35) / 0.65, 0, 1));
  let amp = lerp(0.68, 1, st);
  if (p < -0.35) amp *= clamp(1 + (p + 0.35) * 0.35, 0.45, 1);
  const col = clamp((p - 1) / 0.3, 0, 1);
  amp *= 1 - 0.12 * col;
  o.st = st; o.amp = amp; o.col = col; o.p = p;
  o.F = lerp(1.9, 0.55, st) * amp;
  o.prog = clamp((p - 0.3) / 0.6, 0, 1);
  o.Lx = 1.35 * amp;
  o.ww = clamp((p - 1.25) / 0.55, 0, 1);
  return o;
}
const L = {};
function lipC(w, s) { // linha central do lábio (unidades de H), tangente e normal para dentro do tubo
  L.z = -w.Lx * s; L.y = w.amp * (1 - s * s + 0.34 * s * (1 - s));
  const tz = -w.Lx, ty = w.amp * (-2 * s + 0.34 * (1 - 2 * s)), len = Math.hypot(tz, ty);
  L.tz = tz / len; L.ty = ty / len; L.nz = -L.ty; L.ny = L.tz;
  L.th = w.amp * (0.15 * (1 - s) + 0.05);
  return L;
}

const RAW = new Float32Array(600 * 4); let rn = 0;
const P = (z, y, l, f) => { const k = rn * 4; RAW[k] = z; RAW[k + 1] = y; RAW[k + 2] = l; RAW[k + 3] = f; rn++; };
const FRONT = [-60, -34, -20, -12, -8, -5.5, -4, -3, -2.2, -1.6, -1.1], BACK = [4.2, 6, 9, 14, 24, 40, 80];

function rawBroken(w) {
  rn = 0;
  const amp = w.amp, F = w.F, prog = w.prog, col = w.col;
  const landing = clamp((prog - 0.9) * 10, 0, 1) * (0.45 + 0.55 * col);
  const front = z => landing * Math.exp(-(((z + w.Lx) / 1.8) ** 2)) + col * 0.5 * Math.exp(-(((z + w.Lx) / 3.5) ** 2));
  const tip = s => prog > 0.35 ? 0.6 * smooth(prog - 0.22, prog, s) * clamp((prog - 0.35) * 3, 0, 1) : 0;
  for (const z of FRONT) if (z < -F - 0.15) P(z, 0, 0, front(z));
  const hTop = 0.9;
  for (let k = 0; k <= 14; k++) {
    const h = hTop * k / 14, z = -F * (1 - h) * (1 - h);
    P(z, h * amp, 0.1 + 0.9 * h, col * (0.55 + 0.45 * h) + front(z) * (1 - h));
  }
  const nL = Math.max(2, Math.round(prog * 16));
  for (let k = 0; k <= nL; k++) { // lado de dentro do lábio (teto do tubo)
    const s = prog * k / nL; lipC(w, s);
    P(L.z + L.nz * L.th / 2, L.y + L.ny * L.th / 2, 1, col * 0.9 + tip(s));
  }
  lipC(w, prog);
  const cz = L.z, cy = L.y, r = L.th / 2, nz = L.nz, ny = L.ny, tz = L.tz, ty = L.ty;
  for (let k = 1; k < 6; k++) { // ponta arredondada do lábio
    const a = Math.PI * k / 6, ca = Math.cos(a), sa = Math.sin(a);
    P(cz + (nz * ca + tz * sa) * r, cy + (ny * ca + ty * sa) * r, 0.95, col * 0.9 + tip(prog) + 0.12 * prog);
  }
  for (let k = nL; k >= 0; k--) { // lado de fora do lábio
    const s = prog * k / nL; lipC(w, s);
    P(L.z - L.nz * L.th / 2, L.y - L.ny * L.th / 2, 0.75, col * 0.9 + tip(s) * 0.8);
  }
  const k0 = (rn - 1) * 4, oz = RAW[k0], oy = RAW[k0 + 1];
  const p1z = oz + 0.7 * amp, p1y = oy + 0.02 * amp, p2z = 1.7 * amp, p2y = 0.22 * amp, p3z = 3 * amp;
  for (let k = 1; k <= 10; k++) { // costas da onda
    const t = k / 10, u = 1 - t;
    const z = u * u * u * oz + 3 * u * u * t * p1z + 3 * u * t * t * p2z + t * t * t * p3z;
    const y = u * u * u * oy + 3 * u * u * t * p1y + 3 * u * t * t * p2y;
    P(z, y, 0.55 * (1 - t), col * 0.5 * (1 - t));
  }
  for (const z of BACK) if (z > p3z + 0.2) P(z, 0, 0, 0);
}

function rawMound(p) { // espuma depois que a onda fechou
  rn = 0;
  const mh = lerp(0.55, 0.26, clamp((p - 1.8) / 3, 0, 1));
  const spread = z => 0.6 * Math.exp(-(((z + 3) / 3.2) ** 2));
  for (const z of FRONT) if (z < -3.4) P(z, 0, 0, spread(z));
  for (let k = 0; k <= 24; k++) {
    const z = lerp(-3.2, 4, k / 24), y = mh * Math.exp(-(((z - 0.3) / (z < 0.3 ? 1.1 : 1.8)) ** 2));
    P(z, y, 0.3, 0.92 * (0.45 + 0.55 * clamp(y / mh * 1.6, 0, 1)) + spread(z) * 0.4);
  }
  for (const z of BACK) if (z > 4.2) P(z, 0, 0, 0);
}

const EW = new Float32Array(600);
function resample(oz, oy, ol, of) { // reamostra por comprimento, com a água lisa de longe "comprimida"
  let acc = 0; EW[0] = 0;
  for (let k = 1; k < rn; k++) {
    const a = (k - 1) * 4, b = k * 4;
    let len = Math.hypot(RAW[b] - RAW[a], RAW[b + 1] - RAW[a + 1]);
    if (Math.abs(RAW[a]) > 6 && Math.abs(RAW[b]) > 6) len *= 0.05;
    acc += len; EW[k] = acc;
  }
  let k = 1;
  for (let j = 0; j < NS; j++) {
    const tgt = acc * j / (NS - 1);
    while (k < rn - 1 && EW[k] < tgt) k++;
    const a = (k - 1) * 4, b = k * 4, seg = EW[k] - EW[k - 1];
    const t = seg > 1e-6 ? clamp((tgt - EW[k - 1]) / seg, 0, 1) : 0;
    oz[j] = lerp(RAW[a], RAW[b], t); oy[j] = lerp(RAW[a + 1], RAW[b + 1], t);
    ol[j] = lerp(RAW[a + 2], RAW[b + 2], t); of[j] = lerp(RAW[a + 3], RAW[b + 3], t);
  }
}

const BZ = new Float32Array(NS), BY = new Float32Array(NS), BL = new Float32Array(NS), BF = new Float32Array(NS);
const MZ = new Float32Array(NS), MY = new Float32Array(NS), ML = new Float32Array(NS), MF = new Float32Array(NS);
const W = {};
function buildWave(t) {
  const x0 = Math.floor((S.sx + XB) / DX) * DX, x1 = x0 + (NX - 1) * DX;
  for (let i = 0; i < NX; i++) {
    const x = x0 + i * DX, p = 1 - (x - S.xPeel) / D;
    waveParams(p, W);
    rawBroken(W); resample(BZ, BY, BL, BF);
    const m = W.ww;
    if (m > 0) { rawMound(p); resample(MZ, MY, ML, MF); }
    const e = smooth(x0, x0 + 30, x) * smooth(x1, x1 - 30, x) * S.amp;
    let arc = 0, pz = 0, py = 0;
    for (let j = 0; j < NS; j++) {
      let z = BZ[j], y = BY[j], l = BL[j], f = BF[j];
      if (m > 0) { z = lerp(z, MZ[j], m); y = lerp(y, MY[j], m); l = lerp(l, ML[j], m); f = lerp(f, MF[j], m); }
      const v = i * NS + j;
      wPos[v * 3] = x; wPos[v * 3 + 1] = y * H * e; wPos[v * 3 + 2] = z * H;
      if (f > 0.01) f = clamp(f * (0.5 + 0.8 * noise2(x * 0.32 + t * 0.5, j * 0.5 - t * 2)), 0, 1);
      const yy = clamp(y * 1.6 * e, 0, 1), ll = l * yy * 0.85;
      wCol[v * 3] = lerp(lerp(lerp(DEEP.r, MID.r, yy), LIGHT.r, ll), FOAM.r, f);
      wCol[v * 3 + 1] = lerp(lerp(lerp(DEEP.g, MID.g, yy), LIGHT.g, ll), FOAM.g, f);
      wCol[v * 3 + 2] = lerp(lerp(lerp(DEEP.b, MID.b, yy), LIGHT.b, ll), FOAM.b, f);
      if (j) arc += Math.hypot(z - pz, (y - py) * e); pz = z; py = y;
      wUv[v * 2] = x / 16; wUv[v * 2 + 1] = arc * H / 14;
    }
  }
  waveGeo.attributes.position.needsUpdate = true;
  waveGeo.attributes.color.needsUpdate = true;
  waveGeo.attributes.uv.needsUpdate = true;
  waveGeo.computeVertexNormals();
}

/* ---------- surfista ---------- */
const suitMat = new T.MeshStandardMaterial({ color: '#141d24', roughness: 0.55 });
const skinMat = new T.MeshStandardMaterial({ color: '#c68a5c', roughness: 0.6 });
const boardMat = new T.MeshStandardMaterial({ color: '#f3eee4', roughness: 0.3 });
const stripeMat = new T.MeshStandardMaterial({ color: '#ff7a2f', roughness: 0.4 });
function limb(parent, a, b, r, mat) {
  const d = new T.Vector3().subVectors(b, a), len = d.length();
  const m = new T.Mesh(new T.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 4, 8), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
  parent.add(m);
  return m;
}
const surfer = new T.Group(), boardG = new T.Group(), bodyG = new T.Group();
{
  const g = new T.CapsuleGeometry(0.27, 1.55, 6, 14); g.rotateZ(Math.PI / 2); g.scale(1, 0.2, 1);
  boardG.add(new T.Mesh(g, boardMat));
  const s = new T.Mesh(new T.BoxGeometry(1.7, 0.02, 0.07), stripeMat); s.position.y = 0.055; boardG.add(s);
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const hip = V(0, 0.78, 0.04), sh = V(0.06, 1.32, 0.12);
  limb(bodyG, V(0.4, 0.06, 0), V(0.32, 0.45, 0.16), 0.1, suitMat); limb(bodyG, V(0.32, 0.45, 0.16), hip, 0.11, suitMat);
  limb(bodyG, V(-0.42, 0.06, 0), V(-0.3, 0.44, 0.15), 0.1, suitMat); limb(bodyG, V(-0.3, 0.44, 0.15), hip, 0.11, suitMat);
  limb(bodyG, hip, sh, 0.17, suitMat);
  limb(bodyG, V(0.2, 1.28, 0.1), V(0.62, 1.05, 0.18), 0.065, suitMat);
  limb(bodyG, V(-0.1, 1.28, 0.1), V(-0.55, 1.12, 0.05), 0.065, suitMat);
  const head = new T.Mesh(new T.SphereGeometry(0.13, 16, 12), skinMat); head.position.set(0.09, 1.52, 0.17); bodyG.add(head);
  const hair = new T.Mesh(new T.SphereGeometry(0.135, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: '#3a2615', roughness: .8 }));
  hair.position.copy(head.position); hair.position.y += 0.02; bodyG.add(hair);
  surfer.add(boardG, bodyG);
}
scene.add(surfer);

/* ---------- spray e espuma (partículas) ---------- */
const PMAX = 3000, pPos = new Float32Array(PMAX * 3), pSize = new Float32Array(PMAX), pAlpha = new Float32Array(PMAX);
const pVel = new Float32Array(PMAX * 3), pLife = new Float32Array(PMAX), pMax = new Float32Array(PMAX), pGrav = new Float32Array(PMAX), pS0 = new Float32Array(PMAX);
let pNext = 0;
const pGeo = new T.BufferGeometry();
pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3).setUsage(T.DynamicDrawUsage));
pGeo.setAttribute('aSize', new T.BufferAttribute(pSize, 1).setUsage(T.DynamicDrawUsage));
pGeo.setAttribute('aAlpha', new T.BufferAttribute(pAlpha, 1).setUsage(T.DynamicDrawUsage));
const dotTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
})();
const pMat = new T.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { map: { value: dotTex }, uScale: { value: 400 }, tint: { value: new T.Color(0.95, 0.98, 1) } },
  vertexShader: 'attribute float aSize;attribute float aAlpha;uniform float uScale;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float dz=-mv.z;gl_PointSize=min(aSize*uScale/max(dz,.1),70.);gl_Position=projectionMatrix*mv;vA=aAlpha*smoothstep(1.,4.,dz);}',
  fragmentShader: 'uniform sampler2D map;uniform vec3 tint;varying float vA;void main(){float a=texture2D(map,gl_PointCoord).a*vA;if(a<.01)discard;gl_FragColor=vec4(tint,a);}',
});
const points = new T.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);
function emit(x, y, z, vx, vy, vz, size, life, grav) {
  const i = pNext; pNext = (pNext + 1) % PMAX;
  pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
  pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
  pS0[i] = size; pLife[i] = life; pMax[i] = life; pGrav[i] = grav;
}
function stepParticles(dt) {
  for (let i = 0; i < PMAX; i++) {
    if (pLife[i] <= 0) { pAlpha[i] = 0; continue; }
    pLife[i] -= dt;
    const k = i * 3;
    pVel[k + 1] -= pGrav[i] * dt;
    const drag = 1 - dt * 0.6;
    pVel[k] *= drag; pVel[k + 2] *= drag;
    pPos[k] += pVel[k] * dt; pPos[k + 1] += pVel[k + 1] * dt; pPos[k + 2] += pVel[k + 2] * dt;
    if (pPos[k + 1] < 0) { pPos[k + 1] = 0; pVel[k + 1] *= -0.1; }
    const a = pLife[i] / pMax[i];
    pAlpha[i] = Math.min(1, a * 2) * 0.85;
    pSize[i] = pS0[i] * (1.6 - 0.6 * a);
  }
  pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aSize.needsUpdate = true; pGeo.attributes.aAlpha.needsUpdate = true;
}

/* ---------- estado do jogo ---------- */
let S, best = 0, camMode = 0, shake = 0;
try { best = +localStorage.getItem('tubo3d.best') || 0; } catch (e) {}
function makeSections() { const s = []; let t = 7; while (t < 80) { const fast = Math.random() < 0.6; s.push({ t, dur: fast ? 2.8 : 2.4, mul: fast ? 1.24 : 0.82, fast, warned: false }); t += 6 + Math.random() * 4; } return s; }
function newWave(demo) {
  S = { demo, t: 0, sx: 0, xPeel: -24, h: 0.45, ht: 0.45, v: 9, vc: 9, amp: 0.3, alive: true, covered: false, curTube: 0, tubeTotal: 0, tubes: 0,
    score: 0, len: demo ? 1e9 : 55, sections: makeSections(), wipeT: 0, done: false, roar: 0, bx: 0, by: 0, bz: 0 };
  pLife.fill(0);
}
function sectionMul(t) { for (const s of S.sections) if (t >= s.t && t < s.t + s.dur) return 1 + (s.mul - 1) * Math.sin(Math.PI * (t - s.t) / s.dur); return 1; }

let msgT = 0;
function say(text, dur = 1.4) { const m = $('msg'); m.textContent = text; m.classList.add('show'); msgT = dur; }

function wipe(reason) {
  if (!S.alive) return;
  S.alive = false; S.reason = reason; S.wipeT = 0; shake = 0.6;
  for (let i = 0; i < 160; i++) emit(S.bx + rnd(-1, 1), S.by + rnd(0, 1.5), S.bz + rnd(-1, 1), rnd(-4, 4), rnd(2, 9), rnd(-5, 2), rnd(0.6, 1.8), rnd(0.7, 1.6), 9);
  if (!S.demo) { say('VACA!', 1.5); try { navigator.vibrate && navigator.vibrate([60, 40, 120]); } catch (e) {} }
}
function closeTube() {
  if (S.curTube > 0.6 && S.alive) { const b = Math.round(80 * Math.pow(S.curTube, 1.4)); S.score += b; S.tubes++; if (!S.demo) say('SAIU DO TUBO! +' + b); }
  S.curTube = 0;
}
function finish(kind) {
  if (S.done) return; S.done = true;
  const titles = { ok: 'Onda completa', vaca: 'Tomou uma vaca', lost: 'Perdeu a onda' };
  const reasons = { ok: 'Você chegou ao canal de pé. Saída limpa, +300.', lost: 'Você correu demais e saiu da parte que quebra.' };
  if (kind === 'ok') S.score += 300;
  const sc = Math.round(S.score), isNew = sc > best;
  if (isNew) { best = sc; try { localStorage.setItem('tubo3d.best', best); } catch (e) {} }
  $('eT').textContent = titles[kind]; $('eR').textContent = kind === 'vaca' ? S.reason : reasons[kind];
  $('eS').textContent = sc; $('eB').textContent = best; $('eB').className = isNew ? 'new' : '';
  $('eN').textContent = S.tubes; $('eTT').textContent = S.tubeTotal.toFixed(1) + 's';
  $('end').hidden = false; $('hud').hidden = true; $('guide').hidden = true;
}

const SW = {}, PW = {};
function surferPose() { // posição da prancha na parede (unidades de H) e direção "para cima" do corpo
  const p = 1 - (S.sx - S.xPeel) / D;
  waveParams(p, SW);
  const h = S.h, z = -SW.F * (1 - h) * (1 - h), y = h * SW.amp;
  let nz = -SW.amp, ny = 2 * SW.F * (1 - h); const nl = Math.hypot(nz, ny); nz /= nl; ny /= nl;
  let uz = lerp(0, nz, 0.4), uy = lerp(1, ny, 0.4); const ul = Math.hypot(uz, uy); uz /= ul; uy /= ul;
  const c = clamp(0.3 + (1 - h) * 0.6 + (S.covered ? 0.2 : 0), 0, 1);
  const hl = 0.38 * (1 - 0.3 * c);
  return { p, z, y, nz, ny, uz, uy, c, hz: z + uz * hl, hy: y + uy * hl };
}

function update(dt) {
  S.t += dt; S.amp = Math.min(1, S.amp + dt * 0.35);
  S.vc = 9 * (1 + 0.06 * Math.sin(S.t * 0.8)) * sectionMul(S.t);
  let d = S.sx - S.xPeel, p = 1 - d / D;
  const shoulder = p < 0 ? clamp(1 + p * 0.6, 0.5, 1) : 1;
  if (S.demo && S.alive) {
    const heq = clamp((S.vc / 9 / shoulder - 0.72) / 0.9, 0, 1);
    S.ht = clamp(heq - (d - 7) * 0.035, 0.05, 0.8);
  } else {
    if (keyUp) S.ht = clamp(S.ht + dt * 1.2, 0.02, 0.98);
    if (keyDn) S.ht = clamp(S.ht - dt * 1.2, 0.02, 0.98);
  }
  S.xPeel += S.vc * dt;
  if (S.alive) {
    S.h += (S.ht - S.h) * Math.min(1, dt * 4);
    S.v = 9 * (0.72 + 0.9 * S.h) * shoulder;
    S.sx += S.v * dt;
  } else { S.sx += 3 * dt; S.wipeT += dt; }
  d = S.sx - S.xPeel; p = 1 - d / D;

  if (!S.demo) for (const s of S.sections) if (!s.warned && S.t > s.t - 1.1) { s.warned = true; say(s.fast ? 'SEÇÃO RÁPIDA! SOBE!' : 'ONDA SEGURANDO. DESCE!'); }

  const ps = surferPose();
  if (S.alive) {
    const sb = -ps.z / SW.Lx, covered = SW.prog > 0.4 && sb >= 0 && sb <= SW.prog;
    if (covered) { S.curTube += dt; S.tubeTotal += dt; S.score += dt * 120 * (1 + 2.5 * clamp((p - 0.6) / 0.4, 0, 1)); }
    else if (S.covered) closeTube();
    S.covered = covered;
    const sh = -ps.hz / SW.Lx;
    if (SW.prog > 0 && sh >= 0 && sh <= SW.prog) { lipC(SW, sh); if (ps.hy > L.y - L.th / 2) wipe('O lábio caiu na sua cabeça. Você estava alto demais na parede dentro do tubo.'); }
    if (SW.col >= 0.95) wipe('Fundo demais: a onda fechou em cima de você.');
    if (d > 44 && !S.demo) { S.alive = false; finish('lost'); }
    if (!S.demo && S.t >= S.len && S.alive) { closeTube(); S.alive = false; finish('ok'); }
    S.bx = S.sx; S.by = ps.y * H * S.amp; S.bz = ps.z * H;
  } else if (S.wipeT > 1.8) {
    if (S.demo) newWave(true); else finish('vaca');
  }

  // spray: lábio batendo na base
  for (let k = 0; k < 7; k++) {
    const pp = rnd(0.88, 1.25), x = S.xPeel + (1 - pp) * D;
    waveParams(pp, PW); if (PW.prog < 0.97) continue;
    emit(x + rnd(-0.5, 0.5), rnd(0, 0.3), -PW.Lx * H + rnd(-0.6, 0.6), rnd(-1, 1.5), rnd(3, 8), rnd(-4, -0.5), rnd(0.7, 1.7), rnd(0.9, 1.6), 9);
  }
  // espuma revirando atrás
  for (let k = 0; k < 6; k++) {
    const x = S.xPeel - rnd(7.5, 90), pp = 1 - (x - S.xPeel) / D;
    const mh = lerp(0.55, 0.26, clamp((pp - 1.8) / 3, 0, 1)) * H;
    emit(x, rnd(0.2, 1) * mh, rnd(-1.2, 0.6) * H, rnd(-1, 1), rnd(0.5, 2.5), rnd(-2, 0), rnd(1.4, 3), rnd(1, 1.8), 2);
  }
  // borda do lábio soltando spray
  for (let k = 0; k < 3; k++) {
    const pp = rnd(0.55, 0.95), x = S.xPeel + (1 - pp) * D;
    waveParams(pp, PW); lipC(PW, PW.prog);
    emit(x, L.y * H, L.z * H, rnd(-0.5, 0.5), rnd(0, 1.5), rnd(-1.5, 0), rnd(0.3, 0.7), rnd(0.4, 0.8), 6);
  }
  // cuspida do tubo
  if (S.covered && p > 0.82) for (let k = 0; k < 5; k++)
    emit(S.sx - rnd(2, 5), rnd(0.8, 2.8), -rnd(0.3, 2.2), rnd(12, 22), rnd(-0.5, 1), rnd(-1.5, 0.5), rnd(0.6, 1.4), rnd(0.5, 0.8), 1);
  // spray da prancha
  if (S.alive) for (let k = 0; k < 2; k++)
    emit(S.bx - rnd(0.3, 0.9), S.by + 0.1, S.bz - 0.2, rnd(-4, -1), rnd(1.5, 4), rnd(-2, 0.5), rnd(0.14, 0.32), rnd(0.3, 0.5), 9);

  stepParticles(dt);
  S.roar = clamp(0.5 + clamp((p - 0.7) * 1.5, 0, 0.5) + (S.alive ? 0 : 0.5), 0, 1);
  if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').classList.remove('show'); }
  return ps;
}

/* ---------- câmera ---------- */
const CAMS = ['CANAL', 'TUBO', 'LATERAL'];
const camPos = new T.Vector3(14, 4, -16), camLook = new T.Vector3(), tmpP = new T.Vector3(), tmpL = new T.Vector3();
function updateCamera(dt, ps) {
  const sx = S.sx, by = S.by, bz = S.bz;
  if (camMode === 0) { tmpP.set(sx + 9.5, 2.7, -11.5); tmpL.set(sx - 3, 2.5, -1); }
  else if (camMode === 1) { tmpP.set(sx - 6, by + 1.4, bz - 1.4); tmpL.set(sx + 12, by + 1.1, -3.4); }
  else { tmpP.set(sx - 1, 2.6, -15); tmpL.set(sx + 2, 2.6, 0); }
  const k = 1 - Math.exp(-dt * (camMode === 1 ? 10 : 4));
  camPos.lerp(tmpP, k); camLook.lerp(tmpL, k);
  camera.position.copy(camPos);
  if (shake > 0.01) { camera.position.x += rnd(-shake, shake); camera.position.y += rnd(-shake, shake); shake *= Math.pow(0.05, dt); }
  camera.lookAt(camLook);
  sky.position.copy(camera.position);
  ocean.position.set(camera.position.x, 0, camera.position.z);
  oceanTex.offset.set(camera.position.x / 2400 * 90 % 1, -camera.position.z / 2400 * 90 % 1);
}

const Q = new T.Quaternion(), M4 = new T.Matrix4(), FWD = new T.Vector3(1, 0, 0), UPV = new T.Vector3(), SIDE = new T.Vector3();
function placeSurfer(ps) {
  if (S.alive || S.wipeT < 0.05) {
    surfer.position.set(S.bx, S.by + ps.ny * 0.07, S.bz + ps.nz * 0.07);
    UPV.set(0, ps.ny, ps.nz); SIDE.crossVectors(FWD, UPV);
    boardG.quaternion.setFromRotationMatrix(M4.makeBasis(FWD, UPV, SIDE));
    UPV.set(0, ps.uy, ps.uz); SIDE.crossVectors(FWD, UPV);
    bodyG.quaternion.setFromRotationMatrix(M4.makeBasis(FWD, UPV, SIDE));
    bodyG.scale.set(1, 1 - 0.3 * ps.c, 1);
    surfer.rotation.set(0, 0, 0);
  } else {
    surfer.position.x += 2 * (1 / 60); surfer.position.y = Math.max(-0.4, surfer.position.y - 0.04); surfer.position.z -= 0.03;
    surfer.rotation.x += 0.15; surfer.rotation.z += 0.1;
  }
}

/* ---------- áudio ---------- */
let ac = null, gn = null, muted = false;
function audioOn() {
  if (ac) return;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
    gn = ac.createGain(); gn.gain.value = 0; src.connect(f).connect(gn).connect(ac.destination); src.start();
  } catch (e) { ac = null; }
}

/* ---------- controles ---------- */
let drag = null, keyUp = false, keyDn = false;
canvas.addEventListener('pointerdown', e => { if (S.demo || !S.alive) return; drag = { y: e.clientY, h: S.ht }; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} });
canvas.addEventListener('pointermove', e => { if (drag) S.ht = clamp(drag.h - (e.clientY - drag.y) / (innerHeight * 0.38), 0.02, 0.98); });
['pointerup', 'pointercancel'].forEach(t => canvas.addEventListener(t, () => drag = null));
addEventListener('keydown', e => { if (e.key === 'ArrowUp') keyUp = true; if (e.key === 'ArrowDown') keyDn = true; });
addEventListener('keyup', e => { if (e.key === 'ArrowUp') keyUp = false; if (e.key === 'ArrowDown') keyDn = false; });
$('cam').onclick = () => { camMode = (camMode + 1) % CAMS.length; $('cam').textContent = 'CÂMERA: ' + CAMS[camMode]; };
$('som').onclick = () => { muted = !muted; $('som').textContent = muted ? 'SOM: OFF' : 'SOM: ON'; };
function start() {
  audioOn(); try { ac && ac.resume(); } catch (e) {}
  $('menu').hidden = true; $('end').hidden = true; $('hud').hidden = false; $('guide').hidden = false;
  newWave(false); say('REMA! A SÉRIE CHEGOU');
}
$('go').onclick = start; $('again').onclick = start;

/* ---------- laço ---------- */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 68 : 55; camera.updateProjectionMatrix();
  pMat.uniforms.uScale.value = h * renderer.getPixelRatio() / (2 * Math.tan(camera.fov * Math.PI / 360));
}
addEventListener('resize', resize); resize();

newWave(true);
for (let i = 0; i < 300; i++) update(1 / 60);
let last = performance.now(), acc = 0, lastPose = surferPose();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; acc += dt;
  let n = 0;
  while (acc >= 1 / 60 && n < 4) { lastPose = update(1 / 60); acc -= 1 / 60; n++; }
  buildWave(S.t);
  waterTex.offset.y -= dt * 0.18; // água subindo a parede
  placeSurfer(lastPose);
  updateCamera(dt, lastPose);
  renderer.render(scene, camera);
  if (!S.demo && !S.done) {
    $('sc').textContent = Math.round(S.score);
    const tt = $('tt'); tt.textContent = S.curTube.toFixed(1) + 's'; tt.classList.toggle('on', S.covered);
    $('dot').style.top = ((1 - S.h) * 100) + '%';
  }
  if (gn && ac) gn.gain.setTargetAtTime(muted ? 0 : 0.05 + S.roar * 0.3, ac.currentTime, 0.15);
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { last = performance.now(); });
requestAnimationFrame(frame);
})();
