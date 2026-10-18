import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const D = __DATA__;
const FONT = '"Bricolage Grotesque","Avenir Next","Segoe UI",sans-serif';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (document.fonts) { try { await Promise.race([document.fonts.load('700 40px "Bricolage Grotesque"'), new Promise(r=>setTimeout(r,1500))]); } catch(e){} }
const $ = id => document.getElementById(id);

/*__KITS__*/

const KIT = KITS[D.domain] || KITS.city;
const W = KIT.words;

// ---------- formatting ----------
const compact = a => a>=1e9 ? (a/1e9).toFixed(2)+'B' : a>=1e6 ? (a/1e6).toFixed(2)+'M' : a>=1e4 ? Math.round(a/1e3)+'K' : a>=1e3 ? (a/1e3).toFixed(1)+'K' : String(Number(a.toFixed(a<10?2:0)));
const fmt = (v, t='num') => {
  if (v === null || v === undefined || Number.isNaN(v)) return 'n/a';
  const neg = v < 0 ? '−' : '', a = Math.abs(v);
  switch (t) {
    case 'money': return neg + (D.currency||'$') + compact(a);
    case 'int': return v.toLocaleString();
    case 'pct': return neg + Number(a.toFixed(1)) + '%';
    case 'days': return neg + Number(a.toFixed(1)) + ' days';
    case 'dec': return neg + a.toFixed(2);
    case 'text': return String(v);
    default: return neg + compact(a);
  }
};
const MD = D.metricDefs;
const fm = (key, v) => fmt(v, (MD[key]||{}).fmt);

// ---------- health scale (the one metric that sets color) ----------
const H = D.health;
const clamp01 = t => Math.min(1,Math.max(0,t));
const C_MID = new THREE.Color(0xbdbcb6), C_GAIN = new THREE.Color(0x2a78d6), C_LOSS = new THREE.Color(0xd03b3b);
const C_SEQ0 = new THREE.Color(0xcde2fb), C_SEQ1 = new THREE.Color(0x184f95);
const goodness = v => {           // -1 (worst) .. 0 (mid) .. +1 (best)
  const [lo,mid,hi] = H.range, up = (v-mid)/((hi-mid)||1), down = (mid-v)/((mid-lo)||1);
  const g = v >= mid ? clamp01(up) : -clamp01(down);
  return H.good === 'low' ? -g : g;
};
function healthColor(v){
  if (!H || v === null || v === undefined) return C_MID.clone();
  if (H.mode === 'sequential') return C_SEQ0.clone().lerp(C_SEQ1, clamp01((v-H.range[0])/((H.range[1]-H.range[0])||1)));
  const g = goodness(v);
  return g >= 0 ? C_MID.clone().lerp(C_GAIN, g) : C_MID.clone().lerp(C_LOSS, -g);
}
const healthTag = v => {
  if (!H || v === null || v === undefined) return '';
  if (H.mode === 'sequential') return fm(H.key, v);
  const g = goodness(v);
  return `${g >= 0 ? '▲' : '▼'} ${v > 0 && H.fmt !== 'text' ? '+' : ''}${fm(H.key, v)}`;
};

// ---------- scene ----------
const sky = document.createElement('canvas'); sky.width = 4; sky.height = 256;
{ const g = sky.getContext('2d'), gr = g.createLinearGradient(0,0,0,256); gr.addColorStop(0,KIT.sky[0]); gr.addColorStop(0.55,KIT.sky[1]); gr.addColorStop(1,KIT.sky[2]); g.fillStyle = gr; g.fillRect(0,0,4,256); }
const skyTex = new THREE.CanvasTexture(sky); skyTex.colorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = skyTex;
scene.fog = new THREE.Fog(new THREE.Color(KIT.sky[2]), 80, 170);
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 400);
const HOME = {pos:new THREE.Vector3(0,36,50), tar:new THREE.Vector3(0,0,2)};
camera.position.copy(HOME.pos);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI/2.1; controls.minDistance = 4; controls.maxDistance = 100;
controls.target.copy(HOME.tar);
controls.autoRotate = !reduceMotion; controls.autoRotateSpeed = 0.35;
scene.add(new THREE.HemisphereLight(0xdcecff, 0x8fae6e, 1.7));
const sun = new THREE.DirectionalLight(0xfff0d2, 2.7);
sun.position.set(28,50,24); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:140});
sun.shadow.bias = -0.0004; sun.shadow.radius = 3; scene.add(sun);

