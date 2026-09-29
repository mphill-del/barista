// Catalog imports merge by stable ID. Full backups restore personal state explicitly.
let transferDraft=null;
function fullBackup(){return {format:'barista-backup',version:1,recipes:data,library:library,favorites:favorites,settings:settings,methodChoices:methodChoices,recent:recent}}
function exportRecipes(){exportLegacyRecipes(fullBackup())}
function exportCatalog(){exportLegacyRecipes({format:'barista-catalog',version:1,recipes:data,products:library.products});document.querySelector('#modal h2').textContent='Publishable catalog';}
function validateBackupSettings(value){
 if(!value||typeof value!=='object')throw Error('Missing backup settings.');
 const out={};['fahrenheit','sound','vibration','awake'].forEach(key=>{if(typeof value[key]!=='boolean')throw Error('Invalid '+key+' setting.');out[key]=value[key];});
 if(!['g','mL'].includes(value.waterUnit)||!['normal','large'].includes(value.textSize))throw Error('Invalid display settings.');
 out.waterUnit=value.waterUnit;out.textSize=value.textSize;out.vessels={};
 Object.keys(VESSEL_CAPACITIES).forEach(key=>{const n=value.vessels&&value.vessels[key];if(typeof n!=='number'||!Number.isFinite(n)||n<1||n>5000)throw Error('Invalid vessel capacity.');out.vessels[key]=n;});return out;
}
function prepareTransfer(value){
 if(value.format==='barista-backup'){
  if(value.version!==1)throw Error('Unsupported backup version.');
  const recipes=validateRecipes(value.recipes),state=value.library;if(!state)throw Error('Backup is missing personal library data.');
  const products=validateProducts(state.products,recipes,true),personal=validatePersonal(state.personal),published=validateProducts(state.published||[],recipes,true);
  const ids=new Set([].concat.apply([],categories.map(t=>recipes[t].map(r=>r.id))));
  const list=x=>{if(!Array.isArray(x)||x.length>5000||x.some(id=>typeof id!=='string'))throw Error('Invalid saved recipe list.');return x.filter(id=>ids.has(id));};
  const choices=value.methodChoices||{};if(typeof choices!=='object'||Array.isArray(choices)||Object.keys(choices).some(id=>typeof choices[id]!=='string'))throw Error('Invalid saved vessel choices.');
  return {kind:'backup',recipes:recipes,library:{products:products,personal:personal,published:published},settings:validateBackupSettings(value.settings),favorites:list(value.favorites),recent:list(value.recent||[]),methodChoices:choices};
 }
 if(value.format&&value.format!=='barista-catalog')throw Error('Unrecognized import format.');
 if(value.format&&value.version!==1)throw Error('Unsupported catalog version.');
 const incoming=validateRecipes(value.recipes||value),recipes=mergeRecipeImport(data,incoming),next=cloneJSON(library),products=validateProducts(value.products||[],recipes);
 products.forEach(p=>{const i=next.products.findIndex(x=>x.id===p.id);if(i<0)next.products.push(p);else {if(next.products[i].type!==p.type)throw Error('A product ID cannot change category.');next.products[i]=p;}});
 validateProducts(next.products,recipes,true);
 const incomingIds=[].concat.apply([],categories.map(t=>incoming[t].map(r=>r.id))),existingIds=new Set(all().map(r=>r.id));
 return {kind:'catalog',recipes:recipes,library:next,additions:incomingIds.filter(id=>!existingIds.has(id)).length,updates:incomingIds.filter(id=>existingIds.has(id)).length,productCount:products.length};
}
async function importFile(file){try{
 if(!file)return;if(file.size>8000000)throw Error('Choose a JSON file smaller than 8 MB.');
 transferDraft=prepareTransfer(JSON.parse(await readTextFile(file)));
 const draft=transferDraft;
 const description=draft.kind==='backup'?'This replaces recipes, products, ratings, personal notes, archive status, favorites and settings on this device. Export a backup first.':`${draft.additions} new recipes, ${draft.updates} existing recipe IDs to update, and ${draft.productCount} product entries. Existing products not in the import stay. Ratings, personal notes, archive status and favorites are preserved.`;
 modal(`<h2>${draft.kind==='backup'?'Restore full backup?':'Merge catalog?'}</h2><p>${description}</p><details><summary>Review incoming collection</summary><ul>${draft.library.products.map(p=>`<li>${esc(p.name)} · ${esc(p.brand||p.type)}</li>`).join('')}</ul></details><p id="transfer-error" class="error" role="alert"></p><div class="page-actions">${button('Cancel','close-modal')}${button(draft.kind==='backup'?'Restore backup':'Merge catalog','apply-transfer','','button primary')}</div>`);
 }catch(error){transferDraft=null;toast('Import rejected: '+error.message)}finally{const input=document.getElementById('import-file');if(input)input.value=''}}
function applyTransfer(){
 if(!transferDraft)return;
 const draft=transferDraft,values={recipes:draft.recipes,library:draft.library};
 if(draft.kind==='backup')Object.assign(values,{settings:draft.settings,favorites:draft.favorites,recent:draft.recent,methodChoices:draft.methodChoices});
 // Stage the entire restore in one atomic localStorage write. If interrupted,
 // startup replays this journal before reading application state.
 if(!Store.write('pendingTransfer',values)){document.getElementById('transfer-error').textContent='Not enough storage for a safe import. Export a backup and free storage first.';return}
 if(!replayTransfer()){document.getElementById('transfer-error').textContent='The import is saved but could not finish. Reload to retry; keep your backup.';return}
 data=draft.recipes;library=draft.library;
 if(draft.kind==='backup'){settings=draft.settings;favorites=draft.favorites;recent=draft.recent;methodChoices=draft.methodChoices;}
 transferDraft=null;document.getElementById('modal').close();navigate('all');toast(draft.kind==='backup'?'Backup restored':'Catalog merged');
}
function replayTransfer(){
 const pending=Store.read('pendingTransfer',null);if(!pending)return true;
 const keys=Object.keys(pending);for(const key of keys)if(!Store.write(key,pending[key]))return false;
 try{localStorage.removeItem('barista.pendingTransfer')}catch(error){return false}return true;
}
document.addEventListener('click',function(e){const el=e.target.closest('button');if(el&&el.dataset.action==='apply-transfer')applyTransfer()});
