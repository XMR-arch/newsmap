import React from 'react';
import TopBar from './TopBar';
import Treemap from './Treemap';
import Hud from './Hud';
import Legend from './Legend';

const { data: papers, isLoading } = useNewsAPI(); // O como se llame tu hook
if (isLoading) return <div>Cargando Mapa...</div>;
if (!papers) return <div>Error al cargar noticias</div>;
return <Treemap papers={papers} ... />;

// Este es el componente principal que Vite no está encontrando
function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar />
      <main className="relative h-[calc(100-64px)] w-full">
        <Treemap />
        <Hud />
      </main>
      <Legend />
    </div>
  );
}

export default App;