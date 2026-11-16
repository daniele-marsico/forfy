// Genera le pagine SEO statiche di Forfettix: node seo/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://forfettix.controllinghub.com";
const YEAR = 2026;
const TODAY = new Date().toISOString().slice(0, 10);

// Stessi parametri dell'app (index.html, DEF_P): valori 2026 stimati
const P = { sep: 26.07, min: 18808, qa: 4521.36, qc: 4611.6, aa: 24, ac: 24.48 };
const GROUPS = {
  alim: { coef: 40, name: "Industrie alimentari e delle bevande" },
  comm: { coef: 40, name: "Commercio all'ingrosso e al dettaglio" },
  costr: { coef: 86, name: "Costruzioni e attività immobiliari" },
  interm: { coef: 62, name: "Intermediari del commercio" },
  allog: { coef: 40, name: "Alloggio e ristorazione" },
  prof: { coef: 78, name: "Attività professionali, scientifiche, tecniche, istruzione" },
  altre: { coef: 67, name: "Altre attività economiche" },
};
const GEST = { separata: "Gestione separata INPS", artigiani: "Gestione artigiani INPS", commercianti: "Gestione commercianti INPS" };

const prof = JSON.parse(readFileSync(join(ROOT, "seo/professioni.json"), "utf8"));
const partners = JSON.parse(readFileSync(join(ROOT, "seo/partner.json"), "utf8")).partner.filter(p => p.url);

const eur = n => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" }).format(Math.round(n));
const pct = n => String(n).replace(".", ",") + "%";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function calc(F, coef, gest, ali = 15) {
  const R = F * coef / 100;
  let inps;
  if (gest === "separata") inps = R * P.sep / 100;
  else { const q = gest === "artigiani" ? P.qa : P.qc, a = gest === "artigiani" ? P.aa : P.ac; inps = q + Math.max(0, R - P.min) * a / 100; }
  const imp = Math.max(0, R - inps), tax = imp * ali / 100;
  return { R, inps, imp, tax, net: F - inps - tax };
}

function partnerBlock() {
  if (!partners.length) return "";
  return `<section class="card partners"><h2>Strumenti utili per la tua partita IVA</h2><p class="muted small">Link di affiliazione: se ti iscrivi, Forfettix può ricevere una commissione, senza costi in più per te.</p><ul>${partners.map(p => `<li><a href="${esc(p.url)}" rel="sponsored noopener" target="_blank"><b>${esc(p.nome)}</b> · <span class="muted">${esc(p.cat)}</span></a><span>${esc(p.testo)}</span></li>`).join("")}</ul></section>`;
}

