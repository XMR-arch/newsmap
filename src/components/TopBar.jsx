import { useState, useEffect } from 'react'
import styles from './TopBar.module.css'

export default function TopBar({ onLocate, locating, locationLabel, onDateChange, date, onSearch }) {
  const [search, setSearch] = useState('')
  const [pulse, setPulse] = useState(null)

  // ── Sincronización con el "Ritual Digital" (state.json) ────────────────
  useEffect(() => {
    const fetchPulse = () => {
      // Usamos path relativo './' para asegurar que encuentre el archivo en public/
      fetch(`${window.location.origin}/state.json?v=${Date.now()}`)
        .then(res => {
          if (!res.ok) throw new Error("Archivo no encontrado");
          return res.json();
        })
        .then(data => setPulse(data))
        .catch(err => console.error("Error en el pulso:", err));
    };

    fetchPulse();
    const interval = setInterval(fetchPulse, 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleSearch = e => {
    e.preventDefault()
    onSearch(search)
  }

  return (
    <div className={styles.barContainer} id="top-bar">
      <div 
        className={styles.bar}
        style={pulse ? { 
          // Si hay datos, aplicamos el color del ritual (Verde/Cian/Naranja)
          borderBottom: `3px solid ${pulse.ui_theme.bar_color}`,
          boxShadow: `0 4px 20px ${pulse.ui_theme.bar_glow}`,
          backgroundColor: `rgba(0, 0, 0, 0.95)` 
        } : {
          // Si NO hay datos (pulse === null), mostramos el fucsia de error
          borderBottom: `2px solid #ff00ff`
        }}
      >
        <div className={styles.brand}>
          <span className={styles.logo}>N</span>
          <span className={styles.title}>
            {pulse ? pulse.headline.toUpperCase() : 'NEWSMAP'}
          </span>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            id="search"
            name="search"
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="país, ciudad, diario..."
          />
          <button type="submit" className={styles.searchBtn}>→</button>
        </form>

        <div className={styles.controls}>
          <input
            id="datePicker"
            name="datePicker"
            type="date"
            className={styles.datePicker}
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => onDateChange(e.target.value)}
          />
          <button
            className={styles.locateBtn}
            onClick={onLocate}
            disabled={locating}
            title="Usar mi ubicación"
          >
            {locating ? '⟳' : '◎'}
            <span className={styles.locLabel}>{locationLabel ?? 'Posicionar'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}