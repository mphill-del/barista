# Add purchases from email

In this Barista project, ask:

> Check my email and add recent purchases to Barista.

For a narrower run, name the sellers or date range. Gmail must be connected. The project skill `barista-purchases` handles extraction, official-source research, catalog preparation and tests. You review the concrete additions before they are committed and pushed. No mailbox labels, messages, or read status need to be changed.

Only public product facts go to GitHub. Keep raw emails, addresses, order IDs, tracking links, account links, payment information and personal backups out of the repository. Research links are public product/brewing pages. Supplier ratings are never copied into your personal rating.

## What happens on each run

1. Search the requested window (default seven days), inspect actual order confirmations, and paginate when needed. Read relevant message bodies; a marketing mention is not a purchase. Distinguish cancellations and shipping updates. Exclude equipment.
2. Resolve bundles into named products from official sources. Report ambiguity rather than guessing. Compare seller, normalized product name, and meaningful lot identity to the existing catalog. Reuse stable IDs for repeat purchases.
3. Prepare a public-only `barista-catalog` patch and short review in `catalog-drafts/`. Record recipe sources and identify vendor instructions versus adaptations. Unknown metadata stays blank. Review spoon-to-gram conversions rather than inventing density.
4. Validate/preview with `node scripts/catalog-update.cjs catalog-drafts/<file>.json`. Use `--apply` to stage the validated changes in the two local data files. This never commits or pushes. Check the diff for private data; automated schema checks cannot detect private text hidden inside ordinary notes.
5. Bump `RELEASE` in `service-worker.js`. Run every `tests/*.test.cjs` with Node, including `compatibility.test.cjs`. A repeat run of the same patch must be unchanged. Old Chromium compatibility and static/offline hosting remain requirements.
6. Present the products, important adaptations and test results. After approval, commit only reviewed files and push the current branch normally. Never force-push. Confirm the remote commit and deployed catalog before calling the update live; Pages can lag behind the push.

The current app keeps rating, personal notes and rotation/archive state on each device. An existing archived purchase needs **Put in rotation** on the tablet. GitHub publication does not reactivate it. A new coffee/tea starts in rotation; drinks can be rated but do not appear in tea inventory.

There is no backend, polling process, Gmail code or new dependency on the tablet. This workflow runs here when requested. No scheduled automation is required. Source pages require internet for research; saved recipes continue to work offline.

The first tested patch and review are in `catalog-drafts/2026-10-04.json` and `catalog-drafts/2026-10-04-review.md`. Catalog structure and local-data behavior are documented in [CATALOG.md](CATALOG.md).

The second test uses `catalog-drafts/2026-10-04-tim-wendelboe.json` and its review document: six coffees, shipment deduplication, mixed cultivars, and explicit separation of researched facts from house brew settings.

## Water and infusion guidance

Every new brew recipe gets a house waterProfile: matcha-water means Soft, delicate means Delicate, robust means Robust. Use Soft for matcha and very delicate Japanese greens; Delicate for white/green teas, botanical blends and floral coffees; Robust for black tea, chai and fuller-bodied coffees. These are taste-based starting points for the owner's concentrate recipes, not equivalent to a vendor's generic soft/hard water terminology. State the choice as a house recommendation, and adjust for the individual product when justified. Never use a concentrate itself as a brew-water profile.

Tea recipes may include editable infusionGuidance text. Count total infusions including the first and distinguish long western infusions from short gongfu infusions. Prefer verified instructions; otherwise label a rule of thumb. Matcha is consumed once rather than reinfused. Typical starting estimates: Japanese greens 2–3; white tea 2–3 western or 5–8 short gongfu; black tea 1–2 western or 3–5 short gongfu; fruit/botanical blends generally one. These do not cap or extend the timer schedule. Existing recipes without the field show a type/vessel-based fallback; unknown types say not specified.
