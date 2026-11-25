/* Libreria 3D dei libri (sito e shop). Dati in books.js, copertine vere in covers/.
   La pagina deve avere: #gl (canvas), #biblio (sezione dell'anello), #panel, #cur/#curL.
   Facoltativi: #libro (libro grande che segue lo scroll), barra #hbN/#hbP/#hbT/#prev/#next/#openFront, #biblioteca (fine zona 3D).
   Acquisto: window.__onBuy(book) se esiste (shop: carrello), altrimenti window.__buyHref(book) o book.buy. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BOOKS, euro } from './books.js';

const N = BOOKS.length, TAU = Math.PI * 2, STEP = TAU / N;
const INK = '#0f121a', ACID = '#f1ff62';
const H = 2.25;
BOOKS.forEach(b => { b.W = H * (b.aspect || 2 / 3); });
const WMAX = Math.max(...BOOKS.map(b => b.W));

/* ---------- disegni in canvas (dorso, retro, interno) ---------- */
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function mk(w, h, s) { const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); const x = c.getContext('2d'); x.scale(s, s); return [c, x]; }
function ls(x, v) { try { x.letterSpacing = v; } catch (e) {} }
function wrap(x, text, maxW) { const out = []; let line = ''; for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }
const F = (w, s) => `${w} ${s}px "Inter Tight"`;

