/* Pagina principale. Usa common.js (window.SG) e i dati dei libri. Il 3D è in biblio3d.js. */
const { lenis, $, $$, reveal, magnet } = window.SG;
const mm = gsap.matchMedia();

/* ---------- la mia storia: fisarmonica ---------- */
$$('.acc-it').forEach(it => it.querySelector('.acc-h').addEventListener('click', () => {
  const on = !it.classList.contains('on');
  $$('.acc-it').forEach(x => x.classList.toggle('on', x === it && on));
  setTimeout(() => ScrollTrigger.refresh(), 850);
}));

/* ---------- il metodo: schede ---------- */
const mR = $('#mR'), panes = $$('.m-pane', mR), tabs = $$('#mTabs .orow');
tabs.forEach((t, i) => t.addEventListener('click', () => {
  const on = !t.classList.contains('on');
  tabs.forEach((x, k) => x.classList.toggle('on', on && k === i));
  panes.forEach((p, k) => p.classList.toggle('on', on && k === i));
  mR.classList.toggle('open', on);
}));

/* ---------- programmi 3D ---------- */
const PROGS = [
  { tag: 'Sempre con te', name: 'Giacomo Spazzini AI Coach', img: 'assets/prog-bg-ai.jpg', phone: 'assets/prog-ai-coach.png', pl: 'WhatsApp · Telegram',
    sub: 'Il mio clone AI sempre con te, su WhatsApp. Il primo coach digitale personalizzato in Italia che ti segue ogni giorno, 24 ore su 24.',
    list: ['Coaching H24', 'Messaggi audio personalizzati', 'Protocolli multidisciplinari basati sui 7 pilastri'], cta: 'Scopri AI Coach' },
  { tag: '60 minuti', name: 'One Shot 1:1 Coaching', img: 'assets/prog-bg.jpg', pl: 'In sede o online',
    sub: 'Un’ora di confronto diretto con Giacomo Spazzini per analizzare obiettivi e stato attuale e trovare le leve più strategiche.',
    list: ['In sede a Desenzano del Garda o online', 'Analisi di abitudini, energia, stress, sonno', 'Feedback concreto e priorità chiare'], cta: 'Prenota la sessione' },
  { tag: 'Light / Full', name: 'GS Biohacking Experience', img: 'assets/exp-3.jpg', pl: 'Una giornata a GS LOFT',
    sub: 'Un’intera giornata dedicata alla tua trasformazione fisica e mentale, con Giacomo Spazzini e il team di GS LOFT.',
    list: ['Consulenza one-to-one con Giacomo', 'Ice bath, meditazione, infrared LED therapy', 'Test VO2max, body scan, training avanzato'], cta: 'Vivi l’esperienza' },
  { tag: 'Solo 20 posti all’anno', name: 'Platinum Membership', img: 'assets/prog-platinum.jpg', pl: 'Prezzo su richiesta',
    sub: 'Giacomo Spazzini, il tuo biohacking coach personale. Per imprenditori, top manager e celebrità che vogliono vivere più a lungo e in forma.',
    list: ['Sessioni 1:1 mensili e supporto WhatsApp', 'Test di medicina di precisione', 'Accesso al team multidisciplinare GS LOFT'], cta: 'Candidati' },
];
const ring = $('#pgRing'), det = $('#pgDetail'), dots = $('#pgDots'), counter = $('#pgCounter');
PROGS.forEach((p, i) => {
  const c = document.createElement('div'); c.className = 'pg-card';
  c.innerHTML = `<div class="pg-in"><div class="pg-face"><img class="bg" src="${p.img}" alt="">
    <div class="pg-top"><span>0${i + 1} / 04</span><span>GS LOFT</span></div>${p.phone ? `<img class="pg-phone" src="${p.phone}" alt="">` : ''}
    <div class="pg-z"><span class="n">PROGRAMMA 0${i + 1}</span><h4>${p.name}</h4><span class="pl">${p.pl}</span></div><div class="pg-glare"></div></div></div>`;
  ring.appendChild(c);
  const d = document.createElement('div'); d.className = 'pg-d' + (i ? '' : ' on');
  d.innerHTML = `<span class="tag">${p.tag}</span><h3>${p.name}</h3><p>${p.sub}</p><ul>${p.list.map(l => `<li>${l}</li>`).join('')}</ul><a class="pill lg" href="#agisci" data-to="#agisci">${p.cta} <i>→</i></a>`;
  det.appendChild(d);
  const b = document.createElement('button'); b.setAttribute('aria-label', p.name); if (!i) b.classList.add('on'); dots.appendChild(b);
});
const cards = $$('.pg-card', ring), dEls = $$('.pg-d', det), dBtns = $$('button', dots), STEP = 34;
let pgActive = 0, pgST = null;
function setActive(i) { if (i === pgActive) return; pgActive = i; dEls.forEach((d, k) => d.classList.toggle('on', k === i)); dBtns.forEach((d, k) => d.classList.toggle('on', k === i)); counter.textContent = '0' + (i + 1); }
function layoutRing(p) {
  const w = ring.offsetWidth, R = w * 1.75, rot = -p * STEP * (PROGS.length - 1);
  cards.forEach((c, i) => {
    const a = i * STEP + rot, ad = Math.abs(a);
    c.style.transform = `translateZ(${-R}px) rotateY(${a}deg) translateZ(${R}px)`;
    c.style.opacity = Math.max(0, 1 - Math.max(0, ad - 4) / 75);
    c.style.zIndex = 100 - Math.round(ad);
    c.style.filter = `brightness(${Math.max(.35, 1 - ad / 70)})`;
  });
  setActive(Math.min(PROGS.length - 1, Math.round(p * (PROGS.length - 1))));
}
mm.add('(min-width: 861px)', () => {
  layoutRing(0);
  pgST = ScrollTrigger.create({ trigger: '#pgPin', start: 'top top', end: '+=' + (PROGS.length * 75) + '%', pin: true, scrub: true,
    snap: { snapTo: 1 / (PROGS.length - 1), duration: { min: .25, max: .7 }, ease: 'power2.inOut' }, onUpdate: s => layoutRing(s.progress) });
  return () => { pgST = null; };
});
const toProg = i => pgST && lenis.scrollTo(pgST.start + (pgST.end - pgST.start) * i / (PROGS.length - 1), { duration: 1.2 });
dBtns.forEach((b, i) => b.addEventListener('click', () => toProg(i)));
cards.forEach((c, i) => {
  const inn = $('.pg-in', c), face = $('.pg-face', c);
  c.addEventListener('pointermove', e => {
    const r = face.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    inn.style.transform = `rotateY(${(x - .5) * 16}deg) rotateX(${(.5 - y) * 12}deg)`;
    face.style.setProperty('--gx', x * 100 + '%'); face.style.setProperty('--gy', y * 100 + '%');
    face.style.setProperty('--px', (x - .5) * -18 + 'px'); face.style.setProperty('--py', (y - .5) * -18 + 'px');
  });
  c.addEventListener('pointerleave', () => { inn.style.transform = ''; face.style.setProperty('--px', '0px'); face.style.setProperty('--py', '0px'); });
  c.addEventListener('click', () => { if (pgST && i !== pgActive) toProg(i); else lenis.scrollTo('#agisci', { duration: 1.6 }); });
});

