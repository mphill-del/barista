const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
// Node ships Acorn. Run it in ES2017 mode without adding a production dependency.
let parse;
try{parse=require('internal/deps/acorn/acorn/dist/acorn').parse}catch(error){
 require('node:child_process').execFileSync(process.execPath,['--expose-internals',__filename],{stdio:'inherit'});process.exit(0);
}
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const guard=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const files=fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f).concat('service-worker.js');
const forbidden=/\?\.|\?\?|\|\|=|&&=|\bstructuredClone\s*\(|\.at\s*\(|\.replaceAll\s*\(|\bObject\.fromEntries\s*\(|\.randomUUID\s*\(|\.flatMap\s*\(|\.flat\s*\(|\.padStart\s*\(|\bcatch\s*\{/;
for(const file of files){const source=fs.readFileSync(path.join(root,file),'utf8');assert(!forbidden.test(source),'Unsupported syntax/API: '+file);parse(source,{ecmaVersion:file==='js/compat.js'?5:2017,sourceType:'script'});}
parse(guard,{ecmaVersion:5});
// Exercise startup without relying on a modern browser's parser or APIs.
function startup(){
 const nodes={},pending=[],listeners={},timeouts=[];
 for(const id of ['app','startup-error','startup-browser','startup-message','startup-file'])nodes[id]={style:{},textContent:''};
 const context={window:null,navigator:{userAgent:'Simulated older tablet'},document:{getElementById:id=>nodes[id],createElement:()=>({}),body:{appendChild:s=>pending.push(s)}},setTimeout:fn=>{timeouts.push(fn);return timeouts.length},clearTimeout:()=>{}};
 context.window=context;context.addEventListener=(event,fn)=>{(listeners[event]||(listeners[event]=[])).push(fn)};vm.createContext(context);vm.runInContext(guard,context);
 return {context,nodes,pending,listeners,timeouts};
}
const dependencies=['js/compat.js','js/legacy-data.js','js/brewing.js','js/storage.js','js/timer.js','js/bootstrap.js','js/app.js','js/updates.js'];
for(const file of dependencies){const t=startup();t.context.BaristaStartup.load(file,()=>{});t.pending[t.pending.length-1].onerror();assert.equal(t.nodes['startup-error'].style.display,'block');assert.equal(t.nodes['startup-file'].textContent,file);assert.equal(t.nodes.app.style.display,'none');assert.equal(t.nodes['startup-browser'].textContent,'Simulated older tablet');}
for(const message of ['Unexpected token .','Runtime failure']){const t=startup();t.context.onerror(message,'js/brewing.js',7,3);assert(t.nodes['startup-message'].textContent.includes(message));assert(t.nodes['startup-file'].textContent.includes('js/brewing.js'));}
{const t=startup();t.listeners.unhandledrejection[0]({reason:Error('Rejected startup')});assert.equal(t.nodes['startup-message'].textContent,'Rejected startup');}
for(const file of ['js/timer.js','data/recipes.json']){const t=startup();t.context.BaristaStartup.file=file;t.timeouts[0]();assert.equal(t.nodes['startup-file'].textContent,file);assert(t.nodes['startup-message'].textContent.includes('30 seconds'));let continued=false;t.context.BaristaStartup.load('later.js',()=>continued=true);assert.equal(t.pending.length,1);assert(!continued);}
{const t=startup();t.context.BaristaStartup.done();t.timeouts[0]();assert(!t.context.BaristaStartup.failed);}
{const t=startup();t.context.checkCompatibility=()=>{throw Error('Missing Promise')};t.pending[0].onload();assert.equal(t.nodes['startup-message'].textContent,'Missing Promise');assert.equal(t.pending.length,1);}
// JSON helpers, merging and brewing with modern conveniences explicitly absent.
const c={window:null,console,localStorage:{getItem:()=>null,setItem:()=>{}},setInterval:()=>{}};c.window=c;vm.createContext(c);
vm.runInContext('Array.prototype.at=undefined; Array.prototype.flatMap=undefined; String.prototype.replaceAll=undefined; Object.fromEntries=undefined;',c);
for(const file of ['compat','storage','brewing','timer'])vm.runInContext(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'),c);
const seed=JSON.parse(fs.readFileSync(path.join(root,'data/recipes.json'),'utf8'));c.validateRecipes(seed);assert.equal(JSON.stringify(c.cloneJSON(seed)),JSON.stringify(seed));assert.equal(c.mergePublished(seed,seed,seed).tea.length,18);
const r=c.teaMethod(Object.assign({},seed.tea.find(r=>r.id==='ys-silver-needle'),{type:'tea'}),'gaiwan');assert.equal(c.teaSession(r,500).steps[4].cumulative,500);assert.equal(c.padTwo(5),'05');assert.notEqual(c.newRecipeId(),c.newRecipeId());c.BrewTimer.unlock();
// FileReader path works without Blob.text, including read failures.
c.FileReader=function(){this.readAsText=function(){this.result='{"tea":[]}';this.onload()}};
(async()=>{assert.equal(await c.readTextFile({}),'{"tea":[]}');c.FileReader=function(){this.readAsText=function(){this.onerror()}};await assert.rejects(c.readTextFile({}));console.log('PASS: every production script parses as ES2017 (startup and helpers as ES5); banned-feature scan; all dependency failures, parse/runtime errors, rejected promises, watchdog and late-response guard; legacy runtime helpers, recipe merge, brewing, optional audio and FileReader.');})().catch(error=>{console.error(error);process.exitCode=1});