function drawCover(b) {
  const W = 1024, Hh = Math.round(1024 / b.aspect);
  const [c, x] = mk(W, Hh, 1);
  if (b.image) { x.drawImage(b.image, 0, 0, W, Hh); return c; }
  x.fillStyle = b.bg; x.fillRect(0, 0, W, Hh);
  x.fillStyle = b.fg; x.font = F(500, 110); ls(x, '-3px');
  b.title.split('|').forEach((l, i) => x.fillText(l, 70, 220 + i * 110));
  return c;
}
function drawSpine(b, D) {
  const w = Math.max(48, Math.round(1536 * D / H)); const [c, x] = mk(w, 1536, 1);
  x.fillStyle = b.bg; x.fillRect(0, 0, w, 1536);
  x.save(); x.translate(w / 2, 1536); x.rotate(-Math.PI / 2);
  const fs = Math.min(w * .42, 56); x.fillStyle = b.spineFg || b.fg; x.font = F(500, fs); ls(x, '1px'); x.textBaseline = 'middle';
  x.fillText(b.title.replace(/\|/g, ' '), 120, 2);
  x.font = F(500, Math.min(w * .26, 22)); ls(x, '4px'); x.textAlign = 'right'; x.fillStyle = rgba(b.fg, .7);
  x.fillText('GIACOMO · SPAZZINI', 1440, 2);
  x.restore();
  x.fillStyle = b.accent; x.fillRect(w * .3, 50, w * .4, w * .4);
  return c;
}
function drawBack(b) {
  const [c, x] = mk(1024, 1536, .4); x.fillStyle = b.bg; x.fillRect(0, 0, 1024, 1536);
  x.fillStyle = b.fg; x.font = F(500, 58); ls(x, '-1px'); wrap(x, b.sub, 820).forEach((l, i) => x.fillText(l, 100, 260 + i * 72));
  x.font = F(500, 24); ls(x, '5px'); x.fillStyle = rgba(b.fg, .6); x.fillText('GIACOMOSPAZZINI.COM', 100, 1300);
  x.fillStyle = '#fff'; x.fillRect(660, 1180, 264, 180); x.fillStyle = '#111'; for (let i = 0; i < 46; i++) { const w = Math.random() < .3 ? 5 : 2.4; x.fillRect(680 + i * 4.9, 1200, w, 120); }
  return c;
}
function drawInside(b) {
  const [c, x] = mk(1024, 1536, .8); x.fillStyle = b.bg; x.fillRect(0, 0, 1024, 1536);
  x.fillStyle = rgba(b.fg, .06); x.font = F(500, 560); ls(x, '-20px'); x.fillText('GS', 30, 1100);
  x.fillStyle = b.fg; x.font = F(600, 22); ls(x, '6px'); x.fillText(b.catLabel.toUpperCase(), 110, 200);
  x.font = F(500, 64); ls(x, '-1px');
  wrap(x, b.short.toUpperCase(), 800).forEach((l, i) => x.fillText(l, 110, 330 + i * 72));
  x.font = F(400, 30); ls(x, '0px'); x.fillStyle = rgba(b.fg, .78);
  wrap(x, b.sub, 760).forEach((l, i) => x.fillText(l, 110, 720 + i * 44));
  x.fillStyle = b.accent; x.fillRect(110, 1340, 120, 6); x.fillStyle = b.fg; x.font = F(600, 22); ls(x, '6px'); x.fillText('GIACOMO · SPAZZINI', 110, 1400);
  return c;
}
function drawToc(b) {
  const [c, x] = mk(1024, 1536, .8); x.fillStyle = '#f6f5f1'; x.fillRect(0, 0, 1024, 1536);
  x.fillStyle = INK; x.font = F(600, 22); ls(x, '6px'); x.fillText(b.short.toUpperCase().slice(0, 40), 100, 170);
  x.fillStyle = 'rgba(15,18,26,.15)'; x.fillRect(100, 196, 824, 2);
  x.fillStyle = INK; x.font = F(500, 96); ls(x, '-2px'); x.fillText(b.listTitle.toUpperCase(), 92, 330);
  const fs = b.chapters.length > 5 ? 36 : 42, lh = fs * 1.2;
  let y = 470;
  b.chapters.forEach((ch, i) => {
    x.font = F(600, 24); ls(x, '3px'); x.fillStyle = b.accent === ACID ? INK : b.accent; x.fillText('0' + (i + 1), 100, y);
    x.font = F(500, fs); ls(x, '0px'); x.fillStyle = INK; const t = wrap(x, ch, 680); t.forEach((l, k) => x.fillText(l, 180, y + k * lh));
    y += (t.length - 1) * lh + 30; x.fillStyle = 'rgba(15,18,26,.12)'; x.fillRect(100, y, 824, 2); y += 70;
  });
  x.fillStyle = ACID; x.beginPath(); x.roundRect(100, 1400, 64, 64, 8); x.fill(); x.fillStyle = INK; x.font = F(600, 22); x.fillText('GS', 114, 1440);
  return c;
}
function stripes(vertical) { const [c, x] = mk(256, 256, 1); x.fillStyle = '#ece8dc'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) { x.fillStyle = `rgba(120,110,90,${.18 + Math.random() * .18})`; vertical ? x.fillRect(i, 0, 1, 256) : x.fillRect(0, i, 256, 1); } return c; }

/* ---------- three ---------- */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
// su mobile lo schermo ha pochi pixel ma alta densità: piena risoluzione, altrimenti gli ebook risultano sfocati
const MOBDPR = innerWidth < 860, DPR_SCROLL = Math.min(devicePixelRatio, MOBDPR ? 2.5 : 1.5), DPR_READ = Math.min(devicePixelRatio, MOBDPR ? 3 : 2);
renderer.setPixelRatio(DPR_SCROLL);
// risoluzione piena quando si legge un libro (scena ferma), ridotta mentre si scorre
function setDPR(v) { if (renderer.getPixelRatio() === v) return; renderer.setPixelRatio(v); renderer.setSize(innerWidth, innerHeight, false); }
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 100);
camera.position.set(0, .35, 11);
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1e28, .6));
const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-4, 6, 9); scene.add(key);
const rim = new THREE.DirectionalLight(0xf1ff62, 1.8); rim.position.set(6, -1, -7); scene.add(rim);
const rim2 = new THREE.DirectionalLight(0x70b9ff, 1.0); rim2.position.set(-7, 2, -5); scene.add(rim2);

const maxAniso = renderer.capabilities.getMaxAnisotropy();
const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t; };
const edgeV = tex(stripes(true)), edgeH = tex(stripes(false));

