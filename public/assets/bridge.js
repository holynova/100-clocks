// One virtual wall clock for every renderer. Standalone pages remain live.
(()=>{
const NativeDate=window.Date,embedded=window.parent!==window,preview=new URLSearchParams(location.search).has('preview');let epoch=NativeDate.now(),anchor=performance.now(),rate=1,mode='live';
const previewTime=new URLSearchParams(location.search).get('at');
if(preview&&/^\d{2}:\d{2}:\d{2}$/.test(previewTime||'')){const parts=previewTime.split(':').map(Number);if(parts[0]<24&&parts[1]<60&&parts[2]<60){const d=new NativeDate();d.setHours(...parts,0);epoch=d.getTime();mode='preview';rate=0;}}
function now(){return mode==='live'?NativeDate.now():epoch+(performance.now()-anchor)*rate;}
function ClockDate(...args){if(!new.target)return new NativeDate(now()).toString();return Reflect.construct(NativeDate,args.length?args:[now()],new.target);}
Object.setPrototypeOf(ClockDate,NativeDate);ClockDate.prototype=NativeDate.prototype;ClockDate.now=now;window.Date=ClockDate;
window.ClockTime={now, get mode(){return mode;}};
function notify(type,extra={}){if(embedded)parent.postMessage({type,...extra},location.origin);}
window.addEventListener('message',e=>{if(!embedded||e.source!==parent||e.origin!==location.origin)return;const d=e.data;
 if(d?.type==='clock-config'&&['live','demo'].includes(d.mode)&&Number.isFinite(d.epoch)&&[1,20].includes(d.rate)){mode=d.mode;epoch=d.epoch;anchor=performance.now();rate=d.rate;window.dispatchEvent(new Event('clock:change'));}
 if(d?.type==='clock-action'){if(d.action==='settings')(document.getElementById('menuButton')||document.getElementById('menuBtn')||document.getElementById('settingsBtn'))?.click();if(d.action==='dance')window.dispatchEvent(new Event('clock:dance'));}
});
if(embedded||preview)document.documentElement.classList.add('embedded');
window.addEventListener('error',()=>notify('clock-error'));
document.addEventListener('DOMContentLoaded',()=>{if(!embedded&&!preview){const a=document.createElement('a');a.href='../';a.textContent='← 100 Clocks';a.className='standalone-back';document.body.append(a);}notify('clock-ready');});
})();
