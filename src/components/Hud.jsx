import { useState, useCallback } from 'react'
import styles from './Hud.module.css'

export function useHud() {
  const [stats, setStats] = useState({ blocks: 0, layouts: 0, ms: '0.00' })
  const update = useCallback((next) => setStats(s => ({ ...s, ...next })), [])
  return { stats, update }
}

export default function Hud({ stats }) {
  return (
    <div className={styles.hud}>
      <span className={styles.val}>{stats.blocks}</span> portadas ·{' '}
      <span className={styles.val}>{stats.layouts}</span> layouts/frame ·{' '}
      <span className={styles.val}>{stats.ms}</span>ms · Pretext
    </div>
  )
}
