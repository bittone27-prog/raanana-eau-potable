(function(){
const REPO='bittone27-prog/raanana-eau-potable';
let lang=localStorage.getItem('lang')||'fr';
let filter='all', query='', userPos=null, nearestMode=false, selected=null;
let points=(window.WATER_POINTS||[]).slice();
const t=k=>(I18N[lang]&&I18N[lang][k])||I18N.fr[k]||k;

const map=L.map('map').setView(window.RAANANA_CENTER,13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
const layer=L.layerGroup().addTo(map);
let userMarker=null;

const ICONS={fountain:'💧',park:'🌳',building:'🏛️',school:'🏫',other:'🚰'};
function icon(p){
  const cls='pin'+(p.status==='broken'?' broken':(!p.verified?' unverified':''));
  return L.divIcon({className:'',html:`<div class="${cls}"><span>${ICONS[p.type]||ICONS.other}</span></div>`,iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-32]});
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function pname(p){return (p.name&&(p.name[lang]||p.name.fr||p.name.en||p.name.he))||t('unnamed');}
function dist(a,b){const R=6371000,r=Math.PI/180;const dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r;
  const x=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
function fmt(m){return m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km';}
function yn(v,key){return v===true?'✅ '+t(key):v===false?'❌ '+t(key):null;}
function accessText(p){
  const a=p.access||{};const parts=[yn(a.wheelchair,'wheelchair'),yn(a.dog,'dog'),yn(a.bottle,'bottle')].filter(Boolean);
  return parts.length?parts.join(' · '):null;
}
function badges(p){
  let h='';
  if(p.status==='broken')h+=`<span class="badge bad">${t('broken')}</span>`;
  h+=p.verified?`<span class="badge ver">✔ ${t('verified')}</span>`:`<span class="badge unv">⚠ ${t('unverified')}</span>`;
  return h;
}
function routeUrl(p){
  const ua=navigator.userAgent;
  if(/iPhone|iPad|iPod/.test(ua))return `https://maps.apple.com/?daddr=${p.lat},${p.lng}&dirflg=w`;
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
}
function popup(p){
  const addr=p.address?esc(p.address):`<em>${t('unknownAddr')}</em>`;
  const hrs=p.hours?esc(p.hours):`<em>${t('unknownHours')}</em>`;
  const acc=accessText(p)||`<em>${t('unknownAccess')}</em>`;
  return `<div class="popup"><h3>${esc(pname(p))}</h3><p>${badges(p)}</p>
  <p><b>${t('address')} :</b> ${addr}</p><p><b>${t('hours')} :</b> ${hrs}</p><p><b>${t('access')} :</b> ${acc}</p>
  ${p.notes?`<p>${esc(p.notes)}</p>`:''}
  ${p.source?`<p class="muted small">${t('source')} : ${esc(p.source)}</p>`:''}
  <div class="btns"><a class="btn primary" target="_blank" rel="noopener" href="${routeUrl(p)}">${t('route')}</a>
  <button class="btn" data-report="${esc(p.id)}">${t('report')}</button></div></div>`;
}
function visible(){
  const q=query.trim().toLowerCase();
  let arr=points.filter(p=>(filter==='all'||p.type===filter));
  if(q)arr=arr.filter(p=>[pname(p),p.address||'',p.notes||'',...Object.values(p.name||{})].join(' ').toLowerCase().includes(q));
  if(userPos){arr.forEach(p=>p._d=dist(userPos,[p.lat,p.lng]));}
  if(nearestMode&&userPos)arr.sort((a,b)=>a._d-b._d);
  return arr;
}
const markers={};
function render(){
  const arr=visible();
  layer.clearLayers();
  const list=document.getElementById('list');list.innerHTML='';
  arr.forEach(p=>{
    const m=L.marker([p.lat,p.lng],{icon:icon(p),title:pname(p)}).bindPopup(()=>popup(p));
    m.addTo(layer);markers[p.id]=m;
    const li=document.createElement('li');li.className='item';
    li.innerHTML=`<h3>${esc(pname(p))}</h3><div>${badges(p)}</div><div class="meta">${p.address?esc(p.address):t('unknownAddr')}${userPos&&p._d!=null?` · ${t('distance')} ${fmt(p._d)}`:''}</div>`;
    li.onclick=()=>{map.setView([p.lat,p.lng],17);m.openPopup();document.getElementById('panel').classList.remove('open');};
    list.appendChild(li);
  });
  document.getElementById('count').textContent=arr.length;
  if(!arr.length){const li=document.createElement('li');li.className='muted small';li.textContent=t('empty');list.appendChild(li);}
  return arr;
}
function renderFilters(){
  const el=document.getElementById('filters');el.innerHTML='';
  ['all','fountain','park','building','school','other'].forEach(k=>{
    const b=document.createElement('button');b.className='chip'+(filter===k?' active':'');
    b.textContent=(k==='all'?'':ICONS[k]+' ')+t(k);b.onclick=()=>{filter=k;renderFilters();render();};el.appendChild(b);
  });
}
function applyLang(){
  document.documentElement.lang=lang;document.documentElement.dir=I18N[lang].dir;
  document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));
  document.querySelectorAll('[data-i18n-ph]').forEach(n=>n.placeholder=t(n.dataset.i18nPh));
  document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  document.title=t('title');renderFilters();render();
}
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('lang',lang);applyLang();});
document.getElementById('search').addEventListener('input',e=>{query=e.target.value;render();});
document.getElementById('togglePanel').onclick=()=>document.getElementById('panel').classList.toggle('open');

const status=m=>document.getElementById('status').textContent=m||'';
function locate(cb){
  if(!navigator.geolocation){status(t('locFail'));return;}
  status(t('locating'));
  navigator.geolocation.getCurrentPosition(pos=>{
    userPos=[pos.coords.latitude,pos.coords.longitude];status('');
    if(userMarker)map.removeLayer(userMarker);
    userMarker=L.circleMarker(userPos,{radius:8,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(map);
    cb&&cb();
  },()=>status(t('locFail')),{enableHighAccuracy:true,timeout:10000});
}
document.getElementById('nearest').onclick=()=>locate(()=>{
  nearestMode=true;const arr=render();
  const pts=[userPos].concat(arr.slice(0,3).map(p=>[p.lat,p.lng]));
  map.fitBounds(L.latLngBounds(pts).pad(0.3));
  document.getElementById('panel').classList.add('open');
});

// Chargement OpenStreetMap (amenity=drinking_water) — toujours marqué « non vérifié »
document.getElementById('loadOsm').onclick=async()=>{
  status(t('osmLoading'));
  const b=window.RAANANA_BBOX.join(',');
  const q=`[out:json][timeout:25];(node["amenity"="drinking_water"](${b});node["man_made"="water_tap"]["drinking_water"!="no"](${b}););out body;`;
  try{
    const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q)});
    const j=await r.json();
    const known=new Set(points.map(p=>p.id));
    let n=0;
    j.elements.forEach(e=>{
      const id='osm-'+e.id;if(known.has(id))return;
      const tg=e.tags||{};
      const addr=[tg['addr:street'],tg['addr:housenumber']].filter(Boolean).join(' ')||null;
      const type=/park|garden|playground/.test((tg.name||'')+(tg.leisure||''))?'park':'fountain';
      points.push({id,name:{fr:tg['name:fr']||tg.name,he:tg['name:he']||tg.name,en:tg['name:en']||tg.name},
        lat:e.lat,lng:e.lon,type,address:addr,hours:tg.opening_hours||null,
        access:{wheelchair:tg.wheelchair==='yes'?true:tg.wheelchair==='no'?false:null,dog:tg.dog==='yes'?true:tg.dog==='no'?false:null,bottle:tg.bottle==='yes'?true:tg.bottle==='no'?false:null},
        notes:null,verified:false,status:tg.disused==='yes'||tg.operational_status==='broken'?'broken':'unknown',source:'OpenStreetMap',lastChecked:null});
      n++;
    });
    status(n+' '+t('osmDone'));render();
    if(points.length)map.fitBounds(L.latLngBounds(points.map(p=>[p.lat,p.lng])).pad(0.1));
  }catch(err){status(t('osmFail'));}
};