const books = [];
function makeBook(b, i) {
  const W = b.W, D = b.D || .16, T = b.hard ? .03 : .012;
  const g = new THREE.Group(); g.userData.idx = i;
  const col = new THREE.MeshStandardMaterial({ color: b.bg, roughness: .55, envMapIntensity: .6 });
  const coverT = tex(drawCover(b));
  const coverM = b.hard ? new THREE.MeshPhysicalMaterial({ map: coverT, roughness: .38, clearcoat: .8, clearcoatRoughness: .22, envMapIntensity: .7 })
    : new THREE.MeshStandardMaterial({ map: coverT, roughness: .45, envMapIntensity: .7 });
  const insideM = new THREE.MeshStandardMaterial({ map: tex(drawInside(b)), roughness: .8, envMapIntensity: .4 });
  const backM = new THREE.MeshStandardMaterial({ map: tex(drawBack(b)), roughness: .5, envMapIntensity: .6 });
  const spineM = new THREE.MeshStandardMaterial({ map: tex(drawSpine(b, D)), roughness: .45, envMapIntensity: .6 });
  const ev = new THREE.MeshStandardMaterial({ map: edgeV, roughness: .95, envMapIntensity: .25 });
  const eh = new THREE.MeshStandardMaterial({ map: edgeH, roughness: .95, envMapIntensity: .25 });
  const toc = new THREE.MeshStandardMaterial({ map: tex(drawToc(b)), roughness: .85, envMapIntensity: .3 });
  const plain = new THREE.MeshStandardMaterial({ color: '#efece2', roughness: .9 });
  const inset = b.hard ? .05 : .006, pw = W - T - inset, ph = H - (b.hard ? .07 : .012), pd = D - 2 * T;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd), [ev, ev, eh, eh, toc, plain]);
  pages.position.x = -W / 2 + T + pw / 2; g.add(pages);
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), [col, col, col, col, insideM, backM]); back.position.z = -D / 2 + T / 2; g.add(back);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(T, H, D - 2 * T), [col, spineM, col, col, col, col]); spine.position.x = -W / 2 + T / 2; g.add(spine);
  const pivot = new THREE.Group(); pivot.position.set(-W / 2, 0, D / 2 - T / 2); g.add(pivot);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), [col, col, col, col, coverM, insideM]); cover.position.x = W / 2; pivot.add(cover);
  g.traverse(o => { if (o.isMesh) o.userData.idx = i; });
  g.position.set((Math.random() - .5) * 26, (Math.random() - .5) * 14, -30 - Math.random() * 10);
  g.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
  scene.add(g);
  return { g, pivot, idx: i, open: 0, delay: .15 + i * .09, s: 1, W };
}

// polvere
function points(n, spread, color, size, op) {
  const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * spread[0]; p[i * 3 + 1] = (Math.random() - .5) * spread[1]; p[i * 3 + 2] = (Math.random() - .5) * spread[2] - 2; }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: op, depthWrite: false })); scene.add(m); return m;
}
const dust = points(420, [26, 14, 16], 0xdfe3ec, .02, .5), acidDust = points(50, [20, 10, 10], 0xf1ff62, .04, .75);
// velo scuro nella scena (oscura l'anello quando si legge un libro)
const dim = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshBasicMaterial({ color: 0x07090e, transparent: true, opacity: 0, depthWrite: false }));
scene.add(dim);

/* ---------- layout ---------- */
const $ = s => document.querySelector(s);
const hasLibro = !!$('#libro');
let L = {};
// y del mondo che cade su una riga dello schermo (px), alla profondità z: la camera guarda da (0,.35,11) verso (0,.105,0)
const worldY = (px, h, z, vh, camZ) => .105 + .245 * (z / camZ) + (.5 - px / h) * vh(camZ - z);
/* Telefono: anello e libro aperto vengono misurati sullo spazio libero vero della pagina,
   così non finiscono sotto il titolo, la barra in basso, l'header o il pannello. */
