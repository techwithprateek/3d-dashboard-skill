// ===== Domain kits =====
// A kit dresses the world for one domain. The plan is linear: SOURCE site (x=-42) - HERO site (x=0, holds fixtures and people)
// - DESTINATION site (x=+42), joined by a road where the movers shuttle back and forth.
// Kit members: sky, ground, road{color,dash}, route{x0,x1}, from, to, words, hero(), source(), dest(), terminalAt{x,z,dx,y},
//   terminalBase(), fixture(item), mover(item), terminal(item), landmark(text), signAt, moverLift, actor(col,k).
// Builders return a THREE.Group with its origin at floor level, centered. Front of movers faces +x.
// item: {name, short, size, size01 (0-1), share, color (THREE.Color, profit/health), tag, metrics}
const signBoard = (text, accent=0x2a78d6) => {
  const g = new THREE.Group();
  g.add(box(0.25,5,0.25,0x8693a8,-3.4,2.5,0), box(0.25,5,0.25,0x8693a8,3.4,2.5,0));
  g.add(box(8,2,0.3,0xffffff,0,5.2,0), box(8,0.18,0.34,accent,0,4.3,0));
  const t = label(text,{size:1.25,bg:'rgba(255,255,255,0)',edge:'rgba(0,0,0,0)',color:'#14202e'}); t.position.set(0,5.3,0.35); g.add(t);
  return g;
};
const wheelSet = (g, xs, zs, r=0.34) => xs.forEach(x => zs.forEach(z => { const w = cyl(r,r,0.22,0x20242c,x,r,z,{seg:14}); w.rotation.x = Math.PI/2; g.add(w); }));
const lights = (g, x, y, z) => g.add(box(0.06,0.2,0.3,0xfff3b0,x,y,z+0.4,{glow:0xffe27a}), box(0.06,0.2,0.3,0xfff3b0,x,y,z-0.4,{glow:0xffe27a}));
const counterBlock = (x, color=0x4a3a2e, top=0xd8c7b0) => { const c = new THREE.Group();
  c.add(box(8,1.1,1.5,color,0,0.55,0), box(8.2,0.1,1.7,top,0,1.15,0)); c.position.set(x,0.3,5.3); scene.add(c); };

const KITS = {

// ---- retail: shops, ecommerce, FMCG, marketplaces ----
retail: {
  sky:['#5fa8e6','#a9d3f2','#dcedf8'], ground:0x86b868, road:{color:0x4c525c, dash:0xf2f2ee}, from:'the warehouse', to:'customers',
  words:{fixture:'Shelf', mover:'Van', terminal:'Dock bay', actor:'Customers', landmark:'Whole store', fixtureHint:'Fuller shelf', moverHint:'Bigger van'},
  hero(){ hall({}); trees(); },
  source(){ warehouse(-42,{doors:[-48.75,-44.25,-39.75,-35.25]}); siteLabel('WAREHOUSE',-42,0,11);
    for (let i=0;i<4;i++) container(-52+i*0.0, 0.75+(i%2)*1.5, -13+(i>1?3.4:0), [0xd03b3b,0x2a78d6,0xeda100,0x1baf7a][i]); },
  dest(){ neighborhood(42,'CUSTOMERS'); },
  terminalAt:{x:-41.75, z:9.5, dx:4.5, y:0.06},
  fixture(it){ const g = new THREE.Group(), n = Math.round(6 + 18*it.size01);
    for (const sx of [-2.05,2.05]) for (const sz of [-0.6,0.6]) g.add(box(0.12,4.1,0.12,0x8693a8,sx,2.0,sz));
    [0.2,1.45,2.7,3.95].forEach(y=>g.add(box(4.3,0.1,1.4,0xaab5c6,0,y,0)));
    const slots = []; for (let l=0;l<3;l++) for (let j=0;j<8;j++) slots.push([l,j]); slots.sort(()=>rnd()-0.5);
    slots.slice(0,n).forEach(([l,j])=>{ const c = it.color.clone().offsetHSL(0,0,(rnd()-0.5)*0.12);
      for (let k=0;k<(rnd()>0.6?2:1);k++) g.add(box(0.46,0.5,0.9,c,-1.8+j*0.51,0.5+l*1.25+k*0.5,0)); });
    g.add(box(4.3,0.7,0.12,it.color,0,4.35,0.65)); return g; },
  mover(it){ const g = new THREE.Group(), s = 0.8+0.5*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(2.2,1.5,1.3,0xf4f6fa,-0.3,1.2,0), box(1.0,1.05,1.25,it.color,1.35,0.95,0), box(0.05,0.55,1.05,0x22304a,1.88,1.15,0,{noShadow:true}), box(2.2,0.28,1.34,it.color,-0.3,0.65,0));
    lights(i,1.88,0.65,0); wheelSet(i,[-1.0,1.3],[-0.65,0.65]); return g; },
  terminal(it){ const g = new THREE.Group(), n = 2+Math.round(it.share*7);
    g.add(box(2.2,0.18,2.0,0x9a7b52,0,0.09,0));
    for (let k=0;k<n;k++) g.add(box(0.7,0.55,0.7,0xc89b5e,-0.7+(k%3)*0.72,0.46+Math.floor(k/9)*0.56,-0.7+Math.floor((k%9)/3)*0.72));
    g.add(box(0.12,0.12,0.12,0x20242c,0,0.2,1.0)); return g; },
  landmark(t){ return signBoard(t); }
},

