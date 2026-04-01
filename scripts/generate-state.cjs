// scripts/generate-state.js
// Genera public/state.json con estado publicable + layout precalculado
// Uso: node scripts/generate-state.js
// GitHub Actions: cada 5 min via cron

const fs = require("fs");
const path = require("path");

// ── Frases de estado ───────────────────────────────────────────────────────

const STATES = [
  "Surface tension rising",
  "Fragments drifting",
  "Density increasing",
  "Calm field",
  "Turbulence detected",
  "Signal noise ratio high",
  "Attention fragmented",
  "Convergence point",
  "Pressure building",
  "Still waters",
];

// ── Papers base (mirrors papers.js — fuente de verdad para el script) ──────

const PAPERS = [
  { id: "nyt",   cat: "namerica", name: "New York Times",    weight: 24 },
  { id: "wapo",  cat: "namerica", name: "Washington Post",   weight: 18 },
  { id: "guar",  cat: "europe",   name: "The Guardian",      weight: 22 },
  { id: "lemon", cat: "europe",   name: "Le Monde",          weight: 20 },
  { id: "spieg", cat: "europe",   name: "Der Spiegel",       weight: 16 },
  { id: "clar",  cat: "latam",    name: "Clarín",            weight: 22 },
  { id: "folh",  cat: "latam",    name: "Folha de S.Paulo",  weight: 16 },
  { id: "asahi", cat: "asia",     name: "Asahi Shimbun",     weight: 20 },
  { id: "peop",  cat: "asia",     name: "People's Daily",    weight: 22 },
  { id: "alj",   cat: "mideast",  name: "Al Jazeera",        weight: 20 },
  { id: "smh",   cat: "oceania",  name: "Sydney Morning Herald", weight: 14 },
  { id: "nat",   cat: "africa",   name: "Daily Nation",      weight: 9  },
];

// ── Squarified treemap (mismo algoritmo que useTreemap.js) ─────────────────

function calcWorst(row, shorter, rowArea) {
  if (!rowArea || !shorter) return Infinity;
  const strip = rowArea / shorter;
  const rowW = row.reduce((s, b) => s + b._w, 0);
  let worst = 0;
  for (const b of row) {
    const brd = (rowArea * (b._w / rowW)) / strip;
    const r = Math.max(strip / brd, brd / strip);
    if (r > worst) worst = r;
  }
  return worst;
}

function buildLayout(papers, W, H) {
  const blocks = papers.map(p => ({ ...p, _w: p.weight }));
  const sorted = [...blocks].sort((a, b) => b._w - a._w);
  const totalW = sorted.reduce((s, b) => s + b._w, 0);
  if (!totalW) return [];

  let w = W, h = H;
  const rows = [];
  let rem = [...sorted];
  let aLeft = totalW;

  while (rem.length > 0) {
    const sh = Math.min(w, h);
    let row = [rem[0]];
    let bw = calcWorst(row, sh, (row[0]._w / aLeft) * w * h);
    let i = 1;
    while (i < rem.length) {
      const test = [...row, rem[i]];
      const ta = test.reduce((s, b) => s + b._w, 0) / aLeft * w * h;
      const tw = calcWorst(test, sh, ta);
      if (tw <= bw) { row = test; bw = tw; i++; } else break;
    }
    const rw2 = row.reduce((s, b) => s + b._w, 0);
    rows.push({ items: row, dir: w >= h ? "h" : "v" });
    const frac = rw2 / aLeft;
    if (w >= h) w -= w * frac; else h -= h * frac;
    aLeft -= rw2;
    rem = rem.slice(row.length);
  }

  const res = [];
  let x = 0, y = 0;
  w = W; h = H;
  let wLeft = totalW;

  for (const row of rows) {
    const rw2 = row.items.reduce((s, b) => s + b._w, 0);
    const frac = rw2 / wLeft;
    if (row.dir === "h") {
      const cw = w * frac; let yy = y;
      for (const b of row.items) {
        const ih = h * (b._w / rw2);
        res.push({ id: b.id, cat: b.cat, name: b.name, weight: b.weight,
          x: Math.round(x), y: Math.round(yy),
          w: Math.round(cw), h: Math.round(ih) });
        yy += ih;
      }
      x += cw; w -= cw;
    } else {
      const ch = h * frac; let xx = x;
      for (const b of row.items) {
        const iw = w * (b._w / rw2);
        res.push({ id: b.id, cat: b.cat, name: b.name, weight: b.weight,
          x: Math.round(xx), y: Math.round(y),
          w: Math.round(iw), h: Math.round(ch) });
        xx += iw;
      }
      y += ch; h -= ch;
    }
    wLeft -= rw2;
  }
  return res;
}

// ── Generar estado ─────────────────────────────────────────────────────────

function generateState() {
  const now = new Date();
  const phrase = STATES[Math.floor(Math.random() * STATES.length)];

  // Pesos con variación aleatoria ±20% para animar el treemap entre estados
  const papersWithVariation = PAPERS.map(p => ({
    ...p,
    weight: Math.max(3, Math.round(p.weight * (0.8 + Math.random() * 0.4))),
  }));

  // Pesos por región (suma normalizada de weights)
  const regionWeights = {};
  for (const p of papersWithVariation) {
    regionWeights[p.cat] = (regionWeights[p.cat] || 0) + p.weight;
  }
  const maxRegion = Math.max(...Object.values(regionWeights));
  for (const k in regionWeights) {
    regionWeights[k] = parseFloat((regionWeights[k] / maxRegion).toFixed(2));
  }

  const state = {
    timestamp:      now.toISOString(),
    headline:       `Swim Mistress — ${phrase}`,
    intensity:      parseFloat(Math.random().toFixed(2)),
    region_weights: regionWeights,
    layout:         buildLayout(papersWithVariation, 1280, 720),
  };

  const outPath = path.join(__dirname, "..", "public", "state.json");
  fs.writeFileSync(outPath, JSON.stringify(state, null, 2));
  console.log(`[${now.toISOString()}] State updated: ${state.headline} (intensity: ${state.intensity})`);
}

generateState();
