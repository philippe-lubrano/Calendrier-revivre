import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PublicCalendar from './components/PublicCalendar';
import Admin from './components/Admin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="app-nav">
        <Link to="/" className="nav-link">Calendrier</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<PublicCalendar />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
