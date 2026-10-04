// Authoring tool only; never loaded by the tablet. Preview by default.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function prepare(base, published, patch) {
  const c = {window: null}; c.window = c; vm.createContext(c);
  ['compat', 'storage', 'library'].forEach(name => vm.runInContext(fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8'), c));
  if (!patch || patch.format !== 'barista-catalog' || patch.version !== 1) throw Error('Expected a version 1 barista-catalog, never a personal backup.');
  if (Object.keys(patch).some(k => !['format', 'version', 'recipes', 'products'].includes(k))) throw Error('Unexpected catalog fields. Remove private/order data.');
  c.validateRecipes(base); c.validateProducts(published.products, base);
  const recipes = c.mergeRecipeImport(base, c.validateRecipes(patch.recipes));
  const allowed = ['id', 'type', 'recipeIds'].concat(Array.from(c.PRODUCT_FIELDS));
  patch.products.forEach(p => { if (Object.keys(p).some(k => !allowed.includes(k))) throw Error('Unexpected product fields. Personal data does not belong in the catalog.'); });
  const incoming = c.validateProducts(patch.products, recipes);
  const products = JSON.parse(JSON.stringify(published.products));
  incoming.forEach(p => {
    const duplicate = products.find(x => x.id !== p.id && x.type === p.type && c.productKey(x.brand) === c.productKey(p.brand) && c.productKey(x.name) === c.productKey(p.name));
    if (duplicate) throw Error('Possible duplicate: ' + p.name + '. Reuse ' + duplicate.id + ' or review the distinct lot identity.');
    const i = products.findIndex(x => x.id === p.id);
    if (i >= 0 && products[i].type !== p.type) throw Error('Do not change the category of an existing product.');
    if (i < 0) products.push(p); else products[i] = p;
  });
  c.validateProducts(products, recipes);
  const changes = [];
  ['coffee', 'tea', 'water', 'drinks'].forEach(type => patch.recipes[type].forEach(r => {
    const old = base[type].find(x => x.id === r.id);
    changes.push({kind: 'recipe', id: r.id, name: r.name, action: !old ? 'add' : JSON.stringify(old) === JSON.stringify(r) ? 'unchanged' : 'update'});
  }));
  incoming.forEach(p => {
    const old = published.products.find(x => x.id === p.id);
    changes.push({kind: 'product', id: p.id, name: p.name, action: !old ? 'add' : JSON.stringify(old) === JSON.stringify(p) ? 'unchanged' : 'update'});
  });
  return {recipes: JSON.parse(JSON.stringify(recipes)), products: JSON.parse(JSON.stringify({version: 1, products})), changes};
}
module.exports = {prepare};
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (!args[0] || args.slice(1).some(x => x !== '--apply')) throw Error('Usage: node scripts/catalog-update.cjs <catalog.json> [--apply]');
    const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
    const result = prepare(read(path.join(root, 'data/recipes.json')), read(path.join(root, 'data/products.json')), read(args[0]));
    console.table(result.changes);
    if (args.includes('--apply')) {
      // Both documents have passed validation before either is written. Git remains the recovery boundary.
      ['recipes', 'products'].forEach(key => {
        const file = path.join(root, 'data', key + '.json');
        const eol = fs.readFileSync(file, 'utf8').includes('\r\n') ? '\r\n' : '\n';
        fs.writeFileSync(file, (JSON.stringify(result[key], null, 2) + '\n').replace(/\n/g, eol));
      });
      console.log('Applied locally. Review diff, bump RELEASE, run tests, then obtain publication approval. Nothing was committed or pushed.');
    } else console.log('Preview only. No files changed.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
