import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Descomenta en desarrollo

import App from './App.jsx';
import './components/index.css';


// Configuración recomendada del QueryClient para una app de noticias
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Datos se consideran "frescos" durante 10 minutos → ideal para portadas de noticias
      staleTime: 1000 * 60 * 10,

      // gcTime reemplazó a cacheTime en v5 → tiempo que los datos inactivos permanecen en caché
      // Recomendación: gcTime >= staleTime para evitar que se borren datos que aún son útiles
      gcTime: 1000 * 60 * 15,   // 15 minutos

      retry: 1,                          // Reintentar solo una vez
      refetchOnWindowFocus: false,       // Evita recargas molestas al volver a la pestaña
      refetchOnReconnect: true,          // Refetch automático cuando vuelve internet (útil en móvil)
      refetchOnMount: true,              // Comportamiento estándar
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      {/* DevTools muy útiles durante el desarrollo (solo en modo DEV) */}
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  </React.StrictMode>
);