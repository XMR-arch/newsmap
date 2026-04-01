import React from 'react';
import TopBar from './TopBar';
import Treemap from './Treemap';
import Hud from './Hud';
import Legend from './Legend';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white' }}>
      <TopBar />
      <main style={{ position: 'relative', height: 'calc(100vh - 64px)', width: '100%' }}>
        <Treemap />
        <Hud />
      </main>
      <Legend />
    </div>
  );
}

export default App;