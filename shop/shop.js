/* Shop: carrello finto, sezioni dello shop vero (chat, problema/soluzione, protocolli, bundle, 60 giorni, ebook famiglia).
   I libri 3D sono in ../biblio3d.js, i dati in ../books.js. */
import { BOOKS, euro } from '../books.js';
const { lenis, $, $$, reveal, magnet, tiltBook, bookHtml } = window.SG;
const byId = id => BOOKS.find(b => b.id === id);

/* ---------- carrello ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('gs-cart') || '[]'); } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('gs-cart', JSON.stringify(cart)); } catch (e) {} };
function add(item) {
  const ex = cart.find(c => c.key === item.key);
  ex ? ex.qty++ : cart.push({ ...item, qty: 1 });
  save(); renderCart(); bump(); toast(item.name);
}
function renderCart() {
  const n = cart.reduce((s, c) => s + c.qty, 0);
  $('#cartN').textContent = n;
  $('#cartTot').textContent = euro(cart.reduce((s, c) => s + c.qty * c.price, 0)) || '€0';
  $('#cartList').innerHTML = cart.length ? cart.map((c, i) => `<div class="ci"><img src="${c.img}" alt=""><div><b>${c.name}</b><span>${c.note || 'Download immediato'}</span>
    <div class="qty"><button data-q="${i}" data-d="-1">−</button>${c.qty}<button data-q="${i}" data-d="1">+</button></div></div>
    <div style="text-align:right"><b>${euro(c.price * c.qty)}</b><button class="rm" data-rm="${i}">Rimuovi</button></div></div>`).join('')
    : '<div class="cart-empty">Il carrello è vuoto.<br>Scegli un protocollo dai libri qui sopra.</div>';
}
$('#cartList').addEventListener('click', e => {
  const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
  if (q) { const c = cart[+q.dataset.q]; c.qty += +q.dataset.d; if (c.qty < 1) cart.splice(+q.dataset.q, 1); }
  if (r) cart.splice(+r.dataset.rm, 1);
  if (q || r) { save(); renderCart(); }
});
const bump = () => { const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); setTimeout(() => b.classList.remove('bump'), 400); };
let tt; const toast = t => { $('#toastT').textContent = t + ' · aggiunto al carrello'; $('#toast').classList.add('on'); clearTimeout(tt); tt = setTimeout(() => $('#toast').classList.remove('on'), 2200); };
const openCart = () => { document.body.classList.add('cart-open'); lenis.stop(); };
const closeCart = () => { document.body.classList.remove('cart-open'); if (!document.body.classList.contains('focus')) lenis.start(); };
$('#cartBtn').addEventListener('click', openCart); $('#cartX').addEventListener('click', closeCart); $('#cartVeil').addEventListener('click', closeCart);
addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
$('#checkout').addEventListener('click', () => { $('#checkout').innerHTML = 'Mockup: pagamento non attivo'; setTimeout(() => $('#checkout').innerHTML = 'Vai al pagamento <i>→</i>', 1800); });
const addBook = b => add({ key: b.id, name: b.short, price: b.price, img: b.img, note: b.catLabel });
window.__onBuy = addBook;   // il pannello del libro 3D aggiunge al carrello
document.addEventListener('click', e => { const a = e.target.closest('[data-add]'); if (a) addBook(byId(a.dataset.add)); });
renderCart();

/* ---------- barra della libreria: prezzo e acquisto del libro davanti ---------- */
let front = 0;
const heroBuy = $('#heroBuy'), hbPrice = $('#hbPrice');
addEventListener('biblio-front', e => {
  front = e.detail; const b = BOOKS[front];
  hbPrice.innerHTML = b.price == null ? '<b>Rizzoli</b><s>libro</s>' : `<b>${euro(b.price)}</b>${b.compare ? `<s>${euro(b.compare)}</s>` : ''}`;
  heroBuy.innerHTML = b.price == null ? 'Su Amazon <i>↗</i>' : 'Aggiungi al carrello';
});
heroBuy.addEventListener('click', () => { const b = BOOKS[front]; b.price == null ? open(b.buy, '_blank') : addBook(b); });

