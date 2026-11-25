/* Animazioni del sito (GSAP + ScrollTrigger + Lenis). La biblioteca 3D è in biblio3d.js. */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  /* ---------- scorrimento morbido ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  ScrollTrigger.addEventListener('refresh', () => dispatchEvent(new Event('st-refresh')));
  // la griglia degli ebook nasce dopo (biblio3d.js) e le immagini cambiano le altezze: rimisura
  addEventListener('biblio-ready', () => requestAnimationFrame(() => ScrollTrigger.refresh()));
  addEventListener('load', () => ScrollTrigger.refresh());

  $$('[data-to]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.dataset.to); if (!t) return;
    e.preventDefault(); lenis.scrollTo(t, { duration: 1.6, easing: x => 1 - Math.pow(1 - x, 4) });
  }));

  /* ---------- nav ---------- */
  const nav = $('#snav');
  lenis.on('scroll', ({ scroll, direction }) => {
    nav.classList.toggle('solidbg', scroll > 80);
    nav.classList.toggle('hide', direction === 1 && scroll > 400 && !document.body.classList.contains('focus'));
  });

  /* ---------- testo a parole ---------- */
  function split(el) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = part; w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el); return $$('.w>i', el);
  }
  const splits = new Map();
  $$('[data-split]').forEach(el => { const ws = split(el); splits.set(el, ws); gsap.set(ws, { yPercent: 115 }); });

  /* ---------- statement (parola per parola con lo scroll) ---------- */
  const stmt = $('#stmt');
  const sw = [];
  (function wrapWords(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) f.appendChild(document.createTextNode(' ')); else { const s = document.createElement('span'); s.className = 'sw'; s.textContent = p; sw.push(s); f.appendChild(s); } });
        n.replaceWith(f);
      } else if (n.nodeType === 1) wrapWords(n);
    });
  })(stmt);
  gsap.to(sw, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: stmt, start: 'top 82%', end: 'bottom 45%', scrub: true } });

  /* ---------- contatori ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('it-IT') }) });
  });

  /* ---------- titoli e blocchi che entrano ---------- */
  splits.forEach((ws, el) => {
    if (el.classList.contains('hero-h1')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () =>
      gsap.to(ws, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06 }) });
  });
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 88%', once: true,
    onEnter: b => gsap.fromTo(b, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
  });
  gsap.set('[data-rise]', { opacity: 0 });
  $$('[data-par]').forEach(img => gsap.fromTo(img, { yPercent: -10 }, { yPercent: 6, ease: 'none',
    scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.utils.toArray('.ql').forEach((q, i) => gsap.from(q, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', delay: i * 0.1,
    scrollTrigger: { trigger: q, start: 'top 90%', once: true } }));

  /* ---------- hero ---------- */
  const heroImg = $('#heroMedia img');
  mm.add('(min-width: 861px)', () => {
    gsap.to('#heroMedia', { clipPath: 'inset(7% 4% 14% 4%)', ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } });
  });
  gsap.to('.hero-c', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#home', start: '20% top', end: 'bottom top', scrub: true } });
  gsap.set('#heroMedia', { clipPath: 'inset(0% 0% 0% 0%)' });

  /* ---------- fascia gialla ---------- */
  const band = gsap.to('#band1', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
  lenis.on('scroll', ({ velocity }) => { band.timeScale(1 + Math.min(6, Math.abs(velocity) * 0.25)); });
  gsap.from('.band', { rotate: -2.5, scale: 1.04, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- PROGRAMMI 3D ---------- */
  const PROGS = [
    { tag: 'Sempre con te', name: 'Giacomo Spazzini AI Coach', short: 'AI COACH', img: 'assets/prog-bg-ai.jpg', phone: 'assets/prog-ai-coach.png', pill: 'WhatsApp · Telegram',
      sub: 'Il mio clone AI sempre con te, su WhatsApp. Il primo coach digitale personalizzato in Italia che ti segue ogni giorno, 24 ore su 24, allenato sul Metodo Spazzini.',
      list: ['Coaching H24', 'Messaggi audio personalizzati', 'Protocolli multidisciplinari basati sui 7 pilastri'], cta: 'Scopri AI Coach' },
    { tag: '60 minuti', name: 'One Shot 1:1 Coaching', short: 'ONE SHOT 1:1', img: 'assets/prog-bg.jpg', pill: 'In sede o online',
      sub: 'Un’ora di confronto diretto con Giacomo Spazzini per analizzare obiettivi e stato attuale, e individuare le leve più strategiche per trasformare corpo, mente e stile di vita.',
      list: ['In sede a Desenzano del Garda o online', 'Analisi di abitudini, energia, stress, sonno, mindset', 'Feedback concreto e priorità chiare'], cta: 'Prenota la tua sessione' },
    { tag: 'Light / Full', name: 'GS Biohacking Experience', short: 'BIOHACKING EXP.', img: 'assets/exp-3.jpg', pill: 'Una giornata a GS LOFT',
      sub: 'Un’intera giornata dedicata alla tua trasformazione fisica e mentale, affiancato da Giacomo Spazzini e dal team multidisciplinare di GS LOFT.',
      list: ['Consulenza one-to-one con Giacomo Spazzini', 'Ice bath, meditazione, infrared LED therapy', 'Test VO2max, body scan, training avanzato'], cta: 'Vivi la tua esperienza' },
    { tag: 'Solo 20 posti all’anno', name: 'Platinum Membership', short: 'PLATINUM', img: 'assets/prog-platinum.jpg', pill: 'Prezzo su richiesta',
      sub: 'Giacomo Spazzini, il tuo biohacking coach personale. Un percorso per imprenditori, top manager e celebrità che vogliono vivere più a lungo, in forma, con il pieno controllo della propria evoluzione.',
      list: ['Sessioni 1:1 mensili e supporto diretto WhatsApp', 'Test di medicina di precisione e body scan avanzato', 'Accesso al team multidisciplinare di GS LOFT'], cta: 'Candidati alla Platinum' },
  ];
  const ring = $('#pgRing'), det = $('#pgDetail'), dots = $('#pgDots'), counter = $('#pgCounter');
  PROGS.forEach((p, i) => {
    const c = document.createElement('div'); c.className = 'pg-card'; c.dataset.i = i;
    c.innerHTML = `<div class="pg-in"><div class="pg-face"><img class="bg" src="${p.img}" alt="">
      <div class="pg-top"><span>0${i + 1} / 04</span><span>GS LOFT</span></div>
      ${p.phone ? `<img class="pg-phone" src="${p.phone}" alt="">` : ''}
      <div class="pg-z"><span class="n">PROGRAMMA 0${i + 1}</span><h4>${p.name}</h4><span class="pill">${p.pill}</span></div>
      <div class="pg-glare"></div></div></div>`;
    ring.appendChild(c);
    const d = document.createElement('div'); d.className = 'pg-d' + (i ? '' : ' on');
    d.innerHTML = `<span class="tag">${p.tag}</span><h3>${p.name}</h3><p>${p.sub}</p><ul>${p.list.map(l => `<li>${l}</li>`).join('')}</ul>
      <a class="btn acid" href="#agisci" data-go>${p.cta} →</a>`;
    det.appendChild(d);
    const b = document.createElement('button'); b.setAttribute('aria-label', p.name); if (!i) b.classList.add('on'); dots.appendChild(b);
  });
  $$('[data-go]', det).forEach(a => a.addEventListener('click', e => { e.preventDefault(); lenis.scrollTo('#agisci', { duration: 1.6 }); }));
  const cards = $$('.pg-card', ring), dEls = $$('.pg-d', det), dBtns = $$('button', dots);
  const STEP = 34;
  let pgActive = 0, pgST = null;
  function setActive(i) {
    if (i === pgActive) return; pgActive = i;
    dEls.forEach((d, k) => d.classList.toggle('on', k === i));
    dBtns.forEach((d, k) => d.classList.toggle('on', k === i));
    counter.textContent = '0' + (i + 1);
  }
  function layoutRing(p) {
    const w = ring.offsetWidth, R = w * 1.75;
    const rot = -p * STEP * (PROGS.length - 1);
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
      snap: { snapTo: 1 / (PROGS.length - 1), duration: { min: .25, max: .7 }, ease: 'power2.inOut' },
      onUpdate: s => layoutRing(s.progress) });
    gsap.from('#pgRing', { rotateX: 18, y: 120, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#programmi', start: 'top 70%', once: true } });
    return () => { pgST = null; cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.style.filter = ''; }); };
  });
  dBtns.forEach((b, i) => b.addEventListener('click', () => {
    if (!pgST) return; lenis.scrollTo(pgST.start + (pgST.end - pgST.start) * i / (PROGS.length - 1), { duration: 1.2 });
  }));
  cards.forEach((c, i) => {
    const inn = $('.pg-in', c), face = $('.pg-face', c);
    c.addEventListener('pointermove', e => {
      const r = face.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      inn.style.transform = `rotateY(${(x - .5) * 16}deg) rotateX(${(.5 - y) * 12}deg)`;
      face.style.setProperty('--gx', x * 100 + '%'); face.style.setProperty('--gy', y * 100 + '%');
      face.style.setProperty('--px', (x - .5) * -18 + 'px'); face.style.setProperty('--py', (y - .5) * -18 + 'px');
    });
    c.addEventListener('pointerleave', () => { inn.style.transform = ''; face.style.setProperty('--px', '0px'); face.style.setProperty('--py', '0px'); });
    c.addEventListener('click', () => {
      if (pgST && i !== pgActive) lenis.scrollTo(pgST.start + (pgST.end - pgST.start) * i / (PROGS.length - 1), { duration: 1.2 });
      else lenis.scrollTo('#agisci', { duration: 1.6 });
    });
  });
  // il palco segue un poco il mouse
  $('#pgStage').addEventListener('pointermove', e => {
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(ring, { rotateX: ((e.clientY - r.top) / r.height - .5) * -8, duration: 1, ease: 'power3.out' });
  });

  /* ---------- 7 PILASTRI (orizzontale) ---------- */
  const PIL = [
    ['Prevenzione e test di precisione', 'Analisi genetiche, epigenetiche, ormonali e del microbiota. Scopri cosa accade nel tuo corpo prima ancora che compaiano sintomi.'],
    ['Allenamento personalizzato', 'Costruito su test scientifici: VO2max, body scan, resting metabolic rate. Ogni protocollo è ultra personalizzato.'],
    ['Nutrizione funzionale', 'Impara a nutrirti secondo il tuo stile di vita, i tuoi obiettivi e le tue specifiche esigenze.'],
    ['Integrazione mirata', 'Integra con metodo sulla base delle tue carenze, dei test e di dati oggettivi.'],
    ['Ottimizzazione del sonno', 'Analisi del ritmo circadiano, uso di wearable, interventi sul recovery. Dormire meglio significa vivere meglio.'],
    ['Gestione strategica del tempo', 'Time coaching, focus, routine ad alte prestazioni. Per guidare le tue giornate, non subirle.'],
    ['Stress e mindset', 'Tecniche di gestione dello stress e di mental coaching. Per pensare, scegliere e agire con efficacia.'],
  ];
  const track = $('#pilTrack');
  PIL.forEach(([t, d], i) => {
    const a = document.createElement('article'); a.className = 'pil-card';
    a.innerHTML = `<span class="big">0${i + 1}</span><div><h3>${t}</h3><p>${d}</p></div>`;
    track.appendChild(a);
  });
  mm.add('(min-width: 861px)', () => {
    const dist = () => track.scrollWidth - innerWidth;
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '#pilPin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: s => gsap.set('#pilBar', { scaleX: s.progress }) } });
    $$('.pil-card', track).forEach(c => gsap.from(c, { rotateY: -25, opacity: .2, transformPerspective: 900, ease: 'none',
      scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 100%', end: 'left 55%', scrub: true } }));
  });

  /* ---------- LA MIA STORIA ---------- */
  const stImgs = $$('.st-img'), stD = $('#stD');
  const chs = $$('.st-ch');
  chs.forEach((ch, i) => ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 55%',
    onToggle: s => { if (!s.isActive) return;
      chs.forEach((c, k) => c.classList.toggle('on', k === i));
      stImgs.forEach((im, k) => im.classList.toggle('on', k <= i));
      stImgs.forEach((im, k) => im.style.zIndex = k);
      stD.style.transform = `translateY(${-i * 120}px)`; } }));

  /* ---------- galleria ---------- */
  const gal = $('#galTrk');
  const pics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `assets/loft-${n}.jpg`);
  [...pics, ...pics].forEach(src => { const d = document.createElement('div'); d.className = 'gal-it'; d.innerHTML = `<img src="${src}" alt="" loading="lazy">`; gal.appendChild(d); });
  let gx = 0, gv = 0, skew = 0;
  lenis.on('scroll', ({ velocity }) => { gv = velocity; });
  gsap.ticker.add(() => {
    const half = gal.scrollWidth / 2; if (!half) return;
    gx -= 0.6 + Math.abs(gv) * 0.35; if (-gx > half) gx += half;
    skew += ((Math.max(-8, Math.min(8, gv * 0.4))) - skew) * 0.1; gv *= 0.92;
    gal.style.transform = `translate3d(${gx}px,0,0) skewX(${-skew}deg)`;
  });

  /* ---------- footer ---------- */
  gsap.from('#footName img', { yPercent: 70, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.sfoot', start: 'top 85%', end: 'bottom bottom', scrub: true } });

  /* ---------- form ---------- */
  $('#form').addEventListener('submit', e => { e.preventDefault(); $('#formOk').textContent = '✓ Candidatura ricevuta (demo: nessun dato inviato).'; e.target.reset(); });

  /* ---------- cursore e pulsanti magnetici ---------- */
  const cur = $('#cur');
  addEventListener('pointermove', e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });
  document.addEventListener('pointerover', e => cur.classList.toggle('hov', !!e.target.closest('a,button,.pg-card,.ql,label')));
  $$('.mag').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: 'power3.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });

  /* ---------- caricamento + apertura ---------- */
  const heroWords = splits.get($('.hero-h1'));
  const pre = { v: 0 };
  const intro = gsap.timeline({ paused: true });
  intro.to('#pre .pre-logo', { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'expo.inOut' })
    .to(pre, { v: 100, duration: 1.1, ease: 'expo.inOut', onUpdate: () => { $('#preN').textContent = Math.round(pre.v) + '%'; gsap.set('#pre .pre-bar i', { scaleX: pre.v / 100 }); } }, 0)
    .to('#pre .pre-in', { yPercent: -40, opacity: 0, duration: .7, ease: 'power3.in' }, '+=.15')
    .to('#pre', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.25')
    .fromTo(heroImg, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, '-=.9')
    .to(heroWords, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .05 }, '-=1.9')
    .to('.hero-name img', { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'expo.inOut' }, '-=1.4')
    .from('[data-fade]', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, '-=1')
    .from('#snav', { yPercent: -100, duration: 1, ease: 'expo.out' }, '-=1')
    .add(() => { lenis.start(); $('#pre').style.display = 'none'; ScrollTrigger.refresh(); });
  gsap.set('#pre', { clipPath: 'inset(0 0 0% 0)' });
  const go = () => reduce ? intro.progress(1) : intro.play();
  Promise.race([Promise.all([document.fonts.ready, new Promise(r => heroImg.complete ? r() : heroImg.addEventListener('load', r, { once: true }))]), new Promise(r => setTimeout(r, 3000))]).then(go);
})();
