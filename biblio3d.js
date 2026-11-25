import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* =========================================================
   DATI — il libro vero + 7 ebook (segnaposto sui 7 pilastri)
   ========================================================= */
const INK='#0f121a', PAPER='#efeee8', ACID='#f1ff62', DEEP='#0a0c12', GRAPH='#282d39', NAVY='#161a25';
const BOOKS = [
 { n:'00', hard:true, img:'covers/il-metodo-spazzini.jpg', title:'IL METODO|SPAZZINI', short:'Il Metodo Spazzini', pillar:'I 7 pilastri della longevità', tag:'all',
   sub:'Dal coach del biohacking, i segreti per ottimizzare corpo e mente e vivere meglio, più a lungo.',
   bg:'#ffffff', fg:INK, accent:'#6d2f8e', spineFg:'#6d2f8e', motif:'rings', pages:'7', fmt:'Cartaceo · Kindle · ePub', time:'Rizzoli', price:null,
   chapters:['Prevenzione','Alimentazione','Nutraceutica','Allenamento','Mindset','Tempo','Sonno'] },
 { n:'01', title:'LEGGI IL|TUO CORPO', short:'Leggi il tuo corpo', pillar:'Prevenzione e test di precisione', tag:'dati',
   sub:'Test genetici, epigenetici, ormonali e del microbiota: cosa accade nel tuo corpo prima che compaiano i sintomi.',
   bg:ACID, fg:INK, accent:INK, motif:'helix', pages:'72', fmt:'PDF · ePub', time:'1h 40m', price:'19',
   chapters:['Perché i sintomi arrivano tardi','Genetica ed epigenetica','Ormoni: la mappa dell’energia','Il microbiota parla','Dal test al protocollo'] },
 { n:'02', title:'ALLENATI|CON I DATI', short:'Allenati con i dati', pillar:'Allenamento personalizzato', tag:'corpo',
   sub:'VO2max, body scan, metabolismo a riposo: costruisci un protocollo ultra personalizzato, non un programma qualunque.',
   bg:NAVY, fg:'#fcfcfc', accent:ACID, motif:'bars', pages:'88', fmt:'PDF · ePub', time:'2h 05m', price:'19',
   chapters:['VO2max, il numero della longevità','Body scan e composizione corporea','Il metabolismo a riposo','Forza, zona 2, recupero','Il tuo protocollo in 12 settimane'] },
 { n:'03', title:'MANGIA PER|IL TUO|OBIETTIVO', short:'Mangia per il tuo obiettivo', pillar:'Nutrizione funzionale', tag:'corpo',
   sub:'Impara a nutrirti secondo il tuo stile di vita, i tuoi obiettivi e le tue esigenze. Anche a cena fuori.',
   bg:PAPER, fg:INK, accent:INK, motif:'dots', pages:'96', fmt:'PDF · ePub', time:'2h 15m', price:'19',
   chapters:['Nutrirsi secondo lo stile di vita','Glicemia ed energia stabile','Proteine e longevità','Il piatto del manager','Ristoranti, viaggi, eventi'] },
 { n:'04', title:'INTEGRA|CON METODO', short:'Integra con metodo', pillar:'Integrazione mirata', tag:'dati',
   sub:'Integra sulla base delle tue carenze e di dati oggettivi. Prima i test, poi le capsule.',
   bg:GRAPH, fg:'#fcfcfc', accent:ACID, motif:'capsules', pages:'56', fmt:'PDF · ePub', time:'1h 15m', price:'14',
   chapters:['Prima i dati, poi gli integratori','Le carenze più comuni','Le basi che servono a tutti','Tempi e dosaggi','Cosa evitare'] },
 { n:'05', title:'DORMI PER|VIVERE', short:'Dormi per vivere', pillar:'Ottimizzazione del sonno', tag:'corpo',
   sub:'Ritmo circadiano, wearable, recovery. Dormire meglio significa vivere meglio, e più a lungo.',
   bg:DEEP, fg:'#fcfcfc', accent:ACID, motif:'waves', pages:'64', fmt:'PDF · ePub', time:'1h 30m', price:'17',
   chapters:['Il ritmo circadiano','Wearable: leggere i dati','La routine serale','Luce, temperatura, caffeina','Il recovery come allenamento'] },
 { n:'06', title:'GUIDA LE|TUE|GIORNATE', short:'Guida le tue giornate', pillar:'Gestione strategica del tempo', tag:'mente',
   sub:'Time coaching, focus, routine ad alte prestazioni. Per guidare le tue giornate, non subirle.',
   bg:PAPER, fg:INK, accent:INK, motif:'clock', pages:'60', fmt:'PDF · ePub', time:'1h 20m', price:'17',
   chapters:['Time coaching','Le tre priorità','Focus profondo','Routine ad alte prestazioni','Energia, non tempo'] },
 { n:'07', title:'MENTE AD|ALTE|PRESTAZIONI', short:'Mente ad alte prestazioni', pillar:'Stress e mindset', tag:'mente',
   sub:'Tecniche di gestione dello stress e di mental coaching. Per pensare, scegliere e agire con efficacia.',
   bg:ACID, fg:INK, accent:INK, motif:'contour', pages:'80', fmt:'PDF · ePub', time:'1h 50m', price:'19',
   chapters:['Riconoscere lo stress','Respirazione e HRV','Il dialogo interno','Decidere sotto pressione','Un mindset di crescita'] },
];
const N = BOOKS.length, TAU = Math.PI*2, STEP = TAU/N;

