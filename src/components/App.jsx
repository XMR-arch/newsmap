import React from 'react';
import TopBar from './TopBar';
import Treemap from './Treemap';
import Hud from './Hud';
import Legend from './Legend';

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