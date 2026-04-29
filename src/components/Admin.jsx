import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('create');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [readError, setReadError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'slots'), orderBy('date', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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

  async function handleCreate(e) {
    e.preventDefault();
    if (!date || !time.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      await addDoc(collection(db, 'slots'), {
        date,
        time: time.trim(),
        animators: [],
      });
      setDate('');
      setTime('');
      setMessage('Créneau créé avec succès !');
    } catch (err) {
      if (err?.code === 'permission-denied') {
        setMessage('Création refusée par les règles Firestore.');
      } else {
        setMessage("Erreur lors de la création du créneau.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await deleteDoc(doc(db, 'slots', id));
    } catch (err) {
      if (err?.code === 'permission-denied') {
        setMessage('Suppression refusée par les règles Firestore.');
      }
      console.error(err);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getStatus(slot) {
    const count = slot.animators ? slot.animators.length : 0;
    if (count >= 2) return { label: 'Complet 2/2', className: 'status-full' };
    return { label: 'En attente', className: 'status-pending' };
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1 className="admin-title">Administration</h1>
        <p className="admin-subtitle">Gérez les créneaux d'animation</p>
      </div>
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'create' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Créer
        </button>
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Récapitulatif
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="tab-panel">
          <h2 className="tab-panel-title">Créer un créneau</h2>
          <form onSubmit={handleCreate} className="create-form">
            <label className="form-label" htmlFor="slot-date">
              Date
            </label>
            <input
              id="slot-date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <label className="form-label" htmlFor="slot-time">
              Heure (ex : 19h-21h)
            </label>
            <input
              id="slot-time"
              type="text"
              className="form-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="19h-21h"
              required
            />
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? 'Création…' : 'Créer le créneau'}
            </button>
          </form>
          {message && <p className="form-message">{message}</p>}
        </div>
      )}

      {activeTab === 'summary' && (
        <>
          <h2 className="tab-panel-title">Récapitulatif des créneaux</h2>
          {readError && <p className="form-message">{readError}</p>}
          {slots.length === 0 ? (
            <p className="no-slots">Aucun créneau pour le moment.</p>
          ) : (
            <div className="table-wrapper">
              <table className="slots-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Animateurs</th>
                    <th>État</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => {
                    const status = getStatus(slot);
                    return (
                      <tr key={slot.id}>
                        <td>{formatDate(slot.date)}</td>
                        <td>{slot.time}</td>
                        <td>
                          {slot.animators && slot.animators.length > 0
                            ? slot.animators.map((a) => a.name).join(', ')
                            : <em>Aucun animateur</em>}
                        </td>
                        <td>
                          <span className={`status-badge ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(slot.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
