
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let VARS={},CMDS={},D={},W=[],nid=1,V={x:10,y:10,s:1},sel=null,cnt=0,hu=0,AC,tt;
const view=$('#view'),world=$('#world'),svg=$('#wires'),sl=ms=>new Promise(r=>setTimeout(r,ms));
const q=(d,s)=>document.querySelector('#c'+d.id+' '+s),num=v=>typeof v=='string'&&v.trim()!==''&&!isNaN(v)?Number(v):v;
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',Math.max(2200,m.length*60))}
/* ---- linguagem ---- */
const H={Math,dados:n=>LIB[n]&&LIB[n].text,json:s=>JSON.parse(s),tocar:n=>tocar(n),Date,JSON,String,Number,Array,Object,parseInt,parseFloat,isNaN,parte:(s,i)=>String(s).split(' ')[i],abs:Math.abs,piso:Math.floor,teto:Math.ceil,max:Math.max,min:Math.min,aleatorio:(a,b)=>Math.floor(Math.random()*(b-a+1))+a,arredondar:Math.round,texto:String,numero:Number,tamanho:s=>Array.isArray(s)?s.length:String(s).length,lista:(...a)=>a,adicionar:(l,v)=>l.push(v),removerprimeiro:l=>l.shift(),removerultimo:l=>l.pop(),pegar:(l,i)=>l[i],contem:(l,v)=>l.includes(v),maiusculo:s=>String(s).toUpperCase(),minusculo:s=>String(s).toLowerCase(),raiz:Math.sqrt,agora:()=>Date.now()};
const mkEnv=v=>new Proxy(v,{has:()=>true,get:(t,k)=>typeof k=='symbol'?undefined:k in t?t[k]:Object.hasOwn(VARS,k)?VARS[k]:k in H?H[k]:0,set:(t,k,x)=>{if(Object.hasOwn(VARS,k)){VARS[k]=x;save()}else t[k]=x;return true}});
const cc={};
function tr(e){return e.split(/("(?:[^"\\]|\\.)*")/).map((p,i)=>i%2?p:p.replace(/\bverdadeiro\b/g,'true').replace(/\bfalso\b/g,'false').replace(/\be\b/g,'&&').replace(/\bou\b/g,'||').replace(/\bnao\b/g,'!').replace(/(?<![<>!=])=(?!=)/g,'==')).join('')}
function ev(e,env){const f=cc[e]||(cc[e]=new Function('E','with(E){return('+tr(e)+')}'));return f(env)}
function parse(src){const L=src.split('\n').map(s=>s.trim()).filter(s=>s&&s[0]!='#');let i=0;
 function blk(){const out=[];while(i<L.length){const l=L[i];if(/^(fim|senao)$/i.test(l))break;let m;
  if(m=l.match(/^se (.+) entao$/i)){i++;const a=blk();let b=[];if(/^senao$/i.test(L[i]||'')){i++;b=blk()}i++;out.push({t:'se',c:m[1],a,b})}
  else if(m=l.match(/^repetir (.+)$/i)){i++;const b=blk();i++;out.push({t:'rep',c:m[1],b})}
  else if(m=l.match(/^enquanto (.+)$/i)){i++;const b=blk();i++;out.push({t:'enq',c:m[1],b})}
  else if(m=l.match(/^para (\w+) de (.+) ate (.+)$/i)){i++;const b=blk();i++;out.push({t:'for',v:m[1],a:m[2],z:m[3],b})}
  else{out.push({t:'c',l});i++}}return out}
 const r=[];while(i<L.length){r.push(...blk());i++}return r}
function clog(d,t,err){d.cl=(d.cl||[]).concat((err?'⚠ ':'')+t).slice(-20);const o=q(d,'.log');if(o){o.textContent=d.cl.join('\n');o.scrollTop=1e5}}
const AF=(async()=>{}).constructor;
async function run(d,entrada){
 if(d.run){d.pend=entrada;return}
 d.run=1;d.stop=0;let steps=0;const env=d.env||(d.env=mkEnv({}));env.entrada=entrada;env.teclas=d.keys=d.keys||{};
 async function cmd(l){let m;
  if(m=l.match(/^([A-Za-z_]\w*)\s*(\+|-|\*|\/)?=(?!=)\s*(.+)$/)){env[m[1]]=ev(m[2]?m[1]+m[2]+'('+m[3]+')':m[3],env);return}
  const w=l.split(/\s+/)[0],a=l.slice(w.length).trim();
  if(CMDS[w.toLowerCase()]){await callC(w,a?ev('['+a+']',env):[]);return}
  switch(w.toLowerCase()){
   case'mostrar':case'enviar':emit(d,ev(a,env));break;
   case'log':clog(d,String(ev(a,env)));break;
   case'esperar':await sl(Number(ev(a,env)));break;
   case'pixel':{const[x,y,c]=ev('['+a+']',env);emit(d,{px:[x,y,c||'#fff']});break}
   case'limpar':emit(d,{clr:1});break;
   case'bip':T.som.recv(d,ev(a,env));break;
   case'retangulo':{const[x,y,w,h,c]=ev('['+a+']',env);emit(d,{rc:[x,y,w,h,c||'#fff']});break}
   case'vibrar':navigator.vibrate&&navigator.vibrate(+ev(a||'100',env));break;
   case'linha':{const[x,y,x2,y2,c]=ev('['+a+']',env);emit(d,{ln:[x,y,x2,y2,c||'#fff']});break}
   case'circulo':{const[x,y,r,c]=ev('['+a+']',env);emit(d,{ci:[x,y,r,c||'#fff']});break}
   case'fundo':emit(d,{clr:1,bg:ev(a,env)});break;
   case'imagem':{const[n,x,y,w,h]=ev('['+a+']',env);emit(d,{img:[n,x,y,w,h]});break}
   case'tocar':tocar(ev(a,env));break;
   case'texto':{const[t,x,y,c,z]=ev('['+a+']',env);emit(d,{tx:[String(t),x,y,c||'#fff',z||8]});break}
   case'parar':throw'parado';
   default:try{ev(l,env)}catch(e){throw e instanceof SyntaxError?'não entendi: '+l:e}}}
 async function ex(bl){for(const n of bl){
  if(d.stop)throw'parado';
  if(++steps>40000)throw'muitos passos (loop infinito?)';
  if(steps%100==0)await sl(0);
  if(n.t=='se')await ex(ev(n.c,env)?n.a:n.b);
  else if(n.t=='rep'){const k=Number(ev(n.c,env));for(let j=0;j<k;j++)await ex(n.b)}
  else if(n.t=='for'){const z=Number(ev(n.z,env));for(env[n.v]=Number(ev(n.a,env));env[n.v]<=z;env[n.v]++)await ex(n.b)}
  else if(n.t=='enq'){while(ev(n.c,env)){await ex(n.b);if(++steps>40000)throw'loop infinito'}}
  else await cmd(n.l)}}
 async function runJs(){const api={enviar:v=>emit(d,v),mostrar:v=>emit(d,v),log:v=>clog(d,String(v)),esperar:ms=>sl(ms),pixel:(x,y,c)=>emit(d,{px:[x,y,c||'#fff']}),retangulo:(x,y,w,h,c)=>emit(d,{rc:[x,y,w,h,c||'#fff']}),linha:(a,b,x,y,c)=>emit(d,{ln:[a,b,x,y,c||'#fff']}),circulo:(x,y,r,c)=>emit(d,{ci:[x,y,r,c||'#fff']}),fundo:c=>emit(d,{clr:1,bg:c}),limpar:()=>emit(d,{clr:1}),bip:f=>T.som.recv(d,f),vibrar:ms=>navigator.vibrate&&navigator.vibrate(ms||100),parar:()=>{throw'parado'},console:{log:v=>clog(d,String(v))}};Object.assign(env,api);await new AF('E','with(E){'+d.s.code+'\n}')(env)}
 async function runJsx(){if(!d.fn||d.fc!==d.s.code){d.fc=d.s.code;d.fn=new AF('E','with(E){'+d.s.code+'\n}')}
  d.S=d.S||{};const dr=DRAW(d),E={entrada,S:d.S,teclas:d.keys,tela:mkFb(d),enviar:v=>emit(d,v),log:v=>clog(d,String(v)),esperar:sl,bip:f=>T.som.recv(d,f),vibrar:ms=>navigator.vibrate&&navigator.vibrate(ms||100),agora:()=>performance.now(),aleatorio:H.aleatorio,rgb,lib:LIBAPI,variaveis:VARS,comando:(n,...a)=>callC(n,a)};DN.forEach((k,i)=>E[k]=dr[i]);await d.fn(E)}
 let depth=0;
 async function callC(name,args){const c=CMDS[String(name).toLowerCase()];if(!c)throw'comando desconhecido: '+name;if(depth>=80)throw'recursão demais';depth++;
  const sv=c.p.map(k=>env[k]);c.p.forEach((k,i)=>env[k]=args[i]===undefined?0:args[i]);
  try{await ex(parse(c.body))}finally{depth--;c.p.forEach((k,i)=>env[k]=sv[i])}}
 async function runPy(){
  if(!PYP)clog(d,'⏳ Carregando Python (só na 1ª vez, ~10 MB)...');
  const py=await pyLoad();let ns=d.pn;
  if(!ns){ns=d.pn=py.globals.get('dict')();const tj=v=>v&&v.toJs?v.toJs():v;
   Object.entries({enviar:v=>emit(d,tj(v)),mostrar:v=>emit(d,tj(v)),log:v=>clog(d,String(tj(v))),esperar:sl,bip:f=>T.som.recv(d,f),vibrar:ms=>navigator.vibrate&&navigator.vibrate(ms||100),agora:()=>performance.now(),aleatorio:H.aleatorio,rgb,tela:mkFb(d),dados:LIBAPI.dados,tocar,pixels:LIBAPI.pixels,pixel:(x,y,c)=>emit(d,{px:[x,y,c||'#fff']}),retangulo:(x,y,w,h,c)=>emit(d,{rc:[x,y,w,h,c||'#fff']}),linha:(a,b,x,y,c)=>emit(d,{ln:[a,b,x,y,c||'#fff']}),circulo:(x,y,r,c)=>emit(d,{ci:[x,y,r,c||'#fff']}),fundo:c=>emit(d,{clr:1,bg:c}),limpar:()=>emit(d,{clr:1}),imagem:(n,x,y,w,h)=>emit(d,{img:[n,x,y,w,h]}),variaveis:VARS,comando:(n,...a)=>callC(n,a.map(tj))}).forEach(([k,f])=>ns.set(k,f))}
  ns.set('entrada',entrada);ns.set('teclas',py.toPy({cima:0,baixo:0,esquerda:0,direita:0,A:0,B:0,...d.keys}));
  try{await py.runPythonAsync(d.s.code,{globals:ns})}catch(e){throw new Error(String(e.message).trim().split('\n').slice(-3).join(' | '))}}
 try{const lg=glang(d);if(lg!=(d.s.lang||'')){d.s.lang=lg;const e=q(d,'[data-k=lang]');if(e)e.value=lg;save()}if(lg=='py')await runPy();else if(lg=='jsx'||lg=='js')await runJsx();else await ex(parse(d.s.code))}catch(e){if(e!=='parado')clog(d,e.message||String(e),1)}
 d.run=0;if(d.pend!==undefined){const p=d.pend;d.pend=undefined;run(d,p)}}
/* ---- dispositivos ---- */
const pcw=(d,t)=>{d.lg=(d.lg||[]).concat(t).slice(-30);const o=q(d,'.term');o.textContent=d.lg.join('\n');o.scrollTop=1e5};
const CODE='# o valor recebido fica em "entrada"\nmostrar "Recebi: " + entrada';
const T={
valor:{i:'💬',n:'Valor',s:{v:'Oi'},ui:d=>`<input data-k=v value="${esc(d.s.v)}"><button data-a=send>Enviar</button>`,act:d=>emit(d,d.s.v)},
sw:{i:'🔘',n:'Interruptor',s:{on:0},ui:d=>`<button data-a=t>${d.s.on?'LIGADO (1)':'desligado (0)'}</button>`,act:(d,a,el)=>{d.s.on=d.s.on?0:1;el.textContent=d.s.on?'LIGADO (1)':'desligado (0)';emit(d,d.s.on)}},
ctl:{i:'🎮',n:'Controle',s:{},ui:()=>`<div class=pad><i></i><button data-a=cima>⬆</button><i></i><button data-a=esquerda>⬅</button><button data-a=A>A</button><button data-a=direita>➡</button><i></i><button data-a=baixo>⬇</button><button data-a=B>B</button></div>`,act:()=>0},
timer:{i:'⏱',n:'Timer',s:{ms:1000},ui:d=>`<input data-k=ms type=number value="${d.s.ms}"><button data-a=go>▶ Iniciar</button>`,act:(d,a,el)=>{if(d.h){clearInterval(d.h);d.h=0;el.textContent='▶ Iniciar'}else{d.n=0;d.h=setInterval(()=>emit(d,++d.n),Math.max(16,+d.s.ms||1000));el.textContent='⏸ Parar'}}},
hub:{i:'🔗',n:'Conjunto',s:{},sm:1,ui:()=>`<div class=term style="text-align:center;min-height:18px">·</div>`},
tela:{i:'🖥',n:'Tela',s:{},ui:()=>`<div class=term></div><canvas class=px width=16 height=16></canvas>`,recv(d,v){const o=q(d,'.term'),c=q(d,'canvas').getContext('2d');
 if(typeof v=='object'){if(v.clr)c.clearRect(0,0,16,16);else if(v.rc)try{c.fillStyle=v.rc[4];c.fillRect(v.rc[0],v.rc[1],v.rc[2],v.rc[3])}catch(e){}else try{c.fillStyle=v.px[2];c.fillRect(v.px[0]|0,v.px[1]|0,1,1)}catch(e){}}else o.textContent=v}},
pc:{i:'💻',n:'PC',s:{t:''},w:1,ui:d=>`<div class=term style="min-height:70px"></div><input data-k=t placeholder="digite e envie" value="${esc(d.s.t)}"><button data-a=send>Enviar ⏎</button>`,recv(d,v){if(typeof v!='object')pcw(d,String(v))},act(d){pcw(d,'> '+d.s.t);emit(d,d.s.t)}},
comand:{i:'📟',n:'Comand',s:{code:CODE},w:1,ui:d=>`<select data-k=lang style="font-size:16px;padding:6px;background:var(--in);color:var(--tx);border:1px solid var(--bd);border-radius:8px"><option value="">Linguagem: Comand (fácil)</option><option value="js"${d.s.lang=='js'?' selected':''}>Linguagem: JavaScript</option><option value="jsx"${d.s.lang=='jsx'?' selected':''}>Linguagem: JavaScript rápido (jogos grandes)</option><option value="py"${d.s.lang=='py'?' selected':''}>Linguagem: Python</option></select><textarea data-k=code rows=9 spellcheck=false autocapitalize=off autocorrect=off>${esc(d.s.code)}</textarea><div style="display:flex;gap:6px"><button data-a=run style="flex:1">▶ Rodar</button><button data-a=stop style="flex:1;background:#dc2626">⏹</button><button data-a=fix style="flex:1;background:#7c3aed">🤖 Consertar</button></div><div class="term log"></div>`,recv:(d,v)=>{if(typeof v=='string'){const m=/^(-?)(cima|baixo|esquerda|direita|A|B)$/.exec(v);if(m)(d.keys=d.keys||{})[m[2]]=m[1]?0:1}run(d,num(v))},act(d,a){if(a=='run'){const e=lint(d.s.code,glang(d));if(e.length)clog(d,e.join('\n'),1);run(d,'')}else if(a=='fix')fixCmd(d);else{d.stop=1;d.pend=undefined}}},
lamp:{i:'💡',n:'Lâmpada',s:{},ui:()=>`<div class=bulb></div>`,recv(d,v){if(typeof v=='object')return;const s=String(v).trim().toLowerCase(),b=q(d,'.bulb');
 if(['','0','off','desligar','falso','false','nao'].includes(s))b.style.cssText='';else{const c=isNaN(s)&&CSS.supports('color',s)?s:'#facc15';b.style.background=c;b.style.boxShadow='0 0 24px '+c}}},
som:{i:'🔊',n:'Som',s:{},ui:()=>`<div class=term style="text-align:center">número = Hz</div>`,recv(d,v){try{AC=AC||new AudioContext();AC.resume();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=+v>20?+v:440;g.gain.value=.15;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.2)}catch(e){}}},
calc:{i:'➕',n:'Matemática',s:{e:'x * 2'},ui:d=>`<input data-k=e value="${esc(d.s.e)}"><div style="color:var(--mu);font-size:12px">x = valor recebido</div>`,recv(d,v){if(typeof v=='object')return;try{emit(d,ev(d.s.e,mkEnv({x:num(v)})))}catch(e){toast('Matemática: '+e.message)}}},
filtro:{i:'🔀',n:'Filtro',s:{e:'x > 5'},ui:d=>`<input data-k=e value="${esc(d.s.e)}"><div style="color:var(--mu);font-size:12px">só passa se for verdade</div>`,recv(d,v){if(typeof v=='object')return;try{if(ev(d.s.e,mkEnv({x:num(v)})))emit(d,v)}catch(e){toast('Filtro: '+e.message)}}},
disp:{i:'🟦',n:'Display Pixel',s:{n:32},w:1,ui:d=>`<canvas class=px data-id=${d.id} width=${d.s.n} height=${d.s.n} style="width:210px;height:210px" onclick="tapd(event,this)"></canvas><button data-a=play>⛶ Jogar em tela cheia</button><select data-k=n onchange="const c=this.closest('.card').querySelector('canvas');c.width=c.height=+this.value" style="font-size:16px;padding:6px;background:var(--in);color:var(--tx);border:1px solid var(--bd);border-radius:8px">${[16,32,48,64].map(n=>`<option${n==d.s.n?' selected':''}>${n}</option>`).join('')}</select>`,act:(d,a)=>gopen(d.id),recv(d,v){if(typeof v!='object')return;const cv=d.cv||(d.cv=q(d,'canvas'));try{if(v.fb){const f=v.fb;if(cv.width!=f.w||cv.height!=f.h){cv.width=f.w;cv.height=f.h;cv.style.height='auto'}cv.getContext('2d').putImageData(new ImageData(f.d,f.w,f.h),0,0)}else drw(cv.getContext('2d'),cv.width,v)}catch(e){}}},
vari:{i:'📈',n:'Variável',s:{n:''},ui:d=>`<input data-k=n placeholder="nome da variável" value="${esc(d.s.n)}"><div class=term style="text-align:center;font-size:20px;min-height:30px">—</div><button data-a=ler>Enviar valor</button>`,act:d=>emit(d,VARS[d.s.n]===undefined?0:VARS[d.s.n]),recv(d,v){if(typeof v=='object'||!d.s.n)return;VARS[d.s.n]=pv(v);save()}},
mem:{i:'🧠',n:'Memória',s:{},ui:()=>`<div class=term style="text-align:center">vazia</div><div style="color:var(--mu);font-size:12px">guarda o valor; envie "ler" para soltar</div>`,recv(d,v){if(typeof v=='object')return;if(v==='ler')emit(d,d.m===undefined?0:d.m);else{d.m=v;q(d,'.term').textContent=String(v).slice(0,14)}}},
cont:{i:'🔢',n:'Contador',s:{},ui:()=>`<div class=term style="text-align:center">0</div><div style="color:var(--mu);font-size:12px">+1 a cada sinal; "zerar" volta a 0</div>`,recv(d,v){if(typeof v=='object')return;d.c=v==='zerar'?0:(d.c||0)+1;q(d,'.term').textContent=d.c;emit(d,d.c)}},
dado:{i:'🎲',n:'Dado',s:{n:6},ui:d=>`<input data-k=n type=number value="${d.s.n}"><button data-a=r>Rolar</button>`,act:d=>emit(d,H.aleatorio(1,+d.s.n||6)),recv(d,v){if(typeof v!='object')emit(d,H.aleatorio(1,+d.s.n||6))}},
slider:{i:'🎚',n:'Slider',s:{},ui:()=>`<input type=range min=0 max=100 value=50 oninput="this.nextElementSibling.textContent=this.value;emit(D[this.closest('.card').id.slice(1)],+this.value)"><div class=term style="text-align:center;min-height:16px">50</div>`},
piano:{i:'🎹',n:'Piano',s:{},ui:()=>`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">`+[['C',262],['D',294],['E',330],['F',349],['G',392],['A',440],['B',494]].map(([n,f])=>`<button data-a=${f} style="padding:0">${n}</button>`).join('')+`</div>`,act:(d,a)=>emit(d,+a)},
placar:{i:'📊',n:'Placar',s:{},ui:()=>`<div class=term style="font-size:32px;text-align:center;min-height:44px">—</div>`,recv(d,v){if(typeof v!='object')q(d,'.term').textContent=v}},
barra:{i:'📶',n:'Barra',s:{},ui:()=>`<div style="height:18px;background:var(--in);border:1px solid var(--bd);border-radius:9px;overflow:hidden"><div class=bar style="height:100%;width:0;background:#22c55e;transition:.2s"></div></div><div style="color:var(--mu);font-size:12px">0 a 100</div>`,recv(d,v){if(typeof v!='object')q(d,'.bar').style.width=Math.min(100,Math.max(0,+v||0))+'%'}},
texto:{i:'🔤',n:'Texto',s:{p:'Valor: ',f:'!'},ui:d=>`<input data-k=p value="${esc(d.s.p)}"><input data-k=f value="${esc(d.s.f)}"><div style="color:var(--mu);font-size:12px">prefixo e sufixo</div>`,recv(d,v){if(typeof v!='object')emit(d,d.s.p+v+d.s.f)}},
vibra:{i:'📳',n:'Vibrar',s:{},ui:()=>`<div class=term style="text-align:center">vibra ao receber</div>`,recv(){navigator.vibrate&&navigator.vibrate(150)}},
atraso:{i:'⏳',n:'Atraso',s:{ms:1000},ui:d=>`<input data-k=ms type=number value="${d.s.ms}"><div style="color:var(--mu);font-size:12px">milissegundos</div>`,recv(d,v){setTimeout(()=>emit(d,v),+d.s.ms||1000)}},
nota:{i:'📝',n:'Nota',s:{t:''},w:1,ui:d=>`<textarea data-k=t rows=4 placeholder="anotações...">${esc(d.s.t)}</textarea>`},
inverte:{i:'🔁',n:'Inverter',s:{},ui:()=>`<div class=mu>0 vira 1, ligado vira desligado</div>`,recv(d,v){if(typeof v=='object')return;emit(d,['','0','off','false','falso','nao'].includes(String(v).trim().toLowerCase())?1:0)}},
porta:{i:'🚪',n:'Porta',s:{open:1},ui:d=>`<button data-a=t>${d.s.open?'ABERTA':'fechada'}</button><div class=mu>aberta deixa passar. "abrir", "fechar" e "alternar" controlam</div>`,act:(d,a,el)=>{d.s.open=d.s.open?0:1;el.textContent=d.s.open?'ABERTA':'fechada';save()},recv(d,v){if(typeof v=='object')return;const b=q(d,'[data-a=t]');if(v==='abrir'||v==='fechar'||v==='alternar'){d.s.open=v==='alternar'?(d.s.open?0:1):(v==='abrir'?1:0);b.textContent=d.s.open?'ABERTA':'fechada';save()}else if(d.s.open)emit(d,v)}},
mapa:{i:'🗺',n:'Mapear',s:{a:0,b:100,c:0,d:255},ui:d=>`<div class=mu>de (mín, máx) para (mín, máx)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><input data-k=a type=number value="${d.s.a}"><input data-k=b type=number value="${d.s.b}"><input data-k=c type=number value="${d.s.c}"><input data-k=d type=number value="${d.s.d}"></div>`,recv(d,v){const x=+v,{a,b,c,d:e}=Object.fromEntries(Object.entries(d.s).map(([k,y])=>[k,+y]));if(typeof v=='object'||isNaN(x)||a==b)return;emit(d,Math.round((c+(x-a)*(e-c)/(b-a))*100)/100)}},
aleat:{i:'🎰',n:'Aleatório',s:{a:1,b:100},ui:d=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><input data-k=a type=number value="${d.s.a}"><input data-k=b type=number value="${d.s.b}"></div><button data-a=r>Sortear</button>`,act:d=>emit(d,H.aleatorio(+d.s.a||0,+d.s.b||0)),recv(d,v){if(typeof v!='object')emit(d,H.aleatorio(+d.s.a||0,+d.s.b||0))}},
relogio:{i:'🕐',n:'Relógio',s:{ms:1000},ui:d=>`<div class=term style="text-align:center;font-size:20px">--:--:--</div><input data-k=ms type=number value="${d.s.ms}"><button data-a=go>▶ Iniciar</button>`,act:(d,a,el)=>{if(d.h){clearInterval(d.h);d.h=0;el.textContent='▶ Iniciar'}else{const f=()=>{const t=new Date().toLocaleTimeString('pt-BR');q(d,'.term').textContent=t;emit(d,t)};f();d.h=setInterval(f,Math.max(100,+d.s.ms||1000));el.textContent='⏸ Parar'}},recv(d,v){if(typeof v!='object')emit(d,new Date().toLocaleTimeString('pt-BR'))}},
cor:{i:'🎨',n:'Cor',s:{c:'#ff0000'},ui:d=>`<input data-k=c type=color value="${d.s.c}" style="height:44px;padding:2px" oninput="emit(D[this.closest('.card').id.slice(1)],this.value)"><div class=mu>envia o código da cor (ligue na Lâmpada)</div>`},
grafico:{i:'📉',n:'Gráfico',s:{},w:1,ui:()=>`<canvas class=px width=240 height=100 style="width:100%;height:100px;image-rendering:auto"></canvas><div class=mu>desenha os números recebidos ("zerar" limpa)</div>`,recv(d,v){if(v==='zerar')d.g=[];else{v=+v;if(typeof v=='object'||isNaN(v))return;d.g=(d.g||[]).concat(v).slice(-60)}const g=d.g,c=q(d,'canvas'),x=c.getContext('2d'),w=c.width,h=c.height,lo=Math.min(...g),hi=Math.max(...g),r=hi-lo||1;x.clearRect(0,0,w,h);if(!g.length)return;x.strokeStyle='#22c55e';x.lineWidth=2;x.beginPath();g.forEach((y,i)=>{const px=i*(w/59),py=h-4-(y-lo)/r*(h-8);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.fillStyle='#94a3b8';x.font='10px monospace';x.fillText(hi,2,10);x.fillText(lo,2,h-2)}},
fila:{i:'📋',n:'Fila',s:{},ui:()=>`<div class=term style="min-height:60px">vazia</div><div class=mu>guarda tudo que chega. "ler" solta o primeiro, "limpar" esvazia</div>`,recv(d,v){if(typeof v=='object')return;const L=d.f=d.f||[];if(v==='ler'){if(L.length)emit(d,L.shift())}else if(v==='limpar')d.f=[];else L.push(v);q(d,'.term').textContent=d.f.length?d.f.map((x,i)=>(i+1)+'. '+x).join('\n'):'vazia'}},
seq:{i:'🎼',n:'Sequência',s:{l:'1,2,3',ms:300},ui:d=>`<input data-k=l value="${esc(d.s.l)}"><input data-k=ms type=number value="${d.s.ms}"><div class=mu>valores separados por vírgula, enviados um a um (ms entre eles)</div>`,recv(d,v){if(typeof v=='object')return;const L=String(d.s.l).split(',').map(x=>num(x.trim())),k=d.sq=(d.sq||0)+1;(async()=>{for(const x of L){if(d.sq!=k||D[d.id]!==d)return;emit(d,x);await sl(+d.s.ms||300)}})()}},
pisca:{i:'💫',n:'Pisca',s:{ms:500},ui:d=>`<input data-k=ms type=number value="${d.s.ms}"><button data-a=go>▶ Iniciar</button><div class=mu>envia 1, 0, 1, 0...</div>`,act:(d,a,el)=>{if(d.h){clearInterval(d.h);d.h=0;el.textContent='▶ Iniciar'}else{d.n=0;d.h=setInterval(()=>emit(d,(d.n=1-(d.n||0))),Math.max(50,+d.s.ms||500));el.textContent='⏸ Parar'}}},
semaforo:{i:'🚦',n:'Semáforo',s:{},ui:()=>`<div class=sem><i></i><i></i><i></i></div><div class=mu>"vermelho", "amarelo", "verde" ou 1, 2, 3</div>`,recv(d,v){if(typeof v=='object')return;const t=String(v).toLowerCase(),k=/verm|^1$/.test(t)?0:/amar|^2$/.test(t)?1:/verd|^3$/.test(t)?2:-1,C=['#ef4444','#facc15','#22c55e'];q(d,'.sem').querySelectorAll('i').forEach((e,i)=>{e.style.background=i==k?C[i]:'';e.style.boxShadow=i==k?'0 0 16px '+C[i]:''})}},
stats:{i:'📐',n:'Estatística',s:{},ui:()=>`<div class=term style="text-align:center">sem dados</div><div class=mu>envia a média; "zerar" recomeça</div>`,recv(d,v){if(typeof v=='object')return;if(v==='zerar'){d.st=0;q(d,'.term').textContent='sem dados';return}v=+v;if(isNaN(v))return;const t=d.st=d.st||{n:0,sm:0,lo:v,hi:v};t.n++;t.sm+=v;t.lo=Math.min(t.lo,v);t.hi=Math.max(t.hi,v);const m=Math.round(t.sm/t.n*100)/100;q(d,'.term').textContent='média '+m+'\nmín '+t.lo+' · máx '+t.hi+'\nqtd '+t.n;emit(d,m)}},
txtfx:{i:'🔠',n:'Transformar texto',s:{m:'MAIÚSCULAS'},ui:d=>SEL('m',['MAIÚSCULAS','minúsculas','Título','invertido','sem espaços','tamanho'],d.s.m),recv(d,v){if(typeof v=='object')return;const t=String(v),m=d.s.m;emit(d,m=='MAIÚSCULAS'?t.toUpperCase():m=='minúsculas'?t.toLowerCase():m=='Título'?t.toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase()):m=='invertido'?[...t].reverse().join(''):m=='sem espaços'?t.trim():t.length)}},
falar:{i:'🗣',n:'Falar',s:{},ui:()=>`<div class=term style="text-align:center">lê em voz alta</div>`,recv(d,v){if(typeof v=='object')return;try{const u=new SpeechSynthesisUtterance(String(v));u.lang='pt-BR';speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}},
http:{i:'🌐',n:'Internet (GET)',s:{u:'https://api.github.com/zen'},w:1,ui:d=>`<input data-k=u value="${esc(d.s.u)}"><div class=term style="min-height:40px"></div><button data-a=f>Buscar</button><div class=mu>use {x} na URL para colocar o valor recebido. Envia a resposta</div>`,act:d=>T.http.recv(d,''),recv(d,v){if(typeof v=='object')return;fetch(String(d.s.u).replace('{x}',encodeURIComponent(v))).then(r=>r.text()).then(t=>{q(d,'.term').textContent=t.slice(0,200);emit(d,pv(t.slice(0,4000)))}).catch(e=>toast('Internet: '+e.message))}},
inclina:{i:'📱',n:'Inclinação',s:{e:'esq/dir'},ui:d=>`${SEL('e',['esq/dir','frente/trás'],d.s.e)}<div class=term style="text-align:center">0</div><button data-a=t>Ativar sensor</button>`,act:(d,a,el)=>{const go=()=>{const f=e=>{if(D[d.id]!==d||!d.on){removeEventListener('deviceorientation',f);return}const n=Date.now();if(n-(d.lt||0)<100)return;d.lt=n;const v=Math.round(d.s.e=='frente/trás'?e.beta:e.gamma)||0;q(d,'.term').textContent=v;emit(d,v)};d.on=1;addEventListener('deviceorientation',f);el.textContent='Ativo (toque p/ parar)'};if(d.on){d.on=0;el.textContent='Ativar sensor';return}typeof DeviceOrientationEvent!='undefined'&&DeviceOrientationEvent.requestPermission?DeviceOrientationEvent.requestPermission().then(r=>r=='granted'?go():toast('Permissão negada')):go()}},
copiar:{i:'📎',n:'Copiar',s:{},ui:()=>`<div class=term style="text-align:center">copia para a área de transferência</div>`,recv(d,v){if(typeof v=='object')return;navigator.clipboard.writeText(String(v)).then(()=>toast('Copiado'),()=>toast('Não consegui copiar'))}}};
const SEL=(k,o,c)=>`<select data-k=${k} style="font-size:16px;padding:6px;background:var(--in);color:var(--tx);border:1px solid var(--bd);border-radius:8px">${o.map(x=>`<option${x==c?' selected':''}>${x}</option>`).join('')}</select>`;
function mk(d){const t=T[d.type],e=document.createElement('div');e.className='card'+(t.w?' wide':'')+(t.sm?' sm':'');e.id='c'+d.id;e.style.left=d.x+'px';e.style.top=d.y+'px';
 e.innerHTML=`<div class=hd><span>${t.i} ${t.n} <small style="color:var(--mu)">#${d.id}</small></span><i class=port data-p=${d.id}></i><b class=x data-c=${d.id}>⧉</b><b class=x data-x=${d.id}>✕</b></div><div class=bd>${t.ui(d)}</div>`;world.append(e)}
function add(type,x,y,s){const d={id:nid++,type,x,y,s:{...T[type].s,...s}};if(type=='comand'&&!d.s.lang){const g=glang(d);if(g)d.s.lang=g}D[d.id]=d;mk(d);return d}
function addT(k){snap();$('#sheet').classList.remove('open');const j=Math.random()*30;add(k,(view.clientWidth/2-V.x)/V.s-85+j,(view.clientHeight/2-V.y)/V.s-60+j);wires();save()}
/* ---- rede ---- */
function flash(i){const p=svg.querySelector(`[data-k="${i}"]`);if(p){p.classList.add('on');setTimeout(()=>p.classList.remove('on'),300)}}
function emit(src,v){const seen=new Set([src.id]),qq=[src.id];
 while(qq.length){const a=qq.shift();
  W.forEach((w,i)=>{if(!w.includes(a))return;const b=w[0]==a?w[1]:w[0];if(seen.has(b))return;seen.add(b);flash(i);const t=D[b];if(!t)return;
   if(t.type=='hub'){const o=q(t,'.term');if(o&&typeof v!='object')o.textContent=String(v).slice(0,14);qq.push(b)}else deliver(t,v)})}}
function deliver(d,v){if(Date.now()<hu)return;if(++cnt>4000){halt();return}setTimeout(()=>{const r=T[d.type].recv;r&&r(d,v)},0)}
setInterval(()=>cnt=0,1000);
function halt(m){hu=Date.now()+1500;cnt=0;Object.values(D).forEach(d=>{clearInterval(d.h);d.h=0;d.stop=1;d.pend=undefined});document.querySelectorAll('[data-a=go]').forEach(b=>b.textContent='▶ Iniciar');toast(m?'⏹ Tudo parado':'⚠ Loop detectado — tudo parado')}
function port(id){
 if(sel===null){sel=id;mark();toast('Toque na porta ● de outro aparelho');return}
 if(sel!==id){snap();const i=W.findIndex(w=>w.includes(sel)&&w.includes(id));if(i<0){W.push([sel,id]);toast('Fio conectado')}else{W.splice(i,1);toast('Fio removido')}}
 sel=null;mark();wires();save()}
const mark=()=>document.querySelectorAll('.port').forEach(p=>p.classList.toggle('sel',+p.dataset.p===sel));
function del(id){const _o=D[id];if(_o&&T[_o.type].price&&!ECO.f)gain(Math.floor(T[_o.type].price/2));snap();const d=D[id];clearInterval(d.h);d.stop=1;delete D[id];W=W.filter(w=>!w.includes(id));$('#c'+id).remove();if(sel===id)sel=null;wires();save()}
function wires(){const wr=world.getBoundingClientRect();
 const pt=id=>{const r=document.querySelector('#c'+id+' .port').getBoundingClientRect();return[(r.left+r.width/2-wr.left)/V.s,(r.top+r.height/2-wr.top)/V.s]};
 svg.innerHTML=W.map((w,i)=>{const a=pt(w[0]),b=pt(w[1]),dx=Math.max(50,Math.abs(b[0]-a[0])/2),p=`M${a[0]} ${a[1]}C${a[0]+dx} ${a[1]} ${b[0]-dx} ${b[1]} ${b[0]} ${b[1]}`;return`<path class=v data-k=${i} d="${p}"/><path class=h data-i=${i} d="${p}"/>`}).join('')}
svg.addEventListener('click',e=>{const i=e.target.dataset.i;if(i!==undefined){snap();W.splice(+i,1);wires();save();toast('Fio removido')}});
/* ---- interação ---- */
world.addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;D[e.target.closest('.card').id.slice(1)].s[k]=e.target.value;save()});
world.addEventListener('click',e=>{const t=e.target;if(t.dataset.p)return port(+t.dataset.p);if(t.dataset.c){snap();const o=D[t.dataset.c];if(T[o.type].price&&!pay(T[o.type].price))return;add(o.type,o.x+20,o.y+20,JSON.parse(JSON.stringify(o.s)));wires();save();return}
 if(t.dataset.x)return del(+t.dataset.x);
 const a=t.dataset.a;if(a){const d=D[t.closest('.card').id.slice(1)];T[d.type].act(d,a,t)}});
