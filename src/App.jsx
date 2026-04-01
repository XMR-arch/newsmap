import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { useNewsAPI } from './hooks/useNewsAPI.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useHud } from './components/Hud.jsx';

import Treemap from './components/Treemap.jsx';
import TopBar from './components/TopBar.jsx';
import Legend from './components/Legend.jsx';
import Hud from './components/Hud.jsx';

import styles from './App.module.css';

export default function App() {
  // Estados locales
  const [activeCat, setActiveCat] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [countryFilter, setCountryFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado externo desde state.json
  const [externalState, setExternalState] = useState(null);
  const [stateLoading, setStateLoading] = useState(true);
  const [stateError, setStateError] = useState(null);

  // HUD
  const { stats, update: updateHud } = useHud();

  // Geolocalización
  const { country, city, loading: locating, detect } = useGeolocation();
  const locationLabel = city ? `${city}` : country ? country.toUpperCase() : 'Detectar';

  // País activo
  const activeCountry = countryFilter ?? country;

  // ==================== CARGAR STATE.JSON ====================
  useEffect(() => {
    fetch('/state.json')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar state.json');
        return res.json();
      })
      .then((data) => {
        setExternalState(data);
        setStateLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando state.json:', err);
        setStateError(err.message);
        setStateLoading(false);
      });
  }, []);

  // Datos de noticias
  const { data: papers = [], isLoading: newsLoading } = useNewsAPI({
    country: activeCountry,
    date,
  });

  // ==================== STABLE PAPERS (protección fuerte) ====================
  const firstGoodResponse = useRef(null);

  const stablePapers = useMemo(() => {
    // Si ya guardamos una buena respuesta (≥10 artículos), la mantenemos siempre
    if (firstGoodResponse.current) {
      return firstGoodResponse.current;
    }

    // Si llega una respuesta buena por primera vez, la guardamos
    if (papers.length >= 10) {
      firstGoodResponse.current = papers;
      return papers;
    }

    // Si aún no tenemos una buena respuesta, usamos lo que venga
    return papers;
  }, [papers]);
  // =====================================================================

  // Filtro de búsqueda
  const filteredPapers = useMemo(() => {
    if (!stablePapers || stablePapers.length === 0) return [];

    if (!searchQuery || searchQuery.trim() === '') {
      return stablePapers;
    }

    const q = searchQuery.toLowerCase().trim();
    return stablePapers.filter(p =>
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.city?.toLowerCase() || '').includes(q) ||
      (p.headline?.toLowerCase() || '').includes(q) ||
      (p.country?.toLowerCase() || '').includes(q) ||
      (p.cat?.toLowerCase() || '').includes(q)
    );
  }, [stablePapers, searchQuery]);

  // Toggle categoría
  const handleToggleCat = useCallback((key) => {
    setActiveCat(prev => prev === key ? null : key);
  }, []);

  // Actualizar HUD
  const handleHudUpdate = useCallback((blocks, layouts, ms) => {
    if (updateHud) updateHud({ blocks, layouts, ms });
  }, [updateHud]);

  const isLoading = newsLoading || stateLoading;

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

      {/* Banner Swim Mistress */}
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

      {stateError && (
        <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>
          Error cargando estado: {stateError}
        </div>
      )}

      <div className={styles.stage}>
        {isLoading && (
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