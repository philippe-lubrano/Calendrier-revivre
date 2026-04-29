import { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export default function Modal({ slot, onClose }) {
  const [prenom, setPrenom] = useState('');
  const [engaged, setEngaged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const existingAnimatorName = slot?.animators?.[0]?.name;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prenom.trim()) {
      setError('Le prénom est obligatoire.');
      return;
    }
    if (!engaged) {
      setError('Vous devez vous engager à être disponible ce jour.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const slotRef = doc(db, 'slots', slot.id);
      await updateDoc(slotRef, {
        animators: arrayUnion({ name: prenom.trim() }),
      });
      onClose();
    } catch (err) {
      if (err?.code === 'permission-denied') {
        setError('Inscription refusée par les règles Firestore.');
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Format date for display
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            &times;
          </button>
          <h2 className="modal-title">S&apos;inscrire au créneau</h2>
          <p className="modal-date">{formatDate(slot.date)}</p>
        </div>
        <div className="modal-body">
          <p className="modal-time">
            <strong>Horaire :</strong> {slot.time}
          </p>
          {existingAnimatorName && (
            <div className="modal-existing-animator">
              👤 Déjà inscrit(e) : <span>{existingAnimatorName}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="modal-label" htmlFor="prenom">
                Prénom <span className="required">*</span>
              </label>
              <input
                id="prenom"
                type="text"
                className="modal-input"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Votre prénom"
                required
              />
            </div>
            <label className="modal-checkbox-label">
              <input
                type="checkbox"
                checked={engaged}
                onChange={(e) => setEngaged(e.target.checked)}
                required
              />
              <span>Je m&apos;engage à être disponible ce jour</span>
            </label>
            {error && <p className="modal-error">{error}</p>}
            <button
              type="submit"
              className="modal-submit"
              disabled={loading}
            >
              {loading ? 'Envoi en cours…' : 'Confirmer mon inscription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
