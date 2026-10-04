// Recipe-aware quantities and vessel selection. These helpers have no UI dependencies.
window.VESSELS = {glass:'Glass teapot',kyusu:'Kyusu',gaiwan:'Porcelain gaiwan',zisha:'Zisha pot',chawan:'Chawan'};
window.recipeGroup = function(r) {
  return r.subcategory || (r.type==='water'?'Brew water':r.type==='coffee'?(r.id==='espresso'?'Espresso':'Pourover'):r.type==='tea'?(r.id==='matcha'?'Matcha':'Other tea'):r.espressoYield?'Espresso':'Other drinks');
};
window.teaMethod = function(r, id) {
  if(r.type!=='tea'||!(r.methods&&r.methods.length)) return r;
  const m=r.methods.find(x=>x.id===id)||r.methods[0];
  return Object.assign({},r,{tea:m.tea,water:m.water,temp:m.temp,steeps:m.steeps,
    steepTemps:m.steepTemps||m.steeps.map(()=>m.temp),presets:m.presets,
    preparation:m.preparation,sourceNote:m.sourceNote,methodId:m.id,
    methodName:m.name,vessel:m.vessel,methodInfusionGuidance:m.infusionGuidance,infusionsMin:m.infusionsMin,infusionsMax:m.infusionsMax});
};
window.recipeScaleBase = function(r, mode) {
  if(r.type==='water') return r.baseAmount||1;
  if(r.type==='tea') return r.water;
  if(r.type==='coffee') return mode==='water'?r.water:r.dose;
  return mode==='espressoYield'?r.espressoYield:r.espressoYield+r.milk+r.sweetener+r.ingredients.reduce((n,i)=>n+i.amount,0);
};
window.baseRecipePresets = function(r, mode) {
  if(r.type==='water') return r.waterKind==='concentrate'?[50,100,200,400,500]:[.25,.5,1,2,3,4,5];
  if(r.type==='tea') return r.presets|| (recipeGroup(r)==='Matcha'?[30,40,50,70]:[100,150,200,250]);
  if(r.type==='coffee') return recipeGroup(r)==='Espresso'?(mode==='water'?[30,36,42,54]:[15,18,20,21]):(mode==='water'?[200,250,300,500]:[15,18,20,25]);
  if(mode==='espressoYield') return [30,36,42,60];
  return recipeGroup(r)==='Espresso'?[120,150,180,240]:[150,185,250,350];
};
window.upgradeCollection = function(saved, seed, legacy) {
  const result=cloneJSON(saved);
  const same=(a,b)=>{const clean=x=>JSON.stringify(objectFromPairs(objectEntries(x).filter(([k])=>k!=='type').sort(([a],[b])=>a.localeCompare(b))));return clean(a)===clean(b)};
  for(const type of ['tea','coffee','water','drinks']) {
    result[type]=result[type].map(r=>{
      const next=seed[type].find(x=>x.id===r.id),before=legacy[type].find(x=>x.id===r.id);
      if(next&&before&&(type==='water'||same(r,before))) return cloneJSON(next);
      return r;
    });
    for(const r of seed[type]) if(!legacy[type].some(x=>x.id===r.id)&&!result[type].some(x=>x.id===r.id)) result[type].push(cloneJSON(r));
  }
  return result;
};

window.VESSEL_CAPACITIES = {glass:500,kyusu:250,gaiwan:100,zisha:110};
window.vesselScale = function(r, capacities=VESSEL_CAPACITIES){return (r&&r.type)==='tea'&&r.steeps.length>0?(capacities[r.vessel||'glass']||r.water)/r.water:1};

window.isLeafSession = r=>(r&&r.type)==='tea'&&r.steeps.length>0;
window.sessionLimits = function(r,capacities=VESSEL_CAPACITIES){
 const vessel=r.vessel||'glass',capacity=capacities[vessel]||r.water;
 return {vessel,capacity,min:vessel==='glass'?Math.min(200,capacity):capacity,max:vessel==='glass'?capacity:capacity*(vessel==='kyusu'?2:5),step:vessel==='glass'?'any':capacity};
};
window.teaSession = function(r,total,capacities=VESSEL_CAPACITIES){
 if(!isLeafSession(r))return null;
 const {vessel,capacity,min,max}=sessionLimits(r,capacities),multiple=total/capacity;
 if(!Number.isFinite(total)||total<min||total>max||(vessel!=='glass'&&Math.abs(multiple-Math.round(multiple))>1e-8))throw Error(vessel==='glass'?`Choose a volume from ${min} to ${max} mL.`:`Choose whole ${capacity} mL steeps, up to ${max} mL.`);
 const count=vessel==='glass'?1:Math.round(multiple),perSteep=vessel==='glass'?total:capacity;
 const last=r.steeps[r.steeps.length-1],increment=r.steeps.length>1?Math.max(10,last-r.steeps[r.steeps.length-2]):15;
 const steps=Array.from({length:count},(_,i)=>({seconds:(r.steeps[i]==null?last+increment*(i-r.steeps.length+1):r.steeps[i]),temp:(r.steepTemps&&r.steepTemps[i]!=null?r.steepTemps[i]:r.steepTemps&&r.steepTemps.length?r.steepTemps[r.steepTemps.length-1]:r.temp),water:perSteep,cumulative:perSteep*(i+1),estimated:i>=r.steeps.length}));
 return {count,perSteep,total,beyondTypical:typeof r.infusionsMax==='number'&&count>r.infusionsMax,dose:r.tea*perSteep/r.water,scale:perSteep/r.water,steps};
};
window.recipePresets = function(r,mode,capacities=VESSEL_CAPACITIES){
 if(!isLeafSession(r))return baseRecipePresets(r,mode);
 const {vessel,capacity,min,max}=sessionLimits(r,capacities);
 return vessel==='glass'?[...new Set([min,250,300,400,capacity].filter(n=>n>=min&&n<=max))].sort((a,b)=>a-b):Array.from({length:Math.round(max/capacity)},(_,i)=>capacity*(i+1));
};

// Informational only: never changes session volumes, dose, or timer schedules.
window.teaInfusionGuidance=function(r){
 if(r.methodInfusionGuidance)return r.methodInfusionGuidance;
 if(r.infusionGuidance)return r.infusionGuidance;
 if(!r.steeps.length)return 'One preparation; matcha is whisked and consumed, not re-steeped.';
 const group=recipeGroup(r).toLowerCase(),gongfu=['gaiwan','zisha'].includes(r.vessel);
 if(group.includes('white'))return gongfu?'Usually 5-8 total infusions with short steeps (rule of thumb).':'Usually 2-3 total infusions with long steeps (rule of thumb).';
 if(group.includes('green')||group.includes('japanese')||group.includes('roasted'))return r.vessel==='glass'?'Usually 1-2 total infusions (western-style rule of thumb); later cups are lighter.':'Usually 2-3 total infusions (rule of thumb); later cups are lighter.';
 if(group.includes('black'))return gongfu?'Usually 3-5 total infusions with short steeps (rule of thumb).':'Usually 1-2 total infusions (rule of thumb); second cup is lighter.';
 if(group.includes('herbal')||group.includes('botanical'))return 'Usually one infusion; a second may be much weaker (rule of thumb).';
 return 'Re-steeping potential not specified; saved timings are not a guaranteed infusion limit.';
};
