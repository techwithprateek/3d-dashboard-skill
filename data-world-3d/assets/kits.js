// ===== Domain kits =====
// A kit dresses the same world plan (hall + ring road + people) with props from one domain.
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
  sky:['#5fa8e6','#a9d3f2','#dcedf8'], ground:0x86b868, ring:{road:0x4c525c, dash:0xf2f2ee},
  words:{fixture:'Shelf', mover:'Van', terminal:'Desk', actor:'Customers', landmark:'Whole store', fixtureHint:'Fuller shelf', moverHint:'Bigger van'},
  env(){ hall({}); trees(); },
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
  terminalBase(){ counterBlock(8); }, terminalY:1.5,
  terminal(it){ const g = new THREE.Group(), h = 0.5+it.share*1.4;
    g.add(box(1.3,h,0.9,0x33415a,0,h/2,0), box(1.1,h*0.6,0.06,0x9fe3d6,0,h*0.55,0.48,{glow:0x5cc9b6})); return g; },
  landmark(t){ return signBoard(t); }
},

// ---- datacenter: SaaS, tech, product analytics, IT ops ----
datacenter: {
  sky:['#5f9fe0','#a9cdee','#dbe9f6'], ground:0x8fb078, ring:{road:0x3f4752, dash:0x7fd6ee},
  words:{fixture:'Rack', mover:'Drone', terminal:'Console', actor:'Engineers', landmark:'Whole platform', fixtureHint:'Taller rack', moverHint:'Bigger drone'},
  env(){ hall({floor:[0xdfe5ea,0xd2dae1], wall:0xe9eef3, band:0x2a78d6, pave:0xcfd6dc});
    for (let i=0;i<3;i++) scene.add(box(2.6,1.4,2,0xaab5c6,-10+i*3.2,0.7,-11.5), cyl(0.7,0.7,0.15,0x5b6678,-10+i*3.2,1.5,-11.5)); trees(12); },
  fixture(it){ const g = new THREE.Group(), h = 2.6+it.size01*1.6;
    for (let r=-1;r<=1;r++){ const x = r*1.35;
      g.add(box(1.2,h,1.0,0x2b3550,x,h/2,0));
      for (let y=0.35;y<h-0.3;y+=0.28) g.add(box(0.9,0.07,0.04,it.color,x,y,0.52,{glow:it.color}));
      g.add(cyl(0.35,0.35,0.06,0x5b6678,x,h+0.03,0,{seg:12})); }
    return g; },
  moverLift:2.4,
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
  sky:['#74b4e8','#bcdff4','#e6f3fa'], ground:0x9cc47e, ring:{road:0x50565f, dash:0xf2f2ee},
  words:{fixture:'Ward bay', mover:'Ambulance', terminal:'Desk', actor:'Patients', landmark:'Whole hospital', fixtureHint:'More beds', moverHint:'Bigger ambulance'},
  env(){ hall({floor:[0xf1f4f6,0xe4eaee], wall:0xffffff, band:0x14867a, pave:0xe3e8ec});
    scene.add(box(1.8,0.5,0.1,0x14867a,0,4.3,-8.82), box(0.5,1.8,0.1,0x14867a,0,4.3,-8.82)); trees(12); },
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
  terminalBase(){ counterBlock(8, 0xe8edf2, 0xffffff); }, terminalY:1.5,
  terminal(it){ const g = new THREE.Group(), h = 0.4+it.share*1.0;
    g.add(box(1.2,0.3,0.8,0xdfe6ee,0,0.15,0), box(0.9,h,0.08,0x1c2440,0,0.3+h/2,-0.1), box(0.8,h*0.85,0.04,0x9fe3d6,0,0.3+h/2,-0.05,{glow:0x5cc9b6})); return g; },
  landmark(t){ const g = signBoard(t, 0x14867a); g.add(box(1.4,0.4,0.2,0x14867a,0,6.7,0), box(0.4,1.4,0.2,0x14867a,0,6.7,0)); return g; }
},

