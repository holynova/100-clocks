const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('public/views/alphabet.html','utf8'),js=html.split('<script>')[1].split('</script>')[0];
const geometry=js.slice(js.indexOf('const glyphs='),js.indexOf('function el('))+js.slice(js.indexOf('function universalTape('),js.indexOf('const tapes=[]'));
const render=js.slice(js.indexOf('function render('),js.indexOf('function tick('));
const tapes=Array.from({length:6},(_,d)=>({d,columns:Array.from({length:5},(_,c)=>({c,rail:{style:{transform:'translateY(0px)',transition:'preserve'}},emitter:{style:{transform:'translateY(0px)',transition:'preserve'}}}))}));
const elements={clockTitle:{},accessibleTime:{},clock:{dataset:{}}},frames=[];
const ctx=vm.createContext({tapes,cell:14,last:'',displayMode:'text',mode:'live',$:id=>elements[id],requestAnimationFrame:cb=>frames.push(cb)});
vm.runInContext(geometry+render,ctx);
vm.runInContext("render('HELLO!');",ctx);
const first=tapes.flatMap(t=>t.columns.map(c=>c.rail.style.transform));
vm.runInContext("render('WORLD!');",ctx);
const next=tapes.flatMap(t=>t.columns.map(c=>c.rail.style.transform));
assert(first.some((position,i)=>position!==next[i]));
assert.equal(frames.length,0,'Text updates must keep CSS transitions active, never reset/repaint an instant baseline');
for(const tape of tapes)for(const c of tape.columns){assert.equal(c.rail.style.transition,'preserve');assert.equal(c.emitter.style.transform,c.rail.style.transform);}
assert.equal(elements.clock.dataset.time,'WORLD!');
vm.runInContext("render('ABC   ');",ctx);assert.equal(elements.accessibleTime.textContent,'ABC');
assert(js.includes("displayMode==='demo'?.65:displayMode!=='clock'?1.1:"));
console.log('PASS: current → new text uses existing rail objects and active transitions, synchronized glow, rapid updates and space padding');
