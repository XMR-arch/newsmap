import { useState, useCallback, useMemo, useRef } from 'react';

import { useNewsAPI } from './hooks/useNewsAPI.js';
import { useGeolocation } from './hooks/useGeolocation.js';

import Hud, { useHud } from './components/Hud.jsx';
import Treemap from './components/Treemap.jsx';
import TopBar from './components/TopBar.jsx';
import Legend from './components/Legend.jsx';

import styles from './App.module.css';

export default function App() {
  const [activeCat, setActiveCat]     = useState(null);
  const [date, setDate]               = useState(() => new Date().toISOString().split('T')[0]);
  const [countryFilter]               = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { stats, update: updateHud } = useHud();
  const { country, city, loading: locating, detect } = useGeolocation();
  const locationLabel = city ? `${city}` : country ? country.toUpperCase() : 'Detectar';
  const activeCountry = countryFilter ?? country;

  const { data: papers = [], isLoading: newsLoading } = useNewsAPI({
    country: activeCountry,
    date,
  });

  const firstGoodResponse = useRef(null);
  const prevKey = useRef(null);
  const currentKey = `${activeCountry}-${date}`;

  const stablePapers = useMemo(() => {
    if (prevKey.current !== currentKey) {
      firstGoodResponse.current = null;
      prevKey.current = currentKey;
    }
    if (firstGoodResponse.current) return firstGoodResponse.current;
    if (papers.length >= 10) {
      firstGoodResponse.current = papers;
      return papers;
    }
    return papers;
  }, [papers, currentKey]);

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
      <TopBar
        onLocate={detect}
        locating={locating}
        locationLabel={locationLabel}
        date={date}
        onDateChange={setDate}
        onSearch={setSearchQuery}
      />

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