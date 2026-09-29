# Current library workflow

See [README.md](README.md#product-library-ratings-and-insights) for products, ratings, stock filters, and the current import/export behavior. Older recipe-only imports now merge; full backups replace after confirmation.

# Barista usage guide

For hosting, Android installation, and updates, start with [README.md](README.md).

## Use the dashboard

- Tap a recipe card to open it; tap its star to add or remove a favorite.
- Water: choose starting distilled-water volume, such as 2.35 L, then add the calculated concentrates. Concentrate recipes scale by starting distilled-water mass. Additions display to three decimal places.
- Tea: filter by subcategory, choose a brewer inside the recipe, then select total session volume. Each vessel stores its own dose, temperatures, steeps, preparation, and volume presets. Each steep has its own Start button.
- Coffee: choose coffee dose or water/output, then a preset or custom quantity. Bloom and cumulative pour amounts scale too. Espresso uses the water/output field for shot yield.
- Drinks: scale by total listed ingredient mass, or by espresso yield when present. Espresso dose is an input and is not counted twice in the total. Water/milk in mL use the approximate 1 mL = 1 g convention.
- Scaling is temporary and does not rewrite the base recipe. Times and temperatures stay fixed when scaling; selecting a different vessel loads that method’s own times and temperatures. Use Edit recipe to change the base values.
- One timer runs at a time. Its dock stays visible across navigation; it supports pause, reset, close, and the next tea steep. Replacing a running timer asks first. It stores a clock deadline, so navigation/reload does not restart it.
- Settings includes Fahrenheit, water units, larger text, sound, vibration, and keep-screen-awake. Wake lock is requested while a timer runs, and can also be enabled continuously.

Android can suspend a browser or silence background audio. A timer corrects its display from wall-clock time when resumed, but a background sound is not guaranteed. Wake lock and vibration depend on device/browser support. This app is a recipe reference; it does not control the Decent machine.

## Edit and back up recipes

The touch editor is in each recipe, with Add recipe also in Settings and recipe lists. It supports add, save, duplicate, and delete. Pour schedules and ingredient lists use simple one-row-per-line fields:

```text
Bloom | 50 | 0
Pour to | 150 | 45
```

```text
Calcium concentrate | 2 | g
Magnesium concentrate | 1.5 | g
```

Use Settings > Export full backup to save recipes, products, ratings, personal notes, archive status, favorites and settings. Export catalog makes a publishable collection without personal product data. Import JSON validates and previews the file: catalogs merge by ID, while full backups restore the complete saved collection after confirmation. Invalid files leave existing data unchanged.

The JSON has four arrays: `tea`, `coffee`, `water`, `drinks`. IDs must be unique and stable (letters, numbers, hyphens, underscores). A water profile reference is the ID of a water recipe. Temperatures are stored in Celsius, times in seconds, and water recipes use `baseAmount` and `baseUnit`; ingredient amounts apply to that base batch. Ingredients use `g` or `mL`. Up to 20 steeps per vessel are supported.

The published collection is editable in `data/recipes.json`. See README.md for deploying changes and how tablet edits are preserved.

**Your actual water system is now included:**

| Recipe | Starting distilled water | Additions |
| --- | --- | --- |
| Buffer concentrate | 200 g | 4 g KHCO₃ |
| Hardness concentrate | 200 g | 8 g MgCl₂·6H₂O + 4 g anhydrous CaCl₂ |
| Robust water | 2 L | 7 g buffer + 5 g hardness |
| Delicate water | 2 L | 3 g buffer + 3 g hardness |
| Soft water | 2 L | 2 g buffer + 2 g hardness |

The starting water is measured **before** additions. A buffer batch weighs 204 g and a hardness batch weighs 212 g. Brew-water recipes dose the finished concentrates by mass. The old `matcha-water` ID remains stable but now displays as Soft water, preserving links and favorites. No inferred ppm targets are included.

## Tea methods and research

The Tea section has Japanese green, roasted, white, black and matcha filters. Coffee separates pourover and espresso; Drinks separates espresso, matcha and black tea; Water separates brew water and concentrates. Presets depend on the preparation rather than the broad category.

Choose a vessel on a tea page. **Edit recipe** edits that selected vessel's brewing parameters; **+ Vessel recipe** adds a personal method. Recipe name, subcategory and bar notes remain shared. Matcha Pinnacle has distinct usucha and koicha methods with small serving presets. Your earlier strong matcha and light genmaicha remain as explicitly named house recipes.

Glass, kyusu and gaiwan options are included where appropriate. Fresh white teas default to porcelain gaiwan or glass; zisha is not a blanket recommendation. A zisha starting point is available on the unflavored Black tea starter, and personal methods may use any listed vessel. Your working capacities are preconfigured: glass 500 mL, kyusu 250 mL, gaiwan 100 mL, zisha 110 mL. Opening or switching a vessel defaults to one full fill; the reference recipe stays unchanged. Settings > Your vessels lets you edit these capacities.

For glass, any total from 200–500 mL makes one infusion. For kyusu, choose 250 or 500 mL: one or two full 250 mL infusions. Gaiwan offers 100–500 mL in 100 mL steps. Zisha offers 110–550 mL in 110 mL steps. The same leaves are reused, so selecting more steeps does not multiply the dose. Each row shows the per-steep and cumulative water volumes. The total is water poured, not measured beverage yield after absorption.

Fixed-vessel partial fills are rejected. If a planned session extends beyond the saved timing schedule, extra times are extrapolated from its last increment (minimum 10 seconds, or 15 seconds when only one saved time exists), labeled **estimated time**, and remain editable through the vessel recipe. Timer sequences capture the current plan, so later changes to vessel or session size cannot alter a running timer's next steep. Matcha uses its recipe serving volume, not a pot capacity.

Sources are saved with recipes and accessible under **Recipe sources & guidance**. All recipe parameters remain available offline; the external source links require a connection. Vendor recommendations, customer reports, and adapted schedules are identified. See RESEARCH.md for the inventory and evidence limitations. House water-profile pairings are preferences, not vendor endorsements of your mineral formulas.

