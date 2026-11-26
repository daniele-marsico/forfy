// Prestazione occasionale: generatore di ricevuta (strumento) e guida "prestazione occasionale o partita IVA".
// Valori 2026: ritenuta 20%, bollo 2 € oltre 77,47 €, franchigia INPS 5.000 €, gestione separata 33,72% (24% con altra
// copertura previdenziale) divisa 1/3 prestatore e 2/3 committente; IRPEF 23/33/43%; forfettario gestione separata 26,07%.
// Aggiornare RIF ogni anno (circolare INPS gestione separata di febbraio, legge di bilancio).

export const OCC_PATHS = ["/ricevuta-prestazione-occasionale/", "/prestazione-occasionale-o-partita-iva/"];

const RIF = {
  anno: 2026, ritenuta: 20, bollo: 2, sogliaBollo: 77.47, franchigia: 5000,
  inps: 33.72, inpsAltra: 24, sep: 26.07, sepAltra: 24, limiteDip: 35000,
  irpef: [[28000, 23], [50000, 33], [Infinity, 43]],
};

export function occasionalePages({ shell, esc, eur, BASE, allPartners, track }) {
  const byId = Object.fromEntries(allPartners.map(p => [p.id, p]));
  const pct = n => String(n).replace(".", ",") + "%";
  const faqLd = faq => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  const crumbsLd = (name, path) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Forfettix", item: BASE + "/" },
    { "@type": "ListItem", position: 2, name, item: BASE + path } ] });
  const faqHtml = faq => `<h2>Domande frequenti</h2>\n${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}`;
  const crumbs = t => `<nav class="crumbs"><a href="/">Forfettix</a> › ${esc(t)}</nav>`;
  const card = (id, src) => {
    const p = byId[id];
    if (!p) return "";
    return `<div class="pcard"><div class="ph"><b>${esc(p.nome)}</b><span class="tag">${esc(p.etichetta)}</span></div>
<p>${esc(p.testo)}</p>${p.prezzo ? `<p class="small muted">Prezzo: ${esc(p.prezzo)}</p>` : ""}
${p.url && p.promo ? `<p class="promo">${esc(p.promo)}</p>` : ""}${p.url ? `<a class="btn" href="${esc(track(p.url, src))}" rel="sponsored noopener" target="_blank">Vai a ${esc(p.nome)}</a>` : ""}</div>`;
  };
  const disclosure = ids => ids.some(id => byId[id] && byId[id].url)
    ? `<p class="muted small">Alcuni link sono di affiliazione: se ti iscrivi, Forfettix può ricevere una commissione, senza costi in più per te.</p>` : "";
  const ldTool = (name, path, desc) => ({ "@context": "https://schema.org", "@type": "WebApplication", name, url: BASE + path, description: desc,
    applicationCategory: "FinanceApplication", operatingSystem: "Web", inLanguage: "it", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } });
  const cfg = esc(JSON.stringify(RIF, (k, v) => v === Infinity ? 1e12 : v));

  const pages = [];

  // 1) GENERATORE DI RICEVUTA
  {
    const path = OCC_PATHS[0];
    const title = `Ricevuta prestazione occasionale ${RIF.anno}: crea il PDF gratis con i calcoli`;
    const desc = `Compila la ricevuta per prestazione occasionale in un minuto: ritenuta d'acconto 20%, marca da bollo e contributi INPS sopra 5.000 € calcolati da soli. PDF gratis, senza registrazione.`;
    const faq = [
      ["Quando si applica la ritenuta d'acconto del 20%?", "Solo se chi ti paga è un sostituto d'imposta: un'azienda, un professionista con partita IVA, un ente o un'associazione. Trattiene il 20% del compenso lordo e lo versa al fisco con l'F24 entro il 16 del mese dopo. Se ti paga un privato cittadino non c'è ritenuta: incassi tutto e dichiari il compenso nella dichiarazione dei redditi."],
      ["Quando serve la marca da bollo da 2 euro?", "Quando il compenso supera 77,47 €. La marca da bollo va applicata sull'originale della ricevuta. Di regola la paga chi emette la ricevuta, ma potete accordarvi perché la paghi il committente."],
      ["Il limite di 5.000 euro è il massimo che posso guadagnare?", "No, è un equivoco molto diffuso. 5.000 € l'anno è la soglia oltre la quale si pagano i contributi INPS alla gestione separata, solo sulla parte che la supera. Non è un tetto ai compensi. Ciò che conta è che il lavoro resti davvero occasionale: se diventa abituale serve la partita IVA, anche sotto i 5.000 €."],
      ["Chi paga i contributi INPS oltre i 5.000 euro?", `Sulla parte oltre 5.000 € il contributo è del ${pct(RIF.inps)} (${pct(RIF.inpsAltra)} se sei già dipendente, pensionato o iscritto a un'altra cassa). Un terzo è a carico tuo e viene trattenuto dal compenso, due terzi li paga il committente, che versa tutto all'INPS. Devi anche iscriverti alla gestione separata INPS.`],
      ["Serve la comunicazione preventiva all'Ispettorato del lavoro?", "La deve fare il committente, se è un'impresa, prima che inizi la prestazione. Tu non devi fare nulla, ma è utile saperlo e ricordarglielo."],
      ["I miei dati vengono salvati online?", "No. La ricevuta si compila e si crea nel tuo browser: nessun dato viene inviato a Forfettix. Per comodità i tuoi dati restano salvati solo su questo dispositivo, così la prossima ricevuta è già pronta."],
    ];
    const body = `
${crumbs("Ricevuta prestazione occasionale")}
<h1>Ricevuta per prestazione occasionale: crea il PDF gratis</h1>
<p class="lead">Inserisci i dati e il compenso: Forfettix calcola ritenuta d'acconto, marca da bollo e contributi INPS e prepara la ricevuta pronta da stampare o salvare in PDF. Gratis, senza registrazione, valori ${RIF.anno}.</p>

<form class="card calc rcv" id="rcv" data-rif="${cfg}" autocomplete="on" onsubmit="return false">
  <h2>1. I tuoi dati</h2>
  <label for="r-nome">Nome e cognome</label><input id="r-nome" name="name" autocomplete="name" required>
  <label for="r-cf">Codice fiscale</label><input id="r-cf" maxlength="16" autocapitalize="characters" spellcheck="false" required>
  <label for="r-ind">Indirizzo (via, CAP, città)</label><input id="r-ind" autocomplete="street-address">
  <label for="r-iban">IBAN per il pagamento (facoltativo)</label><input id="r-iban" maxlength="34" autocapitalize="characters" spellcheck="false">

  <h2>2. Chi ti paga</h2>
  <div class="seg" role="radiogroup" aria-label="Tipo di committente">
    <label><input type="radio" name="r-tipo" value="sost" checked> <span><b>Azienda, professionista o ente</b><small>Applica la ritenuta del 20%</small></span></label>
    <label><input type="radio" name="r-tipo" value="priv"> <span><b>Privato cittadino</b><small>Nessuna ritenuta</small></span></label>
  </div>
  <label for="r-com">Nome o ragione sociale</label><input id="r-com" required>
  <label for="r-comcf">Codice fiscale o partita IVA</label><input id="r-comcf" maxlength="16" autocapitalize="characters" spellcheck="false">
  <label for="r-comind">Indirizzo</label><input id="r-comind">

  <h2>3. La prestazione</h2>
  <label for="r-desc">Descrizione del lavoro</label><input id="r-desc" placeholder="es. traduzione di un manuale di 20 pagine" required>
  <label for="r-per">Data o periodo della prestazione</label><input id="r-per" placeholder="es. 3-7 novembre ${RIF.anno}">
  <label for="r-lordo">Compenso lordo (€)</label><input id="r-lordo" inputmode="decimal" value="500" autocomplete="off">
  <div id="r-inps-box">
    <label for="r-prec">Compensi occasionali già ricevuti quest'anno, da tutti i committenti (€)</label><input id="r-prec" inputmode="decimal" value="0" autocomplete="off">
    <label class="chk"><input type="checkbox" id="r-altra"> Sono già dipendente, pensionato o iscritto a un'altra cassa previdenziale</label>
  </div>
  <div class="row2">
    <div><label for="r-num">Numero ricevuta</label><input id="r-num" value="1" autocomplete="off"></div>
    <div><label for="r-data">Data</label><input id="r-data" type="date"></div>
  </div>
  <label for="r-luogo">Luogo</label><input id="r-luogo" autocomplete="address-level2">

  <dl class="res" aria-live="polite">
    <dt>Compenso lordo</dt><dd id="o-lordo">–</dd>
    <dt>Ritenuta d'acconto 20%</dt><dd id="o-rit">–</dd>
    <dt>Contributo INPS a tuo carico</dt><dd id="o-inps">–</dd>
    <dt class="tot">Netto che ricevi</dt><dd class="tot" id="o-netto">–</dd>
  </dl>
  <p class="muted small" id="o-note"></p>
  <button type="button" class="btn" id="r-pdf">Crea la ricevuta (stampa o salva PDF)</button>
  <p class="muted small center">I dati restano su questo dispositivo: non vengono inviati a nessuno.</p>
</form>

<section class="ricevuta" id="ricevuta" aria-label="Anteprima della ricevuta"></section>

<h2>Come si compila la ricevuta per prestazione occasionale</h2>
<p>La ricevuta è il documento che rilasci quando lavori in modo saltuario senza partita IVA. Non è una fattura e non ha IVA: la prestazione è fuori campo IVA perché manca l'abitualità (art. 5 del DPR 633/1972). Deve contenere:</p>
<ul>
<li><b>i tuoi dati e quelli del committente</b>, con i codici fiscali;</li>
<li><b>numero e data</b> della ricevuta, e una descrizione chiara del lavoro svolto;</li>
<li><b>compenso lordo, ritenuta d'acconto e netto</b> da pagare;</li>
<li>la <b>dichiarazione sui 5.000 €</b>: se nell'anno hai superato o no la soglia dei compensi occasionali, che decide se si pagano i contributi INPS;</li>
<li>la <b>marca da bollo da 2 €</b> se il compenso supera 77,47 €, e la tua firma.</li>
</ul>

<h2>Esempio di calcolo</h2>
<div class="tbl"><table>
<tr><th></th><th>Azienda, sotto i 5.000 €</th><th>Azienda, oltre i 5.000 €*</th><th>Privato</th></tr>
<tr><td>Compenso lordo</td><td>1.000 €</td><td>1.000 €</td><td>1.000 €</td></tr>
<tr><td>Ritenuta 20%</td><td>− 200 €</td><td>− 200 €</td><td>–</td></tr>
<tr><td>INPS a tuo carico (1/3)</td><td>–</td><td>− 112,40 €</td><td>–</td></tr>
<tr><td><b>Netto che ricevi</b></td><td><b>800 €</b></td><td><b>687,60 €</b></td><td><b>1.000 €</b></td></tr>
</table></div>
<p class="muted small">* Se hai già superato i 5.000 € di compensi occasionali nell'anno e non hai altra copertura previdenziale (${pct(RIF.inps)}). Il committente versa anche i suoi due terzi: 224,80 €. La marca da bollo da 2 € non cambia il netto.</p>

<section class="card cta-check"><h2>Lavori spesso così? Valuta la partita IVA</h2>
<p>La prestazione occasionale va bene per lavori sporadici. Se i committenti si ripetono o i compensi crescono, con la partita IVA forfettaria spesso paghi meno: imposta al 5% per i primi cinque anni e niente ritenuta.</p>
<a class="btn" href="/prestazione-occasionale-o-partita-iva/?source=ricevuta">Confronta: occasionale o partita IVA?</a></section>

${faqHtml(faq)}
`;
    const jsonld = [ldTool("Generatore ricevuta prestazione occasionale", path, desc), faqLd(faq), crumbsLd("Ricevuta prestazione occasionale", path)];
    pages.push({ path, html: shell({ title, desc, path, body, jsonld }).replace("</body>", `<link rel="stylesheet" href="/assets/ricevuta.css">\n<script src="/assets/ricevuta.js" defer></script>\n</body>`) });
  }

  // 2) PRESTAZIONE OCCASIONALE O PARTITA IVA
  {
    const path = OCC_PATHS[1];
    const title = `Prestazione occasionale o partita IVA forfettaria: quando conviene (${RIF.anno})`;
    const desc = `Confronta quanto ti resta con la prestazione occasionale e con la partita IVA forfettaria: IRPEF, ritenuta, contributi INPS e imposta al 5% o 15%. Calcolo gratuito con valori ${RIF.anno}.`;
    const faq = [
      ["Fino a quanto posso lavorare con la prestazione occasionale?", "Non c'è un limite di compensi fissato dalla legge: quello che conta è che il lavoro sia davvero saltuario e non organizzato in modo stabile. I 5.000 € l'anno sono solo la soglia oltre la quale si pagano i contributi INPS. Se lavori in modo continuativo, anche per pochi euro, serve la partita IVA."],
      ["Con la prestazione occasionale quante tasse pago?", "Il compenso si somma agli altri redditi e paga l'IRPEF alla tua aliquota più alta: 23% fino a 28.000 €, 33% fino a 50.000 €, 43% oltre. La ritenuta del 20% è solo un anticipo: in dichiarazione paghi la differenza o ti viene restituita una parte."],
      ["Posso aprire la partita IVA forfettaria se sono dipendente?", `Sì, se nell'anno precedente il reddito da lavoro dipendente o pensione non ha superato ${eur(RIF.limiteDip)} (limite valido per il ${RIF.anno}) e se non lavori soprattutto per il tuo datore di lavoro attuale o per quelli degli ultimi due anni.`],
      ["Quanto costa tenere una partita IVA forfettaria?", "Aprirla da professionista è gratis. Poi ci sono i contributi INPS (per la gestione separata solo in percentuale su quello che guadagni, senza minimi) e, se ti fai seguire, un commercialista online: da circa 366 € l'anno. Il conto corrente dedicato non è obbligatorio ma è consigliato."],
      ["Cosa conviene se guadagno 10.000 euro l'anno extra?", "Dipende dagli altri redditi: con uno stipendio nel secondo scaglione IRPEF, 10.000 € in prestazione occasionale perdono un terzo in IRPEF più i contributi oltre i 5.000 €, mentre nel forfettario al 5% resta molto di più anche pagando il commercialista. Usa il calcolatore per il tuo caso."],
    ];
    const body = `
${crumbs("Prestazione occasionale o partita IVA")}
<h1>Prestazione occasionale o partita IVA forfettaria: quando conviene aprire</h1>
<p class="lead">Con la prestazione occasionale non apri nulla, ma il compenso si somma allo stipendio e paga l'IRPEF piena. Con la partita IVA forfettaria paghi il 5% o il 15% su una parte di quello che incassi. Inserisci i tuoi numeri e guarda la differenza.</p>

<section class="card calc occ" data-rif="${cfg}">
  <h2>Confronta i due casi</h2>
  <label for="c-extra">Compensi del lavoro extra in un anno (€)</label>
  <input id="c-extra" inputmode="decimal" value="10.000" autocomplete="off">
  <label for="c-altri">Altri redditi dell'anno, per esempio lo stipendio lordo (€)</label>
  <input id="c-altri" inputmode="decimal" value="30.000" autocomplete="off">
  <label for="c-coef">Che lavoro fai</label>
  <select id="c-coef">
    <option value="78" selected>Professionista o consulente (78%)</option>
    <option value="67">Servizi, software, creativi (67%)</option>
  </select>
  <label class="chk"><input type="checkbox" id="c-new" checked> Nuova attività: imposta al 5% per i primi 5 anni</label>
  <label class="chk"><input type="checkbox" id="c-comm" checked> Nel forfettario mi faccio seguire da un commercialista online (circa 366 € l'anno)</label>
  <div class="cmp">
    <div class="v" id="v-occ"><b>Prestazione occasionale</b><span id="o-occ">–</span></div>
    <div class="v" id="v-for"><b>Partita IVA forfettaria</b><span id="o-for">–</span></div>
  </div>
  <p id="o-verdetto"></p>
  <p class="muted small" id="o-dett"></p>
</section>

<h2>Le differenze in breve</h2>
<div class="tbl"><table class="cmp-t">
<tr><th></th><th>Prestazione occasionale</th><th>Partita IVA forfettaria</th></tr>
<tr><td>Quando si usa</td><td>Lavori saltuari, senza organizzazione stabile</td><td>Lavoro autonomo abituale</td></tr>
<tr><td>Tasse</td><td>IRPEF piena, sommata agli altri redditi (23-43%)</td><td>Imposta sostitutiva 5% (primi 5 anni) o 15% sul reddito forfettario</td></tr>
<tr><td>Ritenuta</td><td>20% se ti paga un'azienda</td><td>Nessuna</td></tr>
<tr><td>Contributi INPS</td><td>Solo oltre 5.000 € l'anno, ${pct(RIF.inps)} di cui un terzo a tuo carico</td><td>Gestione separata ${pct(RIF.sep)} sul reddito forfettario (per i professionisti senza albo)</td></tr>
<tr><td>Costi fissi</td><td>Nessuno, marca da bollo da 2 € oltre 77,47 €</td><td>Apertura gratis da professionista; commercialista facoltativo</td></tr>
<tr><td>Documento</td><td>Ricevuta</td><td>Fattura elettronica</td></tr>
</table></div>

<h2>Quando conviene aprire la partita IVA</h2>
<ul>
<li><b>Lavori con regolarità</b>, per gli stessi clienti o tutti i mesi: in questo caso la partita IVA è obbligatoria, non solo conveniente.</li>
<li><b>Hai già uno stipendio</b>: i compensi occasionali si sommano e vengono tassati al 33% o al 43%, mentre nel forfettario resti al 5% o al 15%.</li>
<li><b>Superi i 5.000 € l'anno</b>: con la prestazione occasionale iniziano i contributi INPS e la ritenuta resta, quindi il netto scende.</li>
<li><b>Vuoi crescere</b>: con la partita IVA puoi fatturare a chiunque, anche all'estero, e costruire la tua attività.</li>
</ul>
<p>Prima di aprire controlla i requisiti: nel ${RIF.anno} il reddito da lavoro dipendente dell'anno precedente non deve superare ${eur(RIF.limiteDip)}, e non puoi lavorare soprattutto per il tuo datore di lavoro attuale o degli ultimi due anni. Trovi tutti i passaggi nella guida <a href="/aprire-partita-iva-forfettaria/">aprire la partita IVA forfettaria</a>.</p>

<h2>Chi può aiutarti ad aprire</h2>
<div class="pgrid">${card("fiscozen", "occasionale-piva")}${card("flextax", "occasionale-piva")}</div>
${disclosure(["fiscozen", "flextax"])}

<section class="card"><h2>Resti con la prestazione occasionale?</h2><p>Crea la ricevuta con ritenuta, bollo e contributi già calcolati.</p><a class="btn" href="/ricevuta-prestazione-occasionale/?source=confronto">Crea la ricevuta gratis</a></section>

${faqHtml(faq)}
`;
    const jsonld = [ldTool("Calcolatore prestazione occasionale o partita IVA", path, desc), faqLd(faq), crumbsLd("Prestazione occasionale o partita IVA", path)];
    pages.push({ path, html: shell({ title, desc, path, body, jsonld }).replace("</body>", `<script src="/assets/occasionale.js" defer></script>\n</body>`) });
  }

  return pages;
}
