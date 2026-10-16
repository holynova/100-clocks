const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/views/alphabet.html','utf8').split('<script>')[1].split('</script>')[0];
const font=source.slice(source.indexOf('const glyphs='),source.indexOf('function el('));
const geometry=source.slice(source.indexOf('function universalTape('),source.indexOf('const tapes=[]'));
const carousel=source.slice(source.indexOf('const demoWords='),source.indexOf("let mode='live'"));
let now=0;const button={textContent:'',setAttribute(){}};
const context=vm.createContext({assert,performance:{now:()=>now},$:()=>button,updateStatus(){},tick(){}});
vm.runInContext(font+geometry+carousel,context);
const state=vm.runInContext('({glyphs,tapeRows,offsets,demoFrames,demoCharset,demoWords})',context);
assert(source.includes("updateSeconds();setDisplay('demo');startIntro();"),'Entering or refreshing alphabet mode must start the carousel before the opening animation');
assert.equal(state.demoFrames.length,129);assert.equal(new Set(state.demoCharset).size,53);
assert(state.demoWords.every(word=>/^[A-Z]{1,6}$/.test(word)));
const seen=Array.from({length:6},()=>new Set());
for(let i=0;i<state.demoFrames.length;i++){
 now=i*1000;const text=vm.runInContext('demoText()',context);assert.equal(text,state.demoFrames[i].text);assert.equal(text.length,6);
 for(let slot=0;slot<6;slot++){const ch=text[slot];seen[slot].add(ch);assert(Object.hasOwn(state.glyphs,ch));for(let c=0;c<5;c++){const offset=state.offsets[ch][c];assert(offset>=0);assert.equal(state.tapeRows.slice(offset,offset+5),Array.from({length:5},(_,r)=>state.glyphs[ch][r*5+c]).join(''));}}
}
for(const set of seen)assert.equal(set.size,53,'Every supported glyph, including space, must be exercised in every slot');
now=999;assert.equal(vm.runInContext('demoIndex()',context),0);now=1000;assert.equal(vm.runInContext('demoIndex()',context),1);now=129000;assert.equal(vm.runInContext('demoIndex()',context),0,'Wrap exactly after one full cycle');
// Use the real pause handler, preserving the fractional second on resume.
const pause=source.match(/\$\('glyphPause'\)\.onclick=(\(\)=>\{[\s\S]*?\});\n/)[1];vm.runInContext('var pauseCarousel='+pause,context);
now=2450;vm.runInContext('pauseCarousel()',context);const held=vm.runInContext('demoText()',context);now=14000;assert.equal(vm.runInContext('demoText()',context),held);vm.runInContext('pauseCarousel()',context);now=14549;assert.equal(vm.runInContext('demoIndex()',context),2);now=14550;assert.equal(vm.runInContext('demoIndex()',context),3);
// Exhaust every ordered glyph transition against the actual shared fixed masks.
const render=source.slice(source.indexOf('function render('),source.indexOf('function tick('));
const tapes=Array.from({length:6},(_,d)=>({d,columns:Array.from({length:5},(_,c)=>({c,rail:{style:{transition:'active'}},emitter:{style:{}}}))}));
const dom={clockTitle:{},accessibleTime:{},clock:{dataset:{}}};
const transitions=vm.createContext({tapes,cell:14,last:'',displayMode:'text',mode:'live',$:id=>dom[id],requestAnimationFrame(){throw Error('Unexpected instant reset');}});
vm.runInContext(font+geometry+render,transitions);
for(const from of state.demoCharset)for(const to of state.demoCharset){
 vm.runInContext(`render(${JSON.stringify(from.repeat(6))});render(${JSON.stringify(to.repeat(6))});`,transitions);
 for(const tape of tapes)for(const c of tape.columns){const y=Number(c.rail.style.transform.match(/translateY\(([-\d.]+)px\)/)[1]);const offset=(252-y)/14;assert.equal(state.tapeRows.slice(offset,offset+5),Array.from({length:5},(_,r)=>state.glyphs[to][r*5+c.c]).join(''));assert.equal(c.rail.style.transition,'active');assert.equal(c.emitter.style.transform,c.rail.style.transform);}
}
assert(source.includes("displayMode==='demo'?.65"),'Demo transitions finish before next one-second word');
assert(source.includes('demoSuspended=true'));assert(source.includes('demoStart=performance.now()-demoElapsed'));
context.document={hidden:true};vm.runInContext("displayMode='demo'",context);const visibility=source.match(/document.addEventListener\('visibilitychange',(\(\)=>\{[^\n]+\})\);/)[1];vm.runInContext('var changeVisibility='+visibility,context);now=15000;vm.runInContext('changeVisibility()',context);const hiddenFrame=vm.runInContext('demoText()',context);now=99999;assert.equal(vm.runInContext('demoText()',context),hiddenFrame);context.document.hidden=false;vm.runInContext('changeVisibility()',context);now=100548;assert.equal(vm.runInContext('demoIndex()',context),3);now=100549;assert.equal(vm.runInContext('demoIndex()',context),4,'Hidden time must not skip carousel frames');
const stop=source.slice(source.indexOf('function stopCarousel('),source.indexOf("$('clockDisplay').onclick"));let writes=0;const editing={get value(){return 'USER';},set value(v){writes++;}};const editContext=vm.createContext({displayMode:'demo',last:'HELLO ',message:'',demoText:()=> 'WORLD ',$:()=>editing,setDisplay(){}});vm.runInContext(stop+'stopCarousel(false);',editContext);assert.equal(writes,0,'Focusing input must not replace its value or destroy selection');assert.equal(vm.runInContext('message',editContext),'HELLO ','Stop at the displayed word, not the next unpainted frame');
const candidates=fs.readFileSync('tests/fixtures/letter-rail-candidates.jsonl','utf8').trim().split('\n').map(line=>JSON.parse(line));for(const candidate of candidates){assert.equal(candidate.tracks,candidate.groups.length);for(const group of candidate.groups){assert.equal(group.rows,group.tape.length);for(const [i,glyph] of Object.values(state.glyphs).entries())for(let r=0;r<5;r++)for(let c=0;c<group.cols.length;c++){const bit=(parseInt(group.tape[group.offsets[i]+r],36)>>(group.cols.length-1-c))&1;assert.equal(String(bit),glyph[r*5+group.cols[c]-1]);}}}
console.log('PASS: one-second cadence and wrap, all 53 glyphs × six positions, pause/resume fractional timing; all 2,809 ordered glyph transitions on fixed rails; every proposed merged mask decodes all 53 glyphs');