function mobileLayout(w, h, camZ, vh, vw) {
  const sec = $('#biblio'), top = sec && sec.querySelector('.b-top'), bar = sec && sec.querySelector('.hero-bar');
  const y0 = top ? top.offsetTop + top.offsetHeight + 16 : h * .3;
  const y1 = bar ? bar.offsetTop - 16 : h * .78;
  const R = vw(camZ) * .42, zf = R * Math.cos(.1), df = camZ - zf; // il libro davanti è più vicino
  const pxF = h / vh(df), WR = Math.max(...BOOKS.map(b => b.W));
  // carosello piatto: il libro davanti al centro, i vicini più piccoli e un po' indietro che spuntano dai lati senza toccarlo
  const s = Math.max(.5, Math.min((y1 - y0) * .86 / pxF / H, vw(df) * .62 / WR));
  L.R = R; L.ringS = s;
  L.ringC.set(0, worldY((y0 + y1) / 2, h, zf, vh, camZ), 0);
  L.flow = { z: zf, side: .74, gap: .1 * s, back: .9, half: vw(df) / 2 };
  // libro aperto: tra l'header (o il pulsante del menu) e il pannello che sale dal basso
  const fz = L.focusZ, fd = camZ - fz, a0 = 84, a1 = h * (1 - .52) - 14;
  L.focusS = Math.min(vw(fd) * .88 / (2 * WR), (a1 - a0) * .86 / (h / vh(fd)) / H);
  L.focusY = worldY((a0 + a1) / 2, h, fz, vh, camZ);
}
function layout() {
  const w = innerWidth, h = innerHeight, asp = w / h, mob = w < 860;
  renderer.setSize(w, h, false);
  camera.aspect = asp; camera.fov = mob ? (asp < .7 ? 52 : 44) : 34; camera.updateProjectionMatrix();
  const camZ = 11, vh = d => 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = d => vh(d) * asp;
  const fz = mob ? 2.6 : 6.3, fd = camZ - fz, pf = Math.min((480 + (w < 860 ? 0 : 56)) / w, .46);
  const fs = mob ? Math.min(.95, vw(fd) * .94 / (2 * WMAX)) : Math.min(.9, vw(fd) * (1 - pf) * .86 / (2 * WMAX), vh(fd) * .74 / H);
  const fxC = mob ? 0 : -vw(fd) * pf / 2, fy = mob ? vh(fd) * .23 : .05;
  const lz = mob ? 3.2 : 5.3, ld = camZ - lz;
  const rs = mob ? .74 : .6 * Math.min(1.1, Math.sqrt(asp / 1.7));
  const ringY = +(canvas.dataset.ringY || 0);
  pxW = vh(camZ) / h; // unità 3D per pixel sul piano dell'anello
  L = { mob, R: mob ? 3.3 : 4.9 * rs / .75, ringC: new THREE.Vector3(0, mob ? .55 : .5 + ringY, 0), ringS: rs,
    libro: mob ? new THREE.Vector3(0, vh(ld) * .2, lz) : new THREE.Vector3(vw(ld) * .19, -.05, lz),
    libroS: mob ? .85 : Math.min(1.05, vh(ld) * .7 / H),
    focusC: fxC, focusY: fy, focusZ: fz, focusS: fs, push: 9 };
  if (mob) mobileLayout(w, h, camZ, vh, vw);
  dim.position.z = fz - 1.6;
  measure();
}

/* ---------- stato ---------- */
let ringRot = 0, snapT = 0, ringVel = 0, dragging = false, lastX = 0, lastT = 0, moved = 0, idle = 0, hover = -1, focus = -1, focusT = 0, spin = 0, spinTarget = 0, closeT = 9;
let heroOut = 0, pLibro = 0, started = false, ringShift = 0, pxW = 0;
const mouse = new THREE.Vector2(9, 9), mSmooth = new THREE.Vector2(), V0 = new THREE.Vector2();
const ray = new THREE.Raycaster();
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mod = (a, n) => ((a % n) + n) % n;
const frontIdx = () => mod(Math.round(-snapT / STEP), N);

