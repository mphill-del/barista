// Local date strings avoid UTC shifting a reminder onto the previous day.
window.baristaToday=function(){const d=new Date();return d.getFullYear()+'-'+padTwo(d.getMonth()+1)+'-'+padTwo(d.getDate())};
window.validReminderDate=function(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
window.addReminderDays=function(s,n){if(!validReminderDate(s))throw Error('Enter a valid date.');const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
window.validatePurchaseBatches=function(items){
 if(!Array.isArray(items)||items.length>200)throw Error('Invalid coffee purchases.');const ids=new Set();
 return items.map(b=>{if(!b||typeof b.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(b.id)||ids.has(b.id)||!validReminderDate(b.purchaseDate))throw Error('Each purchase needs a unique ID and valid purchase date.');ids.add(b.id);const out={id:b.id,purchaseDate:b.purchaseDate};['roastDate','remindDate'].forEach(k=>{if(b[k]){if(!validReminderDate(b[k]))throw Error('Invalid '+k);out[k]=b[k]}});return out});
};
window.validateDaily=function(value){
 if(value!=null&&(typeof value!=='object'||Array.isArray(value)))throw Error('Invalid daily preferences.');
 const v=value||{},out={reminders:[],pickTypes:['tea','drinks'],excludedDrinkIds:[],lastPick:'',lastRecipes:{}};
 const id=s=>typeof s==='string'&&/^[-a-zA-Z0-9_]{1,220}$/.test(s);
 if(v.pickTypes!==undefined){if(!Array.isArray(v.pickTypes)||v.pickTypes.length>3||v.pickTypes.some(x=>!['tea','drinks','coffee'].includes(x))||new Set(v.pickTypes).size!==v.pickTypes.length)throw Error('Invalid pick categories.');out.pickTypes=v.pickTypes.slice()}
 if(v.excludedDrinkIds!==undefined){if(!Array.isArray(v.excludedDrinkIds)||v.excludedDrinkIds.length>2000||v.excludedDrinkIds.some(x=>!id(x)))throw Error('Invalid drink picks.');out.excludedDrinkIds=v.excludedDrinkIds.slice()}
 if(v.lastPick){if(!id(v.lastPick))throw Error('Invalid last pick.');out.lastPick=v.lastPick}
 if(v.lastRecipes){if(typeof v.lastRecipes!=='object'||Array.isArray(v.lastRecipes)||Object.keys(v.lastRecipes).length>2000)throw Error('Invalid recipe choices.');Object.keys(v.lastRecipes).forEach(k=>{if(!id(k)||!id(v.lastRecipes[k]))throw Error('Invalid recipe choice.');Object.defineProperty(out.lastRecipes,k,{value:v.lastRecipes[k],enumerable:true,writable:true,configurable:true})})}
 if(v.reminders!==undefined){if(!Array.isArray(v.reminders)||v.reminders.length>2000)throw Error('Invalid reminders.');const ids=new Set();out.reminders=v.reminders.map(r=>{if(!r||!id(r.id)||ids.has(r.id)||!id(r.productId)||!validReminderDate(r.purchaseDate)||!validReminderDate(r.remindDate)||typeof r.dismissed!=='boolean'||(r.roastDate&&!validReminderDate(r.roastDate)))throw Error('Invalid reminder dates or identity.');ids.add(r.id);return {id:r.id,productId:r.productId,purchaseDate:r.purchaseDate,roastDate:r.roastDate||'',remindDate:r.remindDate,dismissed:r.dismissed}})}
 return out;
};
window.seedPurchaseReminders=function(daily,products){const out=validateDaily(daily);products.filter(p=>p.type==='coffee').forEach(p=>(p.purchases||[]).forEach(b=>{const id=p.id+'--'+b.id;if(!out.reminders.some(r=>r.id===id))out.reminders.push({id:id,productId:p.id,purchaseDate:b.purchaseDate,roastDate:b.roastDate||'',remindDate:b.remindDate||addReminderDays(b.roastDate||b.purchaseDate,21),dismissed:false})}));return validateDaily(out)};
window.pickCandidates=function(products,personal,recipes,daily){const ids=new Set([].concat.apply([],['tea','coffee','drinks'].map(t=>recipes[t].map(r=>r.id))));return products.filter(p=>daily.pickTypes.includes(p.type)&&p.recipeIds.some(id=>ids.has(id))&&(p.type==='drinks'?!daily.excludedDrinkIds.includes(p.id):productPreference(personal,p.id).status==='rotation'))};
window.chooseProduct=function(candidates,last,random){const pool=candidates.length>1?candidates.filter(p=>p.id!==last):candidates;return pool.length?pool[Math.floor((random||Math.random)()*pool.length)]:null};
