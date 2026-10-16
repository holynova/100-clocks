const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['public/views/slider-column.html','public/views/slider-whole.html','public/views/slider-dual.html','public/views/alphabet.html']){
 const html=fs.readFileSync(file,'utf8'),source=html.split('<script>')[1].split('</script>')[0];
 const intro=source.slice(source.indexOf('let introActive='),source.indexOf('function updateMotion('));
 const tick=source.slice(source.indexOf('function tick('),source.indexOf('function updateStatus('));
 function scenario(reduced=false){
  const frames=[],timers=[],renders=[],dom={clock:{dataset:{},style:{setProperty(){}}},date:{},accessibleTime:{}};
  const ctx=vm.createContext({Intl,Date,$:id=>dom[id],showSeconds:true,displayMode:'clock',render:(value,instant)=>renders.push({value,instant}),currentDate:()=>new Date('2026-10-08T04:34:56Z'),formatTime:()=> '12:34:56',updateMotion(){},matchMedia:()=>({matches:reduced}),requestAnimationFrame:cb=>frames.push(cb),setTimeout:cb=>{const id=timers.length;timers.push({cb,active:true});return id;},clearTimeout:id=>{timers[id].active=false;}});
  vm.runInContext(intro+tick,ctx);
  const run=code=>vm.runInContext(code,ctx);
  const paint=()=>{while(frames.length)frames.shift()();};
  const next=()=>{const t=timers.find(t=>t.active);if(t){t.active=false;t.cb();}};
  return {run,paint,next,renders,dom,timers};
 }
 const s=scenario();s.run('startIntro();tick();');assert.equal(s.dom.clock.dataset.phase,'zero');assert.deepEqual(s.renders,[{value:'00:00:00',instant:true}]);
 s.paint();s.next();assert.equal(s.dom.clock.dataset.phase,'sliding');assert.equal(s.renders.at(-1).value,'12:34:56');assert.equal(s.renders.at(-1).instant,false);
 const count=s.renders.length;s.run('tick();');assert.equal(s.renders.length,count,'Second ticks must not interrupt intro');
 s.next();assert.equal(s.dom.clock.dataset.phase,'live');s.run('tick();');assert(s.renders.length>count);
 const early=scenario();early.run('startIntro();cancelIntro();tick(true);');early.paint();early.next();assert.equal(early.dom.clock.dataset.phase,'live');assert.equal(early.renders.at(-1).value,'12:34:56');assert.equal(early.timers.length,0,'Cancelled intro must not restart later');
 const sliding=scenario();sliding.run('startIntro();');sliding.paint();sliding.next();sliding.run('cancelIntro();tick(true);');const stopped=sliding.renders.length;sliding.next();assert.equal(sliding.renders.length,stopped,'Cancelled completion must stay cancelled');
 const reduced=scenario(true);reduced.run('startIntro();');assert.deepEqual(reduced.renders,[{value:'12:34:56',instant:true}]);assert.equal(reduced.dom.clock.dataset.phase,'live');assert.equal(reduced.timers.length,0);
 assert(source.includes(file.includes('/alphabet.html')?"updateSeconds();setDisplay('demo');startIntro();":'updateSeconds();startIntro();'),'Opening and reload must initialize intro and default carousel in alphabet mode');
 console.log('PASS:',file,'zero → slide → live, tick gate, cancellation, reduced motion');
}
