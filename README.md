# Forfettix

Free PWA that estimates taxes and INPS contributions for Italian *partita IVA forfettaria* freelancers.

- Live: https://forfy.pages.dev
- Hosting: Cloudflare Pages, deployed automatically from this repository (branch `main`)
- Android: Trusted Web Activity, package `it.controllinghub.forfy` (`.well-known/assetlinks.json`)

## Pagine strumenti e affiliazioni (nov 2026)

- `seo/kit.mjs` genera il **Check-up partita IVA** (`/check-up-partita-iva/`, logica in `assets/checkup.js`) e le guide commercialista online, conto business, RC professionale, apertura partita IVA.
- Link di affiliazione (financeAds: Fiscozen, FlexTax, Qonto, Lokky): incollali in `seo/partner.json` → `url`, poi `node seo/build.mjs`. Senza link le schede restano informative, senza pulsante.
- Nuove pagine SEO: aggiungile anche alla lista `SEO` in `functions/_middleware.js` e in `sw.js`.
