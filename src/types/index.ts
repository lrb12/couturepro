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
}

export interface Mesure {
  id: string;
  clientId: string;
  dos: number;
  longueurManche: number;
  tourManche: number;
  longueurRobe: number;
  jupe: number;
  pantalon: number;
  taille: number;
  poitrine: number;
  sousSein: number;
  encolure: number;
  carrure: number;
  hanches: number;
  genoux: number;
  ceinture: number;
  dateCreation: Date;
  notes?: string;
}

export interface Commande {
  id: string;
  clientId: string;
  modele: string;
  photo?: string;
  reference?: string;
  dateCommande: Date;
  dateLivraison: Date;
  statut: 'En attente' | 'En cours' | 'Retouche' | 'Livrée';
  montantTotal: number;
  acompte: number;
  reste: number;
  statutPaiement: 'Impayé' | 'Acompte' | 'Payé';
  notes?: string;
}

export interface Paiement {
  id: string;
  commandeId: string;
  montant: number;
  type: 'Acompte' | 'Solde';
  datePaiement: Date;
  methode: 'Espèces' | 'Carte' | 'Virement' | 'Mobile';
}

export interface Retouche {
  id: string;
  commandeId: string;
  description: string;
  datePrevue: Date;
  statut: 'En attente' | 'En cours' | 'Terminée';
  dateCreation: Date;
  notes?: string;
}

export interface Alerte {
  id: string;
  type: 'livraison' | 'paiement' | 'retouche';
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
}

export interface Settings {
  id: string;
  atelierName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  createdAt: Date;
  updatedAt: Date;
}