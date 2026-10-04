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

## Product library release (2026-09-29)

- Core, deployment, compatibility, and library suites pass. All production scripts still parse as ES2017; startup and compatibility helpers remain ES5.
- Library tests cover 13 migrated inventory teas plus 3 drinks; null/half-star ratings; archived items in analytics; one vote per product across recipes; metadata updates isolated from personal data; invalid product references; merging and deduplicating imports; full backups and the recovery journal; display precision.
- Browser at 1024 × 600: Explore precedes In rotation, with no home favorites; favorites remain in navigation. Rated a tea 4.5, saved notes, archived it, and verified the Archived filter and Insights included it.
- Created a test coffee from V60 and added espresso; the second recipe retained the same product rating. Full backup export contained the rating, notes and archive status; restored it through the real file chooser and confirmation UI successfully.
- Test products and personal scores exist only in the local QA browser, not in published JSON. No physical Decent tablet is attached for hardware verification.

## Purchase workflow validation (2026-10-04)

All six Node test suites pass. The new catalog-update suite verifies six product identities, official metric brewing parameters, repeat application without duplication, preservation of existing recipes, rejection of personal-data fields, and invalid recipe references. The project skill passes the standard skill validator. Both purchase batches were approved. Browser verification at 1024 × 600 confirmed the prominent water recommendation, its working link, and saving the editable infusion guidance. Guidance does not change session planning or timers. No physical Android tablet is attached.
## Brewing methods release (2026-10-04)

- All six Node suites pass, including ES2017/ES5 parsing, published/local merge, offline caches, and the new assertions for all seven approved Hibiki-an glass recipes.
- Verified glass genmaicha scales 4 g / 250 mL to 8 g / 500 mL with the same 120-second timer. Kyusu retains 9.375 g across two 250 mL pours, with cumulative 500 mL.
- Tests cover method guidance overriding legacy shared text, advisory ranges without changing the plan, invalid ranges, and JSON round trips.
- Browser at 1024 × 600 upgraded through Settings → Update & reload. Confirmed method switching, western guidance, kyusu repeated pours, saving blank optional count fields, and isolation of edited glass guidance from kyusu guidance. No physical older Android tablet is connected.
