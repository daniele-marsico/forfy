// Calcolatore "Forfettario a 100.000 € dal 2027": stessa formula dell'app Forfettix,
// confronto tra regole attuali e regole proposte dal ddl di bilancio 2027
(function () {
  var box = document.querySelector(".c27[data-p]");
  if (!box) return;
  var P = JSON.parse(box.dataset.p);
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
  // Cosa succede con gli incassi dell'anno: [testo, livello] per regole attuali e proposte 2027
  function oggi(F) {
    if (F > 100000) return ["Esci subito dal forfettario: IVA dall'operazione che supera i 100.000 € e IRPEF ordinaria su tutto l'anno.", "crit"];
    if (F > 85000) return ["Resti forfettario quest'anno, ma dall'anno dopo passi al regime ordinario (IVA e IRPEF).", "warn"];
    return ["Resti forfettario: flat tax e niente IVA.", "ok"];
  }
  function dal2027(F) {
    if (F > 115000) return ["Esci subito dal forfettario anche per le tasse: IRPEF ordinaria su tutto l'anno.", "crit"];
    if (F > 100000) return ["L'IVA scatta subito, la flat tax resta fino a fine anno. Dall'anno dopo regime ordinario.", "crit"];
    if (F > 85000) return ["Resti in flat tax, ma diventi soggetto IVA (da quando di preciso lo dirà il testo finale).", "warn"];
    return ["Resti forfettario: flat tax e niente IVA.", "ok"];
  }
  function run() {
    var F = parse($("s-inc").value), coef = Number($("s-coef").value), gest = $("s-gest").value;
    var R = F * coef / 100, inps;
    if (gest === "separata") inps = R * P.sep / 100;
    else {
      var q = gest === "artigiani" ? P.qa : P.qc, a = gest === "artigiani" ? P.aa : P.ac;
      inps = q + Math.max(0, R - P.min) * a / 100;
    }
    var ali = $("s-new").checked ? 5 : 15, tax = Math.max(0, R - inps) * ali / 100;
    $("s-red").textContent = eur(R); $("s-inps").textContent = eur(inps);
    $("s-tax").textContent = eur(tax) + " (" + ali + "%)"; $("s-net").textContent = eur(F - inps - tax);
    var a = oggi(F), b = dal2027(F);
    $("v-oggi").textContent = a[0]; $("v-oggi").parentNode.className = "v " + a[1];
    $("v-2027").textContent = b[0]; $("v-2027").parentNode.className = "v " + b[1];
    $("s-acc").textContent = F > 0 ? "Su ogni 100 € incassati metti da parte circa " + eur((inps + tax) / F * 100) + " tra INPS e imposta." : "";
  }
  ["s-inc", "s-coef", "s-gest", "s-new"].forEach(function (id) { var el = $(id); el.addEventListener("input", run); el.addEventListener("change", run); });
  // L'attività suggerisce la gestione INPS più comune
  $("s-coef").addEventListener("change", function () {
    var g = this.options[this.selectedIndex].dataset.gest; if (g) { $("s-gest").value = g; run(); }
  });
  run();
})();
