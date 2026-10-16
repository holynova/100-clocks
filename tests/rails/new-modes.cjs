const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=html=>html.split('<script>')[1].split('</script>')[0];
const hardware=fs.readFileSync('public/views/slider-dual.html','utf8'),hs=script(hardware);
const model=vm.runInNewContext(hs.slice(hs.indexOf('const digits='),hs.indexOf('const railTop='))+';({digits,hardwareRows,positionLeft,positionRight,cell})');
// Independent samples from author STL projected in installed orientation.
assert.equal(model.hardwareRows.left,'010111110000010');
assert.equal(model.hardwareRows.right.join(''),'101111110111111101110111011110');
assert.deepEqual(Array.from(model.positionLeft),[5,0,7,9,3,11,5,1,5,11]);
assert.deepEqual(Array.from(model.positionRight),[6,0,11,7,4,9,9,2,1,1]);
function readDigit(n){let result='';for(let r=0;r<5;r++)for(let c=0;c<3;c++){
 const side=c===0?'left':'right',positions=c===0?model.positionLeft:model.positionRight;
 const index=8-positions[n]+r,rows=model.hardwareRows[side];
 let bit=index<0||index>=15?'1':c===0?rows[index]:rows[index][c-1];
 if(c===1&&(r===1||r===3))bit='0';result+=bit;
 }return result;}
for(let n=0;n<10;n++)assert.equal(readDigit(n),model.digits[n],`Author's mask must actually display ${n}`);
for(let s=0;s<86400;s++)for(const n of String(Math.floor(s/3600)).padStart(2,'0')+String(Math.floor(s/60)%60).padStart(2,'0')+String(s%60).padStart(2,'0'))assert.equal(readDigit(Number(n)),model.digits[Number(n)]);
const top=252-8*model.cell-2-28,bottom=252+3*model.cell+15*model.cell+2+28;
for(const positions of [model.positionLeft,model.positionRight])for(const position of positions){const y=252-(8-position)*model.cell;assert(y-2>top);assert(y+15*model.cell+2<bottom);}
assert(!hs.includes('t.plate.style.transform'));assert(hs.includes("'data-fixed-grid':d"));assert(hs.includes('252-cell,252+5*cell'));assert(hs.includes("['right',2"));
const matrix=fs.readFileSync('public/views/alphabet.html','utf8'),ms=script(matrix);
const font=vm.runInNewContext(ms.slice(ms.indexOf('const glyphs='),ms.indexOf('function el('))+';({glyphs,demoCharacters,normalizeText})');
for(const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.,!?-+=/%<>*#() '){assert(Object.hasOwn(font.glyphs,c));assert.match(font.glyphs[c],/^[01]{25}$/);}
assert.equal(new Set(Object.values(font.glyphs)).size,Object.keys(font.glyphs).length,'All supported glyphs must be distinct');
assert.equal(font.normalizeText('hello!'),'HELLO!');assert.equal(font.normalizeText('a +'),'A +   ');
for(const text of ['', 'ABCDEFG','中文','HI🙂','ß'])assert.equal(font.normalizeText(text),null,`Reject unsupported input ${text}`);
assert.equal(font.normalizeText('0:-+!?'),'0:-+!?');
assert(!ms.includes('data-cell'));assert(ms.includes('column.rail.style.transform'));assert(ms.includes('const tapeRows=universalTape()'));assert(ms.includes("'data-rows':tapeRows"));assert(!ms.includes('t.plate.style.transform'));
// No missing demo glyphs, including the final partial page; spaces pad it safely.
for(let offset=0;offset<font.demoCharacters.length;offset+=6)for(const c of font.demoCharacters.slice(offset,offset+6).padEnd(6,' '))assert(Object.hasOwn(font.glyphs,c));
for(const html of [hardware,matrix,fs.readFileSync('public/views/slider-column.html','utf8'),fs.readFileSync('public/views/slider-whole.html','utf8')]){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 assert.equal([...html.match(/<nav class="versions"[\s\S]*?<\/nav>/)[0].matchAll(/aria-current="page"/g)].length,1);for(const href of ['../?clock=slider-column','../?clock=slider-whole','../?clock=slider-dual','../?clock=alphabet'])assert(html.includes(`href="${href}"`));assert(html.includes('id="seconds" type="checkbox" role="switch" checked'));
}
const universal=vm.runInNewContext(ms.slice(ms.indexOf('const glyphs='),ms.indexOf('function el('))+ms.slice(ms.indexOf('function universalTape('),ms.indexOf('const tapes=[]'))+';({tapeRows,offsets,columnPattern})');
assert.equal(universal.tapeRows.length,38,'All 32 binary five-row patterns fit one short fixed mask');
for(const [ch,glyph] of Object.entries(font.glyphs))for(let c=0;c<5;c++){const offset=universal.offsets[ch][c];assert(offset>=0);assert.equal(universal.tapeRows.slice(offset,offset+5),Array.from({length:5},(_,r)=>glyph[r*5+c]).join(''));}
const all=Object.values(universal.offsets).flat(),min=Math.min(...all),max=Math.max(...all),cell=14,viewTop=252-max*cell-26,viewBottom=viewTop+(max-min+38)*cell+52;
for(const offset of all){const y=252-offset*cell;assert(y-1>viewTop);assert(y+38*cell+1<viewBottom);}
assert(matrix.indexOf('id="letterForm"')<matrix.indexOf('</section>'),'Input belongs below the clock in the stage');assert(ms.includes("$('letterForm').addEventListener('submit'"));
console.log('PASS: author STL mask rows and Arduino offsets, 86,400 dual-rail readings, full rail bounds; 53 distinct 5×5 glyphs on identical fixed 38-row tapes, full rail bounds, input handling, complete demo, four preserved routes');
