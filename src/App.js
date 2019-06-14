import React, { lazy, Suspense } from 'react';
import './App.css';

const LineChart = lazy(() => import('./components/LineChart'));

function App() {
  const lineData = [
    {
      id: 1,
      value: 10,
      year: 2015,
    },
    {
      id: 1,
      value: 15,
      year: 2016,
    },
    {
      id: 1,
      value: 24,
      year: 2017,
    },
    {
      id: 1,
      value: 8,
      year: 2018,
    },
    {
      id: 1,
      value: 10,
      year: 2019,
    },
  ];
  return (
    <div className="App">
      <Suspense fallback={<div>loading...</div>}>
        <LineChart type="value" data={lineData} idLine={1} startYear={2016} />
      </Suspense>
    </div>
  );
}

export default App;
