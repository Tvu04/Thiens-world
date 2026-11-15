
const CFG = {
  games:  {label:'game',   meta:'Platform / genre', ph:'e.g. PC · RPG',            emoji:['🎮','🕹️','👾','⚔️','🌟'], bg:['#bde0fe','#cdb4db']},
  kpop:   {label:'favorite',meta:'Drama or group / bias', ph:'e.g. K-Drama · romance', emoji:['💗','🌸','🎤','💌','🫶'], bg:['#ffc8dd','#cdb4db']},
  music:  {label:'song',   meta:'Artist',           ph:'e.g. artist name',         emoji:['🎧','🎵','💿','🎶','🌙'], bg:['#cdb4db','#ffc8dd']},
  movies: {label:'title',  meta:'Type / year',      ph:'e.g. Movie · 2024',        emoji:['🎬','🍿','📺','🎞️','⭐'], bg:['#c8f2e0','#bde0fe']}
};
const EMPTY = {
  games:  ['🕹️','No games yet — tap “+ Add game” to start your collection!'],
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
// nav highlight
document.querySelectorAll('nav a').forEach(a=>{ if(a.dataset.p===PAGE) a.classList.add('active'); });
// home counts
document.querySelectorAll('[data-count]').forEach(el=>{ const n=data[el.dataset.count].length; el.textContent = n ? n+' saved ♡' : 'nothing yet ✧'; });
if (CFG[PAGE]) { render(PAGE); updateCount(); }
function updateCount(){ const el=document.getElementById('count'); if(el){ const n=data[PAGE].length; el.textContent = n+(n===1?' item':' items'); } }
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
const sp = document.getElementById('sparkles'), bits = ['✦','✧','♡','⋆','✿','☁︎','★'];
const cols = ['#ff8fb8','#a685c9','#7fb8f0','#6fcfa8','#ffb3c9'];
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