// ---------- helpers (kits use these) ----------
const mat = (color, o={}) => { const {glow, noShadow, seg, ...rest} = o; const m = new THREE.MeshStandardMaterial({color, roughness:0.8, metalness:0.02, ...rest});
  m.emissive = new THREE.Color(glow ?? color); m.emissiveIntensity = glow ? 1 : 0; if (glow) m.userData.glow = true; return m; };
function box(w,h,l,color,x=0,y=0,z=0,o={}){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,l), mat(color,o));
  m.position.set(x,y,z); m.castShadow = !o.noShadow; m.receiveShadow = true; return m;
}
function cyl(rt,rb,h,color,x=0,y=0,z=0,o={}){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,o.seg||16), mat(color,o));
  m.position.set(x,y,z); m.castShadow = !o.noShadow; m.receiveShadow = true; return m;
}
function ball(r,color,x=0,y=0,z=0,o={}){
  const m = new THREE.Mesh(new THREE.SphereGeometry(r,o.seg||14,10), mat(color,o));
  m.position.set(x,y,z); m.castShadow = !o.noShadow; return m;
}
function label(text, {size=0.9, color='#14202e', bg='rgba(255,255,255,.94)', edge='rgba(20,32,46,.18)'}={}){
  const c = document.createElement('canvas'), g = c.getContext('2d'), f = `700 40px ${FONT}`;
  g.font = f; const w = Math.ceil(g.measureText(text).width) + 44; c.width = w; c.height = 72;
  g.font = f; g.fillStyle = bg; g.beginPath(); g.roundRect(2,6,w-4,60,30); g.fill();
  g.strokeStyle = edge; g.lineWidth = 2; g.stroke();
  g.fillStyle = color; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,w/2,38);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  s.scale.set(size*w/72, size, 1); return s;
}
function bubble(sym, color){
  const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.beginPath(); g.arc(48,48,44,0,7); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(48,48,36,0,7); g.fill();
  g.fillStyle = '#fff'; g.font = `700 52px ${FONT}`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(sym,48,52);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  s.scale.set(0.6,0.6,1); return s;
}
let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
const SKINS = [0xf2c9a0,0xd9a47a,0xb07a52,0x8a5a3a];
// a walking person; opts: hat (hex), coat (hex), skin (hex)
function person(shirt, o={}, k=0){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22,0.5,4,10), mat(new THREE.Color(o.coat ?? shirt))); body.position.y = 0.85; body.castShadow = true; g.add(body);
  g.add(ball(0.2, o.skin ?? SKINS[k%4], 0,1.5,0));
  if (o.hat) g.add(cyl(0.2,0.22,0.12,o.hat,0,1.68,0,{seg:12}));
  g.add(box(0.14,0.5,0.16,0x2b3550,-0.1,0.25,0), box(0.14,0.5,0.16,0x2b3550,0.1,0.25,0));
  g.userData.body = body; return g;
}
const tickers = []; const onTick = fn => tickers.push(fn);