/* ---------- cerchio "Scopri il programma" che segue il mouse ---------- */
const sec = $('#programma'), circle = $('#circle');
const cx = gsap.quickTo(circle, 'x', { duration: .7, ease: 'power3.out' }), cy = gsap.quickTo(circle, 'y', { duration: .7, ease: 'power3.out' });
const centre = () => { cx(sec.offsetWidth / 2); cy(sec.offsetHeight / 2); };
gsap.set(circle, { x: () => sec.offsetWidth / 2, y: () => sec.offsetHeight / 2 });
sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); cx(e.clientX - r.left); cy(e.clientY - r.top); });
sec.addEventListener('pointerleave', centre);

/* ---------- form ---------- */
$('#form').addEventListener('submit', e => { e.preventDefault(); $('#formOk').textContent = '✓ Richiesta ricevuta (demo: nessun dato inviato).'; e.target.reset(); });

/* ---------- intro "INIZIA QUI" ---------- */
lenis.stop();
let introDone = false;
const heroWords = $$('.hero h1 .w>i');
function enter() {
  if (introDone) return; introDone = true;
  const tl = gsap.timeline();
  tl.to('#intro .go', { scale: 0, duration: .45, ease: 'back.in(2)' })
    .to('#intro .row.a', { xPercent: -30, duration: 1.2, ease: 'expo.inOut' }, 0)
    .to('#intro .row.b', { xPercent: 30, duration: 1.2, ease: 'expo.inOut' }, 0)
    .to('#intro', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, .35)
    .add(() => { document.documentElement.classList.remove('intro'); $('#intro').style.display = 'none'; lenis.start(); reveal(); magnet(); ScrollTrigger.refresh(); }, 1.3);
}
gsap.set('#intro', { clipPath: 'inset(0 0 0% 0)' });
gsap.from('#intro .row', { yPercent: 100, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .12 });
gsap.from('#intro .sub, #intro .go', { opacity: 0, y: 20, duration: 1, delay: .6, ease: 'expo.out', stagger: .1 });
$('#intro').addEventListener('click', enter);
addEventListener('wheel', e => { if (!introDone && e.deltaY > 8) enter(); }, { passive: true });
addEventListener('touchmove', () => { if (!introDone) enter(); }, { passive: true });
addEventListener('keydown', e => { if (!introDone && ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) enter(); });
if (matchMedia('(prefers-reduced-motion: reduce)').matches || location.hash === '#skip') enter();

// il titolo dell'hero entra appena finisce l'intro (reveal() lo gestisce con le altre scritte)
void heroWords;
