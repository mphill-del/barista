const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),c={window:null};c.window=c;vm.createContext(c);
['compat','storage','brewing'].forEach(n=>vm.runInContext(fs.readFileSync(path.join(root,'js',n+'.js'),'utf8'),c));
const data=JSON.parse(fs.readFileSync(path.join(root,'data/recipes.json'),'utf8'));
c.validateRecipes(data);
const r=Object.assign({},data.tea.find(x=>x.id==='rishi-earl-grey-supreme'),{type:'tea'});
const before=c.teaSession(c.teaMethod(r,'glass'),350);
r.infusionGuidance='Try two total infusions.';
assert.equal(c.teaInfusionGuidance(r),'Try two total infusions.');
assert.deepEqual(c.teaSession(c.teaMethod(r,'glass'),350),before);
assert.match(c.teaInfusionGuidance({type:'tea',subcategory:'White tea',vessel:'gaiwan',steeps:[30]}),/5-8/);
assert.match(c.teaInfusionGuidance({type:'tea',subcategory:'White tea',vessel:'glass',steeps:[240]}),/2-3/);
assert.match(c.teaInfusionGuidance({type:'tea',subcategory:'Matcha',steeps:[]}),/not re-steeped/);
assert.match(c.teaInfusionGuidance({type:'tea',subcategory:'Other',steeps:[60]}),/not specified/);
const bad=JSON.parse(JSON.stringify(data));bad.tea[0].infusionGuidance={count:2};assert.throws(()=>c.validateRecipes(bad));
for(const file of ['2026-10-04.json','2026-10-04-tim-wendelboe.json']){
 const patch=JSON.parse(fs.readFileSync(path.join(root,'catalog-drafts',file),'utf8'));
 ['tea','coffee','drinks'].forEach(type=>patch.recipes[type].forEach(r=>{assert(['robust','delicate','matcha-water'].includes(r.waterProfile));if(type==='tea')assert.equal(typeof r.infusionGuidance,'string');}));
}
console.log('PASS: editable infusion guidance, legacy fallbacks, vessel-specific estimates, unchanged session planning, guidance validation and water assignments.');
