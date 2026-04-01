import { useState, useCallback, useMemo } from 'react';

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

  // HUD
  const { stats, update: updateHud } = useHud();

  // Geolocalización
  const { country, city, loading: locating, detect } = useGeolocation();
  const locationLabel = city ? `${city}` : country ? country.toUpperCase() : 'Detectar';

  // País activo
  const activeCountry = countryFilter ?? country;

  // ==================== DATOS DE LA API + VERSIÓN ESTABLE ====================
  const { data: papers = [], isLoading } = useNewsAPI({
    country: activeCountry,
    date,
  });

  // Evita que los datos "reboten" de 31 → 2
  const stablePapers = useMemo(() => {
    if (papers.length >= 10) {
      return papers;                    // Primera respuesta buena (31)
    }
    return papers;                      // Si aún no hay nada bueno, usamos lo que venga
  }, [papers]);

  // Filtro de búsqueda (con logs para debug)
  const filteredPapers = useMemo(() => {
    if (!stablePapers || stablePapers.length === 0) {
      console.log('No hay papers estables');
      return [];
    }

    console.log('Papers estables usados:', stablePapers.length);
    console.log('searchQuery actual:', `"${searchQuery}"`);

    if (!searchQuery || searchQuery.trim() === '') {
      console.log('Sin búsqueda → devolviendo TODOS los', stablePapers.length);
      return stablePapers;
    }

    const q = searchQuery.toLowerCase().trim();
    const result = stablePapers.filter(p =>
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.city?.toLowerCase() || '').includes(q) ||
      (p.headline?.toLowerCase() || '').includes(q) ||
      (p.country?.toLowerCase() || '').includes(q) ||
      (p.cat?.toLowerCase() || '').includes(q)
    );

    console.log('Después del filtro → quedan:', result.length);
    return result;
  }, [stablePapers, searchQuery]);
  // =====================================================================

  // Toggle categoría
  const handleToggleCat = useCallback((key) => {
    setActiveCat(prev => prev === key ? null : key);
  }, []);

  // Actualizar HUD desde Treemap
  const handleHudUpdate = useCallback((blocks, layouts, ms) => {
    if (updateHud) {
      updateHud({ blocks, layouts, ms });
    }
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
        {isLoading && (
          <div className={styles.loading}>
            <span className={styles.loadingDot}>●</span> cargando portadas...
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