// ---------- shared environment pieces (kits call these) ----------
function hall({floor=[0xe6e3db,0xdad6cc], wall=0xf3f1ec, band=0x2a78d6, walls=true, pave=0xd9d6cd, pad=false}={}){
  const hex = c => '#' + new THREE.Color(c).getHexString();
  const plaza = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ell(20,14))), mat(pave,{roughness:1}));
  plaza.rotation.x = -Math.PI/2; plaza.position.y = 0.02; plaza.receiveShadow = true; scene.add(plaza);
  const tile = document.createElement('canvas'); tile.width = tile.height = 128; const g = tile.getContext('2d');
  g.fillStyle = hex(floor[0]); g.fillRect(0,0,128,128); g.fillStyle = hex(floor[1]); g.fillRect(0,0,64,64); g.fillRect(64,64,64,64);
  const tex = new THREE.CanvasTexture(tile); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(14,9); tex.colorSpace = THREE.SRGBColorSpace;
  const fl = new THREE.Mesh(new THREE.BoxGeometry(28,0.3,18), new THREE.MeshStandardMaterial({map:tex,roughness:0.6}));
  fl.position.y = 0.15; fl.receiveShadow = true; scene.add(fl);
  if (walls){
    scene.add(box(28.6,6,0.4,wall,0,3.15,-9.1));
    scene.add(box(0.4,1.5,18.6,wall,-14.1,0.9,0), box(0.4,1.5,18.6,wall,14.1,0.9,0));
    scene.add(box(11.2,1.5,0.4,wall,-8.4,0.9,9.1), box(11.2,1.5,0.4,wall,8.4,0.9,9.1));
    scene.add(box(28.6,0.7,0.6,band,0,6.15,-9.1));
  }
}
function trees(n=26, hue=0.33){
  for (let i=0;i<n;i++){ const t = rnd()*Math.PI*2, k = 1.22 + rnd()*0.95, x = 30*k*Math.cos(t), z = 24*k*Math.sin(t);
    const tr = new THREE.Group(), h = 1.6+rnd()*1.6, leaf = new THREE.Color().setHSL(hue+rnd()*0.04,0.5,0.24+rnd()*0.07);
    tr.add(box(0.45,1.3,0.45,0x6b4a33,0,0.65,0));
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5,h*1.9,8), mat(leaf)); cone.position.y = 1.3+h*0.85; cone.castShadow = true; tr.add(cone);
    tr.position.set(x,0,z); scene.add(tr); }
}
function ell(a,b,n=96,rev=false){ const p=[]; for(let i=0;i<=n;i++){const t=i/n*Math.PI*2; p.push(new THREE.Vector2(a*Math.cos(t), (rev?-1:1)*b*Math.sin(t)));} return p; }

// ---------- interaction registry ----------
const interactive = [];
function register(group, card, view=1){
  group.userData.card = card; group.userData.view = view; group.userData.hl = 0;
  group.userData.mats = []; group.traverse(o=>{ o.userData.root = group; if (o.isMesh && !o.material.userData.glow) group.userData.mats.push(o.material); });
  interactive.push(group); scene.add(group); return group;
}
// adds a hit box around what the kit built, then a label above it
function finalize(g, text, labelSize=0.9){
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
  const hit = new THREE.Mesh(new THREE.BoxGeometry(sz.x+0.2,sz.y+0.2,sz.z+0.2), new THREE.MeshBasicMaterial({visible:false})); hit.position.copy(c); g.add(hit);
  const lb = label(text,{size:labelSize}); lb.position.set(c.x, b.max.y+0.7, c.z); g.add(lb);
}

// ---------- ground, ring road, clouds ----------
const ground = new THREE.Mesh(new THREE.CircleGeometry(170,64), mat(KIT.ground,{roughness:1}));
ground.rotation.x = -Math.PI/2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
{ const R = KIT.ring, shape = new THREE.Shape(ell(30,24)); shape.holes.push(new THREE.Path(ell(20,14,96,true)));
  const road = new THREE.Mesh(new THREE.ShapeGeometry(shape,48), mat(R.road,{roughness:1}));
  road.rotation.x = -Math.PI/2; road.position.y = 0.01; road.receiveShadow = true; scene.add(road);
  KIT.env();
  for (let k=0;k<5;k++){ const a=22.2+k*1.6, b=16.2+k*1.6, n=Math.round(a*4);
    for(let i=0;i<n;i+=2){ const t=i/n*Math.PI*2; const d = box(0.7,0.02,0.08,R.dash,a*Math.cos(t),0.03,b*Math.sin(t),{noShadow:true});
      d.rotation.y = Math.atan2(-b*Math.cos(t), -a*Math.sin(t)); scene.add(d);} } }
