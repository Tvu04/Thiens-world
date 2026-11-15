
const CFG = {
  games:  {label:'game',   meta:'Platform / genre', ph:'e.g. PC · RPG',            emoji:['🎮','🕹️','👾','⚔️','🌟'], bg:['#bde0fe','#cdb4db']},
  kpop:   {label:'favorite',meta:'Drama or group / bias', ph:'e.g. K-Drama · romance', emoji:['💗','🌸','🎤','💌','🫶'], bg:['#ffc8dd','#cdb4db']},
  music:  {label:'song',   meta:'Artist',           ph:'e.g. artist name',         emoji:['🎧','🎵','💿','🎶','🌙'], bg:['#cdb4db','#ffc8dd']},
  movies: {label:'title',  meta:'Type / year',      ph:'e.g. Movie · 2024',        emoji:['🎬','🍿','📺','🎞️','⭐'], bg:['#c8f2e0','#bde0fe']}
};
const EMPTY = {
  games:  ['🕹️','Tap “+ Add game” to add more games you play!'],
  kpop:   ['🌸','Waiting for your favorite dramas & idols…'],
  music:  ['💿','Your playlist is empty — add a song you love!'],
  movies: ['🍿','Popcorn’s ready — add your first movie or show!']
};
const KEY = 'thien-little-world-v1';
let data = {games:[],kpop:[],music:[],movies:[]};
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) data = Object.assign(data, s); } catch(e){}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){} };

const esc = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function render(sec){
  const g = document.getElementById('grid-'+sec), c = CFG[sec];
  if (!data[sec].length){ g.innerHTML = `<div class="empty"><span class="big">${EMPTY[sec][0]}</span><p>${EMPTY[sec][1]}</p></div>`; return; }
  g.innerHTML = data[sec].map((it,i) => {
    const em = c.emoji[i % c.emoji.length];
    const cover = it.img ? `style="background-image:url('${it.img}')"` : `style="background:linear-gradient(135deg,${c.bg[0]},${c.bg[1]})"`;
    return `<div class="card">
      <button class="del" title="Remove" data-sec="${sec}" data-i="${i}">✕</button>
      <div class="cover" ${cover}>${it.img ? '' : em}</div>
      <div class="body"><h3>${esc(it.name)}</h3>${it.meta?`<div class="meta">${esc(it.meta)}</div>`:''}
      ${it.note?`<p class="note">${esc(it.note)}</p>`:''}
      ${it.rate?`<div class="hearts">${'♥'.repeat(it.rate)}${'♡'.repeat(5-it.rate)}</div>`:''}</div></div>`;
  }).join('');
}



const PAGE=document.body.dataset.page;
// items built into the pages (not added through the + button)
const STATIC={games:1};
// nav highlight
document.querySelectorAll('nav a').forEach(a=>{ if(a.dataset.p===PAGE) a.classList.add('active'); });
// home counts
document.querySelectorAll('[data-count]').forEach(el=>{ const n=data[el.dataset.count].length+(STATIC[el.dataset.count]||0); el.textContent = n ? n+' saved ♡' : 'nothing yet ✧'; });
if (CFG[PAGE]) { render(PAGE); updateCount(); }
function updateCount(){ const el=document.getElementById('count'); if(el){ const n=data[PAGE].length+(STATIC[PAGE]||0); el.textContent = n+(n===1?' item':' items'); } }
const _render=render; render=function(s){ _render(s); updateCount(); };
// modal
const ov = document.getElementById('overlay'), form = document.getElementById('form');
let cur = null, rate = 0, imgData = '';
const stars = [...document.querySelectorAll('#rate span')];
const paint = n => stars.forEach((s,i)=>s.classList.toggle('on', i<n));
stars.forEach((s,i)=>{ s.onclick=()=>{rate=i+1;paint(rate)}; s.onmouseenter=()=>paint(i+1); });
document.getElementById('rate').onmouseleave=()=>paint(rate);

document.querySelectorAll('.add-btn').forEach(b => b.onclick = () => {
  cur = b.dataset.sec; const c = CFG[cur];
  form.reset(); rate = 0; imgData = ''; paint(0);
  document.getElementById('m-title').textContent = `Add a ${c.label} ✨`;
  document.getElementById('l-meta').textContent = c.meta;
  document.getElementById('f-meta').placeholder = c.ph;
  ov.classList.add('open'); setTimeout(()=>document.getElementById('f-name').focus(),50);
});
const close = () => ov.classList.remove('open');
document.getElementById('cancel').onclick = close;
ov.onclick = e => { if (e.target === ov) close(); };
document.addEventListener('keydown', e => { if (e.key==='Escape') close(); });

document.getElementById('f-img').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(), r = new FileReader();
  r.onload = () => { img.onload = () => { // shrink so it saves nicely
      const cv = document.createElement('canvas'), s = Math.min(1, 480/img.width);
      cv.width = img.width*s; cv.height = img.height*s;
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      imgData = cv.toDataURL('image/jpeg', .8); }; img.src = r.result; };
  r.readAsDataURL(f);
};

form.onsubmit = e => {
  e.preventDefault();
  data[cur].push({ name: f('name'), meta: f('meta'), note: f('note'), rate, img: imgData });
  persist(); render(cur); close();
  burst();
};
function f(id){ return document.getElementById('f-'+id).value.trim(); }

document.addEventListener('click', e => {
  const d = e.target.closest('.del'); if (!d) return;
  data[d.dataset.sec].splice(+d.dataset.i, 1); persist(); render(d.dataset.sec);
});

