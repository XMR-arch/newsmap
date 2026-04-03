import { useState, useEffect } from 'react'
import styles from './TopBar.module.css'

export default function TopBar({ onLocate, locating, locationLabel, onDateChange, date, onSearch }) {
  const [search, setSearch] = useState('')
  const [pulse, setPulse] = useState(null)

  // ── Sincronización con el "Ritual Digital" (state.json) ────────────────
  useEffect(() => {
    const fetchPulse = () => {
      fetch('/state.json?v=' + Date.now())
        .then(res => res.json())
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

  // ── Un solo return con la lógica de estilo integrada ───────────────────
  return (
    <div className={styles.barContainer}>
      <div 
        className={styles.bar}
        style={pulse ? { 
          borderBottom: `2px solid ${pulse.ui_theme.bar_color}`,
          boxShadow: `0 4px 20px ${pulse.ui_theme.bar_glow}`,
          backgroundColor: `rgba(0, 0, 0, 0.9)` 
        } : {}}
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
            <span className={styles.locLabel}>{locationLabel ?? 'Detectar'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}