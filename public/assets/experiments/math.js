export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const timeText=(d,seconds=false)=>[d.getHours(),d.getMinutes(),...(seconds?[d.getSeconds()]:[])].map(n=>String(n).padStart(2,'0')).join(':');
export function random(seed=1){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const arc=(cx,cy,rx,ry,a,b,n=24)=>Array.from({length:n+1},(_,i)=>{const t=(a+(b-a)*i/n)*Math.PI/180;return[cx+Math.cos(t)*rx,cy+Math.sin(t)*ry];});
const glyphs=[
 [arc(.5,.5,.39,.5,-90,270,44)],
 [[[.22,.2],[.51,0],[.51,1]],[[.22,1],[.83,1]]],
 [[...arc(.48,.22,.39,.22,180,360,22),[.84,.36],[.1,.96],[.9,.96]]],
 [[...arc(.36,.25,.49,.25,-90,90,22),...arc(.36,.75,.49,.25,-90,90,22)]],
 [[[.7,1],[.7,0],[.1,.67],[.97,.67]]],
 [[[.9,.03],[.14,.03],[.11,.5],[.55,.43],...arc(.46,.72,.43,.28,-80,165,28)]],
 [[...arc(.51,.54,.4,.46,-70,-270,25),...arc(.5,.73,.4,.27,-180,180,28)]],
 [[[.08,.03],[.94,.03],[.32,1]]],
 [[...arc(.5,.24,.35,.24,90,450,30)], [...arc(.5,.74,.41,.26,-90,270,32)]],
 [[...arc(.5,.27,.4,.27,90,450,30),[.9,.3],[.85,.62],[.64,.9],[.26,1]]]
];
export function timePaths(text,{x=200,y=180,width=600,height=180}={}){
 const units=[...text].map(c=>c===':'?.42:1),gap=.24,total=units.reduce((a,b)=>a+b,0)+gap*(text.length-1),unit=width/total;let offset=x;const paths=[];
 [...text].forEach((c,i)=>{const gw=units[i]*unit;if(c===':'){for(const yy of [.32,.74])paths.push(arc(offset+gw/2,y+height*yy,unit*.035,unit*.035,0,360,12));}else for(const stroke of glyphs[Number(c)])paths.push(stroke.map(([xx,yy])=>[offset+xx*gw,y+yy*height]));offset+=gw+unit*gap;});
 return paths;
}
export function pathMetrics(paths){let total=0;const segments=[];paths.forEach((path,stroke)=>{for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,length,start:total,stroke});total+=length;}});return{segments,total};}
export function pointAlong(metrics,fraction){const distance=clamp(fraction)*metrics.total;const s=metrics.segments.find(s=>s.start+s.length>=distance)||metrics.segments.at(-1);if(!s)return{x:500,y:300,stroke:0};const t=clamp((distance-s.start)/(s.length||1));return{x:s.a[0]+(s.b[0]-s.a[0])*t,y:s.a[1]+(s.b[1]-s.a[1])*t,stroke:s.stroke};}
export function samplePaths(paths,spacing=10){const points=[];for(const path of paths){const m=pathMetrics([path]),n=Math.max(1,Math.ceil(m.total/spacing));for(let i=0;i<=n;i++){const p=pointAlong(m,i/n);points.push([p.x,p.y]);}}return points;}
export function armJoint(base,tip,l1=230,l2=320,side=1){const dx=tip.x-base.x,dy=tip.y-base.y,d=Math.hypot(dx,dy);if(d>l1+l2+1e-8||d<Math.abs(l1-l2)-1e-8)return null;const a=Math.atan2(dy,dx)+side*Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*(d||1)),-1,1));return{x:base.x+Math.cos(a)*l1,y:base.y+Math.sin(a)*l1};}
export function grainTargets(text,seed=1){const points=samplePaths(timePaths(text,{x:120,y:130,width:760,height:205}),3),rnd=random(seed),grains=[];for(const [x,y] of points)for(let i=0;i<4;i++)grains.push({x:x+(rnd()-.5)*15,y:y+(rnd()-.5)*15});return grains;}
export function barrierDark(x,pitch,offset=0,inGlyph=false){const back=((x+(inGlyph?pitch/2:0))%pitch+pitch)%pitch<pitch/2;const front=((x-offset)%pitch+pitch)%pitch<pitch/2;return back||front;}
export function phaseCoverage(pitch,offset,inGlyph){let sum=0;for(let i=0;i<1000;i++)sum+=barrierDark(i*pitch/1000,pitch,offset,inGlyph)?1:0;return sum/1000;}