const clouds = [];
for (let i=0;i<6;i++){ const g = new THREE.Group();
  for (let j=0;j<4;j++){ const s = new THREE.Mesh(new THREE.SphereGeometry(2.4+rnd()*1.8,12,10), new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,emissive:0xffffff,emissiveIntensity:0.35}));
    s.position.set(j*2.6+rnd(),rnd()*0.8,rnd()*1.5); s.scale.y = 0.6; g.add(s); }
  g.position.set(-80+rnd()*160, 34+rnd()*14, -50+rnd()*70); scene.add(g); clouds.push(g); }

// ---------- cards and insights ----------
const OV = D.overall;
function cardFor(slot, it, tag, kind){
  const keys = slot.card || D.card;
  const grid = keys.map(k => [fm(k, it.metrics[k]), (MD[k]||{}).label || k]);
  let ins;
  if (D.notes && D.notes[it.name]) ins = [statusFor(it), pillText(it), D.notes[it.name]];
  else if (H && it.health !== null && it.health !== undefined) {
    const above = H.good === 'low' ? it.health <= OV[H.key] : it.health >= OV[H.key];
    let t = `${H.label} is ${fm(H.key, it.health)} here, ${above ? 'better' : 'worse'} than the ${fm(H.key, OV[H.key])} overall.`;
    if (D.watch) t += ` ${D.watch.label} is ${fm(D.watch.key, it.metrics[D.watch.key])} against ${fm(D.watch.key, OV[D.watch.key])} overall.`;
    ins = [statusFor(it), pillText(it), t];
  } else ins = [null,'',`${it.name} makes up ${(it.share*100).toFixed(0)}% of ${slot.sizeLabel}.`];
  return {tag, name: it.name, sub: `${fmt(it.size, slot.sizeFmt)} ${slot.sizeLabel}`, grid, insight: ins};
}
function statusFor(it){ if (!H || H.mode === 'sequential' || it.health === null || it.health === undefined) return null;
  const g = goodness(it.health); return g < 0 ? 'bad' : g > 0.45 ? 'good' : null; }
function pillText(it){ const s = statusFor(it); return s === 'bad' ? (H.badText || 'Needs attention') : s === 'good' ? (H.goodText || 'Strong') : ''; }
function prep(slot){
  const items = slot.items, max = Math.max(...items.map(i=>i.size)) || 1, tot = items.reduce((a,i)=>a+i.size,0) || 1;
  items.forEach(i=>{ i.size01 = i.size/max; i.share = i.size/tot; i.color = healthColor(i.health); i.tag = healthTag(i.health); i.short = i.short || i.name; });
  return items;
}

// ---------- build the world ----------
const SL = D.slots || {};
const shelfSpots = [[-9.6,-5],[-3.2,-5],[3.2,-5],[9.6,-5],[-9.6,1.2],[-3.2,1.2],[3.2,1.2],[9.6,1.2]];
const fixtures = SL.fixtures ? prep(SL.fixtures).slice(0,8) : [];
fixtures.forEach((it,i)=>{
  const g = KIT.fixture(it);
  finalize(g, it.tag ? `${it.short}  ${it.tag}` : it.short);
  g.position.set(shelfSpots[i][0],0.3,shelfSpots[i][1]);
  register(g, cardFor(SL.fixtures, it, `${W.fixture} · ${SL.fixtures.label}`), 1.3);
});

