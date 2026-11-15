// Copia il sito (cartella superiore) dentro www/ per includerlo nell'app: così funziona anche offline
import { cpSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
const skip = new Set(['app', '.git', '.github', '.well-known', 'seo', 'README.md', 'sitemap.xml', 'robots.txt', '_redirects', '_headers', 'assetlinks.json']);
rmSync('www', { recursive: true, force: true }); mkdirSync('www');
for (const f of readdirSync('..')) if (!skip.has(f)) cpSync('../' + f, 'www/' + f, { recursive: true });
console.log('www pronto');
