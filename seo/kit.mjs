// Check-up partita IVA + guide "strumenti" (commercialista, conto, RC, apertura) di Forfettix.
// Generate da build.mjs: i pulsanti partner compaiono solo quando in partner.json c'è il link di tracciamento.

export const KIT_PATHS = [
  "/check-up-partita-iva/",
  "/commercialista-online-forfettario/",
  "/conto-business-partita-iva/",
  "/assicurazione-rc-professionale-freelance/",
  "/aprire-partita-iva-forfettaria/",
];

export function kitPages({ shell, esc, eur, calc, P, BASE, allPartners, track, verificati }) {
  const byId = Object.fromEntries(allPartners.map(p => [p.id, p]));
  const pct = n => String(n).replace(".", ",") + "%";

  // Scheda partner: informazione sempre, pulsante e promo solo con link
  const card = (id, src = "guida", extra = "") => {
    const p = byId[id];
    if (!p) return "";
    return `<div class="pcard"><div class="ph"><b>${esc(p.nome)}</b><span class="tag">${esc(p.etichetta)}</span></div>
<p>${esc(p.testo)}</p>${p.prezzo ? `<p class="small muted">Prezzo: ${esc(p.prezzo)}</p>` : ""}${extra}
${p.url && p.promo ? `<p class="promo">${esc(p.promo)}</p>` : ""}${p.url ? `<a class="btn" href="${esc(track(p.url, src))}" rel="sponsored noopener" target="_blank">Vai a ${esc(p.nome)}</a>` : ""}</div>`;
  };
  const disclosure = ids => ids.some(id => byId[id] && byId[id].url)
    ? `<p class="muted small">Alcuni link sono di affiliazione: se ti iscrivi, Forfettix può ricevere una commissione, senza costi in più per te. Non cambia il prezzo né l'ordine in cui presentiamo i servizi.</p>` : "";
  const ver = `<p class="muted small">Prezzi verificati sui siti ufficiali il ${esc(verificati)}. Possono cambiare: controllali prima di sottoscrivere.</p>`;
  const ctaCheck = src => `<section class="card cta-check"><h2>Non sai da dove partire?</h2><p>Rispondi a 5 domande e scopri cosa ti manca: commercialista, conto, assicurazione e agevolazioni.</p><a class="btn" href="/check-up-partita-iva/?source=${src}">Fai il check-up gratuito (60 secondi)</a></section>`;
  const faqLd = faq => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  const crumbsLd = (name, path) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Forfettix", item: BASE + "/" },
    { "@type": "ListItem", position: 2, name, item: BASE + path } ] });
  const faqHtml = faq => `<h2>Domande frequenti</h2>\n${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}`;
  const crumbs = t => `<nav class="crumbs"><a href="/">Forfettix</a> › ${esc(t)}</nav>`;
  const others = self => `<h2>Altre guide utili</h2><ul class="links">${[
    ["/check-up-partita-iva/", "Check-up partita IVA"],
    ["/aprire-partita-iva-forfettaria/", "Aprire partita IVA forfettaria"],
    ["/commercialista-online-forfettario/", "Commercialista online: prezzi"],
    ["/conto-business-partita-iva/", "Conto business per forfettari"],
    ["/assicurazione-rc-professionale-freelance/", "RC professionale per freelance"],
    ["/tasse-forfettario/", "Tasse per professione"],
  ].filter(([u]) => u !== self).map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join("")}</ul>`;

  const fz = byId.fiscozen, fx = byId.flextax;
  const pages = [];

  // 1) CHECK-UP
  {
    const path = "/check-up-partita-iva/";
    const cfg = {
      p: Object.fromEntries(allPartners.map(p => [p.id, { nome: p.nome, url: p.url || "", promo: p.url ? p.promo : "", prof: p.anno_prof || 0, art: p.anno_art || 0 }])),
      sep: P.sep, qa: P.qa, qc: P.qc,
    };
    const q = (n, key, title, opts, extra = "") => `<fieldset class="step" data-step="${n}" data-key="${key}"${n > 1 ? " hidden" : ""}>
<legend><span class="muted small">Domanda ${n} di 5</span>${esc(title)}</legend>
${opts.map(([v, t, s]) => `<button type="button" class="opt" data-v="${v}"><b>${esc(t)}</b>${s ? `<span>${esc(s)}</span>` : ""}</button>`).join("\n")}${extra}
</fieldset>`;
    const body = `
${crumbs("Check-up partita IVA")}
<h1>Check-up partita IVA forfettaria: cosa ti manca davvero?</h1>
<p class="lead">5 domande, 60 secondi, nessuna registrazione. Alla fine ricevi il tuo kit: chi ti segue per le tasse, il conto, l'assicurazione e le agevolazioni che rischi di perdere.</p>

<form class="card quiz" id="quiz" onsubmit="return false">
<div class="bar" aria-hidden="true"><i id="q-bar"></i></div>
${q(1, "fase", "A che punto sei con la partita IVA?", [
  ["apre", "Devo ancora aprirla", "Sto valutando o sto per aprire"],
  ["nuova", "Aperta da meno di 5 anni", ""],
  ["vecchia", "Aperta da 5 anni o più", ""]])}
${q(2, "tipo", "Che lavoro fai?", [
  ["prof", "Professionista senza albo", "Consulente, sviluppatore, grafico, formatore, copywriter…"],
  ["albo", "Professionista iscritto a un albo", "Ingegnere, architetto, avvocato, psicologo…"],
  ["art", "Artigiano, commerciante o e-commerce", "Iscritto alla Camera di Commercio"]])}
${q(3, "tasse", "Chi ti segue per tasse e dichiarazione?", [
  ["solo", "Faccio da solo", ""],
  ["trad", "Commercialista tradizionale o CAF", ""],
  ["online", "Un servizio online", ""],
  ["nessuno", "Nessuno, devo ancora decidere", ""]],
  `<div class="cost" id="q-cost" hidden><label for="q-eur">Quanto paghi in un anno? (facoltativo)</label><input id="q-eur" inputmode="decimal" placeholder="es. 800" autocomplete="off"><button type="button" class="btn" id="q-cost-ok">Avanti</button></div>`)}
${q(4, "conto", "Dove ricevi i pagamenti dei clienti?", [
  ["pers", "Sul mio conto personale", ""],
  ["biz", "Su un conto business", ""],
  ["ancora", "Non ho ancora clienti", ""]])}
${q(5, "rc", "Hai un'assicurazione RC professionale?", [
  ["si", "Sì", ""],
  ["no", "No", ""],
  ["boh", "Non so se mi serve", ""]])}
<button type="button" class="back" id="q-back" hidden>‹ Indietro</button>
</form>

<div id="res" hidden></div>

<section class="card" id="how">
<h2>Cosa controlla il check-up</h2>
<ol>
<li><b>Tasse e dichiarazione:</b> se fare da soli, restare dal commercialista o passare a un servizio online, con il confronto dei prezzi.</li>
<li><b>Conto:</b> se separare gli incassi di lavoro da quelli personali e come mettere da parte le tasse in automatico.</li>
<li><b>Assicurazione:</b> quando la RC professionale è obbligatoria e quando conviene comunque.</li>
<li><b>Agevolazioni:</b> l'imposta al 5% per i primi anni, la riduzione INPS del 35% per artigiani e commercianti, la trappola del secondo anno.</li>
</ol>
<p class="muted small">Le risposte restano nel tuo browser: non le salviamo e non chiediamo email o telefono.</p>
</section>
${others(path)}
<script type="application/json" id="cfg">${JSON.stringify(cfg).replace(/</g, "\\u003c")}</script>
<script src="/assets/checkup.js" defer></script>
`;
    pages.push({ path, html: shell({ title: "Check-up partita IVA forfettaria gratis: cosa ti manca in 60 secondi | Forfettix", desc: "5 domande per sapere se hai tutto: commercialista, conto business, RC professionale e agevolazioni (imposta al 5%, riduzione INPS). Gratis e senza registrazione.", path, body, jsonld: [crumbsLd("Check-up partita IVA", path), { "@context": "https://schema.org", "@type": "WebApplication", name: "Check-up partita IVA Forfettix", url: BASE + path, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } }] }) });
  }

  // 2) COMMERCIALISTA ONLINE
  {
    const path = "/commercialista-online-forfettario/";
    const rows = [20000, 40000, 60000].map(F => `<tr><td>${eur(F)}</td><td>${pct((fx.anno_prof / F * 100).toFixed(1))}</td><td>${pct((fz.anno_prof / F * 100).toFixed(1))}</td></tr>`).join("");
    const faq = [
      ["Quanto costa un commercialista per il regime forfettario?", `Online si parte da ${fx.anno_prof} € l'anno IVA inclusa (FlexTax, professionisti) fino a ${fz.anno_art} € (Fiscozen, artigiani e commercianti). Uno studio tradizionale fa prezzi molto diversi da città a città: chiedi sempre un preventivo scritto con cosa è incluso.`],
      ["Posso fare la dichiarazione da solo nel forfettario?", "Sì, si può: la dichiarazione dei forfettari si fa con il quadro LM del modello Redditi. Gli errori più frequenti sono su acconti, contributi INPS e codice ATECO, quindi se scegli il fai da te usa almeno un simulatore e fai controllare il primo anno."],
      ["Il commercialista online apre anche la partita IVA?", "Fiscozen include l'apertura della partita IVA nell'abbonamento per i professionisti (l'apertura di una ditta individuale è a parte). Con il piano Plus di FlexTax ti seguono dall'apertura alla dichiarazione."],
      ["Il costo del commercialista si scarica nel forfettario?", "No. Nel forfettario le spese non si deducono una per una: il coefficiente di redditività le considera già in modo forfettario. Si deducono solo i contributi previdenziali versati."],
    ];
    const body = `
${crumbs("Commercialista online")}
<h1>Commercialista online per forfettari: Fiscozen e FlexTax a confronto</h1>
<p class="lead">Da forfettario il commercialista ti serve soprattutto per tre cose: la dichiarazione dei redditi, gli F24 di imposta e contributi, e qualche consiglio su ATECO e INPS. Online costa da ${fx.anno_prof} a ${fz.anno_art} € l'anno. Ecco cosa cambia.</p>

<div class="tbl"><table class="cmp">
<thead><tr><th></th><th>FlexTax</th><th>Fiscozen</th></tr></thead>
<tbody>
<tr><td>Professionisti</td><td>${fx.anno_prof} €/anno</td><td>da ${fz.anno_prof} €/anno o 49,90 €/mese</td></tr>
<tr><td>Artigiani e commercianti</td><td>${fx.anno_art} €/anno</td><td>da ${fz.anno_art} €/anno o 59,90 €/mese</td></tr>
<tr><td>Piano gratuito</td><td>Sì, Freemium (simulatori e ticket di assistenza)</td><td>No</td></tr>
<tr><td>Apertura partita IVA</td><td>Seguita con il piano Plus</td><td>Inclusa per i professionisti</td></tr>
<tr><td>Dichiarazione e F24</td><td>Inclusi nel Plus</td><td>Inclusi</td></tr>
<tr><td>Fatture elettroniche</td><td>Gestionale incluso nel Plus</td><td>App inclusa</td></tr>
<tr><td>Garanzia</td><td>Soddisfatti o rimborsati entro 60 giorni</td><td>Contratto di 12 mesi</td></tr>
</tbody></table></div>
<p class="muted small">IVA inclusa. Fiscozen: listino ufficiale per il regime forfettario. FlexTax: prezzi ufficiali 2026.</p>
${ver}

<h2>Quanto pesa sul tuo netto</h2>
<p>Il costo del commercialista non si deduce nel forfettario, quindi conviene guardarlo in percentuale su quello che incassi (professionisti):</p>
<div class="tbl"><table><thead><tr><th>Incassi annui</th><th>FlexTax</th><th>Fiscozen</th></tr></thead><tbody>${rows}</tbody></table></div>

<h2>Quale scegliere</h2>
<ul>
<li><b>Vuoi spendere meno o iniziare gratis:</b> FlexTax. Con il Freemium provi simulatori e assistenza senza carta di credito, poi passi al Plus quando arrivano i primi incassi.</li>
<li><b>Vuoi un commercialista dedicato e tutto in un solo abbonamento:</b> Fiscozen, più caro ma con l'apertura della partita IVA già compresa per i professionisti${fz.url && fz.promo ? ", e dal nostro link hai <b>50 € di sconto sulla consulenza</b>" : ""}.</li>
<li><b>Hai già un commercialista e spendi meno di ${fx.anno_prof} € l'anno:</b> resta dove sei. Cambiare conviene solo se risparmi davvero o se oggi non ti segue.</li>
<li><b>Fai da te:</b> possibile, ma tieni conto del tempo e del rischio di sbagliare acconti e contributi. Usa almeno <a href="/">il calcolatore di Forfettix</a> per sapere quanto mettere da parte.</li>
</ul>

<section class="pgrid">${card("flextax", "commercialista")}${card("fiscozen", "commercialista")}</section>
${disclosure(["flextax", "fiscozen"])}
${ctaCheck("commercialista")}
${faqHtml(faq)}
${others(path)}
`;
    pages.push({ path, html: shell({ title: "Commercialista online per forfettari: Fiscozen vs FlexTax, prezzi 2026-2027 | Forfettix", desc: `Quanto costa il commercialista online per la partita IVA forfettaria: FlexTax da ${fx.anno_prof} €, Fiscozen da ${fz.anno_prof} € l'anno. Cosa è incluso, piano gratuito, apertura P.IVA e quale scegliere.`, path, body, jsonld: [faqLd(faq), crumbsLd("Commercialista online", path)] }) });
  }

  // 3) CONTO BUSINESS
  {
    const path = "/conto-business-partita-iva/";
    const e = calc(30000, 78, "separata");
    const per100 = eur((e.inps + e.tax) / 300);
    const faq = [
      ["Il conto business è obbligatorio per la partita IVA forfettaria?", "No. Per ditte individuali e professionisti in forfettario non c'è l'obbligo di un conto dedicato: un vecchio obbligo per i professionisti, introdotto nel 2006, è stato abolito nel 2008. Puoi usare anche il conto personale."],
      ["Allora perché aprire un conto separato?", "Perché tenere separati incassi di lavoro e spese personali ti fa vedere subito quanto hai davvero guadagnato e quanto devi mettere da parte per tasse e contributi. Al commercialista basta l'estratto conto di lavoro, senza spulciare le spese di casa."],
      ["Quanto costa un conto business online?", "Qonto parte da 9 € al mese + IVA con il piano annuale, con il primo mese di prova gratuito. Prima di scegliere guarda canone, bonifici inclusi e se puoi pagare gli F24 dall'app."],
      ["Il canone del conto si scarica nel forfettario?", "No: nel forfettario le spese non si deducono una per una, sono già comprese nel coefficiente di redditività."],
    ];
    const body = `
${crumbs("Conto business")}
<h1>Conto business per partita IVA forfettaria: serve davvero?</h1>
<p class="lead">Risposta breve: <b>non è obbligatorio</b>. Ma per un forfettario il conto separato è il modo più semplice per non spendere i soldi delle tasse. Ecco quando conviene e cosa guardare.</p>

<h2>Il metodo dei due conti</h2>
<p>Il problema più comune dei forfettari non è calcolare le tasse, è <b>averle in banca a giugno</b>. Con un conto business che ha i sotto-conti il metodo è semplice:</p>
<ol>
<li>Ogni incasso arriva sul conto di lavoro.</li>
<li>Apri <a href="/">Forfettix</a> e guarda la riga «Ogni 100 € incassati: … da parte». Per un professionista con coefficiente 78% e 30.000 € di incassi sono circa <b>${per100}</b> ogni 100 €.</li>
<li>Sposta subito quella cifra in un sotto-conto «Tasse». Il resto è tuo.</li>
</ol>
<p>A giugno e novembre, quando arrivano gli F24, i soldi sono già lì.</p>

<h2>Cosa guardare prima di aprirlo</h2>
<ul>
<li><b>Canone mensile</b> e se cambia con il pagamento annuale.</li>
<li><b>Bonifici inclusi</b> al mese: per un freelance ne bastano pochi.</li>
<li><b>Pagamento F24</b> direttamente dall'app.</li>
<li><b>Sotto-conti</b> per accantonare le tasse.</li>
<li><b>IBAN italiano</b>, più semplice per clienti e addebiti.</li>
<li><b>Fatturazione elettronica</b> inclusa, se non usi già un altro software.</li>
</ul>

<section class="pgrid">${card("qonto", "conto")}${card("finom", "conto")}</section>
${disclosure(["qonto", "finom"])}
${ver}
${ctaCheck("conto")}
${faqHtml(faq)}
${others(path)}
`;
    pages.push({ path, html: shell({ title: "Conto business per partita IVA forfettaria: è obbligatorio? Costi e consigli | Forfettix", desc: "Il conto dedicato non è obbligatorio per i forfettari, ma ti evita di spendere i soldi delle tasse. Il metodo dei due conti, cosa guardare e quanto costa (Qonto da 9 €/mese + IVA).", path, body, jsonld: [faqLd(faq), crumbsLd("Conto business", path)] }) });
  }

  // 4) RC PROFESSIONALE
  {
    const path = "/assicurazione-rc-professionale-freelance/";
    const faq = [
      ["La RC professionale è obbligatoria per i forfettari?", "Dipende dalla professione, non dal regime fiscale. È obbligatoria per chi è iscritto a un ordine o collegio (DPR 137/2012): ingegneri, architetti, avvocati, commercialisti, psicologi e così via. Per consulenti, sviluppatori, grafici, copywriter e traduttori senza albo non è obbligatoria per legge."],
      ["Se non è obbligatoria, conviene lo stesso?", "Conviene se un tuo errore può far perdere soldi a un cliente: un sito che resta offline, una consegna sbagliata, un consiglio che porta a una multa. Alcuni clienti la chiedono anche nel contratto."],
      ["Quanto costa una RC professionale per freelance?", "Dipende da attività, fatturato e massimale. Con i broker online come Lokky il preventivo si fa in pochi minuti e senza impegno."],
      ["Il premio dell'assicurazione si scarica nel forfettario?", "No: nel forfettario le spese non si deducono, sono già comprese nel coefficiente di redditività."],
    ];
    const body = `
${crumbs("RC professionale")}
<h1>RC professionale per freelance in forfettario: quando è obbligatoria</h1>
<p class="lead">L'obbligo non dipende dal forfettario ma dalla tua professione. Se sei iscritto a un albo è obbligatoria; se sei un freelance senza albo è una scelta, che conviene fare quando un tuo errore può costare caro a un cliente.</p>

<div class="tbl"><table class="cmp">
<thead><tr><th>Chi sei</th><th>Obbligatoria?</th></tr></thead>
<tbody>
<tr><td>Iscritto a un albo (ingegnere, architetto, avvocato, psicologo, geometra…)</td><td><b>Sì</b>, DPR 137/2012</td></tr>
<tr><td>Consulente, sviluppatore, grafico, copywriter, traduttore senza albo</td><td>No, ma spesso consigliata</td></tr>
<tr><td>Artigiano o commerciante</td><td>No la RC professionale; valuta la RC verso terzi se lavori da clienti</td></tr>
</tbody></table></div>

<h2>Cosa controllare nella polizza</h2>
<ul>
<li><b>Attività coperte:</b> devono descrivere quello che fai davvero, altrimenti in caso di sinistro la copertura può saltare.</li>
<li><b>Massimale:</b> la cifra massima che paga l'assicurazione. Deve essere in proporzione ai progetti che segui.</li>
<li><b>Danni patrimoniali:</b> per un freelance il rischio tipico è far perdere soldi al cliente, non rompere qualcosa.</li>
<li><b>Retroattività:</b> copre errori fatti prima della firma ma scoperti dopo.</li>
<li><b>Postuma:</b> copre le richieste che arrivano dopo la chiusura della partita IVA.</li>
<li><b>Franchigia:</b> la parte di danno che resta a carico tuo.</li>
</ul>

<section class="pgrid">${card("lokky", "rc")}</section>
${disclosure(["lokky"])}
${ctaCheck("rc")}
${faqHtml(faq)}
${others(path)}
`;
    pages.push({ path, html: shell({ title: "RC professionale per freelance e forfettari: quando è obbligatoria e cosa controllare | Forfettix", desc: "La RC professionale è obbligatoria per gli iscritti agli albi (DPR 137/2012), non per i freelance senza albo. Quando conviene, cosa controllare (massimale, retroattività, postuma) e come fare un preventivo online.", path, body, jsonld: [faqLd(faq), crumbsLd("RC professionale", path)] }) });
  }

  // 5) APRIRE PARTITA IVA
  {
    const path = "/aprire-partita-iva-forfettaria/";
    const a = calc(30000, 78, "separata"), a5 = calc(30000, 78, "separata", 5);
    const faq = [
      ["Quanto costa aprire una partita IVA forfettaria?", "Per un professionista l'apertura con il modello AA9/12 all'Agenzia delle Entrate è gratuita, anche online. Se ti fai seguire, Fiscozen la include nell'abbonamento per i professionisti. Per artigiani e commercianti si aggiungono Camera di Commercio, PEC e diritti camerali."],
      ["Quali sono i requisiti per il regime forfettario?", "Incassi dell'anno precedente fino a 85.000 €, reddito da lavoro dipendente o pensione dell'anno precedente non oltre 35.000 €, e nessuna causa di esclusione: per esempio fatturare soprattutto al tuo datore di lavoro attuale o di quelli degli ultimi due anni, o controllare una SRL che fa un'attività simile."],
      ["Quando si pagano le prime tasse?", "Il primo anno di solito non paghi acconti. A giugno dell'anno dopo arrivano insieme il saldo del primo anno e il primo acconto del secondo, poi a novembre il secondo acconto. Per questo conviene mettere da parte una quota di ogni incasso fin dal primo giorno."],
      ["Posso avere l'imposta al 5%?", "Sì per i primi cinque anni, se l'attività è davvero nuova: nei tre anni prima non devi aver avuto un'attività simile, e non deve essere la prosecuzione del lavoro che facevi da dipendente (salvo il praticantato obbligatorio)."],
    ];
    const body = `
${crumbs("Aprire partita IVA forfettaria")}
<h1>Aprire partita IVA forfettaria nel 2027: passi, costi e checklist</h1>
<p class="lead">Aprire la partita IVA da professionista è gratis e si fa online. La parte difficile viene dopo: scegliere il codice ATECO giusto, capire la gestione INPS e non farsi sorprendere dalle tasse del secondo anno.</p>

<h2>1. Controlla di poter entrare nel forfettario</h2>
<ul>
<li>Incassi dell'anno precedente fino a <b>85.000 €</b>.</li>
<li>Reddito da lavoro dipendente o pensione dell'anno precedente fino a <b>35.000 €</b>.</li>
<li>Non fatturare soprattutto al tuo datore di lavoro attuale o degli ultimi due anni.</li>
<li>Non controllare una SRL che fa un'attività simile alla tua.</li>
</ul>
<p>Sei ancora dipendente? Forfettix ti fa le domande giuste nella sezione «La tua attività».</p>

<h2>2. Scegli il codice ATECO</h2>
<p>Il codice ATECO decide il <b>coefficiente di redditività</b>, cioè su quale parte degli incassi paghi le tasse: dal 40% per commercio e ristorazione all'86% per costruzioni e immobiliare. <a href="/?source=apertura">Cerca il tuo codice in Forfettix</a>: c'è l'elenco ATECO 2025 completo, con coefficiente e gestione INPS suggerita.</p>

<h2>3. Capisci quale INPS paghi</h2>
<ul>
<li><b>Professionisti senza albo:</b> gestione separata, ${pct(P.sep)} del reddito forfettario, nessun minimo.</li>
<li><b>Artigiani e commercianti:</b> quota fissa di circa ${eur(P.qa)} l'anno anche se incassi poco, riducibile del 35% su domanda.</li>
<li><b>Iscritti a un albo:</b> di solito la cassa della tua professione.</li>
</ul>

<h2>4. Apri la partita IVA</h2>
<ul>
<li><b>Professionisti:</b> modello AA9/12 all'Agenzia delle Entrate, online con SPID o tramite un intermediario. Gratis.</li>
<li><b>Artigiani e commercianti:</b> Comunicazione Unica al Registro delle Imprese, che avvisa anche Agenzia delle Entrate e INPS. Serve una PEC.</li>
</ul>

<h2>5. Prepara il resto</h2>
<ul>
<li><b>Fatturazione elettronica:</b> obbligatoria per tutti i forfettari dal 2024. Va bene anche il servizio gratuito dell'Agenzia delle Entrate.</li>
<li><b>Conto:</b> non obbligatorio, ma <a href="/conto-business-partita-iva/">separare gli incassi</a> ti salva dalle sorprese.</li>
<li><b>Assicurazione:</b> obbligatoria solo per gli iscritti a un albo. <a href="/assicurazione-rc-professionale-freelance/">Quando conviene comunque</a>.</li>
<li><b>Chi ti segue:</b> fai da te, commercialista o <a href="/commercialista-online-forfettario/">servizio online</a>.</li>
</ul>

<h2>Attenzione alla trappola del secondo anno</h2>
<p>Il primo anno di solito non paghi acconti di imposta, e sembra di guadagnare tanto. A giugno dell'anno dopo arrivano insieme <b>il saldo del primo anno e gli acconti del secondo</b>. Esempio: un professionista con coefficiente 78% e 30.000 € di incassi deve circa <b>${eur(a.inps + a.tax)} l'anno</b> tra INPS e imposta al 15% (circa ${eur(a5.inps + a5.tax)} con l'imposta al 5%). Nel secondo anno, tra saldo e acconti, versa quasi il doppio. Artigiani e commercianti pagano invece la quota fissa INPS a rate già dal primo anno.</p>
<p>La soluzione è mettere da parte una quota di ogni incasso dal primo giorno: <a href="/?source=apertura">Forfettix te la calcola</a>.</p>

<h2>Costi di apertura</h2>
<div class="tbl"><table><thead><tr><th>Voce</th><th>Costo</th></tr></thead><tbody>
<tr><td>Apertura da professionista (AA9/12) fatta da te</td><td>0 €</td></tr>
<tr><td>Apertura da professionista con Fiscozen</td><td>Inclusa nell'abbonamento</td></tr>
<tr><td>Apertura ditta individuale con Fiscozen</td><td>150 € in più</td></tr>
<tr><td>Software di fatturazione dell'Agenzia delle Entrate</td><td>0 €</td></tr>
<tr><td>Commercialista online (anno)</td><td>da ${fx.anno_prof} a ${fz.anno_art} €</td></tr>
</tbody></table></div>
${ver}

<section class="pgrid">${card("fiscozen", "apertura")}${card("flextax", "apertura")}</section>
${disclosure(["fiscozen", "flextax"])}
${ctaCheck("apertura")}
${faqHtml(faq)}
${others(path)}
`;
    pages.push({ path, html: shell({ title: "Aprire partita IVA forfettaria nel 2027: passi, costi, requisiti e checklist | Forfettix", desc: "Come aprire la partita IVA in regime forfettario: requisiti (85.000 € e 35.000 € da dipendente), codice ATECO, INPS, costi di apertura, imposta al 5% e la trappola delle tasse del secondo anno.", path, body, jsonld: [faqLd(faq), crumbsLd("Aprire partita IVA forfettaria", path)] }) });
  }

  return pages;
}
