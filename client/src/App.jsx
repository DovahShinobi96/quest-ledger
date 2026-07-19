import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import ThisWeek from './pages/ThisWeek.jsx';
import Seasons from './pages/Seasons.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🏆 The Quest Ledger</h1>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/this-week">This Week</NavLink>
          <NavLink to="/seasons">Seasons</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/this-week" element={<ThisWeek />} />
          <Route path="/seasons" element={<Seasons />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