// ---- factory: manufacturing, supply chain, logistics, operations ----
factory: {
  sky:['#6aa6dc','#b2d2ea','#e1eef7'], ground:0x9fae88, ring:{road:0x4b5058, dash:0xf2c94c},
  words:{fixture:'Machine', mover:'Truck', terminal:'Line', actor:'Workers', landmark:'Whole plant', fixtureHint:'Taller machine', moverHint:'Bigger truck'},
  env(){ hall({floor:[0xcfd3d6,0xc3c8cc], wall:0xdfe3e6, band:0xf2a31b, pave:0xc9ccce});
    scene.add(cyl(1.0,1.4,14,0x9aa3ad,13,7,-12), cyl(1.05,1.05,0.8,0xf2a31b,13,13.6,-12)); trees(10); },
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
  sky:['#5aa0e0','#a6cdee','#dbeaf6'], ground:0x8fb572, ring:{road:0x454b55, dash:0xf2f2ee},
  words:{fixture:'Tower', mover:'Car', terminal:'Kiosk', actor:'Clients', landmark:'Whole portfolio', fixtureHint:'Taller tower', moverHint:'Bigger car'},
  env(){ hall({floor:[0xe0ddd5,0xd5d1c8], walls:false, pave:0xd3cfc5});
    for (let i=-1;i<=1;i+=2) scene.add(box(26,0.5,0.8,0xb9b3a4,0,0.55,i*8.8), box(26,0.12,0.9,0x6bb06a,0,0.85,i*8.8)); trees(30); },
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
  sky:['#6fb1e6','#bcdcf2','#e8f3fa'], ground:0x90bd6e, ring:{road:0x585c66, dash:0xf2f2ee},
  words:{fixture:'Table', mover:'Scooter', terminal:'Station', actor:'Guests', landmark:'Whole restaurant', fixtureHint:'More plates', moverHint:'Bigger scooter'},
  env(){ hall({floor:[0xcda67a,0xc29a6c], wall:0xf6ecde, band:0xe5873a, pave:0xe4d9c4}); trees(); },
  fixture(it){ const g = new THREE.Group(), n = 2+Math.round(it.size01*6);
    g.add(cyl(0.12,0.12,0.8,0x6b4a33,0,0.4,0), cyl(0.9,0.9,0.1,0x6b4a33,0,0.8,0), cyl(1.0,1.0,0.06,it.color,0,0.88,0,{seg:24}));
    for (let k=0;k<n;k++){ const a = k/n*Math.PI*2; g.add(cyl(0.2,0.17,0.05,0xffffff,0.55*Math.cos(a),0.94,0.55*Math.sin(a)), cyl(0.07,0.06,0.1,0xc89b5e,0.3*Math.cos(a+0.4),0.97,0.3*Math.sin(a+0.4))); }
    for (let k=0;k<4;k++){ const a = k*Math.PI/2+0.4; g.add(box(0.5,0.5,0.5,0x8b6b4d,1.5*Math.cos(a),0.25,1.5*Math.sin(a))); } return g; },
  mover(it){ const g = new THREE.Group(), s = 0.9+0.4*it.size01, i = new THREE.Group(); i.scale.setScalar(s); g.add(i);
    i.add(box(1.6,0.35,0.5,0x33415a,0,0.55,0), box(0.5,0.9,0.45,0x33415a,0.9,0.9,0), box(0.9,0.9,0.9,it.color,-0.7,1.1,0), box(0.9,0.12,0.92,0xffffff,-0.7,1.6,0));
    i.add(ball(0.2,0xf2c9a0,0.1,1.55,0), box(0.3,0.6,0.35,0xe5873a,0.1,1.1,0));
    lights(i,1.2,0.9,0); wheelSet(i,[-0.7,0.8],[0],0.3); return g; },
  terminalBase(){ counterBlock(8, 0x6b4a33, 0xd8c7b0); }, terminalY:1.5,
  terminal(it){ const g = new THREE.Group(), h = 0.4+it.share*0.9;
    g.add(box(1.2,h,0.7,0x8693a8,0,h/2,0), box(0.5,0.35,0.5,0x20242c,0.2,h+0.18,0), cyl(0.12,0.12,0.2,0xffffff,-0.3,h+0.1,0)); return g; },
  landmark(t){ return signBoard(t, 0xe5873a); }
},

// ---- education: schools, universities, edtech, training ----
education: {
  sky:['#6bb1ea','#b9dcf4','#e6f3fb'], ground:0x8dc06d, ring:{road:0x555a63, dash:0xf2f2ee},
  words:{fixture:'Classroom', mover:'Bus', terminal:'Desk', actor:'Students', landmark:'Whole campus', fixtureHint:'More desks', moverHint:'Bigger bus'},
  env(){ hall({floor:[0xe8dfc8,0xddd2b8], wall:0xe7c38a, band:0x3a6ea5, pave:0xe0d8c4}); trees(24); },
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
  sky:['#4f9fe0','#9fcdef','#d6e9f6'], ground:0xa0c47a, ring:{road:0x6b665d, dash:0xe9e4d6},
  words:{fixture:'Turbine', mover:'Truck', terminal:'Transformer', actor:'Technicians', landmark:'Whole site', fixtureHint:'Taller turbine', moverHint:'Bigger truck'},
  env(){ hall({floor:[0xc9c4b8,0xbdb8ac], walls:false, pave:0xcfc9bb});
    for (const x of [-70,-40,60,85]) { const m = new THREE.Mesh(new THREE.ConeGeometry(28,14,12), mat(0x7fa86a,{roughness:1})); m.position.set(x,6,-75); scene.add(m); } trees(8); },
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
