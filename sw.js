const CACHE = "forfettix-v12";
// Pagine SEO (guide, check-up): sempre in rete, non devono sostituire l'app in cache
const SEO = ["/tasse-forfettario", "/check-up-partita-iva", "/commercialista-online-forfettario", "/conto-business-partita-iva", "/assicurazione-rc-professionale-freelance", "/aprire-partita-iva-forfettaria", "/forfettario-100000-euro-2027", "/ricevuta-prestazione-occasionale", "/prestazione-occasionale-o-partita-iva", "/privacy"];
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-32.png", "./ateco.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network-first per la pagina (così gli aggiornamenti arrivano subito), cache-first per il resto
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  // Le pagine guida (/tasse-forfettario/...) vanno sempre in rete: non devono sostituire l'app in cache
  if (SEO.some(x => url.pathname.startsWith(x)) || url.pathname.startsWith("/assets/") || url.pathname.endsWith(".xml") || url.pathname.endsWith(".txt")) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })));
});