let drag=null;
view.addEventListener('pointerdown',e=>{$('#sheet').classList.remove('open');const t=e.target;if(t.dataset.p||t.dataset.x||t.classList.contains('h'))return;
 const hd=t.closest('.hd');
 if(hd){const d=D[hd.parentNode.id.slice(1)];drag={d,sx:e.clientX,sy:e.clientY,ox:d.x,oy:d.y}}
 else if(!t.closest('.card'))drag={pan:1,sx:e.clientX,sy:e.clientY,ox:V.x,oy:V.y}});
view.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
 if(!drag.mv&&Math.hypot(dx,dy)<5)return;if(!drag.mv){drag.mv=1;try{view.setPointerCapture(e.pointerId)}catch(x){}}
 if(drag.pan){V.x=drag.ox+dx;V.y=drag.oy+dy;apply()}else{const d=drag.d;d.x=drag.ox+dx/V.s;d.y=drag.oy+dy/V.s;const c=$('#c'+d.id);c.style.left=d.x+'px';c.style.top=d.y+'px';wires()}});
const up=()=>{if(drag){if(drag.pan&&!drag.mv&&sel!==null){sel=null;mark()}if(drag.d&&drag.mv){const d=drag.d,c=$('#c'+d.id);d.x=Math.round(d.x/12)*12;d.y=Math.round(d.y/12)*12;c.style.left=d.x+'px';c.style.top=d.y+'px';wires()}drag=null;save()}};
view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
function apply(){world.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.s})`;view.style.backgroundPosition=V.x+'px '+V.y+'px';view.style.backgroundSize=24*V.s+'px '+24*V.s+'px'}
function zm(f){const cx=view.clientWidth/2,cy=view.clientHeight/2,s=Math.min(2,Math.max(.4,V.s*f)),k=s/V.s;V.x=cx-(cx-V.x)*k;V.y=cy-(cy-V.y)*k;V.s=s;apply();wires();save()}
function save(){clearTimeout(save.t);save.t=setTimeout(()=>{try{localStorage.setItem('fab1',JSON.stringify({D:Object.values(D).map(d=>({id:d.id,type:d.type,x:d.x,y:d.y,s:d.s})),W,nid,V,VARS,CMDS}))}catch(e){}},300)}
/* ---- menu / exemplos ---- */
const CAT={'Entrada':['valor','sw','ctl','slider','piano','cor','dado','aleat','inclina','timer','relogio','pisca'],'Lógica':['filtro','inverte','porta','calc','mapa','txtfx','texto','atraso','seq','hub'],'Dados':['vari','mem','cont','fila','stats'],'Saída':['tela','disp','lamp','semaforo','som','falar','vibra','placar','barra','grafico','copiar'],'Economia':['mina','fabrica','montadora','venda','cpu1','cpu2','cpu3','cpu4','rig','bolsa'],'Programa':['comand','pc','http','nota','console']};
let SQ='';
function shl(){const q2=SQ.trim().toLowerCase(),used=new Set(Object.values(CAT).flat()),C={...CAT,'Outros':Object.keys(T).filter(k=>!used.has(k))};let h='';for(const c in C){const L=C[c].filter(k=>T[k]&&(T[k].n.toLowerCase().includes(q2)||k.includes(q2)));if(L.length)h+=`<div class=ch>${c}</div>`+L.map(k=>`<button class=it onclick="addT('${k}')"><b>${T[k].i}</b>${T[k].n}${T[k].price?` <small>$${T[k].price}</small>`:''}</button>`).join('')}$('#shl').innerHTML=h||'<div class=mu style="grid-column:1/-1">Nenhum bloco encontrado</div>'}
const sh=()=>{const s=$('#sheet');if(s.classList.contains('open')){s.classList.remove('open');return}s.innerHTML=`<input id=sq placeholder="🔍 Buscar bloco (${Object.keys(T).length} tipos)" value="${esc(SQ)}" oninput="SQ=this.value;shl()"><div id=shl style="display:contents"></div>`;shl();s.classList.add('open')};
const modal=h=>{$('#mb').innerHTML=h;$('#modal').classList.add('open')},cm=()=>$('#modal').classList.remove('open');
$('#modal').onclick=e=>{if(e.target.id=='modal')cm()};
function menu(){modal(`<button class=it onclick="ex1()">📨 Exemplo: Olá mundo</button><button class=it onclick="ex2()">🕹 Exemplo: mini jogo</button><button class=it onclick="ex3()">🏀 Exemplo: bolinha quicando</button><button class=it onclick="ex4()">🎲 Exemplo: contador e dado</button><button class=it onclick="ex5()">🟡 Exemplo: jogo pixel (pegar moedas)</button><button class=it onclick="ex6()">🐍 Exemplo: jogo da cobrinha</button><button class=it onclick="ex7()">🔫 Exemplo: 3D estilo Doom (raycaster)</button><button class=it onclick="ex8()">🧪 Exemplo: Python (bolinha)</button><button class=it onclick="ex9()">🧩 Exemplo: variáveis e comando próprio</button><button class=it onclick="ex10()">📉 Exemplo: sorteio com gráfico</button><button class=it onclick="ex11()">🖼 Exemplo: foto/vídeo (importe a sua)</button><button class=it onclick="ex12()">🏭 Exemplo: fábrica de dinheiro</button><button class=it onclick="ex13()">₿ Exemplo: mineração de Bitcoin</button><button class=it onclick="ecoMenu()">💰 Economia e processadores</button><button class=it onclick="packUI()">🎁 Starter Pack (R$ 1)</button><button class=it onclick="cloudUI()">☁ Salvar na conta Google</button><button class=it onclick="fit()">🎯 Centralizar tudo</button><button class=it onclick="redo();cm()">↪ Refazer</button><button class=it onclick="theme()">🌓 Tema claro/escuro</button><button class=it onclick="consoleUI()">🧰 Comandos / colar de outra IA</button><button class=it onclick="varUI()">🧮 Variáveis</button><button class=it onclick="cmdUI()">🧩 Meus comandos</button><button class=it onclick="libUI()">📦 Biblioteca (importar arquivos)</button><button class=it onclick="exp()">📤 Exportar projeto</button><button class=it onclick="imp()">📥 Importar projeto</button><button class=it onclick="help()">❓ Ajuda e linguagem</button><button class=it onclick="clr()">🗑 Limpar tudo</button>`)}
const HELP=`COMO USAR
• Botão ＋ adiciona aparelhos.
• Arraste pelo título para mover; arraste o fundo para andar; − + dão zoom.
• Fio: toque na ● de um aparelho e depois na ● de outro. Repita para remover (ou toque no fio).
• Conjunto 🔗: tudo ligado a ele recebe o que qualquer aparelho enviar. Aparelhos ligados direto só falam com o vizinho.
• ⏹ para tudo (timers e scripts).

