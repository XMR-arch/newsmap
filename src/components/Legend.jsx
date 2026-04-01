import styles from './Legend.module.css';
import { REGIONS } from '../data/papers.js';

export default function Legend({ activeCat, onToggle }) {
  return (
    <div className={styles.bar}>
      {Object.entries(REGIONS).map(([key, cat]) => (
        <button
          key={key}
          className={`${styles.item} ${activeCat === key ? styles.active : ''}`}
          onClick={() => onToggle(key)}
          style={{ '--accent': cat.accent }}
        >
          <span className={styles.dot} />
          <span className={styles.label}>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}