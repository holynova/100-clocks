import {timeText,grainTargets,random} from './math.js?v=3.0.0';
export function createSand(env){
 const {ctx}=env,rnd=random(131),floor=Array.from({length:550},()=>({x:40+rnd()*920,y:530+rnd()*24}));let key='',particles=[],old=[],start=0,seconds=false,tone='gold',gravity=1;
 const palettes={gold:['#dbb46f','#f4d9a2','#9e7b44'],rose:['#dfa89d','#f7d4c7','#aa746b'],silver:['#bccad0','#e6eff0','#768c95']};
 const options=[{key:'seconds',label:'显示秒',type:'toggle',value:false},{key:'tone',label:'沙粒颜色',type:'select',value:tone,choices:[['gold','金沙'],['rose','玫瑰'],['silver','银砂']]},{key:'gravity',label:'落沙速度',type:'select',value:'1',choices:[['0.6','缓慢'],['1','自然'],['1.8','轻快']]},{key:'collapse',label:'坍塌重组',type:'button'}];
 function assemble(d,t){old=particles.map(p=>({...p,vx:(rnd()-.5)*100,vy:20+rnd()*100}));start=t;const targets=grainTargets(timeText(d,seconds),79),count=Math.min(3000,targets.length);particles=Array.from({length:count},(_,i)=>targets[Math.floor(i*targets.length/count)]).map((p,i)=>({tx:p.x,ty:p.y,x:p.x+(rnd()-.5)*60,y:-20-rnd()*180,vx:0,vy:0,delay:seconds?rnd()*100:rnd()*600,shade:i%3,settled:false}));if(env.preview||env.reduced){for(const p of particles){p.x=p.tx;p.y=p.ty;p.settled=true;}old=[];}env.phase('沙粒正在沉积');}
 function replay(){assemble(env.date(),performance.now());env.wake();}
 return{options,replay,update(d,t,force){const text=timeText(d,seconds);if(text!==key||force){key=text;assemble(d,t);return true;}return false;},setOption(k,v){if(k==='tone')tone=v;if(k==='gravity')gravity=Number(v);if(k==='seconds'){seconds=v;key='';}if(k==='collapse')replay();},pointer(type){if(type==='down')replay();},render(t,dt){
 ctx.fillStyle='#101c24';ctx.fillRect(0,0,1000,580);const colors=palettes[tone];ctx.strokeStyle='#38505a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(35,518);ctx.lineTo(965,518);ctx.stroke();for(const p of floor){ctx.fillStyle=colors[2];ctx.fillRect(p.x,p.y,1.5,1.5);}
 const g=seconds?3600:900*gravity;let active=false;for(const p of particles){if(!p.settled){active=true;if(t-start>=p.delay){p.vy+=g*dt;p.y+=p.vy*dt;p.x+=(p.tx-p.x)*Math.min(1,dt*9);if(p.y>=p.ty){p.y=p.ty;p.x=p.tx;p.settled=true;}}}ctx.fillStyle=colors[p.shade];ctx.fillRect(p.x,p.y,2.5,2.5);}
 if(old.length){active=true;for(const p of old){p.vy+=1200*dt;p.y+=p.vy*dt;p.x+=p.vx*dt;ctx.fillStyle=colors[p.shade];if(p.y<518)ctx.fillRect(p.x,p.y,2.5,2.5);}if(t-start>1800)old=[];}
 ctx.fillStyle='#70858c';ctx.font='11px monospace';ctx.textAlign='center';ctx.fillText('T I M E   S E T T L E S',500,440);if(!active)env.phase('轻触沙盘，坍塌重组');return active;
 }};
}