// ---- datacenter: SaaS, tech, product analytics, IT ops ----
datacenter: {
  sky:['#5f9fe0','#a9cdee','#dbe9f6'], ground:0x8fb078, road:{color:0x3f4752, dash:0x7fd6ee}, from:'the offices', to:'edge sites',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:0.3},
  words:{fixture:'Rack', mover:'Drone', terminal:'Console', actor:'Engineers', landmark:'Whole platform', fixtureHint:'Taller rack', moverHint:'Bigger drone'},
  hero(){ hall({floor:[0xdfe5ea,0xd2dae1], wall:0xe9eef3, band:0x2a78d6, pave:0xcfd6dc});
    for (let i=0;i<3;i++) scene.add(box(2.6,1.4,2,0xaab5c6,-10+i*3.2,0.7,-11.5), cyl(0.7,0.7,0.15,0x5b6678,-10+i*3.2,1.5,-11.5)); trees(); },
  source(){ slab(-42,0,26,18,0xcfd6dc); glassBlock(-48,-2,8,13,7); glassBlock(-38,1,7,9,7); glassBlock(-43,-8,6,6,4); siteLabel('OFFICES',-43,0,17); },
  dest(){ slab(42,0,26,18,0xcfd6dc); mast(37,-3,12); mast(44,3,10); mast(50,-4,13);
    for (let i=0;i<3;i++) scene.add(box(4,2,2.2,0xaab5c6,36+i*6,1,6), box(3.6,0.1,0.1,0x5cc9b6,36+i*6,1.2,7.15,{glow:0x5cc9b6})); siteLabel('EDGE SITES',44,0,16); },
  fixture(it){ const g = new THREE.Group(), h = 2.6+it.size01*1.6;
    for (let r=-1;r<=1;r++){ const x = r*1.35;
      g.add(box(1.2,h,1.0,0x2b3550,x,h/2,0));
      for (let y=0.35;y<h-0.3;y+=0.28) g.add(box(0.9,0.07,0.04,it.color,x,y,0.52,{glow:it.color}));
      g.add(cyl(0.35,0.35,0.06,0x5b6678,x,h+0.03,0,{seg:12})); }
    return g; },
  moverLift:3.2,
  mover(it){ const g = new THREE.Group(), s = 0.9+0.6*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(1.4,0.3,1.2,0xf4f6fa,0,0,0), box(1.42,0.12,1.22,it.color,0,0.05,0), box(0.8,0.6,0.7,0x33415a,0,-0.5,0));
    for (const [x,z] of [[0.8,0.7],[0.8,-0.7],[-0.8,0.7],[-0.8,-0.7]]){ i.add(box(0.1,0.1,0.1,0x5b6678,x*0.8,0.1,z*0.8)); const r = cyl(0.42,0.42,0.04,0x9fe3d6,x,0.2,z,{seg:18,transparent:true,opacity:0.6}); i.add(r); onTick((dt,n)=>{ r.rotation.y = n*30; }); }
    return g; },
  terminal(it){ const g = new THREE.Group(), h = 0.5+it.share*1.0;
    g.add(box(1.5,0.8,0.8,0x8693a8,0,0.4,0), box(1.2,h,0.1,0x1c2440,0,0.8+h/2,-0.1), box(1.1,h*0.85,0.04,0x9fe3d6,0,0.8+h/2,-0.04,{glow:0x5cc9b6})); return g; },
  landmark(t){ return signBoard(t, 0x2a78d6); }
},