/* =========================================================
   COPERTINE DISEGNATE IN CANVAS (coordinate 1024×1536)
   ========================================================= */
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
function mk(w,h,s){const c=document.createElement('canvas');c.width=Math.round(w*s);c.height=Math.round(h*s);const x=c.getContext('2d');x.scale(s,s);return [c,x]}
function grain(x,w,h,a){x.save();for(let i=0;i<7000;i++){x.fillStyle=Math.random()<.5?`rgba(0,0,0,${a})`:`rgba(255,255,255,${a*.8})`;x.fillRect(Math.random()*w,Math.random()*h,1.6,1.6)}x.restore()}
function ls(x,v){try{x.letterSpacing=v}catch(e){}}
function wrap(x,text,maxW){const out=[];let line='';for(const w of text.split(' ')){const t=line?line+' '+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line);return out}

const MOTIF = {
  rings(x,b){ for(let k=0;k<16;k++){x.beginPath();x.arc(512,600,60+k*24,0,TAU);x.strokeStyle=rgba(b.fg,k%4===0?.38:.12);x.lineWidth=k%4===0?3:1.6;x.stroke()}
    x.beginPath();x.arc(512,600,300,-1.3,1.7);x.strokeStyle=b.accent;x.lineWidth=16;x.lineCap='round';x.stroke();
    x.fillStyle=b.accent;x.beginPath();x.arc(512+Math.cos(1.7)*300,600+Math.sin(1.7)*300,22,0,TAU);x.fill();
    x.fillStyle=b.fg;x.beginPath();x.arc(512,600,10,0,TAU);x.fill(); },
  helix(x,b){ for(let i=0;i<=64;i++){const t=i/64,y=210+t*740,ph=t*TAU*2.3,s=Math.sin(ph),d=Math.cos(ph),x1=512+s*250,x2=512-s*250;
      if(i%2===0){x.strokeStyle=rgba(b.fg,.22);x.lineWidth=2;x.beginPath();x.moveTo(x1,y);x.lineTo(x2,y);x.stroke()}
      x.fillStyle=rgba(b.fg,.55+.45*d);x.beginPath();x.arc(x1,y,9+5*d,0,TAU);x.fill();
      x.fillStyle=rgba(b.fg,.55-.45*d);x.beginPath();x.arc(x2,y,9-5*d,0,TAU);x.fill(); } },
  bars(x,b){ const n=22,base=960;x.strokeStyle=rgba(b.fg,.3);x.lineWidth=2;x.beginPath();x.moveTo(110,base+14);x.lineTo(914,base+14);x.stroke();
    const tops=[];for(let i=0;i<n;i++){const h=70+620*(.5-.5*Math.cos(i/(n-1)*Math.PI))*(.82+.18*Math.sin(i*1.9));const X=120+i*36.5;tops.push([X+10,base-h]);
      x.fillStyle=i>=n-4?b.accent:rgba(b.fg,.85);x.fillRect(X,base-h,20,h)}
    x.strokeStyle=b.accent;x.lineWidth=4;x.beginPath();tops.forEach(([a,c],i)=>i?x.lineTo(a,c-40):x.moveTo(a,c-40));x.stroke();
    x.font='500 22px "JetBrains Mono"';x.fillStyle=rgba(b.fg,.6);x.fillText('VO2MAX ↑',120,240); },
  dots(x,b){ for(let i=0;i<15;i++)for(let j=0;j<14;j++){const X=134+i*54,Y=250+j*54,d=Math.hypot(X-512,Y-600)/390,r=Math.max(0,24*(1-d*d));if(r<1)continue;
      x.fillStyle=(i*7+j*3)%13===0?b.accent:rgba(b.fg,.85);x.beginPath();x.arc(X,Y,r,0,TAU);x.fill()} },
  capsules(x,b){ x.save();x.translate(512,600);x.rotate(-.62);for(let r=-5;r<=5;r++)for(let c=-4;c<=4;c++){const X=c*150+(r%2)*75,Y=r*66;if(Math.hypot(X,Y)>440)continue;
      x.beginPath();x.roundRect(X-56,Y-22,112,44,22);const hit=(r*5+c*3+40)%9===0;
      if(hit){x.fillStyle=b.accent;x.fill()}else{x.strokeStyle=rgba(b.fg,.6);x.lineWidth=2.5;x.stroke();x.beginPath();x.moveTo(X,Y-22);x.lineTo(X,Y+22);x.stroke()}}x.restore(); },
  waves(x,b){ for(let k=0;k<26;k++){const y0=230+k*28,amp=46*Math.sin((k+1)/27*Math.PI);x.beginPath();
      for(let X=96;X<=928;X+=6){const y=y0+Math.sin(X*.011+k*.55)*amp*Math.sin((X-96)/832*Math.PI);X===96?x.moveTo(X,y):x.lineTo(X,y)}
      x.strokeStyle=k===13?b.accent:rgba(b.fg,.42);x.lineWidth=k===13?6:2;x.stroke()}
    x.fillStyle=b.accent;x.beginPath();x.arc(780,250,46,0,TAU);x.fill();x.fillStyle=b.bg;x.beginPath();x.arc(800,236,42,0,TAU);x.fill(); },
  clock(x,b){ const cx=512,cy=610,R=360;for(let i=0;i<96;i++){const a=i/96*TAU-Math.PI/2,L=i%4===0?52:22;x.strokeStyle=rgba(b.fg,i%4===0?.85:.4);x.lineWidth=i%4===0?4:2;
      x.beginPath();x.moveTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);x.lineTo(cx+Math.cos(a)*(R-L),cy+Math.sin(a)*(R-L));x.stroke()}
    const A=h=>h/24*TAU-Math.PI/2;x.strokeStyle=b.fg;x.lineWidth=26;x.lineCap='butt';x.beginPath();x.arc(cx,cy,R-110,A(6),A(9.5));x.stroke();
    x.strokeStyle=rgba(b.fg,.35);x.lineWidth=26;x.beginPath();x.arc(cx,cy,R-110,A(9.6),A(18));x.stroke();
    x.fillStyle=ACID;x.beginPath();x.roundRect(cx-90,cy-28,180,56,4);x.fill();x.fillStyle=INK;x.font='500 26px "JetBrains Mono"';x.textAlign='center';x.fillText('FOCUS',cx,cy+9);x.textAlign='left'; },
  contour(x,b){ for(let k=0;k<16;k++){const r0=50+k*25;x.beginPath();for(let i=0;i<=200;i++){const t=i/200*TAU,r=r0+16*Math.sin(3*t+k*.45)+11*Math.sin(5*t-k*.3)+k*1.6*Math.sin(2*t);
      const X=512+Math.cos(t)*r,Y=620+Math.sin(t)*r*1.05;i?x.lineTo(X,Y):x.moveTo(X,Y)}x.closePath();x.strokeStyle=k===9?b.accent:rgba(b.fg,.5);x.lineWidth=k===9?7:2;x.stroke()} },
};

