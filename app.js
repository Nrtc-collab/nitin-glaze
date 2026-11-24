import * as THREE from 'three';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { RoomEnvironment } from './RoomEnvironment.js';

/* ---------- shades & data ---------- */
const SHADES = [
  { id: 'petal-hush', name: 'Petal Hush', sub: 'Soft pink', hex: '#F58FAA', liquid: '#F0628A', cat: 'pink' },
  { id: 'nude-silk', name: 'Nude Silk', sub: 'Warm nude', hex: '#E2A086', liquid: '#CF8466', cat: 'nude' },
  { id: 'rose-ember', name: 'Rose Ember', sub: 'Rose coral', hex: '#E2475B', liquid: '#D81B3C', cat: 'rose' },
  { id: 'blush-veil', name: 'Blush Veil', sub: 'Sheer blush', hex: '#F7B3BE', liquid: '#F3929F', cat: 'nude' },
  { id: 'sorbet-haze', name: 'Sorbet Haze', sub: 'Peach coral', hex: '#FF8A78', liquid: '#FF6A55', cat: 'rose' },
  { id: 'mauve-mirage', name: 'Mauve Mirage', sub: 'Dusty mauve', hex: '#C875A3', liquid: '#B9468A', cat: 'pink' },
  { id: 'peony-pop', name: 'Peony Pop', sub: 'Bright pink', hex: '#F5559A', liquid: '#F01E78', cat: 'bold' },
  { id: 'cocoa-satin', name: 'Cocoa Satin', sub: 'Mocha nude', hex: '#A86450', liquid: '#9C4A2C', cat: 'nude' },
  { id: 'berry-noir', name: 'Berry Noir', sub: 'Deep berry', hex: '#A3214F', liquid: '#8C0B3D', cat: 'bold' },
  { id: 'coral-kiss', name: 'Coral Kiss', sub: 'Summer coral', hex: '#FF6F5E', liquid: '#FF4634', cat: 'bold' },
  { id: 'milk-glass', name: 'Milk Glass', sub: 'Milky white', hex: '#F4ECEA', liquid: '#F1E8E6', cat: 'nude' },
  { id: 'clear-glaze', name: 'Clear Glaze', sub: 'Gloss top coat', hex: '#F3EAEC', liquid: '#F6EEF0', cat: 'top', clear: true },
];
const S = Object.fromEntries(SHADES.map(s => [s.id, s]));
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (p, a, b) => clamp((p - a) / (b - a));

/* ---------- fit 1440 canvas to the screen ---------- */
let Z = 1;
function fit() {
  Z = window.innerWidth / 1440; // fills every screen width (scales up on wide monitors too)
  document.documentElement.style.setProperty('--z', Z);
  document.documentElement.style.setProperty('--vh', (window.innerHeight / Z) + 'px');
}
fit();
addEventListener('resize', fit);

/* ---------- build repeated UI ---------- */
const BEST = [['BESTSELLER', 'petal-hush', 'Soft petal pink · Crème gloss', 'b29'], ['NEW', 'nude-silk', 'Warm nude · Satin gloss', 'b16'], ['FAN FAVOURITE', 'rose-ember', 'Deep rose coral · High gloss', 'b14']];
$('#cards').innerHTML = BEST.map(([tag, id, meta, img], i) => `<div class="card rv tilt" style="transition-delay:${i * .12}s"><div class="ph"><img src="${img}.jpg" alt=""><div class="view" id="v-best${i}"></div><span class="tag">${tag}</span></div>
<div class="row"><div><h3>${S[id].name}</h3><div class="meta">${meta}</div></div><div class="price">₹549</div></div>
<div class="add"><span>ADD TO BAG</span><div class="dots">${['petal-hush', 'nude-silk', 'rose-ember'].map(d => `<i data-card="${i}" data-s="${d}" class="${d === id ? 'on' : ''}" style="background:${S[d].hex}"></i>`).join('')}</div></div></div>`).join('');
const PICK = ['petal-hush', 'blush-veil', 'nude-silk', 'rose-ember', 'sorbet-haze', 'mauve-mirage', 'peony-pop', 'cocoa-satin', 'berry-noir'];
$('#picker').innerHTML = PICK.map((id, i) => `<i data-s="${id}" title="${S[id].name}" class="${i ? '' : 'on'}" style="background:${S[id].hex}"></i>`).join('');
$('#swg').innerHTML = SHADES.map((s, i) => `<div class="sw rv tilt" data-cat="${s.cat}" style="transition-delay:${(i % 6) * .06}s"><div class="view" id="v-sw${i}"></div><h5>${s.name}</h5><small>${s.sub}</small><div class="try"><span>Try on</span><span>Shop</span></div></div>`).join('');
$('#free').innerHTML = ['Formaldehyde', 'Toluene', 'DBP', 'Formaldehyde resin', 'Camphor', 'TPHP', 'Xylene', 'Parabens', 'Ethyl tosylamide', 'Animal ingredients'].map((w, i) => `<div style="transition-delay:${.2 + i * .07}s">${w}</div>`).join('');
const IG = ['b04', 'b26', 'b21', 'b06', 'b11', 'b15', 'b07', 'b20'];
$('#flow').innerHTML = IG.map(b => `<div class="it"><img src="${b}.jpg" alt=""></div>`).join('');

/* ---------- reveal, videos, counters ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 });
$$('.rv').forEach(el => io.observe(el));
io.observe($('#free'));
const vio = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) { if (!v.src && v.dataset.src) { v.src = v.dataset.src; } v.play().catch(() => {}); }
  else v.pause();
}), { rootMargin: '200px 0px' });
$$('video[data-src]').forEach(v => { if (v.id !== 'strokeVid') vio.observe(v); });
const bio = new IntersectionObserver(es => es.forEach(e => { $$('#days .bar i').forEach(i => i.style.width = e.isIntersecting ? i.dataset.w + '%' : '0%'); }), { threshold: .3 });
bio.observe($('#days'));
const sio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  $$('#stats b').forEach(b => { const n = +b.dataset.n, s = b.dataset.s || ''; const t0 = performance.now(); const tick = t => { const k = clamp((t - t0) / 1600); b.textContent = Math.round(n * ease(k)) + s; if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
}), { threshold: .4 });
sio.observe($('#stats'));

// hover tilt for cards
$$('.tilt').forEach(el => {
  el.addEventListener('pointermove', e => { if (!el.classList.contains('in')) return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`; });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});
// nav
$$('[data-go]').forEach(b => b.addEventListener('click', () => { const t = document.getElementById(b.dataset.go); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 20, behavior: 'smooth' }); }));
// coverflow
let flowI = 0;
function flowLayout() {
  const its = $$('#flow .it'); const n = its.length;
  its.forEach((it, i) => { let d = ((i - flowI) % n + n) % n; if (d > n / 2) d -= n; const a = Math.abs(d);
    it.style.transform = `translateX(${d * 235}px) translateZ(${-a * 160}px) rotateY(${-d * 28}deg)`; it.style.opacity = a > 3 ? 0 : 1; it.style.zIndex = 10 - a; it.style.filter = `brightness(${1 - a * .08})`; });
}
flowLayout(); setInterval(() => { flowI++; flowLayout(); }, 2600);
// chips filter
$('#chips').addEventListener('click', e => { const c = e.target.dataset.c; if (!c) return; $$('#chips span').forEach(s => s.classList.toggle('on', s === e.target)); $$('#swg .sw').forEach(s => s.classList.toggle('dim', c !== 'all' && s.dataset.cat !== c)); });
// join form
$('#jform').addEventListener('submit', e => { e.preventDefault(); $('#thanks').textContent = 'Welcome to the glow. Your 10% code: GLAZE10'; burst && burst(); });

/* ---------- auto-play helpers ---------- */
const seen = new WeakMap();
const vis = new IntersectionObserver(es => es.forEach(e => seen.set(e.target, e.isIntersecting)), { threshold: .15 });
const watch = el => { if (el) vis.observe(el); return el; };
const onScreen = el => !!seen.get(el);
const touched = {}; // section -> last user interaction time
function markUser(el, key) { el && ['pointerdown'].forEach(ev => el.addEventListener(ev, e => { if (e.isTrusted) touched[key] = performance.now(); })); }
const idle = (key, ms) => performance.now() - (touched[key] || -1e9) > ms;

