// Product identity and local preferences are separate from brewing recipes.
window.productKey = value=>String(value||'').trim().replace(/\s+/g,' ').toLowerCase();
window.PRODUCT_FIELDS=['name','brand','country','region','cultivar','processing','teaType'];
window.validateProducts=function(value,recipes,allowMissing=false){
 if(!Array.isArray(value)||value.length>2000)throw Error('Products must be an array of up to 2,000 items.');
 const ids=new Set(),refs={};
 ['coffee','tea','drinks'].forEach(type=>recipes[type].forEach(r=>refs[r.id]=type));
 return value.map(p=>{
  if(!p||!/^[-a-zA-Z0-9_]{1,100}$/.test(p.id)||ids.has(p.id))throw Error('Product IDs must be unique letters, numbers, hyphens or underscores.');
  ids.add(p.id);
  if(!['coffee','tea','drinks'].includes(p.type))throw Error('Invalid product category.');
  const copy={id:p.id,type:p.type};
  PRODUCT_FIELDS.forEach(field=>{const v=p[field]==null?'':p[field];if(typeof v!=='string'||v.length>200)throw Error('Product '+field+' must be text up to 200 characters.');copy[field]=v.trim().replace(/\s+/g,' ');});
  if(!copy.name)throw Error('A product needs a name.');
  if(!Array.isArray(p.recipeIds)||!p.recipeIds.length||p.recipeIds.length>30||new Set(p.recipeIds).size!==p.recipeIds.length)throw Error('Each product needs 1–30 distinct brewing recipes.');
  if(p.recipeIds.some(id=>typeof id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(id)||(refs[id]!==p.type&&!(allowMissing&&!refs[id]))))throw Error('Product '+copy.name+' refers to a missing or wrong-category recipe.');
  copy.recipeIds=p.recipeIds.slice();return copy;
 });
};
window.validatePersonal=function(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>5000)throw Error('Invalid personal product data.');
 const out={};
 Object.keys(value).forEach(id=>{
  if(!/^[-a-zA-Z0-9_]{1,100}$/.test(id))throw Error('Invalid personal product ID.');
  const p=value[id];
  if(!p||!['rotation','archived'].includes(p.status)||typeof p.notes!=='string'||p.notes.length>10000||!(p.rating===null||(typeof p.rating==='number'&&p.rating>=.5&&p.rating<=5&&Number.isInteger(p.rating*2))))throw Error('Ratings must be half-stars from 0.5 to 5, or null; notes and stock status must be valid.');
  Object.defineProperty(out,id,{value:{status:p.status,notes:p.notes,rating:p.rating},enumerable:true,writable:true,configurable:true});
 });return out;
};
window.productPreference=(personal,id)=>Object.prototype.hasOwnProperty.call(personal,id)?personal[id]:{status:'rotation',notes:'',rating:null};
window.mergeProducts=function(local,before,next){
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 // Retain products removed from the published file: they may hold personal history.
 const result=local.map(p=>{const old=before.find(x=>x.id===p.id),fresh=next.find(x=>x.id===p.id);return old&&fresh&&same(p,old)?cloneJSON(fresh):cloneJSON(p);});
 next.forEach(p=>{if(!result.some(x=>x.id===p.id))result.push(cloneJSON(p));});return result;
};
window.analyticsGroups=function(products,personal,type,field){
 const groups=new Map();
 products.filter(p=>p.type===type).forEach(p=>{
  const rating=productPreference(personal,p.id).rating;if(rating===null)return;
  const label=(p[field]||'Not specified').trim(),key=productKey(label);
  if(!groups.has(key))groups.set(key,{label:label,count:0,total:0});
  const g=groups.get(key);g.count++;g.total+=rating;
 });
 return Array.from(groups.values()).map(g=>Object.assign(g,{average:g.total/g.count})).sort((a,b)=>b.average-a.average||b.count-a.count||a.label.localeCompare(b.label));
};
window.mergeRecipeImport=function(current,incoming){
 const result=cloneJSON(current);
 ['coffee','tea','water','drinks'].forEach(type=>incoming[type].forEach(r=>{
  const elsewhere=['coffee','tea','water','drinks'].some(t=>t!==type&&result[t].some(x=>x.id===r.id));
  if(elsewhere)throw Error('Recipe '+r.id+' already exists in another category.');
  const i=result[type].findIndex(x=>x.id===r.id);if(i<0)result[type].push(r);else result[type][i]=r;
 }));return validateRecipes(result);
};
