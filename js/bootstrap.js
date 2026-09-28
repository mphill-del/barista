// The startup guard owns timeouts and reports errors from every dependency.
(async function boot(){
 try{
  BaristaStartup.file='data/recipes.json';
  const response=await fetch('./data/recipes.json');
  if(!response.ok)throw Error('Recipe file returned HTTP '+response.status);
  window.SEED=validateRecipes(await response.json());
  if(BaristaStartup.failed)return;
  BaristaStartup.load('js/app.js',function(){
   BaristaStartup.load('js/updates.js',function(){BaristaStartup.done();});
  });
 }catch(error){BaristaStartup.fail(error,'data/recipes.json');}
})();
