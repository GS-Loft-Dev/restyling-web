/* Comune a sito e shop: scorrimento morbido, menu, testi che salgono, blocchi che entrano, cursore, pulsanti magnetici.
   Espone window.SG = { lenis, $, $$, split, reveal(), ready(fn) } */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener('refresh', () => dispatchEvent(new Event('st-refresh')));
  addEventListener('biblio-ready', () => requestAnimationFrame(() => ScrollTrigger.refresh()));
  addEventListener('load', () => ScrollTrigger.refresh());

  const go = sel => { const t = $(sel); if (t) lenis.scrollTo(t, { duration: 1.6, easing: x => 1 - Math.pow(1 - x, 4) }); };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-to]'); if (!a) return;
    e.preventDefault(); closeMenu(); setTimeout(() => go(a.dataset.to), document.body.classList.contains('menu-open') ? 500 : 0);
  });

  /* menu */
  const closeMenu = () => { if (!document.body.classList.contains('menu-open')) return; document.body.classList.remove('menu-open'); $('#menu').setAttribute('aria-hidden', 'true'); lenis.start(); };
  $('#burger') && $('#burger').addEventListener('click', () => {
    const on = document.body.classList.toggle('menu-open'); on ? lenis.stop() : lenis.start(); $('#menu').setAttribute('aria-hidden', on ? 'false' : 'true');
    $$('.menu nav a').forEach((a, i) => a.style.transitionDelay = on ? (.15 + i * .05) + 's' : '0s');
  });
  $$('#menu [data-close]').forEach(el => el.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  // barra di avanzamento nella barra verticale
  const rp = $('#railP');
  if (rp) lenis.on('scroll', ({ progress }) => { rp.style.transform = `scaleY(${progress || 0})`; });

  /* testi a parole */
  function split(el) {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w'; const i = document.createElement('i'); i.textContent = p; w.appendChild(i); f.appendChild(w);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); return $$('.w>i', el);
  }
  const splits = new Map();
  $$('[data-split]').forEach(el => { const ws = split(el); splits.set(el, ws); gsap.set(ws, { yPercent: 118 }); });
  gsap.set('[data-rise]', { opacity: 0, y: 50 });
  gsap.set('[data-reveal]', { clipPath: 'inset(0 0 100% 0)' });

  function reveal() {
    splits.forEach((ws, el) => ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(ws, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: .05 }) }));
    ScrollTrigger.batch('[data-rise]', { start: 'top 90%', once: true,
      onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .08 }) });
    $$('[data-reveal]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => {
      gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'expo.inOut' });
      const im = el.querySelector('img'); if (im) gsap.fromTo(im, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
    } }));
    $$('[data-par]').forEach(img => gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    const fn = $('.big-name img');
    if (fn) gsap.from(fn, { yPercent: 60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.sfoot', start: 'top 90%', end: 'bottom bottom', scrub: true } });
  }

  /* cursore e magneti */
  const cur = $('#cur');
  if (cur) {
    addEventListener('pointermove', e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });
    document.addEventListener('pointerover', e => cur.classList.toggle('hov', !!e.target.closest('a,button,label,.card .book')));
  }
  function magnet(root = document) {
    $$('.pill.lg, .orow, .arrow', root).forEach(el => {
      if (el.dataset.mag) return; el.dataset.mag = 1;
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' }); });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.45)' }));
    });
  }

  /* libro in CSS 3D (griglie): si inclina seguendo il mouse */
  function tiltBook(book) {
    const bk = book.querySelector('.bk');
    book.addEventListener('pointermove', e => {
      const r = bk.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      bk.style.setProperty('--ry', `${(px - .5) * 30 - 8}deg`); bk.style.setProperty('--rx', `${(.5 - py) * 16}deg`);
      bk.style.setProperty('--gx', px * 100 + '%'); bk.style.setProperty('--gy', py * 100 + '%');
    });
    book.addEventListener('pointerleave', () => { bk.style.removeProperty('--ry'); bk.style.removeProperty('--rx'); });
  }
  const bookHtml = (b, z = 7) => `<div class="book" style="--bz:${z}px"><div class="bk"><div class="bk-back"></div><span class="bk-edge"></span><div class="bk-front"><img src="${b.img}" alt="${b.short}" loading="lazy"><span class="bk-glare"></span></div></div><span class="bk-shadow"></span></div>`;

  const readyFns = [];
  window.SG = { lenis, $, $$, split, reveal, magnet, tiltBook, bookHtml, go, ready: fn => readyFns.push(fn), _run: () => readyFns.forEach(f => f()) };
})();
