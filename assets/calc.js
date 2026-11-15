// Calcolatore delle pagine guida: stessa formula e stessi parametri dell'app Forfy
(function () {
  var box = document.querySelector(".calc[data-coef]");
  if (!box) return;
  var P = { sep: 26.07, min: 18808, qa: 4521.36, qc: 4611.6, aa: 24, ac: 24.48 };
  var coef = Number(box.dataset.coef), gest = box.dataset.gest;
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
  function run() {
    var F = parse($("f-inc").value), R = F * coef / 100, inps;
    if (gest === "separata") inps = R * P.sep / 100;
    else {
      var q = gest === "artigiani" ? P.qa : P.qc, a = gest === "artigiani" ? P.aa : P.ac, k = $("f-sgr") && $("f-sgr").checked ? 0.65 : 1;
      inps = (q + Math.max(0, R - P.min) * a / 100) * k;
    }
    var ali = $("f-new").checked ? 5 : 15, tax = Math.max(0, R - inps) * ali / 100;
    $("o-red").textContent = eur(R); $("o-inps").textContent = eur(inps);
    $("o-tax").textContent = eur(tax) + " (" + ali + "%)"; $("o-net").textContent = eur(F - inps - tax);
    var m = $("o-msg");
    if (F > 100000) m.textContent = "Oltre 100.000 € esci dal forfettario già nell'anno in corso.";
    else if (F > 85000) m.textContent = "Oltre 85.000 € dal prossimo anno passi al regime ordinario.";
    else if (F > 0) m.textContent = "Ti mancano " + eur(85000 - F) + " al tetto degli 85.000 €. Ogni 100 € incassati, metti da parte " + eur((inps + tax) / F * 100) + ".";
    else m.textContent = "";
  }
  ["f-inc", "f-new", "f-sgr"].forEach(function (id) { var el = $(id); if (el) el.addEventListener("input", run); if (el) el.addEventListener("change", run); });
  run();
})();
