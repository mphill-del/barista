# Catalog authoring and approval workflow

1. Give the assistant names, product links, or label photos of your purchases.
2. Ask for proposed product details and brewing recipes. Keep uncertain metadata blank. Record vendor links in each recipe's existing `sources` field and distinguish vendor instructions from adaptations in `sourceNote`.
3. Review and approve the actual additions before publication.
4. Update `data/recipes.json` and `data/products.json` together, keeping their existing entries and stable IDs. Bump `RELEASE` in service-worker.js, run all four test suites, commit, and push.
5. Devices receive catalog additions on their next app update. Each new coffee/tea starts in rotation and unrated. Ratings, personal notes and archive status stay local. Published metadata updates apply to unchanged product records; locally edited metadata wins on a conflict.

## Published files

`data/recipes.json` remains the four arrays `coffee`, `tea`, `water`, and `drinks`, using the existing validated recipe schema. Store product-specific recipes with unique IDs; several recipes may link to one product. Keep generic V60/espresso/house recipes for reuse.

`data/products.json` has this shape (this is a structural example, not a researched purchase):

```json
{
  "version": 1,
  "products": [
    {
      "id": "product-example-coffee",
      "type": "coffee",
      "name": "Example coffee",
      "brand": "Example roaster",
      "country": "",
      "region": "",
      "cultivar": "",
      "processing": "Washed",
      "teaType": "",
      "recipeIds": ["example-coffee-espresso", "example-coffee-v60"]
    }
  ]
}
```

The referenced recipe IDs must exist in the matching category of recipes.json. `type` is coffee, tea or drinks. For tea, `brand` is the seller/distributor and `teaType` is its broad class. Optional strings may be empty. Keep the same product ID when purchasing it again; use the app's Put in rotation button to reactivate it. Do not rename IDs to change display names.

Each product has exactly one local half-star rating, independent of vessel or recipe. Ratings are 0.5–5 in half steps; null means unrated. These personal fields do not belong in the published product file.

## Portable catalog import

For a file to import through Settings, package only the additions/updates:

```json
{
  "format": "barista-catalog",
  "version": 1,
  "recipes": {"coffee": [], "tea": [], "water": [], "drinks": []},
  "products": []
}
```

Fill the arrays with the validated recipe/product records. Existing IDs are updated after confirmation; new IDs are added; unrelated entries and personal data remain. Re-importing the same IDs does not duplicate them. Imports must be under 8 MB. Legacy recipe-only files with the four category arrays also merge, without adding product metadata.

Settings → Export catalog produces this same envelope with your full catalog. To publish it, put the envelope's `recipes` object in recipes.json and put `{ "version": 1, "products": ... }` in products.json. Review before pushing: recipe notes and public product fields are included, but personal product notes, ratings and status are not.

Settings → Export full backup uses `format: "barista-backup"`. It is intended for restoring a device, not publishing. Never commit a personal backup to GitHub as a catalog. Full restore is validated and confirmed, then staged locally so an interrupted restore can resume at startup.