function shell({ title, desc, path, body, jsonld }) {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${BASE}${path}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${BASE}${path}"><meta property="og:locale" content="it_IT">
<meta name="theme-color" content="#0d6e57">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="stylesheet" href="/assets/guida.css">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>
<body>
<header class="top"><a class="brand" href="/">Forfetti<span>x</span></a><nav><a href="/tasse-forfettario/">Guide per professione</a><a class="btn sm" href="/">Apri l'app</a></nav></header>
<main>
${body}
<p class="disc">Stima indicativa con valori ${YEAR} (imposta sostitutiva, coefficienti, aliquote e quote INPS): non è consulenza fiscale. I codici ATECO sono esempi: verifica il tuo nel certificato di attribuzione della partita IVA e chiedi conferma al tuo commercialista.</p>
</main>
<footer><a href="/">Forfettix</a> · <a href="/tasse-forfettario/">Tasse forfettario per professione</a> · <a href="/privacy.html">Privacy</a> · realizzato da <a href="https://controllinghub.com">ControllingHub</a></footer>
<script src="/assets/calc.js" defer></script>
</body>
</html>
`;
}

function page(x) {
  const g = GROUPS[x.grp], coef = g.coef, sep = x.gest === "separata";
  const ex = [20000, 40000, 60000].map(F => ({ F, ...calc(F, coef, x.gest) }));
  const e30 = calc(30000, coef, x.gest), e30n = calc(30000, coef, x.gest, 5);
  const path = `/tasse-forfettario/${x.slug}/`;
  const title = `Tasse ${x.nome} in regime forfettario ${YEAR}: calcolo ed esempi`;
  const desc = `Quanto paga di tasse e INPS un ${x.nome} forfettario: coefficiente ${coef}%, ${GEST[x.gest].replace("Gestione","gestione")}, esempi su 20, 40 e 60 mila euro e calcolatore gratuito.`;
  const inpsTxt = sep
    ? `Come ${x.nome} di solito ti iscrivi alla <b>gestione separata INPS</b>: paghi il ${pct(P.sep)} sul reddito forfettario, senza quote minime. Se non incassi, non versi contributi.`
    : `Come ${x.nome} di solito ti iscrivi alla <b>${GEST[x.gest].replace("Gestione","gestione")}</b>: c'è una <b>quota fissa di circa ${eur(x.gest === "artigiani" ? P.qa : P.qc)} l'anno</b> che paghi anche se incassi poco, più il ${pct(x.gest === "artigiani" ? P.aa : P.ac)} sulla parte di reddito oltre ${eur(P.min)}. Da forfettario puoi chiedere all'INPS la riduzione del 35%.`;
  const related = prof.filter(y => y.slug !== x.slug && (y.grp === x.grp || y.gest === x.gest)).slice(0, 6);
  const faq = [
    [`Che coefficiente di redditività ha un ${x.nome} forfettario?`, `Con un codice ATECO come ${x.ateco} (${x.atecoDesc}) il coefficiente è il ${coef}%: le tasse si calcolano solo sul ${coef}% di quello che incassi, il resto è considerato spesa forfettaria.`],
    [`Quanto resta netto a un ${x.nome} che incassa 30.000 € l'anno?`, `Con l'imposta al 15% restano circa ${eur(e30.net)}: ${eur(e30.inps)} di contributi INPS e ${eur(e30.tax)} di imposta sostitutiva. Con l'imposta al 5% dei primi cinque anni il netto sale a circa ${eur(e30n.net)}.`],
    [`Quale gestione INPS paga un ${x.nome}?`, sep ? `Di solito la gestione separata, con il ${pct(P.sep)} sul reddito forfettario e nessun minimo da pagare.` : `Di solito la ${GEST[x.gest].replace("Gestione","gestione")}, con una quota fissa annua anche a reddito basso e una percentuale sul reddito oltre il minimale.`],
    [`Qual è il limite di incassi per restare forfettario?`, `85.000 € l'anno. Se li superi, dall'anno dopo passi al regime ordinario; se superi 100.000 € esci subito, già nell'anno in corso.`],
  ];
  const body = `
<nav class="crumbs"><a href="/">Forfettix</a> › <a href="/tasse-forfettario/">Tasse forfettario</a> › ${esc(x.titolo)}</nav>
<h1>Tasse ${esc(x.nome)} in regime forfettario: quanto si paga nel ${YEAR}</h1>
<p class="lead">Se lavori come ${esc(x.nome)} con clienti come ${esc(x.clienti)}, nel forfettario le tasse dipendono da tre cose: quanto incassi, il <b>coefficiente di redditività del ${coef}%</b> e la gestione INPS. Qui trovi il calcolo già impostato per la tua attività.</p>

<section class="card calc" data-coef="${coef}" data-gest="${x.gest}">
  <h2>Calcola le tue tasse</h2>
  <label for="f-inc">Incassi dell'anno (€)</label>
  <input id="f-inc" inputmode="decimal" value="30.000" autocomplete="off">
  <label class="chk"><input type="checkbox" id="f-new"> Nuova attività: imposta al 5% per i primi 5 anni</label>
  ${sep ? "" : `<label class="chk"><input type="checkbox" id="f-sgr"> Riduzione contributiva del 35%</label>`}
  <dl class="res">
    <dt>Reddito forfettario (${coef}%)</dt><dd id="o-red">–</dd>
    <dt>Contributi INPS</dt><dd id="o-inps">–</dd>
    <dt>Imposta sostitutiva</dt><dd id="o-tax">–</dd>
    <dt class="tot">Netto stimato</dt><dd class="tot" id="o-net">–</dd>
  </dl>
  <p class="muted small" id="o-msg"></p>
  <a class="btn" href="/?source=guida-${x.slug}">Tieni traccia degli incassi con Forfettix</a>
  <p class="muted small center">Gratis, senza registrazione: i dati restano sul tuo telefono.</p>
</section>

<h2>Codice ATECO e coefficiente</h2>
<p>Un codice ATECO tipico per questa attività è <b>${esc(x.ateco)}</b> (${esc(x.atecoDesc)}), che rientra nel gruppo «${esc(g.name)}» con coefficiente <b>${coef}%</b>. Vuol dire che su 10.000 € incassati le tasse si calcolano su ${eur(100 * coef)}.</p>

<h2>Contributi INPS</h2>
<p>${inpsTxt}</p>
${x.nota ? `<p class="note">${esc(x.nota)}</p>` : ""}

<h2>Esempi di calcolo</h2>
<div class="tbl"><table>
<thead><tr><th>Incassi</th><th>Reddito ${coef}%</th><th>INPS</th><th>Imposta 15%</th><th>Netto</th></tr></thead>
<tbody>${ex.map(r => `<tr><td>${eur(r.F)}</td><td>${eur(r.R)}</td><td>${eur(r.inps)}</td><td>${eur(r.tax)}</td><td><b>${eur(r.net)}</b></td></tr>`).join("")}</tbody>
</table></div>
<p>In pratica, su ogni 100 € che incassi come ${esc(x.nome)} conviene mettere da parte circa <b>${eur((e30.inps + e30.tax) / 300)}</b> per tasse e contributi (calcolo su 30.000 € di incassi).</p>

<h2>Il tetto degli 85.000 €</h2>
<p>Il forfettario vale finché gli incassi dell'anno restano entro 85.000 €. Conviene controllare l'andamento durante l'anno, non a dicembre: Forfettix ti mostra quanto manca alla soglia ogni volta che registri un incasso.</p>

${partnerBlock()}

<h2>Domande frequenti</h2>
${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}

<h2>Altre professioni</h2>
<ul class="links">${related.map(y => `<li><a href="/tasse-forfettario/${y.slug}/">Tasse ${esc(y.nome)} forfettario</a></li>`).join("")}</ul>
`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forfettix", item: BASE + "/" },
      { "@type": "ListItem", position: 2, name: "Tasse forfettario", item: BASE + "/tasse-forfettario/" },
      { "@type": "ListItem", position: 3, name: x.titolo, item: BASE + path } ] },
  ];
  return { path, html: shell({ title, desc, path, body, jsonld }) };
}

