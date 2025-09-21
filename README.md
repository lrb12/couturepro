# COUTUPRO - Application de Gestion de Couture

Une PWA (Progressive Web App) complète pour la gestion d'activités de couture, développée avec React, TypeScript, TailwindCSS et IndexedDB.

## 🌟 Fonctionnalités

### Authentification
- Système de codes d'accès uniques
- Codes à usage unique liés au navigateur
- Interface administrateur secrète (`/admin-secret`)
- Gestion complète des codes d'accès

### Gestion des Clients
- Ajout/modification de clients
- Stockage des coordonnées complètes
- Prise de mesures détaillées (dos, manche, taille, poitrine, etc.)
- Historique des mesures avec possibilité de correction
- Génération de fiches de mesures en PDF

### Gestion des Commandes
- Création de commandes avec modèle, dates et tarifs
- Suivi des statuts : En attente, En cours, Retouche, Livrée
- Gestion des acomptes et soldes
- Calcul automatique des restes à payer
- Génération de factures PDF

### Système d'Alertes
- Alertes pour les livraisons proches
- Notifications pour les paiements incomplets
- Suivi des retouches en attente
- Badge d'alertes non lues sur la navigation
- Priorisation des alertes (urgent, moyen, bas)

### Sauvegarde et Restauration
- Export complet des données en JSON
- Import/restauration depuis fichier
- Réinitialisation complète avec confirmation

## 🛠️ Technologies Utilisées

- **Frontend :** React 18 + TypeScript
- **Styling :** TailwindCSS avec design mobile-first
- **Routing :** React Router DOM
- **Base de données :** Dexie.js (IndexedDB)
- **PDF :** jsPDF pour la génération de documents
- **PWA :** Service Worker, Manifest, installabilité
- **Build :** Vite

## 🎨 Design

- **Couleurs principales :** Vert foncé #1B7F4D, Vert clair #3EBE72, Noir #0C3A24
- **Interface mobile-first responsive**
- **Navigation bottom avec 5 onglets**
- **Animations et micro-interactions**
- **Cards colorées type ANIP sur le dashboard**

## 📱 Installation

### Prérequis
- Node.js 18+ et npm

### Installation locale
```bash
# Cloner le projet
git clone [url-du-repo]
cd coutupro

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build de production
npm run build
```

### Déploiement

#### Vercel
1. Connecter le repository GitHub à Vercel
2. Build automatique avec les paramètres par défaut
3. L'application sera automatiquement déployée

#### Netlify
1. Connecter le repository à Netlify
2. Build command : `npm run build`
3. Publish directory : `dist`
4. Déploiement automatique

### Configuration PWA
L'application est automatiquement installable sur mobile et desktop grâce à :
- Manifest.json configuré
- Service Worker pour mise en cache
- Icônes et splash screen optimisés

## 🔐 Gestion des Codes d'Accès

### Codes de démonstration
- `DEMO2024` - Code de démonstration
- `TEST001` - Code de test

### Code administrateur
- `ADMIN2024` - Accès à l'interface d'administration (`/admin-secret`)

### Création de nouveaux codes
1. Se connecter avec le code admin
2. Aller sur `/admin-secret`
3. Créer de nouveaux codes d'accès
4. Les utilisateurs utilisent ces codes une seule fois

## 📊 Structure de la Base de Données

### Tables principales
- **users** : Sessions utilisateurs
- **accessCodes** : Codes d'accès et leur statut
- **clients** : Informations clients
- **mesures** : Mesures détaillées par client
- **commandes** : Commandes avec statuts et paiements
- **paiements** : Historique des paiements
- **retouches** : Gestion des retouches
- **alertes** : Système de notifications

### Stockage
- **Principal :** IndexedDB via Dexie.js
- **Fallback :** localStorage pour compatibilité
- **Export/Import :** Format JSON

## 🚀 Utilisation

1. **Première connexion :** Utiliser un code d'accès valide
2. **Dashboard :** Vue d'ensemble avec 4 cartes CTA colorées
3. **Clients :** Gérer la base clients et prendre les mesures
4. **Commandes :** Créer et suivre les commandes
5. **Alertes :** Surveiller les activités importantes
6. **Profil :** Sauvegarder/restaurer les données

## 📈 Fonctionnalités Avancées

### Génération PDF
- Factures clients complètes
- Fiches de mesures détaillées
- En-têtes personnalisés COUTUPRO

### Système d'Alertes
- Génération automatique des alertes
- Priorisation intelligente
- Badge temps réel sur navigation

### PWA Features
- Installation sur écran d'accueil
- Fonctionnement hors ligne
- Mise en cache intelligente

## 👤 Développeur

**Rénato TCHOBO**
- Application développée avec ❤️
- © 2024 - Tous droits réservés

## 📝 Notes Techniques

- Application 100% responsive mobile-first
- Stockage local sécurisé
- Interface en français
- Optimisations performance
- Code modulaire et maintenable

---

*Cette application est prête pour la production et peut être déployée immédiatement sur Vercel ou Netlify.*