const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=fs.readFileSync(__dirname+'/../../public/views/slider-column.html','utf8');
const original=fs.readFileSync(__dirname+'/../fixtures/slider-column-original.html','utf8');
const script=html=>html.split('<script>')[1].split('</script>')[0];
const patterns=js=>js.slice(js.indexOf('const digits='),js.indexOf('function el('));
assert.equal(patterns(script(root)),patterns(script(original)),'Original column digit patterns must remain unchanged');
const html=fs.readFileSync(__dirname+'/../../public/views/slider-whole.html','utf8'),js=script(html);
new vm.Script(js);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(new Set(ids).size,ids.length,'DOM IDs must be unique');
assert(js.includes('width:21,height:21'),'Grid cells must be square');
assert(js.includes("'fill-rule':'evenodd'"),'Grid openings must be transparent');
assert(!js.includes("t.plate.style.transform"),'Orange backing must remain stationary');
assert(!html.includes('railArea'),'Moving rails must never be clipped');
assert(js.includes('const rows=sharedRows'),'Every digit must use the same mask');
assert(!js.includes('const range=d==='),'No digit-specific mask layouts');
assert(!js.includes('data-column'),'No individually moving columns');
assert(js.includes('t.rows.indexOf(digitRows(numbers[t.d]))'));
const pure=js.slice(0,js.indexOf('function el('));
vm.runInNewContext(pure+`
const ranges=[[0,1,2],[0,1,2,3,4,5,6,7,8,9],[0,1,2,3,4,5],[0,1,2,3,4,5,6,7,8,9],[0,1,2,3,4,5],[0,1,2,3,4,5,6,7,8,9]];
for(const digit of digits)for(let i=0;i<15;i++)if(digit[i]==='1')assert.equal(digits[8][i],'1','All digits must fit the fixed 8-shaped backing');
const sharedRows='0'+shortestTape(digits.map((_,n)=>digitRows(n)))+'0';
const tapes=ranges.map(()=>sharedRows);
const offsets=digits.map((_,n)=>sharedRows.indexOf(digitRows(n)));
const top=252-Math.max(...offsets)*23-2-28;
const bottom=252-Math.min(...offsets)*23+sharedRows.length*23+2+28;
for(const offset of offsets){const y=252-offset*23;assert(y-2>top);assert(y+sharedRows.length*23+2<bottom);}
assert.equal(new Set(tapes).size,1);
for(let second=0;second<86400;second++){
 const h=Math.floor(second/3600),m=Math.floor(second/60)%60,s=second%60;
 const values=[Math.floor(h/10),h%10,Math.floor(m/10),m%10,Math.floor(s/10),s%10];
 for(let d=0;d<6;d++){
  const rows=digitRows(values[d]),offset=tapes[d].indexOf(rows);
  assert(offset>=0);assert.equal(tapes[d].slice(offset,offset+5),rows);
  for(let r=0;r<5;r++)for(let c=0;c<3;c++)assert.equal(String((Number(tapes[d][offset+r])>>(2-c))&1),digits[values[d]][r*3+c]);
 }
}
`,{assert});
console.log('PASS: 86,400 whole-digit readings, all three columns share one position; identical masks, complete bounds at every position; original column mask geometry preserved');
