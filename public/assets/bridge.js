// One virtual wall clock for every renderer. Standalone pages remain live.
(()=>{
const NativeDate=window.Date,embedded=window.parent!==window,preview=new URLSearchParams(location.search).has('preview');let epoch=NativeDate.now(),anchor=performance.now(),rate=1,mode='live';
const previewTime=new URLSearchParams(location.search).get('at');
if(preview&&/^\d{2}:\d{2}:\d{2}$/.test(previewTime||'')){const parts=previewTime.split(':').map(Number);if(parts[0]<24&&parts[1]<60&&parts[2]<60){const d=new NativeDate();d.setHours(...parts,0);epoch=d.getTime();mode='preview';rate=0;}}
function now(){return mode==='live'?NativeDate.now():epoch+(performance.now()-anchor)*rate;}
function ClockDate(...args){if(!new.target)return new NativeDate(now()).toString();return Reflect.construct(NativeDate,args.length?args:[now()],new.target);}
Object.setPrototypeOf(ClockDate,NativeDate);ClockDate.prototype=NativeDate.prototype;ClockDate.now=now;window.Date=ClockDate;
let readySent=false;function ready(){if(readySent)return;readySent=true;document.documentElement.dataset.readyMs=performance.now().toFixed(1);notify('clock-ready');}
window.ClockTime={now,ready, get mode(){return mode;},get rate(){return rate;}};
function notify(type,extra={}){if(embedded)parent.postMessage({type,...extra},location.origin);}
window.addEventListener('message',e=>{if(!embedded||e.source!==parent||e.origin!==location.origin)return;const d=e.data;
 if(d?.type==='clock-config'&&['live','demo'].includes(d.mode)&&Number.isFinite(d.epoch)&&Number.isFinite(d.rate)&&d.rate>=0&&d.rate<=3600){mode=d.mode;epoch=d.epoch;anchor=performance.now();rate=d.rate;window.dispatchEvent(new Event('clock:change'));}
 if(d?.type==='clock-action'){if(d.action==='settings')(document.getElementById('menuButton')||document.getElementById('menuBtn')||document.getElementById('settingsBtn'))?.click();if(d.action==='dance')window.dispatchEvent(new Event('clock:dance'));if(d.action==='assemble')window.dispatchEvent(new Event('clock:assemble'));}
});
if(embedded||preview)document.documentElement.classList.add('embedded');
window.addEventListener('error',()=>notify('clock-error'));
document.addEventListener('DOMContentLoaded',()=>{for(const id of ['menuBtn','settingsBtn']){const b=document.getElementById(id);if(b){b.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';b.setAttribute('aria-label','时钟设置');}}if(!embedded&&!preview){const a=document.createElement('a');a.href='../';a.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" style="vertical-align:middle;margin-right:6px"><path d="m10 5-7 7 7 7M3 12h18"/></svg>100 Clocks';a.className='standalone-back';document.body.append(a);}ready();});
})();