// ---- healthcare: hospitals, clinics, pharma, public health ----
healthcare: {
  sky:['#74b4e8','#bcdff4','#e6f3fa'], ground:0x9cc47e, road:{color:0x50565f, dash:0xf2f2ee}, from:'homes', to:'clinics',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:1.5},
  words:{fixture:'Ward bay', mover:'Ambulance', terminal:'Desk', actor:'Patients', landmark:'Whole hospital', fixtureHint:'More beds', moverHint:'Bigger ambulance'},
  hero(){ hall({floor:[0xf1f4f6,0xe4eaee], wall:0xffffff, band:0x14867a, pave:0xe3e8ec});
    scene.add(box(1.8,0.5,0.1,0x14867a,0,4.3,-8.82), box(0.5,1.8,0.1,0x14867a,0,4.3,-8.82)); trees(); },
  source(){ neighborhood(-42,'HOMES'); },
  dest(){ warehouse(42,{w:18,d:10,h:5,wall:0xffffff,roof:0xcfd6dc,band:0x14867a}); scene.add(box(1.8,0.5,0.1,0x14867a,42,3.2,5.1), box(0.5,1.8,0.1,0x14867a,42,3.2,5.1));
    scene.add(cyl(3,3,0.1,0xcfd6dc,52,0.08,-9,{seg:24}), box(2,0.05,0.4,0xffffff,52,0.15,-9), box(0.4,0.05,2,0xffffff,52,0.15,-9)); siteLabel('CLINICS',42,0,9); },
  fixture(it){ const g = new THREE.Group(), n = 1+Math.round(it.size01*3);
    g.add(box(4.2,1.9,0.05,0xbfe3ee,0,1.2,-1.2,{transparent:true,opacity:0.7}));
    for (let b=0;b<n;b++){ const x = (b-(n-1)/2)*1.05;
      g.add(box(0.9,0.5,2.0,0x8693a8,x,0.35,0.1), box(0.88,0.22,1.9,0xffffff,x,0.7,0.1), box(0.9,0.14,1.25,it.color,x,0.86,0.45),
            box(0.6,0.12,0.4,0xffffff,x,0.86,-0.7), box(0.9,0.9,0.08,0x8693a8,x,0.95,-0.9)); }
    g.add(cyl(0.04,0.04,1.6,0x8693a8,2.0,0.8,-0.6), box(0.5,0.35,0.06,0x1c2440,2.0,1.7,-0.6), box(0.4,0.25,0.04,0x6be3a0,2.0,1.7,-0.56,{glow:0x3ec97d})); return g; },
  mover(it){ const g = new THREE.Group(), s = 0.8+0.5*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(2.2,1.6,1.3,0xffffff,-0.3,1.25,0), box(1.0,1.1,1.25,0xffffff,1.35,0.95,0), box(0.05,0.55,1.05,0x22304a,1.88,1.15,0,{noShadow:true}),
          box(2.22,0.3,1.34,it.color,-0.3,0.95,0), box(0.6,0.12,0.04,0x14867a,-0.3,1.6,0.67), box(0.12,0.6,0.04,0x14867a,-0.3,1.6,0.67));
    const bar = box(0.3,0.15,1.0,0xffffff,0.3,2.1,0,{glow:0xff3b30}); i.add(bar); onTick((dt,n)=>{ bar.material.emissiveIntensity = Math.sin(n*10)>0 ? 1 : 0.1; });
    lights(i,1.88,0.65,0); wheelSet(i,[-1.0,1.3],[-0.65,0.65]); return g; },
  terminalBase(){ counterBlock(8, 0xe8edf2, 0xffffff); },
  terminal(it){ const g = new THREE.Group(), h = 0.4+it.share*1.0;
    g.add(box(1.2,0.3,0.8,0xdfe6ee,0,0.15,0), box(0.9,h,0.08,0x1c2440,0,0.3+h/2,-0.1), box(0.8,h*0.85,0.04,0x9fe3d6,0,0.3+h/2,-0.05,{glow:0x5cc9b6})); return g; },
  landmark(t){ const g = signBoard(t, 0x14867a); g.add(box(1.4,0.4,0.2,0x14867a,0,6.7,0), box(0.4,1.4,0.2,0x14867a,0,6.7,0)); return g; }
},

