import { useState } from 'react'
import styles from './TopBar.module.css'

export default function TopBar({ onLocate, locating, locationLabel, onDateChange, date, onSearch }) {
  const [search, setSearch] = useState('')

  const handleSearch = e => {
    e.preventDefault()
    onSearch(search)
  }

  return (
    <div className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.logo}>N</span>
        <span className={styles.title}>NEWSMAP</span>
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
  )
}