const terminals = SL.terminals ? prep(SL.terminals).slice(0,4) : [];
if (terminals.length && KIT.terminalBase) KIT.terminalBase();
terminals.forEach((it,i)=>{
  const g = KIT.terminal(it);
  finalize(g, it.short, 0.5);
  g.children[g.children.length-1].position.y += (i%2)*0.6;   // stagger labels so neighbours don't overlap
  g.position.set(5.2+i*1.8, KIT.terminalY ?? 0.3, 5.3);
  register(g, cardFor(SL.terminals, it, `${W.terminal} · ${SL.terminals.label}`), 0.8);
});

{ const g = KIT.landmark(D.title.toUpperCase()), at = KIT.signAt || {x:0,y:3,z:-9.4,s:1};   // default: billboard on the back wall
  g.position.set(at.x,at.y,at.z); g.scale.setScalar(at.s);
  const tot = OV[H ? H.key : Object.keys(OV)[0]];
  const st = D.story;
  register(g,{tag:W.landmark, name:D.title, sub:D.subtitle,
    grid:D.card.map(k=>[fm(k, OV[k]), (MD[k]||{}).label || k]),
    insight: st ? [st.kind||'bad', st.title||'Key finding', st.text] : [null,'',`Overall ${H ? H.label + ' is ' + fm(H.key, tot) : ''}.`]}, 1.8); }

const movers = SL.movers ? prep(SL.movers).slice(0,6) : [];
const maxSpd = Math.max(1, ...movers.map(m=>m.speed ?? m.size));
const moverObjs = movers.map((it,i)=>{
  const g = KIT.mover(it);
  finalize(g, it.tag ? `${it.short}  ${it.tag}` : it.short, 0.75);
  g.userData.van = {a:21.4+i*1.6, b:15.4+i*1.6, th:i*1.05, w:0.04+0.08*((it.speed ?? it.size)/maxSpd), lift:KIT.moverLift||0};
  register(g, cardFor(SL.movers, it, `${W.mover} · ${SL.movers.label}`), 0.9);
  return g;
});

// people
const PAL = ['#4a3aa7','#1baf7a','#eda100','#e87ba4'];
const ZONES = [[-11,2.5,2.8,7.5],[-11,11,-3,-0.8],[-11,11,-8.2,-7.2]];
const walkers = [];
const actorGroups = SL.actors ? SL.actors.items.slice(0,4) : [];
actorGroups.forEach((it,gi)=>{
  const col = PAL[gi], letter = (it.short || it.name).trim().charAt(0).toUpperCase();
  it.color = new THREE.Color(col); it.tag = ''; it.size01 = 1;
  const card = cardFor(SL.actors, Object.assign(it,{share: it.size/(SL.actors.items.reduce((a,x)=>a+x.size,0)||1)}), `${W.actor} · ${SL.actors.label}`);
  for (let k=0;k<it.people;k++){
    const g = KIT.actor ? KIT.actor(col, k) : person(col, {}, k);
    const bb = bubble(letter, col); bb.position.y = 2.15; g.add(bb);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(0.9,2,0.9), new THREE.MeshBasicMaterial({visible:false})); hit.position.y = 1; g.add(hit);
    const z = ZONES[k%3];
    g.position.set(z[0]+rnd()*(z[1]-z[0]), 0.3, z[2]+rnd()*(z[3]-z[2]));
    walkers.push({g, z, tgt:g.position.clone(), sp:0.7+rnd()*0.7, ph:rnd()*6, bubble:bb});
    register(g, card, 0.5);
  }
});

