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
 * Obtiene portadas de periódicos.
 * TODO: reemplazar con llamada real a backend cuando esté disponible.
 *
 * @param {string|null} country - Código ISO del país
 * @param {string|null} date    - Fecha YYYY-MM-DD (reservado para API real)
 * @returns {Promise<Newspaper[]>}
 */
async function fetchFrontPages(country, date) {
  return new Promise(resolve => {
    setTimeout(() => {
      const filtered = DEMO_PAPERS.filter(p => !country || p.country === country)
      resolve(filtered)
    }, 500)
  })
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
    queryKey:       ['front-pages', country, date],
    queryFn:        () => fetchFrontPages(country, date),
    placeholderData: DEMO_PAPERS,
    staleTime:       1000 * 60 * 5, // 5 minutos
  })
}