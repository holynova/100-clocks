import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {danceEffects,danceAngles,matrixLayout,matrixTargets} from '../public/assets/algorithms.js';

async function runtime(){
 const dom=new JSDOM('<main id="instrument"></main><time id="clock-time"></time>',{url:'https://100-clocks.xiaosang.cc/views/kinetic.html?preview&at=09:41:27',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,frames=new Map(),intervals=[];let time=0,id=0;
 Object.defineProperty(w.performance,'now',{value:()=>time});
 w.requestAnimationFrame=cb=>{frames.set(++id,cb);return id;};w.cancelAnimationFrame=i=>frames.delete(i);
 w.setInterval=(cb,delay)=>{intervals.push({cb,delay});return intervals.length;};
 w.matchMedia=()=>({matches:false});w.ResizeObserver=class{observe(){}};
 w.HTMLCanvasElement.prototype.getContext=()=>({});w.createProfiler=()=>({start(){},frame(){}});
 w.eval(await readFile('public/assets/bridge.js','utf8'));
 const algorithms=(await readFile('public/assets/algorithms.js','utf8')).replaceAll('export ','');
 const native=(await readFile('public/assets/native.js','utf8')).replace(/^import .*?;\n/gm,'');
 w.eval(algorithms+'\n'+native+'\nwindow.matrixState=()=>({dancing,assembling,danceIndex,angles:[...angles],from:[...from],to:[...to]});window.matrixTarget=target;');
 const step=t=>{time=t;const batch=[...frames.values()];frames.clear();for(const cb of batch)cb(t);};
 step(3000);for(const {cb} of intervals)cb();step(3100);
 return {w,step,frames,intervals,canvas:w.document.getElementById('matrix-canvas'),close:()=>dom.window.close()};
}

test('six distinct dances animate in landscape and portrait without allocating a new angle buffer',()=>{
 assert.equal(danceEffects.length,6);
 for(const digits of [4,6])for(const stacked of [false,true]){
  const layout=matrixLayout(digits,stacked),fingerprints=new Set();
  for(let effect=0;effect<danceEffects.length;effect++){
   const out=new Float64Array(layout.cols*layout.rows*2);
   assert.equal(danceAngles(layout,effect,0,out),out);const initial=[...out];
   danceAngles(layout,effect,1100,out);assert([...out].every(Number.isFinite));
   assert.notDeepEqual([...out],initial);fingerprints.add(JSON.stringify([...out]));
  }
  assert.equal(fingerprints.size,6);
 }
});

test('normal time has no automatic choreography or idle frame loop',async()=>{
 const r=await runtime();try{
  assert.deepEqual(r.intervals.map(i=>i.delay),[100]);
  const before=r.w.matrixState().angles;
  for(let t=4000;t<=24000;t+=1000){for(const {cb} of r.intervals)cb();r.step(t);}
  assert.equal(r.w.matrixState().dancing,false);assert.deepEqual(r.w.matrixState().angles,before);
  assert.equal(r.frames.size,0,'Unchanged time must leave the canvas idle');
 }finally{r.close();}
});

test('each click cycles one effect, returns to current time, and never spins unchanged hands',async()=>{
 const r=await runtime();let t=3100;try{
  for(let click=0;click<12;click++){
   r.w.dispatchEvent(new r.w.Event('clock:dance'));
   assert.equal(r.canvas.dataset.effect,danceEffects[click%6].id);
   const initial=r.w.matrixState().angles;t+=800;r.step(t);
   assert.notDeepEqual(r.w.matrixState().angles,initial);assert.equal(r.canvas.dataset.dancePhase,'playing');
   t+=2800;r.step(t);assert.equal(r.w.matrixState().dancing,false);
   const state=r.w.matrixState();assert(state.to.every((a,i)=>Math.abs(a-state.from[i])<=180+1e-7));
   t+=500;r.step(t);
   const expected=matrixTargets('094127').flat();
   for(const [i,a] of r.w.matrixState().angles.entries())assert(Math.abs(((a-expected[i])%360+540)%360-180)<1e-7,`${click} hand ${i}: ${a} vs ${expected[i]}`);
  }
  const prior=r.w.matrixState().angles;r.w.matrixTarget(matrixTargets('094128'));
  const state=r.w.matrixState(),next=matrixTargets('094128').flat();
  for(let i=0;i<next.length;i++){
   assert(Math.abs(state.to[i]-prior[i])<=180+1e-7);
   if(Math.abs(((prior[i]%360)+360)%360-next[i])<1e-7)assert.equal(state.to[i],prior[i]);
  }
 }finally{r.close();}
});

test('assembly and layout changes can interrupt a dance cleanly',async()=>{
 const r=await runtime();try{
  r.w.dispatchEvent(new r.w.Event('clock:dance'));r.step(3900);
  r.w.dispatchEvent(new r.w.Event('clock:assemble'));
  assert.equal(r.w.matrixState().dancing,false);assert.equal(r.w.matrixState().assembling,true);
  r.step(6900);r.w.dispatchEvent(new r.w.Event('clock:dance'));
  r.w.dispatchEvent(new r.w.CustomEvent('clock:option',{detail:{key:'seconds',value:false}}));
  assert.equal(r.w.matrixState().dancing,false);assert.equal(r.w.matrixState().angles.length,480);
 }finally{r.close();}
});
