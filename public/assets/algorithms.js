export const pad=n=>String(n).padStart(2,'0');
export const formatTime=d=>[d.getHours(),d.getMinutes(),d.getSeconds()].map(pad).join(':');
export const outlineGlyphs=[
'111101101101101101111','010010010010010010010','111001001111100100111','111001001111001001111','101101101111001001001','111100100111001001111','111100100111101101111','111001001001001001001','111101101111101101111','111101101111001001111'];
export function matrixLayout(digits=4,stacked=false){return {cols:stacked?12:digits*6,rows:stacked?digits/2*10:10,stacked};}
export function contour(pixels,width=3){const edges=new Map(),nodes=new Map();
 const edge=(a,b)=>{const key=[a.join(','),b.join(',')].sort().join('|');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);};
 for(let y=0;y<pixels.length/width;y++)for(let x=0;x<width;x++)if(pixels[y*width+x]==='1'){edge([x,y],[x+1,y]);edge([x+1,y],[x+1,y+1]);edge([x+1,y+1],[x,y+1]);edge([x,y+1],[x,y]);}
 for(const [a,b] of edges.values())for(const [p,q] of [[a,b],[b,a]]){const key=p.join(',');if(!nodes.has(key))nodes.set(key,[]);nodes.get(key).push((Math.atan2(q[0]-p[0],p[1]-q[1])*180/Math.PI+360)%360);}
 return nodes;
}
export function matrixTargets(text,pose=[225,135],layout=matrixLayout(text.length)) {const {cols,rows,stacked}=layout;const targets=Array.from({length:cols*rows},()=>[...pose]);[...text].forEach((n,i)=>{for(const [key,pair] of contour(outlineGlyphs[Number(n)])){const [x,y]=key.split(',').map(Number);const left=1+(stacked?i%2:i)*6,top=1+(stacked?Math.floor(i/2)*10:0);targets[(y+top)*cols+x+left]=pair;}});return targets;}

export const danceEffects=[
 {id:'spiral',name:'星旋'}, {id:'wave',name:'波浪'}, {id:'ripple',name:'涟漪'},
 {id:'pinwheel',name:'风车'}, {id:'checker',name:'棋盘'}, {id:'fan',name:'扇面'}
];
export const angleDelta=(from,to)=>{const d=((to-from)%360+540)%360-180;return Math.abs(d)<1e-7?0:d;};
// Continuous, unwrapped angles prevent seams as a pattern rotates through 360°.
export function danceAngles({cols,rows},effect,elapsed,out=new Float64Array(cols*rows*2)){
 const t=elapsed/1000;
 for(let i=0;i<cols*rows;i++){
  const col=i%cols,row=Math.floor(i/cols),x=col-(cols-1)/2,y=row-(rows-1)/2;
  const r=Math.hypot(x,y),radial=Math.atan2(y,x)*180/Math.PI+90;let a,b;
  switch(effect){
   case 0:a=radial+t*150;b=a+105+30*Math.sin(r*.65-t*3);break;
   case 1:a=70*Math.sin(x*.55+y*.25-t*3.2);b=a+180;break;
   case 2:{const spread=75*Math.sin(r*.9-t*4);a=radial+spread;b=radial-spread;break;}
   case 3:a=Math.floor((Math.atan2(y,x)+Math.PI)/(Math.PI/2))*90+t*210+20*Math.sin(r*.5);b=a+90;break;
   case 4:a=t*240*((Math.floor(col/2)+Math.floor(row/2))%2?-1:1);b=a+90;break;
   default:a=180+90*Math.sin(t*2+x*.15)+y*3;b=360-a+30*Math.sin(t*3);
  }
  out[i*2]=a;out[i*2+1]=b;
 }
 return out;
}