function drawCover(b){
  const [c,x]=mk(1024,1536,b.image?1:.85);
  if(b.image){x.drawImage(b.image,0,0,1024,1536);return c}
  x.fillStyle=b.bg;x.fillRect(0,0,1024,1536);
  const dark=b.fg!==INK;
  // luce morbida
  const g=x.createRadialGradient(300,300,0,300,300,1100);g.addColorStop(0,dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,1024,1536);
  MOTIF[b.motif](x,b);
  // cornice e crocini
  x.strokeStyle=rgba(b.fg,.22);x.lineWidth=2;x.strokeRect(56,56,912,1424);
  for(const [px,py] of [[56,56],[968,56],[56,1480],[968,1480]]){x.beginPath();x.moveTo(px-16,py);x.lineTo(px+16,py);x.moveTo(px,py-16);x.lineTo(px,py+16);x.strokeStyle=b.fg;x.lineWidth=2;x.stroke()}
  x.fillStyle=b.fg;x.font='500 24px "JetBrains Mono"';ls(x,'6px');
  x.fillText('GIACOMO SPAZZINI',96,124);
  x.textAlign='right';x.fillText(b.hard?'RIZZOLI':`EBOOK ${b.n} / 07`,928,124);x.textAlign='left';
  x.fillStyle=rgba(b.fg,.3);x.fillRect(96,150,832,2);
  // etichetta
  const lab=b.hard?'IL LIBRO':`PILASTRO ${b.n} — ${b.pillar.toUpperCase()}`;
  x.font='500 21px "JetBrains Mono"';ls(x,'4px');const lw=Math.min(832,x.measureText(lab).width+28);
  const lines=b.title.split('|');let fs=b.hard?150:132;x.font=`900 ${fs}px "Inter Tight"`;ls(x,'-5px');
  while(lines.some(l=>x.measureText(l).width>840)&&fs>70){fs-=4;x.font=`900 ${fs}px "Inter Tight"`}
  const lh=fs*.9,bottom=1366,top=bottom-lh*(lines.length-1);
  const ly=top-fs-30;
  x.fillStyle=dark?b.accent:INK;x.fillRect(96,ly-26,lw,40);
  x.fillStyle=dark?INK:ACID;x.font='500 21px "JetBrains Mono"';ls(x,'4px');x.fillText(lab.length>44?lab.slice(0,43)+'…':lab,110,ly+2);
  x.fillStyle=b.fg;x.font=`900 ${fs}px "Inter Tight"`;ls(x,'-5px');
  lines.forEach((l,i)=>x.fillText(l,90,top+i*lh));
  ls(x,'4px');x.font='500 19px "JetBrains Mono"';x.fillStyle=rgba(b.fg,.7);
  x.fillText('METODO SPAZZINI · LONGEVITÀ & PERFORMANCE',96,1440);x.textAlign='right';x.fillText('GS',928,1440);x.textAlign='left';
  grain(x,1024,1536,.05);
  return c;
}
function drawSpine(b,D){
  const w=Math.max(60,Math.round(1536*D/2.25));const [c,x]=mk(w,1536,1);
  x.fillStyle=b.bg;x.fillRect(0,0,w,1536);
  x.save();x.translate(w/2,1536);x.rotate(-Math.PI/2);
  const fs=Math.min(w*.46,64);x.fillStyle=b.spineFg||b.fg;x.font=`900 ${fs}px "Inter Tight"`;ls(x,'-1px');x.textBaseline='middle';
  x.fillText(b.title.replace(/\|/g,' '),150,2);
  x.font=`500 ${Math.min(w*.26,24)}px "JetBrains Mono"`;ls(x,'4px');x.textAlign='right';x.fillStyle=b.hard?b.accent:rgba(b.fg,.75);x.fillText(b.hard?'RIZZOLI':b.n,1450,2);
  x.restore();
  x.fillStyle=b.accent;x.fillRect(w*.25,60,w*.5,w*.5);
  return c;
}
function drawBack(b){
  const [c,x]=mk(1024,1536,.4);x.fillStyle=b.bg;x.fillRect(0,0,1024,1536);
  x.fillStyle=b.fg;x.font='800 64px "Inter Tight"';ls(x,'-2px');wrap(x,b.sub,820).forEach((l,i)=>x.fillText(l,100,260+i*76));
  x.font='500 22px "JetBrains Mono"';ls(x,'5px');x.fillStyle=rgba(b.fg,.6);x.fillText('GIACOMOSPAZZINI.COM',100,1300);
  x.fillStyle='#fff';x.fillRect(660,1180,264,180);x.fillStyle='#111';for(let i=0;i<46;i++){const w=Math.random()<.3?5:2.4;x.fillRect(680+i*4.9,1200,w,120)}
  return c;
}
function drawInside(b){
  const [c,x]=mk(1024,1536,.8);x.fillStyle=b.bg;x.fillRect(0,0,1024,1536);
  x.fillStyle=rgba(b.fg,.06);x.font='900 620px "Inter Tight"';ls(x,'-30px');x.fillText('GS',40,1100);
  x.fillStyle=b.fg;x.font='500 22px "JetBrains Mono"';ls(x,'5px');x.fillText(b.hard?'INTRODUZIONE':`EBOOK ${b.n} · INTRODUZIONE`,110,200);
  x.font='800 66px "Inter Tight"';ls(x,'-2px');
  const q=b.hard?'Questo non è un percorso motivazionale. Le motivazioni sono le tue.':'Questo non è un percorso motivazionale.';
  wrap(x,q,780).forEach((l,i)=>x.fillText(l,110,330+i*76));
  x.font='400 30px "Inter Tight"';ls(x,'0px');x.fillStyle=rgba(b.fg,.75);
  wrap(x,b.sub,760).forEach((l,i)=>x.fillText(l,110,720+i*44));
  x.fillStyle=b.fg===INK?INK:b.accent;x.fillRect(110,1340,120,6);x.font='500 22px "JetBrains Mono"';ls(x,'5px');x.fillText('— GIACOMO SPAZZINI',110,1400);
  return c;
}
function drawToc(b){
  const [c,x]=mk(1024,1536,.8);x.fillStyle='#f4f2ea';x.fillRect(0,0,1024,1536);
  x.fillStyle=INK;x.font='500 22px "JetBrains Mono"';ls(x,'5px');x.fillText(b.hard?'IL METODO SPAZZINI':`EBOOK ${b.n} — ${b.short.toUpperCase()}`,100,170);
  x.fillStyle='rgba(15,18,26,.15)';x.fillRect(100,196,824,2);
  x.fillStyle=INK;x.font='900 150px "Inter Tight"';ls(x,'-6px');x.fillText('INDICE',92,380);
  let p=7;const gap=Math.min(150,800/b.chapters.length);
  if(b.hard){x.font='500 22px "JetBrains Mono"';ls(x,'5px');x.fillStyle='rgba(15,18,26,.5)';x.fillText('I 7 PILASTRI DELLA LONGEVITÀ',100,450)}
  b.chapters.forEach((ch,i)=>{const y=540+i*gap;
    x.font='500 24px "JetBrains Mono"';ls(x,'3px');x.fillStyle=b.hard?b.accent:'rgba(15,18,26,.5)';x.fillText('0'+(i+1),100,y);
    x.font='700 42px "Inter Tight"';ls(x,'-1px');x.fillStyle=INK;const t=wrap(x,ch,620);t.forEach((l,k)=>x.fillText(l,180,y+k*50));
    if(!b.hard){x.font='500 26px "JetBrains Mono"';x.textAlign='right';x.fillText(String(p),924,y);x.textAlign='left'}
    x.fillStyle='rgba(15,18,26,.12)';x.fillRect(100,y+(t.length-1)*50+40,824,2);p+=11+i*3});
  x.fillStyle=ACID;x.fillRect(100,1400,60,60);x.fillStyle=INK;x.font='500 20px "JetBrains Mono"';x.fillText('GS',113,1438);
  return c;
}
function stripes(vertical){const [c,x]=mk(256,256,1);x.fillStyle='#ece8dc';x.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=3){x.fillStyle=`rgba(120,110,90,${.18+Math.random()*.18})`;vertical?x.fillRect(i,0,1,256):x.fillRect(0,i,256,1)}return c}