// ---------- HUD ----------
document.title = D.title;
$('hTitle').textContent = D.title; $('hSub').textContent = D.subtitle;
$('kpis').innerHTML = D.kpis.map(k=>`<div class="kpi glass"><b>${fmt(k.value,k.fmt)}</b><span>${k.label}</span></div>`).join('');
{ const hs = [];
  if (H){
    const [lo,mid,hi] = H.range, midPct = H.mode==='sequential' ? 0 : ((mid-lo)/((hi-lo)||1)*100).toFixed(1);
    const worst = H.good === 'low' ? hi : lo, best = H.good === 'low' ? lo : hi;
    const grad = H.mode==='sequential' ? 'linear-gradient(90deg,#cde2fb,#184f95)'
      : H.good === 'low' ? `linear-gradient(90deg,#2a78d6 0%,#bdbcb6 ${midPct}%,#d03b3b 100%)` : `linear-gradient(90deg,#d03b3b 0%,#bdbcb6 ${midPct}%,#2a78d6 100%)`;
    hs.push(`<h3>${W.fixture} and ${W.mover.toLowerCase()} color = ${H.label}</h3><div class="bar" style="background:${grad}"></div>`);
    hs.push(H.mode==='sequential' ? `<div class="scale"><span>${fm(H.key,lo)}</span><span>${fm(H.key,hi)}</span></div>`
      : `<div class="scale"><span>${H.good==='low'?'▲ better':'▼ worse'} ${fm(H.key,lo)}</span><span>${fm(H.key,mid)}</span><span>${H.good==='low'?'▼ worse':'▲ better'} ${fm(H.key,hi)}</span></div>`);
  }
  if (actorGroups.length) hs.push(`<h3>${W.actor} = ${SL.actors.label}</h3><div class="row">${actorGroups.map((a,i)=>`<span><i style="background:${PAL[i]}"></i>${a.name}</span>`).join('')}</div>`);
  const hints = [];
  if (fixtures.length) hints.push(`${W.fixtureHint} = more ${SL.fixtures.sizeLabel}.`);
  if (movers.length) hints.push(`${W.moverHint} = more ${SL.movers.sizeLabel}.`);
  hs.push(`<p>${hints.join(' ')}</p>`);
  $('legend').innerHTML = hs.join(''); }

// ---------- interaction ----------
const picks = []; interactive.forEach(g=>g.traverse(o=>{ if (o.isMesh) picks.push(o); }));
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
const tip = $('tip'), panel = $('panel');
let hover = null, selected = null, fly = null;
const rootAt = e => { mouse.set(e.clientX/innerWidth*2-1, -(e.clientY/innerHeight)*2+1); ray.setFromCamera(mouse,camera);
  const h = ray.intersectObjects(picks,false)[0]; return h ? h.object.userData.root : null; };