LINGUAGEM DO COMAND
x = 5          x += 1
mostrar "Oi " + x   (envia p/ Tela, PC...)
log x          (escreve no console do Comand)
esperar 500    (ms)
se x > 3 e x < 9 entao
  ...
senao
  ...
fim
repetir 5
  ...
fim
enquanto x < 10
  ...
fim
pixel x, y, "red"   (desenha na Tela 16x16)
retangulo x, y, larg, alt, "cor"
linha x1, y1, x2, y2, "cor"
circulo x, y, raio, "cor"
fundo "cor"   (pinta o fundo todo)
(Display Pixel: 16 a 64 pixels; tocar nele envia "toque X Y")
para i de 1 ate 5
  ...
fim
bip 440        (toca um som)
vibrar 200
limpar         (limpa a Tela)
parar
# comentário

"entrada" = valor que chegou. Variáveis guardam o valor entre execuções; as nunca usadas valem 0.
Listas: l = lista() · adicionar(l, 5) · removerprimeiro(l) · l[0] · tamanho(l)
Funções: aleatorio(1,6) parte(texto,n) abs() piso() teto() max() min() arredondar() texto() numero() tamanho() maiusculo() minusculo() raiz() agora()
Operadores: + - * / % = != < > <= >= e ou nao`;
const help=()=>modal('<pre>'+esc(HELP)+'</pre><button class=it onclick="cm()">Fechar</button>');
function reset(u){if(!u)snap();Object.values(D).forEach(d=>{clearInterval(d.h);d.stop=1});D={};W=[];world.querySelectorAll('.card').forEach(e=>e.remove());sel=null;V={x:10,y:10,s:1};apply()}
function ex1(){reset();const a=add('valor',20,20,{v:'Oi'}),h=add('hub',210,30),p=add('pc',20,170),t=add('tela',270,170),l=add('lamp',270,400);
 W.push([a.id,h.id],[h.id,p.id],[h.id,t.id],[h.id,l.id]);wires();save();cm();toast('Toque em Enviar no Valor')}
function ex2(){reset();const c=add('ctl',20,20),h=add('hub',215,20),m=add('comand',215,110,{code:['se iniciado = 0 entao','  iniciado = 1','  px = 8','  py = 8','fim','se entrada = "direita" entao','  px = px + 1','fim','se entrada = "esquerda" entao','  px = px - 1','fim','se entrada = "cima" entao','  py = py - 1','fim','se entrada = "baixo" entao','  py = py + 1','fim','limpar','pixel px, py, "lime"'].join('\n')}),t=add('tela',20,260);
 W.push([c.id,h.id],[h.id,m.id],[h.id,t.id]);wires();save();cm();toast('Use o controle 🎮')}
function ex3(){reset();const t=add('timer',20,20,{ms:200}),m=add('comand',20,130,{code:['se iniciado = 0 entao','  iniciado = 1','  px = 2','  py = 3','  dx = 1','  dy = 1','fim','px += dx','py += dy','se px > 14 ou px < 1 entao','  dx = 0 - dx','fim','se py > 14 ou py < 1 entao','  dy = 0 - dy','fim','limpar','retangulo px, py, 2, 2, "cyan"'].join('\n')}),s=add('tela',20,430);
 W.push([t.id,m.id],[m.id,s.id]);wires();save();cm();toast('Toque em Iniciar no Timer')}
function ex4(){reset();const t=add('timer',20,20,{ms:1000}),c=add('cont',20,140),p=add('placar',200,140),v=add('valor',20,300,{v:'rolar'}),d=add('dado',20,400),p2=add('placar',200,400);
 W.push([t.id,c.id],[c.id,p.id],[v.id,d.id],[d.id,p2.id]);wires();save();cm();toast('Inicie o Timer e toque em Enviar')}


/* ---- pixels, jogo e IA ---- */
function kp(n,dn,el){const L=el?[D[el.closest('.card').id.slice(1)]]:Object.values(D).filter(x=>x.type=='ctl');L.forEach(c=>c&&emit(c,dn?n:'-'+n))}
const pbn=e=>{const b=e.target.closest&&e.target.closest('.pad button');return b&&b.dataset.a};
world.addEventListener('pointerdown',e=>{const n=pbn(e);if(n)kp(n,1,e.target)});
['pointerup','pointercancel','pointerout'].forEach(t=>world.addEventListener(t,e=>{const n=pbn(e);if(n)kp(n,0,e.target)}));
const KM={ArrowUp:'cima',w:'cima',ArrowDown:'baixo',s:'baixo',ArrowLeft:'esquerda',a:'esquerda',ArrowRight:'direita',d:'direita',' ':'A',Enter:'B'};
['keydown','keyup'].forEach(t=>addEventListener(t,e=>{const n=KM[e.key];if(!n||e.repeat||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;e.preventDefault();kp(n,t=='keydown')}));
const rgb=(r,g,b)=>((255<<24)|((b&255)<<16)|((g&255)<<8)|(r&255))>>>0,CC={},cx2=document.createElement('canvas').getContext('2d');
function cl(c){if(typeof c=='number')return c;if(Array.isArray(c))return rgb(c[0],c[1],c[2]);if(CC[c]!==undefined)return CC[c];cx2.fillStyle='#000';cx2.fillStyle=c;const h=cx2.fillStyle;return CC[c]=h[0]=='#'?rgb(parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)):0xFF000000}
function mkFb(d){return(w,h)=>{w|=0;h|=0;let f=d.fb;if(!f||f.w!=w||f.h!=h){const bf=new ArrayBuffer(w*h*4),u8=new Uint8ClampedArray(bf),u=new Uint32Array(bf);f=d.fb={w,h,
 limpar:c=>u.fill(cl(c)),
 px:(x,y,c)=>{x|=0;y|=0;if(x>=0&&y>=0&&x<w&&y<h)u[y*w+x]=cl(c)},
 vlinha:(x,y0,y1,c)=>{x|=0;if(x<0||x>=w)return;y0=Math.max(0,y0|0);y1=Math.min(h-1,y1|0);c=cl(c);for(let y=y0;y<=y1;y++)u[y*w+x]=c},
 ret:(x,y,a,b2,c)=>{c=cl(c);const x1=Math.min(w,(x+a)|0),y1=Math.min(h,(y+b2)|0);for(let j=Math.max(0,y|0);j<y1;j++)for(let i=Math.max(0,x|0);i<x1;i++)u[j*w+i]=c},
 sprite:(n,x,y,a,b2)=>{const p=LIBAPI.pixels(n);if(!p)return;a=(a|0)||p.w;b2=(b2|0)||p.h;for(let j=0;j<b2;j++){const yy=(y|0)+j;if(yy<0||yy>=h)continue;const sr=((j*p.h/b2)|0)*p.w;for(let i=0;i<a;i++){const xx=(x|0)+i;if(xx<0||xx>=w)continue;const c2=p.d[sr+((i*p.w/a)|0)];if(c2>>>24>127)u[yy*w+xx]=c2}}},
 texto:(t,x,y,c,sz)=>{t=String(t);sz=sz>=4?sz:8*(sz||1);const g=TC.canvas;TC.font=sz+'px monospace';const tw=Math.ceil(TC.measureText(t).width)+1,th=sz+2;g.width=tw;g.height=th;TC.font=sz+'px monospace';TC.textBaseline='top';TC.fillStyle='#fff';TC.fillText(t,0,0);const im=TC.getImageData(0,0,tw,th).data;c=cl(c||'#fff');for(let j=0;j<th;j++)for(let i=0;i<tw;i++){const X=(x|0)+i,Y=(y|0)+j;if(im[(j*tw+i)*4+3]>110&&X>=0&&Y>=0&&X<w&&Y<h)u[Y*w+X]=c}},
 mostrar:()=>emit(d,{fb:{w,h,d:u8.slice()}})}}return f}}
const gb=(n,l,s)=>`<button style="${s}" onpointerdown="kp('${n}',1)" onpointerup="kp('${n}',0)" onpointerleave="kp('${n}',0)" onpointercancel="kp('${n}',0)">${l}</button>`;
$('#gpad').innerHTML=`<div class=g>${gb('cima','⬆','grid-area:1/2')}${gb('esquerda','⬅','grid-area:2/1')}${gb('direita','➡','grid-area:2/3')}${gb('baixo','⬇','grid-area:3/2')}</div><div class=g style="grid-template-columns:repeat(2,58px)">${gb('A','A','grid-area:1/2')}${gb('B','B','grid-area:2/1')}</div>`;
const LIB={},PYB='https://cdn.jsdelivr.net/npm/pyodide@0.26.4/';let PYP=null,IDBp=null;
const idb=()=>IDBp||(IDBp=new Promise((ok,no)=>{try{const r=indexedDB.open('fabrica',1);r.onupgradeneeded=()=>r.result.createObjectStore('lib',{keyPath:'name'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}}));
const lput=async it=>{const db=await idb();return new Promise((ok,no)=>{const t=db.transaction('lib','readwrite');t.objectStore('lib').put(it);t.oncomplete=ok;t.onerror=()=>no(t.error)})};
const ldel=async n=>{const db=await idb();return new Promise(ok=>{const t=db.transaction('lib','readwrite');t.objectStore('lib').delete(n);t.oncomplete=ok})};
const lall=async()=>{const db=await idb();return new Promise(ok=>{const r=db.transaction('lib').objectStore('lib').getAll();r.onsuccess=()=>ok(r.result);r.onerror=()=>ok([])})};
function reg(it){LIB[it.name]=it;if(it.kind=='img'){it.obj=new Image();it.obj.src=it.data}if(it.kind=='video'){const v=it.obj=document.createElement('video');v.src=it.data;v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto'}if(it.kind=='text')it.text=it.data}
function tocar(n){const o=LIB[n];if(!o||o.kind!='audio'){toast('Som não encontrado: '+n);return}try{new Audio(o.data).play()}catch(e){}}
const LIBAPI={dados:n=>LIB[n]&&LIB[n].text,tocar:n=>tocar(n),lista:k=>Object.values(LIB).filter(o=>!k||o.kind==k).map(o=>o.name),video:(n,a)=>{const o=LIB[n];if(!o||o.kind!='video')return;const v=o.obj;if(a=='pause')v.pause();else if(a=='alternar'){v.paused?v.play().catch(()=>0):v.pause()}else v.play().catch(()=>0)},imagem:n=>LIB[n]&&LIB[n].obj,pixels:n=>{const o=LIB[n];if(o&&o.kind=='video')return vpix(o);if(!o||!o.obj||!o.obj.complete)return null;if(!o.px){const c=document.createElement('canvas');c.width=o.obj.naturalWidth;c.height=o.obj.naturalHeight;const x=c.getContext('2d');x.drawImage(o.obj,0,0);o.px={w:c.width,h:c.height,d:new Uint32Array(x.getImageData(0,0,c.width,c.height).data.buffer.slice(0))}}return o.px}};
function pyLoad(){return PYP||(PYP=new Promise((ok,no)=>{const s=document.createElement('script');s.src=PYB+'pyodide.js';s.onload=()=>loadPyodide({indexURL:PYB}).then(ok,no);s.onerror=()=>no(new Error('Não consegui baixar o Python (precisa de internet; no link do Claude é bloqueado, abra o arquivo no navegador)'));document.head.append(s)}).catch(e=>{PYP=null;throw e}))}
lall().then(a=>a.forEach(reg)).catch(()=>{});
$('#lf').onchange=async e=>{for(const f of e.target.files){const mx=f.type.startsWith('video/')?3e7:6e6;if(f.size>mx){toast(f.name+' é grande demais (máx '+mx/1e6+' MB)');continue}
 const ext=(f.name.split('.').pop()||'').toLowerCase(),name=f.name.replace(/\.[^.]+$/,''),kind=f.type.startsWith('image/')?'img':f.type.startsWith('audio/')?'audio':f.type.startsWith('video/')?'video':'text';
 const data=await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);kind=='text'?r.readAsText(f):r.readAsDataURL(f)});
 const it={name,kind,ext,data,size:f.size};try{await lput(it)}catch(x){toast('Não consegui salvar (armazenamento bloqueado?)')}reg(it)}
 e.target.value='';libUI();toast('Importado!')};
async function libUI(){const a=Object.values(LIB),ic={img:'🖼',audio:'🔊',video:'🎬',text:'📄'};
 const rows=a.map(it=>{const n=esc(it.name),B=(l,t)=>`<button class=it style="padding:6px 8px" data-n="${n}" onclick="libAct(this.dataset.n,'${l}')">${t}</button>`;
  return `<div style="display:flex;gap:6px;align-items:center;border:1px solid var(--bd);border-radius:10px;padding:6px">${it.kind=='img'?`<img src="${it.data}" style="width:36px;height:36px;object-fit:contain;image-rendering:pixelated">`:ic[it.kind]}<span style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${n}<br><small style="color:var(--mu)">${it.kind}${it.ext?' .'+it.ext:''} · ${Math.ceil(it.size/1024)} KB</small></span>${it.kind=='audio'||it.kind=='video'?B('play','▶'):''}${it.kind=='text'&&['js','py','txt','cmd'].includes(it.ext)?B('cmd','📟'):''}${it.kind=='text'&&it.ext=='json'?(/"(aparelhos|devices)"/.test(it.text)?B('build','🏗'):B('proj','📂')):''}${B('del','🗑')}</div>`}).join('');
 modal('<div style="font-weight:700">📦 Biblioteca</div><div style="color:var(--mu);font-size:12px">Importe imagens, sons, textos/JSON, código (.js .py) ou projetos (.json). Fica salvo neste aparelho e vale para todos os projetos. Use pelo nome, sem extensão: imagem "nome", x, y, larg, alt · tocar "nome" · dados("nome")</div><label class=it for=lf style="flex-direction:row;padding:10px">📥 Importar arquivos</label>'+(rows||'<div style="color:var(--mu)">Biblioteca vazia</div>')+'<button class=it onclick="cm()">Fechar</button>')}
async function libAct(n,a){const o=LIB[n];if(!o)return;
 if(a=='del'){await ldel(n).catch(()=>0);delete LIB[n];libUI();return}
 if(a=='play'){o.kind=='video'?LIBAPI.video(n,'alternar'):tocar(n);return}
 if(a=='proj'){impJ(o.text);return}
 if(a=='cmd'){add('comand',-V.x/V.s+10,-V.y/V.s+10,{code:o.text,lang:{py:'py',js:'jsx'}[o.ext]||''});wires();save();cm();toast('Comand criado');return}
 if(a=='build'){try{build(o.text);cm()}catch(e){toast('Erro: '+e.message)}}}
const RES=new Set(['mostrar','enviar','log','esperar','pixel','limpar','parar','retangulo','linha','circulo','fundo','bip','vibrar','imagem','tocar','texto','se','senao','fim','repetir','enquanto','para','entao']);
const pv=v=>{if(typeof v!='string')return v;const t=v.trim();if(t!==''&&!isNaN(t))return Number(t);if(/^[\[{]/.test(t)){try{return JSON.parse(t)}catch(e){}}return v};
function setVar(k,v){VARS[k]=pv(v);save()}
function defCmd(n,p,b){n=String(n||'').toLowerCase().replace(/[^a-z0-9_]/g,'');if(!n||RES.has(n)||/^\d/.test(n))throw new Error('Nome de comando inválido');CMDS[n]={p:(typeof p=='string'?p.split(','):p).map(s=>String(s).trim()).filter(Boolean),body:String(b||'')};save()}
setInterval(()=>Object.values(D).forEach(d=>{if(d.type=='vari'){const o=q(d,'.term');if(o){const v=VARS[d.s.n],t=v===undefined?'—':typeof v=='object'?JSON.stringify(v):String(v);if(o.textContent!==t)o.textContent=t}}}),300);
function varUI(){const rows=Object.keys(VARS).map(k=>`<div style="display:flex;gap:6px;align-items:center"><b style="min-width:70px;overflow:hidden;text-overflow:ellipsis">${esc(k)}</b><input data-n="${esc(k)}" value="${esc(typeof VARS[k]=='object'?JSON.stringify(VARS[k]):VARS[k])}" onchange="setVar(this.dataset.n,this.value)" style="flex:1"><button class=it style="padding:6px 8px" data-n="${esc(k)}" onclick="delVar(this.dataset.n)">🗑</button></div>`).join('');
 modal(`<div style="font-weight:700">🧮 Variáveis (valem para todos os Comands)</div><div style="color:var(--mu);font-size:12px">Use pelo nome no código. Comand fácil: direto (pontos += 1). JavaScript rápido e Python: variaveis.pontos. Aparelho 📈 Variável mostra o valor ao vivo.</div>${rows||'<div style="color:var(--mu)">Nenhuma ainda</div>'}<div style="display:flex;gap:6px"><input id="vn" placeholder="nome (ex: pontos)" style="flex:1"><input id="vv" placeholder="valor" value="0" style="width:90px"><button class=it style="padding:6px 12px" onclick="newVar()">+</button></div><button class=it onclick="cm()">Fechar</button>`)}
function newVar(){const n=$('#vn').value.trim();if(!/^[A-Za-z_]\w*$/.test(n)){toast('Nome inválido: use letras, números e _');return}setVar(n,$('#vv').value);varUI()}
function delVar(k){delete VARS[k];save();varUI()}
function cmdUI(){const rows=Object.keys(CMDS).map(k=>`<div style="display:flex;gap:6px;align-items:center;border:1px solid var(--bd);border-radius:10px;padding:6px"><span style="flex:1;overflow:hidden;text-overflow:ellipsis"><b>${esc(k)}</b> ${esc(CMDS[k].p.join(', '))}</span><button class=it style="padding:6px 8px" data-n="${esc(k)}" onclick="editCmd(this.dataset.n)">✏️</button><button class=it style="padding:6px 8px" data-n="${esc(k)}" onclick="delCmd(this.dataset.n)">🗑</button></div>`).join('');
 modal(`<div style="font-weight:700">🧩 Meus comandos</div><div style="color:var(--mu);font-size:12px">Crie um comando novo e use em qualquer Comand: <b>nome 1, 2</b> no Comand fácil, ou await comando("nome",1,2) no Python e no JavaScript rápido. Os parâmetros são locais; o resto é compartilhado com o Comand que chamou.</div>${rows||'<div style="color:var(--mu)">Nenhum ainda</div>'}<button class=it onclick="editCmd('')">+ Novo comando</button><button class=it onclick="cm()">Fechar</button>`)}
function editCmd(k){const c=CMDS[k]||{p:[],body:''};modal(`<div style="font-weight:700">${k?'Editar':'Novo'} comando</div><input id="cn" placeholder="nome (ex: quadrado)" value="${esc(k)}"><input id="cp" placeholder="parâmetros separados por vírgula (ex: x, y, cor)" value="${esc(c.p.join(', '))}"><textarea id="cb2" rows="9" spellcheck="false" autocapitalize="off">${esc(c.body)}</textarea><div style="color:var(--mu);font-size:12px">Escreva no Comand fácil. Para devolver um valor, grave em <b>resultado</b>.</div><button class=it data-o="${esc(k)}" onclick="saveCmd(this.dataset.o)">💾 Salvar</button><button class=it onclick="cmdUI()">Voltar</button>`)}
function saveCmd(old){try{const n=$('#cn').value.toLowerCase().replace(/[^a-z0-9_]/g,'');if(old&&old!=n)delete CMDS[old];defCmd(n,$('#cp').value,$('#cb2').value);cmdUI();toast('Comando salvo')}catch(e){toast(e.message)}}
function delCmd(k){delete CMDS[k];save();cmdUI()}
let GP=null;
function gopen(id){const cv=D[id].cv||(D[id].cv=q(D[id],'canvas'));GP={cv,p:cv.parentNode,n:cv.nextSibling};$('#gcv').append(cv);$('#game').classList.add('open')}
function gclose(){if(GP){GP.p.insertBefore(GP.cv,GP.n);GP=null}$('#game').classList.remove('open');wires()}
function drw(c,n,v){if(v.clr){if(v.bg){c.fillStyle=v.bg;c.fillRect(0,0,n,n)}else c.clearRect(0,0,n,n)}else if(v.rc){c.fillStyle=v.rc[4];c.fillRect(v.rc[0],v.rc[1],v.rc[2],v.rc[3])}else if(v.px){c.fillStyle=v.px[2];c.fillRect(v.px[0]|0,v.px[1]|0,1,1)}else if(v.ln){const[a,b,x,y,col]=v.ln,s=Math.max(Math.abs(x-a),Math.abs(y-b),1);c.fillStyle=col;for(let i=0;i<=s;i++)c.fillRect(Math.round(a+(x-a)*i/s),Math.round(b+(y-b)*i/s),1,1)}else if(v.img){const o=LIB[v.img[0]];if(o&&o.obj&&o.obj.complete){c.imageSmoothingEnabled=false;c.drawImage(o.obj,v.img[1]|0,v.img[2]|0,v.img[3]||o.obj.width,v.img[4]||o.obj.height)}}else if(v.tx){const[t,x,y,col,sz]=v.tx;c.fillStyle=col;c.font=(sz>=4?sz:8*(sz||1))+'px monospace';c.textBaseline='top';c.fillText(t,x,y)}else if(v.ci){const[a,b,r,col]=v.ci;c.fillStyle=col;for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)if(i*i+j*j<=r*r)c.fillRect(a+i,b+j,1,1)}}
function tapd(e,c){const r=c.getBoundingClientRect(),d=D[c.dataset.id];emit(d,'toque '+Math.floor((e.clientX-r.left)/r.width*c.width)+' '+Math.floor((e.clientY-r.top)/r.height*c.height))}
function ex9(){reset();setVar('pontos',0);defCmd('quadrado','x,y,cor','retangulo x * 4, y * 4, 4, 4, cor');const c=add('ctl',20,20),h=add('hub',215,20),m=add('comand',215,110,{code:['se iniciado = 0 entao','  iniciado = 1','  px = 3','  py = 3','  ox = 6','  oy = 1','fim','se entrada = "direita" entao','  px += 1','fim','se entrada = "esquerda" entao','  px -= 1','fim','se entrada = "cima" entao','  py -= 1','fim','se entrada = "baixo" entao','  py += 1','fim','px = max(0, min(7, px))','py = max(0, min(7, py))','se px = ox e py = oy entao','  pontos += 1','  ox = aleatorio(0, 7)','  oy = aleatorio(0, 7)','  bip 660','fim','fundo "#111"','quadrado ox, oy, "gold"','quadrado px, py, "lime"'].join('\n')}),d=add('disp',20,200,{n:32}),v=add('vari',20,520,{n:'pontos'});
 W.push([c.id,h.id],[m.id,h.id],[d.id,h.id],[v.id,h.id]);wires();save();cm();toast('Use o controle. Veja o menu Variaveis e Meus comandos')}
function ex8(){reset();const c=add('ctl',20,20),h=add('hub',215,20),t=add('timer',215,100,{ms:200}),m=add('comand',215,230,{lang:'py',code:`if 'x' not in globals():
    x = 2
    dx = 1
