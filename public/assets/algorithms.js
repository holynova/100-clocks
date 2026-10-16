export const pad=n=>String(n).padStart(2,'0');
export const formatTime=d=>[d.getHours(),d.getMinutes(),d.getSeconds()].map(pad).join(':');
export const outlineGlyphs=[
'111101101101101111','010010010010010010','111001111100100111','111001111001001111','101101111001001001','111100111001001111','111100111101101111','111001001001001001','111101111101101111','111101111001001111'];
export function contour(pixels,width=3){const edges=new Map(),nodes=new Map();
 const edge=(a,b)=>{const key=[a.join(','),b.join(',')].sort().join('|');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);};
 for(let y=0;y<pixels.length/width;y++)for(let x=0;x<width;x++)if(pixels[y*width+x]==='1'){edge([x,y],[x+1,y]);edge([x+1,y],[x+1,y+1]);edge([x+1,y+1],[x,y+1]);edge([x,y+1],[x,y]);}
 for(const [a,b] of edges.values())for(const [p,q] of [[a,b],[b,a]]){const key=p.join(',');if(!nodes.has(key))nodes.set(key,[]);nodes.get(key).push((Math.atan2(q[0]-p[0],p[1]-q[1])*180/Math.PI+360)%360);}
 return nodes;
}
export function matrixTargets(text,pose=[225,135]){const targets=Array.from({length:216},()=>[...pose]);[...text].forEach((n,i)=>{for(const [key,pair] of contour(outlineGlyphs[Number(n)])){const [x,y]=key.split(',').map(Number);targets[(y+1)*24+x+1+i*6]=pair;}});return targets;}
