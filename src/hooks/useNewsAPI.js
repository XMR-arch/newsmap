import { useQuery } from '@tanstack/react-query'
import { DEMO_PAPERS } from '../data/papers.js'

const API_KEY = import.meta.env.VITE_WORLD_NEWS_API_KEY
const BASE_URL = 'https://api.worldnewsapi.com'

// Fetches front pages for a given country and date
async function fetchFrontPages(country, date) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    // Return demo data when no API key is configured
    return DEMO_PAPERS.filter(p => !country || p.country === country)
  }

  const dateStr = date ?? new Date().toISOString().split('T')[0]
  const params = new URLSearchParams({ date: dateStr })
  if (country) params.set('source-country', country)

  const res = await fetch(`${BASE_URL}/front-pages?${params}`, {
    headers: { 'x-api-key': API_KEY },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)

  const json = await res.json()

  // Normalize World News API response to our internal shape
  return (json['front-pages'] ?? []).map(page => ({
    id: page.id ?? String(Math.random()),
    cat: countryToRegion(page['source-country']),
    name: page['newspaper-name'] ?? page.title,
    city: page['source-country']?.toUpperCase(),
    country: page['source-country'],
    weight: estimateWeight(page),
    readers: null,
    headline: page['main-headline'] ?? page.title ?? '',
    imageUrl: page['front-page-image'] ?? null,
    url: page.url ?? null,
  }))
}

// Maps ISO country code to our region key
function countryToRegion(code) {
  const map = {
    ar:'latam', br:'latam', mx:'latam', cl:'latam', co:'latam', pe:'latam', uy:'latam', ve:'latam',
    us:'namerica', ca:'namerica',
    gb:'europe', fr:'europe', de:'europe', es:'europe', it:'europe', nl:'europe', pt:'europe',
    jp:'asia', cn:'asia', in:'asia', kr:'asia', sg:'asia', th:'asia', id:'asia',
    au:'oceania', nz:'oceania',
    za:'africa', ke:'africa', ng:'africa', eg:'africa', sn:'africa',
    sa:'mideast', ae:'mideast', qa:'mideast', il:'mideast', tr:'mideast',
  }
  return map[code?.toLowerCase()] ?? 'europe'
}

// Estimate weight from metadata when not available
function estimateWeight(page) {
  return Math.floor(Math.random() * 15) + 5
}

export function useNewsAPI({ country = null, date = null } = {}) {
  return useQuery({
    queryKey: ['front-pages', country, date],
    queryFn: () => fetchFrontPages(country, date),
    placeholderData: DEMO_PAPERS,
  })
}