/* =========================================================
   THREE
   ========================================================= */
const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
const DPR_SCROLL=Math.min(devicePixelRatio,1.5),DPR_READ=Math.min(devicePixelRatio,2);
renderer.setPixelRatio(DPR_SCROLL);
// risoluzione piena quando si legge un libro (scena ferma), ridotta mentre si scorre
function setDPR(v){if(renderer.getPixelRatio()===v)return;renderer.setPixelRatio(v);renderer.setSize(innerWidth,innerHeight,false)}
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.0;
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,100);
camera.position.set(0,.35,11);

scene.add(new THREE.HemisphereLight(0xffffff,0x1a1e28,.55));
const key=new THREE.DirectionalLight(0xffffff,2.0);key.position.set(-4,6,9);scene.add(key);
const rim=new THREE.DirectionalLight(0xf1ff62,2.2);rim.position.set(6,-1,-7);scene.add(rim);
const rim2=new THREE.DirectionalLight(0x8fa6ff,.7);rim2.position.set(-7,2,-5);scene.add(rim2);

const maxAniso=renderer.capabilities.getMaxAnisotropy();
const tex=(c)=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;return t};
const edgeV=tex(stripes(true)), edgeH=tex(stripes(false));

const books=[]; // {g,pivot,idx,open,delay,s}
const W=1.5,H=2.25;
function makeBook(b,i){
  const D=b.hard?.34:.16, T=b.hard?.03:.012;
  const g=new THREE.Group();g.userData.idx=i;
  const col=new THREE.MeshStandardMaterial({color:b.bg,roughness:.55,envMapIntensity:.6});
  const coverM=b.hard?new THREE.MeshPhysicalMaterial({map:tex(b.coverCanvas),roughness:.38,clearcoat:.8,clearcoatRoughness:.22,envMapIntensity:.7}):new THREE.MeshStandardMaterial({map:tex(b.coverCanvas),roughness:.42,envMapIntensity:.75});
  const insideM=new THREE.MeshStandardMaterial({map:tex(drawInside(b)),roughness:.8,envMapIntensity:.4});
  const backM=new THREE.MeshStandardMaterial({map:tex(drawBack(b)),roughness:.5,envMapIntensity:.6});
  const spineM=new THREE.MeshStandardMaterial({map:tex(drawSpine(b,D)),roughness:.45,envMapIntensity:.6});
  const ev=new THREE.MeshStandardMaterial({map:edgeV,roughness:.95,envMapIntensity:.25});
  const eh=new THREE.MeshStandardMaterial({map:edgeH,roughness:.95,envMapIntensity:.25});
  const toc=new THREE.MeshStandardMaterial({map:tex(drawToc(b)),roughness:.85,envMapIntensity:.3});
  const plain=new THREE.MeshStandardMaterial({color:'#efece2',roughness:.9});
  const inset=b.hard?.05:.006, pw=W-T-inset, ph=H-(b.hard?.07:.012), pd=D-2*T;
  const pages=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,pd),[ev,ev,eh,eh,toc,plain]);
  pages.position.x=-W/2+T+pw/2;g.add(pages);
  const back=new THREE.Mesh(new THREE.BoxGeometry(W,H,T),[col,col,col,col,insideM,backM]);back.position.z=-D/2+T/2;g.add(back);
  const spine=new THREE.Mesh(new THREE.BoxGeometry(T,H,D-2*T),[col,spineM,col,col,col,col]);spine.position.x=-W/2+T/2;g.add(spine);
  const pivot=new THREE.Group();pivot.position.set(-W/2,0,D/2-T/2);g.add(pivot);
  const cover=new THREE.Mesh(new THREE.BoxGeometry(W,H,T),[col,col,col,col,coverM,insideM]);cover.position.x=W/2;pivot.add(cover);
  g.traverse(o=>{if(o.isMesh)o.userData.idx=i});
  g.position.set((Math.random()-.5)*26,(Math.random()-.5)*14,-30-Math.random()*10);
  g.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
  scene.add(g);
  return {g,pivot,idx:i,open:0,delay:.15+i*.09,s:1};
}

