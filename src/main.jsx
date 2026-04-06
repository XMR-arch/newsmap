import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Descomenta solo en desarrollo

import App from './App.jsx';
import './index.css';

// ==================== CONFIGURACIÓN RECOMENDADA ====================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Para noticias: queremos estabilidad (no refetchear todo el tiempo)
      staleTime: 1000 * 60 * 8,     // 8 minutos - datos se consideran frescos
      gcTime: 1000 * 60 * 15,       // 15 minutos - mantener en caché más tiempo

      retry: 1,
      refetchOnWindowFocus: false,  // Evita recargas al volver a la pestaña
      refetchOnReconnect: false,    // Evita refetch al recuperar internet
      refetchOnMount: false,        // ← CLAVE: evita el segundo fetch inmediato
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      {/* Descomenta esto solo mientras estás desarrollando */}
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  </React.StrictMode>
);