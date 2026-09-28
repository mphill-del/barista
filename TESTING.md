# Validation record — updated recipe dashboard

Tested September 27, 2026, using the in-app Chromium browser and dependency-free Node checks.

## Updated functionality

- All 29 recipes validate, including 13 teas identified from the screenshots, five water recipes and existing house/starter recipes.
- Exact formulas checked: Robust 2 L + 7 g buffer + 5 g hardness; Delicate 2 L + 3 g + 3 g; Soft 2 L + 2 g + 2 g.
- At 2.35 L, Robust computes 8.225 g buffer and 5.875 g hardness. UI additions use three decimal places.
- Hardness concentrate at 400 g distilled water computes 16 g MgCl₂·6H₂O and 8 g anhydrous CaCl₂. Buffer uses the correct 200 g water + 4 g KHCO₃ base.
- Subcategory navigation checked for white tea, Japanese green and matcha. Coffee and water use the same filtering path.
- Vessel selection changes the stored brew ratio, temperature, times and preparation; it does not rewrite reference values.
- Your working volumes are glass 500 mL, kyusu 250 mL, gaiwan 100 mL and zisha 110 mL.
- Kyusu at 250 mL displays one steep. At 500 mL it displays two 250 mL steeps, with cumulative 250/500 mL, without doubling the leaf dose.
- Gaiwan plans 100–500 mL in 100 mL increments; 500 mL displays five steeps and cumulative totals. Extended timings are explicitly labeled estimates.
- Glass accepts arbitrary 200–500 mL input; 235 mL displays one 235 mL infusion.
- Invalid partial fills such as 300 mL in the 250 mL kyusu show an inline error and disable timer starts until corrected.
- Matcha remains a whisked serving with small presets, separate usucha/koicha recipes and no steep session.
- A gaiwan timer continued while a different vessel was displayed. When it finished, Next steep retained the original gaiwan sequence.
- The vessel editor saved successfully without changing unchanged source attribution. A temporary zisha method was added, verified at the 110 mL working fill, and removed while the other methods remained.
- Drinks have a distinct Preparation block below Ingredients and omit the espresso metric for non-espresso drinks.
- Migration tests preserve customized non-water recipes, replace requested water formulas and add inventory recipes once. A pre-update backup is available in Settings.
- UI JSON export was parsed and retained all 18 teas, 5 waters and nested methods.
- JSON round-trip tests cover the new nested methods, source links, water bases and preparation fields. Ten malformed-data cases are rejected.
- Timer pause/resume/reset/completion/persistence checks pass. All offline asset paths exist.

- Stopped the local HTTP server, reloaded offline, opened Sweet Ya Bao and generated its five-steep 500 mL session successfully.
- Landscape visual check at 1024 × 600 showed accessible timer buttons and no horizontal document overflow.

## Remaining device checks

The physical Android tablet is not connected here. Verify home-screen installation, audible alerts, vibration and wake lock on that device/browser. Browser background suspension can delay audio. External research links need internet, but all recipe values and saved source notes are local.

Run `node tests/core.test.cjs` from the project folder for reproducible logic checks.

## Static deployment release (2026-09-28)

- Core and deployment suites pass: 29 recipes; three-way published/local merge; local deletions and conflicts; root/subfolder cache URLs; scoped old-cache removal; failed-install rejection; explicit update activation; manifest and relative paths.
- Browser: existing installation upgraded, Settings detected a second release, and Update & reload activated it successfully.
- Browser: stopped the static server, reloaded, and opened Robust water with its 2 L / 7 g / 5 g formula intact.
- Browser: fresh /barista/ subfolder installation loaded all recipes and confirmed offline readiness.
- GitHub Pages and Cloudflare deployments have not been published to a real account. Android home-screen installation needs the physical tablet.

## Older-Chromium compatibility release

- Every production JS file (including legacy data, updates and the worker) passes an ES2017 parser; the inline startup guard and compat.js pass ES5. Unsupported syntax/API scanning is part of tests/compatibility.test.cjs.
- Removed optional chaining, nullish coalescing, logical assignment, optional catch bindings, object spread, native deep cloning, at/replaceAll/fromEntries/flatMap/padStart/randomUUID dependencies.
- Compatibility tests simulate each dependency failing, global parse/runtime exceptions, unhandled rejection, stalled script/data requests, late callbacks, missing required features, JSON helpers and FileReader success/failure.
- Browser verification on current Chromium: app startup and water recipe editor/save work; an intentionally invalid timer.js shows the actual parse error, filename and line; a missing storage.js shows a dependency error.
- Hardware limitation: no physical older Android/Chromium is connected. ES2017 parsing and missing-API tests are not equivalent to a full run on the user's tablet.