x += dx
if x > 14 or x < 1:
    dx = -dx
fundo("#102")
retangulo(x * 2, 14, 3, 3, "cyan")
if teclas["A"]:
    log("A apertado em x=" + str(x))`}),d=add('disp',20,200,{n:32});
 W.push([c.id,h.id],[t.id,h.id],[m.id,h.id],[d.id,h.id]);wires();save();cm();toast('Inicie o Timer. Na 1ª vez baixa o Python (~10 MB)')}
function ex7(){reset();const c=add('ctl',20,20),h=add('hub',215,20),t=add('timer',215,100,{ms:33}),m=add('comand',215,230,{lang:'jsx',code:`const W=160,H=100,fb=tela(W,H),t=teclas;
if(!S.ok){S.ok=1;S.x=3.5;S.y=3.5;S.a=0;S.m=['1111111111','1000000001','1011001101','1000000001','1000110001','1000010001','1011000101','1000000001','1000010001','1111111111']}
if(t.esquerda)S.a-=0.08;
if(t.direita)S.a+=0.08;
const v=(t.cima?1:0)-(t.baixo?1:0);
if(v){const nx=S.x+Math.cos(S.a)*v*0.12,ny=S.y+Math.sin(S.a)*v*0.12;
 if(S.m[ny|0][S.x|0]=='0')S.y=ny;
 if(S.m[S.y|0][nx|0]=='0')S.x=nx}
fb.limpar(rgb(25,25,40));
fb.ret(0,H/2,W,H/2,rgb(60,45,35));
for(let c=0;c<W;c++){
 const ra=S.a+(c/W-0.5)*1.05,dx=Math.cos(ra),dy=Math.sin(ra);
 let d=0,hit=0;
 while(d<16){d+=0.04;if(S.m[(S.y+dy*d)|0][(S.x+dx*d)|0]=='1'){hit=1;break}}
 if(hit){const h2=Math.min(H,H/(d*Math.cos(ra-S.a))),sh=Math.max(0.15,1-d/10);
  fb.vlinha(c,(H-h2)/2,(H+h2)/2,rgb(210*sh,60*sh,40*sh))}}
fb.mostrar();`}),d=add('disp',20,200,{n:32});
 W.push([c.id,h.id],[t.id,h.id],[m.id,h.id],[d.id,h.id]);wires();save();cm();toast('Inicie o Timer e toque em Jogar em tela cheia')}
function ex6(){reset();const c=add('ctl',20,20),h=add('hub',215,20),t=add('timer',215,100,{ms:250}),m=add('comand',215,230,{code:['se iniciado = 0 entao','  iniciado = 1','  corpo = lista()','  adicionar(corpo, 8)','  adicionar(corpo, 8)','  dx = 1','  dy = 0','  mx = aleatorio(0, 15)','  my = aleatorio(0, 15)','  pontos = 0','  vivo = 1','fim','se entrada = "cima" e dy = 0 entao','  dx = 0','  dy = -1','fim','se entrada = "baixo" e dy = 0 entao','  dx = 0','  dy = 1','fim','se entrada = "esquerda" e dx = 0 entao','  dx = -1','  dy = 0','fim','se entrada = "direita" e dx = 0 entao','  dx = 1','  dy = 0','fim','se entrada = "A" entao','  iniciado = 0','fim','se entrada > 0 e vivo = 1 entao','  n = tamanho(corpo)','  hx = corpo[n - 2] + dx','  hy = corpo[n - 1] + dy','  se hx < 0 ou hx > 15 ou hy < 0 ou hy > 15 entao','    vivo = 0','  fim','  para i de 0 ate n - 1','    se i % 2 = 0 e corpo[i] = hx e corpo[i + 1] = hy entao','      vivo = 0','    fim','  fim','  se vivo = 1 entao','    adicionar(corpo, hx)','    adicionar(corpo, hy)','    se hx = mx e hy = my entao','      pontos += 1','      mx = aleatorio(0, 15)','      my = aleatorio(0, 15)','      bip 660','    senao','      removerprimeiro(corpo)','      removerprimeiro(corpo)','    fim','  fim','fim','se vivo = 1 entao','  fundo "#111"','  retangulo mx * 2, my * 2, 2, 2, "red"','  para i de 0 ate tamanho(corpo) - 1','    se i % 2 = 0 entao','      retangulo corpo[i] * 2, corpo[i + 1] * 2, 2, 2, "lime"','    fim','  fim','senao','  fundo "#400"','  log "Fim! Pontos: " + pontos + " (aperte A)"','fim'].join('\n')}),d=add('disp',20,200,{n:32});
 W.push([c.id,h.id],[t.id,h.id],[m.id,h.id],[d.id,h.id]);wires();save();cm();toast('Inicie o Timer e use as setas do controle')}
function ex5(){reset();const c=add('ctl',20,20),h=add('hub',215,20),m=add('comand',215,110,{code:['se iniciado = 0 entao','  iniciado = 1','  px = 15','  py = 15','  ox = aleatorio(1, 28)','  oy = aleatorio(1, 28)','  pontos = 0','fim','se entrada = "direita" entao','  px += 2','fim','se entrada = "esquerda" entao','  px -= 2','fim','se entrada = "cima" entao','  py -= 2','fim','se entrada = "baixo" entao','  py += 2','fim','px = max(0, min(29, px))','py = max(0, min(29, py))','se abs(px - ox) < 3 e abs(py - oy) < 3 entao','  pontos += 1','  ox = aleatorio(1, 28)','  oy = aleatorio(1, 28)','  bip 660','fim','fundo "#111"','retangulo ox, oy, 3, 3, "gold"','retangulo px, py, 3, 3, "lime"','mostrar pontos'].join('\n')}),t=add('disp',20,200,{n:32}),p=add('placar',20,520);
 W.push([c.id,h.id],[h.id,m.id],[h.id,t.id],[h.id,p.id]);wires();save();cm();toast('Aperte uma seta do controle')}
const SYS=`Você é a assistente da "Fábrica de Tudo", um sandbox industrial no celular onde o usuário liga aparelhos com fios. Responda sempre em português, curto e prático.
REGRAS: fios não têm direção. Um Conjunto (hub) repassa o valor de quem envia para todos os outros ligados a ele. Aparelhos ligados direto só falam com o vizinho. Nunca crie loops (um aparelho que emite não pode estar ligado de volta a quem o alimenta).
APARELHOS (tipo: configurações): valor{v}, sw, ctl (envia cima/baixo/esquerda/direita/A/B), timer{ms}, hub, tela (16x16), disp{n:16|32|48|64} (Display Pixel; tocar nele envia "toque X Y"), pc{t}, comand{code}, lamp (liga com 1 ou nome de cor), som (número=Hz), calc{e: expressão com x}, filtro{e: condição com x}, atraso{ms}, mem (guarda; "ler" solta), cont (+1; "zerar"), dado{n}, slider, piano, placar, barra, texto{p,f}, vibra.
LINGUAGEM DO COMAND (uma instrução por linha, sem ponto e vírgula, se/repetir/para/enquanto sempre terminam com fim, não existe se em uma linha só): x = 5 | x += 1 | mostrar expr (envia aos ligados) | log expr | esperar ms | se cond entao ... senao ... fim | repetir n ... fim | para i de 1 ate 5 ... fim | enquanto cond ... fim | pixel x, y, "cor" | retangulo x, y, larg, alt, "cor" | linha x1, y1, x2, y2, "cor" | circulo x, y, r, "cor" | fundo "cor" | limpar | bip hz | vibrar ms | parar | # comentário. Operadores: + - * / % = != < > <= >= e ou nao (= compara). "entrada" = valor recebido; variáveis persistem entre execuções e valem 0 se nunca usadas. Funções: aleatorio(a,b) parte(texto,n) abs piso teto max min arredondar texto numero tamanho maiusculo minusculo raiz agora. Não existem listas nem funções definidas pelo usuário.
LISTAS: corpo = lista() | adicionar(corpo, 5) | removerprimeiro(corpo) | removerultimo(corpo) | corpo[0] | tamanho(corpo) | pegar(corpo, i) | contem(corpo, 5). Não há objetos nem matrizes: para pares x,y guarde x e y alternados na mesma lista.
ERROS COMUNS (evite): todo "se" termina com "entao" na mesma linha e com "fim"; "senao" fica sozinho em uma linha; não use then, end, chaves, ponto e vírgula, ==, &&, ||, def, function, var, let, if, else, while. Texto sempre entre aspas duplas. Cada linha é uma instrução simples.
JOGOS 2D (receita): 1) UM Conjunto no centro e ligados nele: Controle, Timer, Comand e Display Pixel. 2) O Timer faz o jogo andar (entrada é um número maior que 0 a cada tique); o Controle manda "cima", "baixo", "esquerda", "direita", "A", "B" (entrada é texto). 3) No Comand: inicialize em "se iniciado = 0 entao ... fim"; trate cada direção mudando variáveis; atualize a lógica só quando entrada > 0; no fim redesenhe tudo (fundo "cor", depois retangulo/pixel). Display 32 = grade de 16x16 células de 2 pixels: retangulo x * 2, y * 2, 2, 2, "cor". 4) Responda com DOIS blocos: ~~~comand (o código) e ~~~fabrica (só aparelhos e fios; no comand deixe "s":{} que o app junta o código sozinho). Fora dos blocos escreva no máximo 2 frases.
JAVASCRIPT RÁPIDO (jogos grandes, 3D, raycasting, estilo Doom): Comand com Linguagem JavaScript rápido. O código é o corpo de uma função que roda uma vez por evento (um quadro por tique do Timer; use Timer de 33 ms). Recebe: entrada, S (objeto de estado que persiste, ex: S.x), teclas (teclas.cima/baixo/esquerda/direita/A/B valem 1 enquanto o botão está pressionado), tela(w,h) que devolve o framebuffer fb com fb.limpar(cor), fb.px(x,y,cor), fb.vlinha(x,y0,y1,cor), fb.ret(x,y,larg,alt,cor) e fb.mostrar() (envia o quadro ao Display), rgb(r,g,b), enviar(v), log(v), esperar(ms), bip(hz), agora(), aleatorio(a,b). Use const/let normalmente; o que precisa durar entre quadros fica em S. Bloco de código com a tag jsx. O Display no mesmo Conjunto mostra o quadro e o jogador toca em Jogar em tela cheia.
PYTHON: Comand com Linguagem Python (Python 3 de verdade). As variáveis globais persistem entre execuções (inicialize com: if 'x' not in globals():). Disponíveis sem import: entrada, teclas["cima"] (0 ou 1; também baixo, esquerda, direita, A, B), enviar(v), log(v), await esperar(ms), pixel(x,y,"cor"), retangulo(x,y,l,a,"cor"), linha(x1,y1,x2,y2,"cor"), circulo(x,y,r,"cor"), fundo("cor"), limpar(), bip(hz), imagem("nome",x,y,l,a), tocar("nome"), dados("nome"), tela(w,h) (framebuffer igual ao JavaScript rápido), rgb(r,g,b). Bloco de código com a tag python.
BIBLIOTECA: o usuário importa arquivos (imagens, sons, textos/JSON, código) em menu ... > Biblioteca e usa pelo nome sem extensão. Comand fácil: imagem "nome", x, y, l, a | tocar "nome" | dados("nome"). JavaScript rápido: lib.dados(n), lib.tocar(n), lib.pixels(n) (devolve {w,h,d:Uint32Array}, útil para texturas) e fb.sprite(nome,x,y,l,a).
VARIÁVEIS E COMANDOS PRÓPRIOS (estilo Scratch): o usuário cria variáveis globais (menu ... > Variáveis) que todo Comand enxerga pelo nome (Comand fácil: pontos += 1; JavaScript rápido e Python: variaveis.pontos). Comandos próprios (menu ... > Meus comandos) têm nome, parâmetros e corpo em Comand fácil; são chamados como: quadrado 5, 3 (Comand fácil) ou await comando("quadrado",5,3) (Python e JavaScript rápido). Para criar junto com o sistema, o bloco fabrica aceita "variaveis":{"pontos":0} e "comandos":[{"nome":"quadrado","params":["x","y"],"corpo":"retangulo x * 2, y * 2, 2, 2, \"red\""}]. O aparelho vari (Variável, s:{n:"nome"}) mostra o valor ao vivo.
EXEMPLO de código (quadrado que anda):
se iniciado = 0 entao
  iniciado = 1
  px = 8
  py = 8
