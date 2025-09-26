import Dexie, { Table } from 'dexie';
import { User, AccessCode, Client, Mesure, MesureType, Commande, Paiement, Retouche, Alerte, Settings } from '../types';

export class CoutuproDatabase extends Dexie {
  users!: Table<User>;
  accessCodes!: Table<AccessCode>;
  clients!: Table<Client>;
  mesures!: Table<Mesure>;
  mesureTypes!: Table<MesureType>;
  commandes!: Table<Commande>;
  paiements!: Table<Paiement>;
  retouches!: Table<Retouche>;
  alertes!: Table<Alerte>;
  settings!: Table<Settings>;

  constructor() {
    super('CoutuproDatabase');
    this.version(3).stores({
      users: 'id, code, browserFingerprint',
      accessCodes: 'id, code, isUsed',
      clients: 'id, nom, prenom, telephone, dateCreation',
      mesures: 'id, clientId, dateCreation, version',
      mesureTypes: 'id, nom, isDefault, ordre',
      commandes: 'id, clientId, dateCommande, dateLivraison, statut, priorite',
      paiements: 'id, commandeId, datePaiement, type',
      retouches: 'id, commandeId, datePrevue, statut',
      alertes: 'id, type, priority, isRead, dateCreation',
      settings: 'id, atelierName, updatedAt'
    });
  }
}

export const db = new CoutuproDatabase();

// Types de mesures par défaut
const DEFAULT_MESURE_TYPES: Omit<MesureType, 'id'>[] = [
  { nom: 'Tour de poitrine', isDefault: true, ordre: 1 },
  { nom: 'Tour de taille', isDefault: true, ordre: 2 },
  { nom: 'Tour de hanches', isDefault: true, ordre: 3 },
  { nom: 'Longueur dos', isDefault: true, ordre: 4 },
  { nom: 'Longueur manche', isDefault: true, ordre: 5 },
  { nom: 'Tour de manche', isDefault: true, ordre: 6 },
  { nom: 'Longueur robe', isDefault: true, ordre: 7 },
  { nom: 'Longueur jupe', isDefault: true, ordre: 8 },
  { nom: 'Longueur pantalon', isDefault: true, ordre: 9 },
  { nom: 'Entrejambe', isDefault: true, ordre: 10 },
  { nom: 'Tour de cou', isDefault: true, ordre: 11 },
  { nom: 'Carrure dos', isDefault: true, ordre: 12 },
  { nom: 'Carrure devant', isDefault: true, ordre: 13 },
  { nom: 'Hauteur poitrine', isDefault: true, ordre: 14 },
  { nom: 'Écart poitrine', isDefault: true, ordre: 15 },
  { nom: 'Tour de bras', isDefault: true, ordre: 16 },
  { nom: 'Tour de poignet', isDefault: true, ordre: 17 },
  { nom: 'Longueur épaule', isDefault: true, ordre: 18 },
  { nom: 'Tour de cuisse', isDefault: true, ordre: 19 },
  { nom: 'Tour de genou', isDefault: true, ordre: 20 }
];

// Initialiser avec des données de demo si nécessaire
export const initializeDatabase = async () => {
  try {
    const codesCount = await db.accessCodes.count();
    if (codesCount === 0) {
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

    // Initialiser les types de mesures par défaut
    const mesureTypesCount = await db.mesureTypes.count();
    if (mesureTypesCount === 0) {
      const mesureTypesToAdd = DEFAULT_MESURE_TYPES.map((type, index) => ({
        ...type,
        id: (index + 1).toString()
      }));
      await db.mesureTypes.bulkAdd(mesureTypesToAdd);
    }

    // Initialiser les paramètres par défaut
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        id: 'default',
        atelierName: 'Mon Atelier de Couture',
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