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
const methodRecipe=Object.assign({},data.tea.find(x=>x.id==='hibiki-genmaicha-matcha'),{type:'tea',infusionGuidance:'Legacy shared override'});
const glass=c.teaMethod(methodRecipe,'glass'),kyusu=c.teaMethod(methodRecipe,'kyusu');
assert.equal(c.teaSession(glass,500).dose,8);
assert.equal(c.teaSession(glass,250).dose,4);
assert.equal(c.teaSession(glass,500).steps[0].seconds,120);
assert.equal(c.teaSession(glass,250).steps[0].seconds,120);
assert.equal(c.teaSession(kyusu,500).dose,9.375);
assert.equal(c.teaSession(kyusu,500).count,2);
assert.equal(c.teaSession(kyusu,500).steps[1].cumulative,500);
assert.match(c.teaInfusionGuidance(glass),/1-2/);
assert.match(c.teaInfusionGuidance(kyusu),/2-3/);
assert.doesNotMatch(c.teaInfusionGuidance(glass),/Legacy/);
assert.equal(c.teaSession(Object.assign({},kyusu,{infusionsMax:1}),500).beyondTypical,true);
assert.equal(c.teaSession(kyusu,500).beyondTypical,false);
const expected={'hibiki-genmaicha':[8,80,120],'hibiki-genmaicha-matcha':[8,80,120],'hibiki-houjicha':[8,100,60],'hibiki-houjicha-karigane':[8,100,60],'hibiki-sencha':[8,75,120],'hibiki-fukamushi':[8,75,60],'hibiki-gyokuro':[10,65,150]};
Object.keys(expected).forEach(id=>{const m=data.tea.find(r=>r.id===id).methods.find(m=>m.vessel==='glass');assert.deepEqual([m.tea,m.temp,m.steeps[0]],expected[id]);assert.equal(m.water,500);assert.equal(m.infusionsMax,2)});
for(const value of [{infusionsMin:3,infusionsMax:2},{infusionsMax:2.5},{infusionsMax:0},{infusionGuidance:{bad:true}}]){const bad=JSON.parse(JSON.stringify(data));Object.assign(bad.tea[0].methods[0],value);assert.throws(()=>c.validateRecipes(bad));}
const roundTrip=JSON.parse(JSON.stringify(data));c.validateRecipes(roundTrip);assert.deepEqual(roundTrip,data);
console.log('PASS: approved western parameters, unchanged kyusu reuse, method precedence, proportional scaling, advisory-only ranges and method validation.');