// floating sparkles
const sp = document.getElementById('sparkles'), bits = ['✦','✧','♡','⋆','★'];
const cols = ['#ff4fd8','#9d6bff','#3ee8ff','#4dffc3','#ffd36b'];
function spawn(){
  const el = document.createElement('span'); el.className='float';
  el.textContent = bits[Math.random()*bits.length|0];
  el.style.left = Math.random()*100+'vw';
  el.style.fontSize = (10+Math.random()*18)+'px';
  el.style.color = cols[Math.random()*cols.length|0];
  el.style.animationDuration = (10+Math.random()*12)+'s';
  sp.appendChild(el); setTimeout(()=>el.remove(), 23000);
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches){ for(let i=0;i<10;i++) setTimeout(spawn, i*700); setInterval(spawn, 1300); }

function burst(){
  for (let i=0;i<14;i++){
    const el = document.createElement('span'); el.textContent = bits[i%bits.length];
    Object.assign(el.style,{position:'fixed',left:'50%',top:'50%',zIndex:60,pointerEvents:'none',fontSize:'20px',color:cols[i%cols.length],transition:'all .9s ease-out'});
    document.body.appendChild(el);
    const a = Math.PI*2*i/14, d = 120+Math.random()*80;
    requestAnimationFrame(()=>{ el.style.transform=`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.4)`; el.style.opacity=0; });
    setTimeout(()=>el.remove(),1000);
  }
}


/* ================= ✦ FANCY UPGRADE ✦ ================= */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// scroll progress bar
const bar = document.getElementById('progress');
function prog(){ if(!bar) return; const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; bar.style.width=(max>0? h.scrollTop/max*100:0)+'%'; }
addEventListener('scroll', prog, {passive:true}); prog();

// typewriter tagline on home
const typer = document.getElementById('typer');
if (typer){
  const words=['games I play','K-dramas I binge','K-pop I stan','songs on repeat','movies I love'];
  let w=0,c=0,del=false;
  (function tick(){
    const word=words[w]; typer.textContent=word.slice(0,c);
    if(!del && c<word.length){c++; setTimeout(tick,85);}
    else if(!del){del=true; setTimeout(tick,1600);}
    else if(c>0){c--; setTimeout(tick,40);}
    else {del=false; w=(w+1)%words.length; setTimeout(tick,300);}
  })();
}

// 3D tilt + shine
const fine = matchMedia('(pointer:fine)').matches;
function addTilt(sel, max){
  document.querySelectorAll(sel).forEach(el=>{
    el.classList.add('tilt');
    if(!fine||reduce) return;
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      el.style.transform=`perspective(900px) rotateX(${(.5-y)*max}deg) rotateY(${(x-.5)*max}deg) translateY(-6px)`;
      el.style.setProperty('--mx',x*100+'%'); el.style.setProperty('--my',y*100+'%');
    });
    el.addEventListener('mouseleave',()=>{ el.style.transform=''; });
  });
}
addTilt('.homecard',10); addTilt('.rank',12); addTilt('.map',12); addTilt('.role',6);
// re-apply to user cards after they render
const grid=document.querySelector('.grid');
if(grid) new MutationObserver(()=>addTilt('.card:not(.tilt)',10)).observe(grid,{childList:true});
addTilt('.card',10);

// ripple on buttons
document.addEventListener('click',e=>{
  const b=e.target.closest('.add-btn,.save'); if(!b) return;
  const r=b.getBoundingClientRect(), s=document.createElement('span'), d=Math.max(r.width,r.height);
  s.className='ripple'; Object.assign(s.style,{width:d+'px',height:d+'px',left:(e.clientX-r.left-d/2)+'px',top:(e.clientY-r.top-d/2)+'px'});
  b.appendChild(s); setTimeout(()=>s.remove(),600);
});

// cursor sparkle trail
if(fine && !reduce){
  let last=0; const tb=['✦','✧','♡','⋆'];
  addEventListener('mousemove',e=>{
    const now=performance.now(); if(now-last<45) return; last=now;
    const t=document.createElement('span'); t.className='trail';
    t.textContent=tb[Math.random()*tb.length|0]; t.style.left=e.clientX+'px'; t.style.top=e.clientY+'px';
    t.style.color=cols[Math.random()*cols.length|0]; t.style.fontSize=(9+Math.random()*9)+'px';
    document.body.appendChild(t); setTimeout(()=>t.remove(),800);
  },{passive:true});
}

// smooth page transitions
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href$=".html"]'); if(!a||e.ctrlKey||e.metaKey||e.shiftKey) return;
  e.preventDefault(); document.body.classList.add('leaving'); setTimeout(()=>location.href=a.href,300);
});
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));

/* ================= ✦ GALAXY: stars + shooting stars ✦ ================= */
(function(){
  const box=document.createElement('div'); box.id='stars'; document.body.prepend(box);
  const n = innerWidth<700 ? 70 : 140;
  for(let i=0;i<n;i++){
    const s=document.createElement('i'), z=Math.random()*2+.6;
    Object.assign(s.style,{left:Math.random()*100+'%',top:Math.random()*100+'%',width:z+'px',height:z+'px',
      animationDuration:(2+Math.random()*4)+'s',animationDelay:(-Math.random()*6)+'s',
      boxShadow:`0 0 ${z*3}px ${['#fff','#ff9ef0','#9ff4ff','#cdb6ff'][i%4]}`});
    box.appendChild(s);
  }
  if(reduce) return;
  setInterval(()=>{
    const s=document.createElement('span'); s.className='shoot';
    s.style.left=(40+Math.random()*60)+'vw'; s.style.top=(Math.random()*40)+'vh';
    document.body.appendChild(s); setTimeout(()=>s.remove(),1500);
  }, 4500);
})();