const vA = new THREE.Vector3(), qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), eA = new THREE.Euler(), X = new THREE.Vector3(1, 0, 0);
function target(i, t) {
  const a = i * STEP + ringRot;
  let p, q, s = L.ringS, open = 0;
  if (L.flow) {
    // mobile: posizione continua rispetto al libro davanti (0 = centro, ±1 = vicini, oltre = fuori schermo)
    const F = L.flow, d = Math.atan2(Math.sin(a), Math.cos(a)) / STEP, ad = Math.abs(d), sg = Math.sign(d);
    const c1 = Math.min(ad, 1), k = 1 - (1 - F.side) * c1;            // scala: 1 davanti, F.side ai lati
    const wF = books[i].W * L.ringS, wS = WMAX * L.ringS * F.side;
    const x1 = wF / 2 + F.gap + wS / 2;                                // centro del vicino: bordo interno staccato dal libro davanti
    const x = sg * (c1 * x1 + Math.max(0, ad - 1) * (wS + F.gap) * 1.6);
    p = new THREE.Vector3(x, L.ringC.y + Math.sin(t * .9 + i * 1.3) * .04, F.z - c1 * F.back - Math.max(0, ad - 1) * 2);
    eA.set(.04 + Math.sin(t * .6 + i) * .02, -sg * c1 * .42, 0); q = new THREE.Quaternion().setFromEuler(eA);
    s *= k * clamp(2.2 - ad);                                          // i libri lontani spariscono (anche quando fanno il giro)
  } else {
    p = new THREE.Vector3(Math.sin(a) * L.R, Math.sin(t * .9 + i * 1.3) * .07, Math.cos(a) * L.R).applyAxisAngle(X, .1).add(L.ringC);
    eA.set(.1 + Math.sin(t * .6 + i) * .03, a, Math.sin(t * .5 + i * 2) * .025); q = new THREE.Quaternion().setFromEuler(eA);
    if (i === frontIdx() && focus < 0) { s *= 1.08; p.z += .25; }
  }
  p.y -= ringShift; // l'anello scorre con la sezione finché non è in posizione
  if (i === hover && focus < 0 && !L.flow) { p.y += .17; s *= 1.04; }
  const e1 = ease(heroOut);
  if (i === 0 && hasLibro) {
    const lo = sstep(.5, .82, pLibro);
    vA.copy(L.libro); vA.x += lo * books[0].W * .42; vA.y += Math.sin(t * .8) * .05;
    eA.set(.06 - lo * .04, -.85 + pLibro * 1.0 - lo * .15, -.04 + lo * .04); qB.setFromEuler(eA);
    p.lerp(vA, e1); q.slerp(qB, e1); s += (L.libroS * (1 - .16 * lo) - s) * e1; open = lo * e1;
  } else {
    p.y -= e1 * (8 + (i % 3) * 1.4); p.z -= e1 * 3; eA.set(e1 * 1.1, 0, e1 * .4 * (i % 2 ? 1 : -1)); q.multiply(qA.setFromEuler(eA));
  }
  if (focus >= 0) {
    if (i === focus) {
      const o = focusT > .55 ? 1 : 0, w = books[i].W * L.focusS;
      // aperto: la costa al centro dello spazio libero; chiuso: il libro intero al centro
      p.set(L.mob ? w / 2 * o : L.focusC + w / 2 * o, L.focusY, L.focusZ);
      eA.set(.03 + mSmooth.y * .04, (-.22 + mSmooth.x * .06) * (1 - o) + spin, 0); q.setFromEuler(eA);
      s = L.focusS; open = o;
    } else { p.z -= L.push; if (L.flow) s *= .001; } // su mobile gli altri libri non devono spuntare sotto quello aperto
  }
  return { p, q, s, open };
}