/* ---------- fascia ---------- */
const band = gsap.to('#band', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
lenis.on('scroll', ({ velocity }) => band.timeScale(1 + Math.min(6, Math.abs(velocity) * .25)));
const sbar = $('#sbar');
lenis.on('scroll', ({ scroll }) => sbar.classList.toggle('solid', scroll > 60));

/* ---------- chat ---------- */
const msgs = $$('#msgs .msg'), typing = $('#typing');
ScrollTrigger.create({ trigger: '#msgs', start: 'top 75%', once: true, onEnter: () => {
  const tl = gsap.timeline();
  tl.to(msgs[0], { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.6)' })
    .to(msgs[1], { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.6)' }, '+=.7')
    .add(() => typing.style.display = 'flex', '+=.4')
    .add(() => typing.style.display = 'none', '+=1.4')
    .to(msgs[2], { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.6)' });
} });

/* ---------- problema / soluzione ---------- */
const sw = $('#sw'), panes = $$('.ps-pane');
const setP = i => { sw.classList.toggle('sol', i === 1); $$('button', sw).forEach((b, k) => b.classList.toggle('on', k === i)); panes.forEach((p, k) => p.classList.toggle('on', k === i)); };
document.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) setP(+b.dataset.p); });

/* ---------- cosa contengono: 3 protocolli ---------- */
const HACK = ['hack-stress', 'hack-sleep', 'hack-habits'].map(byId);
const INTRO = {
  'hack-stress': 'Lo stress non è il problema. Il problema è restarci dentro. Se il cortisolo resta alto, vivi in modalità sopravvivenza: energia instabile, nervosismo, recupero bloccato.',
  'hack-sleep': 'Dormire non basta. Se il tuo sonno è superficiale, ti svegli stanco e resti in allarme anche di notte. Hack your Sleep trasforma il sonno da semplice pausa a vera fonte di rigenerazione.',
  'hack-habits': 'Le tue abitudini decidono chi sei. Se sono sbagliate, consolidano stanchezza, disordine e confusione mentale. Hack your Habits trasforma la tua routine in leve di energia e lucidità.',
};
const WHY = {
  'hack-stress': 'Non teoria, ma pratiche concrete da applicare subito. Ogni giorno hai azioni mirate che calmano il sistema nervoso e ti riportano in equilibrio.',
  'hack-sleep': 'Non è teoria, ma pratica quotidiana. Ogni giorno hai azioni precise, supportate da evidenze scientifiche, che trasformano il sonno in un’arma per performance e longevità.',
  'hack-habits': 'Non è motivazione teorica. È un percorso fatto di micro-azioni quotidiane, semplici ma trasformative, che riorganizzano corpo e mente passo dopo passo.',
};
const tabs = $('#tabs'), ccBook = $('#ccBook'), ccPanes = $('#ccPanes');
HACK.forEach((b, i) => {
  tabs.insertAdjacentHTML('beforeend', `<button class="tab${i ? '' : ' on'}" data-tab="${i}">${b.short}</button>`);
  ccPanes.insertAdjacentHTML('beforeend', `<div class="cc-pane${i ? '' : ' on'}">
    <p class="intro">${INTRO[b.id]}</p>
    <div class="cc-cols"><div class="box"><h4>Cosa trovi dentro</h4><ul>${b.chapters.map(c => `<li>${c}</li>`).join('')}</ul></div>
    <div class="box res"><h4>Risultati che puoi aspettarti</h4><ul>${b.results.map(c => `<li>${c}</li>`).join('')}</ul></div></div>
    <div class="why"><b>Perché funziona</b><span>${WHY[b.id]}</span></div>
    <div class="buyrow"><div class="pr"><b>${euro(b.price)}</b><s>${euro(b.compare)}</s></div><button class="pill lg" data-add="${b.id}">Aggiungi al carrello</button><button class="pill ghost lg" style="color:var(--ink);box-shadow:inset 0 0 0 1px var(--lineD)" data-open="${BOOKS.indexOf(b)}">Sfoglia in 3D</button></div></div>`);
});
ccBook.innerHTML = bookHtml(HACK[0], 8); tiltBook(ccBook.querySelector('.book'));
tabs.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]'); if (!t) return; const i = +t.dataset.tab;
  $$('.tab', tabs).forEach((x, k) => x.classList.toggle('on', k === i));
  $$('.cc-pane', ccPanes).forEach((x, k) => x.classList.toggle('on', k === i));
  const bk = ccBook.querySelector('.bk');
  gsap.timeline().to(bk, { rotateY: 90, duration: .3, ease: 'power2.in' })
    .add(() => { ccBook.querySelector('.bk-front img').src = HACK[i].img; })
    .fromTo(bk, { rotateY: -90 }, { rotateY: -22, duration: .6, ease: 'back.out(1.4)', clearProps: 'transform' });
});

