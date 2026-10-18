#!/usr/bin/env node
// Runs the generated page's scene code in Node with a stubbed renderer: builds every object,
// runs frames, opens every card. Catches runtime errors without needing a browser or GPU.
// usage: node smoke_test.mjs world.html
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {execSync} from 'node:child_process';
const file = process.argv[2]; if (!file) { console.error('usage: node smoke_test.mjs world.html'); process.exit(2); }
const dir = path.join(os.tmpdir(), 'dw3d-smoke'); fs.mkdirSync(dir, {recursive: true});
if (!fs.existsSync(path.join(dir, 'node_modules', 'three'))) {
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"dw3d-smoke","private":true,"type":"module"}');
  console.log('installing three@0.160.0 for the smoke test...'); execSync('npm i three@0.160.0 --silent', {cwd: dir, stdio: 'inherit'});
}
const html = fs.readFileSync(file, 'utf8');
let js = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
js = js.replace("import * as THREE from 'three';", "import * as T from 'three'; const THREE = {...T, WebGLRenderer: class { constructor(){ this.domElement=document.createElement('canvas'); this.shadowMap={}; } setPixelRatio(){} setSize(){} setAnimationLoop(f){ globalThis.__loop=f; } render(){} }};")
       .replace("'three/addons/controls/OrbitControls.js'", "'three/examples/jsm/controls/OrbitControls.js'");
fs.writeFileSync(path.join(dir, 'run.mjs'), js);
const mk = () => ({style:{}, classList:{add(){},remove(){}}, children:[], addEventListener(){}, appendChild(){}, remove(){}, set innerHTML(v){}, set textContent(v){},
  getContext: () => new Proxy({}, {get:(t,k)=> k==='measureText' ? ()=>({width:100}) : ()=>({addColorStop(){}}), set:()=>true}), getBoundingClientRect:()=>({})});
const ids = {};
Object.assign(globalThis, {document:{createElement:()=>mk(), getElementById:i=>ids[i]??(ids[i]=mk()), body:mk(), title:''}, window:globalThis,
  devicePixelRatio:1, matchMedia:()=>({matches:false}), addEventListener(){}});
Object.defineProperty(globalThis,'innerWidth',{value:1300}); Object.defineProperty(globalThis,'innerHeight',{value:800});
try {
  await import(path.join(dir, 'run.mjs') + '?t=' + Date.now());
  const w = globalThis.__dw3d, loop = globalThis.__loop;
  for (let i = 0; i < 60; i++) loop();
  for (const g of w.interactive) { w.select(g); for (let i = 0; i < 3; i++) loop(); }
  w.deselect(); for (let i = 0; i < 60; i++) loop();
  console.log('OK', JSON.stringify(w.counts), 'clickable objects:', w.interactive.length);
} catch (e) { console.error('FAIL', e); process.exit(1); }
