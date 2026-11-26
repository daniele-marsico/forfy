// Confronto prestazione occasionale / partita IVA forfettaria: stima annua di quanto resta netto.
// Occasionale: IRPEF in più sugli altri redditi (23/33/43%, senza detrazioni) + 1/3 di INPS oltre 5.000 €.
// Forfettario: reddito = incassi × coefficiente, INPS gestione separata, imposta 5% o 15%, commercialista facoltativo.
(function () {
  var box = document.querySelector(".occ[data-rif]");
  if (!box) return;
  var R = JSON.parse(box.dataset.rif);
  var $ = function (id) { return document.getElementById(id); };
  var fmt = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
  var eur = function (n) { return fmt.format(Math.round(n)); };
  var parse = function (s) {
    s = String(s || "").trim().replace(/€|\s/g, "");
    if (!s) return 0;
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    var n = Number(s); return isFinite(n) && n > 0 ? n : 0;
  };
  function irpef(x) {
    var tot = 0, da = 0;
    for (var i = 0; i < R.irpef.length; i++) {
      var a = R.irpef[i][0], al = R.irpef[i][1];
      if (x > da) tot += (Math.min(x, a) - da) * al / 100;
      da = a;
    }
    return tot;
  }
  // Detrazione per redditi di lavoro autonomo occasionale (art. 13, c. 5 TUIR), usata solo se non ci sono altri redditi
  function detr(rc) {
    if (rc <= 5500) return 1265;
    if (rc <= 28000) return 500 + 765 * (28000 - rc) / 22500;
    if (rc <= 50000) return 500 * (50000 - rc) / 22000;
    return 0;
  }
  function calcola() {
    var E = parse($("c-extra").value), A = parse($("c-altri").value), coef = Number($("c-coef").value);
    var nuova = $("c-new").checked, comm = $("c-comm").checked ? 366 : 0, altra = A > 0;
    // prestazione occasionale
    var ecc = Math.max(0, E - R.franchigia), inpsW = ecc * (altra ? R.inpsAltra : R.inps) / 100 / 3;
    var irO = A > 0 ? irpef(A + E - inpsW) - irpef(A) : Math.max(0, irpef(E - inpsW) - detr(E - inpsW));
    var netO = E - inpsW - irO;
    // forfettario
    var red = E * coef / 100, inpsF = red * (altra ? R.sepAltra : R.sep) / 100;
    var impF = Math.max(0, red - inpsF) * (nuova ? 5 : 15) / 100;
    var netF = E - inpsF - impF - comm;
    return { E: E, A: A, inpsW: inpsW, irO: irO, netO: netO, inpsF: inpsF, impF: impF, comm: comm, netF: netF, nuova: nuova, noForf: A > R.limiteDip };
  }
  function aggiorna() {
    var c = calcola();
    $("o-occ").innerHTML = "Ti restano <strong>" + eur(c.netO) + "</strong>";
    $("o-for").innerHTML = c.noForf ? "Non disponibile" : "Ti restano <strong>" + eur(c.netF) + "</strong>";
    var vo = $("v-occ"), vf = $("v-for");
    vo.className = "v"; vf.className = "v";
    var d = c.netF - c.netO, v = "";
    if (!c.E) v = "Inserisci quanto incassi in un anno con il lavoro extra.";
    else if (c.noForf) { v = "Con più di " + eur(R.limiteDip) + " di reddito da lavoro dipendente o pensione nell'anno precedente non puoi usare il forfettario: resta la prestazione occasionale, se il lavoro è davvero saltuario, oppure la partita IVA in regime ordinario."; vo.className = "v ok"; vf.className = "v crit"; }
    else if (d > 50) { v = "Con la partita IVA forfettaria ti restano circa <b>" + eur(d) + " in più l'anno</b>" + (c.comm ? ", anche pagando il commercialista." : "."); vf.className = "v ok"; }
    else if (d < -50) { v = "Con questi numeri la prestazione occasionale ti lascia circa <b>" + eur(-d) + " in più</b>. Va bene finché il lavoro resta davvero saltuario."; vo.className = "v ok"; }
    else v = "Le due strade si equivalgono: decide quanto è regolare il lavoro. Se è continuativo serve comunque la partita IVA.";
    $("o-verdetto").innerHTML = v;
    $("o-dett").textContent = c.E ? "Occasionale: IRPEF " + eur(c.irO) + (c.inpsW ? ", INPS a tuo carico " + eur(c.inpsW) : ", nessun contributo INPS (sotto 5.000 €)") +
      ". Forfettario: INPS " + eur(c.inpsF) + ", imposta " + (c.nuova ? "5%" : "15%") + " " + eur(c.impF) + (c.comm ? ", commercialista " + eur(c.comm) : "") +
      ". Stima indicativa: con altri redditi non consideriamo le detrazioni e usiamo l'aliquota INPS ridotta del 24%." : "";
  }
  ["c-extra", "c-altri", "c-coef", "c-new", "c-comm"].forEach(function (k) { $(k).addEventListener("input", aggiorna); $(k).addEventListener("change", aggiorna); });
  aggiorna();
})();
