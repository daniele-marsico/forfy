# Forfettix

Free PWA that estimates taxes and INPS contributions for Italian *partita IVA forfettaria* freelancers.

- Live: https://forfy.pages.dev
- Hosting: Cloudflare Pages, deployed automatically from this repository (branch `main`)
- Android: app nativa Capacitor (cartella `app/`, sito incluso, niente Chrome), package `it.controllinghub.forfy`. Ogni build va nel test interno e nei test chiusi attivi (`.github/workflows/android.yml`); a mano: Actions → "Play Store - porta build nel test chiuso"

## Pagine strumenti e affiliazioni (nov 2026)

- `seo/kit.mjs` genera il **Check-up partita IVA** (`/check-up-partita-iva/`, logica in `assets/checkup.js`) e le guide commercialista online, conto business, RC professionale, apertura partita IVA.
- Link di affiliazione (financeAds: Fiscozen, FlexTax, Qonto, Lokky): incollali in `seo/partner.json` → `url`, poi `node seo/build.mjs`. Senza link le schede restano informative, senza pulsante.
- Nuove pagine SEO: aggiungile anche alla lista `SEO` in `functions/_middleware.js` e in `sw.js`.

## Prestazione occasionale (nov 2026)

- `seo/occasionale.mjs` genera `/ricevuta-prestazione-occasionale/` (generatore di ricevuta: logica in `assets/ricevuta.js`, stampa/PDF in `assets/ricevuta.css`, dati solo nel browser) e `/prestazione-occasionale-o-partita-iva/` (confronto, `assets/occasionale.js`).
- Valori in `RIF` (ritenuta 20%, bollo oltre 77,47 €, franchigia INPS 5.000 €, gestione separata 33,72% / 24%, IRPEF 23-33-43%, limite dipendenti 35.000 €): aggiornarli ogni anno dopo la circolare INPS di febbraio e la legge di bilancio.

## Manovra 2027 (forfettario a 100.000 €)

- App: interruttore «Simula le regole 2027» (Attività) e riquadro in Riepilogo; `?sim=2027` lo attiva da link. Soglie in `index.html` (`FLAT27`, `USCITA27`).
- Pagina SEO `/forfettario-100000-euro-2027/` generata da `seo/soglia2027.mjs`, calcolatore in `assets/soglia2027.js`.
- Quando la legge di bilancio è definitiva: aggiornare `STATO`/`AGGIORNATO` e i condizionali nella pagina, e rendere la simulazione la regola predefinita nell'app.
