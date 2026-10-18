import {createPlotClock} from './plotclock.js?v=3.0.0';
import {createFerrofluid} from './ferrofluid.js?v=3.0.0';
import {createMoire} from './moire.js?v=3.0.0';
import {createSand} from './sand.js?v=3.0.0';
const id=document.body.dataset.clock,canvas=document.getElementById('experiment-canvas'),ctx=canvas.getContext('2d'),time=document.getElementById('clock-time'),phase=document.getElementById('experiment-phase');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,preview=window.ClockTime.mode==='preview';
const sizes={plotclock:[1000,640],ferrofluid:[1000,500],moire:[800,800],sand:[1000,580]},[W,H]=sizes[id];
let animation=0,lastFrame=0,engine,ready=false,lastAccessible='',lastPaint=0;
function wake(){if(!animation&&!document.hidden)animation=requestAnimationFrame(frame);}
const env={canvas,ctx,W,H,reduced,preview,wake,phase(text){if(phase.textContent!==text)phase.textContent=text;},date:()=>new Date(),rate:()=>window.ClockTime.mode==='live'?1:window.ClockTime.rate};
engine=({plotclock:createPlotClock,ferrofluid:createFerrofluid,moire:createMoire,sand:createSand})[id](env);
function resize(){const r=canvas.getBoundingClientRect(),w=r.width||W,h=r.height||H,dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(w*dpr/W,0,0,h*dpr/H,0,0);wake();}
function tick(force=false){const d=new Date(),s=[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join(':');if(s!==lastAccessible){time.textContent=s;time.dateTime=d.toISOString();canvas.setAttribute('aria-label',document.title.split(' · ')[0]+' '+s);lastAccessible=s;}if(engine.update(d,performance.now(),force))wake();}
function frame(t){animation=0;if(id==='ferrofluid'&&t-lastPaint<32){wake();return;}lastPaint=t;const dt=Math.min(.04,Math.max(.001,(t-(lastFrame||t-16.67))/1000));lastFrame=t;ctx.clearRect(0,0,W,H);const active=engine.render(t,dt);canvas.dataset.active=String(!!active);if(!ready){ready=true;canvas.dataset.ready='true';window.ClockTime.ready();}if(active)wake();}
window.ClockExperiment={options:engine.options,setOption(key,value){engine.setOption(key,value);const o=engine.options.find(o=>o.key===key);if(o&&o.type!=='button')o.value=value;wake();}};
window.dispatchEvent(new Event('clock:experiment-ready'));
window.addEventListener('clock:change',()=>{tick(true);wake();});
new ResizeObserver(resize).observe(canvas);resize();tick(true);setInterval(()=>{if(!document.hidden)tick();},100);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(animation);animation=0;}else{lastFrame=0;tick();wake();}});
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
let down=false;canvas.addEventListener('pointerdown',e=>{down=true;canvas.setPointerCapture(e.pointerId);engine.pointer?.('down',point(e));wake();});
canvas.addEventListener('pointermove',e=>{engine.pointer?.(down?'drag':'move',point(e));if(down||id==='ferrofluid')wake();});
canvas.addEventListener('pointerup',e=>{down=false;engine.pointer?.('up',point(e));wake();});canvas.addEventListener('pointerleave',()=>engine.pointer?.('leave',null));
canvas.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();engine.replay?.();wake();}});