// polvere
const dustGeo=new THREE.BufferGeometry();const P=520,pos=new Float32Array(P*3);
for(let i=0;i<P;i++){pos[i*3]=(Math.random()-.5)*26;pos[i*3+1]=(Math.random()-.5)*14;pos[i*3+2]=(Math.random()-.5)*16-2}
dustGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xdfe3ec,size:.022,transparent:true,opacity:.55,depthWrite:false}));scene.add(dust);
const acidGeo=new THREE.BufferGeometry();const P2=60,pos2=new Float32Array(P2*3);
for(let i=0;i<P2;i++){pos2[i*3]=(Math.random()-.5)*20;pos2[i*3+1]=(Math.random()-.5)*10;pos2[i*3+2]=(Math.random()-.5)*10}
acidGeo.setAttribute('position',new THREE.BufferAttribute(pos2,3));
const acidDust=new THREE.Points(acidGeo,new THREE.PointsMaterial({color:0xf1ff62,size:.045,transparent:true,opacity:.8,depthWrite:false}));scene.add(acidDust);

// velo scuro dentro la scena (oscura l'anello in modalità lettura)
const dim=new THREE.Mesh(new THREE.PlaneGeometry(80,50),new THREE.MeshBasicMaterial({color:0x07090e,transparent:true,opacity:0,depthWrite:false}));
scene.add(dim);

/* ---------- layout responsive ---------- */
let L={};
function layout(){
  const w=innerWidth,h=innerHeight,asp=w/h,mob=w<860;
  renderer.setSize(w,h,false);
  camera.aspect=asp;camera.fov=mob?(asp<.7?52:44):34;camera.updateProjectionMatrix();
  const camZ=11, vh=d=>2*d*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)), vw=d=>vh(d)*asp;
  const fz=mob?2.6:6.3, fd=camZ-fz, pf=Math.min(500/w,.4);
  let fs=mob?Math.min(.95,vw(fd)*.94/(2*W)):Math.min(.9,vw(fd)*(1-pf)*.86/(2*W),vh(fd)*.74/H);
  let fx, fy;
  if(mob){fx=W*fs/2;fy=vh(fd)*.23}else{fx=-vw(fd)*pf/2+W*fs/2;fy=.05}
  const lz=mob?3.2:5.3, ld=camZ-lz;
  const rs=mob?.82:.7*Math.min(1.1,Math.sqrt(asp/1.7));
  L={mob,R:mob?3.1:4.6*rs/.75,ringC:new THREE.Vector3(0,mob?.35:.24,0),ringS:rs,
     libro:mob?new THREE.Vector3(.0,vh(ld)*.2,lz):new THREE.Vector3(vw(ld)*.19,-.05,lz),
     libroShift:mob?W*.5:W*.42, libroS:mob?.85:Math.min(1.05,vh(ld)*.7/H),
     focusP:new THREE.Vector3(fx,fy,fz),focusS:fs,dimZ:fz-1.6,push:9};
  dim.position.z=L.dimZ;
  measure();
}

