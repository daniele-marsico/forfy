// Un solo indirizzo ufficiale per Google: forfettix.controllinghub.com (ex forfy.controllinghub.com)
// - Le guide su forfy.controllinghub.com, forfy.pages.dev e sulle anteprime (<hash>.forfy.pages.dev) vengono reindirizzate (301).
// - L'app su altri indirizzi resta raggiungibile (chi la usa lì ha i dati salvati in quel browser),
//   ma viene marcata noindex così Google non la mostra come duplicato.
const CANONICAL = "forfettix.controllinghub.com";
// Pagine SEO: esistono solo sull'indirizzo ufficiale (tienile allineate a seo/kit.mjs KIT_PATHS)
const SEO = ["/tasse-forfettario", "/check-up-partita-iva", "/commercialista-online-forfettario", "/conto-business-partita-iva", "/assicurazione-rc-professionale-freelance", "/aprire-partita-iva-forfettaria"];

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === CANONICAL || url.hostname === "localhost") return next();

  if (SEO.some(x => url.pathname.startsWith(x)) || url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
    return Response.redirect(`https://${CANONICAL}${url.pathname}${url.search}`, 301);
  }

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("X-Robots-Tag", "noindex");
  return out;
}