// Signalements via GitHub Issues (aucun serveur requis)
const dlg=document.getElementById('reportDialog');let reportPos=null,reportTarget=null;
function openReport(kind,p){
  reportTarget=p||null;reportPos=null;
  document.getElementById('reportKind').value=kind;
  document.getElementById('reportText').value='';
  document.getElementById('posInfo').textContent='';
  document.getElementById('reportPoint').textContent=p?pname(p)+' ('+p.id+')':'';
  dlg.showModal();
}
document.getElementById('reportNew').onclick=()=>openReport('missing');
document.addEventListener('click',e=>{const id=e.target.dataset&&e.target.dataset.report;if(id){const p=points.find(x=>x.id===id);openReport('broken',p);}});
document.getElementById('reportCancel').onclick=()=>dlg.close();
document.getElementById('useMyPos').onclick=()=>locate(()=>{reportPos=userPos;document.getElementById('posInfo').textContent=t('posAdded')+' ✔';});
document.getElementById('reportForm').addEventListener('submit',e=>{
  e.preventDefault();
  const kind=document.getElementById('reportKind').value;
  const txt=document.getElementById('reportText').value;
  const label={missing:'point-manquant',broken:'hors-service',wrong:'info-incorrecte',verified:'confirmation'}[kind];
  const title=`[${label}] ${reportTarget?pname(reportTarget):'Nouveau point'}`;
  const body=`**Type**: ${label}\n**Point**: ${reportTarget?reportTarget.id+' — '+pname(reportTarget):'nouveau'}\n`+
    (reportPos?`**Position**: ${reportPos[0].toFixed(6)}, ${reportPos[1].toFixed(6)} (https://www.openstreetmap.org/?mlat=${reportPos[0]}&mlon=${reportPos[1]})\n`:'')+
    `\n${txt}\n\n_Langue: ${lang}_`;
  const url=`https://github.com/${REPO}/issues/new?labels=${encodeURIComponent(label)}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  window.open(url,'_blank','noopener');dlg.close();
});

applyLang();
})();
