// The startup guard owns timeouts and reports errors from every dependency.
(async function boot(){
 try{
  BaristaStartup.file='data/recipes.json';
  const response=await fetch('./data/recipes.json');
  if(!response.ok)throw Error('Recipe file returned HTTP '+response.status);
  window.SEED=validateRecipes(await response.json());
  BaristaStartup.file='data/products.json';
  const productResponse=await fetch('./data/products.json');
  if(!productResponse.ok)throw Error('Product file returned HTTP '+productResponse.status);
  const catalog=await productResponse.json();
  if(catalog.version!==1)throw Error('Unsupported product catalog version.');
  window.PRODUCT_SEED=validateProducts(catalog.products,SEED);
  if(BaristaStartup.failed)return;
  BaristaStartup.load('js/app.js',function(){
   BaristaStartup.load('js/updates.js',function(){BaristaStartup.done();});
  });
 }catch(error){BaristaStartup.fail(error,BaristaStartup.file);}
})();