// ---- factory: manufacturing, supply chain, logistics, operations ----
factory: {
  sky:['#6aa6dc','#b2d2ea','#e1eef7'], ground:0x9fae88, road:{color:0x4b5058, dash:0xf2c94c}, from:'suppliers', to:'the port',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:0.3},
  words:{fixture:'Machine', mover:'Truck', terminal:'Line', actor:'Workers', landmark:'Whole plant', fixtureHint:'Taller machine', moverHint:'Bigger truck'},
  hero(){ hall({floor:[0xcfd3d6,0xc3c8cc], wall:0xdfe3e6, band:0xf2a31b, pave:0xc9ccce});
    scene.add(cyl(1.0,1.4,14,0x9aa3ad,13,7,-12), cyl(1.05,1.05,0.8,0xf2a31b,13,13.6,-12)); trees(); },
  source(){ slab(-42,0,28,20,0xcdbf9e); for (const [x,z] of [[-52,-4],[-48,-4],[-52,2],[-48,2]]) silo(x,z,6+((x+z)%3)); 
    for (let i=0;i<3;i++){ const c = new THREE.Mesh(new THREE.ConeGeometry(3,2.6,12), mat(0xb59a6a)); c.position.set(-40+i*4.5,1.3,-3); c.castShadow = true; scene.add(c); }
    for (let i=0;i<3;i++) container(-38+i*4,0.75,5,[0x2a78d6,0xd03b3b,0x1baf7a][i]); siteLabel('SUPPLIERS',-44,0,12); },
  dest(){ warehouse(42,{w:22,d:14,h:6,band:0xf2a31b,doors:[36,42,48]}); crane(54,-12);
    for (let i=0;i<4;i++) for (let r=0;r<2;r++) container(34+i*4.2,0.75+r*1.5,-12,[0x2a78d6,0xd03b3b,0xeda100,0x1baf7a][(i+r)%4]); siteLabel('PORT',42,0,11); },
  fixture(it){ const g = new THREE.Group(), h = 1.4+it.size01*1.6;
    g.add(box(3.6,0.5,2.2,0x33415a,0,0.25,0), box(2.6,h,1.8,0x8b9db5,-0.3,0.5+h/2,0), box(1.2,0.9,0.1,0x1c2440,-0.3,1.0,0.95));
    const arm = new THREE.Group(); arm.position.set(1.0,0.5+h,0); arm.add(cyl(0.16,0.16,1.4,0x5b6678,0,0.7,0), box(1.5,0.2,0.3,0xf2a31b,-0.7,1.4,0)); g.add(arm);
    onTick((dt,n)=>{ arm.rotation.y = Math.sin(n*1.2+it.size01*5)*0.9; });
    g.add(cyl(0.05,0.05,1.0,0x5b6678,1.55,0.5+h+0.5,0.7));
    g.add(cyl(0.2,0.2,0.3,it.color,1.55,0.5+h+1.15,0.7,{glow:it.color}), cyl(0.2,0.2,0.25,0x6b7280,1.55,0.5+h+0.85,0.7)); return g; },
  mover(it){ const g = new THREE.Group(), s = 0.8+0.5*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(1.1,1.3,1.3,0xf2a31b,1.7,1.05,0), box(0.05,0.55,1.05,0x22304a,2.26,1.3,0,{noShadow:true}), box(3.4,1.7,1.4,0xf4f6fa,-0.7,1.4,0), box(3.42,0.3,1.44,it.color,-0.7,0.9,0));
    lights(i,2.26,0.7,0); wheelSet(i,[-1.8,-0.6,1.8],[-0.7,0.7]); return g; },
  terminal(it){ const g = new THREE.Group(), n = 1+Math.round(it.share*8);
    g.add(box(1.6,0.35,0.9,0x33415a,0,0.55,0), box(1.5,0.08,0.7,0x5b6678,0,0.76,0), cyl(0.06,0.06,1.0,0x8693a8,-0.7,0.3,0.4), cyl(0.06,0.06,1.0,0x8693a8,0.7,0.3,0.4));
    for (let k=0;k<Math.min(n,4);k++) g.add(box(0.3,0.25,0.3,0xc89b5e,-0.5+k*0.35,0.93,0)); return g; },
  landmark(t){ return signBoard(t, 0xf2a31b); },
  actor(col,k){ return person(col,{hat:0xffd23f},k); }
},

