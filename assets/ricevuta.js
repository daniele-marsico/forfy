// Generatore di ricevuta per prestazione occasionale: calcoli e documento nel browser, nessun dato inviato.
(function () {
  var form = document.getElementById("rcv");
  if (!form) return;
  var R = JSON.parse(form.dataset.rif);
  var $ = function (id) { return document.getElementById(id); };
  var fmt = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
  var eur = function (n) { return fmt.format(Math.round(n * 100) / 100); };
  var pct = function (n) { return String(n).replace(".", ",") + "%"; };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var esc = function (s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var parse = function (s) {
    s = String(s || "").trim().replace(/€|\s/g, "");
    if (!s) return 0;
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    var n = Number(s); return isFinite(n) && n > 0 ? n : 0;
  };
  var CHIAVE = "fx.ricevuta";
  var SALVA = ["r-nome", "r-cf", "r-ind", "r-iban", "r-luogo"];
  var mem = {};
  try { mem = JSON.parse(localStorage.getItem(CHIAVE) || "{}") || {}; } catch (e) { mem = {}; }
  SALVA.forEach(function (k) { if (mem[k]) $(k).value = mem[k]; });
  if (mem.num) $("r-num").value = mem.num;
  $("r-data").value = new Date().toISOString().slice(0, 10);

  function salva() {
    var o = { num: mem.num };
    SALVA.forEach(function (k) { o[k] = $(k).value.trim(); });
    try { localStorage.setItem(CHIAVE, JSON.stringify(o)); } catch (e) {}
  }
  function tipo() { var x = form.querySelector('input[name="r-tipo"]:checked'); return x ? x.value : "sost"; }
  function dataIt(v) { if (!v) return ""; var p = v.split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : v; }

  function calcola() {
    var L = parse($("r-lordo").value), sost = tipo() === "sost";
    var prec = sost ? parse($("r-prec").value) : 0, altra = $("r-altra").checked;
    var rit = sost ? r2(L * R.ritenuta / 100) : 0;
    // contributo INPS solo sulla parte dei compensi dell'anno oltre la franchigia di 5.000 €
    var ecc = sost ? Math.max(0, Math.min(L, prec + L - R.franchigia)) : 0;
    var aliq = altra ? R.inpsAltra : R.inps;
    var tot = r2(ecc * aliq / 100), prest = r2(tot / 3), comm = r2(tot - prest);
    return { L: L, sost: sost, prec: prec, rit: rit, ecc: ecc, aliq: aliq, inpsTot: tot, inpsPrest: prest, inpsComm: comm,
      netto: r2(L - rit - prest), bollo: L > R.sogliaBollo, superata: sost && prec + L > R.franchigia };
  }

  function documento(c) {
    var v = function (id) { return esc($(id).value.trim()); };
    var nome = v("r-nome") || "Nome e cognome", com = v("r-com") || "Committente";
    var data = dataIt($("r-data").value), anno = ($("r-data").value || "").slice(0, 4) || R.anno;
    var righe = "<tr><td>Compenso lordo</td><td>" + eur(c.L) + "</td></tr>";
    if (c.sost) righe += "<tr><td>Ritenuta d'acconto 20%</td><td>− " + eur(c.rit) + "</td></tr>";
    if (c.inpsPrest > 0) righe += "<tr><td>Contributo INPS gestione separata a carico del prestatore (1/3)</td><td>− " + eur(c.inpsPrest) + "</td></tr>";
    righe += "<tr class=\"tot\"><td>Netto a pagare</td><td>" + eur(c.netto) + "</td></tr>";
    var note = ["Prestazione esclusa dal campo di applicazione dell'IVA ai sensi dell'art. 5 del DPR 633/1972, in quanto svolta in modo occasionale."];
    if (c.sost) {
      note.push("Ritenuta d'acconto del 20% ai sensi dell'art. 25 del DPR 600/1973, da versare a cura del committente.");
      note.push("Il/La sottoscritto/a dichiara che nell'anno " + esc(anno) + " i compensi percepiti per prestazioni di lavoro autonomo occasionale, compreso il presente, " +
        (c.superata ? "hanno superato l'importo di 5.000 euro: il contributo alla gestione separata INPS (" + pct(c.aliq) + ") è dovuto su " + eur(c.ecc) +
          ", per un terzo a carico del prestatore e per due terzi a carico del committente (" + eur(c.inpsComm) + ")." : "non hanno superato l'importo di 5.000 euro."));
    } else note.push("Compenso non soggetto a ritenuta d'acconto, in quanto corrisposto da un soggetto che non è sostituto d'imposta.");
    if (c.bollo) note.push("Imposta di bollo di 2 euro assolta sull'originale.");
    return '<div class="doc">' +
      '<div class="doc-h"><div><b>' + nome + "</b>" + (v("r-ind") ? "<br>" + v("r-ind") : "") + (v("r-cf") ? "<br>C.F. " + v("r-cf") : "") + "</div>" +
      '<div class="dx">Spett.le<br><b>' + com + "</b>" + (v("r-comind") ? "<br>" + v("r-comind") : "") + (v("r-comcf") ? "<br>C.F./P.IVA " + v("r-comcf") : "") + "</div></div>" +
      "<h3>Ricevuta per prestazione di lavoro autonomo occasionale n. " + (v("r-num") || "1") + (data ? " del " + data : "") + "</h3>" +
      "<p>Il/La sottoscritto/a " + nome + " dichiara di ricevere da " + com + " la somma sotto indicata come compenso per la seguente prestazione di lavoro autonomo occasionale, " +
      "svolta in piena autonomia e senza vincolo di subordinazione: <b>" + (v("r-desc") || "descrizione della prestazione") + "</b>" + (v("r-per") ? " (" + v("r-per") + ")" : "") + ".</p>" +
      "<table>" + righe + "</table>" +
      note.map(function (t) { return '<p class="nota">' + t + "</p>"; }).join("") +
      (v("r-iban") ? "<p>Pagamento con bonifico sull'IBAN " + v("r-iban") + ".</p>" : "") +
      '<div class="doc-f">' + (c.bollo ? '<div class="bollo">Marca da bollo<br>2 €</div>' : "<div></div>") +
      '<div class="firma">' + (v("r-luogo") ? v("r-luogo") + ", " : "") + data + "<br><br>Firma<br><span></span></div></div></div>";
  }

  function aggiorna() {
    var c = calcola();
    $("r-inps-box").hidden = !c.sost;
    $("o-lordo").textContent = eur(c.L);
    $("o-rit").textContent = c.sost ? "− " + eur(c.rit) : "nessuna";
    $("o-inps").textContent = c.inpsPrest > 0 ? "− " + eur(c.inpsPrest) : "nessuno";
    $("o-netto").textContent = eur(c.netto);
    var n = [];
    if (c.bollo) n.push("Sopra 77,47 € serve la marca da bollo da 2 € sull'originale.");
    if (c.inpsTot > 0) n.push("Con i compensi dell'anno superi 5.000 €: contributo INPS del " + pct(c.aliq) + " su " + eur(c.ecc) + ". Il committente aggiunge " + eur(c.inpsComm) + " e versa tutto all'INPS. Ricordati di iscriverti alla gestione separata.");
    if (!c.sost) n.push("Con un privato non c'è ritenuta: indicherai il compenso nella dichiarazione dei redditi.");
    $("o-note").textContent = n.join(" ");
    $("ricevuta").innerHTML = documento(c);
    salva();
  }

  form.addEventListener("input", aggiorna);
  form.addEventListener("change", aggiorna);
  $("r-pdf").addEventListener("click", function () {
    var manca = ["r-nome", "r-cf", "r-com", "r-desc"].filter(function (k) { return !$(k).value.trim(); });
    if (!parse($("r-lordo").value)) manca.push("r-lordo");
    if (manca.length) {
      $("o-note").textContent = "Completa i campi mancanti: nome, codice fiscale, committente, descrizione e compenso.";
      $(manca[0]).focus();
      return;
    }
    aggiorna();
    var t = document.title;
    document.title = "Ricevuta " + ($("r-num").value || "1") + " - " + $("r-nome").value.trim();
    window.print();
    document.title = t;
    var num = parseInt($("r-num").value, 10);
    if (num > 0) { mem.num = String(num + 1); salva(); }
  });
  aggiorna();
})();
