// Check-up partita IVA di Forfettix: 5 domande, risultato calcolato nel browser (niente dati inviati).
(function () {
  var cfg = JSON.parse(document.getElementById("cfg").textContent);
  var form = document.getElementById("quiz"), res = document.getElementById("res");
  var steps = [].slice.call(form.querySelectorAll(".step"));
  var bar = document.getElementById("q-bar"), back = document.getElementById("q-back");
  var A = {}, cur = 0, costo = 0;
  var fmt = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
  var eur = function (n) { return fmt.format(Math.round(n)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var parse = function (s) {
    s = String(s || "").trim().replace(/€|\s/g, "");
    if (!s) return 0;
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    var n = Number(s); return isFinite(n) && n > 0 ? n : 0;
  };

  function show(i) {
    cur = i;
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    bar.style.width = (i / steps.length * 100) + "%";
    back.hidden = i === 0;
    var first = steps[i].querySelector(".opt"); if (first && i > 0) first.focus({ preventScroll: true });
  }
  function next() { if (cur < steps.length - 1) show(cur + 1); else finish(); }

  steps.forEach(function (s) {
    s.addEventListener("click", function (e) {
      var b = e.target.closest(".opt"); if (!b) return;
      [].forEach.call(s.querySelectorAll(".opt"), function (o) { o.classList.toggle("sel", o === b); });
      A[s.dataset.key] = b.dataset.v;
      if (s.dataset.key === "tasse" && b.dataset.v === "trad") { document.getElementById("q-cost").hidden = false; document.getElementById("q-eur").focus(); return; }
      if (s.dataset.key === "tasse") document.getElementById("q-cost").hidden = true;
      setTimeout(next, 150);
    });
  });
  document.getElementById("q-cost-ok").addEventListener("click", function () { costo = parse(document.getElementById("q-eur").value); next(); });
  document.getElementById("q-eur").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); document.getElementById("q-cost-ok").click(); } });
  back.addEventListener("click", function () { if (cur > 0) show(cur - 1); });

  function cta(id, fallbackUrl, fallbackTxt) {
    var p = cfg.p[id]; if (!p) return "";
    if (p.url) return (p.promo ? '<p class="promo">' + esc(p.promo) + "</p>" : "") + '<a class="btn" href="' + esc(p.url) + '" rel="sponsored noopener" target="_blank">Vai a ' + esc(p.nome) + "</a>";
    return fallbackUrl ? '<a class="btn sec" href="' + fallbackUrl + '">' + fallbackTxt + "</a>" : "";
  }
  function item(cls, n, title, html) { return '<section class="card item ' + cls + '"><h3><span class="dot"></span>' + n + ". " + title + "</h3>" + html + "</section>"; }

  function finish() {
    bar.style.width = "100%";
    var art = A.tipo === "art", fz = cfg.p.fiscozen, fx = cfg.p.flextax;
    var fzY = art ? fz.art : fz.prof, fxY = art ? fx.art : fx.prof;
    var todo = 0, out = [], chips = [];

    // 1. Tasse
    var t;
    if (A.tasse === "online") {
      t = item("ok", 1, "Tasse e dichiarazione", "<p><b>A posto.</b> Ti segue già un servizio online. Per sicurezza confronta il prezzo: FlexTax " + eur(fxY) + ", Fiscozen da " + eur(fzY) + " l'anno.</p>" + '<a class="btn sec" href="/commercialista-online-forfettario/?source=checkup">Confronta i prezzi</a>');
      chips.push(["ok", "Tasse"]);
    } else if (A.tasse === "trad") {
      var risp = costo ? costo - fxY : 0;
      if (costo && risp <= 50) {
        t = item("ok", 1, "Tasse e dichiarazione", "<p><b>A posto.</b> Paghi " + eur(costo) + " l'anno: è già in linea o sotto i servizi online (" + eur(fxY) + "–" + eur(fzY) + "). Se ti segue bene, tienilo.</p>");
        chips.push(["ok", "Tasse"]);
      } else {
        todo++;
        t = item("warn", 1, "Tasse e dichiarazione", (costo
          ? "<p>Paghi " + eur(costo) + " l'anno. Con <b>FlexTax</b> (" + eur(fxY) + ") risparmieresti circa <b>" + eur(risp) + " l'anno</b>" + (costo - fzY > 50 ? ", con <b>Fiscozen</b> (" + eur(fzY) + ") circa " + eur(costo - fzY) : "") + ".</p>"
          : "<p>Un commercialista tradizionale costa spesso più dei servizi online, che per il forfettario partono da " + eur(fxY) + " l'anno con dichiarazione e F24 inclusi. Vale la pena confrontare.</p>")
          + '<div class="two">' + cta("flextax", "/commercialista-online-forfettario/?source=checkup", "Confronta FlexTax e Fiscozen") + cta("fiscozen") + "</div>");
        chips.push(["warn", "Tasse"]);
      }
    } else {
      todo++;
      var intro = A.tasse === "solo"
        ? "<p>Fare da soli si può, ma acconti, contributi INPS e quadro LM sono dove si sbaglia di più. Il modo più economico per avere un paracadute è <b>FlexTax Freemium</b>: gratis, con simulatori e ticket di assistenza fiscale.</p>"
        : "<p>Ti serve qualcuno per dichiarazione e F24. I servizi online per forfettari costano " + eur(fxY) + "–" + eur(fzY) + " l'anno" + (A.fase === "apre" ? " e ti seguono anche nell'apertura della partita IVA" : "") + ".</p>";
      t = item("warn", 1, "Tasse e dichiarazione", intro + '<div class="two">' + cta("flextax", "/commercialista-online-forfettario/?source=checkup", "Confronta FlexTax e Fiscozen") + cta("fiscozen") + "</div>");
      chips.push(["warn", "Tasse"]);
    }
    out.push(t);

    // 2. Conto
    if (A.conto === "biz") { out.push(item("ok", 2, "Conto", "<p><b>A posto.</b> Consiglio: apri un sotto-conto «Tasse» e spostaci, a ogni incasso, la cifra che Forfettix ti indica in «Ogni 100 € incassati».</p>")); chips.push(["ok", "Conto"]); }
    else {
      if (A.conto === "pers") todo++;
      out.push(item(A.conto === "pers" ? "warn" : "info", 2, "Conto", (A.conto === "pers"
        ? "<p>Non è obbligatorio un conto dedicato, ma mischiare incassi e spese personali è il modo più rapido per spendere i soldi delle tasse. Con un conto business e un sotto-conto «Tasse» a giugno li trovi già pronti.</p>"
        : "<p>Quando arriva il primo cliente, fallo pagare su un conto separato: vedi subito quanto hai guadagnato davvero e quanto mettere da parte.</p>")
        + '<p class="small muted">Qonto: da 9 €/mese + IVA con piano annuale, primo mese di prova gratuito.</p>' + cta("qonto", "/conto-business-partita-iva/?source=checkup", "Come scegliere il conto")));
      chips.push([A.conto === "pers" ? "warn" : "info", "Conto"]);
    }

    // 3. Assicurazione
    if (A.rc === "si") { out.push(item("ok", 3, "Assicurazione", "<p><b>A posto.</b> Controlla solo che la polizza descriva l'attività che fai oggi e che il massimale sia adeguato ai tuoi progetti.</p>")); chips.push(["ok", "RC"]); }
    else if (A.tipo === "albo") {
      todo++;
      out.push(item("alert", 3, "Assicurazione", "<p><b>Da sistemare subito.</b> Per chi è iscritto a un albo la RC professionale è <b>obbligatoria</b> (DPR 137/2012), indipendentemente dal regime fiscale.</p>" + cta("lokky", "/assicurazione-rc-professionale-freelance/?source=checkup", "Cosa deve coprire la polizza")));
      chips.push(["alert", "RC"]);
    } else {
      todo++;
      out.push(item("warn", 3, "Assicurazione", "<p>Per te non è obbligatoria. Conviene se un tuo errore può far perdere soldi a un cliente (un sito offline, una consegna sbagliata, un danno durante un lavoro): la polizza protegge il tuo patrimonio, e alcuni clienti la chiedono nel contratto.</p>" + cta("lokky", "/assicurazione-rc-professionale-freelance/?source=checkup", "Quando conviene la RC")));
      chips.push(["warn", "RC"]);
    }

    // 4. Agevolazioni
    var tips = [];
    if (A.fase !== "vecchia") tips.push("<li><b>Imposta al 5%</b> per i primi 5 anni invece del 15%, se l'attività è davvero nuova: niente attività simile nei 3 anni prima e non la prosecuzione del lavoro da dipendente.</li>");
    if (A.fase === "apre" || A.fase === "nuova") tips.push("<li><b>Trappola del secondo anno:</b> il primo anno di solito non paghi acconti, poi a giugno arrivano insieme saldo e acconti. Metti da parte una quota di ogni incasso da subito.</li>");
    if (art) tips.push("<li><b>Riduzione INPS del 35%:</b> come artigiano o commerciante paghi una quota fissa di circa " + eur(cfg.qa) + " l'anno anche se incassi poco. Da forfettario puoi chiedere all'INPS di ridurre i contributi del 35%.</li>");
    if (A.tipo === "prof") tips.push("<li><b>Gestione separata INPS:</b> paghi il " + String(cfg.sep).replace(".", ",") + "% del reddito forfettario e nessun minimo: se un mese non incassi, non versi.</li>");
    if (A.tipo === "albo") tips.push("<li><b>Cassa professionale:</b> di solito versi i contributi alla cassa della tua professione, con regole e minimi diversi dalla gestione separata.</li>");
    tips.push("<li><b>Tetto di 85.000 €:</b> oltre, dall'anno dopo esci dal forfettario; oltre 100.000 € esci subito.</li>");
    out.push(item("info", 4, "Agevolazioni e regole da non perdere", "<ul>" + tips.join("") + "</ul>"));

    out.push('<section class="card item app"><h3>Quanto mettere da parte, incasso per incasso</h3><p>Forfettix calcola tasse e INPS sul tuo codice ATECO e ti dice quanto accantonare ogni 100 € incassati. Gratis, i dati restano sul telefono.</p><a class="btn" href="/?source=checkup">Apri Forfettix</a></section>');

    var anyUrl = Object.keys(cfg.p).some(function (k) { return cfg.p[k].url; });
    var head = '<section class="card res-head"><span class="label">Il tuo check-up</span><h2>' + (todo ? (todo === 1 ? "1 cosa da sistemare" : todo + " cose da sistemare") : "Sei a posto") + "</h2>"
      + '<div class="chips">' + chips.map(function (c) { return '<span class="chip ' + c[0] + '">' + c[1] + "</span>"; }).join("") + "</div></section>";
    res.innerHTML = head + out.join("")
      + '<div class="actions"><button type="button" class="btn sec" id="r-share">Condividi il check-up</button><button type="button" class="btn sec" id="r-again">Rifai il check-up</button></div>'
      + (anyUrl ? '<p class="muted small">Alcuni link sono di affiliazione: se ti iscrivi, Forfettix può ricevere una commissione, senza costi in più per te.</p>' : "")
      + '<p class="muted small">Indicazioni generali, non consulenza fiscale o assicurativa. Prezzi verificati sui siti ufficiali: controllali prima di sottoscrivere.</p>';
    form.hidden = true; res.hidden = false;
    document.getElementById("how").hidden = true;
    res.scrollIntoView({ behavior: "smooth", block: "start" });

    document.getElementById("r-again").addEventListener("click", function () {
      A = {}; costo = 0; res.hidden = true; form.hidden = false; document.getElementById("how").hidden = false;
      [].forEach.call(form.querySelectorAll(".opt.sel"), function (o) { o.classList.remove("sel"); });
      document.getElementById("q-cost").hidden = true; document.getElementById("q-eur").value = "";
      show(0); form.scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("r-share").addEventListener("click", function () {
      var url = location.origin + location.pathname + "?source=share", txt = "Check-up gratuito della partita IVA forfettaria in 60 secondi";
      if (navigator.share) navigator.share({ title: "Check-up partita IVA", text: txt, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { document.getElementById("r-share").textContent = "Link copiato"; });
    });
  }

  show(0);
})();