function hub() {
  const path = "/tasse-forfettario/";
  const byG = {};
  prof.forEach(x => (byG[x.gest] ||= []).push(x));
  const body = `
<h1>Tasse in regime forfettario ${YEAR}: calcolo per professione</h1>
<p class="lead">Scegli la tua attività: trovi coefficiente di redditività, gestione INPS, esempi su 20, 40 e 60 mila euro e un calcolatore già impostato.</p>
${Object.entries(byG).map(([k, list]) => `<h2>${GEST[k]}</h2><ul class="grid">${list.map(x => `<li><a href="/tasse-forfettario/${x.slug}/"><b>${esc(x.titolo)}</b><span>Coefficiente ${GROUPS[x.grp].coef}%</span></a></li>`).join("")}</ul>`).join("\n")}
<section class="card"><h2>Come si calcolano le tasse nel forfettario</h2>
<ol><li>Incassi × coefficiente di redditività = reddito forfettario.</li><li>Dal reddito togli i contributi INPS versati.</li><li>Sul resto paghi l'imposta sostitutiva: 15%, oppure 5% per i primi cinque anni se hai i requisiti.</li></ol>
<a class="btn" href="/?source=guida-hub">Calcola con Forfettix</a></section>
${partnerBlock()}
`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Tasse forfettario per professione", url: BASE + path }];
  return { path, html: shell({ title: `Tasse forfettario ${YEAR} per professione: calcolo ed esempi | Forfettix`, desc: `Calcolo di tasse e contributi INPS nel regime forfettario ${YEAR} per ${prof.length} professioni: coefficienti, esempi e calcolatore gratuito.`, path, body, jsonld }) };
}

// Scrittura
const outDir = join(ROOT, "tasse-forfettario");
if (existsSync(outDir)) rmSync(outDir, { recursive: true });
const pages = [hub(), ...prof.map(page)];
for (const p of pages) { const f = join(ROOT, p.path, "index.html"); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, p.html); }

const urls = ["/", ...pages.map(p => p.path)];
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${BASE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Generate ${pages.length} pagine, partner attivi: ${partners.length}`);
