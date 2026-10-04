# Barista — static Android recipe PWA

Start here. Everything is already built: **no build command, npm installation, database, API key, backend, or server process to maintain**. Hosting serves ordinary files over HTTPS. The app has 29 recipes and keeps your settings, favorites, recipe edits, and timer on your device.

**The easiest upload option is Cloudflare Pages (section 2).** GitHub Pages also works, and gives you a convenient website for editing recipes. Choose one host; you do not need both.

## 1. Deploy to GitHub Pages — first-time GitHub users

1. Create an account at [GitHub](https://github.com/) and verify your email.
2. Click **+ → New repository**. A repository is simply your project's online folder. Name it `barista`, choose **Public**, enable **Add a README file**, and click **Create repository**. This publishes the bundled recipes publicly; tablet-only edits are not uploaded.
3. Extract `barista-static-pwa.zip` on your computer. Open the extracted folder: `index.html` should be directly inside it.
4. In your repository, select **Add file → Upload files**. Drag the extracted **contents** (files and folders) into the upload area. Upload neither the ZIP nor an extra enclosing folder. Click **Commit changes** to save.
5. Confirm the repository's first level contains `index.html`, `service-worker.js`, `manifest.json`, and the `data`, `js`, `css`, and `icons` folders. Include `.nojekyll`; if omitted, use **Add file → Create new file**, name it `.nojekyll`, and commit it.
6. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/(root)**. Click **Save**.
7. Wait for deployment. Revisit Pages for **Visit site**. Your address will be `https://YOUR-USERNAME.github.io/barista/`. Use that address, not the github.com repository page.

Official references: [Create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [select its publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 2. Deploy to Cloudflare Pages — no GitHub required

1. Create an account and sign in at [Cloudflare](https://dash.cloudflare.com/).
2. Open **Workers & Pages → Create application**. Choose the **Pages** / **Get started** route, then **Drag and drop your files** (sometimes labeled **Use direct upload**).
3. Enter a project name, such as `my-barista`.
4. Upload **barista-static-pwa.zip** directly. It has `index.html` at its root. Alternatively, upload the extracted folder containing that file.
5. Click **Deploy site** / **Save and Deploy**. Open the production address Cloudflare supplies, usually `https://my-barista.pages.dev/`.

No framework, build command, or output-directory configuration is needed with this direct-upload route. Use **Pages**, not a Worker application. Direct-upload projects cannot later switch to Git integration; that would require a new project. [Official Direct Upload instructions](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## 3. Open on your Android tablet

1. Connect the tablet to Wi-Fi and open **Chrome** in a normal tab, not Incognito.
2. Type the full HTTPS site address from your host into Chrome's address bar.
3. Open **Settings** inside Barista. Wait for **Ready for offline use on this device.** This confirms the full app shell and recipe file have downloaded. Keep the first visit online until this appears.
4. Open a recipe, then turn on airplane mode and reload the page. Recipes, scaling, vessel choices, editing, and timers should still work. External research links need internet.
5. Reconnect when you want to receive updates. Use the same production URL each time; preview addresses and different hosts have separate device storage.

## 4. Install on the Android home screen

While viewing your deployed site in Chrome, open Chrome's **⋮** menu and select **Add to Home screen → Install** (or **Install app**), then confirm. You can also use Barista's **Settings → Install app** when Chrome offers it. Open **Barista** from the home screen afterward. [Google's Android web-app instructions](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en).

If installation is missing, use the HTTPS address in full Chrome, allow the initial load to finish, and check again. A local file opened with `file://` is not installable. The manifest supplies the app name, standalone display, relative start URL/scope, landscape preference, theme colors, and 192/512-pixel icons. Actual installation and tablet behavior still need to be checked on your Android device.

## 5. Edit recipes and redeploy

**The published recipe source is `data/recipes.json`; product metadata and recipe links live in `data/products.json`.** Open it in a plain-text editor. It contains four arrays: `tea`, `coffee`, `water`, and `drinks`. Preserve stable recipe `id` values. JSON requires double quotes and no comments or trailing commas. Tea vessel recommendations live in each tea's `methods` array. When changing the first method, keep its matching top-level tea/water/temp/steeps reference fields consistent.

For example, find `"id": "robust"` in the water array. Its distilled water, buffer, and hardness amounts are 2 L, 7 g, and 5 g. Edit the ingredient amounts as needed; keep the distilled water amount and `baseAmount` equal. Other water recipes and both concentrates are nearby.

For every deployment, including recipe-only changes, also open **service-worker.js** and change its second line to a **new, never-used release value**, for example:

```js
const RELEASE='2026-09-29.1';
```

Change only the value inside the quotes. Next deployment could use `.2`, then `.3`. This release change tells installed tablets to fetch a fresh complete offline copy. **Uploading changed recipes without changing RELEASE will leave existing offline copies unchanged.** Always upload the changed recipe file and service worker together.

### Update through GitHub

1. Keep an extracted project folder on your computer. Make the edits above there.
2. In your GitHub repository, choose **Add file → Upload files**. Drag the updated `data` folder and `service-worker.js` together into the upload area. Preserve the folder structure. Commit them in one upload. For app upgrades, upload all supplied project contents together.
3. Wait for the Pages deployment to finish; the repository's **Actions** tab shows its progress.
4. On the tablet, reconnect, open Barista **Settings → Check for updates**, wait for **A new version is ready**, then tap **Update & reload**. If the host is still deploying, wait and check again.

### Update through Cloudflare

1. Edit your extracted project and change RELEASE as above.
2. In Cloudflare, open the existing Pages project → **Create a new deployment → Production**.
3. Upload the **whole project folder** containing `index.html`, including the updated files. Deploy it. Keep using the existing production URL.
4. On the tablet, use **Settings → Check for updates → Update & reload**.

### What happens to tablet edits?

Published updates replace recipes you have not edited locally. Recipes edited on the tablet, locally created recipes, and local deletions are preserved. If both the file and tablet changed the same recipe, the entire tablet recipe wins. To deliberately replace the tablet collection with your published file, first **Export full backup** as a backup, then **Import JSON** and select your updated `data/recipes.json`; confirm merging the matching IDs. Other recipes and all personal product data are retained. Use a full backup restore only when you intend to replace the complete device collection.

You can also author products and recipes using the app and use **Export catalog**. See CATALOG.md to split its recipes and products into the two published data files; do not save the whole catalog envelope as recipes.json. Tablet edits alone never update your hosted site or another device. Use Export full backup regularly; clearing Chrome site data or browser storage eviction can remove offline files and local edits.

## How offline updates work

The service worker precaches all required HTML, CSS, JavaScript, icons, manifest, and both JSON data files. A failed asset download prevents the new worker from installing, leaving the active release usable. Cached files use paths relative to the app, so both `/` and `/barista/` hosting work. Navigation stays inside one HTML page; no server route rewrites are required.

Each release has its own cache, scoped to this app's URL. A new worker waits until you tap Update & reload or close all app windows. Activation removes older caches belonging to this app. Update checks run when the app returns to the foreground, hourly while visible, and via the Settings button. Service-worker checks bypass the browser HTTP cache. `_headers` adds revalidation headers on Cloudflare; GitHub Pages does not need that file. Save open edits before applying an update. Active timers retain their saved deadline across reloads.

This package introduces the new cache naming scheme; obsolete pre-package `barista-v…` caches are left alone to avoid deleting another app's data on a shared host. They are never read by this worker. Later releases automatically remove this app's superseded caches.

## Files and optional development checks

- `index.html`: entry point. No root-absolute asset URLs.
- `data/recipes.json`: current published recipes.
- `manifest.json`, `service-worker.js`, `icons/`: PWA/offline configuration.
- `js/legacy-data.js`: historical migration reference only; do not edit it for recipe updates.
- `js/`, `css/`: app behavior and appearance.
- `RESEARCH.md`: recipe sources and adaptations.
- `USER_GUIDE.md`: brewing and app usage details.
- `TESTING.md`: verification notes and limitations.

Optional, if Node.js is installed: from this folder run `node tests/core.test.cjs` and `node tests/deployment.test.cjs`, `node tests/compatibility.test.cjs`, and `node tests/library.test.cjs` before uploading. These validate recipes and offline update behavior. Hosting and using the app do not require Node.js.

For local development only, serve this folder with `python -m http.server 8080 --bind 127.0.0.1` and open `http://127.0.0.1:8080/`. This temporary development server is not needed after deployment. Opening a computer's HTTP LAN address on Android does not provide the secure context needed for PWA installation; use the deployed HTTPS site.

## Older Android tablets — compatibility release

Release `2026-09-28.3-compat` uses ES2017 syntax throughout the app and service worker, with an ES5 startup guard. The intended JavaScript baseline is Chromium 55 or newer (native async/await). This is a code-level target, not a claim of testing on your physical tablet. Browsers below that baseline show a compatibility error rather than hanging. No transpiler, CDN, or new runtime dependency is required.

The guard in index.html runs before any external JavaScript. Dependencies load in order; download failures, parse/runtime exceptions, and startup promise rejections produce an on-screen panel with the user agent, error and file. A 30-second watchdog covers stalled scripts and recipe requests. Optional sound, vibration, wake lock, installation prompts and WebMCP are guarded. Import uses FileReader; recipe cloning and object helpers are local. Older grid/dialog implementations have fallbacks.

To deploy this fix, upload the **entire updated package**, including index.html, js/compat.js, all other js files, css/styles.css, and service-worker.js, together. Wait for GitHub Pages to finish. On the tablet, reconnect, close all Barista tabs and installed-app windows, reopen the site, then reload. If the old interface still works, use Settings → Check for updates → Update & reload. If startup still fails, share a photo of the new error panel; it includes the exact browser version. Do not clear site data as a first step: that can erase tablet-only recipe edits.

Run all checks with Node.js 22 or newer:

```sh
node tests/core.test.cjs
node tests/deployment.test.cjs
node tests/compatibility.test.cjs
```

The compatibility test uses Node's bundled Acorn parser in ES2017 mode (relaunching itself with --expose-internals), and ES5 mode for the guard/helpers. It also bans the removed modern syntax/APIs and simulates startup failures and older runtime capabilities. Tests require no package installation.

## Product library, ratings, and Insights

Home now shows Explore your recipes followed by In rotation. Favorites remain in the sidebar. Coffee and tea browsing defaults to In rotation; All and Archived filters reveal past purchases. Reusable recipes remain available without inventory status.

Open a product to rate it on five stars. Tap a whole star, then **½ star** to select a half step; Clear rating returns it to unrated. The rating belongs to the product, across all its brewing recipes. Personal notes save on change and before navigation or a rating tap, with an explicit Save notes button too. Archive hides a coffee/tea from rotation without deleting its history. Put in rotation brings it back. Drinks can be rated but are not stocked or archived. Water is neither rated nor stocked.

**Add product** copies a starting recipe. Only its name is required; metadata is optional. Processing and tea type use dropdowns; roaster/seller, country, region and cultivar use editable suggestions. New values become suggestions automatically; case and extra spaces are normalized against existing choices. **+ Brewing recipe** copies another recipe under the same product. Individual tea vessels remain inside their existing tea recipes.

Insights summarizes coffee, tea and drinks separately. It includes archived products, excludes unrated products, counts each product once, and shows the sample count beside each average. Missing metadata is grouped as Not specified. No chart libraries, servers or external analytics services are used.

Ingredient weights display to 0.1 g; concentrate/mineral additions retain 0.001 g. Calculations and stored quantities retain full precision.

**Settings → Export full backup** includes recipes, products, ratings, personal notes, stock status, favorites, display/vessel settings and saved method choices. Importing a full backup replaces that device's collection after confirmation. The active timer is deliberately not restored from a backup. **Export catalog** omits ratings, personal notes and stock status. Catalog imports (including legacy plain recipe JSON files) merge by stable IDs after a preview instead of replacing the entire collection. Back up before updating existing recipe IDs.

Published changes come through GitHub Pages updates; local notes, ratings and stock status never upload automatically. See [CATALOG.md](CATALOG.md) for the approved-research publishing workflow and file formats.

For researched additions from purchase emails, see [PURCHASES.md](PURCHASES.md). In this project you can ask: "Check my email and add recent purchases to Barista." The workflow prepares a tested review before publication.