/* ---------- interfaccia ---------- */
const hbN = $('#hbN'), hbP = $('#hbP'), hbT = $('#hbT'), cur = $('#cur'), curL = $('#curL'), panel = $('#panel');
let shownFront = -1;
function updateBar() {
  const f = frontIdx(); if (f === shownFront) return; shownFront = f; const b = BOOKS[f];
  dispatchEvent(new CustomEvent('biblio-front', { detail: f }));
  if (!hbN) return;
  hbN.textContent = b.n; hbP.innerHTML = `<span class="swap">${b.catLabel}</span>`;
  hbT.innerHTML = `<span class="swap">${b.short}</span>`;
  const of = $('#openFront'); if (of) of.innerHTML = (b.hard ? 'Apri il libro' : 'Sfoglia') + ' <i>↗</i>';
}
function priceHtml(b) { return b.price == null ? '' : `<div class="p-price"><b>${euro(b.price)}</b>${b.compare ? `<s>${euro(b.compare)}</s>` : ''}<span>Download immediato</span></div>`; }
function fillPanel(i) {
  const b = BOOKS[i];
  const buy = b.price == null
    ? `<a class="pill lg r" href="${b.buy}" target="_blank" rel="noopener">Acquista su Amazon ↗</a><a class="pill ghost lg" href="https://www.amazon.it/dp/B0DQRGZW93" target="_blank" rel="noopener">eBook Kindle ↗</a>`
    : window.__onBuy ? `<button class="pill lg r" id="pBuy">Aggiungi al carrello · ${euro(b.price)}</button>`
    : `<a class="pill lg r" href="${window.__buyHref ? window.__buyHref(b) : b.buy}">Acquista ora ↗</a>`;
  panel.innerHTML = `
   <div class="p-top"><span class="mono">${b.catLabel}</span><button class="x" id="pClose" aria-label="Chiudi">✕</button></div>
   <h3>${b.title.replace(/\|/g, '<br>')}</h3>
   <p class="p-sub">${b.sub}</p>
   <div class="p-meta">${b.meta.map(([v, l]) => `<div><strong>${v}</strong><span>${l}</span></div>`).join('')}</div>
   <h5>${b.listTitle}</h5>
   <ol>${b.chapters.map((c, k) => `<li style="animation-delay:${.35 + k * .06}s">${c}</li>`).join('')}</ol>
   <div class="p-buy">${priceHtml(b)}${buy}</div>
   <div class="p-nav"><button id="pPrev">← ${BOOKS[mod(i - 1, N)].short}</button><button id="pNext">${BOOKS[mod(i + 1, N)].short} →</button></div>`;
  $('#pClose').onclick = closeFocus; $('#pPrev').onclick = () => switchFocus(-1); $('#pNext').onclick = () => switchFocus(1);
  const pb = $('#pBuy'); if (pb) pb.onclick = () => { window.__onBuy(b); pb.textContent = '✓ Aggiunto al carrello'; };
}
function openFocus(i) {
  if (heroOut < .5) { const k = Math.round((ringRot + i * STEP) / TAU); snapT = -i * STEP + k * TAU; }
  focus = i; focusT = 0; spin = 0; spinTarget = 0; hover = -1;
  fillPanel(i); document.body.classList.add('focus'); panel.setAttribute('aria-hidden', 'false');
  window.__lenis && window.__lenis.stop(); setCursor(null); setDPR(DPR_READ);
}
function closeFocus() { if (focus < 0) return; focus = -1; closeT = 0; document.body.classList.remove('focus'); panel.setAttribute('aria-hidden', 'true'); window.__lenis && window.__lenis.start(); setDPR(DPR_SCROLL); }
function switchFocus(d) { if (focus < 0) return; openFocus(mod(focus + d, N)); }
function setCursor(t) { if (!cur) return; if (!t) { cur.classList.remove('show'); return; } curL.textContent = t; cur.classList.add('show'); }
function goTo(i) { const k = Math.round((ringRot + i * STEP) / TAU); snapT = -i * STEP + k * TAU; idle = 0; }