fim
se entrada = "direita" entao
  px = min(15, px + 1)
fim
se entrada = "esquerda" entao
  px = max(0, px - 1)
fim
fundo "#111"
retangulo px * 2, py * 2, 2, 2, "lime"
FORMATO: código do Comand dentro de bloco ~~~comand . Para montar um sistema completo use um bloco ~~~fabrica com JSON (tipo = exatamente um dos nomes da lista de aparelhos, fios = pares de ids): {"aparelhos":[{"id":1,"tipo":"ctl","x":20,"y":20},{"id":2,"tipo":"hub","x":215,"y":20},{"id":3,"tipo":"timer","x":215,"y":100,"s":{"ms":33}},{"id":4,"tipo":"comand","x":215,"y":230,"s":{}},{"id":5,"tipo":"disp","x":20,"y":200,"s":{"n":32}}],"fios":[[1,2],[3,2],[4,2],[5,2]]} (isto é só a ESTRUTURA de um jogo: use apenas os aparelhos que o pedido precisa e NUNCA copie valores de exemplo como "Oi"; se você escreveu código, o bloco fabrica DEVE ter um aparelho comand para rodá-lo). Cartões têm 170-230px de largura; espaçe x/y em uns 200px.`;
let HIST=[],CB=[],CL=[],CX=[];
function xc(p){for(let k=1;k<p.length;k+=3){const l=p[k].toLowerCase();if(l=='comand'||l=='javascript'||l=='js'||l=='jsx'||l=='python'||l=='py')return[p[k+2],l=='comand'?'':l=='jsx'?'jsx':l=='python'||l=='py'?'py':'js']}return[]}
function aiToggle(){$('#ai').classList.toggle('open')}
function langNote(){const l=$('#al').value;if(l=='comand')return'';const n={jsx:'JavaScript rápido (jogos grandes)',javascript:'JavaScript',lua:'Lua (Roblox Studio)',python:'Python',csharp:'C#',java:'Java',cpp:'C++',html:'HTML/CSS/JS'}[l];
 return '\nLINGUAGEM PEDIDA: o usuário escolheu '+n+'. Escreva o código em '+n+' (bloco de código com a tag '+l+') e NÃO em Comand'+(l=='python'?'. Esse Python roda dentro de um Comand com Linguagem Python (veja a seção PYTHON). Use a tag python no bloco.':l=='jsx'?'. Esse JavaScript roda dentro de um Comand com Linguagem JavaScript rápido (veja a seção JAVASCRIPT RÁPIDO). Use a tag jsx no bloco.':l=='javascript'?'. Esse JavaScript roda como JavaScript rápido (veja a seção JAVASCRIPT RÁPIDO e o item JAVASCRIPT e JAVASCRIPT RÁPIDO são o mesmo). Use a tag javascript.':'. Esse código não roda na Fábrica, é para o usuário copiar. Para montar sistemas da Fábrica continue usando o bloco fabrica.')}
const il=s=>s.replace(/`([^`]+)`/g,'<code style="background:var(--card);padding:1px 4px;border-radius:4px">$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g,'$1<i>$2</i>');
function md(t){return esc(t).split('\n').map(l=>{let m;
 if(m=l.match(/^#{1,6}\s+(.*)$/))return'<div style="font-weight:700;font-size:15px;margin:6px 0 2px">'+il(m[1])+'</div>';
 if(m=l.match(/^\s*[*\-•]\s+(.*)$/))return'<div style="padding-left:16px;text-indent:-12px">• '+il(m[1])+'</div>';
 if(m=l.match(/^\s*(\d+)[.)]\s+(.*)$/))return'<div style="padding-left:20px;text-indent:-16px">'+m[1]+'. '+il(m[2])+'</div>';
 if(/^\s*(-{3,}|\*{3,})\s*$/.test(l))return'<hr style="border:0;border-top:1px solid var(--bd)">';
 return l.trim()?'<div>'+il(l)+'</div>':'<div style="height:6px"></div>'}).join('')}
function fmt(t){t=t.replace(/<think>[\s\S]*?<\/think>/g,'').replace(/<think>[\s\S]*$/,'').trim();const p=t.split(/```(\w*)\n?([\s\S]*?)```/);let h='';
 for(let i=0;i<p.length;i+=3){h+=md(p[i]||'');
  if(i+2<p.length){const l=p[i+1].toLowerCase(),c=p[i+2],n=CB.push(c)-1,x=(CL[n]=l,CX[n]=xc(p)),bt='<button class=it style="flex:1;padding:6px" onclick="cb('+n+',';
   h+='<pre style="background:#000;color:#4ade80;padding:8px;border-radius:8px;overflow:auto;font-size:12px;margin:6px 0 2px">'+esc(c)+'</pre><div style="display:flex;gap:6px">'+bt+'0)">📋 Copiar</button>'+(l=='comand'||l=='javascript'||l=='js'||l=='jsx'||l=='python'||l=='py'?bt+'1)">📟 Criar Comand</button>':(l=='fabrica'||(/^(json|)$/.test(l)&&/"(aparelhos|devices|dispositivos)"/.test(c)))?bt+'2)">🏗 Montar sistema</button>':'')+'</div>'}}
 return h}
function addMsg(r,t){const m=document.createElement('div');m.style.cssText='margin:6px 0;padding:8px;border-radius:10px;background:'+(r=='u'?'var(--ac);color:#fff;white-space:pre-wrap':'var(--in)');if(r=='u')m.textContent=t;else m.innerHTML=fmt(t);$('#msgs').append(m);$('#msgs').scrollTop=1e6;return m}
const AL={variavel:'vari',monitor:'vari',conjunto:'hub',central:'hub',interruptor:'sw',botao:'sw',switch:'sw',controle:'ctl',joystick:'ctl',lampada:'lamp',luz:'lamp',light:'lamp',matematica:'calc',calculadora:'calc',display:'disp',displaypixel:'disp',pixel:'disp',computador:'pc',terminal:'pc',memoria:'mem',contador:'cont',deslizante:'slider',teclado:'piano',vibrar:'vibra',vibracao:'vibra',temporizador:'timer',relogio:'timer',delay:'atraso',screen:'tela',command:'comand',comando:'comand',value:'valor'};
const nk=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z_]/g,'');
function pj(t){const a=t.indexOf('{'),b=t.lastIndexOf('}'),er='JSON incompleto ou inválido (resposta cortada?). Aumente o limite de tokens em ⚙ ou peça um sistema menor.';if(a<0||b<a)throw new Error(er);try{return JSON.parse(t.slice(a,b+1).replace(/,\s*([}\]])/g,'$1'))}catch(e){throw new Error(er)}}
function build(j,xc,xl){if(typeof j=='string')j=pj(j);snap();(j.remover||[]).forEach(i=>D[i]&&del(+i));(j.editar||[]).forEach(e=>{const d=D[e.id];if(!d)return;Object.assign(d.s,e.s||{});d.env=d.S=d.pn=d.fn=0;d.cl=[];$('#c'+d.id).remove();mk(d)});Object.entries(j.variaveis||{}).forEach(([k,v])=>setVar(k,v));(j.comandos||[]).forEach(c=>defCmd(c.nome||c.name,c.params||[],c.corpo||c.body||''));
 let L=j.aparelhos||j.devices||j.dispositivos||[],F=j.fios||j.wires||j.conexoes||j.ligacoes||[],ox=-V.x/V.s+10,oy=-V.y/V.s+10,m={},bad=[];
 if(xc&&!j.editar&&!L.some(a=>{const k=nk(a.tipo||a.type);return(AL[k]||k)=='comand'})){L=[{id:1,tipo:'ctl',x:20,y:20},{id:2,tipo:'hub',x:215,y:20},{id:3,tipo:'timer',x:215,y:100,s:{ms:xl=='jsx'?33:200}},{id:4,tipo:'comand',x:215,y:230},{id:5,tipo:'disp',x:20,y:200,s:{n:32}}];F=[[1,2],[3,2],[4,2],[5,2]]}
 const isT=(a,t)=>{const k=nk(a.tipo||a.type);return(AL[k]||k)==t};
 if(!j.editar&&L.some(a=>isT(a,'comand'))&&!L.some(a=>isT(a,'disp')||isT(a,'tela'))&&/tela\(|fb\.|pixel|retangulo|texto\(|fundo/.test((xc||'')+L.map(a=>(a.s&&a.s.code)||'').join(''))){const i2=100+L.length,hb=L.find(a=>isT(a,'hub'))||L.find(a=>isT(a,'comand'));L.push({id:i2,tipo:'disp',x:20,y:200,s:{n:32}});F.push([i2,hb.id!==undefined?hb.id:L.indexOf(hb)+1])}
 L.forEach((a,i)=>{const k=nk(a.tipo||a.type),t=Object.hasOwn(T,k)?k:Object.hasOwn(AL,k)?AL[k]:0;if(!t){bad.push(a.tipo||a.type);return}
  const s={...(a.s||a.config||a.props||{})};if(t=='comand'&&xc&&(!s.code||String(s.code).trim().length<40)){s.code=xc;if(xl)s.lang=xl}if(t=='comand'&&s.lang!==undefined)s.lang={javascript:'js',python:'py'}[s.lang]??s.lang;Object.keys(a).forEach(x=>{if(!['id','tipo','type','x','y','s','config','props'].includes(x))s[x]=a[x]});
  m[a.id!==undefined?a.id:i+1]=add(t,ox+(Number(a.x)||(i%3)*200),oy+(Number(a.y)||Math.floor(i/3)*220),s).id});
 let n=0;F.forEach(w=>{const p=Array.isArray(w)?w:[w.de??w.from??w.a,w.para??w.to??w.b];if(m[p[0]]&&m[p[1]]&&m[p[0]]!==m[p[1]]&&!W.some(x=>x.includes(m[p[0]])&&x.includes(m[p[1]]))){W.push([m[p[0]],m[p[1]]]);n++}});
 wires();save();
 if(!Object.keys(m).length){toast(j.variaveis||j.comandos||j.editar||j.remover?'Alterações aplicadas':'Nada montado. Tipos não reconhecidos: '+bad.join(', '));return}
 $('#ai').classList.remove('open');toast('Montado: '+Object.keys(m).length+' aparelhos, '+n+' fios'+(bad.length?' (ignorei: '+bad.join(', ')+')':''))}
function cb(n,a){const c=CB[n];try{if(a==0)copyTxt(c);else if(a==1){snap();add('comand',-V.x/V.s+10,-V.y/V.s+10,{code:c,lang:CL[n]=='comand'?'':CL[n]=='jsx'?'jsx':CL[n]=='python'||CL[n]=='py'?'py':'js'});wires();save();aiToggle();toast('Comand criado')}else{const x=CX[n]&&CX[n][0]?CX[n]:nearCode(n);build(c,x[0],x[1])}}catch(e){toast('Erro: '+e.message)}}
async function ask(){const k=$('#ak').value.trim(),t=$('#ain').value.trim();if(!t)return;if(!k){toast('Cole sua chave da Groq em ⚙');$('#set').open=true;return}
 try{localStorage.setItem('fabk',k);localStorage.setItem('fabm2',$('#am').value)}catch(e){}
 if(LAST&&/^(continue|continua|continuar|segue|prossiga)\W*$/i.test(t)){$('#ain').value='';autoCont();return}LAST=null;$('#ain').value='';addMsg('u',t);HIST.push({role:'user',content:t});const w=addMsg('a','…');WS=w;
 try{const sys=mkSys();
  const j=await groq({model:$('#am').value.trim(),messages:[{role:'system',content:sys},...HIST.slice(-10)],temperature:.2});const a=j.choices[0].message.content;HIST.push({role:'assistant',content:a});showAns(w,a,j);if(LAST&&$('#auto').checked)await autoCont();if(!LAST)await post(w)}
 catch(e){HIST.pop();w.textContent=e instanceof TypeError?'Não consegui falar com a Groq. Se esta página está aberta pelo link do Claude, o navegador bloqueia chamadas para sites externos. Abra o arquivo HTML direto no navegador do aparelho.':'Erro: '+e.message;if(/does not exist/.test(e.message))setTimeout(listModels,300)}}
let LAST=null,WS=null;
async function waitUI(s){for(let i=Math.ceil(s)+1;i>0;i--){if(WS)WS.textContent='⏳ Limite da Groq: continuando em '+i+'s...';await sl(1000)}}
function showAns(w,raw,j){const cut=j.choices[0].finish_reason=='length',v=(raw.match(/```/g)||[]).length%2?raw+'\n```':raw;
 w.innerHTML=fmt(v);
 if(cut){w.querySelectorAll('pre+div').forEach(x=>x.remove());const b=document.createElement('button');b.className='it';b.style.cssText='width:100%;padding:8px;margin-top:6px;flex-direction:row';b.textContent='⏩ Resposta cortada. Continuar de onde parou';b.onclick=()=>autoCont();w.append(b);LAST={raw,w}}else LAST=null}
async function contAns(){const L=LAST;if(!L)return;const b=L.w.lastChild,bt=b&&b.tagName=='BUTTON'?b:null;if(bt)bt.textContent='⏳ Continuando...';WS=bt;
 try{const tail=L.raw.slice(-240),sys=mkSys();
  const j=await groq({model:$('#am').value.trim(),messages:[{role:'system',content:sys},...HIST.slice(-10),{role:'user',content:'Sua resposta anterior foi cortada pelo limite de tamanho. CONTINUE exatamente de onde parou, escrevendo só o que falta, a partir do trecho seguinte ao final abaixo. Não repita nada, não recomece, não escreva introdução nem explicação, e não abra um novo bloco de código se o anterior ainda estava aberto. Final do que você já escreveu:\n'+tail}],temperature:.4});
  let c=j.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g,'');
  if((L.raw.match(/```/g)||[]).length%2)c=c.replace(/^\s*```\w*\n/,'');
  if(L.raw.length>80&&c.trim().startsWith(L.raw.trim().slice(0,60)))throw new Error('A IA recomeçou do zero em vez de continuar. Toque em Continuar de novo ou aumente o limite em ⚙.');
  for(let n=Math.min(240,L.raw.length,c.length);n>=15;n--)if(c.startsWith(L.raw.slice(-n))){c=c.slice(n);break}
  if(LAST!==L)return false;const raw=L.raw+c;HIST[HIST.length-1]={role:'assistant',content:raw};showAns(L.w,raw,j);return true}
 catch(e){if(bt)bt.textContent='⏩ Resposta cortada. Continuar de onde parou';toast(e.message);return false}}
async function autoCont(){for(let i=0;i<8&&LAST;i++){if(!await contAns())break}}
async function groq(body){const k=$('#ak').value.trim();let mt=Math.max(200,+$('#at').value||800),ef=1,rl=0;
 for(let i=0;i<14;i++){
  const b={...body,max_tokens:mt};if(ef&&!$('#think').checked)b.reasoning_effort='none';
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+k},body:JSON.stringify(b)});const j=await r.json();
  if(r.ok)return j;
  const m=(j.error&&j.error.message)||String(r.status),lim=m.match(/Limit (\d+)/);
  if(/reasoning/i.test(m)&&ef){ef=0;continue}
  if(/too large|max_tokens/i.test(m)&&lim&&mt>200){mt=Math.max(200,Math.min(mt-100,+lim[1]-150));continue}
  if(/rate limit/i.test(m)){const t=m.match(/try again in (?:(\d+)m)?([\d.]+)s/i),w=t?(+(t[1]||0))*60+ +t[2]:15;if(w<=75&&rl++<4){await waitUI(w);continue}throw new Error('Limite da Groq atingido. Tente de novo em '+Math.ceil(w)+'s.')}
  throw new Error(m)}
 throw new Error('Não deu certo depois de várias tentativas')}
async function listModels(){const k=$('#ak').value.trim();if(!k){toast('Cole a chave primeiro');return}
 const w=addMsg('a','Buscando modelos…');
 try{const r=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:'Bearer '+k}});const j=await r.json();if(!r.ok)throw new Error(j.error&&j.error.message||r.status);
  const ids=j.data.map(m=>m.id).filter(i=>!/whisper|guard|tts|orpheus/.test(i)).sort(),qw=ids.filter(i=>/qwen/i.test(i)),L=qw.length?qw:ids;
  w.innerHTML='<div>'+(qw.length?'Modelos Qwen da sua conta. Toque para usar:':'Sua conta não tem Qwen. Modelos disponíveis, toque para usar:')+'</div>'+L.map(i=>'<button class=it style="width:100%;padding:8px;margin-top:4px;flex-direction:row" data-m="'+esc(i)+'" onclick="useM(this.dataset.m)">'+esc(i)+'</button>').join('')}
 catch(e){w.textContent='Erro: '+e.message}}
