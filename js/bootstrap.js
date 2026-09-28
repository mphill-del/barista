// The only current bundled recipe source is data/recipes.json.
(async function boot(){
 const app=document.getElementById('app');
 app.innerHTML='<main style="padding:3rem"><h1>Barista</h1><p>Loading your recipes…</p></main>';
 try{
  const response=await fetch('./data/recipes.json');
  if(!response.ok)throw Error('Recipe file returned HTTP '+response.status);
  window.SEED=validateRecipes(await response.json());
  const script=document.createElement('script');script.src='./js/app.js';
  script.onerror=()=>{app.textContent='The app could not load. Reconnect and reload this page.'};
  document.body.append(script);
 }catch(error){
  app.innerHTML='<main style="padding:3rem"><h1>Recipes could not load</h1><p id="load-error"></p><p>Reconnect and reload. If you just edited data/recipes.json, correct its JSON and recipe fields, then redeploy.</p><button onclick="location.reload()">Try again</button></main>';
  document.getElementById('load-error').textContent=error.message;
 }
})();
