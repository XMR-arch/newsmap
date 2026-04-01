import { useState, useCallback, useMemo, useEffect } from 'react';

import { useNewsAPI } from './hooks/useNewsAPI.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useHud } from './components/Hud.jsx';   // Asegúrate que este hook devuelva { stats, update }

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

  // País activo (filtro manual o automático por geolocalización)
  const activeCountry = countryFilter ?? country;

  // Datos desde API
  const { data: papers, isLoading } = useNewsAPI({
    country: activeCountry,
    date,
  });

  // Filtro cliente-side de búsqueda
  const filteredPapers = useMemo(() => {
    if (!papers) return [];
    if (!searchQuery.trim()) return papers;

    const q = searchQuery.toLowerCase().trim();
    return papers.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.headline?.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q) ||
      p.cat?.toLowerCase().includes(q)
    );
  }, [papers, searchQuery]);

  // Toggle categoría
  const handleToggleCat = useCallback((key) => {
    setActiveCat(prev => prev === key ? null : key);
  }, []);

  // Callback para actualizar HUD desde Treemap (más seguro)
  const handleHudUpdate = useCallback((blocks, layouts, ms) => {
    if (updateHud) {
      updateHud({ blocks, layouts, ms });
    }
  }, [updateHud]);

  // Ejemplo opcional: cargar estado externo (si lo necesitas)
  // const [externalState, setExternalState] = useState(null);
  // useEffect(() => {
  //   fetch("/state.json")
  //     .then(res => res.json())
  //     .then(data => setExternalState(data))
  //     .catch(console.error);
  // }, []);

  return (
    <div className={styles.app}>
      <TopBar
        onLocate={detect}
        locating={locating}
        locationLabel={locationLabel}
        date={date}
        onDateChange={setDate}
        onSearch={setSearchQuery}
        // Si necesitas pasar countryFilter y setCountryFilter al TopBar:
        // countryFilter={countryFilter}
        // onCountryFilterChange={setCountryFilter}
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
          onHudUpdate={handleHudUpdate}   // ← Cambiado a callback más claro
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