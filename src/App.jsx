import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { useNewsAPI } from './hooks/useNewsAPI.js';
import { useGeolocation } from './hooks/useGeolocation.js';

// FIX #4: un solo import de Hud.jsx — useHud y Hud desde el mismo módulo
import Hud, { useHud } from './components/Hud.jsx';

import Treemap from './components/Treemap.jsx';
import TopBar from './components/TopBar.jsx';
import Legend from './components/Legend.jsx';

import styles from './App.module.css';

export default function App() {
  const [activeCat, setActiveCat]       = useState(null);
  const [date, setDate]                 = useState(() => new Date().toISOString().split('T')[0]);
  const [countryFilter]                 = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');

  // FIX #1: state.json — carga no bloqueante, falla silenciosamente sin afectar el render
  const [externalState, setExternalState] = useState(null);

  useEffect(() => {
    fetch('/state.json')
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => setExternalState(data))
      .catch(() => {
        // state.json es opcional — no bloquea ni muestra error si no existe
      });
  }, []);

  const { stats, update: updateHud } = useHud();
  const { country, city, loading: locating, detect } = useGeolocation();
  const locationLabel = city ? `${city}` : country ? country.toUpperCase() : 'Detectar';
  const activeCountry = countryFilter ?? country;

  const { data: papers = [], isLoading: newsLoading } = useNewsAPI({
    country: activeCountry,
    date,
  });

  // FIX #2: firstGoodResponse se resetea cuando cambia el país o la fecha
  const firstGoodResponse = useRef(null);
  const prevKey = useRef(null);
  const currentKey = `${activeCountry}-${date}`;

  const stablePapers = useMemo(() => {
    // Resetear cache cuando cambia el filtro activo
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

  // FIX #3: handleHudUpdate sin argumentos — el HUD se actualiza via hudElRef en useTreemap
  // Treemap llama hudElRef.current.update?.() sin pasar args, así que recibimos
  // el objeto ya mutado por referencia en useTreemap. Solo necesitamos forzar el re-render.
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

      {/* Banner estado externo — solo aparece si state.json existe y cargó bien */}
      {externalState && (
        <div className={styles.stateBanner}>
          <h2 className={styles.headline}>{externalState.headline}</h2>
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
          <div className={styles.timestamp}>
            {new Date(externalState.timestamp).toLocaleString('es-AR')}
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