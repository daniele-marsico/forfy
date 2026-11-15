// Un solo indirizzo ufficiale per Google: forfy.controllinghub.com
// - Le guide su forfy.pages.dev e sulle anteprime (<hash>.forfy.pages.dev) vengono reindirizzate (301).
// - L'app su altri indirizzi resta raggiungibile (chi la usa lì ha i dati salvati in quel browser),
//   ma viene marcata noindex così Google non la mostra come duplicato.
const CANONICAL = "forfy.controllinghub.com";

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === CANONICAL || url.hostname === "localhost") return next();

  if (url.pathname.startsWith("/tasse-forfettario") || url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
    return Response.redirect(`https://${CANONICAL}${url.pathname}${url.search}`, 301);
  }

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("X-Robots-Tag", "noindex");
  return out;
}
