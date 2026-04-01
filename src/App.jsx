import { useState, useCallback, useMemo } from 'react'
import { useNewsAPI } from './hooks/useNewsAPI.js'
import { useGeolocation } from './hooks/useGeolocation.js'
import { useHud } from './components/Hud.jsx'
import Treemap from './components/Treemap.jsx'
import TopBar from './components/TopBar.jsx'
import Legend from './components/Legend.jsx'
import Hud from './components/Hud.jsx'
import styles from './App.module.css'

export default function App() {
  const [activeCat, setActiveCat] = useState(null)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [countryFilter, setCountryFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { stats, update: updateHud } = useHud()

  const { country, city, loading: locating, detect } = useGeolocation()
  const locationLabel = city ? `${city}` : country ? country.toUpperCase() : 'Detectar'

  // When geolocation resolves, filter by that country
  const activeCountry = countryFilter ?? country

  const { data: papers, isLoading } = useNewsAPI({
    country: activeCountry,
    date,
  })

  // Client-side search filter on top of API data
  const filteredPapers = useMemo(() => {
    if (!papers) return []
    if (!searchQuery) return papers
    const q = searchQuery.toLowerCase()
    return papers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.headline?.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q) ||
      p.cat?.toLowerCase().includes(q)
    )
  }, [papers, searchQuery])

  const handleToggleCat = useCallback((key) => {
    setActiveCat(prev => prev === key ? null : key)
  }, [])

  const handleHudUpdate = useCallback(() => {}, [])

  // Wire HUD updates from treemap loop
  const hudRef = useCallback((node) => {
    if (!node) return
    node.update = () => updateHud({ blocks: node.blocks, layouts: node.layouts, ms: node.ms })
  }, [updateHud])

  return (
    <div className={styles.app}>
      <TopBar
        onLocate={detect}
        locating={locating}
        locationLabel={locationLabel}
        date={date}
        onDateChange={setDate}
        onSearch={setSearchQuery}
      />

      <div className={styles.stage}>
        {isLoading && (
          <div className={styles.loading}>
            <span className={styles.loadingDot}>●</span> cargando portadas...
          </div>
        )}
        <Treemap
          papers={filteredPapers}
          activeCat={activeCat}
          onHudUpdate={hudRef}
        />
        <Hud stats={stats} />
      </div>

      <Legend activeCat={activeCat} onToggle={handleToggleCat} />
    </div>
  )
}