function useM(i){$('#am').value=i;try{localStorage.setItem('fabm2',i)}catch(e){}toast('Modelo: '+i)}
try{$('#ak').value=localStorage.getItem('fabk')||'';$('#am').value=localStorage.getItem('fabm2')||'qwen/qwen3.6-27b'}catch(e){}
/* ---- IA esperta: validação, conserto, desfazer ---- */
const CMDW=['mostrar','enviar','log','esperar','pixel','limpar','bip','retangulo','vibrar','linha','circulo','fundo','imagem','tocar','texto','parar'];
const okx=e=>{try{new Function('E','with(E){return('+tr(e)+')}');return 1}catch(x){return 0}};
function lint(code,lang){const E=[];lang=lang||glang({s:{code}});
 if(lang=='py')return E;
 if(lang=='js'||lang=='jsx'){try{new AF('E','with(E){'+code+'\n}')}catch(e){E.push('JS inválido: '+e.message)}if(/\[[^\]]*\]\s*=\s*tela\(/.test(code))E.push('tela() devolve o fb direto: use const fb = tela(32,32), sem desestruturar');return E}
 let dp=0;
 String(code).split('\n').forEach((r,i)=>{const l=r.trim();if(!l||l[0]=='#')return;const p='linha '+(i+1)+': ',w=l.split(/\s+/)[0].toLowerCase();let m;
  if(m=l.match(/^se (.+) entao$/i)){dp++;okx(m[1])||E.push(p+'condição inválida')}
  else if(/^se\b/i.test(l))E.push(p+'"se" precisa terminar com "entao"');
  else if(/^senao$/i.test(l)){dp||E.push(p+'senao sem se')}
  else if(/^fim$/i.test(l)){if(--dp<0){E.push(p+'fim sobrando');dp=0}}
  else if(m=l.match(/^(repetir|enquanto) (.+)$/i)){dp++;okx(m[2])||E.push(p+'expressão inválida')}
  else if(m=l.match(/^para (\w+) de (.+) ate (.+)$/i)){dp++;okx(m[2])&&okx(m[3])||E.push(p+'expressão inválida')}
  else if(/^(if|else|elif|end|endif|while|for|def|function|print|return|let|var|const)\b/i.test(l))E.push(p+'"'+w+'" não existe no Comand (veja as regras)');
  else if(m=l.match(/^([A-Za-z_]\w*)\s*(\+|-|\*|\/)?=(?!=)\s*(.+)$/))okx(m[3])||E.push(p+'expressão inválida');
  else if(CMDW.includes(w)||CMDS[w]){const a=l.slice(w.length).trim();!a||okx('['+a+']')||E.push(p+'argumentos inválidos em "'+w+'"')}
  else okx(l)||E.push(p+'não entendi: '+l)});
 if(dp>0)E.push('falta "fim" ('+dp+')');
 return E.slice(0,8)}
function chk(raw){const E=[],re=/```(\w*)\n?([\s\S]*?)```/g;let m;
 while(m=re.exec(raw)){const l=m[1].toLowerCase(),c=m[2];if(/^(comand|js|jsx|javascript|python|py)$/.test(l)&&c.trim().length<30)E.push('bloco '+l+' está vazio ou incompleto; escreva o código COMPLETO');
  if(l=='comand')lint(c,'').forEach(e=>E.push('bloco comand, '+e));
  else if(l=='jsx'||l=='js'||l=='javascript')lint(c,l=='jsx'?'jsx':'js').forEach(e=>E.push('bloco '+l+', '+e));
  else if(l=='fabrica'||(/^(json|)$/.test(l)&&/"(aparelhos|devices)"/.test(c)))try{const j=pj(c),ids=new Set();
   (j.aparelhos||j.devices||[]).forEach((a,i)=>{const k=nk(a.tipo||a.type);if(!Object.hasOwn(T,k)&&!Object.hasOwn(AL,k))E.push('tipo de aparelho inexistente: '+(a.tipo||a.type));ids.add(a.id!==undefined?a.id:i+1);if(k=='comand'&&a.s&&a.s.code)lint(a.s.code,a.s.lang||'').forEach(e=>E.push('aparelho '+(a.id||i+1)+', '+e))});
   (j.fios||j.wires||[]).forEach(w=>{if(!Array.isArray(w)||!ids.has(w[0])||!ids.has(w[1]))E.push('fio com id inexistente: '+JSON.stringify(w))});
   (j.comandos||[]).forEach(x=>lint(x.corpo||x.body||'','').forEach(e=>E.push('comando '+(x.nome||x.name)+', '+e)))}catch(e){E.push('fabrica: '+e.message)}}
 return E.slice(0,8)}
const EXTRA=`\nMÉTODO (siga sempre): 1) decida o mínimo de aparelhos; 2) escreva o código; 3) RELEIA o código linha por linha contra as regras de sintaxe antes de responder; 4) responda só com os blocos. O app valida seu código e devolve os erros; corrija sem se desculpar.\nEDITAR O QUE JÁ EXISTE: o bloco fabrica também aceita "editar":[{"id":3,"s":{"code":"..."}}] (id do PROJETO ATUAL) e "remover":[ids]. Se o usuário pedir ajuste, edite em vez de recriar. Se um aparelho tiver "erros", conserte o código dele.\nBOAS PRÁTICAS: jogos com Timer de 100-250 ms (Comand fácil) ou 33 ms (JavaScript rápido); fim de jogo com placar e reinício na tecla A; sempre limite as bordas; use aleatorio() para itens.\nIA DE INIMIGOS (faça inteligente, não aleatória): persiga o jogador comparando coordenadas (se ex < px entao ex += 1 senao se ex > px entao ex -= 1), escolha o eixo de maior distância (abs(ex - px) > abs(ey - py)), mova a cada 2 ou 3 tiques para ser justo, desvie de paredes testando a próxima célula antes de entrar, fuja quando o jogador estiver forte, e acrescente um pouco de aleatoriedade para não ser previsível. Nunca teleporte.\nJAVASCRIPT e JAVASCRIPT RÁPIDO são o mesmo: use tela(w,h) com fb.* OU as funções diretas pixel(x,y,"cor"), retangulo(x,y,l,a,"cor"), linha(x1,y1,x2,y2,"cor"), circulo(x,y,r,"cor"), fundo("cor"), limpar() e texto(t,x,y,"cor",tamanho) (desenha letras; tamanho 1 = 8px). Estado fica em S (ex: S.vidas). Só chame fb.mostrar() se usar tela(). Não existe print, console nem document. Escreva o código COMPLETO e funcional, nunca vazio nem com "// resto aqui". tela(w,h) devolve o fb direto (NÃO é array). EXEMPLO: const fb = tela(32,32); if(!S.ok){S.ok=1;S.x=16} if(teclas.esquerda)S.x--; if(teclas.direita)S.x++; fb.limpar("#102"); fb.ret(S.x,28,4,2,"lime"); fb.texto("Oi",1,1,"white",8); fb.mostrar(); Todo jogo precisa de um Display Pixel ligado ao Conjunto.\n`;
function mkSys(){const P=Object.values(D).map(d=>{const o={id:d.id,tipo:d.type};if(d.type=='comand'){o.lang=d.s.lang||'';o.code=String(d.s.code).slice(0,700);const e=(d.cl||[]).slice(-2).filter(x=>x.includes('⚠'));if(e.length)o.erros=e}else{const x=JSON.stringify(d.s);if(x!='{}')o.s=d.s}return o});
 return SYS.replace(/~~~/g,'```')+EXTRA+'\nPROJETO ATUAL: '+JSON.stringify({aparelhos:P,fios:W,variaveis:VARS,comandos:Object.keys(CMDS)}).slice(0,3500)+langNote()}
async function post(w){let raw=HIST[HIST.length-1].content;
 for(let i=0;i<2&&$('#fix').checked;i++){const E=chk(raw);if(!E.length)break;WS=w;w.textContent='🔧 Achei '+E.length+' erro(s). Corrigindo sozinha...';
  try{const j=await groq({model:$('#am').value.trim(),messages:[{role:'system',content:mkSys()},...HIST.slice(-9),{role:'user',content:'O app validou seu código e achou erros:\n- '+E.join('\n- ')+'\nResponda de novo COMPLETO e corrigido, mesmos blocos, sem pedir desculpas.'}],temperature:.1});
   raw=j.choices[0].message.content;HIST[HIST.length-1]={role:'assistant',content:raw};showAns(w,raw,j);if(LAST){await autoCont();raw=HIST[HIST.length-1].content}}
  catch(e){w.textContent='Erro: '+e.message;return}}
 const E=chk(raw);
 if(E.length){const n=document.createElement('div');n.style.cssText='color:#f59e0b;font-size:12px;margin-top:4px';n.textContent='⚠ Ainda pode ter erro: '+E.slice(0,3).join(' · ');w.append(n)}
 else if($('#apl').checked)autoApply(raw)}
function autoApply(raw){const p=raw.split(/```(\w*)\n?([\s\S]*?)```/),x=xc(p)[0]?xc(p):nearCode(CB.length-1);
 try{for(let k=1;k<p.length;k+=3)if(p[k].toLowerCase()=='fabrica')return build(p[k+2],x[0],x[1]);
  if(x[0]){snap();add('comand',-V.x/V.s+10,-V.y/V.s+10,{code:x[0],lang:x[1]});wires();save();$('#ai').classList.remove('open');toast('Comand criado')}}catch(e){toast('Erro: '+e.message)}}
function fixCmd(d){const e=(d.cl||[]).slice(-6).join('\n');$('#ai').classList.add('open');$('#ain').value='Conserte e melhore o Comand id '+d.id+'. Problema:\n'+(e||'(sem erro, mas não faz o que eu quero)')+'\nUse "editar" no bloco fabrica com o id '+d.id+'.';ask()}
let UH=[];
function snap(){RH.length=0;if(!Object.keys(D).length&&!W.length)return;UH.push(JSON.stringify({D:Object.values(D).map(d=>({id:d.id,type:d.type,x:d.x,y:d.y,s:d.s})),W,VARS,CMDS}));if(UH.length>30)UH.shift()}
function undo(){const j=UH.pop();if(!j){toast('Nada para desfazer');return}RH.push(stJ());const s=JSON.parse(j);reset(1);s.D.forEach(d=>{D[d.id]=d;mk(d)});W=s.W;VARS=s.VARS;CMDS=s.CMDS;wires();save();toast('↩ Desfeito')}
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key=='z'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();undo()}});
function glang(d){const c=String(d.s.code||''),l=d.s.lang||'';if(l)return l;if(/^\s*(def |import |from \w+ import)/m.test(c))return'py';return/\b(const|let|function)\s|=>|\bfb\.|\bS\./.test(c)?(/tela\(|\bfb\./.test(c)?'jsx':'js'):''}
const TC=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
const DN=['pixel','retangulo','linha','circulo','fundo','limpar','mostrar','texto','parar'];
const DRAW=d=>{const e=v=>emit(d,v);return[(x,y,c)=>e({px:[x,y,c||'#fff']}),(x,y,w,h,c)=>e({rc:[x,y,w,h,c||'#fff']}),(a,b,x,y,c)=>e({ln:[a,b,x,y,c||'#fff']}),(x,y,r,c)=>e({ci:[x,y,r,c||'#fff']}),c=>e({clr:1,bg:c}),()=>e({clr:1}),v=>e(v),(t,x,y,c,z)=>d.fb?d.fb.texto(t,x,y,c,z):e({tx:[String(t),x,y,c||'#fff',z||8]}),()=>{throw'parado'}]};
function nearCode(n){const ok=i=>['comand','javascript','js','jsx','python','py'].includes(CL[i]);let b=-1;for(let k=0;k<8&&b<0;k++){if(n-k>=0&&ok(n-k))b=n-k;else if(ok(n+k))b=n+k}
 if(b<0)return[];const l=CL[b];return[CB[b],l=='comand'?'':l=='jsx'?'jsx':l=='python'||l=='py'?'py':'js']}
function copyTxt(t){try{if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t).then(()=>toast('Copiado'),()=>copyTxt2(t))}catch(e){}copyTxt2(t)}
function copyTxt2(t){const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.append(a);a.select();let ok=0;try{ok=document.execCommand('copy')}catch(e){}a.remove();
 if(ok)toast('Copiado');else{modal('<div>Toque e segure no texto para copiar:</div><pre>'+esc(t)+'</pre><button class=it onclick="cm()">Fechar</button>')}}
const CMDHELP=`/jogo  monta Controle, Conjunto, Timer, Comand e Display ligados
/add tipo [x y]  cria aparelho (ex: /add lampada)
/ligar 1 2   ·   /desligar 1 2
/remover 3
/codigo 4 [js|jsx|py|comand]  as linhas seguintes viram o código do Comand #4
/var nome valor
/lista   ·   /limpar
Sem "/": cole a resposta de outra IA (blocos jsx, comand, fabrica ou JSON) e toque em Aplicar. O número #id aparece no título de cada aparelho.`;
function consoleUI(){modal(`<div style="font-weight:700">🧰 Comandos e outras IAs</div><div style="color:var(--mu);font-size:12px">1) Copie as instruções e cole na IA que preferir (ChatGPT, Claude, Gemini...). 2) Cole a resposta dela aqui e toque em Aplicar. Também aceita comandos que começam com / (veja /ajuda).</div><button class=it style="flex-direction:row" onclick="copyPrompt()">📋 Copiar instruções para outra IA</button><textarea id="cin" rows="8" spellcheck="false" autocapitalize="off" placeholder="Cole a resposta da outra IA ou digite comandos com /"></textarea><button class=it style="flex-direction:row" onclick="runIn()">▶ Aplicar</button><div id="clog" class="term" style="max-height:140px"></div><button class=it onclick="cm()">Fechar</button>`)}
function copyPrompt(){copyTxt(mkSys()+'\nPEDIDO DO USUÁRIO: (escreva aqui o que você quer). Responda só com os blocos de código pedidos acima.')}
function applyText(t){t=t.trim();const p=t.split(/```(\w*)\n?([\s\S]*?)```/),OK=['','comand','js','jsx','javascript','python','py'];let fab=null,code=null,lang='';
 if(p.length>1){for(let k=1;k<p.length;k+=3){const l=p[k].toLowerCase(),c=p[k+2];if(l=='fabrica'||(/^(json|)$/.test(l)&&/"(aparelhos|devices)"/.test(c))){fab=fab||c}else if(!code&&OK.includes(l)){code=c;lang=l=='jsx'?'jsx':l=='python'||l=='py'?'py':l=='js'||l=='javascript'?'js':''}}}
 else if(/^\{[\s\S]*\}$/.test(t))fab=t;else code=t;
 if(code&&!lang)lang=glang({s:{code}});
 if(fab)return build(fab,code,lang);
 if(code){snap();add('comand',(-V.x+view.clientWidth/2)/V.s-100,(-V.y+view.clientHeight/2)/V.s-100,{code,lang});wires();save();toast('Comand criado');return}
 throw new Error('Não achei código nem JSON')}
function runIn(){const t=$('#cin').value,L=$('#clog'),out=x=>{L.textContent+=x+'\n';L.scrollTop=1e5};L.textContent='';
 if(!t.trim()){out('Nada para aplicar');return}
 try{if(t.trim()[0]=='/')cmds(t,out);else{const E=chk(t);E.forEach(e=>out('⚠ '+e));applyText(t);out('✔ Aplicado'+(E.length?' (com avisos)':''))}}catch(e){out('✖ '+e.message)}}