// ---- city: finance, real estate, telecom, generic business ----
city: {
  signAt:{x:0,y:0,z:10.2,s:0.55},
  sky:['#5aa0e0','#a6cdee','#dbeaf6'], ground:0x8fb572, road:{color:0x454b55, dash:0xf2f2ee}, from:'the suburbs', to:'the harbor',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:0.3},
  words:{fixture:'Tower', mover:'Car', terminal:'Kiosk', actor:'Clients', landmark:'Whole portfolio', fixtureHint:'Taller tower', moverHint:'Bigger car'},
  hero(){ hall({floor:[0xe0ddd5,0xd5d1c8], walls:false, pave:0xd3cfc5});
    for (let i=-1;i<=1;i+=2) scene.add(box(26,0.5,0.8,0xb9b3a4,0,0.55,i*8.8), box(26,0.12,0.9,0x6bb06a,0,0.85,i*8.8)); trees(); },
  source(){ neighborhood(-42,'SUBURBS'); },
  dest(){ slab(42,0,30,20,0xcdd3d8); slab(46,-4,22,12,0x4f9fd6,0.08); crane(36,5); crane(46,5);
    for (let i=0;i<4;i++) for (let r=0;r<2;r++) container(32+i*4.2,0.75+r*1.5,-1.5,[0x2a78d6,0xd03b3b,0xeda100,0x1baf7a][(i+r)%4]); siteLabel('HARBOR',42,0,12); },
  fixture(it){ const g = new THREE.Group(), h = 3+it.size01*8;
    g.add(box(3.4,0.5,2.8,0xc9c4b8,0,0.25,0), box(3.0,h,2.4,0xa9bdd2,0,0.5+h/2,0));
    for (let y=1.0;y<h;y+=0.8) g.add(box(3.04,0.36,2.44,0x2f4560,0,y+0.5,0));
    g.add(box(3.1,0.5,2.5,it.color,0,h+0.75,0), box(1.0,0.5,0.8,0x8693a8,0.6,h+1.25,0)); return g; },
  mover(it){ const g = new THREE.Group(), s = 0.8+0.4*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(2.3,0.6,1.2,it.color,0,0.65,0), box(1.2,0.6,1.1,0xdfe8f2,-0.1,1.2,0), box(0.9,0.12,0.5,0xf2c94c,-0.1,1.55,0));
    lights(i,1.15,0.7,0); wheelSet(i,[-0.75,0.8],[-0.6,0.6],0.3); return g; },
  terminal(it){ const g = new THREE.Group(), h = 1.2+it.share*1.4;
    g.add(box(0.9,h,0.7,0x33415a,0,h/2,0), box(0.7,0.6,0.05,0x9fe3d6,0,h*0.7,0.37,{glow:0x5cc9b6})); return g; },
  landmark(t){ return signBoard(t); }
},

