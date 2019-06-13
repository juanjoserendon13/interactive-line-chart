import React, { lazy, Suspense } from 'react';
import './App.css';

const LineChart = lazy(() => import('./components/LineChart'));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>loading...</div>}>
        <LineChart />
      </Suspense>
    </div>
  );
}

export default App;
