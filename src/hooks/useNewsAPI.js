import { useQuery } from '@tanstack/react-query';
import { DEMO_PAPERS } from '../data/papers.js';

// Tipos básicos para los datos de los periódicos
/**
 * @typedef {Object} Newspaper
 * @property {string} id - Identificador único
 * @property {string} cat - Categoría/región (ej: 'europe')
 * @property {string} name - Nombre del periódico
 * @property {string} city - Ciudad de publicación
 * @property {string} country - Código ISO del país
 * @property {number} weight - Peso (tamaño en el treemap)
 * @property {number|null} readers - Número de lectores (opcional)
 * @property {string} headline - Titular principal
 * @property {string|null} imageUrl - URL de la imagen de la portada
 * @property {string|null} url - URL del periódico
 */

/**
 * Mapea el código ISO del país a una región
 * @param {string} code - Código ISO del país (ej: 'es')
 * @returns {string} - Región (ej: 'europe')
 */
function countryToRegion(code) {
  const regionMap = {
    ar: 'latam', br: 'latam', mx: 'latam', cl: 'latam', co: 'latam', pe: 'latam', uy: 'latam', ve: 'latam',
    us: 'namerica', ca: 'namerica',
    gb: 'europe', fr: 'europe', de: 'europe', es: 'europe', it: 'europe', nl: 'europe', pt: 'europe',
    jp: 'asia', cn: 'asia', in: 'asia', kr: 'asia', sg: 'asia', th: 'asia', id: 'asia',
    au: 'oceania', nz: 'oceania',
    za: 'africa', ke: 'africa', ng: 'africa', eg: 'africa', sn: 'africa',
    sa: 'mideast', ae: 'mideast', qa: 'mideast', il: 'mideast', tr: 'mideast',
  };
  return regionMap[code?.toLowerCase()] ?? 'europe';
}

/**
 * Genera un ID aleatorio para periódicos sin ID
 * @returns {string} - ID aleatorio
 */
function generateRandomId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Estima el peso del periódico si no está disponible
 * @returns {number} - Peso aleatorio entre 5 y 20
 */
function estimateWeight() {
  return Math.floor(Math.random() * 15) + 5;
}

/**
 * Datos de ejemplo basados en kiosko.net
 * @type {Newspaper[]}
 */
const KIOSKO_DEMO_DATA = [
  {
    id: `es_elmundo_${generateRandomId()}`,
    cat: 'europe',
    name: 'El Mundo',
    city: 'MADRID',
    country: 'es',
    weight: 12,
    readers: null,
    headline: 'Últimas noticias de España y el mundo',
    imageUrl: 'https://www.kiosko.net/img/es/elmundo.jpg',
    url: 'https://www.kiosko.net/es/esp/elmundo.htm',
  },
  {
    id: `es_elpais_${generateRandomId()}`,
    cat: 'europe',
    name: 'El País',
    city: 'MADRID',
    country: 'es',
    weight: 15,
    readers: null,
    headline: 'Noticias internacionales y nacionales',
    imageUrl: 'https://www.kiosko.net/img/es/elpais.jpg',
    url: 'https://www.kiosko.net/es/esp/elpais.htm',
  },
  // Añade más periódicos aquí según sea necesario
];

/**
 * Obtiene las portadas de kiosko.net (simulado)
 * @param {string|null} country - Código ISO del país (ej: 'es')
 * @param {string|null} date - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Newspaper[]>} - Lista de periódicos
 */
async function fetchKioskoFrontPages(country, date) {
  // Simulación: Usa datos estáticos de kiosko.net
  // En un entorno real, reemplaza esto con una llamada a un backend que haga scraping
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredData = KIOSKO_DEMO_DATA.filter(
        (paper) => !country || paper.country === country
      );
      resolve(filteredData);
    }, 500); // Simula un retraso de red
  });
}

/**
 * Hook personalizado para obtener portadas de periódicos
 * @param {Object} options - Opciones para filtrar los datos
 * @param {string|null} options.country - Código ISO del país
 * @param {string|null} options.date - Fecha en formato YYYY-MM-DD
 * @returns {Object} - Objeto de consulta de React Query
 */
export function useNewsAPI({ country = null, date = null } = {}) {
  return useQuery({
    queryKey: ['front-pages', country, date],
    queryFn: () => fetchKioskoFrontPages(country, date),
    placeholderData: DEMO_PAPERS,
    staleTime: 1000 * 60 * 5, // 5 minutos de datos "frescos"
  });
}