// ---- hospitality: restaurants, cafes, hotels, food delivery ----
hospitality: {
  sky:['#6fb1e6','#bcdcf2','#e8f3fa'], ground:0x90bd6e, road:{color:0x585c66, dash:0xf2f2ee}, route:{x0:-6, x1:35}, from:'the restaurant', to:'customers',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:1.5},
  words:{fixture:'Table', mover:'Scooter', terminal:'Station', actor:'Guests', landmark:'Whole restaurant', fixtureHint:'More plates', moverHint:'Bigger scooter'},
  hero(){ hall({floor:[0xcda67a,0xc29a6c], wall:0xf6ecde, band:0xe5873a, pave:0xe4d9c4}); trees(); },
  source(){ cropField(-46,-2,24,14); scene.add(box(6,4,5,0xb5543c,-34,2,-4), box(6.4,0.5,5.4,0x6b4a33,-34,4.2,-4)); siteLabel('FARMS',-44,0,8); },
  dest(){ neighborhood(42,'CUSTOMERS'); },
  fixture(it){ const g = new THREE.Group(), n = 2+Math.round(it.size01*6);
    g.add(cyl(0.12,0.12,0.8,0x6b4a33,0,0.4,0), cyl(0.9,0.9,0.1,0x6b4a33,0,0.8,0), cyl(1.0,1.0,0.06,it.color,0,0.88,0,{seg:24}));
    for (let k=0;k<n;k++){ const a = k/n*Math.PI*2; g.add(cyl(0.2,0.17,0.05,0xffffff,0.55*Math.cos(a),0.94,0.55*Math.sin(a)), cyl(0.07,0.06,0.1,0xc89b5e,0.3*Math.cos(a+0.4),0.97,0.3*Math.sin(a+0.4))); }
    for (let k=0;k<4;k++){ const a = k*Math.PI/2+0.4; g.add(box(0.5,0.5,0.5,0x8b6b4d,1.5*Math.cos(a),0.25,1.5*Math.sin(a))); } return g; },
  mover(it){ const g = new THREE.Group(), s = 0.9+0.4*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(1.6,0.35,0.5,0x33415a,0,0.55,0), box(0.5,0.9,0.45,0x33415a,0.9,0.9,0), box(0.9,0.9,0.9,it.color,-0.7,1.1,0), box(0.9,0.12,0.92,0xffffff,-0.7,1.6,0));
    i.add(ball(0.2,0xf2c9a0,0.1,1.55,0), box(0.3,0.6,0.35,0xe5873a,0.1,1.1,0));
    lights(i,1.2,0.9,0); wheelSet(i,[-0.7,0.8],[0],0.3); return g; },
  terminalBase(){ counterBlock(8, 0x6b4a33, 0xd8c7b0); },
  terminal(it){ const g = new THREE.Group(), h = 0.4+it.share*0.9;
    g.add(box(1.2,h,0.7,0x8693a8,0,h/2,0), box(0.5,0.35,0.5,0x20242c,0.2,h+0.18,0), cyl(0.12,0.12,0.2,0xffffff,-0.3,h+0.1,0)); return g; },
  landmark(t){ return signBoard(t, 0xe5873a); }
},

// ---- education: schools, universities, edtech, training ----
education: {
  sky:['#6bb1ea','#b9dcf4','#e6f3fb'], ground:0x8dc06d, road:{color:0x555a63, dash:0xf2f2ee}, route:{x0:-35, x1:-8}, from:'homes', to:'school',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:0.3},
  words:{fixture:'Classroom', mover:'Bus', terminal:'Desk', actor:'Students', landmark:'Whole campus', fixtureHint:'More desks', moverHint:'Bigger bus'},
  hero(){ hall({floor:[0xe8dfc8,0xddd2b8], wall:0xe7c38a, band:0x3a6ea5, pave:0xe0d8c4}); trees(); },
  source(){ neighborhood(-42,'HOMES'); },
  dest(){ slab(42,0,28,18,0x6fae4a,0.04); slab(42,0,26,16,0x7cbb55,0.05);
    for (const dx of [-12.4,12.4]) { scene.add(box(0.2,2,3,0xffffff,42+dx,1,0)); }
    slab(42,0,0.15,16,0xffffff,0.07); slab(42,0,26,0.15,0xffffff,0.07); siteLabel('SPORTS FIELD',42,0,8); },
  fixture(it){ const g = new THREE.Group(), n = 2+Math.round(it.size01*4);
    g.add(box(4.0,1.4,0.1,0x2f5a45,0,1.6,-1.2), box(4.0,0.2,0.12,it.color,0,2.4,-1.2));
    for (let k=0;k<n;k++){ const x = ((k%3)-1)*1.3, z = Math.floor(k/3)*1.0-0.2;
      g.add(box(0.9,0.06,0.6,0xc89b5e,x,0.7,z), box(0.06,0.7,0.06,0x8693a8,x-0.4,0.35,z-0.25), box(0.06,0.7,0.06,0x8693a8,x+0.4,0.35,z+0.25), box(0.4,0.4,0.4,0x3a6ea5,x,0.3,z+0.55)); } return g; },
  mover(it){ const g = new THREE.Group(), s = 0.8+0.5*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(3.6,1.5,1.3,0xf2c230,0,1.2,0), box(3.62,0.3,1.34,it.color,0,0.85,0), box(3.0,0.45,1.34,0x22304a,0,1.55,0,{noShadow:true}), box(0.05,0.6,1.1,0x22304a,1.82,1.4,0,{noShadow:true}));
    lights(i,1.82,0.7,0); wheelSet(i,[-1.1,1.2],[-0.65,0.65]); return g; },
  terminal(it){ const g = new THREE.Group(), n = 1+Math.round(it.share*4);
    g.add(box(1.4,0.7,0.8,0xc89b5e,0,0.35,0)); const cs = [0xd03b3b,0x2a78d6,0x1baf7a,0xeda100];
    for (let k=0;k<n;k++) g.add(box(0.3,0.12,0.4,cs[k%4],-0.4+k*0.05,0.76+k*0.12,0)); return g; },
  landmark(t){ return signBoard(t, 0x3a6ea5); }
},