/* ---------- bundle ---------- */
const PR = { 1: [39.9, 59.9], 2: [69.8, 119.8], 3: [79.8, 179.7] };
let nSel = 3;
const sel = $('#sel');
function renderSel() {
  sel.innerHTML = Array.from({ length: nSel }, (_, k) => `<label>#${k + 1}<select>${HACK.map((b, j) => `<option value="${b.id}"${j === k ? ' selected' : ''}>${b.short}</option>`).join('')}</select></label>`).join('');
  $('#bundleBuy').textContent = 'Aggiungi al carrello · ' + euro(PR[nSel][0]);
}
$('#opts').addEventListener('click', e => { const o = e.target.closest('.opt'); if (!o) return; nSel = +o.dataset.n; $$('.opt').forEach(x => x.classList.toggle('on', x === o)); renderSel(); });
$('#bundleBuy').addEventListener('click', () => {
  const picks = $$('select', sel).map(s => byId(s.value).short);
  add({ key: 'bundle-' + nSel + '-' + picks.join('|'), name: nSel === 1 ? picks[0] : `Bundle ${nSel} protocolli`, price: PR[nSel][0], img: 'assets/bundle-hack.jpg', note: picks.join(' · ') });
});
renderSel();

/* ---------- programmi 60 giorni ---------- */
const p60 = $('#p60');
['60x-burn', '60x-build', '60x-revive'].map(byId).forEach(b => {
  const el = document.createElement('article'); el.className = 'item'; el.setAttribute('data-rise', '');
  el.innerHTML = `<div class="stage">${bookHtml(b, 9)}</div><div><span class="lbl muted">${b.catLabel}</span><h3 style="margin-top:8px">${b.short}</h3></div>
    <p class="sub">${b.sub}</p><ul>${b.chapters.map(c => `<li>${c}</li>`).join('')}</ul>
    <div class="foot"><div class="pr"><b>${euro(b.price)}</b><s>${euro(b.compare)}</s></div><span class="off">−54%</span><button class="pill" data-add="${b.id}">Aggiungi</button></div>`;
  p60.appendChild(el); tiltBook(el.querySelector('.book'));
  el.querySelector('.stage').addEventListener('click', () => window.__biblio && window.__biblio.open(BOOKS.indexOf(b)));
});
gsap.set('#p60 [data-rise]', { opacity: 0, y: 50 });

/* ---------- ebook famiglia ---------- */
$('#famBook').innerHTML = bookHtml(byId('figlio'), 9); tiltBook($('#famBook .book'));

/* ---------- contatti ---------- */
$('#cform').addEventListener('submit', e => { e.preventDefault(); $('#cOk').textContent = '✓ Messaggio inviato (demo: nessun dato inviato).'; e.target.reset(); });

/* ---------- avvio ---------- */
gsap.from('.b-top, .hero-bar', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, delay: .2 });
reveal(); magnet();
// arrivo da un link del sito (shop/#id): apre quel libro
addEventListener('biblio-ready', () => {
  const i = BOOKS.findIndex(b => b.id === location.hash.slice(1));
  if (i >= 0) setTimeout(() => window.__biblio.open(i), 900);
});
