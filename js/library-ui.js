// UI for products, personal ratings, stock status, and small local summaries.
let library,stockFilter='rotation',activeProductId=null,analyticsType='coffee';
const PROCESS_OPTIONS=['Washed','Natural','Honey','Wet-hulled','Experimental','Other','Unknown'];
const TEA_OPTIONS=['Green','White','Yellow','Oolong','Black','Dark / post-fermented','Matcha','Blend','Other'];
const COUNTRY_OPTIONS=['Brazil','China','Colombia','Costa Rica','Ecuador','El Salvador','Ethiopia','Guatemala','Honduras','India','Indonesia','Japan','Kenya','Laos','Malawi','Mexico','Myanmar','Nepal','Nicaragua','Panama','Papua New Guinea','Peru','Rwanda','South Korea','Sri Lanka','Taiwan','Tanzania','Thailand','Uganda','United States','Vietnam','Yemen','Blend'];
function initLibrary(){
 const published=validateProducts(PRODUCT_SEED,SEED),saved=Store.read('library',null);
 library={products:published,personal:{},published:published};
 if(saved){
  // Missing recipes never discard ratings or notes; show the item and let it be repaired.
  library.personal=validatePersonal(saved.personal||{});
  library.products=mergeProducts(validateProducts(saved.products||[],data,true),saved.published||[],published);
 }
 Store.write('library',library);
}
function productForRecipe(r){
 if(activeProductId)return library.products.find(p=>p.id===activeProductId&&p.recipeIds.includes(r.id))||null;
 const found=library.products.filter(p=>p.recipeIds.includes(r.id));return found.length===1?found[0]:null;
}
function pref(p){return productPreference(library.personal,p.id)}
function saveLibrary(next){if(!save('library',next))return false;library=next;return true}
function updatePersonal(id,patch){const next=cloneJSON(library);next.personal[id]=Object.assign({},productPreference(next.personal,id),patch);validatePersonal(next.personal);return saveLibrary(next)}
function openProduct(id){const p=library.products.find(x=>x.id===id);if(!p)return;const r=all().find(x=>p.recipeIds.includes(x.id));if(!r){productEditor(p);toast('Choose a replacement brewing recipe for this product.');return}openRecipe(r.id,id)}
function stockVisible(p){if(p.type==='drinks')return stockFilter!=='archived';return stockFilter==='all'||pref(p).status===stockFilter}
function productCard(p){const state=pref(p);return `<article class="recipe-card ${p.type}"><button class="recipe-open" data-product="${esc(p.id)}"><span class="category-tag">${esc(p.type==='tea'?(p.teaType||'Tea'):p.type==='coffee'?'Coffee':'Drink')}${state.status==='archived'&&p.type!=='drinks'?' · Archived':''}</span><h3>${esc(p.name)}</h3><span class="card-meta">${esc([p.brand,p.country].filter(Boolean).join(' · '))}</span><span class="product-rating">${state.rating===null?'Unrated':fmt(state.rating)+' / 5 ★'}</span></button></article>`}
function stockBar(){return `<div class="filter-bar" aria-label="Stock status">${[['rotation','In rotation'],['all','All'],['archived','Archived']].map(([id,label])=>`<button class="chip ${stockFilter===id?'chosen':''}" data-stock="${id}" aria-pressed="${stockFilter===id}">${label}</button>`).join('')}</div>`}
function homeContent(){
 const products=library.products.filter(p=>p.type!=='drinks'&&pref(p).status==='rotation');
 return `<header><div><div class="eyebrow">YOUR COFFEE BAR</div><h1>Recipes</h1></div></header><section><div class="section-heading"><h2>Explore your recipes</h2></div><div class="category-grid">${categories.map(c=>`<button class="category-card ${c}" data-nav="${c}"><span class="category-icon">${symbols[c]}</span><span><strong>${c[0].toUpperCase()+c.slice(1)}</strong><small>${c==='water'?data[c].length+' recipes':library.products.filter(p=>p.type===c).length+' products · '+data[c].length+' recipes'}</small></span><span class="arrow">↗</span></button>`).join('')}</div></section><section><div class="section-heading"><h2>In rotation</h2><button class="text-button" data-action="add-product">+ Add product</button></div><div class="recipe-grid">${products.map(productCard).join('')||empty('Add a coffee or tea to keep what you are brewing within reach.')}</div></section>`;
}
function catalogCards(){
 const linked=new Set([].concat.apply([],library.products.map(p=>p.recipeIds)));
 const match=r=>groupFilter==='All'||recipeGroup(r)===groupFilter;
 const products=library.products.filter(p=>route==='all'||route==='search'||p.type===route).filter(stockVisible).filter(p=>(groupFilter==='All'&&!p.recipeIds.some(id=>all().some(r=>r.id===id)))||p.recipeIds.some(id=>{const r=all().find(x=>x.id===id);return r&&match(r)})).filter(p=>route!=='search'||JSON.stringify(p).toLowerCase().includes(query.toLowerCase())||pref(p).notes.toLowerCase().includes(query.toLowerCase())||p.recipeIds.some(id=>{const r=all().find(x=>x.id===id);return r&&JSON.stringify(r).toLowerCase().includes(query.toLowerCase())}));
 const recipes=all().filter(r=>!linked.has(r.id)&&(route==='all'||route==='search'||r.type===route)&&match(r)).filter(r=>route!=='search'||JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
 return products.map(productCard).join('')+(stockFilter==='archived'?'':recipes.map(card).join(''))||empty(stockFilter==='archived'?'No archived products.':'No matching products or recipes.');
}
function productPanel(r){
 const p=productForRecipe(r);
 if(!p)return r.type==='water'?'':`<section class="panel"><h2>Reusable recipe</h2><p class="muted">Start a product from this recipe to add its details and rating.</p>${button('+ Add product','product-from-recipe')}</section>`;
 const state=pref(p),half=state.rating!==null&&state.rating%1!==0;
 return `<section class="panel product-panel"><div class="section-heading"><h2>${esc(p.name)}</h2>${button('Edit details','edit-product','','text-button')}</div><p class="muted">${esc([p.brand,p.country,p.region,p.processing,p.teaType,p.cultivar].filter(Boolean).join(' · '))||'Add optional details to help spot preferences.'}</p><div class="rating-row" role="group" aria-label="Product rating">${[1,2,3,4,5].map(n=>`<button class="rating-star ${state.rating!==null&&state.rating>=n?'filled':half&&Math.ceil(state.rating)===n?'half':''}" data-rating="${n}" aria-label="Rate ${n} stars" aria-pressed="${state.rating===n}">★</button>`).join('')}</div><div class="page-actions rating-actions"><strong role="status">${state.rating===null?'Unrated':fmt(state.rating)+' / 5'}</strong><button class="chip" data-rating="${half?Math.floor(state.rating)||'clear':state.rating===5?4.5:(state.rating||0)+.5}" aria-label="Toggle half star" aria-pressed="${half}">½ star</button><button class="text-button" data-rating="clear">Clear rating</button></div>${p.type==='drinks'?'':`<div class="setting-row"><span>${state.status==='rotation'?'In rotation':'Archived'}</span><button class="button" data-product-status="${state.status==='rotation'?'archived':'rotation'}">${state.status==='rotation'?'Archive':'Put in rotation'}</button></div>`}<label class="field">Personal notes<textarea id="personal-notes" rows="3" maxlength="10000">${esc(state.notes)}</textarea></label>${button('Save notes','save-personal-notes')}<p class="muted" id="notes-status">Ratings, notes and stock status stay on this device.</p>${p.recipeIds.length>1?`<h3>Brewing recipes</h3><div class="method-tabs">${p.recipeIds.map(id=>{const recipe=all().find(x=>x.id===id);return recipe?`<button class="chip ${r.id===id?'chosen':''}" data-product-recipe="${esc(id)}">${esc(recipe.name)}</button>`:''}).join('')}</div>`:''}${button('+ Brewing recipe','add-product-recipe','','text-button')}</section>`;
}
function metadataOptions(type,field,defaults){const values=(defaults||[]).concat(library.products.filter(p=>p.type===type).map(p=>p[field]).filter(Boolean)),seen=new Set();return values.filter(v=>{const key=productKey(v);if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>a.localeCompare(b))}
function suggestField(label,key,p,defaults){return `<label class="field">${label}<input name="${key}" value="${esc(p[key]||'')}" list="product-${key}" maxlength="200" autocomplete="off"><datalist id="product-${key}">${metadataOptions(p.type,key,defaults).map(v=>`<option value="${esc(v)}"></option>`).join('')}</datalist><small class="muted">Choose a suggestion or type a new value.</small></label>`}
function selectField(label,key,value,options){return `<label class="field">${label}<select name="${key}"><option value="">Not specified</option>${Array.from(new Set(options.concat(value?[value]:[]))).map(v=>`<option ${v===value?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`}
function productEditor(p,type,template){
 const isNew=!p;type=p?p.type:type;
 if(!type){modal(`<h2>Add a product</h2><div class="page-actions">${['coffee','tea','drinks'].map(t=>`<button class="button" data-new-product="${t}">${t==='drinks'?'Drink':t==='tea'?'Tea':'Coffee'}</button>`).join('')}</div>${button('Cancel','close-modal')}`);return}
 p=p||{id:'product-'+newRecipeId(),type:type,name:'',recipeIds:[]};productEditor.current={product:p,isNew:isNew};
 const recipes=all().filter(r=>r.type===type);
 modal(`<form id="product-form"><h2>${isNew?'Add':'Edit'} ${type==='drinks'?'drink':'product'}</h2><label class="field">Name<input name="name" required maxlength="200" value="${esc(p.name)}"></label>${type==='drinks'?'':`<div class="form-grid">${suggestField(type==='coffee'?'Roaster':'Seller / distributor','brand',p)}${suggestField('Origin country','country',p,COUNTRY_OPTIONS)}${suggestField('Region (optional)','region',p)}${suggestField('Variety / cultivar (optional)','cultivar',p)}${type==='coffee'?selectField('Processing','processing',p.processing,PROCESS_OPTIONS):selectField('Tea type','teaType',p.teaType,TEA_OPTIONS)}</div>`}${isNew||!p.recipeIds.some(id=>all().some(r=>r.id===id))?`<label class="field">Starting recipe<select name="template">${recipes.map(r=>`<option value="${esc(r.id)}" ${template===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label><p class="muted">A separate copy will be created for this product. Adjust its recipe afterward.</p>`:''}<p id="product-error" class="error" role="alert"></p><div class="page-actions"><button class="button primary" type="submit">Save product</button>${button('Cancel','close-modal')}</div></form>`);document.querySelectorAll('#product-form button[data-action]').forEach(b=>b.type='button');
}
function saveProduct(form){try{
 const draft=productEditor.current,p=Object.assign({},draft.product),fd=new FormData(form);PRODUCT_FIELDS.forEach(key=>{if(fd.has(key)){const value=String(fd.get(key)).trim().replace(/\s+/g,' ');p[key]=metadataOptions(p.type,key).find(v=>productKey(v)===productKey(value))||value;}});
 const nextData=cloneJSON(data),next=cloneJSON(library);
 if(fd.has('template')){const base=all().find(r=>r.id===fd.get('template'));if(!base)throw Error('Choose a starting recipe.');const recipe=cloneJSON(base);delete recipe.type;recipe.id='recipe-'+newRecipeId();recipe.name=p.name+' · '+base.name;nextData[p.type].push(recipe);p.recipeIds=[recipe.id];}
 const i=next.products.findIndex(x=>x.id===p.id);if(i<0)next.products.push(p);else next.products[i]=p;
 next.products=validateProducts(next.products,nextData,true);
 if(!commitCollection(nextData,next))return;document.getElementById('modal').close();openProduct(p.id);toast('Product saved');
 }catch(error){document.getElementById('product-error').textContent=error.message}}
function commitCollection(recipes,nextLibrary){
 if(!Store.write('pendingTransfer',{recipes:recipes,library:nextLibrary})){toast('Not enough storage. Export a backup before continuing.');return false}
 if(!replayTransfer()){toast('The change is saved but could not finish. Reload to retry.');return false}
 data=recipes;library=nextLibrary;return true;
}

function renderAnalytics(){
 const rated=library.products.filter(p=>p.type===analyticsType&&pref(p).rating!==null),mean=rated.length?rated.reduce((sum,p)=>sum+pref(p).rating,0)/rated.length:null;
 const fields=analyticsType==='coffee'?[['brand','Roaster'],['country','Country'],['region','Region'],['processing','Processing'],['cultivar','Variety / cultivar']]:analyticsType==='tea'?[['brand','Seller / distributor'],['country','Country'],['region','Region'],['teaType','Tea type'],['cultivar','Cultivar']]:[['name','Drink']];
 shell(`<header><div><div class="eyebrow">YOUR PREFERENCES</div><h1>Insights</h1></div></header><div class="filter-bar">${['coffee','tea','drinks'].map(t=>`<button class="chip ${analyticsType===t?'chosen':''}" data-analytics="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div><section class="panel"><h2>${mean===null?'No ratings yet':fmt(mean)+' / 5 average'}</h2><p class="muted">${rated.length} rated products · includes archived products. Each product counts once; unrated items are excluded. Small samples are starting points, not strong trends.</p></section><div class="insights-grid">${fields.map(([key,label])=>{const groups=analyticsGroups(library.products,library.personal,analyticsType,key);return `<section class="panel"><h2>By ${label.toLowerCase()}</h2>${groups.length?`<table class="insights-table"><thead><tr><th>${label}</th><th>Average</th><th>Products</th></tr></thead><tbody>${groups.map(g=>`<tr><td>${esc(g.label)}</td><td>${fmt(g.average)} ★</td><td>${g.count}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Rate a product to see its summary here.</p>'}</section>`}).join('')}</div>`);
}
function saveVisibleNotes(){const p=route==='recipe'?productForRecipe(currentRecipe()||{}):null,input=document.getElementById('personal-notes');if(p&&input&&input.value!==pref(p).notes)return updatePersonal(p.id,{notes:input.value});return true}
// Capture notes before any navigation or rerender so a rating tap cannot erase a draft.
document.addEventListener('click',function(e){const el=e.target.closest('button');if(el&&!saveVisibleNotes()){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('click',function(e){const el=e.target.closest('button');if(!el)return;const r=route==='recipe'?currentRecipe():null,p=r?productForRecipe(r):null;
 if(el.dataset.product){openProduct(el.dataset.product);return}
 if(el.dataset.stock){stockFilter=el.dataset.stock;render();return}
 if(el.dataset.analytics){analyticsType=el.dataset.analytics;renderAnalytics();return}
 if(el.dataset.newProduct){productEditor(null,el.dataset.newProduct);return}
 if(el.dataset.productRecipe&&p){openRecipe(el.dataset.productRecipe,p.id);return}
 if(el.dataset.rating&&p){if(updatePersonal(p.id,{rating:el.dataset.rating==='clear'?null:Number(el.dataset.rating)}))renderRecipe();return}
 if(el.dataset.productStatus&&p){if(updatePersonal(p.id,{status:el.dataset.productStatus}))renderRecipe();return}
 switch(el.dataset.action){
 case'add-product':productEditor();break;
 case'product-from-recipe':productEditor(null,r.type,r.id);break;
 case'edit-product':if(p)productEditor(p);break;
 case'save-personal-notes':if(p&&saveVisibleNotes()){document.getElementById('notes-status').textContent='Notes saved on this device.';toast('Notes saved')}break;
 case'add-product-recipe':if(p){modal(`<h2>Add a brewing recipe</h2><p class="muted">Copy a starting recipe for ${esc(p.name)}.</p><div class="page-actions">${all().filter(x=>x.type===p.type).map(x=>`<button class="button" data-copy-recipe="${esc(x.id)}" data-owner="${esc(p.id)}">${esc(x.name)}</button>`).join('')}</div>${button('Cancel','close-modal')}`)}break;
 }
 if(el.dataset.copyRecipe){const owner=library.products.find(x=>x.id===el.dataset.owner),base=all().find(x=>x.id===el.dataset.copyRecipe);if(!owner||!base)return;const recipe=cloneJSON(base);delete recipe.type;recipe.id='recipe-'+newRecipeId();recipe.name=owner.name+' · '+base.name;const nextData=cloneJSON(data),next=cloneJSON(library);nextData[owner.type].push(recipe);next.products.find(x=>x.id===owner.id).recipeIds.push(recipe.id);if(commitCollection(nextData,next)){document.getElementById('modal').close();openRecipe(recipe.id,owner.id)}}
});
document.addEventListener('submit',function(e){if(e.target.id==='product-form'){e.preventDefault();saveProduct(e.target)}});
document.addEventListener('change',function(e){if(e.target.id==='personal-notes')saveVisibleNotes()});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')saveVisibleNotes()});
