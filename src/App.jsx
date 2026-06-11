import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { useNewsAPI } from './hooks/useNewsAPI.js';
import Hud, { useHud } from './components/Hud.jsx';
import Treemap from './components/Treemap.jsx';
import Legend from './components/Legend.jsx';

import styles from './App.module.css';

export default function App() {
  const [activeCat, setActiveCat] = useState(null);
  const [searchQuery]             = useState('');

  const [externalState, setExternalState] = useState(null);

  useEffect(() => {
    fetch('/state.json')
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => setExternalState(data))
      .catch(() => {});
  }, []);

  const { stats, update: updateHud } = useHud();

  const { data: papers = [], isLoading: newsLoading } = useNewsAPI({});

  const firstGoodResponse = useRef(null);

  const stablePapers = useMemo(() => {
    if (firstGoodResponse.current) return firstGoodResponse.current;
    if (papers.length >= 10) {
      firstGoodResponse.current = papers;
      return papers;
    }
    return papers;
  }, [papers]);

  const filteredPapers = useMemo(() => {
    if (!stablePapers?.length) return [];
    if (!searchQuery?.trim()) return stablePapers;
    const q = searchQuery.toLowerCase().trim();
    return stablePapers.filter(p =>
      (p.name?.toLowerCase()    || '').includes(q) ||
      (p.city?.toLowerCase()    || '').includes(q) ||
      (p.headline?.toLowerCase()|| '').includes(q) ||
      (p.country?.toLowerCase() || '').includes(q) ||
      (p.cat?.toLowerCase()     || '').includes(q)
    );
  }, [stablePapers, searchQuery]);

  const handleToggleCat = useCallback((key) => {
    setActiveCat(prev => prev === key ? null : key);
  }, []);

  const handleHudUpdate = useCallback(() => {
    if (updateHud) updateHud(prev => ({ ...prev }));
  }, [updateHud]);

  return (
    <div className={styles.app}>

      {externalState && (
        <div className={styles.stateBanner}>
          <div className={styles.intensityContainer}>
            <span className={styles.intensityLabel}>Intensity</span>
            <div className={styles.intensityBar}>
              <div
                className={styles.intensityFill}
                style={{ width: `${externalState.intensity * 100}%` }}
              />
            </div>
            <span className={styles.intensityValue}>
              {(externalState.intensity * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      <div className={styles.stage}>
        {newsLoading && (
          <div className={styles.loading}>
            <span className={styles.loadingDot}>●</span> cargando...
          </div>
        )}

        <Treemap
          papers={filteredPapers}
          activeCat={activeCat}
          onHudUpdate={handleHudUpdate}
        />

        <Hud stats={stats} />
      </div>

      <Legend
        activeCat={activeCat}
        onToggle={handleToggleCat}
      />
    </div>
  );
}