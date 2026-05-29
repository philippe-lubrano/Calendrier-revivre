import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

export default function PublicCalendar() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [readError, setReadError] = useState('');
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL parameters for month navigation
  useEffect(() => {
    const monthParam = searchParams.get('month');
    if (monthParam) {
      // Expected format: YYYY-MM (e.g., 2026-05)
      const regex = /^\d{4}-\d{2}$/;
      if (regex.test(monthParam)) {
        const [year, month] = monthParam.split('-');
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        // Validate the date
        if (!isNaN(parsedDate.getTime())) {
          setActiveMonth(parsedDate);
        }
      }
    }
  }, [searchParams]);

  // Listen to Firestore slots collection
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'slots'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSlots(data);
        setReadError('');
      },
      (err) => {
        if (err?.code === 'permission-denied') {
          setReadError('Accès refusé à Firestore. Vérifiez les règles de sécurité.');
        } else {
          setReadError('Impossible de charger les créneaux.');
        }
        console.error(err);
      }
    );
    return () => unsub();
  }, []);

  // Build a map for quick lookup: date string -> slot
  const slotMap = {};
  slots.forEach((slot) => {
    slotMap[slot.date] = slot;
  });

  function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getTileClassName({ date, view }) {
    if (view !== 'month') return null;
    const key = toLocalDateString(date);
    const slot = slotMap[key];
    if (!slot) return null;
    if (slot.animators && slot.animators.length >= 2) return 'tile-full';
    if (slot.animators && slot.animators.length < 2) return 'tile-available';
    return null;
  }

  function getTileDisabled({ date, view }) {
    if (view !== 'month') return false;
    const key = toLocalDateString(date);
    const slot = slotMap[key];
    // Disable if no slot exists for this date, or if slot is full
    if (!slot) return true;
    if (slot.animators && slot.animators.length >= 2) return true;
    return false;
  }

  function handleDayClick(date) {
    const key = toLocalDateString(date);
    const slot = slotMap[key];
    if (slot && slot.animators && slot.animators.length < 2) {
      setSelectedSlot(slot);
    }
  }

  // Handle month/year navigation
  function handleActiveStartDateChange({ activeStartDate }) {
    setActiveMonth(activeStartDate);
    // Update URL with the new month
    const year = activeStartDate.getFullYear();
    const month = String(activeStartDate.getMonth() + 1).padStart(2, '0');
    navigate(`/?month=${year}-${month}`);
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-hero">
        <h1 className="calendar-title">Calendrier des créneaux</h1>
        <p className="calendar-subtitle">Cliquez sur un jour disponible pour vous inscrire</p>
      </div>
      {readError && <p className="form-message">{readError}</p>}
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot available"></span> Disponible
        </span>
        <span className="legend-item">
          <span className="legend-dot full"></span> Complet
        </span>
      </div>
      <div className="calendar-container">
        <Calendar
          onClickDay={handleDayClick}
          tileClassName={getTileClassName}
          tileDisabled={getTileDisabled}
          locale="fr-FR"
          activeStartDate={activeMonth}
          onActiveStartDateChange={handleActiveStartDateChange}
        />
      </div>
      {selectedSlot && (
        <Modal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
