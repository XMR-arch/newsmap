import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [state, setState] = useState({
    country: null,   // ISO 2-letter code, e.g. 'ar'
    city: null,
    loading: false,
    error: null,
  })

  const detect = () => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocalización no disponible' }))
      return
    }
    setState(s => ({ ...s, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          // Free reverse geocoding via BigDataCloud (no key needed for basic usage)
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=es`
          )
          const data = await res.json()
          setState({
            country: data.countryCode?.toLowerCase() ?? null,
            city: data.city || data.locality || null,
            loading: false,
            error: null,
          })
        } catch {
          setState(s => ({ ...s, loading: false, error: 'No se pudo obtener la ubicación' }))
        }
      },
      (err) => {
        setState({ country: null, city: null, loading: false, error: err.message })
      },
      { timeout: 8000 }
    )
  }

  return { ...state, detect }
}
