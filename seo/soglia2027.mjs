// Pagina "Forfettario a 100.000 € dal 2027" (ddl di bilancio 2027, in approvazione).
// Quando la legge sarà approvata: aggiornare STATO e AGGIORNATO, togliere i condizionali e rendere definitiva la simulazione nell'app.

export const SOGLIA27_PATH = "/forfettario-100000-euro-2027/";
const AGGIORNATO = "23 novembre 2026";
const STATO = "Proposta in approvazione in Parlamento";

export function soglia2027Page({ shell, esc, eur, calc, P, BASE }) {
  const path = SOGLIA27_PATH;
  const ex = [85000, 95000, 100000].map(F => ({ F, ...calc(F, 78, "separata") }));
  const faq = [
    ["Il forfettario a 100.000 euro è già legge?", "Non ancora. La soglia a 100.000 € è nel disegno di legge di bilancio 2027 approvato dal Consiglio dei Ministri il 28 ottobre 2026. Diventa definitiva solo quando il Parlamento approva la legge di bilancio, di solito entro fine dicembre, e il testo può ancora cambiare."],
    ["Sopra 85.000 euro devo applicare l'IVA?", "Secondo la proposta sì. Per l'IVA resta il limite di 85.000 €, perché la direttiva europea non consente una franchigia più alta senza autorizzazione. Tra 85.000 e 100.000 € continueresti a pagare la flat tax sul reddito, ma diventeresti soggetto IVA. Il testo non chiarisce ancora da quando scatta esattamente l'IVA."],
    ["Cosa succede se supero 100.000 o 115.000 euro?", "Oltre 100.000 € l'IVA scatta subito, dall'operazione che fa superare il limite, mentre la flat tax resta fino a fine anno. Oltre 115.000 € esci subito dal forfettario anche per le imposte sui redditi e paghi l'IRPEF ordinaria per tutto l'anno."],
    ["Se nel 2026 incasso 95.000 euro posso restare forfettario nel 2027?", "Se la norma viene approvata con decorrenza dal 2027, il nuovo limite si verifica sui ricavi del 2026: con 95.000 € resteresti nel forfettario per le imposte, ma con l'IVA. Con le regole attuali, invece, dal 2027 passeresti al regime ordinario. Aspetta il testo definitivo prima di prendere decisioni."],
    ["Cambia il limite per chi è anche dipendente?", "La proposta fissa a 35.000 € il limite di reddito da lavoro dipendente o pensione, solo per il 2027."],
  ];
  const opt = (coef, gest, label, sel) => `<option value="${coef}" data-gest="${gest}"${sel ? " selected" : ""}>${esc(label)} · ${coef}%</option>`;
  const body = `
<nav class="crumbs"><a href="/">Forfettix</a> › Forfettario a 100.000 € dal 2027</nav>
<h1>Forfettario a 100.000 euro dal 2027: cosa cambia e calcolo</h1>
<p><span class="stato">${esc(STATO)}</span> <span class="muted small">Aggiornato al ${esc(AGGIORNATO)}</span></p>
<p class="lead">La Manovra 2027 porta la flat tax delle partite IVA forfettarie da 85.000 a 100.000 € di incassi. Ma non è un semplice aumento del tetto: per l'IVA resta il limite di 85.000 €, e nasce una nuova soglia di uscita a 115.000 €. Qui trovi le regole proposte, cosa succede in ogni fascia e un calcolatore che confronta oggi e 2027.</p>

<section class="card calc c27" data-p='${esc(JSON.stringify(P))}'>
  <h2>Calcola: regole attuali e regole 2027</h2>
  <label for="s-inc">Incassi dell'anno (€)</label>
  <input id="s-inc" inputmode="decimal" value="95.000" autocomplete="off">
  <label for="s-coef">Attività</label>
  <select id="s-coef">
    ${opt(78, "separata", "Professionisti e consulenti", true)}
    ${opt(67, "separata", "Altre attività (software, creativi, servizi…)")}
    ${opt(40, "commercianti", "Commercio, alloggio e ristorazione")}
    ${opt(62, "commercianti", "Agenti e rappresentanti")}
    ${opt(86, "artigiani", "Costruzioni e immobiliare")}
    ${opt(54, "commercianti", "Commercio ambulante non alimentare")}
  </select>
  <label for="s-gest">Gestione INPS</label>
  <select id="s-gest"><option value="separata">Gestione separata</option><option value="artigiani">Artigiani</option><option value="commercianti">Commercianti</option></select>
  <label class="chk"><input type="checkbox" id="s-new"> Nuova attività: imposta al 5% per i primi 5 anni</label>
  <div class="cmp">
    <div class="v"><b>Regole attuali</b><span id="v-oggi">–</span></div>
    <div class="v"><b>Manovra 2027 (proposta)</b><span id="v-2027">–</span></div>
  </div>
  <dl class="res">
    <dt>Reddito forfettario</dt><dd id="s-red">–</dd>
    <dt>Contributi INPS</dt><dd id="s-inps">–</dd>
    <dt>Imposta sostitutiva</dt><dd id="s-tax">–</dd>
    <dt class="tot">Netto con la flat tax</dt><dd class="tot" id="s-net">–</dd>
  </dl>
  <p class="muted small" id="s-acc"></p>
  <a class="btn" href="/?source=soglia2027&amp;sim=2027">Simula il 2027 sui tuoi incassi con Forfettix</a>
  <p class="muted small center">La simulazione 2027 si attiva da sola. Gratis, senza registrazione: i dati restano sul tuo telefono.</p>
</section>

<h2>Le soglie a confronto</h2>
<div class="tbl"><table>
<thead><tr><th>Soglia</th><th>Oggi</th><th>Manovra 2027</th></tr></thead>
<tbody>
<tr><td>Flat tax (imposte sui redditi)</td><td>85.000 €</td><td><b>100.000 €</b></td></tr>
<tr><td>Esonero IVA (franchigia)</td><td>85.000 €</td><td>85.000 €</td></tr>
<tr><td>Uscita immediata ai fini IVA</td><td>oltre 100.000 €</td><td>oltre 100.000 €</td></tr>
<tr><td>Uscita immediata dalla flat tax</td><td>oltre 100.000 €</td><td><b>oltre 115.000 €</b></td></tr>
<tr><td>Reddito da lavoro dipendente</td><td>35.000 € (2026)</td><td>35.000 € (solo 2027)</td></tr>
</tbody></table></div>

<h2>Cosa succede in ogni fascia di incassi</h2>
<ul>
<li><b>Fino a 85.000 €:</b> non cambia niente. Flat tax al 15% (o 5%) e niente IVA.</li>
<li><b>Tra 85.000 e 100.000 €:</b> resti nella flat tax per le imposte, ma diventi soggetto IVA: fatture con IVA, liquidazioni e dichiarazione IVA. Oggi, invece, dall'anno dopo passeresti al regime ordinario per tutto.</li>
<li><b>Tra 100.000 e 115.000 €:</b> l'IVA scatta subito, dall'operazione che fa superare i 100.000 €. La flat tax resta fino a fine anno, poi passi al regime ordinario.</li>
<li><b>Oltre 115.000 €:</b> esci subito dal forfettario anche per le tasse e paghi l'IRPEF ordinaria su tutto l'anno.</li>
</ul>
<p class="note">Il punto più delicato è l'IVA tra 85.000 e 100.000 €: la proposta non chiarisce ancora da quando scatta esattamente. Se sei in questa fascia, parlane con il commercialista prima di emettere le prossime fatture.</p>

<h2>Perché l'IVA resta a 85.000 €</h2>
<p>La direttiva europea sull'IVA permette agli Stati di esonerare i piccoli operatori fino a 85.000 € di volume d'affari. Per alzare anche questa soglia serve un'autorizzazione dell'Unione europea, che al momento non c'è. Per questo la Manovra separa le due cose: <b>flat tax fino a 100.000 €, IVA sopra 85.000 €</b>.</p>

<h2>Vale già per gli incassi del 2026?</h2>
<p>Per entrare o restare nel forfettario contano gli incassi dell'anno precedente. Se la norma parte dal 1° gennaio 2027, il nuovo limite si verifica quindi sugli incassi del 2026: chi chiude il 2026 tra 85.000 e 100.000 € potrebbe restare in flat tax anche nel 2027, con l'IVA. Con le regole attuali, invece, passerebbe al regime ordinario.</p>

<h2>Quanto si paga sopra gli 85.000 €: esempi</h2>
<p>Consulente con coefficiente 78% e gestione separata, imposta al 15%:</p>
<div class="tbl"><table>
<thead><tr><th>Incassi</th><th>Reddito 78%</th><th>INPS</th><th>Imposta 15%</th><th>Netto</th></tr></thead>
<tbody>${ex.map(r => `<tr><td>${eur(r.F)}</td><td>${eur(r.R)}</td><td>${eur(r.inps)}</td><td>${eur(r.tax)}</td><td><b>${eur(r.net)}</b></td></tr>`).join("")}</tbody>
</table></div>
<p>Sopra 85.000 € a questi importi si aggiunge la gestione dell'IVA: l'IVA la incassi dai clienti e la versi allo Stato, quindi non è un costo, ma serve una contabilità IVA. Con il regime ordinario, invece, sul reddito pagheresti l'IRPEF a scaglioni, più alta della flat tax per redditi di questo livello.</p>

<h2>Quando sarà definitivo</h2>
<p>La legge di bilancio va approvata dal Parlamento entro il 31 dicembre. Fino ad allora soglie, decorrenza e regole IVA possono cambiare. Aggiorneremo questa pagina e l'app Forfettix appena il testo sarà definitivo.</p>

<h2>Domande frequenti</h2>
${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}

<p class="muted small">Fonti: comunicato del Consiglio dei Ministri n. 195 del 28 ottobre 2026; disegno di legge di bilancio 2027, art. 9. Pagina aggiornata al ${esc(AGGIORNATO)}.</p>

<h2>Altre guide utili</h2>
<ul class="links"><li><a href="/tasse-forfettario/">Tasse forfettario per professione</a></li><li><a href="/check-up-partita-iva/">Check-up partita IVA</a></li><li><a href="/commercialista-online-forfettario/">Commercialista online: prezzi</a></li><li><a href="/aprire-partita-iva-forfettaria/">Aprire partita IVA forfettaria</a></li></ul>
<script src="/assets/soglia2027.js" defer></script>
`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forfettix", item: BASE + "/" },
      { "@type": "ListItem", position: 2, name: "Forfettario a 100.000 € dal 2027", item: BASE + path } ] },
  ];
  return { path, html: shell({
    title: "Forfettario a 100.000 euro dal 2027: cosa cambia, IVA e calcolo | Forfettix",
    desc: "La Manovra 2027 porta la flat tax dei forfettari a 100.000 €: IVA oltre 85.000 €, uscita immediata oltre 115.000 €. Cosa cambia, se vale già sugli incassi 2026 e calcolatore gratuito.",
    path, body, jsonld }) };
}
