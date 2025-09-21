import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Alerte, DashboardStats } from '../types';

// ----------------------
// Hook pour les alertes
// ----------------------
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alerte[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadAlerts = async () => {
    try {
      const alertsData = await db.alertes
        .filter(a => a.dateCreation instanceof Date) // s'assurer que la date est valide
        .sortBy('dateCreation');
      setAlerts(alertsData.reverse());
      setUnreadCount(alertsData.filter(a => !a.isRead).length);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await db.alertes.update(alertId, { isRead: true });
      await loadAlerts();
    } catch (error) {
      console.error('Erreur marquage alerte:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await db.alertes.where('isRead').equals(false).modify({ isRead: true });
      await loadAlerts();
    } catch (error) {
      console.error('Erreur marquage toutes alertes:', error);
    }
  };

  const generateAlerts = async () => {
    try {
      // Supprimer les anciennes alertes
      await db.alertes.clear();

      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // 1️⃣ Alertes livraisons proches
      const commandesProches = (await db.commandes.toArray())
        .filter(cmd => cmd.dateLivraison instanceof Date && cmd.statut !== 'Livrée')
        .filter(cmd => cmd.dateLivraison <= nextWeek);

      for (const cmd of commandesProches) {
        const client = await db.clients.get(cmd.clientId);
        const isUrgent = cmd.dateLivraison <= tomorrow;

        // Vérifier doublon
        const exists = await db.alertes.get(`livraison-${cmd.id}`);
        if (!exists) {
          await db.alertes.put({
            id: `livraison-${cmd.id}`,
            type: 'livraison',
            titre: isUrgent ? 'Livraison urgente' : 'Livraison proche',
            message: `Commande ${cmd.modele} pour ${client?.prenom ?? ''} ${client?.nom ?? ''} - ${cmd.dateLivraison.toLocaleDateString('fr-FR')}`,
            priority: isUrgent ? 'high' : 'medium',
            isRead: false,
            dateCreation: new Date(),
            relatedId: cmd.id
          });
        }
      }

      // 2️⃣ Alertes paiements incomplets
      const commandesImpayees = (await db.commandes.toArray())
        .filter(cmd => cmd.statutPaiement && ['Impayé', 'Acompte'].includes(cmd.statutPaiement));

      for (const cmd of commandesImpayees) {
        const client = await db.clients.get(cmd.clientId);
        const isUrgent = cmd.reste > 50000; // Plus de 50k FCFA

        const exists = await db.alertes.get(`paiement-${cmd.id}`);
        if (!exists) {
          await db.alertes.put({
            id: `paiement-${cmd.id}`,
            type: 'paiement',
            titre: 'Paiement en attente',
            message: `${cmd.reste.toLocaleString()} FCFA restant pour ${client?.prenom ?? ''} ${client?.nom ?? ''}`,
            priority: isUrgent ? 'high' : 'medium',
            isRead: false,
            dateCreation: new Date(),
            relatedId: cmd.id
          });
        }
      }

      // 3️⃣ Alertes retouches
      const retouchesEnAttente = await db.retouches
        .filter(r => r.statut === 'En attente')
        .toArray();

      for (const retouche of retouchesEnAttente) {
        const cmd = await db.commandes.get(retouche.commandeId);
        const client = cmd ? await db.clients.get(cmd.clientId) : null;

        const exists = await db.alertes.get(`retouche-${retouche.id}`);
        if (!exists) {
          await db.alertes.put({
            id: `retouche-${retouche.id}`,
            type: 'retouche',
            titre: 'Retouche en attente',
            message: `${retouche.description} - ${client?.prenom ?? ''} ${client?.nom ?? ''}`,
            priority: 'medium',
            isRead: false,
            dateCreation: new Date(),
            relatedId: retouche.id
          });
        }
      }

      await loadAlerts();
    } catch (error) {
      console.error('Erreur génération alertes:', error);
    }
  };

  useEffect(() => {
    loadAlerts();
    generateAlerts();
  }, []);

  return {
    alerts,
    unreadCount,
    loadAlerts,
    markAsRead,
    markAllAsRead,
    generateAlerts
  };
};

// ----------------------
// Hook pour stats dashboard
// ----------------------
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalCommandes: 0,
    totalRevenus: 0,
    alertesCount: 0,
    commandesEnCours: 0,
    commandesEnRetard: 0,
    paiementsEnAttente: 0
  });

  const loadStats = async () => {
    try {
      const totalClients = await db.clients.count();
      const totalCommandes = await db.commandes.count();

      const commandesLivrees = (await db.commandes.toArray())
        .filter(cmd => cmd.statut === 'Livrée' && typeof cmd.montantTotal === 'number');

      const totalRevenus = commandesLivrees.reduce((sum, cmd) => sum + cmd.montantTotal, 0);

      const alertesCount = (await db.alertes.toArray()).filter(a => !a.isRead).length;

      const commandesEnCours = (await db.commandes.toArray())
        .filter(cmd => ['En cours', 'En attente'].includes(cmd.statut)).length;

      const today = new Date();
      const commandesEnRetard = (await db.commandes.toArray())
        .filter(cmd => cmd.dateLivraison instanceof Date && cmd.statut !== 'Livrée' && cmd.dateLivraison < today)
        .length;

      const paiementsEnAttente = (await db.commandes.toArray())
        .filter(cmd => cmd.statutPaiement && ['Impayé', 'Acompte'].includes(cmd.statutPaiement))
        .length;

      setStats({
        totalClients,
        totalCommandes,
        totalRevenus,
        alertesCount,
        commandesEnCours,
        commandesEnRetard,
        paiementsEnAttente
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loadStats };
};
