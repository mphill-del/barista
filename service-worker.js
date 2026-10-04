// Change RELEASE for EVERY deployment, including recipe-only edits.
const RELEASE='2026-10-04.3-brew-guidance';
const PREFIX='barista:'+self.registration.scope+':';
const CACHE=PREFIX+RELEASE;
const ASSETS=['./','./index.html','./css/styles.css','./js/library.js','./js/library-ui.js','./js/transfer.js','./data/products.json','./js/compat.js','./js/legacy-data.js','./js/brewing.js','./js/storage.js','./js/timer.js','./js/bootstrap.js','./js/app.js','./js/updates.js','./data/recipes.json','./manifest.json','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'];
// Installation succeeds only when the complete release is cached. Bypass HTTP cache.
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));
})()));
self.addEventListener('message',event=>{if((event.data&&event.data.type)==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||!url.href.startsWith(self.registration.scope))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(event.request.mode==='navigate')return (await cache.match(new URL('./index.html',self.registration.scope)))||fetch(event.request);
  return (await cache.match(event.request,{ignoreSearch:true}))||fetch(event.request);
 })());
});
