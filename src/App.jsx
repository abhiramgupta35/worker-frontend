import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Owners from './pages/Owners';
import Assignments from './pages/Assignments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/workers" element={<Workers />} />
      <Route path="/owners" element={<Owners />} />
      <Route path="/assignments" element={<Assignments />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