$('#prev') && ($('#prev').onclick = () => { snapT += STEP; idle = 0; });
$('#next') && ($('#next').onclick = () => { snapT -= STEP; idle = 0; });
$('#openFront') && ($('#openFront').onclick = () => openFocus(frontIdx()));
document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openFocus(+o.dataset.open); } });
addEventListener('keydown', e => {
  if (e.key === 'Escape') closeFocus();
  if (e.key === 'ArrowRight') { focus >= 0 ? switchFocus(1) : ringInView() && (snapT -= STEP, idle = 0); }
  if (e.key === 'ArrowLeft') { focus >= 0 ? switchFocus(-1) : ringInView() && (snapT += STEP, idle = 0); }
});
window.__biblio = { open: openFocus, goTo, books: BOOKS };

/* ---------- puntatore ---------- */
function pick() {
  if (mouse.x > 5) return -1;
  ray.setFromCamera(mouse, camera);
  const list = focus >= 0 ? [books[focus].g] : heroOut < .35 && ringInView() ? books.map(b => b.g) : (hasLibro && pLibro > 0 && pLibro < 1 && heroOut > .9 ? [books[0].g] : []);
  const hit = ray.intersectObjects(list, true)[0]; return hit ? hit.object.userData.idx : -1;
}
addEventListener('pointermove', e => {
  if (cur) cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (dragging) {
    const dx = e.clientX - lastX, now = performance.now(); moved += Math.abs(dx);
    if (focus >= 0) spinTarget += dx * .008; else { ringRot += dx * .0055; ringVel = dx * .0055 / Math.max(.008, (now - lastT) / 1000); }
    lastX = e.clientX; lastT = now; idle = 0;
  }
}, { passive: true });
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastT = performance.now(); moved = 0; ringVel = 0; canvas.classList.add('grabbing');
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
addEventListener('pointerup', () => {
  if (!dragging) return; dragging = false; canvas.classList.remove('grabbing');
  if (moved >= 7 && focus < 0) { const proj = ringRot + clamp(ringVel, -12, 12) * .18; snapT = Math.round(proj / STEP) * STEP; }
  if (focus >= 0) spinTarget = 0;
});
canvas.addEventListener('click', e => {
  if (moved >= 7) return;
  dragging = false; canvas.classList.remove('grabbing');
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const i = pick();
  if (focus >= 0) { if (i !== focus) closeFocus(); } else if (i >= 0) openFocus(i);
});
canvas.addEventListener('pointerleave', () => { if (!dragging) mouse.set(9, 9); hover = -1; setCursor(null); });

/* ---------- scroll ---------- */
let libroTop = 0, libroH = 1, endTop = 1e9, ringTop = 0, stageTop = 0;
const steps = [...document.querySelectorAll('.step')], progB = [...document.querySelectorAll('.prog b')];
const absTop = el => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; };
function measure() {
  const r = $('#biblio'); ringTop = absTop(r);
  // se la sezione è più alta dello schermo, la parte in più sta sopra (titolo): l'anello si ferma dopo
  stageTop = ringTop + Math.max(0, r.offsetHeight - innerHeight);
  if (hasLibro) { const l = $('#libro'); libroTop = absTop(l); libroH = l.offsetHeight; }
  const end = $('#biblioteca'); endTop = end ? absTop(end) : hasLibro ? libroTop + libroH : ringTop + r.offsetHeight;
}
addEventListener('st-refresh', () => { measure(); onScroll(); });
const ringInView = () => scrollY + innerHeight * .5 > ringTop && scrollY < stageTop + innerHeight * .5;
const inRange = () => scrollY + innerHeight > ringTop - 80 && scrollY < endTop + 20;
function onScroll() {
  const y = scrollY, h = innerHeight;
  heroOut = clamp((y - stageTop) / (h * .9));
  ringShift = Math.max(0, stageTop - y) * pxW;
  if (hasLibro) {
    pLibro = clamp((y - libroTop) / (libroH - h));
    const si = Math.min(2, Math.floor(pLibro * 3.2)); steps.forEach((s, k) => s.classList.toggle('on', k === si));
    progB.forEach((b, k) => b.style.transform = `scaleX(${clamp(pLibro * 3 - k)})`);
  }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { layout(); onScroll(); });

