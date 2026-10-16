import {clocks} from './catalog.js?v=2.1.1';
const $=id=>document.getElementById(id),frame=$('clock-frame');let current=null,mode='live',loadTimeout;
function renderCards(filter='all'){$('cards').innerHTML=clocks.filter(c=>filter==='all'||c.category===filter).map(c=>`<a class="card" href="?clock=${c.id}" style="--clock-bg:${c.bg}"><div class="card-image"><img src="${c.image}?v=2.0.0-final" width="960" height="600" alt="${c.name}外观预览" loading="lazy" decoding="async"><span class="open" aria-hidden="true">↗</span></div><div class="card-meta"><h2>${c.name}<span class="en" lang="en">${c.en}</span></h2><span class="number">${c.number}</span></div><p>${c.tag}</p></a>`).join('');}
function clockConfig(){return {type:'clock-config',mode,epoch:mode==='demo'?Math.floor(Date.now()/60000)*60000:Date.now(),rate:mode==='demo'?20:1};}
function send(config=clockConfig()){if(current)frame.contentWindow?.postMessage(config,location.origin);}
function setMode(next){mode=next;for(const id of ['live','demo']){$(id).classList.toggle('active',mode===id);$(id).setAttribute('aria-pressed',String(mode===id));}$('mode-note').textContent=mode==='live'?'与设备本地时间同步':'每 3 秒走过 1 分钟';send();}
function route(){const id=new URL(location.href).searchParams.get('clock'),c=clocks.find(c=>c.id===id);current=c||null;document.body.classList.toggle('is-viewing',!!c);$('viewer').hidden=!c;$('collection').hidden=!!c;clearTimeout(loadTimeout);
 if(!c){frame.removeAttribute('src');document.title='100 Clocks · 时间实验室';return;}
 $('view-name').textContent=c.name;$('view-number').textContent=c.number;$('view-desc').textContent=c.desc;$('view-source').textContent=c.source;$('dance').hidden=c.id!=='kinetic';$('detail-settings').hidden=!c.settings;$('stage').style.background=c.bg;frame.title=c.name;$('load-state').hidden=false;$('load-state').textContent='正在装配时钟…';frame.src=c.href+'?embed&v=2.0.0-final';document.title=`${c.name} · 100 Clocks`;setMode('live');
 loadTimeout=setTimeout(()=>{if(!$('load-state').hidden)$('load-state').textContent='加载较慢，请刷新页面重试。';},12000);
}
function navigate(id){const u=new URL(location.href);if(id)u.searchParams.set('clock',id);else u.searchParams.delete('clock');history.pushState({},'',u);route();window.scrollTo(0,0);}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname!==location.pathname||a.target||u.hash)return;e.preventDefault();navigate(u.searchParams.get('clock'));});
for(const b of document.querySelectorAll('[data-filter]'))b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});renderCards(b.dataset.filter);};
$('previous').onclick=()=>navigate(clocks[(clocks.indexOf(current)+clocks.length-1)%clocks.length].id);$('next').onclick=()=>navigate(clocks[(clocks.indexOf(current)+1)%clocks.length].id);
$('live').onclick=()=>setMode('live');$('demo').onclick=()=>setMode('demo');$('dance').onclick=()=>send({type:'clock-action',action:'dance'});$('detail-settings').onclick=()=>send({type:'clock-action',action:'settings'});
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch{$('mode-note').textContent='浏览器不支持全屏，可横屏观看。';}};
frame.addEventListener('load',()=>{if(!current)return;send();});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==='clock-ready'){clearTimeout(loadTimeout);$('load-state').hidden=true;send();}if(e.data?.type==='clock-error'){$('load-state').hidden=false;$('load-state').textContent='时钟加载失败，请刷新后重试。';}});
window.addEventListener('popstate',route);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='live')send();});
function tick(){$('local-time').textContent=new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());}renderCards();route();tick();setInterval(tick,1000);