/* ---------- stato ---------- */
let ringRot=0,snapT=0,ringVel=0,dragging=false,downX=0,lastX=0,lastT=0,moved=0,idle=0,hover=-1,focus=-1,focusT=0,spin=0,spinTarget=0,closeT=9;
let heroOut=0,pLibro=0,started=false;
const mouse=new THREE.Vector2(9,9),mSmooth=new THREE.Vector2();
const ray=new THREE.Raycaster();
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const mod=(a,n)=>((a%n)+n)%n;
const frontIdx=()=>mod(Math.round(-snapT/STEP),N);

const vA=new THREE.Vector3(),qA=new THREE.Quaternion(),qB=new THREE.Quaternion(),eA=new THREE.Euler(),X=new THREE.Vector3(1,0,0);
function target(i,t){
  const a=i*STEP+ringRot;
  const p=new THREE.Vector3(Math.sin(a)*L.R,Math.sin(t*.9+i*1.3)*.07,Math.cos(a)*L.R).applyAxisAngle(X,.1).add(L.ringC);
  eA.set(.1+Math.sin(t*.6+i)*.03,a,Math.sin(t*.5+i*2)*.025);const q=new THREE.Quaternion().setFromEuler(eA);
  let s=L.ringS, open=0;
  const front=frontIdx();
  if(i===front&&focus<0){s*=1.08;p.z+=.25}
  if(i===hover&&focus<0){p.y+=.17;s*=1.04}
  const e1=ease(heroOut);
  if(i===0){
    const lo=sstep(.5,.82,pLibro);
    vA.copy(L.libro);vA.x+=lo*L.libroShift;vA.y+=Math.sin(t*.8)*.05;
    eA.set(.06-lo*.04,-.85+pLibro*1.0-lo*.15,-.04+lo*.04);qB.setFromEuler(eA);
    p.lerp(vA,e1);q.slerp(qB,e1);s+= (L.libroS*(1-.16*lo)-s)*e1;open=lo*e1;
  }else{
    p.y-=e1*(8+(i%3)*1.4);p.z-=e1*3;eA.set(e1*1.1,0,e1*.4*(i%2?1:-1));q.multiply(qA.setFromEuler(eA));
  }
  if(focus>=0){
    if(i===focus){
      p.copy(L.focusP);
      const o=focusT>.55?1:0;
      eA.set(.03+mSmooth.y*.04,(-.22+mSmooth.x*.06)*(1-o)+spin,0);q.setFromEuler(eA);
      if(o)p.x+=0; s=L.focusS; open=o;
    }else p.z-=L.push;
  }
  return {p,q,s,open};
}

/* ---------- interfaccia ---------- */
const $=s=>document.querySelector(s);
const hbN=$('#hbN'),hbP=$('#hbP'),hbT=$('#hbT'),cur=$('#cur'),curL=$('#curL'),panel=$('#panel');
let shownFront=-1;
function updateBar(){const f=frontIdx();if(f===shownFront)return;shownFront=f;const b=BOOKS[f];
  hbN.textContent=b.n;hbP.innerHTML=`<span class="swap">${b.hard?'Il libro · Rizzoli':'Pilastro '+b.n+' · '+b.pillar}</span>`;
  hbT.innerHTML=`<span class="swap">${b.short}</span>`;$('#openFront').textContent=b.hard?'Apri il libro ↗':'Apri l\'ebook ↗'}

