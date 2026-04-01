# Newsmap

Treemap vivo de portadas de periódicos geolocalizadas.  
31+ diarios del mundo, sized por alcance, expandiéndose al cursor sin un solo DOM reflow.  
Built with **Pretext** by Cheng Lou + React + Vite → deploy en Vercel.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 18 + Vite 5 |
| Layout de texto | `@chenglou/pretext` — sin reflows |
| Data fetching | TanStack React Query |
| Noticias | World News API (demo data incluida) |
| Geolocalización | BigDataCloud reverse geocoding (gratuito) |
| Deploy | Vercel (zero config) |

---

## Setup local

```bash
# 1. Clonar o descomprimir
cd newsmap

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
# Editar .env y agregar tu API key de worldnewsapi.com
# Sin key funciona igual con datos de demo

# 4. Correr en desarrollo
npm run dev
# → http://localhost:5173
```

---

## Deploy en Vercel

```bash
# Opción A — desde CLI
npm i -g vercel
vercel

# Opción B — desde GitHub
# 1. Push a GitHub
# 2. Import en vercel.com → auto-detecta Vite
# 3. Agregar env var: VITE_WORLD_NEWS_API_KEY
# 4. Deploy ✓
```

---

## Estructura del proyecto

```
newsmap/
├── src/
│   ├── components/
│   │   ├── Treemap.jsx        ← canvas principal, monta bloques DOM
│   │   ├── TopBar.jsx         ← búsqueda, fecha, geolocalización
│   │   ├── Legend.jsx         ← filtro por región
│   │   └── Hud.jsx            ← contador Pretext en tiempo real
│   ├── hooks/
│   │   ├── useTreemap.js      ← squarified layout + Pretext loop
│   │   ├── useNewsAPI.js      ← React Query + World News API
│   │   └── useGeolocation.js  ← navigator.geolocation + reverse geocoding
│   ├── data/
│   │   └── papers.js          ← datos de demo + definición de regiones
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vercel.json
└── vite.config.js
```

---

## Cómo funciona Pretext aquí

Cada bloque llama a `layout()` cada frame para saber cuánto texto cabe  
a sus dimensiones actuales — sin tocar el DOM ni causar reflows.

```js
// En el loop de animación (60fps):
layout(b.prep, Math.max(20, rw - 16), LH)  // puro aritmética
// → 0.05ms para 31 bloques
// Con DOM measurement serían 31 reflows × 16ms = browser bloqueado
```

---

## Próximos pasos

- [ ] Slider de fecha "day by day, hour by hour" con timeline animado
- [ ] Vectores de flujo mediático entre regiones (canvas overlay)
- [ ] Portadas como imágenes reales (World News API `front-page-image`)
- [ ] Modo mapa: Leaflet con puntos geolocalizados que filtran el treemap
- [ ] PWA con Service Worker para leer offline
