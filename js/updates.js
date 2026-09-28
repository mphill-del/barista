(async function(){
 let registration,reloading=false;
 const refresh=()=>{if(route==='settings'&&!document.getElementById('modal').open)render()};
 const waiting=()=>{if(!registration.waiting)return;window.updateAvailable=true;window.updateMessage='A new version is ready.';refresh();toast('Update ready. Open Settings to update & reload.')};
 if(!('serviceWorker'in navigator)){window.offlineMessage='Offline installation requires a browser with service worker support.';refresh();return}
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(!window.updateAvailable)return;
  if(document.getElementById('modal').open){window.updateMessage='Update activated. Save your edits, then tap Update & reload.';refresh();return}
  if(!reloading){reloading=true;location.reload()}
 });
 try{
  registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});
  waiting();
  registration.addEventListener('updatefound',()=>{
   const worker=registration.installing;
   if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='installed')waiting()});
  });
  navigator.serviceWorker.ready.then(()=>{window.offlineMessage='Ready for offline use on this device.';refresh()});
 }catch(error){window.offlineMessage='Offline caching unavailable. Open through HTTPS or localhost, then reload.';refresh()}
 async function check(){
  if(!registration)return;
  window.updateMessage='Checking for updates…';refresh();
  try{await registration.update();waiting();if(!registration.waiting)window.updateMessage=registration.installing?'Downloading update…':'No new version found.'}
  catch(error){window.updateMessage='Could not check. Reconnect to the internet and try again.'}
  refresh();
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-update-check]'))check();
  if(event.target.closest('[data-update-apply]')){
   if(document.getElementById('modal').open){toast('Save or close your recipe editor first.');return}
   if((registration&&registration.waiting))registration.waiting.postMessage({type:'SKIP_WAITING'});
   else location.reload();
  }
 });
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
 setInterval(()=>{if(document.visibilityState==='visible')check()},60*60*1000);
})();
