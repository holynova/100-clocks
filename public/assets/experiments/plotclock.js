import {clamp,timeText,timePaths,pathMetrics,armJoint} from './math.js?v=3.0.0';
import {strokePaths,partialPaths,roundBox,disc,screw} from './draw.js?v=3.0.0';
export function createPlotClock(env){
 const {ctx,W,H}=env,ink=document.createElement('canvas');ink.width=W;ink.height=H;const penCtx=ink.getContext('2d');
 const colors={green:'#244e3d',blue:'#294a78',graphite:'#323b3c'};let color='green',showArms=true,displayed='',wanted='',busy=false,start=0,duration=8500,metrics,stage='',lastErase=null,tip={x:500,y:420},penDown=false;
 const pathsFor=text=>timePaths(text,{x:250,y:175,width:500,height:160});
 const options=[{key:'ink',label:'笔墨颜色',type:'select',value:'green',choices:[['green','墨绿'],['blue','靛蓝'],['graphite','石墨']]},{key:'arms',label:'显示机械臂',type:'toggle',value:true},{key:'rewrite',label:'重新书写',type:'button'}];
 function begin(d,now,force=false){
  if(busy&&!force)return false;const current=timeText(d);if(!force&&displayed===current)return false;
  duration=Math.min(8500,Math.max(900,48000/Math.max(1,env.rate())));wanted=current;metrics=pathMetrics(pathsFor(wanted));
  if(env.preview||env.reduced){displayed=current;wanted=current;penCtx.clearRect(0,0,W,H);strokePaths(penCtx,pathsFor(current),colors[color],5.5);busy=false;tip={x:500,y:420};env.phase('轻触面板，重新书写');return true;}
  start=now;busy=true;lastErase=null;stage='';return true;
 }
 function robot(p,erasing){
  for(const [base,side] of [[{x:350,y:560},-1],[{x:650,y:560},1]]){
   roundBox(ctx,base.x-49,base.y-26,98,72,12,'#46594e','#304539');
   const j=armJoint(base,p,320,320,side);if(!j)continue;
   for(const [c,w] of [['#283d3333',23],['#556b5a',17],['#b4c1b3',12],['#e4e9dc',2]])strokePaths(ctx,[[[base.x,base.y],[j.x,j.y],[p.x,p.y]]],c,w);
   for(const q of [base,j]){disc(ctx,q.x,q.y,13,'#54685b','#2e4436');disc(ctx,q.x,q.y,7,'#b9c5b8','#e3eadc');disc(ctx,q.x,q.y,2.5,'#536653');}
  }
  if(erasing){roundBox(ctx,p.x-32,p.y-13,64,26,6,'#435c4c','#1c3d2a');roundBox(ctx,p.x-29,p.y+6,58,9,3,'#a8b8a5');}
  else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.18);roundBox(ctx,-8,-45,16,44,5,'#f3f1de','#789080');roundBox(ctx,-8,-40,16,9,2,colors[color]);ctx.beginPath();ctx.moveTo(-4,-1);ctx.lineTo(4,-1);ctx.lineTo(0,penDown?6:2);ctx.closePath();ctx.fillStyle=colors[color];ctx.fill();ctx.restore();}
 }
 function render(t){
  ctx.fillStyle='#e7ebe3';ctx.fillRect(0,0,W,H);
  roundBox(ctx,133,66,734,402,23,'#b0bcae');roundBox(ctx,140,69,720,392,18,'#fafbf5','#9aa991');roundBox(ctx,151,81,698,368,12,'#f9faf4','#dce2d3');
  ctx.fillStyle='#74856e';ctx.font='11px monospace';ctx.fillText('P L O T   /   0 8',170,113);ctx.fillText('A MOMENT, WRITTEN.',655,421);
  for(const x of [147,853])for(const y of [77,451])screw(ctx,x,y);
  let erasing=false;penDown=false;
  if(busy){const p=clamp((t-start)/duration);
   if(p<.23){erasing=true;const q=p/.23*6,row=Math.min(5,Math.floor(q)),f=q-row;tip={x:row%2?780-f*560:220+f*560,y:155+row*38};if(stage!=='erase'){stage='erase';env.phase('擦去旧的时刻');}penCtx.save();penCtx.globalCompositeOperation='destination-out';strokePaths(penCtx,[[lastErase?[lastErase.x,lastErase.y]:[tip.x,tip.y],[tip.x,tip.y]]],'#000',48);penCtx.restore();lastErase={...tip};}
   else if(p<.28){if(stage!=='travel'){penCtx.clearRect(0,0,W,H);stage='travel';}const f=(p-.23)/.05,a=metrics.segments[0].a;tip={x:220+(a[0]-220)*f,y:345+(a[1]-345)*f};}
   else if(p<.93){stage='write';penDown=true;env.phase('正在写下 '+wanted);penCtx.clearRect(0,0,W,H);tip=partialPaths(penCtx,metrics,(p-.28)/.65,colors[color],5.5);}
   else{if(stage!=='park'){penCtx.clearRect(0,0,W,H);strokePaths(penCtx,pathsFor(wanted),colors[color],5.5);stage='park';}const a=metrics.segments.at(-1).b,f=(p-.93)/.07;tip={x:a[0]+(500-a[0])*f,y:a[1]+(420-a[1])*f};}
   if(p===1){busy=false;displayed=wanted;tip={x:500,y:420};env.phase('轻触面板，重新书写');}
  }
  ctx.drawImage(ink,0,0);if(showArms)robot(tip,erasing);else if(busy)disc(ctx,tip.x,tip.y,6,colors[color]);
  return busy;
 }
 function replay(){begin(env.date(),performance.now(),true);env.wake();}
 return {options,render,update:(d,t,force)=>begin(d,t,force),replay,pointer(type){if(type==='down')replay();},setOption(key,value){if(key==='ink'){color=value;penCtx.clearRect(0,0,W,H);if(!busy&&displayed)strokePaths(penCtx,pathsFor(displayed),colors[color],5.5);}if(key==='arms')showArms=value;if(key==='rewrite')replay();}};
}
