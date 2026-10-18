import {timeText,timePaths,samplePaths,random} from './math.js?v=3.0.0';
export function createFerrofluid(env){
 const {ctx,W,H}=env,rnd=random(91),field=document.createElement('canvas'),sprite=document.createElement('canvas');field.width=500;field.height=250;sprite.width=sprite.height=64;const f=field.getContext('2d',{willReadFrequently:true}),s=sprite.getContext('2d');
 const gradient=s.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'#ffffffe8');gradient.addColorStop(.45,'#ffffff9c');gradient.addColorStop(1,'#ffffff00');s.fillStyle=gradient;s.fillRect(0,0,64,64);
 const nodes=Array.from({length:340},()=>({x:120+rnd()*760,y:465+rnd()*15,vx:0,vy:0,tx:0,ty:0}));let key='',seconds=false,interactive=true,tone='ink',pointer=null,scatterUntil=0;
 const options=[{key:'seconds',label:'显示秒数',type:'toggle',value:false},{key:'tone',label:'液体颜色',type:'select',value:'ink',choices:[['ink','墨黑'],['ocean','深海']]},{key:'interaction',label:'磁场互动',type:'toggle',value:true},{key:'scatter',label:'扰动磁场',type:'button'}];
 function setTargets(d,force){const next=timeText(d,seconds);if(next===key&&!force)return false;key=next;const points=samplePaths(timePaths(next,{x:105,y:125,width:790,height:seconds?180:205}),8);nodes.forEach((n,i)=>{const p=points[Math.floor(i*points.length/nodes.length)%points.length];n.tx=p[0];n.ty=p[1];if(env.preview||env.reduced){n.x=n.tx;n.y=n.ty;n.vx=n.vy=0;}});return true;}
 function scatter(){scatterUntil=performance.now()+650;for(const n of nodes){n.vx=(rnd()-.5)*450;n.vy=180+rnd()*100;}env.phase('磁场正在重新聚合');env.wake();}
 function render(t,dt){
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#eeece4');bg.addColorStop(1,'#dddccf');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const moving=!env.preview&&!env.reduced,ink=tone==='ink'?[16,23,22]:[17,42,55];f.clearRect(0,0,500,250);f.globalCompositeOperation='lighter';
  for(let i=0;i<nodes.length;i++){const n=nodes[i],j=moving?Math.sin(t*.0014+i*.78)*1.4:0;
   if(moving){const down=t<scatterUntil,tx=down?500+(i/nodes.length-.5)*720:n.tx,ty=down?458:n.ty;const spring=seconds?120:24;let ax=(tx-n.x)*spring,ay=(ty-n.y)*spring;
    if(interactive&&pointer){const dx=n.x-pointer.x,dy=n.y-pointer.y,d=Math.hypot(dx,dy);if(d<95){ax+=dx/(d||1)*(1-d/95)*2100;ay+=dy/(d||1)*(1-d/95)*2100;}}
    const damping=Math.exp(-(seconds?17:6.5)*dt);n.vx=(n.vx+ax*dt)*damping;n.vy=(n.vy+ay*dt)*damping;n.x=Math.max(30,Math.min(W-30,n.x+n.vx*dt));n.y=Math.max(40,Math.min(H-16,n.y+n.vy*dt));
   }
   const size=seconds?14:20;f.drawImage(sprite,(n.x+j)/2-size/2,(n.y+j*.3)/2-size/2,size,size);
  }
  const image=f.getImageData(0,0,500,250),data=image.data;for(let i=0;i<data.length;i+=4){const a=Math.max(0,Math.min(1,(data[i+3]-115)/25));data[i]=ink[0];data[i+1]=ink[1];data[i+2]=ink[2];data[i+3]=Math.round(a*a*(3-2*a)*255);}f.putImageData(image,0,0);ctx.drawImage(field,0,0,W,H);
  ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,474);for(let x=0;x<=W;x+=8)ctx.lineTo(x,475+Math.sin(x*.021+(moving?t*.0005:0))*3+Math.cos(x*.049)*2);ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=`rgb(${ink})`;ctx.fill();
  for(let i=0;i<17;i++){ctx.beginPath();ctx.arc(60+i*57,458+Math.sin(i*4+(moving?t*.0007:0))*4,3+i%4,0,Math.PI*2);ctx.fill();}
  if(t-scatterUntil>1200)env.phase('轻触液面，扰动磁场');return moving;
 }
 return {options,render,update:(d,t,force)=>setTargets(d,force),replay:scatter,pointer(type,p){if(type==='leave'||type==='up')pointer=null;else if(interactive)pointer=p;if(type==='down')env.phase('松开后，液体会重新聚合');},setOption(k,v){if(k==='seconds'){seconds=v;setTargets(env.date(),true);}if(k==='tone')tone=v;if(k==='interaction'){interactive=v;pointer=null;}if(k==='scatter')scatter();}};
}
