import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './src/App.jsx'
import './components/index.css' // Ruta corregida según tu estructura de archivos

// Configuración del cliente de caché para las noticias
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 10 minutos de caché para evitar llamadas excesivas a la API
      staleTime: 1000 * 60 * 10, 
      retry: 1,
      refetchOnWindowFocus: false, // Evita recargas molestas al cambiar de pestaña
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)