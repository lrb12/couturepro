export interface User {
  id: string;
  code: string;
  usedAt: Date;
  browserFingerprint: string;
}

export interface AccessCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  createdAt: Date;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  dateCreation: Date;
  notes?: string;
  photo?: string;
}

export interface MesureType {
  id: string;
  nom: string;
  isDefault: boolean;
  ordre: number;
}

export interface Mesure {
  id: string;
  clientId: string;
  mesures: { [key: string]: number }; // nom de la mesure -> valeur
  dateCreation: Date;
  notes?: string;
  version: number; // pour l'historique
}

export interface Commande {
  id: string;
  clientId: string;
  modele: string;
  photo?: string;
  reference?: string;
  dateCommande: Date;
  dateLivraison: Date;
  statut: 'En attente' | 'En cours' | 'Retouche' | 'Livrée' | 'Annulée';
  montantTotal: number;
  acompte: number;
  reste: number;
  statutPaiement: 'Impayé' | 'Acompte' | 'Payé';
  notes?: string;
  priorite: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  couleur?: string;
  tissu?: string;
  doublure?: string;
  accessoires?: string;
  instructions?: string;
}

export interface Paiement {
  id: string;
  commandeId: string;
  montant: number;
  type: 'Acompte' | 'Solde' | 'Remboursement';
  datePaiement: Date;
  methode: 'Espèces' | 'Carte' | 'Virement' | 'Mobile' | 'Chèque';
  reference?: string;
  notes?: string;
}

export interface Retouche {
  id: string;
  commandeId: string;
  description: string;
  datePrevue: Date;
  statut: 'En attente' | 'En cours' | 'Terminée';
  dateCreation: Date;
  notes?: string;
  cout?: number;
}

export interface Alerte {
  id: string;
  type: 'livraison' | 'paiement' | 'retouche' | 'rappel';
  titre: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  dateCreation: Date;
  relatedId?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalCommandes: number;
  totalRevenus: number;
  alertesCount: number;
  commandesEnCours: number;
  commandesEnRetard: number;
  paiementsEnAttente: number;
  commandesDuMois: number;
  revenusDuMois: number;
}

export interface Settings {
  id: string;
  atelierName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  siret?: string;
  tva?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RapportMensuel {
  mois: string;
  annee: number;
  totalCommandes: number;
  totalRevenus: number;
  commandesLivrees: number;
  commandesEnCours: number;
  nouveauxClients: number;
}