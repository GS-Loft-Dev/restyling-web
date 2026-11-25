/* I libri veri: il libro Rizzoli + i prodotti di shop.giacomospazzini.com (testi e prezzi presi dallo shop).
   Le copertine sono in covers/ (raddrizzate dalle foto dello shop). */
const C = f => new URL('./covers/' + f, import.meta.url).href;
const SHOP = 'https://shop.giacomospazzini.com';
const INK = '#0f121a', ACID = '#f1ff62';

export const BOOKS = [
  { n: '00', id: 'metodo', hard: true, img: C('il-metodo-spazzini.jpg'), aspect: 1400 / 2139, D: .34,
    title: 'IL METODO|SPAZZINI', short: 'Il Metodo Spazzini', cat: 'libro', catLabel: 'Il libro · Rizzoli',
    sub: 'Dal coach del biohacking, i segreti per ottimizzare corpo e mente e vivere meglio, più a lungo. I 7 pilastri della longevità.',
    bg: '#ffffff', fg: INK, accent: '#6d2f8e', spineFg: '#6d2f8e',
    meta: [['7', 'Pilastri'], ['Rizzoli', 'Editore'], ['Libro · eBook', 'Formato']],
    listTitle: 'I 7 pilastri', chapters: ['Prevenzione', 'Alimentazione', 'Nutraceutica', 'Allenamento', 'Mindset', 'Tempo', 'Sonno'],
    buy: 'https://www.amazon.it/metodo-Spazzini-Giacomo/dp/8817191140/', buyLabel: 'Acquista su Amazon', price: null },

  { n: '01', id: 'hack-stress', img: C('hack-stress.jpg'), aspect: 1000 / 1280, D: .1,
    title: 'HACK YOUR|STRESS', short: 'Hack your Stress', cat: 'protocollo', catLabel: 'Protocollo · 30 giorni',
    sub: 'Il protocollo pratico di 30 giorni per abbassare il cortisolo e uscire dalla modalità sopravvivenza.',
    bg: '#17130f', fg: '#f2eee8', accent: ACID,
    meta: [['30', 'Giorni'], ['6', 'Tecniche'], ['PDF', 'Formato']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Auto-test per capire quanto lo stress condiziona corpo e mente', '6 tecniche neurofisiologiche per abbassare il cortisolo', 'Linee guida alimentari anti-stress', 'Stack di integratori efficaci', 'Routine digitale e 3 tecniche per i picchi', 'Challenge guidata di 30 giorni'],
    results: ['Energia più stabile', 'Mente lucida, meno reattiva', 'Recupero migliore', 'Più resilienza'],
    buy: SHOP + '/products/bundle-protocolli-stress-e-sonno', price: 39.9, compare: 59.9 },

  { n: '02', id: 'hack-sleep', img: C('hack-sleep.jpg'), aspect: 1000 / 1280, D: .1,
    title: 'HACK YOUR|SLEEP', short: 'Hack your Sleep', cat: 'protocollo', catLabel: 'Protocollo · 30 giorni',
    sub: 'La guida pratica di 30 giorni per addormentarti meglio, ridurre i risvegli e rigenerarti davvero.',
    bg: '#4a3022', fg: '#f6eee6', accent: ACID,
    meta: [['30', 'Giorni'], ['7', 'Leve'], ['PDF', 'Formato']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Test rapido sulla qualità del riposo', 'Routine serale per il sonno profondo', 'Stop alle abitudini killer', 'Nutrizione serale: serotonina e melatonina', 'Stack di integratori intelligenti', 'Wearable e strategie per i risvegli', 'Challenge guidata di 30 giorni'],
    results: ['Addormentamento più rapido', 'Risvegli ridotti', 'Sonno profondo', 'Energia stabile di giorno'],
    buy: SHOP + '/products/bundle-protocolli-stress-e-sonno', price: 39.9, compare: 59.9 },

  { n: '03', id: 'hack-habits', img: C('hack-habits.jpg'), aspect: 1000 / 1280, D: .1,
    title: 'HACK YOUR|HABITS', short: 'Hack your Habits', cat: 'protocollo', catLabel: 'Protocollo · 30 giorni',
    sub: 'Il percorso di 30 giorni per spezzare schemi disfunzionali e costruire abitudini che durano.',
    bg: '#4c5234', fg: '#f3f2ea', accent: ACID,
    meta: [['30', 'Azioni'], ['30', 'Giorni'], ['PDF', 'Formato']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Checklist quotidiana con 30 azioni concrete', 'Reset degli schemi disfunzionali', 'Metodo progressivo: costanza, non motivazione', 'Challenge di 30 giorni con tabella stampabile'],
    results: ['Routine ordinate e sostenibili', 'Più energia e chiarezza', 'Stop a stanchezza e confusione', 'Un cambiamento reale in 30 giorni'],
    buy: SHOP + '/products/bundle-protocolli-stress-e-sonno', price: 39.9, compare: 59.9 },

  { n: '04', id: '60x-burn', img: C('60x-burn.jpg'), aspect: 1000 / 1280, D: .15,
    title: '60×BURN', short: '60×BURN', cat: 'programma', catLabel: 'Programma · 60 giorni',
    sub: 'Brucia il grasso in 60 giorni. Un percorso guidato e intensivo per bruciare il grasso in eccesso, costruire abitudini sane e ottenere risultati eccezionali.',
    bg: '#f4f2ef', fg: '#111111', accent: '#ff5a1f',
    meta: [['60', 'Giorni'], ['Casa · palestra', 'Allenamento'], ['PDF', 'Formato']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Piani alimentari per uomini e donne', 'Allenamento intensivo a casa o in palestra', 'Protocollo di integrazione', 'Checklist settimanale e tracciamento', 'Sconti esclusivi GS LOFT'],
    buy: SHOP + '/products/riduci-il-grasso-in-60-giorni', price: 69, compare: 149 },

  { n: '05', id: '60x-build', img: C('60x-build.jpg'), aspect: 1000 / 1280, D: .15,
    title: '60×BUILD', short: '60×BUILD', cat: 'programma', catLabel: 'Programma · 60 giorni',
    sub: 'Costruisci la tua massa muscolare in 60 giorni. Allenamenti progressivi, nutrizione e recupero per raggiungere il tuo massimo potenziale.',
    bg: '#f4f2ef', fg: '#111111', accent: '#8f3dff',
    meta: [['60', 'Giorni'], ['Casa · palestra', 'Allenamento'], ['PDF', 'Formato']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Piani alimentari per uomini e donne', 'Allenamento progressivo per ogni livello', 'Protocollo di integrazione', 'Checklist settimanale e tracciamento', 'Sconti esclusivi GS LOFT'],
    buy: SHOP + '/products/aumenta-la-tua-massa-muscolare-in-60-giorni', price: 69, compare: 149 },

  { n: '06', id: '60x-revive', img: C('60x-revive.jpg'), aspect: 1000 / 1280, D: .15,
    title: '60×REVIVE', short: '60×REVIVE', cat: 'programma', catLabel: 'Programma · 60 giorni',
    sub: 'Riduci la tua età biologica in 60 giorni. Allenamenti rigeneranti, nutrizione e integrazione per più energia e una salute migliore.',
    bg: '#f4f2ef', fg: '#111111', accent: '#2fb6ff',
    meta: [['60', 'Giorni'], ['Casa · palestra', 'Allenamento'], ['PDF', 'Formato']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Piani alimentari per uomini e donne', 'Allenamento rigenerante per ogni livello', 'Protocollo di integrazione', 'Checklist settimanale e tracciamento', 'Sconti esclusivi GS LOFT'],
    buy: SHOP + '/products/60-x-revive-riduci-la-tua-eta-biologica-in-60-giorni', price: 69, compare: 149 },

  { n: '07', id: 'figlio', img: C('figlio-mangiare-sano.jpg'), aspect: 1000 / 1400, D: .18,
    title: 'COME HO INSEGNATO|A MIO FIGLIO|A MANGIARE SANO', short: 'Come ho insegnato a mio figlio a mangiare sano', cat: 'ebook', catLabel: 'Ebook · Famiglia',
    sub: 'Il metodo pratico e naturale per far amare il cibo sano ai tuoi figli, senza battaglie a tavola e senza imposizioni. Strategie testate, ricette e consigli pratici.',
    bg: '#ebe7df', fg: INK, accent: '#1b2a5c',
    meta: [['Ebook', 'Formato'], ['Ricette', 'Incluse'], ['Famiglia', 'Per']],
    listTitle: 'Cosa trovi dentro',
    chapters: ['Strategie testate, senza imposizioni', 'Niente più battaglie a tavola', 'Ricette per tutta la famiglia', 'Consigli pratici per ogni giorno'],
    buy: SHOP + '/products/come-ho-insegnato-a-mio-figlio-a-mangiare-sano-senza-imporlo', price: 59.99, compare: null },
];

export const euro = v => v == null ? '' : '€' + v.toFixed(2).replace('.', ',').replace(',00', '');