/* ---------- three.js ---------- */
const canvas = $('#gl');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-gl'); }
let burst = null;
if (renderer) startGL();

function startGL() {
  const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = (() => {
    const sc = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5b5052'), side: THREE.BackSide })); room.position.y = 4; sc.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color('#d9c4c2') })); floor.rotation.x = -Math.PI / 2; floor.position.y = -4.9; sc.add(floor);
    const box = (w, h, x, y, z, ry, rx, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); sc.add(m); };
    box(10, 4, 0, 12.5, 0, 0, Math.PI / 2, new THREE.Color(6, 6, 6));          // top softbox
    box(2.2, 12, -14.5, 3, 2, Math.PI / 2, 0, new THREE.Color(9, 9, 9));       // left strip
    box(2.2, 12, 14.5, 3, -2, -Math.PI / 2, 0, new THREE.Color(7, 6.6, 6.6));  // right strip
    box(14, 6, 0, 2, -14.5, 0, 0, new THREE.Color(2.2, 1.6, 1.7));             // warm back fill
    box(8, 5, 4, 3, 14.5, Math.PI, 0, new THREE.Color(3, 3, 3));               // front key
    const t = pmrem.fromScene(sc, 0.02).texture; return t;
  })();

  function size() { renderer.setSize(window.innerWidth, window.innerHeight, false); }
  size(); addEventListener('resize', size);

  /* shared textures */
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(90,40,48,.55)'); gr.addColorStop(.45, 'rgba(90,40,48,.22)'); gr.addColorStop(1, 'rgba(90,40,48,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  // ---- brand printing: silk-screened front label + gold-foil cap mark ----
  function monogram(g, cx, cy, r, col, lw) {
    g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, cy, r * .84, 0, Math.PI * 2); g.lineWidth = lw * .45; g.stroke();
    g.font = `italic 500 ${r * 1.02}px "Cormorant Garamond", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '0px';
    g.fillText('N', cx - r * .2, cy - r * .04); g.fillText('G', cx + r * .24, cy + r * .1);
    // tiny drop under the monogram
    g.beginPath(); g.moveTo(cx, cy + r + r * .16); g.bezierCurveTo(cx + r * .1, cy + r + r * .3, cx + r * .07, cy + r + r * .42, cx, cy + r + r * .42); g.bezierCurveTo(cx - r * .07, cy + r + r * .42, cx - r * .1, cy + r + r * .3, cx, cy + r + r * .16); g.fill();
    g.restore();
  }
  function labelTex(name, dark) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 900; const g = c.getContext('2d');
    const ink = dark ? 'rgba(58,22,30,.95)' : 'rgba(255,255,255,1)';
    g.fillStyle = ink; g.strokeStyle = ink; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.shadowColor = dark ? 'transparent' : 'rgba(80,25,35,.45)'; g.shadowBlur = 6;
    monogram(g, 512, 160, 108, ink, 9);
    g.font = '600 118px "Jost", sans-serif'; g.letterSpacing = '26px'; g.fillText('NITIN', 525, 425);
    g.font = '400 54px "Jost", sans-serif'; g.letterSpacing = '40px'; g.fillText('GLAZE', 532, 500);
    g.lineWidth = 4; g.beginPath(); g.moveTo(300, 548); g.lineTo(724, 548); g.stroke();
    g.font = 'italic 500 120px "Cormorant Garamond", serif'; g.letterSpacing = '0px'; g.fillText(name, 512, 680);
    g.font = '500 34px "Jost", sans-serif'; g.letterSpacing = '10px'; g.globalAlpha = .9;
    g.fillText('No. ' + String(SHADES.findIndex(s => s.name === name) + 1).padStart(2, '0') + ' · 12 ML · 10-FREE', 518, 790);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function sideTex(dark) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 1024; const g = c.getContext('2d');
    g.fillStyle = dark ? 'rgba(58,22,30,.9)' : 'rgba(255,255,255,.95)'; g.shadowColor = dark ? 'transparent' : 'rgba(80,25,35,.4)'; g.shadowBlur = 5;
    g.translate(128, 512); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '600 70px "Jost", sans-serif'; g.letterSpacing = '22px'; g.fillText('NITIN GLAZE', 10, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function capTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d');
    const gold = g.createLinearGradient(0, 0, 512, 0); gold.addColorStop(0, '#B08A4E'); gold.addColorStop(.4, '#FBE7B5'); gold.addColorStop(.6, '#E0BC7A'); gold.addColorStop(1, '#A98245');
    monogram(g, 256, 250, 140, gold, 12);
    g.save(); g.translate(256, 700); g.rotate(-Math.PI / 2); g.fillStyle = gold; g.font = '600 66px "Jost", sans-serif'; g.letterSpacing = '20px'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GLAZE', 10, 0); g.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  let capMarkMat = null; const allBottles = [];
  /* lacquer material with swirl colour change + sparkle */
  function lacquerMat(hex) {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .12, clearcoat: 1, clearcoatRoughness: .03, envMap: env, envMapIntensity: .8 });
    const u = { uA: { value: new THREE.Color(hex) }, uB: { value: new THREE.Color(hex) }, uMix: { value: 0 }, uTime: { value: 0 }, uSpark: { value: 0 }, uGlow: { value: .16 } };
    m.userData.u = u;
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = 'varying vec3 vP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vP = position;');
      sh.fragmentShader = 'varying vec3 vP; uniform vec3 uA; uniform vec3 uB; uniform float uMix; uniform float uTime; uniform float uSpark; uniform float uGlow;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 p=vP; float r=length(p.xz)/0.7; float a=atan(p.z,p.x);
          float n=sin(p.x*7.+uTime*.9)*sin(p.y*6.-uTime*1.1)*sin(p.z*7.+uTime*.6);
          float s=r*.75+fract(a/6.28318+p.y*.35+uTime*.05)*.35+n*.12;
          float m=1.0-smoothstep(uMix*1.7-.14,uMix*1.7,s);
          diffuseColor.rgb=mix(uA,uB,m); }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 q=floor(vP*230.); float h=fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);
          float tw=pow(.5+.5*sin(uTime*2.6+h*60.),3.); totalEmissiveRadiance+=vec3(1.,.9,.86)*step(.991,h)*tw*uSpark*1.8; }
        totalEmissiveRadiance+=diffuseColor.rgb*diffuseColor.rgb*uGlow; // inner colour bloom, keeps lacquer juicy under glass`);
    };
    m.customProgramCacheKey = () => 'lacquer';
    return m;
  }
  function setShade(mat, hex, instant) {
    const u = mat.userData.u;
    if (instant) { u.uA.value.set(hex); u.uB.value.set(hex); u.uMix.value = 0; mat.userData.anim = null; return; }
    // finish any running blend
    if (mat.userData.anim) u.uA.value.copy(u.uB.value);
    u.uB.value.set(hex); u.uMix.value = 0; mat.userData.anim = { t0: performance.now(), d: 1500 };
  }
  function stepMat(mat, now) {
    const u = mat.userData.u; u.uTime.value = now / 1000;
    const a = mat.userData.anim; if (!a) return;
    const k = clamp((now - a.t0) / a.d); u.uMix.value = ease(k);
    if (k >= 1) { u.uA.value.copy(u.uB.value); u.uMix.value = 0; mat.userData.anim = null; }
  }

  /* bottle */
  const G = {
    body: new RoundedBoxGeometry(1.5, 1.45, 1.5, 6, .3),
    liquid: new RoundedBoxGeometry(1.26, 1.16, 1.26, 5, .2),
    neck: new THREE.CylinderGeometry(.27, .31, .16, 48),
    cap: new THREE.CylinderGeometry(.34, .34, 1.32, 64),
    capTop: new THREE.SphereGeometry(.34, 48, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    stem: new THREE.CylinderGeometry(.045, .05, 1.1, 16),
    bristle: (() => { const g = new THREE.CylinderGeometry(.075, .16, .44, 32, 4); g.scale(1, 1, .36); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < -.15) { const x = p.getX(i); p.setY(i, y - .05 * (1 - Math.pow(x / .16, 2))); } } g.computeVertexNormals(); return g; })(),
    label: new THREE.PlaneGeometry(.98, .86),
    side: new THREE.PlaneGeometry(.21, .84),
    capMark: new THREE.CylinderGeometry(.3415, .3415, .9, 40, 1, true, -.55, 1.1),
    capRing: new THREE.CylinderGeometry(.352, .352, .05, 64),
    shadow: new THREE.PlaneGeometry(3.4, 3.4),
  };
  const goldMat = new THREE.MeshPhysicalMaterial({ color: '#D6B276', metalness: 1, roughness: .2, envMap: env, envMapIntensity: 1.3 });
  const capMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0a0a, roughness: .2, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, envMap: env, envMapIntensity: 1.1 });
  function glassMat(hq) {
    return hq ? new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .03, metalness: 0, transmission: 1, thickness: .55, ior: 1.5, envMap: env, envMapIntensity: 1.15, clearcoat: 1, clearcoatRoughness: .02, specularIntensity: 1, attenuationColor: new THREE.Color('#fff6f7'), attenuationDistance: 3 })
      : new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, transparent: true, opacity: .2, envMap: env, envMapIntensity: 1.6, clearcoat: 1, depthWrite: false });
  }
  class Bottle {
    constructor(shadeId, { hq = true, label = true, cap = true, shadow = true } = {}) {
      const s = S[shadeId];
      this.root = new THREE.Group(); this.g = new THREE.Group(); this.g.position.y = -1.43; this.root.add(this.g);
      this.glass = glassMat(hq);
      this.liq = lacquerMat(s.liquid);
      const body = new THREE.Mesh(G.body, this.glass); body.position.y = .725; this.g.add(body);
      this.liquid = new THREE.Mesh(G.liquid, this.liq); this.liquid.position.y = .66; this.g.add(this.liquid);
      const neck = new THREE.Mesh(G.neck, this.glass); neck.position.y = 1.52; this.g.add(neck);
      this.capRig = new THREE.Group(); this.capRig.position.y = 1.58;
      const c = new THREE.Mesh(G.cap, capMat); c.position.y = .66; this.capRig.add(c);
      const ct = new THREE.Mesh(G.capTop, capMat); ct.scale.y = .12; ct.position.y = 1.32; this.capRig.add(ct);
      const stem = new THREE.Mesh(G.stem, this.liq); stem.position.y = -.55; this.capRig.add(stem);
      const br = new THREE.Mesh(G.bristle, this.liq); br.position.y = -1.27; this.capRig.add(br);
      this.brush = br;
      // gold-foil brand on the cap + metallic collar ring
      if (!capMarkMat) capMarkMat = new THREE.MeshPhysicalMaterial({ map: capTex(), transparent: true, metalness: .55, roughness: .25, emissive: new THREE.Color('#5a4320'), emissiveMap: null, envMap: env, envMapIntensity: 1.5, depthWrite: false, clearcoat: 1 });
      [0, Math.PI].forEach(r => { const cm = new THREE.Mesh(G.capMark, capMarkMat); cm.position.y = .72; cm.rotation.y = r; this.capRig.add(cm); });
      const ring = new THREE.Mesh(G.capRing, goldMat); ring.position.y = .04; this.capRig.add(ring);
      if (cap) this.g.add(this.capRig);
      if (label) { const dk = s.id === 'milk-glass' || s.id === 'clear-glaze';
        this.labelMat = new THREE.MeshBasicMaterial({ map: labelTex(s.name, dk), transparent: true, depthWrite: false });
        [0, Math.PI].forEach(r => { const l = new THREE.Mesh(G.label, this.labelMat); l.position.set(Math.sin(r) * .757, .7, Math.cos(r) * .757); l.rotation.y = r; this.g.add(l); this.labelMesh = l; });
        this.sideMat = new THREE.MeshBasicMaterial({ map: sideTex(dk), transparent: true, depthWrite: false });
        [Math.PI / 2, -Math.PI / 2].forEach(r => { const l = new THREE.Mesh(G.side, this.sideMat); l.position.set(Math.sin(r) * .757, .72, Math.cos(r) * .757); l.rotation.y = r; this.g.add(l); }); }
      if (shadow) { const sh = new THREE.Mesh(G.shadow, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .002; this.g.add(sh); this.shadow = sh; }
      this.shade = shadeId; if (s.clear) this.makeClear(true); allBottles.push(this);
    }
    set(shadeId, instant) {
      const s = S[shadeId]; this.shade = shadeId; setShade(this.liq, s.liquid, instant);
      if (this.labelMat) { const dk = s.id === 'milk-glass' || s.id === 'clear-glaze'; this.labelMat.map.dispose(); this.labelMat.map = labelTex(s.name, dk); this.sideMat.map.dispose(); this.sideMat.map = sideTex(dk); }
      this.makeClear(!!s.clear);
    }
    makeClear(on) {
      if (this.glass.transmission > 0) { this.liquid.visible = !on; if (this.brush) this.brush.visible = true; this.glass.attenuationColor.set(on ? '#f4dfe3' : '#fff6f7'); this.glass.attenuationDistance = on ? 1.4 : 3; }
      else { this.liq.transparent = on; this.liq.opacity = on ? .35 : 1; this.liq.depthWrite = !on; this.liq.needsUpdate = true; }
    }
    tick(now) { stepMat(this.liq, now); }
  }

  /* lights helper */
  function lights(scene, k = 1) {
    const d = new THREE.DirectionalLight(0xffffff, 1.6 * k); d.position.set(3, 6, 5); scene.add(d);
    const r = new THREE.DirectionalLight(0xffe6ea, 1.1 * k); r.position.set(-5, 3, -4); scene.add(r);
    scene.add(new THREE.AmbientLight(0xffffff, .25 * k));
    scene.environment = env;
  }

  /* views */
  const views = [];
  function view(el, setup, opts = {}) {
    if (!el) return null;
    const scene = new THREE.Scene(); lights(scene, opts.light || 1);
    const camera = new THREE.PerspectiveCamera(opts.fov || 30, 1, .1, 100);
    const v = { el, scene, camera, update: null, always: !!opts.always, last: 0 };
    v.update = setup(scene, camera, v) || (() => {});
    views.push(v); return v;
  }
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; });
  const vh = () => window.innerHeight;
  function prog(el) { const r = el.getBoundingClientRect(); return clamp((vh() - r.top) / (vh() + r.height)); }

  /* ----- intro ----- */
  const intro = $('#intro');
  let introStart = 0;
  view($('#v-intro'), (scene, cam) => {
    cam.position.set(0, .6, 9); cam.lookAt(0, 0, 0);
    const mat = lacquerMat(S['petal-hush'].liquid);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(.28, 48, 32), mat); scene.add(drop);
    const N = 70; const sp = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 16, 12), mat, N); scene.add(sp);
    const P = [...Array(N)].map(() => { const a = Math.random() * Math.PI * 2, v = 1.6 + Math.random() * 2.4; return { a, v, up: 2 + Math.random() * 3.5, s: .4 + Math.random() * 1.1 }; });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .05, 16, 96), mat); ring.rotation.x = Math.PI / 2; scene.add(ring);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3();
    return (now) => {
      if (!introStart) introStart = now; const t = (now - introStart) / 1000; stepMat(mat, now);
      const fall = clamp(t / .9); drop.position.y = 4.5 - 4.5 * fall * fall; drop.scale.set(1 - fall * .2, 1 + fall * .45, 1 - fall * .2); drop.visible = t < .9;
      const st = Math.max(0, t - .9);
      ring.visible = st > 0; ring.scale.setScalar(.2 + st * 3.2); ring.material.opacity = 1; ring.position.y = -.02; ring.scale.z = .2 + st * 3.2;
      for (let i = 0; i < N; i++) { const p = P[i]; const x = Math.cos(p.a) * p.v * st, z = Math.sin(p.a) * p.v * st * .6, y = p.up * st - 4.9 * st * st; V.set(x, Math.max(y, -3), z); const k = st > 0 ? p.s * Math.max(0, 1 - st * .55) : 0; SC.setScalar(k); M.compose(V, Q, SC); sp.setMatrixAt(i, M); }
      sp.instanceMatrix.needsUpdate = true; ring.visible = st > 0 && st < 1.4; if (ring.visible) ring.scale.multiplyScalar(1);
      if (st > .25) intro.classList.add('show');
      if (t > 3.4 && !intro.classList.contains('done')) { intro.classList.add('done'); document.documentElement.classList.add('ready'); setTimeout(() => { canvas.style.zIndex = 40; }, 900); }
    };
  }, { always: true });
  canvas.style.zIndex = 70;
  const introDone = () => intro.classList.contains('done');

  /* ----- hero ----- */
  view($('#v-hero'), (scene, cam) => {
    cam.position.set(0, .3, 11); cam.lookAt(0, .1, 0);
    const b = new Bottle('petal-hush'); b.root.scale.setScalar(1.12); scene.add(b.root); b.shadow.visible = false;
    const curve = new THREE.CatmullRomCurve3([...Array(16)].map((_, i) => { const a = i / 15 * Math.PI * 2.4 - 1.2; const r = 1.55 + Math.sin(i * 1.3) * .22; return new THREE.Vector3(Math.cos(a) * r, -1.25 + i * .15 + Math.sin(i * .8) * .12, Math.sin(a) * r * .85); }));
    const TS = 300, RS = 20; const frames = curve.computeFrenetFrames(TS, false); const rp = [], ri = [];
    for (let i = 0; i <= TS; i++) { const u = i / TS; const c = curve.getPointAt(u); const N0 = frames.normals[i], B0 = frames.binormals[i];
      const rad = .13 * Math.pow(Math.sin(Math.PI * u), .55) * (1 + .35 * Math.sin(u * 23) * Math.sin(u * 7)) + .004;
      for (let j = 0; j <= RS; j++) { const v = j / RS * Math.PI * 2; const cx = Math.cos(v) * rad * 2.4, cy = Math.sin(v) * rad * .55; rp.push(c.x + N0.x * cx + B0.x * cy, c.y + N0.y * cx + B0.y * cy, c.z + N0.z * cx + B0.z * cy); } }
    for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) { const a = i * (RS + 1) + j, d = a + RS + 1; ri.push(a, d, a + 1, a + 1, d, d + 1); }
    const ribbonG = new THREE.BufferGeometry(); ribbonG.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); ribbonG.setIndex(ri); ribbonG.computeVertexNormals();
    const ribbonMat = lacquerMat(S['petal-hush'].liquid); const ribbon = new THREE.Mesh(ribbonG, ribbonMat); scene.add(ribbon);
    const N = 30; const dropsM = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 20, 14), ribbonMat, N); scene.add(dropsM);
    const D = [...Array(N)].map((_, i) => ({ a: Math.random() * Math.PI * 2, r: 1.7 + Math.random() * 1.3, y: -1.5 + Math.random() * 3.2, s: .3 + Math.random() * 1.2, sp: .15 + Math.random() * .4 }));
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3();
    let rx = 0, ry = 0; const total = ribbonG.index.count;
    return (now) => {
      const t = now / 1000; b.tick(now); stepMat(ribbonMat, now);
      const p = prog($('#top'));
      const grow = introDone() ? clamp((now - (introStart + 3400)) / 1800) : 0;
      ribbonG.setDrawRange(0, Math.floor(total * (.08 + .92 * ease(grow))));
      rx += ((mouse.y * .18) - rx) * .05; ry += ((mouse.x * .35) - ry) * .05;
      b.root.rotation.set(rx - .05, t * .25 + ry + p * 2.2, -.22 + Math.sin(t * .6) * .03);
      b.root.position.y = .42 + Math.sin(t * .9) * .08 - p * 1.2; b.root.position.x = -.25;
      ribbon.rotation.y = t * .18 + ry * .5; ribbon.position.y = b.root.position.y; ribbon.position.x = b.root.position.x;
      for (let i = 0; i < N; i++) { const d = D[i]; const a = d.a + t * d.sp; V.set(Math.cos(a) * d.r, d.y + Math.sin(t * .8 + i) * .2 + b.root.position.y, Math.sin(a) * d.r * .8); SC.setScalar(d.s * ease(grow)); M.compose(V, Q, SC); dropsM.setMatrixAt(i, M); }
      dropsM.instanceMatrix.needsUpdate = true;
    };
  });

  /* ----- bestsellers ----- */
  const bestBottles = [];
  BEST.forEach(([, id], i) => view($('#v-best' + i), (scene, cam) => {
    cam.position.set(0, .9, 9.2); cam.lookAt(0, -.15, 0);
    const b = new Bottle(id); b.root.scale.setScalar(1.12); scene.add(b.root); bestBottles[i] = b;
    const el = $('#v-best' + i).closest('.card'); let hov = 0, spin = 0, h = 0;
    el.addEventListener('pointerenter', () => hov = 1); el.addEventListener('pointerleave', () => hov = 0);
    return (now, dt) => { b.tick(now); const auto = ((now / 1000 + i * 2.2) % 6.6) < 1.6 ? 1 : 0; h += (Math.max(hov, auto) - h) * .06; spin += dt * (.35 + h * 2.2); b.root.rotation.y = spin + i; b.root.position.y = -.25 + h * .25 + Math.sin(now / 900 + i) * .05; b.root.rotation.z = Math.sin(now / 1200 + i) * .04; };
  }));
  // auto-cycle bestseller shades (one card at a time) while visible
  watch($('#cards')); markUser($('#cards'), 'best'); let bestTurn = 0;
  setInterval(() => { if (!onScreen($('#cards')) || !idle('best', 8000)) return; const c = $$('#cards .card')[bestTurn % 3]; bestTurn++; if (!c) return; const ds = $$('.dots i', c); const k = ds.findIndex(d => d.classList.contains('on')); const nx = ds[(k + 1) % ds.length]; nx && nx.click(); }, 2400);
  $('#cards').addEventListener('click', e => { const d = e.target.closest('.dots i'); if (!d) return; const i = +d.dataset.card; $$('.dots i', d.parentNode).forEach(x => x.classList.toggle('on', x === d)); bestBottles[i] && bestBottles[i].set(d.dataset.s); const c = d.closest('.card'); $('h3', c).textContent = S[d.dataset.s].name; });

  /* ----- shade studio ----- */
  let studio;
  view($('#v-studio'), (scene, cam) => {
    cam.position.set(0, 1.1, 10.5); cam.lookAt(0, .05, 0);
    const b = new Bottle('petal-hush'); b.root.scale.setScalar(1.28); scene.add(b.root); studio = b;
    let drag = false, lx = 0, vel = .004, rot = .4;
    const el = $('#studio .stage'); el.style.cursor = 'grab'; el.style.pointerEvents = 'auto';
    el.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
    el.addEventListener('pointermove', e => { if (!drag) return; vel = (e.clientX - lx) * .01; lx = e.clientX; });
    el.addEventListener('pointerup', () => { drag = false; el.style.cursor = 'grab'; });
    return (now) => { b.tick(now); rot += vel; vel += ((idle('studio', 9000) ? .009 : .004) - vel) * .04; b.root.rotation.y = rot; b.root.position.y = -.2 + Math.sin(now / 1100) * .06; };
  });
  const sname = $('#sname'); let finish = 'creme', glossV = .78, curShade = 'petal-hush';
  function studioMeta() { $('#cname').textContent = S[curShade].name; $('#cmeta').textContent = `${{ creme: 'Crème', shimmer: 'Shimmer', jelly: 'Jelly', matte: 'Matte top' }[finish]} · ${glossV > .66 ? 'Glass shine' : glossV > .33 ? 'Soft gloss' : 'Satin'} · 12 ml`; }
  function applyFinish() {
    if (!studio) return; const L = studio.liq, Gm = studio.glass;
    Gm.roughness = .03 + (1 - glossV) * .32; Gm.clearcoatRoughness = .02 + (1 - glossV) * .4;
    L.clearcoatRoughness = finish === 'matte' ? .7 : .04 + (1 - glossV) * .3; L.roughness = finish === 'matte' ? .7 : .16;
    const jelly = finish === 'jelly'; L.emissive.set(jelly ? S[curShade].liquid : '#000000'); L.emissiveIntensity = jelly ? .35 : 0; L.roughness = jelly ? .05 : L.roughness; L.sheen = jelly ? 1 : 0; L.sheenColor = new THREE.Color('#ffffff'); L.sheenRoughness = .25;
    L.userData.u.uSpark.value = finish === 'shimmer' ? 1 : 0; L.needsUpdate = true; Gm.needsUpdate = true; studioMeta();
  }
  $('#picker').addEventListener('click', e => { const i = e.target.closest('i'); if (!i) return; $$('#picker i').forEach(x => x.classList.toggle('on', x === i)); curShade = i.dataset.s; studio && studio.set(curShade); sname.style.opacity = 0; setTimeout(() => { sname.textContent = S[curShade].name; sname.style.opacity = 1; }, 300); applyFinish(); });
  $('#finish').addEventListener('click', e => { const s = e.target.closest('span'); if (!s) return; $$('#finish span').forEach(x => x.classList.toggle('on', x === s)); finish = s.dataset.f; applyFinish(); });
  (() => { const sl = $('#gloss'); let on = false; const set = e => { const r = sl.getBoundingClientRect(); glossV = clamp((e.clientX - r.left) / r.width); $('.fl', sl).style.width = glossV * 100 + '%'; $('b', sl).style.left = glossV * 100 + '%'; applyFinish(); };
    sl.addEventListener('pointerdown', e => { on = true; sl.setPointerCapture(e.pointerId); set(e); }); sl.addEventListener('pointermove', e => on && set(e)); sl.addEventListener('pointerup', () => on = false); })();
  // studio demo: cycles shades & finishes by itself until the visitor takes over
  watch($('#studio')); markUser($('#studio'), 'studio'); let stI = 0;
  const FIN = ['creme', 'shimmer', 'jelly', 'creme', 'matte', 'creme'];
  setInterval(() => { if (!onScreen($('#studio')) || !idle('studio', 9000)) return; stI++; const ps = $$('#picker i'); ps[stI % ps.length] && ps[stI % ps.length].click(); const f = $(`#finish span[data-f="${FIN[stI % FIN.length]}"]`); f && f.click();
    const g = .45 + .5 * (.5 + .5 * Math.sin(stI * 1.3)); glossV = g; const sl = $('#gloss'); $('.fl', sl).style.width = g * 100 + '%'; $('b', sl).style.left = g * 100 + '%'; applyFinish(); }, 2800);
  $('#cadd').addEventListener('click', () => { const b = $('#bag'); b.textContent = +b.textContent + 1; });

  /* ----- brush stroke (auto-plays on loop while visible) ----- */
  view($('#v-stroke'), (scene, cam) => {
    cam.position.set(0, 6.3, 7.4); cam.lookAt(0, .1, -.55);
    const b = new Bottle('rose-ember', { cap: false }); b.root.position.set(3.3, 1.43, -1.2); b.root.scale.setScalar(1); scene.add(b.root);
    const capRig = b.capRig; scene.add(capRig); // detached cap + brush
    const home = new THREE.Vector3(3.3, 1.58, -1.2);
    // stroke strip lying on the paper
    const SEGS = 260, ACROSS = 17; const pts = [];
    for (let i = 0; i <= SEGS; i++) { const u = i / SEGS; pts.push(new THREE.Vector3(-3.4 + u * 5.5, 0, -.3 - u * 1.0 + Math.sin(u * 3.2) * .3)); }
    const pos = [], nor = [], idx = [];
    for (let i = 0; i <= SEGS; i++) {
      const u = i / SEGS; const p = pts[i]; const q = pts[Math.min(i + 1, SEGS)], o = pts[Math.max(i - 1, 0)]; const dir = q.clone().sub(o).normalize(); const side = new THREE.Vector3(-dir.z, 0, dir.x);
      const w = .25 * Math.sqrt(clamp(u / .035)) * Math.sqrt(clamp((1 - u) / .06)) * (1 + .06 * Math.sin(u * 40));
      for (let j = 0; j < ACROSS; j++) { const v = j / (ACROSS - 1) * 2 - 1; const h = .05 * Math.sqrt(Math.max(0, 1 - v * v)) * (1 + .28 * Math.sin(v * 21 + Math.sin(u * 9) * 2)) * (1 + .12 * Math.sin(u * 70)); const pp = p.clone().add(side.clone().multiplyScalar(v * w)); pos.push(pp.x, h + .005, pp.z); nor.push(0, 1, 0); }
    }
    for (let i = 0; i < SEGS; i++) for (let j = 0; j < ACROSS - 1; j++) { const a = i * ACROSS + j, c = a + ACROSS; idx.push(a, a + 1, c, a + 1, c + 1, c); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setIndex(idx); sg.computeVertexNormals();
    const strokeMat = lacquerMat(S['rose-ember'].liquid); strokeMat.roughness = .06; strokeMat.clearcoatRoughness = .02; strokeMat.envMapIntensity = 1.5;
    const stroke = new THREE.Mesh(sg, strokeMat); scene.add(stroke);
    const perSeg = (ACROSS - 1) * 6;
    const UP = new THREE.Vector3(0, 1, 0), TIP = new THREE.Vector3(0, -1.53, 0); let brushPress = 0;
    function brushQuat(k, painting) {
      const d = pts[Math.min(k + 2, SEGS)].clone().sub(pts[Math.max(k - 2, 0)]).normalize();
      const yaw = new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(-d.x, -d.z)); // flat side of the brush across the stroke
      const axis = new THREE.Vector3().crossVectors(UP, d).normalize(); // lean the handle forward, bristles trail
      const lean = new THREE.Quaternion().setFromAxisAngle(axis, .5 + (painting ? Math.sin(k * .35) * .04 : 0));
      return lean.multiply(yaw);
    }
    const vid = $('#strokeVid'), stepL = $('#strokeStep'), bar = $('#strokeProg'), sec = watch($('#stroke'));
    // self-running timeline (seconds): open → travel → paint → lift → admire → film → reset
    const T_OPEN = [.5, 2.1], T_TRAV = [2.1, 3.0], T_PAINT = [3.0, 7.2], T_LIFT = [7.2, 8.1], T_FILM = [9.4, 17.6], CYCLE = 18.4;
    let t = 0, t0 = performance.now(), wasOn = false;
    const segT = (x, [a, b]) => clamp((x - a) / (b - a));
    return (now, dt) => {
      b.tick(now); stepMat(strokeMat, now);
      const on = onScreen(sec); if (on && !wasOn) t0 = now; wasOn = on;
      t = ((now - t0) / 1000) % CYCLE;
      bar.style.width = (t / CYCLE) * 100 + '%';
      const open = ease(segT(t, T_OPEN)), travel = ease(segT(t, T_TRAV)), paint = segT(t, T_PAINT), lift = ease(segT(t, T_LIFT));
      stepL.textContent = t < T_TRAV[0] ? 'OPEN' : t < T_LIFT[0] ? 'PAINT' : 'SHINE';
      // brush placement is anchored on the bristle tip, so paint always comes out exactly under the brush
      const capPos = home.clone(); capPos.y += open * 1.55;
      const k = Math.min(Math.floor(paint * SEGS), SEGS);
      const qOpen = new THREE.Quaternion().setFromAxisAngle(UP, open * Math.PI * 4);
      const qStart = brushQuat(0, 0), qPaint = brushQuat(k, paint > 0 && paint < 1 ? 1 : 0);
      let q = travel < 1 ? qOpen.clone().slerp(qStart, travel) : qPaint;
      const tipAt = (p, qq) => p.clone().sub(TIP.clone().applyQuaternion(qq));
      let pos = travel < 1 ? capPos.clone().lerp(tipAt(pts[0].clone().setY(.03), qStart), travel) : tipAt(pts[k].clone().setY(.03), q);
      if (lift > 0) pos.y += lift * 1.6;
      let press = travel >= 1 && lift === 0 && paint > 0 ? 1 : 0;
      if (t > T_FILM[0]) { pos = home.clone(); q = new THREE.Quaternion(); press = 0; }
      brushPress += (press - brushPress) * .2; b.brush.scale.set(1 + brushPress * .3, 1 - brushPress * .08, 1);
      capRig.position.copy(pos); capRig.quaternion.copy(q);
      const drawn = t > T_FILM[1] + .4 ? 0 : paint;
      sg.setDrawRange(0, Math.floor(drawn * SEGS) * perSeg);
      const showVid = t > T_FILM[0] && t < T_FILM[1];
      if (on && !vid.src) { vid.src = vid.dataset.src; vid.load(); }
      if (showVid && !vid.classList.contains('on')) { try { vid.currentTime = 0; } catch (e) {} vid.play().catch(() => {}); }
      vid.classList.toggle('on', showVid); sec.classList.toggle('film', showVid); if (!showVid && t > T_FILM[1] + 1.3) vid.pause();
      scene.visible = !(t > T_FILM[0] + 1.3 && t < T_FILM[1]);
    };
  }, { fov: 32 });

  /* ----- collection ----- */
  SHADES.forEach((s, i) => view($('#v-sw' + i), (scene, cam) => {
    cam.position.set(0, .7, 8.4); cam.lookAt(0, -.05, 0);
    const b = new Bottle(s.id, { hq: false }); b.root.scale.setScalar(1.15); scene.add(b.root);
    const el = $('#v-sw' + i).closest('.sw'); let hov = 0, h = 0, spin = i;
    el.addEventListener('pointerenter', () => hov = 1); el.addEventListener('pointerleave', () => hov = 0);
    return (now, dt) => { b.tick(now); const spot = Math.floor(now / 1100) % SHADES.length === i ? 1 : 0; h += (Math.max(hov, spot) - h) * .08; spin += dt * (.25 + h * 3); b.root.rotation.y = spin; b.root.position.y = -.2 + h * .2 + Math.sin(now / 1000 + i) * .03; el.classList.toggle('spot', spot === 1); };
  }, { fov: 26 }));

  /* ----- quiz ----- */
  let quizB;
  view($('#v-quiz'), (scene, cam) => { cam.position.set(0, .7, 9); cam.lookAt(0, .15, 0); const b = new Bottle('petal-hush'); b.root.scale.setScalar(1.2); b.root.position.y = .45; scene.add(b.root); quizB = b; return (now) => { b.tick(now); b.root.rotation.y = now / 2200; }; });

  /* ----- gift box (scroll opens) ----- */
  view($('#v-gift'), (scene, cam) => {
    cam.position.set(0, 5.6, 8.2); cam.lookAt(0, .5, 0);
    const boxMat = new THREE.MeshPhysicalMaterial({ color: '#EBC4C4', roughness: .78, sheen: .4, sheenColor: new THREE.Color('#ffffff'), envMap: env });
    const lining = new THREE.MeshPhysicalMaterial({ color: '#FFF8F2', roughness: .35, sheen: 1, sheenRoughness: .3, sheenColor: new THREE.Color('#ffffff'), envMap: env });
    const ribbonM = new THREE.MeshPhysicalMaterial({ color: '#141112', roughness: .35, sheen: 1, sheenColor: new THREE.Color('#888'), envMap: env });
    const W = 4.2, D = 2.6, Hh = 1.1, T = .1; const box = new THREE.Group(); scene.add(box);
    const add = (w, h, d, x, y, z, m) => { const me = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, .03), m); me.position.set(x, y, z); box.add(me); return me; };
    add(W, T, D, 0, T / 2, 0, boxMat); add(W, Hh, T, 0, Hh / 2, D / 2, boxMat); add(W, Hh, T, 0, Hh / 2, -D / 2, boxMat); add(T, Hh, D, W / 2, Hh / 2, 0, boxMat); add(T, Hh, D, -W / 2, Hh / 2, 0, boxMat);
    add(W - .25, .06, D - .25, 0, .45, 0, lining);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .001; scene.add(sh);
    const hinge = new THREE.Group(); hinge.position.set(0, Hh, -D / 2 - .02); box.add(hinge);
    const lid = new THREE.Group(); hinge.add(lid);
    const lm = new THREE.Mesh(new RoundedBoxGeometry(W + .14, .26, D + .14, 3, .04), boxMat); lm.position.set(0, .1, D / 2 + .02); lid.add(lm);
    const rb = new THREE.Mesh(new THREE.BoxGeometry(.32, .275, D + .16), ribbonM); rb.position.set(-.9, .1, D / 2 + .02); lid.add(rb);
    const rb2 = new THREE.Mesh(new THREE.BoxGeometry(W + .16, .275, .32), ribbonM); rb2.position.set(0, .1, D / 2 + .3); lid.add(rb2);
    const minis = ['petal-hush', 'nude-silk', 'rose-ember'].map((id, i) => { const b = new Bottle(id, { shadow: false }); b.root.scale.setScalar(.52); b.root.position.set((i - 1) * 1.25, 1.2, .1); box.add(b.root); return b; });
    box.rotation.y = -.35; const el = $('#gifts'); const gs = watch(el); let g0 = performance.now(), gOn = false;
    return (now, dt) => {
      const p = prog(el); const on = onScreen(gs); if (on && !gOn) g0 = now; gOn = on; const gt = ((now - g0) / 1000) % 8; // open → reveal → hold → close, on loop
      const o = gt < 1 ? 0 : gt < 2.4 ? ease((gt - 1) / 1.4) : gt < 6.2 ? 1 : gt < 7.4 ? 1 - ease((gt - 6.2) / 1.2) : 0;
      const rise = gt < 1.8 ? 0 : gt < 3.2 ? ease((gt - 1.8) / 1.4) : gt < 5.6 ? 1 : gt < 6.6 ? 1 - ease((gt - 5.6) / 1) : 0;
      hinge.rotation.x = -o * 1.95;
      minis.forEach((b, i) => { b.tick(now); b.root.visible = o > .04; b.root.position.y = .3 + .9 * .52 * 1.43 + rise * (.9 + Math.sin(now / 900 + i) * .06) - (1 - rise) * .3; b.root.rotation.y = now / 2500 + i * 1.3; });
      box.rotation.y = -.35 + (p - .5) * .5 + Math.sin(now / 2600) * .12;
    };
  }, { fov: 30 });

  /* ----- falling lacquer drops: join + footer ----- */
  function dropField(el, n, opts) {
    return view(el, (scene, cam) => {
      cam.position.set(0, 0, 14); cam.lookAt(0, 0, 0);
      const mats = ['petal-hush', 'rose-ember', 'peony-pop', 'nude-silk'].map(id => lacquerMat(S[id].liquid));
      const geo = new THREE.SphereGeometry(.22, 32, 24);
      const meshes = mats.map(m => new THREE.InstancedMesh(geo, m, n)); meshes.forEach(m => scene.add(m));
      const P = [...Array(n)].map((_, i) => ({ m: i % 4, x: (Math.random() * 2 - 1) * 9, y: Math.random() * 10 - 2, z: (Math.random() * 2 - 1) * 2, vx: 0, vy: -Math.random(), s: .5 + Math.random() * 1.1, sq: 0 }));
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3();
      let bound = { w: 10, h: 4 };
      const api = { kick() { P.forEach(p => { p.vy = 6 + Math.random() * 6; p.vx = (Math.random() * 2 - 1) * 4; }); } };
      if (opts.burst) burst = api.kick;
      return (now, dt, v) => {
        const r = v.el.getBoundingClientRect(); const asp = r.width / Math.max(1, r.height); bound.h = Math.tan(THREE.MathUtils.degToRad(15)) * 14; bound.w = bound.h * asp;
        const mx = mouse.x * bound.w, my = -mouse.y * bound.h;
        const counts = [0, 0, 0, 0]; dt = Math.min(dt, .033);
        for (const p of P) {
          p.vy -= opts.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .995;
          const floor = -bound.h + .25 * p.s;
          if (opts.floor && p.y < floor) { p.y = floor; p.vy *= -.42; p.vx *= .8; p.sq = Math.min(1, Math.abs(p.vy) * .15 + .3); if (Math.abs(p.vy) < .3) p.vy = 0; }
          if (!opts.floor && p.y < -bound.h - 1) { p.y = bound.h + 1 + Math.random() * 3; p.vy = 0; p.x = (Math.random() * 2 - 1) * bound.w; }
          if (Math.abs(p.x) > bound.w + 1) p.x = -Math.sign(p.x) * bound.w;
          const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 4) { p.vx += dx / (d2 + .2) * 2 * dt * 10; p.vy += dy / (d2 + .2) * 2 * dt * 10; }
          if (opts.floor && p.vy === 0 && Math.random() < .002) { p.vy = 3 + Math.random() * 3; }
          p.sq *= .9;
          V.set(p.x, p.y, p.z); SC.set(p.s * (1 + p.sq * .35), p.s * (1 - p.sq * .4) * (opts.floor ? 1 : 1.25), p.s); M.compose(V, Q, SC); meshes[p.m].setMatrixAt(counts[p.m]++, M);
        }
        meshes.forEach((m, i) => { m.count = counts[i]; m.instanceMatrix.needsUpdate = true; stepMat(mats[i], now); });
      };
    }, { fov: 30 });
  }
  dropField($('#v-join'), 26, { g: 9.8, floor: true, burst: true });
  dropField($('#v-foot'), 14, { g: 2.2, floor: false });

  /* quiz logic (after bottle exists) */
  const Q = [
    { h: 'Which looks most like your skin tone?', o: [['Fair', '#F3D5C0'], ['Wheatish', '#D9A784'], ['Dusky', '#B07A55'], ['Deep', '#7A4E33']] },
    { h: 'What is your undertone?', o: [['Warm', 'pill'], ['Cool', 'pill'], ['Neutral', 'pill']] },
    { h: 'What mood are you in today?', o: [['Soft & everyday', 'pill'], ['Bold & glam', 'pill'], ['Bridal glow', 'pill']] },
  ];
  const MATCH = { 'Fair': 'petal-hush', 'Wheatish': 'nude-silk', 'Dusky': 'rose-ember', 'Deep': 'berry-noir', 'Warm': 'sorbet-haze', 'Cool': 'mauve-mirage', 'Neutral': 'blush-veil', 'Soft & everyday': 'nude-silk', 'Bold & glam': 'peony-pop', 'Bridal glow': 'rose-ember' };
  let qi = 0;
  function renderQ() { const q = Q[qi]; $('#qn').textContent = `QUESTION ${qi + 1} OF 3`; $('#qh').textContent = q.h; $('#opts').innerHTML = q.o.map(([l, c]) => c === 'pill' ? `<div class="pill" data-l="${l}">${l}</div>` : `<div data-l="${l}"><i style="background:${c}"></i>${l}</div>`).join(''); $$('#qprog span').forEach((s, i) => s.classList.toggle('on', i <= qi)); $('#qnext').textContent = qi < 2 ? 'Next question →' : 'See my shade →'; }
  renderQ();
  $('#opts').addEventListener('click', e => { const d = e.target.closest('[data-l]'); if (!d) return; $$('#opts [data-l]').forEach(x => x.classList.toggle('on', x === d)); const id = MATCH[d.dataset.l]; $('#qmatch').textContent = S[id].name; quizB && quizB.set(id); });
  $('#qnext').addEventListener('click', () => { if (qi < 2) { qi++; renderQ(); } else { $('#qn').textContent = 'YOUR SHADE'; $('#qh').textContent = 'Meet ' + $('#qmatch').textContent + '. Made for you.'; } });
  $('#qreset').addEventListener('click', () => { qi = 0; renderQ(); });
  // demo mode: the quiz plays itself (picks an answer, moves on) until the visitor clicks
  const quizSec = watch($('#quiz')); markUser(quizSec, 'quiz'); let qa = 0;
  setInterval(() => { if (!onScreen(quizSec) || !idle('quiz', 10000)) return; const os = $$('#opts [data-l]'); if (!os.length) return; qa++;
    if (qa % 3 === 0) { if (qi < 2) { qi++; renderQ(); } else { qi = 0; renderQ(); } return; }
    const d = os[(qa * 2 + qi) % os.length]; $$('#opts [data-l]').forEach(x => x.classList.toggle('on', x === d)); const id = MATCH[d.dataset.l]; $('#qmatch').textContent = S[id].name; quizB && quizB.set(id); }, 1900);

  /* ----- render loop ----- */
  let last = performance.now(), slow = 0, frames = 0, lowered = false;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = (now - last) / 1000; last = now;
    if (!lowered && ++frames > 90) { slow = slow * .95 + (dt > .034 ? 1 : 0) * .05; if (slow > .6) { renderer.setPixelRatio(1); size(); lowered = true; } }
    const W = window.innerWidth, H = window.innerHeight;
    renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
    for (const v of views) {
      const r = v.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2) continue;
      const introOn = !intro.classList.contains('done');
      if (introOn && v.el.id !== 'v-intro') continue;
      if (v.el.id === 'v-intro' && !introOn && now - introStart > 5000) continue;
      v.update(now, dt, v);
      v.camera.aspect = r.width / r.height; v.camera.updateProjectionMatrix();
      const bottom = H - r.bottom;
      renderer.setViewport(r.left, bottom, r.width, r.height); renderer.setScissor(r.left, bottom, r.width, r.height);
      renderer.render(v.scene, v.camera);
    }
  }
  document.fonts && document.fonts.ready.then(() => { views.forEach(v => v.scene.traverse(o => { })); allBottles.forEach(b => b.labelMat && b.set(b.shade, true)); if (capMarkMat) { capMarkMat.map.dispose(); capMarkMat.map = capTex(); capMarkMat.needsUpdate = true; } });
  requestAnimationFrame(loop);
}

if (!renderer) { document.getElementById('intro').classList.add('done'); document.documentElement.classList.add('ready'); }