function fillPanel(i){
  const b=BOOKS[i];
  panel.innerHTML=`
   <div class="p-top"><span class="mono">${b.hard?'Il libro · Rizzoli':'Ebook '+b.n+' / 07 · '+b.pillar}</span><button class="x" id="pClose" aria-label="Chiudi">✕</button></div>
   <h3>${b.title.replace(/\|/g,'<br>')}</h3>
   <p class="p-sub">${b.sub}</p>
   <div class="p-meta"><div><strong>${b.pages}</strong><span>${b.hard?'Pilastri':'Pagine'}</span></div><div><strong>${b.time}</strong><span>${b.hard?'Editore':'Lettura'}</span></div><div><strong style="font-size:15px;line-height:1.5">${b.fmt}</strong><span>Formato</span></div></div>
   <h5>Cosa troverai</h5>
   <ol>${b.chapters.map((c,k)=>`<li style="animation-delay:${.35+k*.07}s">${c}</li>`).join('')}</ol>
   <div class="p-buy">
     ${b.hard?`<a class="btn acid" href="https://www.amazon.it/metodo-Spazzini-Giacomo/dp/8817191140/" target="_blank" rel="noopener">Cartaceo su Amazon ↗</a><a class="btn ghost" href="https://www.amazon.it/dp/B0DQRGZW93" target="_blank" rel="noopener">eBook Kindle ↗</a>`
      :`<div class="p-price"><b>€${b.price}</b><span>PDF + ePub · download immediato</span></div><button class="btn acid">Scarica l'ebook →</button><a class="btn ghost" href="#programmi" id="pGo">Lavora con me · i programmi</a>`}
   </div>
   <div class="p-nav"><button id="pPrev">← ${BOOKS[mod(i-1,N)].short}</button><button id="pNext">${BOOKS[mod(i+1,N)].short} →</button></div>`;
  $('#pClose').onclick=closeFocus;$('#pPrev').onclick=()=>switchFocus(-1);$('#pNext').onclick=()=>switchFocus(1);
  const go=$('#pGo');if(go)go.onclick=e=>{e.preventDefault();closeFocus();window.__lenis&&setTimeout(()=>window.__lenis.scrollTo('#programmi',{duration:1.4}),60)};
}
function openFocus(i){
  if(heroOut<.5){const k=Math.round((ringRot+i*STEP)/TAU);snapT=-i*STEP+k*TAU}
  focus=i;focusT=0;spin=0;spinTarget=0;hover=-1;
  fillPanel(i);document.body.classList.add('focus');panel.setAttribute('aria-hidden','false');
  window.__lenis&&window.__lenis.stop();setCursor(null);setDPR(DPR_READ);
}
function closeFocus(){if(focus<0)return;focus=-1;closeT=0;document.body.classList.remove('focus');panel.setAttribute('aria-hidden','true');window.__lenis&&window.__lenis.start();setDPR(DPR_SCROLL)}
function switchFocus(d){if(focus<0)return;const i=mod(focus+d,N);openFocus(i)}

function setCursor(t){if(!t){cur.classList.remove('show');return}curL.textContent=t;cur.classList.add('show')}

$('#prev').onclick=()=>{snapT+=STEP;idle=0};
$('#next').onclick=()=>{snapT-=STEP;idle=0};
$('#openFront').onclick=()=>openFocus(frontIdx());
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openFocus(+b.dataset.open));
addEventListener('keydown',e=>{
  if(e.key==='Escape')closeFocus();
  if(e.key==='ArrowRight'){focus>=0?switchFocus(1):heroOut<.5&&(snapT-=STEP,idle=0)}
  if(e.key==='ArrowLeft'){focus>=0?switchFocus(-1):heroOut<.5&&(snapT+=STEP,idle=0)}
});

/* ---------- puntatore ---------- */
function pick(){
  if(mouse.x>5)return -1;
  ray.setFromCamera(mouse,camera);
  const list=focus>=0?[books[focus].g]:heroOut<.35&&ringInView()?books.map(b=>b.g):(pLibro>0&&heroOut>.9?[books[0].g]:[]);
  const hit=ray.intersectObjects(list,true)[0];return hit?hit.object.userData.idx:-1;
}
addEventListener('pointermove',e=>{
  cur.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;
  mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  if(dragging){const dx=e.clientX-lastX,now=performance.now();moved+=Math.abs(dx);
    if(focus>=0){spinTarget+=dx*.008}else{ringRot+=dx*.0055;ringVel=dx*.0055/Math.max(.008,(now-lastT)/1000)}
    lastX=e.clientX;lastT=now;idle=0}
},{passive:true});
canvas.addEventListener('pointerdown',e=>{dragging=true;downX=lastX=e.clientX;lastT=performance.now();moved=0;ringVel=0;canvas.classList.add('grabbing');
  mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)});
addEventListener('pointerup',e=>{
  if(!dragging)return;dragging=false;canvas.classList.remove('grabbing');
  if(moved>=7&&focus<0){const proj=ringRot+clamp(ringVel,-12,12)*.18;snapT=Math.round(proj/STEP)*STEP}
  if(focus>=0)spinTarget=0;
});
canvas.addEventListener('click',e=>{
  if(moved>=7)return;
  dragging=false;canvas.classList.remove('grabbing');
  mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  const i=pick();
  if(focus>=0){if(i!==focus)closeFocus()}
  else if(i>=0)openFocus(i);
});
canvas.addEventListener('pointerleave',()=>{if(!dragging)mouse.set(9,9);hover=-1;setCursor(null)});

/* ---------- scroll ---------- */
let libroTop=0,libroH=1,bibTop=1e9,ringTop=0;
const steps=[...document.querySelectorAll('.step')],progB=[...document.querySelectorAll('.prog b')];
const absTop=el=>{let y=0;for(let e=el;e;e=e.offsetParent)y+=e.offsetTop;return y};
function measure(){const l=$('#libro');ringTop=absTop($('#biblio'));libroTop=absTop(l);libroH=l.offsetHeight;bibTop=absTop($('#biblioteca'))}
addEventListener('st-refresh',()=>{measure();onScroll()});
const ringInView=()=>scrollY+innerHeight*.5>ringTop&&scrollY<ringTop+innerHeight*.5;
const inRange=()=>scrollY+innerHeight>ringTop-80&&scrollY<bibTop+20;
function onScroll(){
  const y=scrollY,h=innerHeight;
  heroOut=clamp((y-ringTop)/(h*.9));
  pLibro=clamp((y-libroTop)/(libroH-h));
  const si=Math.min(2,Math.floor(pLibro*3.2));steps.forEach((s,k)=>s.classList.toggle('on',k===si));
  progB.forEach((b,k)=>b.style.transform=`scaleX(${clamp(pLibro*3-k)})`);
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',()=>{layout();onScroll()});

/* ---------- loop ---------- */
let canvasHidden=false;
const clock=new THREE.Clock();let autoT=0;
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  if(!started){if(books.length&&inRange()){started=true;clock.getDelta()}else return}
  closeT+=dt;
  const hidden=focus<0&&!inRange()&&closeT>1.4;
  if(hidden){if(!canvasHidden){canvasHidden=true;canvas.style.visibility='hidden'}return}
  if(canvasHidden){canvasHidden=false;canvas.style.visibility=''}
  mSmooth.lerp(mouse.x>5?vA.set(0,0,0):mouse,1-Math.exp(-dt*3));

  // anello
  if(!dragging){
    idle+=dt;
    if(focus<0&&hover<0&&idle>4.2&&ringInView()&&!document.hidden){snapT-=STEP;idle=0}
    ringRot+=(snapT-ringRot)*(1-Math.exp(-dt*4.2));
  }else snapT=ringRot;
  if(focus>=0){focusT+=dt;spin+=(spinTarget-spin)*(1-Math.exp(-dt*(dragging?14:5)))}

  // hover
  if(!dragging){
    const h=focus>=0?-1:pick();
    if(h!==hover){hover=h;canvas.classList.toggle('over',h>=0);setCursor(h>=0?(h===0?'APRI IL LIBRO':'APRI EBOOK '+BOOKS[h].n):null)}
  }
  updateBar();

  for(const b of books){
    if(b.delay>0){b.delay-=dt;continue}
    const T=target(b.idx,t);
    const k=1-Math.exp(-dt*(b.idx===focus?6:(heroOut>.02?7.5:5)));
    b.g.position.lerp(T.p,k);b.g.quaternion.slerp(T.q,k);b.s+=(T.s-b.s)*k;b.g.scale.setScalar(b.s);
    b.open+=(T.open-b.open)*(1-Math.exp(-dt*4));
    b.pivot.rotation.y=-ease(clamp(b.open))*Math.PI*.985;
  }
  dim.material.opacity+=((focus>=0?.82:0)-dim.material.opacity)*(1-Math.exp(-dt*5));

  dust.rotation.y=t*.012;dust.position.y=Math.sin(t*.2)*.15;acidDust.rotation.y=-t*.02;acidDust.position.y=Math.sin(t*.3)*.3;
  const par=focus>=0?.12:.45;
  const kc=1-Math.exp(-dt*3.5);
  camera.position.x+=(mSmooth.x*par-camera.position.x)*kc;
  camera.position.y+=(.35+mSmooth.y*par*.5-camera.position.y)*kc;
  camera.lookAt(0,camera.position.y*.3,0);
  renderer.render(scene,camera);
}

/* =========================================================
   DOM: griglia, ventaglio, form
   ========================================================= */
function buildDom(){
  const grid=$('#grid');
  BOOKS.slice(1).forEach((b,k)=>{
    const i=k+1, url=b.coverCanvas.toDataURL('image/jpeg',.86);b.url=url;
    const el=document.createElement('article');el.className='card';el.dataset.tag=b.tag;
    el.innerHTML=`<div class="bk3d"><div class="bk"><div class="bk-back"></div><span class="bk-edge"></span><div class="bk-front"><img src="${url}" alt="${b.short}"><span class="glare"></span></div></div><span class="bk-shadow"></span></div>
      <div class="card-meta"><span class="mono">${b.n} · ${b.pillar}</span><h3>${b.short}</h3><p>${b.sub}</p><div class="card-foot"><span>${b.pages} pag · ${b.time}</span><b>€${b.price}</b></div></div>
      <button class="card-open">Apri in 3D ↗</button>`;
    const bk=el.querySelector('.bk');
    el.addEventListener('pointermove',e=>{const r=bk.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      bk.style.setProperty('--ry',`${(px-.5)*26-6}deg`);bk.style.setProperty('--rx',`${(.5-py)*16}deg`);
      bk.style.setProperty('--gx',`${px*100}%`);bk.style.setProperty('--gy',`${py*100}%`);bk.style.transform=`rotateY(var(--ry)) rotateX(var(--rx)) translateY(-8px)`});
    el.addEventListener('pointerleave',()=>{bk.style.removeProperty('--ry');bk.style.removeProperty('--rx');bk.style.transform=''});
    el.querySelector('.card-open').onclick=()=>openFocus(i);
    el.querySelector('.bk3d').onclick=()=>openFocus(i);el.querySelector('.bk3d').style.cursor='pointer';
    grid.appendChild(el);
  });
  document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
    document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===c));
    document.querySelectorAll('.card').forEach(el=>el.classList.toggle('dim',c.dataset.f!=='all'&&el.dataset.tag!==c.dataset.f));
  });
}

/* =========================================================
   AVVIO
   ========================================================= */
(async()=>{
  try{await Promise.race([Promise.all([document.fonts.load('900 120px "Inter Tight"'),document.fonts.load('800 60px "Inter Tight"'),document.fonts.load('700 40px "Inter Tight"'),document.fonts.load('400 30px "Inter Tight"'),document.fonts.load('500 20px "JetBrains Mono"')]),new Promise(r=>setTimeout(r,2500))])}catch(e){}
  // copertine vere: covers/<file> indicato in img, altrimenti covers/01.jpg … covers/07.jpg se esistono
  await Promise.all(BOOKS.map(b=>new Promise(res=>{const im=new Image();im.onload=()=>{b.image=im;res()};im.onerror=()=>res();im.src=b.img||`covers/${b.n}.jpg`})));
  BOOKS.forEach((b,i)=>{b.coverCanvas=drawCover(b)});
  BOOKS.forEach((b,i)=>books.push(makeBook(b,i)));
  layout();onScroll();buildDom();
  dispatchEvent(new Event('biblio-ready'));
  renderer.compile(scene,camera);
  scene.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.map&&renderer.initTexture(m.map))});
  renderer.render(scene,camera);
  frame();
})();
