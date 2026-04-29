# Calendrier-revivre

Application de réservation de créneaux d'animation construite avec **Vite + React** et **Firebase Firestore**.

## Fonctionnalités

- **Vue publique (/)** : Calendrier interactif avec react-calendar.
  - Jours avec créneaux disponibles (< 2 animateurs) : pastille verte, cliquables.
  - Jours complets (2 animateurs) : grisés et non cliquables.
  - Modale d'inscription : prénom + case d'engagement + envoi vers Firestore.
- **Vue admin (/admin)** :
  - Onglet **Créer** : formulaire pour ajouter un nouveau créneau (date + heure).
  - Onglet **Récapitulatif** : tableau trié des créneaux avec état et bouton de suppression.

## Prérequis

- Node.js ≥ 18
- Un projet Firebase avec Firestore activé

## Installation

```bash
npm install
```

## Configuration Firebase

Copier `.env.example` en `.env.local` et renseigner les valeurs de votre projet Firebase :

```bash
cp .env.example .env.local
```

Les variables à définir :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Ces valeurs se trouvent dans la console Firebase → Paramètres du projet → Général → Vos applications.

### Structure Firestore

Collection `slots` :

| Champ       | Type     | Description                                   |
|-------------|----------|-----------------------------------------------|
| `date`      | string   | Date au format `YYYY-MM-DD`                   |
| `time`      | string   | Horaire, ex : `19h-21h`                       |
| `animators` | array    | Tableau d'objets `{ name: string }` (max 2)   |

## Lancer le serveur de développement

```bash
npm run dev
```

## Build de production

```bash
npm run build
```
