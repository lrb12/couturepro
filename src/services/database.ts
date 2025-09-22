import Dexie, { Table } from 'dexie';
import { User, AccessCode, Client, Mesure, Commande, Paiement, Retouche, Alerte, Settings } from '../types';

export class CoutuproDatabase extends Dexie {
  users!: Table<User>;
  accessCodes!: Table<AccessCode>;
  clients!: Table<Client>;
  mesures!: Table<Mesure>;
  commandes!: Table<Commande>;
  paiements!: Table<Paiement>;
  retouches!: Table<Retouche>;
  alertes!: Table<Alerte>;
  settings!: Table<Settings>;

  constructor() {
    super('CoutuproDatabase');
    this.version(2).stores({
      users: 'id, code, browserFingerprint',
      accessCodes: 'id, code, isUsed',
      clients: 'id, nom, prenom, telephone, dateCreation',
      mesures: 'id, clientId, dateCreation',
      commandes: 'id, clientId, dateCommande, dateLivraison, statut',
      paiements: 'id, commandeId, datePaiement',
      retouches: 'id, commandeId, datePrevue, statut',
      alertes: 'id, type, priority, isRead, dateCreation',
      settings: 'id, atelierName, updatedAt'
    });
  }
}

export const db = new CoutuproDatabase();

// Initialiser avec des données de demo si nécessaire
export const initializeDatabase = async () => {
  try {
    const codesCount = await db.accessCodes.count();
    if (codesCount === 0) {
      // Créer quelques codes de démo
      await db.accessCodes.bulkAdd([
        {
          id: '1',
          code: 'DEMO2024',
          isUsed: false,
          createdAt: new Date()
        },
        {
          id: '2',
          code: 'TEST001',
          isUsed: false,
          createdAt: new Date()
        }
      ]);
    }

    // Initialiser les paramètres par défaut
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        id: 'default',
        atelierName: 'Mon Atelier',
        primaryColor: '#1B7F4D',
        secondaryColor: '#3EBE72',
        accentColor: '#0C3A24',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Erreur initialisation base:', error);
  }
};