// ---- energy: utilities, climate, agriculture, outdoor sites ----
energy: {
  signAt:{x:0,y:0,z:10.2,s:0.55},
  sky:['#4f9fe0','#9fcdef','#d6e9f6'], ground:0xa0c47a, road:{color:0x6b665d, dash:0xe9e4d6}, from:'the solar field', to:'town',
  terminalAt:{x:5.2, z:5.3, dx:1.8, y:0.3},
  words:{fixture:'Turbine', mover:'Truck', terminal:'Transformer', actor:'Technicians', landmark:'Whole site', fixtureHint:'Taller turbine', moverHint:'Bigger truck'},
  hero(){ hall({floor:[0xc9c4b8,0xbdb8ac], walls:false, pave:0xcfc9bb});
    for (const x of [-110,-60,70,120]) { const m = new THREE.Mesh(new THREE.ConeGeometry(34,16,12), mat(0x7fa86a,{roughness:1})); m.position.set(x,6,-90); scene.add(m); }
    for (let x=-45;x<=45;x+=15) pylon(x,-16); wires(-45,45,-16); trees(14); },
  source(){ slab(-42,0,30,20,0xb9c79a); for (let r=0;r<4;r++) solarRow(-52,-7+r*4.6,7); siteLabel('SOLAR FIELD',-42,0,8); },
  dest(){ neighborhood(42,'TOWN'); },
  fixture(it){ const g = new THREE.Group(), h = 4+it.size01*4;
    g.add(cyl(0.9,1.0,0.3,0xcfd4da,0,0.15,0), cyl(0.12,0.3,h,0xf4f6fa,0,h/2,0), box(0.55,0.5,1.0,it.color,0,h+0.1,0.1));
    const rotor = new THREE.Group(); rotor.position.set(0,h+0.1,0.7); rotor.add(cyl(0.18,0.18,0.3,0xf4f6fa,0,0,0.05));
    for (let b=0;b<3;b++){ const arm = new THREE.Group(); arm.rotation.z = b*Math.PI*2/3; arm.add(box(0.14,2.0,0.04,0xf4f6fa,0,1.1,0)); rotor.add(arm); }
    g.add(rotor);
    rotor.children[0].rotation.x = Math.PI/2;
    onTick((dt,n)=>{ rotor.rotation.z = n*(0.6+it.size01*1.2); }); return g; },
  mover(it){ const g = new THREE.Group(), s = 0.8+0.5*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(1.1,1.2,1.3,0xf4f6fa,1.3,1.0,0), box(0.05,0.5,1.05,0x22304a,1.86,1.2,0,{noShadow:true}), box(2.0,0.5,1.4,0xf2a31b,-0.5,0.85,0), box(2.02,0.18,1.44,it.color,-0.5,1.15,0));
    lights(i,1.86,0.65,0); wheelSet(i,[-1.0,1.3],[-0.65,0.65]); return g; },
  terminal(it){ const g = new THREE.Group(), h = 0.9+it.share*1.2;
    g.add(box(1.3,h,0.9,0x8693a8,0,h/2,0)); for (const x of [-0.4,0,0.4]) g.add(cyl(0.07,0.1,0.4,0xe8edf2,x,h+0.2,0,{seg:10})); return g; },
  landmark(t){ return signBoard(t, 0x1baf7a); },
  actor(col,k){ return person(col,{hat:0xffffff},k); }
}

};
