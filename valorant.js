/* ✦ Valorant extras: agent + map viewer, rank icons ✦
   Images load live from valorant-api.com (community API for Riot's game assets). */
(function(){
  const API='https://valorant-api.com/v1/';
  const viewer=document.getElementById('viewer'), vbox=document.getElementById('vbox'), vart=document.getElementById('vart'),
        vname=document.getElementById('vname'), vrole=document.getElementById('vrole'), vdesc=document.getElementById('vdesc');
  let agents={}, maps={};
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const hex=c=>c&&c.length>=6?'#'+c.slice(0,6):null;

  async function get(path){ const r=await fetch(API+path); if(!r.ok) throw new Error(r.status); return (await r.json()).data; }

  // agents
  get('agents?isPlayableCharacter=true').then(list=>{
    list.forEach(a=>agents[norm(a.displayName)]=a);
    document.querySelectorAll('.agent').forEach(b=>{
      const a=agents[norm(b.dataset.agent)]; if(!a||!a.displayIcon) return;
      const i=new Image(); i.src=a.displayIcon; i.alt=''; i.className='agent-ic'; b.prepend(i);
    });
  }).catch(()=>{});

  // maps (also use splash as tile background)
  get('maps').then(list=>{
    list.forEach(m=>maps[norm(m.displayName)]=m);
    document.querySelectorAll('.map').forEach(t=>{
      const m=maps[norm(t.dataset.map)]; if(!m) return;
      const src=m.listViewIcon||m.splash; if(!src) return;
      t.style.backgroundImage=`linear-gradient(135deg,rgba(10,6,32,.35),rgba(255,79,216,.25)),url("${src}")`;
      t.classList.add('has-img');
    });
  }).catch(()=>{});

  // rank icons (latest competitive season)
  get('competitivetiers').then(eps=>{
    const tiers=eps[eps.length-1].tiers;
    document.querySelectorAll('.rk-gem[data-tier]').forEach(g=>{
      const t=tiers.find(x=>norm(x.tierName)===norm(g.dataset.tier)); if(!t||!t.largeIcon) return;
      const i=new Image(); i.alt=g.dataset.tier+' rank'; i.className='rank-ic';
      i.onload=()=>{ g.textContent=''; g.appendChild(i); g.classList.add('has-img'); };
      i.src=t.largeIcon;
    });
  }).catch(()=>{});

  function open(kind,key){
    vbox.className='vbox is-'+kind; vart.innerHTML=''; vart.removeAttribute('style');
    if(kind==='agent'){
      const a=agents[norm(key)];
      vname.textContent=a?a.displayName:key;
      vrole.textContent=a&&a.role?a.role.displayName:'Agent';
      vdesc.textContent=a&&a.description?a.description:'Picture couldn’t load right now — check your internet connection and try again.';
      if(a){
        const cols=(a.backgroundGradientColors||[]).map(hex).filter(Boolean);
        if(cols.length) vart.style.background=`linear-gradient(160deg,${cols.join(',')})`;
        if(a.background){ const bg=new Image(); bg.src=a.background; bg.className='v-bgword'; bg.alt=''; vart.appendChild(bg); }
        const p=new Image(); p.src=a.fullPortrait||a.displayIcon; p.alt=a.displayName; p.className='v-portrait'; vart.appendChild(p);
      } else vart.innerHTML='<span class="v-missing">✦</span>';
    } else {
      const m=maps[norm(key)];
      vname.textContent=m?m.displayName:key;
      vrole.textContent=m&&m.coordinates?m.coordinates:'Map';
      vdesc.textContent=m?'':'Picture couldn’t load right now — check your internet connection and try again.';
      if(m&&m.splash){ const p=new Image(); p.src=m.splash; p.alt=m.displayName; p.className='v-splash'; vart.appendChild(p); }
      else vart.innerHTML='<span class="v-missing">✦</span>';
    }
    viewer.classList.add('open'); viewer.setAttribute('aria-hidden','false');
  }
  function close(){ viewer.classList.remove('open'); viewer.setAttribute('aria-hidden','true'); }

  document.addEventListener('click',e=>{
    const a=e.target.closest('button.agent'); if(a){ open('agent',a.dataset.agent); return; }
    const m=e.target.closest('button.map[data-map]'); if(m){ open('map',m.dataset.map); return; }
  });
  document.getElementById('vclose').onclick=close;
  viewer.addEventListener('click',e=>{ if(e.target===viewer) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
})();
