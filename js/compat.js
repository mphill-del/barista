// ES5 helpers. Recipe data is JSON-safe; no browser-native deep clone is needed.
window.cloneJSON = function(value) { return JSON.parse(JSON.stringify(value)); };
window.objectEntries = function(value) { return Object.keys(value).map(function(key) { return [key,value[key]]; }); };
window.objectFromPairs = function(pairs) {
 var result={};
 pairs.forEach(function(pair) { Object.defineProperty(result,pair[0],{value:pair[1],enumerable:true,writable:true,configurable:true}); });
 return result;
};
window.padTwo = function(value) { return ('0'+value).slice(-2); };
window.newRecipeId = function() { return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2); };
window.readTextFile = function(file) {
 return new Promise(function(resolve,reject) {
  var reader=new FileReader();
  reader.onload=function() { resolve(reader.result); };
  reader.onerror=function() { reject(reader.error||new Error('Could not read the selected file.')); };
  reader.onabort=function() { reject(new Error('File reading was cancelled.')); };
  reader.readAsText(file);
 });
};
window.checkCompatibility = function() {
 // Compile inside a string so unsupported parsers can still show the error panel.
 try { new Function('const a=1; let b=2; const f=(x=0)=>x; const {c}={c:3}; async function test(){await Promise.resolve();} return `${f(a)+b+c}`;'); }
 catch(error) { throw new Error('ES2017 JavaScript is not supported: '+error.message); }
 var required=['Promise','fetch','Map','Set','Symbol','URL','FileReader','FormData','Blob'];
 for(var i=0;i<required.length;i++)if(typeof window[required[i]]==='undefined')throw new Error('Required browser feature is missing: '+required[i]);
 if(!Object.assign||!Array.from||!Array.prototype.find||!Array.prototype.includes||!Number.isFinite||!Element.prototype.closest)throw new Error('Required ES2015/2016 or DOM features are missing.');
 // Older Chromium supports these inconsistently; the app only needs forEach.
 if(window.NodeList&&!NodeList.prototype.forEach)NodeList.prototype.forEach=Array.prototype.forEach;
 var dialog=document.getElementById('modal');
 if(typeof dialog.showModal!=='function'){
  dialog.className+=' dialog-fallback';
  dialog.showModal=function(){this.setAttribute('open','');this.open=true;this.style.display='block';};
  dialog.close=function(){this.removeAttribute('open');this.open=false;this.style.display='none';};
  dialog.style.display='none';
  document.addEventListener('keydown',function(event){if(event.key==='Escape'&&dialog.open)dialog.close();});
 }
};