renderer.domElement.addEventListener('pointermove', e=>{
  if (e.pointerType==='touch') return;
  hover = rootAt(e); renderer.domElement.style.cursor = hover ? 'pointer' : 'grab';
  if (hover){ tip.style.display='block'; tip.style.left=(e.clientX+14)+'px'; tip.style.top=(e.clientY+14)+'px'; tip.textContent = hover.userData.card.name; }
  else tip.style.display='none';
});
let down = null;
renderer.domElement.addEventListener('pointerdown', e=>{ down=[e.clientX,e.clientY]; controls.autoRotate = false; });
renderer.domElement.addEventListener('pointerup', e=>{
  if (!down || Math.hypot(e.clientX-down[0],e.clientY-down[1])>5) return;
  const r = rootAt(e); if (r) select(r); else if (selected) deselect();
});
$('close').onclick = deselect; $('reset').onclick = deselect;
addEventListener('keydown', e=>{ if (e.key==='Escape') deselect(); });
const wp = new THREE.Vector3();
const focusPoint = (g, out) => { g.getWorldPosition(out); out.y += 1.2*Math.min(1.4,g.userData.view+0.3); return out; };
function select(g){
  selected = g; const c = g.userData.card, [kind, tagline, text] = c.insight;
  $('pTag').textContent = c.tag; $('pName').textContent = c.name; $('pSub').textContent = c.sub;
  $('pGrid').innerHTML = c.grid.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('');
  const pill = $('pPill'); pill.className = kind || ''; pill.textContent = kind ? (kind==='bad' ? '▼ ' : '▲ ') + tagline : '';
  $('pIns').textContent = text;
  panel.classList.add('open'); document.body.classList.add('card');
  const v = g.userData.view;
  fly = {t:0, fromPos:camera.position.clone(), fromTar:controls.target.clone(), off:new THREE.Vector3(6*v+2, 4*v+2, 9*v+3)};
}
function deselect(){
  selected = null; panel.classList.remove('open'); document.body.classList.remove('card');
  fly = {t:0, fromPos:camera.position.clone(), fromTar:controls.target.clone(), home:true};
}
addEventListener('resize', ()=>{ camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
globalThis.__dw3d = {interactive, select, deselect, counts:{fixtures:fixtures.length, terminals:terminals.length, movers:movers.length, people:walkers.length}};

// ---------- loop ----------
const clock = new THREE.Clock(); const ease = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
const lastFocus = new THREE.Vector3(); let haveFocus = false;
renderer.setAnimationLoop(()=>{
  const dt = Math.min(clock.getDelta(),0.05), now = clock.elapsedTime, mv = reduceMotion ? 0 : 1;
  moverObjs.forEach(g=>{ const v = g.userData.van; v.th += v.w*dt*mv;
    g.position.set(v.a*Math.cos(v.th),0.01+v.lift,v.b*Math.sin(v.th)); g.rotation.y = Math.atan2(-v.b*Math.cos(v.th), -v.a*Math.sin(v.th)); });
  walkers.forEach(w=>{
    const d = w.tgt.clone().sub(w.g.position); d.y = 0;
    if (d.length() < 0.15) w.tgt.set(w.z[0]+rnd()*(w.z[1]-w.z[0]), 0.3, w.z[2]+rnd()*(w.z[3]-w.z[2]));
    else { d.normalize(); w.g.position.addScaledVector(d, w.sp*dt*mv); w.g.rotation.y = Math.atan2(d.x,d.z); }
    w.g.userData.body.position.y = 0.85 + Math.abs(Math.sin(now*6*w.sp+w.ph))*0.05*mv;
    w.bubble.position.y = 2.15 + Math.sin(now*2+w.ph)*0.06*mv;
  });
  clouds.forEach(c=>{ c.position.x += dt*0.8*mv; if (c.position.x > 100) c.position.x = -100; });
  tickers.forEach(f=>f(dt, now, mv));
  interactive.forEach(g=>{ const u = g.userData, goal = (g===hover||g===selected) ? 0.35 : 0;
    if (Math.abs(u.hl-goal) > 0.003){ u.hl += (goal-u.hl)*0.2; u.mats.forEach(m=>{ m.emissiveIntensity = u.hl; }); } });
  if (selected){
    focusPoint(selected, wp);
    if (fly && !fly.home){ fly.t = Math.min(1, fly.t+dt/1.1); const e = ease(fly.t);
      controls.target.lerpVectors(fly.fromTar, wp, e); camera.position.lerpVectors(fly.fromPos, wp.clone().add(fly.off), e);
      if (fly.t>=1){ fly = null; lastFocus.copy(wp); haveFocus = true; } }
    else if (haveFocus){ const dl = wp.clone().sub(lastFocus); camera.position.add(dl); controls.target.add(dl); lastFocus.copy(wp); }
  } else haveFocus = false;
  if (fly && fly.home){ fly.t = Math.min(1, fly.t+dt/1.1); const e = ease(fly.t);
    controls.target.lerpVectors(fly.fromTar, HOME.tar, e); camera.position.lerpVectors(fly.fromPos, HOME.pos, e);
    if (fly.t>=1) fly = null; }
  controls.update(); renderer.render(scene, camera);
});
const loadEl = $('load'); loadEl.style.opacity = 0; setTimeout(()=>loadEl.remove(), 700);
