import {JSDOM,VirtualConsole} from 'jsdom';import {readFile,writeFile,mkdir} from 'node:fs/promises';import assert from 'node:assert/strict';import {clocks} from '../public/assets/catalog.js';
const native=(await readFile('public/assets/native.js','utf8')).replace(/^import .*?;\n/gm,'');const algorithms=(await readFile('public/assets/algorithms.js','utf8')).replaceAll('export ','');const bridge=await readFile('public/assets/bridge.js','utf8');const reports=[];
for(const c of clocks){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const html=await readFile('public/'+c.href.split('?')[0],'utf8');const dom=new JSDOM(html,{url:'http://localhost:4179/'+c.href+(c.href.includes('?')?'&':'?')+'preview&at=23:59:59',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;
 w.createProfiler=()=>({start(){},frame(){}});w.ResizeObserver=class{observe(){}};w.HTMLCanvasElement.prototype.getContext=()=>({});w.matchMedia=q=>({matches:q.includes('prefers-reduced-motion'),addEventListener(){},removeEventListener(){}});w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 try{
  w.eval(bridge);for(const s of dom.window.document.querySelectorAll('script:not([src])'))if(s.type!=='module')w.eval(s.textContent);
  if(html.includes('../assets/native.js'))w.eval(algorithms+'\n'+native);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await new Promise(r=>setTimeout(r,30));
  assert(!errors.length,`${c.id}: ${errors.join('; ')}`);const time=w.document.getElementById('clock-time')||w.document.getElementById('accessibleTime')||w.document.getElementById('legacy-clock-time');
  if(time&&c.id!=='alphabet'){const t=time.textContent;assert.match(t,/23:59(:59)?/,c.id+' midnight preview must be real virtual time');}
  if(c.id==='kinetic'){assert.equal(w.document.querySelectorAll('canvas').length,1);assert.equal(w.document.querySelectorAll('.hand').length,0);}
  if(c.id==='number-matrix'){assert(w.document.getElementById('num-23').classList.contains('is-hour'));assert(w.document.getElementById('num-59').classList.contains('is-minute'));assert(w.document.getElementById('num-59').classList.contains('is-second'));}
  if(c.id.startsWith('word-')){const initial=c.id==='word-en'?264:66;assert.equal(w.document.querySelectorAll('#grid .cell').length,initial);w.document.getElementById('langEn').click();w.document.getElementById('secToggle').click();assert.equal(w.document.querySelectorAll('#grid .cell').length,264);assert.equal(w.document.getElementById('secWords').textContent,'FIFTY NINE SECONDS');}
  reports.push({id:c.id,status:'pass',test:'DOM execution at 23:59:59, no script errors',time:time?.textContent||w.document.querySelector('#timeText')?.dataset.value});
 }catch(e){reports.push({id:c.id,status:'fail',error:e.message});}finally{w.close();}
}
await mkdir('docs',{recursive:true});await writeFile('docs/dom-check.json',JSON.stringify(reports,null,2)+'\n');for(const r of reports)console.log(r.status.toUpperCase(),r.id,r.error||r.time||'');assert(reports.every(r=>r.status==='pass'));
