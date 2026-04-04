// scripts/fetch-headlines.cjs
// Scrapea el primer titular de cada diario vía RSS y escribe public/headlines.json
// Sin dependencias externas — solo módulos nativos de Node.js

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── RSS feeds por id de diario ───────────────────────────────────────────────
const RSS_FEEDS = {
  // N. América
  nyt:   'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  wapo:  'https://feeds.washingtonpost.com/rss/national',
  lat:   'https://www.latimes.com/local/rss2.0.xml',
  glob:  'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/',

  // Latinoamérica
  clar:  'https://www.clarin.com/rss/lo-ultimo/',
  lnac:  'https://www.lanacion.com.ar/arc/outboundfeeds/rss/',
  folh:  'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml',
  tiemp: 'https://www.eltiempo.com/rss/colombia.xml',
  univ:  'https://www.eluniversal.com.mx/rss.xml',
  terc:  'https://www.latercera.com/feed/',
  com:   'https://elcomercio.pe/rss/',

  // Europa
  lemon:  'https://www.lemonde.fr/rss/une.xml',
  spieg:  'https://www.spiegel.de/international/index.rss',
  guar:   'https://www.theguardian.com/world/rss',
  elpais: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
  corr:   'https://xml2.corriereobjects.it/rss/homepage.xml',
  volk:   'https://www.volkskrant.nl/nieuws-achtergrond/rss.xml',

  // Asia
  asahi: 'https://www.asahi.com/rss/asahi/newsheadlines.rdf',
  peop:  'http://en.people.cn/rss/90001.xml',
  hindu: 'https://www.thehindu.com/feeder/default.rss',
  chos:  'https://www.koreaherald.com/rss/0200000000.xml', // Korea Herald como proxy en inglés
  str:   'https://www.straitstimes.com/news/world/rss.xml',

  // África
  nat:  'https://nation.africa/rss.xml',
  mav:  'https://www.dailymaverick.co.za/feed/',
  lmaf: 'https://www.lemonde.fr/afrique/rss_full.xml',

  // Oceanía
  smh:  'https://www.smh.com.au/rss/feed.xml',
  taus: 'https://www.theaustralian.com.au/feed',
  nzh:  'https://www.nzherald.co.nz/arc/outboundfeeds/rss/',

  // Medio Oriente
  alj:  'https://www.aljazeera.com/xml/rss/all.xml',
  haar: 'https://www.haaretz.com/cmlink/1.628765',
  arab: 'https://www.arabnews.com/rss.xml',
};

// ── Fetch con soporte http/https y timeout ───────────────────────────────────
function fetchUrl(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'NewsMapBot/1.0' } }, res => {
      // Seguir redirects
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

// ── Extraer primer titular del XML ───────────────────────────────────────────
function extractFirstHeadline(xml) {
  // Saltear el título del canal (<channel><title>...</title>) y tomar el primero de <item>
  const itemMatch = xml.match(/<item[\s>][\s\S]*?<\/item>/i);
  if (!itemMatch) return null;

  const item = itemMatch[0];

  // Intentar <title><![CDATA[...]]></title>
  const cdataMatch = item.match(/<title>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/title>/i);
  if (cdataMatch) return cdataMatch[1].trim();

  // Fallback: <title>texto plano</title>
  const plainMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (plainMatch) return plainMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();

  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function fetchAllHeadlines() {
  const results = {};
  const errors  = [];

  const entries = Object.entries(RSS_FEEDS);
  console.log(`[fetch-headlines] Procesando ${entries.length} diarios...`);

  // Fetch en paralelo con Promise.allSettled — un error no detiene los demás
  const settled = await Promise.allSettled(
    entries.map(async ([id, url]) => {
      const xml      = await fetchUrl(url);
      const headline = extractFirstHeadline(xml);
      if (!headline) throw new Error('No headline found');
      return { id, headline };
    })
  );

  settled.forEach((result, i) => {
    const [id] = entries[i];
    if (result.status === 'fulfilled') {
      results[id] = result.value.headline;
      console.log(`  ✓ ${id}: ${result.value.headline.slice(0, 60)}...`);
    } else {
      errors.push(id);
      console.warn(`  ✗ ${id}: ${result.reason.message}`);
    }
  });

  // Escribir output
  const outPath = path.join(process.cwd(), 'public', 'headlines.json');
  const output  = {
    timestamp: new Date().toISOString(),
    fetched:   Object.keys(results).length,
    failed:    errors,
    headlines: results,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n[fetch-headlines] ✓ ${output.fetched} titulares guardados en public/headlines.json`);
  if (errors.length) console.warn(`[fetch-headlines] ✗ ${errors.length} fallidos: ${errors.join(', ')}`);
}

fetchAllHeadlines().catch(err => {
  console.error('[fetch-headlines] Error fatal:', err);
  process.exit(1);
});
