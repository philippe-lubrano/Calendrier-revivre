import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

export default function PublicCalendar() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'slots'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSlots(data);
    });
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

  return (
    <div className="calendar-wrapper">
      <h1 className="calendar-title">Calendrier des créneaux</h1>
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
