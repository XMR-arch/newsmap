import { useQuery } from '@tanstack/react-query';
import { DEMO_PAPERS } from '../data/papers.js';

/**
 * @typedef {Object} Newspaper
 * @property {string}      id       - Identificador único estático
 * @property {string}      cat      - Región (ej: 'europe')
 * @property {string}      name     - Nombre del periódico
 * @property {string}      city     - Ciudad de publicación
 * @property {string}      country  - Código ISO del país (ej: 'ar')
 * @property {number}      weight   - Peso relativo en el treemap
 * @property {string|null} readers  - Lectores estimados (ej: '9.8M')
 * @property {string}      headline - Titular principal
 */

/**
 * Obtiene titulares frescos de /headlines.json (generado por GitHub Actions via RSS)
 * y los mergea sobre DEMO_PAPERS. Si el fetch falla, usa los titulares de demo.
 *
 * @param {string|null} country - Código ISO del país
 * @param {string|null} date    - Fecha YYYY-MM-DD (reservado para API real)
 * @returns {Promise<Newspaper[]>}
 */
async function fetchFrontPages(country, date) {
  let headlineMap = {};

  try {
    const res = await fetch(`/headlines.json?v=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      headlineMap = data.headlines ?? {};
    }
  } catch {
    // headlines.json no disponible — se usan titulares de demo silenciosamente
  }

  const merged = DEMO_PAPERS.map(paper => ({
    ...paper,
    headline: headlineMap[paper.id] ?? paper.headline,
  }));

  const filtered = country
    ? merged.filter(p => p.country === country)
    : merged;

  return filtered;
}

/**
 * Hook para obtener y cachear portadas de periódicos.
 *
 * @param {Object}      options
 * @param {string|null} options.country - Filtra por país (ISO 2 letras)
 * @param {string|null} options.date    - Filtra por fecha (YYYY-MM-DD)
 */
export function useNewsAPI({ country = null, date = null } = {}) {
  return useQuery({
    queryKey:        ['front-pages', country, date],
    queryFn:         () => fetchFrontPages(country, date),
    placeholderData: DEMO_PAPERS,
    staleTime:       1000 * 60 * 5, // 5 minutos
  });
}