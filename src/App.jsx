import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PublicCalendar from './components/PublicCalendar';
import Admin from './components/Admin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="app-nav">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-icon">📅</span>
          <span className="nav-brand-text">Animation Revivre</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Calendrier</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<PublicCalendar />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
