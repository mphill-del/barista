// Three-way record merge: preserve locally edited and deleted recipes.
window.mergePublished=function(local,before,next){
 const canonical=v=>JSON.stringify(normalize(v));
 function normalize(v){if(Array.isArray(v))return v.map(normalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).filter(k=>k!=='type').sort().map(k=>[k,normalize(v[k])]));return v}
 const result={};
 for(const category of ['tea','coffee','water','drinks']){
  const old=new Map(before[category].map(r=>[r.id,r])),fresh=new Map(next[category].map(r=>[r.id,r]));
  result[category]=local[category].flatMap(r=>{
   if(old.has(r.id)&&canonical(r)===canonical(old.get(r.id)))return fresh.has(r.id)?[fresh.get(r.id)]:[];
   return [r];
  });
  for(const r of next[category])if(!old.has(r.id)&&!result[category].some(x=>x.id===r.id))result[category].push(r);
 }
 return structuredClone(result);
};
window.Store = {
 read(key,fallback){try{const v=localStorage.getItem('barista.'+key);return v===null?fallback:JSON.parse(v)}catch{return fallback}},
 write(key,value){try{localStorage.setItem('barista.'+key,JSON.stringify(value));return true}catch{return false}}
};
// Validate every editable numeric field and nested array before accepting a backup.
window.validateRecipes=function(value){
 const types=['tea','coffee','water','drinks'],ids=new Set();
 const fail=m=>{throw new Error(m)};
 const num=(v,label,min=0,max=100000)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(label+' must be a number from '+min+' to '+max)};
 const str=(v,label,required=false)=>{if(typeof v!=='string'||v.length>10000||(required&&!v.trim()))fail(label+' must be '+(required?'nonempty ':'')+'text (up to 10,000 characters)')};
 if(!value||typeof value!=='object'||Array.isArray(value))fail('Expected a recipe collection object.');
 for(const type of types){if(!Array.isArray(value[type])||value[type].length>500)fail(type+' must be an array with at most 500 recipes.');
 for(const r of value[type]){if(!r||typeof r!=='object')fail('Invalid recipe.');str(r.id,'ID',true);if(!/^[a-zA-Z0-9_-]{1,100}$/.test(r.id)||ids.has(r.id))fail('Recipe IDs must be unique and contain only letters, numbers, underscores or hyphens.');ids.add(r.id);str(r.name,'Name',true);if(r.name.length>100)fail('Name is too long.');str(r.notes,'Notes');
 const fields=type==='tea'?['tea','water','temp']:type==='coffee'?['dose','water','temp','targetTime','bloom','bloomTime']:type==='drinks'?['espressoDose','espressoYield','milk','milkTemp','sweetener']:[];
 fields.forEach(k=>num(r[k],r.name+': '+k,['tea','water','dose','targetTime'].includes(k)?.01:0,k.toLowerCase().includes('temp')||k==='temp'?150:100000));
 (type==='tea'?['teaType','waterProfile']:type==='coffee'?['brewer','grind','waterProfile']:type==='water'?['description','composition']:['milkType','sweetenerType']).forEach(k=>str(r[k],k));
 if(type==='tea'){if(!Array.isArray(r.steeps)||r.steeps.length>20)fail('Tea supports up to 20 steeps.');r.steeps.forEach(n=>num(n,'Steep seconds',1,86400))}
 if(type==='coffee'){if(!Array.isArray(r.pours)||r.pours.length>50)fail('Invalid pour schedule.');r.pours.forEach(p=>{str(p.label,'Pour label',true);num(p.amount,'Pour amount');num(p.time,'Pour time',0,86400)})}
 if(type==='water'||type==='drinks'){if(!Array.isArray(r.ingredients)||r.ingredients.length>100)fail('Invalid ingredients.');r.ingredients.forEach(i=>{str(i.name,'Ingredient name',true);num(i.amount,'Ingredient amount');if(!['g','mL',...(type==='water'?['L']:[])].includes(i.unit))fail('Ingredient units must be g or mL (water recipes may also use L).')});if(type==='water'&&typeof r.example!=='boolean')fail('Water example must be true or false.');if(type==='drinks'&&r.waterTemp!==undefined)num(r.waterTemp,'Water temperature',0,150)}
 if(r.subcategory!==undefined)str(r.subcategory,'Subcategory',true);
 if(r.preparation!==undefined){if(!Array.isArray(r.preparation)||r.preparation.length>30)fail('Preparation needs an array of up to 30 steps.');r.preparation.forEach(v=>str(v,'Preparation step',true))}
 if(r.sources!==undefined){if(!Array.isArray(r.sources)||r.sources.length>20)fail('Invalid sources.');r.sources.forEach(s=>{str(s.label,'Source label',true);str(s.url,'Source URL',true);if(!/^https:\/\//.test(s.url))fail('Sources must use HTTPS.')})}
 if(type==='water'&&r.waterKind!==undefined){if(!['brew','concentrate'].includes(r.waterKind))fail('Invalid water recipe kind.');num(r.baseAmount,'Base amount',.01);if(r.baseUnit!==(r.waterKind==='brew'?'L':'g'))fail('Brew water scales in liters; concentrates scale in grams.');const base=r.ingredients.find(i=>i.name==='Distilled water');if(!base||base.unit!==r.baseUnit||base.amount!==r.baseAmount)fail('Distilled water ingredient must match the scaling base.');}
 if(type==='tea'&&r.methods!==undefined){if(!Array.isArray(r.methods)||!r.methods.length||r.methods.length>20)fail('Tea needs 1–20 vessel methods.');const mids=new Set();for(const m of r.methods){str(m.id,'Method ID',true);if(!/^[a-zA-Z0-9_-]{1,100}$/.test(m.id)||mids.has(m.id))fail('Vessel method IDs must be unique.');mids.add(m.id);str(m.name,'Method name',true);if(!['glass','kyusu','gaiwan','zisha','chawan'].includes(m.vessel))fail('Invalid vessel.');num(m.tea,'Method tea',.01);num(m.water,'Method water',.01);num(m.temp,'Method temperature',0,150);if(!Array.isArray(m.steeps)||m.steeps.length>20)fail('Invalid method steeps.');m.steeps.forEach(n=>num(n,'Method steep',1,86400));if(m.steepTemps!==undefined){if(!Array.isArray(m.steepTemps)||m.steepTemps.length!==m.steeps.length)fail('Use one temperature per steep.');m.steepTemps.forEach(n=>num(n,'Steep temperature',0,150))}if(!Array.isArray(m.presets)||m.presets.length>12||!m.presets.length)fail('Provide 1–12 volume presets.');m.presets.forEach(n=>num(n,'Volume preset',.01));str(m.sourceNote,'Method attribution');if(!Array.isArray(m.preparation)||m.preparation.length>30)fail('Invalid method preparation.');m.preparation.forEach(v=>str(v,'Method preparation',true))}}
 if(type==='drinks'&&r.espressoYield+r.milk+r.sweetener+r.ingredients.reduce((n,i)=>n+i.amount,0)<=0)fail('A drink must contain a positive ingredient quantity.');
 }}return JSON.parse(JSON.stringify(value));
};