function cmds(t,out){const ls=t.split('\n'),bx=-V.x/V.s+20,by=-V.y/V.s+20;let i=0;
 while(i<ls.length){const l=ls[i++].trim();if(!l)continue;const[w,...a]=l.replace(/^\//,'').split(/\s+/),c=w.toLowerCase();
  if(c=='add'||c=='criar'){const k=nk(a[0]),ty=Object.hasOwn(T,k)?k:AL[k];if(!ty){out('✖ tipo desconhecido: '+a[0]);continue}snap();const d=add(ty,a[1]!==undefined?+a[1]:bx+Math.random()*80,a[2]!==undefined?+a[2]:by+Math.random()*80);wires();save();out('✔ '+T[ty].n+' #'+d.id)}
  else if(c=='ligar'||c=='desligar'){const x=+a[0],y=+a[1];if(!D[x]||!D[y]||x==y){out('✖ ids inválidos');continue}const j=W.findIndex(q=>q.includes(x)&&q.includes(y));snap();if(c=='ligar'){if(j<0)W.push([x,y])}else if(j>=0)W.splice(j,1);wires();save();out('✔ '+c+' '+x+' '+y)}
  else if(c=='remover'||c=='apagar'){const x=+a[0];if(!D[x]){out('✖ id inválido');continue}del(x);out('✔ removido #'+x)}
  else if(c=='codigo'){const x=+a[0],b=[];while(i<ls.length&&ls[i].trim()[0]!='/')b.push(ls[i++]);
   if(!D[x]||D[x].type!='comand'){out('✖ #'+a[0]+' não é um Comand');continue}
   const code=b.join('\n').replace(/^\s*```\w*\n?|\n?```\s*$/g,''),lg=a[1]?({js:'js',jsx:'jsx',py:'py',python:'py',comand:''}[a[1].toLowerCase()]??''):glang({s:{code}});
   build({editar:[{id:x,s:{code,lang:lg}}]});out('✔ código no Comand #'+x+' ('+(lg||'comand')+')');lint(code,lg).forEach(e=>out('⚠ '+e))}
  else if(c=='jogo'){snap();const P=[['ctl',20,20,{}],['hub',215,20,{}],['timer',215,100,{ms:33}],['comand',215,230,{}],['disp',20,200,{n:32}]],d=P.map(([k,x,y,s])=>add(k,bx+x,by+y,s));[[0,1],[2,1],[3,1],[4,1]].forEach(([p,q])=>W.push([d[p].id,d[q].id]));wires();save();out('✔ jogo montado. Comand é #'+d[3].id+'. Use: /codigo '+d[3].id+' jsx')}
  else if(c=='lista'){Object.values(D).forEach(d=>out('#'+d.id+' '+T[d.type].n));out('fios: '+(W.map(w=>w.join('-')).join('  ')||'nenhum'))}
  else if(c=='var'){setVar(a[0],a.slice(1).join(' '));out('✔ variável '+a[0])}
  else if(c=='limpar'){reset();wires();save();out('✔ tudo apagado')}
  else if(c=='ajuda')out(CMDHELP)
  else out('✖ comando desconhecido: '+c+' (use /ajuda)')}}
const RH=[],stJ=()=>JSON.stringify({D:Object.values(D).map(d=>({id:d.id,type:d.type,x:d.x,y:d.y,s:d.s})),W,VARS,CMDS});
function redo(){const j=RH.pop();if(!j){toast('Nada para refazer');return}UH.push(stJ());const s=JSON.parse(j);reset(1);s.D.forEach(d=>{D[d.id]=d;mk(d)});W=s.W;VARS=s.VARS;CMDS=s.CMDS;wires();save();toast('↪ Refeito')}
function fit(){const L=Object.values(D);if(!L.length){cm();return}const x0=Math.min(...L.map(d=>d.x)),y0=Math.min(...L.map(d=>d.y)),x1=Math.max(...L.map(d=>d.x+235)),y1=Math.max(...L.map(d=>d.y+($('#c'+d.id)||{offsetHeight:150}).offsetHeight)),s=Math.min(1.2,Math.max(.25,Math.min(view.clientWidth/(x1-x0+40),view.clientHeight/(y1-y0+40))));V.s=s;V.x=(view.clientWidth-(x1-x0)*s)/2-x0*s;V.y=(view.clientHeight-(y1-y0)*s)/2-y0*s;apply();wires();save();cm()}
function theme(){const r=document.documentElement,dk=r.dataset.theme?r.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dk?'light':'dark';try{localStorage.setItem('fabth',r.dataset.theme)}catch(e){}cm()}
try{const t=localStorage.getItem('fabth');if(t)document.documentElement.dataset.theme=t}catch(e){}
function zat(px,py,f){const r=view.getBoundingClientRect(),cx=px-r.left,cy=py-r.top,s=Math.min(2,Math.max(.25,V.s*f)),k=s/V.s;V.x=cx-(cx-V.x)*k;V.y=cy-(cy-V.y)*k;V.s=s;apply();wires();save()}
view.addEventListener('wheel',e=>{e.preventDefault();zat(e.clientX,e.clientY,e.deltaY<0?1.1:.9)},{passive:false});
const PT=new Map();let pd=0;
view.addEventListener('pointerdown',e=>{PT.set(e.pointerId,[e.clientX,e.clientY]);if(PT.size==2){drag=null;pd=0}},true);
view.addEventListener('pointermove',e=>{if(!PT.has(e.pointerId))return;PT.set(e.pointerId,[e.clientX,e.clientY]);if(PT.size!=2)return;const[a,b]=[...PT.values()],ds=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)zat((a[0]+b[0])/2,(a[1]+b[1])/2,ds/pd);pd=ds;drag=null;e.stopImmediatePropagation()},true);
['pointerup','pointercancel'].forEach(t=>view.addEventListener(t,e=>{PT.delete(e.pointerId);pd=0},true));
function ex10(){reset();const t=add('timer',20,20,{ms:700}),a=add('aleat',20,150,{a:0,b:100}),g=add('grafico',230,20),b=add('barra',230,230),p=add('placar',20,300);W.push([t.id,a.id],[a.id,g.id],[a.id,b.id],[a.id,p.id]);wires();save();cm();toast('Toque em Iniciar no Timer')}
function exp(){const j=stJ();modal(`<div style="font-weight:700">📤 Exportar projeto</div><textarea id=ej rows=6 readonly>${esc(j)}</textarea><button class=it onclick="navigator.clipboard.writeText($('#ej').value).then(()=>toast('Copiado!'),()=>{$('#ej').select();toast('Selecione e copie o texto')})">📋 Copiar texto</button><a class=it id=dl download="fabrica.json" style="text-decoration:none;color:var(--tx)">💾 Baixar arquivo .json</a><button class=it onclick="cm()">Fechar</button>`);$('#dl').href=URL.createObjectURL(new Blob([j],{type:'application/json'}))}
function imp(){modal(`<div style="font-weight:700">📥 Importar projeto</div><label class=it for=pf style="flex-direction:row;padding:10px">📁 Escolher arquivo .json</label><div class=mu>ou cole o texto do projeto aqui:</div><textarea id=pj rows=6 placeholder="cole aqui"></textarea><button class=it onclick="impJ($('#pj').value)">Importar texto</button><button class=it onclick="cm()">Fechar</button>`)}
function impJ(j){try{const s=JSON.parse(j);if(!Array.isArray(s.D)||!Array.isArray(s.W))throw 0;reset();const m={};s.D.filter(d=>T[d.type]).forEach(d=>{m[d.id]=add(d.type,d.x,d.y,d.s).id});Object.assign(VARS,s.VARS||{});Object.assign(CMDS,s.CMDS||{});W=s.W.map(w=>[m[w[0]],m[w[1]]]).filter(w=>w[0]&&w[1]);wires();save();cm();fit();toast('Projeto importado')}catch(e){toast('Projeto inválido (precisa ser um .json exportado daqui)')}}
function clr(){modal(`<div style="font-weight:700">🗑 Apagar tudo?</div><div class=mu>Dá para desfazer com ↩ logo depois.</div><button class=it style="background:#dc2626;color:#fff" onclick="reset();wires();save();cm()">Sim, apagar</button><button class=it onclick="cm()">Cancelar</button>`)}
$('#pf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(f)impJ(await f.text())};
const EX11=`const N=48,t=tela(N,N),FX=['normal','P&B','negativo','vermelho','poster'];
const nomes=[...lib.lista('video'),...lib.lista('img')];
if(!nomes.length){
  t.limpar('#1e1b4b');
  t.texto('IMPORTE',5,5,'#fde047',7);
  t.texto('FOTO OU',5,16,'#fff',7);
  t.texto('VIDEO',5,26,'#fff',7);
  t.texto('Menu>Biblioteca',1,40,'#a5b4fc',4);
  t.mostrar();return;
}
if(teclas.B&&!S.pb)S.k=(S.k||0)+1;S.pb=teclas.B;
if(teclas.A&&!S.pa)S.fx=((S.fx||0)+1)%FX.length;S.pa=teclas.A;
const nome=nomes[(S.k||0)%nomes.length];
if(S.v!==nome){if(S.v)lib.video(S.v,'pause');S.v=nome;lib.video(nome,'play')}
if(teclas.cima&&!S.pc)lib.video(nome,'alternar');S.pc=teclas.cima;
const p=lib.pixels(nome);
if(!p){t.limpar('#000');t.texto('carregando',2,20,'#fff',5);t.mostrar();return}
const fx=S.fx||0,sc=Math.max(p.w,p.h)/N,ox=(N-p.w/sc)/2,oy=(N-p.h/sc)/2;
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const sx=Math.floor((x-ox)*sc),sy=Math.floor((y-oy)*sc);
  if(sx<0||sy<0||sx>=p.w||sy>=p.h){t.px(x,y,'#000');continue}
  const c=p.d[sy*p.w+sx];let r=c&255,g=(c>>8)&255,b=(c>>16)&255;
  if(fx==1){r=g=b=(r+g+b)/3}
  else if(fx==2){r=255-r;g=255-g;b=255-b}
  else if(fx==3){g*=.4;b*=.4}
  else if(fx==4){r=r>>6<<6;g=g>>6<<6;b=b>>6<<6}
  t.px(x,y,rgb(r,g,b));
}
t.ret(0,N-8,N,8,'#000');
t.texto(FX[fx],1,N-7,'#fde047',6);
t.mostrar();`;
function vpix(o){const v=o.obj;if(v.readyState<2||!v.videoWidth)return null;const k=Math.min(1,160/v.videoWidth),w=Math.max(1,v.videoWidth*k|0),h=Math.max(1,v.videoHeight*k|0),c=o.cv||(o.cv=document.createElement('canvas'));c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(v,0,0,w,h);return{w,h,d:new Uint32Array(x.getImageData(0,0,w,h).data.buffer)}}
function ex11(){reset();const c=add('ctl',20,20),h=add('hub',215,20),t=add('timer',215,100,{ms:50}),m=add('comand',215,230,{code:EX11,lang:'jsx'}),d=add('disp',20,200,{n:48});[[c,h],[t,h],[m,h],[d,h]].forEach(([a,b])=>W.push([a.id,b.id]));wires();save();cm();T.timer.act(t,'go',q(t,'[data-a=go]'));libUI();toast('Importe uma foto ou vídeo. Depois: A efeito, B próxima mídia, ⬆ pausa')}
/* ---- economia ---- */
const FREEH='296505269868603',h53=(s,seed=0)=>{let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,c;i<s.length;i++){c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return String(4294967296*(2097151&h2)+(h1>>>0))};
let M=250,BTC=0,BTCP=20000,BTCN=0,PK=0,PKR=null,CR={},OID='';const ECO={f:0},BTCH=[];try{const o=JSON.parse(localStorage.getItem('fabeco'));if(o){M=+o.M||0;ECO.f=o.F===FREEH?1:0;BTC=+o.BTC||0;BTCP=+o.P||20000;BTCN=+o.N||0;CR=o.CR||{};PKR=o.PKR||null;OID=o.OID||''}}catch(e){}BTCH.push(BTCP);if(!OID)OID=Math.random().toString(36).slice(2,8).toUpperCase();
const saveM=()=>{clearTimeout(saveM.t);saveM.t=setTimeout(()=>{try{localStorage.setItem('fabeco',JSON.stringify({M,F:ECO.f?FREEH:0,BTC,P:BTCP,N:BTCN,CR,PKR,OID}))}catch(e){}},500)};
const fmtM=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':String(Math.floor(n));
const hud=()=>{const e=$('#mny');if(e)e.textContent='💰 '+(ECO.f?'∞':fmtM(M))+(BTC>1e-6?' · ₿'+BTC.toFixed(4):'')};
function pay(n){if(ECO.f)return true;if(M<n){toast('💸 Faltam $'+(n-M));return false}M-=n;saveM();hud();return true}
function gain(n){if(ECO.f)return;M+=n;saveM();hud()}
const SRES=[16,24,32,48,64,96],UPS=[0,150,600,2500,9000,30000];
const CPU=[null,['Chip 8-bit',120,24,15,350],['Chip 16-bit',900,48,30,150],['Chip 32-bit',6000,64,45,50],['Chip 64-bit Quad',35000,96,60,0]];
function cpuInfo(d){let b=0,bid=0;W.forEach(w=>{if(!w.includes(d.id))return;const o=D[w[0]==d.id?w[1]:w[0]],m=o&&/^cpu(\d)$/.exec(o.type);if(m&&+m[1]>b){b=+m[1];bid=o.id}});return b?{id:bid,pw:b,nm:CPU[b][0],cap:CPU[b][2],fps:CPU[b][3],delay:CPU[b][4]}:{pw:0,nm:'sem processador',cap:16,fps:8,delay:700}}
const effRes=d=>ECO.f?96:Math.min(SRES[d.s.t||0],cpuInfo(d).cap);
function scrUp(d){const t=d.s.t||0;if(t>=5){toast('Tela já está no máximo');return}if(!pay(UPS[t+1]))return;d.s.t=t+1;save();econUI();toast('Tela agora tem '+SRES[t+1]+' bits (precisa de processador bom para usar tudo)')}
function econUI(){Object.values(D).forEach(d=>{if(d.type!='disp'&&d.type!='pc')return;const c=cpuInfo(d),e=q(d,'.eco');if(e){const x=ECO.f?'modo livre · sem limites':d.type=='disp'?`${c.nm} · ${effRes(d)}×${effRes(d)} · ${c.fps}fps`:`${c.nm}${c.delay?' · lento ('+c.delay+'ms por linha)':' · turbo'}`;if(e.textContent!=x)e.textContent=x}if(d.type=='disp'){const b=q(d,'[data-a=up]'),t=d.s.t||0;if(b){const x=t>=5?'Tela no máximo ('+SRES[5]+' bits)':`⬆ Tela ${SRES[t]}→${SRES[t+1]} bits (-$${UPS[t+1]})`;if(b.textContent!=x)b.textContent=x}}})}
{const w0=wires;wires=function(){w0.apply(this,arguments);econUI()}}
{const a0=addT;addT=function(k){const p=T[k].price;if(p){if(CR[k]>0&&!ECO.f){CR[k]--;saveM();toast('🎁 Item do Starter Pack')}else if(!pay(p))return}a0(k)}}
T.disp.s={n:16,t:0};
T.disp.ui=d=>`<canvas class=px data-id=${d.id} width=16 height=16 style="width:210px;height:210px" onclick="tapd(event,this)"></canvas><button data-a=play>⛶ Jogar em tela cheia</button><div class="mu eco"></div><button data-a=up style="background:#16a34a"></button>`;
T.disp.act=(d,a)=>a=='up'?scrUp(d):gopen(d.id);
{const rd=T.disp.recv;T.disp.recv=function(d,v){if(typeof v!='object')return;try{const now=Date.now(),c=cpuInfo(d);if(!ECO.f&&now-(d.lf||0)<1000/c.fps)return;d.lf=now;const R=effRes(d),cv=d.cv||(d.cv=q(d,'canvas'));if(v.fb){const f=v.fb,m=Math.max(f.w,f.h);if(m>R){const k=R/m,w=Math.max(1,Math.floor(f.w*k)),h=Math.max(1,Math.floor(f.h*k)),od=new Uint8ClampedArray(w*h*4),o=new Uint32Array(od.buffer),sr=new Uint32Array(f.d.buffer,f.d.byteOffset,f.d.length>>2);for(let y=0;y<h;y++){const r=Math.floor(y/k)*f.w;for(let x=0;x<w;x++)o[y*w+x]=sr[r+Math.floor(x/k)]}v={...v,fb:{w,h,d:od}}}}else if(cv.width!=R||cv.height!=R){cv.width=cv.height=R;cv.style.height='210px'}}catch(e){}rd(d,v)}}
{const u0=T.pc.ui,r0=T.pc.recv;T.pc.ui=d=>u0(d)+'<div class="mu eco"></div>';T.pc.recv=function(d,v){if(typeof v=='object')return;const dl=ECO.f?0:cpuInfo(d).delay;if(!dl){r0(d,v);return}const t=Math.max(Date.now(),d.pn||0)+dl;if(t-Date.now()>5000)return;d.pn=t;setTimeout(()=>{if(D[d.id]===d)r0(d,v)},t-Date.now())}}
for(let i=1;i<5;i++){const c=CPU[i];T['cpu'+i]={i:'🔲',n:'Processador '+c[0].replace('Chip ',''),price:c[1],s:{},ui:()=>`<div class=term style="text-align:center">${c[0]}\nTela até ${c[2]}×${c[2]} · ${c[3]}fps</div><div class=mu>Ligue com um fio direto em uma Tela bit ou PC.</div>`}}
const PM={fabrica:['minério','peça',2],montadora:['peça','robô',2]},PRICE={'minério':1,'peça':6,'robô':30},BASE={mina:1600,fabrica:1000,montadora:1400},FAC={mina:1,fabrica:2.5,montadora:6,venda:4};
const lvl=d=>d.s.lv||1,upc=d=>Math.round(30*1.8**(lvl(d)-1)*FAC[d.type]),rate=d=>BASE[d.type]/(1+.6*(lvl(d)-1));
function info(d){const l=lvl(d);if(d.type=='mina')return `Nv ${l} · 1 minério a cada ${(rate(d)/1000).toFixed(2)}s`;if(d.type=='venda')return `Nv ${l} · preço +${25*(l-1)}%\nitens: ${d.nv||0} · ganhou $${d.tot||0}`;const p=PM[d.type];return `Nv ${l} · ${p[2]} ${p[0]} → 1 ${p[1]}\nfila ${d.n||0}/${p[2]} · ${(rate(d)/1000).toFixed(2)}s`}
const pui=d=>`<div class=term>${info(d)}</div>${d.type=='mina'?`<button data-a=go>${d.h?'⏸ Parar':'▶ Iniciar'}</button>`:''}<button data-a=up style="background:#16a34a">⬆ Melhorar (-$${upc(d)})</button>`;
function pup(d){if(!pay(upc(d)))return;d.s.lv=lvl(d)+1;if(d.h){clearInterval(d.h);d.h=setInterval(()=>emit(d,'minério'),rate(d))}q(d,'.bd').innerHTML=pui(d);save()}
function ff(d){const p=PM[d.type],t=q(d,'.term');if(t)t.textContent=info(d);if(d.n>=p[2]&&!d.bz){d.bz=1;setTimeout(()=>{d.bz=0;if(D[d.id]!==d)return;d.n-=p[2];emit(d,p[1]);ff(d)},rate(d))}}
T.mina={i:'⛏',n:'Mina',price:40,s:{lv:1},ui:pui,act:(d,a,el)=>{if(a=='up')return pup(d);if(d.h){clearInterval(d.h);d.h=0;el.textContent='▶ Iniciar'}else{d.h=setInterval(()=>emit(d,'minério'),rate(d));el.textContent='⏸ Parar'}}};
['fabrica','montadora'].forEach((k,j)=>{T[k]={i:j?'🤖':'🏭',n:j?'Montadora':'Fábrica',price:j?350:120,s:{lv:1},ui:pui,act:(d,a)=>a=='up'&&pup(d),recv(d,v){if(v!==PM[k][0]||(d.n||0)>=20)return;d.n=(d.n||0)+1;ff(d)}}});
T.venda={i:'💵',n:'Venda',price:20,s:{lv:1},ui:pui,act:(d,a)=>a=='up'&&pup(d),recv(d,v){const p=PRICE[v];if(!p)return;const g=Math.round(p*(1+.25*(lvl(d)-1)));gain(g);d.tot=(d.tot||0)+g;d.nv=(d.nv||0)+1;q(d,'.term').textContent=info(d)}};
function ecoMenu(){modal(`<div style="font-weight:700">💰 Economia</div><div class=term>Dinheiro: ${ECO.f?'∞ (modo livre)':'$'+Math.floor(M).toLocaleString('pt-BR')}</div><div class=mu>1. Monte fábricas: ⛏ Mina → 🏭 Fábrica → 🤖 Montadora → 💵 Venda (ligue com fios em fila). A Venda paga em dinheiro.<br>2. Compre 🔲 Processadores no menu ＋ e ligue com um fio direto em uma Tela bit ou PC. Sem processador a tela fica em 16×16 e 8 fps, e o PC fica lento.<br>3. Aumente os bits da Tela (botão verde nela) e melhore as fábricas com dinheiro.<br>4. ₿ Minerador de Bitcoin: ligue um processador com fio direto (a força é dividida entre tudo que estiver ligado nele). Gasta energia em $ e acha blocos que viram ₿; venda na 📈 Corretora BTC. O preço oscila, a dificuldade sobe e a recompensa cai pela metade a cada 100 blocos.<br>Apagar um aparelho pago devolve metade.</div>${ECO.f?'<button class=it onclick="ECO.f=0;saveM();hud();econUI();ecoMenu()">🔒 Desligar modo livre</button>':'<div class=mu>🔐 Modo livre (precisa de senha):</div><input id=fp type=password placeholder="senha" autocomplete=off><button class=it onclick="freeTry()">Liberar modo livre</button>'}<button class=it onclick="packUI()">🎁 Starter Pack (R$ 1)</button><button class=it onclick="M=250;saveM();hud();ecoMenu()">♻ Recomeçar com $250</button><button class=it onclick="cm()">Fechar</button>`)}
function ex12(){reset();const m=add('mina',20,20),f=add('fabrica',215,20),a=add('montadora',215,200),v=add('venda',20,200),t=add('disp',20,380),c=add('cpu1',215,380);[[m,f],[f,a],[a,v],[c,t]].forEach(([x,y])=>W.push([x.id,y.id]));wires();save();cm();T.mina.act(m,'go',q(m,'[data-a=go]'));toast('Fábrica rodando! Junte dinheiro e melhore a Tela')}
/* ---- bitcoin ---- */
const HASH=[.3,1,4,16,64],btcDiff=()=>30*1.02**BTCN,btcReward=()=>.001/2**Math.floor(BTCN/100);FAC.rig=10;
function rigStat(d){const c=cpuInfo(d),sh=c.pw?(W.filter(w=>w.includes(c.id)).length||1):1,hs=HASH[c.pw]*(1+.5*(lvl(d)-1))/sh;return{c,hs,en:ECO.f?0:.05+.05*hs}}
function rigText(d){const t=q(d,'.term');if(!t)return;const{c,hs,en}=rigStat(d),x=`Nv ${lvl(d)} · ${hs.toFixed(2)} H/s · energia $${en.toFixed(2)}/s\n${d.low?'⚠ sem dinheiro para a energia':!c.pw?'⚠ sem processador: ligue um 🔲 com fio':d.h?'⛏ minerando...':'parado'}\nprogresso ${Math.floor(d.pg||0)}/${Math.floor(btcDiff())} · blocos ${d.nb||0}\n₿ minerados: ${(d.got||0).toFixed(4)}`;if(t.textContent!=x)t.textContent=x}
function rigTick(d){const{hs,en}=rigStat(d);d.low=0;if(en){if(M<en){d.low=1;rigText(d);return}M-=en;saveM();hud()}d.pg=(d.pg||0)+hs;let n=0;while(d.pg>=btcDiff()&&n++<50){d.pg-=btcDiff();const r=btcReward();BTC+=r;BTCN++;d.nb=(d.nb||0)+1;d.got=(d.got||0)+r;emit(d,'bloco')}if(n){saveM();hud()}rigText(d)}
T.rig={i:'₿',n:'Minerador BTC',price:300,s:{lv:1},ui:d=>`<div class=term style="min-height:84px"></div><button data-a=go>${d.h?'⏸ Parar':'▶ Iniciar'}</button><button data-a=up style="background:#16a34a">⬆ Melhorar (-$${upc(d)})</button><div class=mu>Ligue um 🔲 Processador por fio direto. Envia "bloco" a cada bloco achado.</div>`,act:(d,a,el)=>{if(a=='up'){if(!pay(upc(d)))return;d.s.lv=lvl(d)+1;q(d,'.bd').innerHTML=T.rig.ui(d);rigText(d);save();return}if(d.h){clearInterval(d.h);d.h=0;el.textContent='▶ Iniciar'}else{d.h=setInterval(()=>rigTick(d),1000);el.textContent='⏸ Parar'}rigText(d)}};
function btcSell(f){const n=BTC*f;if(n<=1e-9){toast('Você não tem ₿');return}BTC-=n;const g=Math.floor(n*BTCP*.99);gain(g);saveM();hud();toast('Vendeu ₿'+n.toFixed(4)+' por $'+g)}
function btcBuy(v){if(!pay(v))return;BTC+=v*.99/BTCP;saveM();hud()}
function bolsaUI(){Object.values(D).forEach(d=>{if(d.type!='bolsa')return;const t=q(d,'.term'),c=q(d,'canvas');if(!t||!c)return;const a=BTCH.length>1?BTCP>=BTCH[BTCH.length-2]?'▲':'▼':'';t.textContent=`₿ ${BTC.toFixed(5)} (≈ $${Math.floor(BTC*BTCP).toLocaleString('pt-BR')})\nPreço: $${Math.round(BTCP).toLocaleString('pt-BR')} ${a}\nRede: dificuldade ${Math.floor(btcDiff())} · recompensa ₿${btcReward().toFixed(5)} · blocos ${BTCN}`;const x=c.getContext('2d'),w=c.width,h=c.height,lo=Math.min(...BTCH),hi=Math.max(...BTCH),r=hi-lo||1;x.clearRect(0,0,w,h);x.strokeStyle=BTCP>=BTCH[0]?'#22c55e':'#ef4444';x.lineWidth=2;x.beginPath();BTCH.forEach((y,i)=>{const px=i*(w/59),py=h-4-(y-lo)/r*(h-8);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.fillStyle='#94a3b8';x.font='10px monospace';x.fillText(Math.round(hi),2,10);x.fillText(Math.round(lo),2,h-2)})}
T.bolsa={i:'📈',n:'Corretora BTC',price:50,w:1,s:{alvo:0},ui:d=>`<canvas class=px width=240 height=100 style="width:100%;height:100px;image-rendering:auto"></canvas><div class=term style="min-height:60px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button data-a=v1>Vender tudo</button><button data-a=v2>Vender metade</button><button data-a=c1>Comprar $100</button><button data-a=c2>Comprar $1000</button></div><div class=mu>Venda automática quando o preço chegar a (0 = desligada). Taxa de 1%. Sinais: "vender", "comprar", "preço".</div><input data-k=alvo type=number value="${d.s.alvo}">`,act:(d,a)=>{a=='v1'?btcSell(1):a=='v2'?btcSell(.5):a=='c1'?btcBuy(100):btcBuy(1000);bolsaUI()},recv(d,v){if(typeof v=='object')return;v=String(v).toLowerCase();if(v=='vender')btcSell(1);else if(v=='comprar')btcBuy(100);else if(v=='preço'||v=='preco')emit(d,Math.round(BTCP));bolsaUI()}};
setInterval(()=>{const l=Math.log(BTCP);let n=l+(Math.log(20000)-l)*.02+(Math.random()-.5)*.1;if(Math.random()<.03){const up=Math.random()<.5;n+=up?.25:-.25;toast(up?'📰 Bitcoin disparou!':'📰 Bitcoin despencou!')}BTCP=Math.min(90000,Math.max(3000,Math.exp(n)));BTCH.push(BTCP);if(BTCH.length>60)BTCH.shift();Object.values(D).forEach(d=>{if(d.type=='bolsa'&&+d.s.alvo>0&&BTCP>=+d.s.alvo&&BTC>1e-9)btcSell(1)});bolsaUI();hud();saveM()},2000);
{const e0=econUI;econUI=function(){e0();Object.values(D).forEach(d=>(d.type=='rig'&&rigText(d),d.type=='console'&&emuText(d)))}}
function ex13(){reset();const r=add('rig',20,20),c=add('cpu2',20,230),b=add('bolsa',215,20),t=add('tela',20,330);[[c,r],[r,t]].forEach(([x,y])=>W.push([x.id,y.id]));wires();save();cm();T.rig.act(r,'go',q(r,'[data-a=go]'));toast('Minerando! Venda os ₿ na Corretora')}
/* ---- senha, pack Pix, console .iso, nuvem Google ---- */
const PIX_KEY='hdcoser@gmail.com',PIX_NOME='FABRICA DE TUDO',PIX_CIDADE='BRASIL',PUBKEY={"kty": "EC", "crv": "P-256", "x": "oRl75L6dqNXT2uPveOFTijNg8Cz7wn9fK0Ue5TsZzrg", "y": "fo1PrpmErplJ8KVrfQaaZULDzrEMDCe8vVc_TEohyeM"};
function freeTry(){if(h53($('#fp').value)===FREEH){ECO.f=1;saveM();hud();econUI();toast('🔓 Modo livre liberado');ecoMenu()}else toast('Senha errada')}
function crc16(t){let c=0xFFFF;for(const ch of t){c^=ch.charCodeAt(0)<<8;for(let i=0;i<8;i++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
function pixCode(){const f=(i,v)=>i+String(v.length).padStart(2,'0')+v,p=f('00','01')+f('01','11')+f('26',f('00','BR.GOV.BCB.PIX')+f('01',PIX_KEY))+f('52','0000')+f('53','986')+f('54','1.00')+f('58','BR')+f('59',PIX_NOME)+f('60',PIX_CIDADE)+f('62',f('05',OID))+'6304';return p+crc16(p)}
async function pkVerify(oid,sig){try{if(!(window.crypto&&crypto.subtle)){toast('Abra o arquivo em um navegador (Chrome) para validar o código');return false}const k=await crypto.subtle.importKey('jwk',PUBKEY,{name:'ECDSA',namedCurve:'P-256'},false,['verify']),b=Uint8Array.from(atob(String(sig).replace(/\s/g,'').replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},k,b,new TextEncoder().encode('FABRICA-PACK1:'+oid))}catch(e){return false}}
async function pkRedeem(code){if(PK){toast('Starter Pack já ativado');return}if(!await pkVerify(OID,code)){toast('Código inválido para o seu ID '+OID);return}PKR={o:OID,s:String(code).replace(/\s/g,'')};PK=1;M+=3000;CR.cpu2=(CR.cpu2||0)+1;saveM();hud();toast('🎁 Starter Pack ativado: +$3.000 e 1 Processador 16-bit grátis!');packUI()}
function packUI(){modal(`<div style="font-weight:700">🎁 Starter Pack de Iniciante · R$ 1,00</div><div class=mu>Contém: $3.000 + 1 Processador 16-bit grátis (pegue no menu ＋).</div>${PK?'<div class=term>✅ Pack já ativado</div>':`<div class=mu>Seu ID do pedido: <b>${OID}</b></div><textarea id=pxc rows=4 readonly>${pixCode()}</textarea><button class=it onclick="navigator.clipboard.writeText($('#pxc').value).then(()=>toast('Copiado! Cole no app do banco (Pix Copia e Cola)'),()=>$('#pxc').select())">📋 Copiar Pix (copia e cola)</button><div class=mu>Chave Pix (e-mail): ${PIX_KEY} · R$ 1,00. Depois de pagar, envie o comprovante com o ID acima para esse e-mail. O código só é liberado depois que o Pix for conferido.</div><a class=it style="text-decoration:none;color:var(--tx)" href="mailto:${PIX_KEY}?subject=${encodeURIComponent('Starter Pack '+OID)}&body=${encodeURIComponent('ID do pedido: '+OID+'\nAnexe o comprovante do Pix.')}">✉ Enviar comprovante</a><textarea id=pkc rows=3 placeholder="cole aqui o código de liberação"></textarea><button class=it onclick="pkRedeem($('#pkc').value)">✅ Ativar pack</button>`}<button class=it onclick="cm()">Fechar</button>`)}
if(PKR)pkVerify(PKR.o,PKR.s).then(v=>{PK=v?1:0;if(!v&&window.crypto&&crypto.subtle)PKR=null});
const EMU={ps1:['psx','PS1',2],n64:['n64','Nintendo 64',3]};
function emuSys(d){const s=d.s.sis;if(s=='PS1')return'ps1';if(s=='N64')return'n64';const e=((d.file&&d.file.name)||'').split('.').pop().toLowerCase();return['z64','n64','v64'].includes(e)?'n64':['iso','bin','cue','chd','pbp','img'].includes(e)?'ps1':''}
function emuText(d){const e=q(d,'.cs');if(!e)return;const sy=emuSys(d),c=cpuInfo(d);e.textContent=(d.file?'📀 '+d.file.name:'nenhum jogo escolhido')+'\n'+(sy?EMU[sy][1]+': precisa de '+CPU[EMU[sy][2]][0]+' ou melhor · '+(ECO.f||c.pw>=EMU[sy][2]?'✅ ok':'❌ ligado: '+c.nm):'sistema: escolha PS1 ou N64')}
function gfPick(id,el,bios){const d=D[id];bios?d.bios=el.files[0]:d.file=el.files[0];emuText(d)}
document.addEventListener('change',e=>{const c=e.target.closest&&e.target.closest('.card'),d=c&&D[c.id.slice(1)];if(d&&d.type=='console')setTimeout(()=>emuText(d),0)});
function emuClose(){const w=$('#emu');if(!w)return;URL.revokeObjectURL(w.dataset.u);if(w.dataset.b)URL.revokeObjectURL(w.dataset.b);w.remove()}
function emuPlay(d){emuText(d);const sy=emuSys(d);if(!d.file){toast('Escolha um jogo primeiro');return}if(!sy){toast('Escolha PS1 ou N64 na lista');return}const c=cpuInfo(d),need=EMU[sy][2];if(!ECO.f&&c.pw<need){toast('Ligue um '+CPU[need][0]+' (🔲) neste Console');return}
 emuClose();const u=URL.createObjectURL(d.file),b=d.bios?URL.createObjectURL(d.bios):'',nm=d.file.name.replace(/\.[^.]+$/,'');
 const html='<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><style>html,body,#game{margin:0;width:100%;height:100%;background:#000}</style><div id=game></div><script>EJS_player="#game";EJS_core="'+EMU[sy][0]+'";EJS_gameUrl='+JSON.stringify(u+'#/'+encodeURIComponent(d.file.name))+';EJS_gameName='+JSON.stringify(nm)+';EJS_pathtodata="https://cdn.emulatorjs.org/stable/data/";EJS_startOnLoaded=true;'+(b?'EJS_biosUrl='+JSON.stringify(b)+';':'')+'<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script>';
 const w=document.createElement('div');w.id='emu';w.dataset.u=u;w.dataset.b=b;w.style.cssText='position:fixed;inset:0;z-index:99999;background:#000';w.innerHTML='<button style="position:absolute;top:6px;left:50%;transform:translateX(-50%);z-index:2;padding:6px 14px;border-radius:10px;border:0;background:#dc2626;color:#fff;font-size:15px;opacity:.85" onclick="emuClose()">✕ Fechar jogo</button><iframe style="width:100%;height:100%;border:0" allow="autoplay;fullscreen;gamepad"></iframe>';document.body.append(w);w.querySelector('iframe').srcdoc=html;emit(d,1)}
T.console={i:'🎮',n:'Console (.iso)',price:400,w:1,s:{sis:'auto'},ui:d=>`<div class="term cs" style="min-height:50px"></div>${SEL('sis',['auto','PS1','N64'],d.s.sis)}<label class=it for=gf${d.id} style="flex-direction:row;padding:10px">📀 Escolher jogo (.iso .bin .cue .chd .z64 .n64)</label><input type=file id=gf${d.id} hidden accept=".iso,.bin,.cue,.chd,.pbp,.img,.z64,.n64,.v64" onchange="gfPick(${d.id},this)"><label class=it for=gb${d.id} style="flex-direction:row;padding:8px">🧩 BIOS do PS1 (opcional)</label><input type=file id=gb${d.id} hidden onchange="gfPick(${d.id},this,1)"><button data-a=play>▶ Jogar</button><div class=mu>Só PS1 e Nintendo 64, com jogos que você possui. Precisa de internet para carregar o emulador.</div>`,act:d=>emuPlay(d)};
let GTOK=null,GEXP=0,GAUTO=0;
const gLoadLib=()=>new Promise((ok,no)=>{if(window.google&&google.accounts)return ok();const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=ok;s.onerror=()=>no(new Error('sem internet'));document.head.append(s)});
async function gAuth(){if(GTOK&&Date.now()<GEXP)return GTOK;const id=localStorage.getItem('fabgcid');if(!id)throw new Error('Cole o ID do cliente Google primeiro');await gLoadLib();return new Promise((ok,no)=>google.accounts.oauth2.initTokenClient({client_id:id,scope:'https://www.googleapis.com/auth/drive.appdata',callback:r=>{if(r.error)return no(new Error(r.error));GTOK=r.access_token;GEXP=Date.now()+(r.expires_in-60)*1000;ok(GTOK)},error_callback:e=>no(new Error(e.type||'login cancelado'))}).requestAccessToken())}
async function gF(u,o={}){const t=await gAuth(),r=await fetch(u,{...o,headers:{...(o.headers||{}),Authorization:'Bearer '+t}});if(!r.ok)throw new Error('Google respondeu '+r.status);return r}
const gFind=async()=>((await(await gF('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q='+encodeURIComponent("name='fabrica-save.json'"))).json()).files||[])[0]?.id;
async function gSave(quiet){try{const body=JSON.stringify({proj:JSON.parse(stJ()),eco:{M,BTC,P:BTCP,N:BTCN,CR,PKR,OID},t:Date.now()}),id=await gFind();if(id)await gF('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body});else await gF('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{'Content-Type':'multipart/related; boundary=fab'},body:'--fab\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{"name":"fabrica-save.json","parents":["appDataFolder"]}\r\n--fab\r\nContent-Type: application/json\r\n\r\n'+body+'\r\n--fab--'});if(!quiet)toast('☁ Salvo na sua conta Google')}catch(e){if(!quiet)toast('Erro ao salvar: '+e.message)}}
async function gGet(){try{const id=await gFind();if(!id){toast('Nenhum save na nuvem ainda');return}const j=await(await gF('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media')).json(),e=j.eco||{};impJ(JSON.stringify(j.proj));M=+e.M||0;BTC=+e.BTC||0;BTCP=+e.P||20000;BTCN=+e.N||0;CR=e.CR||{};if(e.PKR&&await pkVerify(e.PKR.o,e.PKR.s)){PKR=e.PKR;OID=e.PKR.o;PK=1}saveM();hud();toast('☁ Save carregado da nuvem')}catch(e){toast('Erro ao carregar: '+e.message)}}
setInterval(()=>{if(GAUTO&&GTOK&&Date.now()<GEXP)gSave(1)},300000);
function cloudUI(){modal(`<div style="font-weight:700">☁ Salvar na conta Google</div><div class=mu>Guarda seu projeto, dinheiro, ₿ e pack numa pasta privada do seu Google Drive (só este app enxerga). Precisa de um ID de cliente OAuth (tipo Web, com a Drive API ativada) criado no Google Cloud Console, e o arquivo precisa estar em um endereço https ou localhost cadastrado nele. Não funciona abrindo como file://.</div><input id=gci placeholder="ID do cliente Google (...apps.googleusercontent.com)" value="${esc(localStorage.getItem('fabgcid')||'')}" onchange="localStorage.setItem('fabgcid',this.value.trim())"><button class=it onclick="localStorage.setItem('fabgcid',$('#gci').value.trim());gSave()">⬆ Entrar e salvar na nuvem</button><button class=it onclick="localStorage.setItem('fabgcid',$('#gci').value.trim());gGet()">⬇ Carregar da nuvem (substitui o atual)</button><label class=mu style="display:flex;gap:8px;align-items:center"><input type=checkbox style="width:auto" ${GAUTO?'checked':''} onchange="GAUTO=this.checked?1:0">Salvar sozinho a cada 5 min (depois de entrar)</label><button class=it onclick="cm()">Fechar</button>`)}
hud();
/* ---- início ---- */
try{const s=JSON.parse(localStorage.getItem('fab1')||'null');if(s&&s.D.length){Object.assign(VARS,s.VARS||{});Object.assign(CMDS,s.CMDS||{});nid=s.nid;V=s.V;W=s.W;s.D.forEach(d=>{if(T[d.type]){D[d.id]=d;mk(d)}});W=W.filter(w=>D[w[0]]&&D[w[1]]);apply()}else ex1()}catch(e){ex1()}
apply();requestAnimationFrame(wires);addEventListener('resize',wires);
