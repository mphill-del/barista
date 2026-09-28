const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),code=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const c={window:null,structuredClone};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'js/compat.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(root,'js/storage.js'),'utf8'),c);
const seed=JSON.parse(fs.readFileSync(path.join(root,'data/recipes.json'),'utf8'));
let local=structuredClone(seed),next=structuredClone(seed);
local.tea[0].notes='Tablet change';local.tea.splice(1,1);next.tea[0].notes='Published conflict';next.coffee[0].notes='Published update';next.water.pop();next.drinks.push({...next.drinks[0],id:'new-drink'});
let merged=c.mergePublished(local,seed,next);
assert.equal(merged.tea[0].notes,'Tablet change');assert(!merged.tea.some(r=>r.id===seed.tea[1].id));assert.equal(merged.coffee[0].notes,'Published update');assert.equal(merged.water.length,4);assert(merged.drinks.some(r=>r.id==='new-drink'));c.validateRecipes(merged);
assert.equal(JSON.stringify(c.mergePublished(merged,next,next)),JSON.stringify(merged));
(async()=>{
for(const base of ['https://example.test/','https://example.test/barista/']){
 const maps=new Map(),events={},prefix='barista:'+base+':';let offline=false,claimed=false,skipped=false;
 const caches={keys:async()=>[...maps.keys()],delete:async key=>maps.delete(key),open:async key=>{if(!maps.has(key))maps.set(key,new Map());let m=maps.get(key);return {addAll:async requests=>{const items=await Promise.all(requests.map(async r=>{assert.equal(r.cache,'reload');const rel=new URL(r.url).pathname.slice(new URL(base).pathname.length)||'index.html';return [r.url,fs.readFileSync(path.join(root,rel))]}));items.forEach(([u,b])=>m.set(u,b))},match:async(req,opts)=>{let u=new URL(req.url||req);if(opts?.ignoreSearch)u.search='';return m.get(u.href)}}}};
 maps.set(prefix+'old',new Map());maps.set('barista:https://other.test/:old',new Map());
 const context={URL,Request,caches,fetch:async()=>{if(offline)throw Error('Offline');return 'network'},self:{registration:{scope:base},clients:{claim:async()=>{claimed=true}},skipWaiting:()=>{skipped=true},addEventListener:(n,fn)=>events[n]=fn}};
 vm.runInNewContext(code,context);
 async function lifecycle(name){let p;events[name]({waitUntil:v=>p=v});await p}
 await lifecycle('install');assert(!skipped);await lifecycle('activate');assert(claimed);assert(!maps.has(prefix+'old'));assert(maps.has('barista:https://other.test/:old'));
 offline=true;
 for(const rel of ['index.html','data/recipes.json','js/bootstrap.js','js/app.js','js/updates.js','manifest.json']){let p;events.fetch({request:{method:'GET',url:base+rel,mode:'cors'},respondWith:v=>p=v});assert((await p).length>0)}
 let p;events.fetch({request:{method:'GET',url:base+'?home',mode:'navigate'},respondWith:v=>p=v});assert((await p).toString().includes('BaristaStartup'));
 events.message({data:{type:'SKIP_WAITING'}});assert(skipped);
 context.caches.open=async()=>({addAll:async()=>{throw Error('Missing asset')}});await assert.rejects(lifecycle('install'));
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(!/(?:src|href)="\//.test(html));const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');for(const icon of manifest.icons)assert(fs.existsSync(path.join(root,icon.src)));
console.log('PASS: published update merge, local conflicts/deletions, new/removed recipes, idempotence; root and subfolder offline caches; scoped cache cleanup; update activation; failed install; relative paths and manifest.');
})().catch(e=>{console.error(e);process.exitCode=1});
