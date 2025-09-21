import Dexie, { Table } from 'dexie';
import { User, AccessCode, Client, Mesure, Commande, Paiement, Retouche, Alerte } from '../types';

export class CoutuproDatabase extends Dexie {
  users!: Table<User>;
  accessCodes!: Table<AccessCode>;
  clients!: Table<Client>;
  mesures!: Table<Mesure>;
  commandes!: Table<Commande>;
  paiements!: Table<Paiement>;
  retouches!: Table<Retouche>;
  alertes!: Table<Alerte>;

  constructor() {
    super('CoutuproDatabase');
    this.version(1).stores({
      users: 'id, code, browserFingerprint',
      accessCodes: 'id, code, isUsed',
      clients: 'id, nom, prenom, telephone, dateCreation',
      mesures: 'id, clientId, dateCreation',
      commandes: 'id, clientId, dateCommande, dateLivraison, statut',
      paiements: 'id, commandeId, datePaiement',
      retouches: 'id, commandeId, datePrevue, statut',
      alertes: 'id, type, priority, isRead, dateCreation'
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
  } catch (error) {
    console.error('Erreur initialisation base:', error);
  }
};