/* ---------- loop ---------- */
let canvasHidden = false;
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  if (!started) { if (books.length && inRange() && !document.documentElement.classList.contains('intro')) { started = true; clock.getDelta(); } else return; }
  closeT += dt;
  const hidden = focus < 0 && !inRange() && closeT > 1.4;
  if (hidden) { if (!canvasHidden) { canvasHidden = true; canvas.style.visibility = 'hidden'; if (hover >= 0) { hover = -1; canvas.classList.remove('over'); setCursor(null); } } return; }
  if (canvasHidden) { canvasHidden = false; canvas.style.visibility = ''; }
  mSmooth.lerp(mouse.x > 5 ? V0 : mouse, 1 - Math.exp(-dt * 3));

  if (!dragging) {
    idle += dt;
    if (focus < 0 && hover < 0 && idle > 4.2 && ringInView() && !document.hidden) { snapT -= STEP; idle = 0; }
    ringRot += (snapT - ringRot) * (1 - Math.exp(-dt * 4.2));
  } else snapT = ringRot;
  if (focus >= 0) { focusT += dt; spin += (spinTarget - spin) * (1 - Math.exp(-dt * (dragging ? 14 : 5))); }

  if (!dragging) {
    const h = focus >= 0 ? -1 : pick();
    if (h !== hover) { hover = h; canvas.classList.toggle('over', h >= 0); setCursor(h >= 0 ? (BOOKS[h].hard ? 'APRI IL LIBRO' : 'SFOGLIA') : null); }
  }
  updateBar();

  for (const b of books) {
    if (b.delay > 0) { b.delay -= dt; continue; }
    const T = target(b.idx, t);
    const k = 1 - Math.exp(-dt * (b.idx === focus ? 6 : (heroOut > .02 ? 7.5 : 5)));
    b.g.position.lerp(T.p, k); b.g.quaternion.slerp(T.q, k); b.s += (T.s - b.s) * k; b.g.scale.setScalar(b.s);
    b.open += (T.open - b.open) * (1 - Math.exp(-dt * 4));
    b.pivot.rotation.y = -ease(clamp(b.open)) * Math.PI * .985;
  }
  dim.material.opacity += ((focus >= 0 ? .82 : 0) - dim.material.opacity) * (1 - Math.exp(-dt * 5));

  dust.rotation.y = t * .012; dust.position.y = Math.sin(t * .2) * .15; acidDust.rotation.y = -t * .02; acidDust.position.y = Math.sin(t * .3) * .3;
  const par = focus >= 0 ? .12 : .45, kc = 1 - Math.exp(-dt * 3.5);
  camera.position.x += (mSmooth.x * par - camera.position.x) * kc;
  camera.position.y += (.35 + mSmooth.y * par * .5 - camera.position.y) * kc;
  camera.lookAt(0, camera.position.y * .3, 0);
  renderer.render(scene, camera);
}

/* ---------- avvio ---------- */
(async () => {
  try { await Promise.race([Promise.all([document.fonts.load('500 60px "Inter Tight"'), document.fonts.load('600 22px "Inter Tight"'), document.fonts.load('400 30px "Inter Tight"')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
  await Promise.all(BOOKS.map(b => new Promise(res => { const im = new Image(); im.onload = () => { b.image = im; res(); }; im.onerror = () => res(); im.src = b.img; })));
  BOOKS.forEach((b, i) => books.push(makeBook(b, i)));
  layout(); onScroll();
  dispatchEvent(new Event('biblio-ready'));
  renderer.compile(scene, camera);
  scene.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.map && renderer.initTexture(m.map)); });
  renderer.render(scene, camera);
  frame();
})();
