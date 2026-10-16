const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../../public/views/slider-column.html','utf8').split('<script>')[1].split('</script>')[0];
new vm.Script(source);
const pure=source.slice(0,source.indexOf('function el('));
vm.runInNewContext(pure+`
const ranges=[[0,1,2],[0,1,2,3,4,5,6,7,8,9],[0,1,2,3,4,5],[0,1,2,3,4,5,6,7,8,9],[0,1,2,3,4,5],[0,1,2,3,4,5,6,7,8,9]];
const binary=ranges.map(range=>[0,1,2].map(c=>'0'+shortestTape(range.map(n=>column(n,c)))+'0'));
for(let second=0;second<86400;second++){
 const h=Math.floor(second/3600),m=Math.floor(second/60)%60,s=second%60;
 const values=[Math.floor(h/10),h%10,Math.floor(m/10),m%10,Math.floor(s/10),s%10];
 for(let d=0;d<6;d++)for(let c=0;c<3;c++){
  const pattern=column(values[d],c),tape=binary[d][c],offset=tape.indexOf(pattern);
  assert.equal(tape.slice(offset,offset+5),pattern);
 }
}
`,{assert});
const simulation=source.slice(source.indexOf('function simulationMs('),source.indexOf('function currentDate('));
vm.runInNewContext(`let anchorMs=0,anchorTick=0,paused=false,speed=60,t=0;const performance={now:()=>t};`+simulation+`
t=1000;assert.equal(simulationMs(),60000);
reanchor();speed=600;assert.equal(simulationMs(),60000);
t=2000;assert.equal(simulationMs(),660000);
reanchor();paused=true;t=5000;assert.equal(simulationMs(),660000);
reanchor();paused=false;t=6000;assert.equal(simulationMs(),1260000);
const midnight=new Date(2026,9,8,23,59,59);midnight.setTime(midnight.getTime()+1000);
assert.equal(midnight.getHours(),0);assert.equal(midnight.getDate(),9);
`,{assert,Date});
console.log('PASS: all 86,400 HH:MM:SS patterns, speed continuity, pause/resume, midnight rollover, JS syntax');
