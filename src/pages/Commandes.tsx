import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, DollarSign, User, Package, Edit, Trash2, Eye, FileText, Clock, AlertTriangle } from 'lucide-react';
import { Image as ImageIcon, Camera, Star, Flag } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { ImageUpload } from '../components/ui/ImageUpload';
import { db } from '../services/database';
import { generateFacturePDF } from '../services/pdf';
import { Commande, Client, Paiement, Retouche } from '../types';

export const CommandesPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'livraison' | 'montant' | 'priorite'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Chargement des données
  const loadData = async () => {
    try {
      const commandesData = await db.commandes.orderBy('dateCommande').reverse().toArray();
      const clientsData = await db.clients.toArray();
      setCommandes(commandesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrage et tri
  const filteredAndSortedCommandes = commandes
    .filter(commande => {
      const client = clients.find(c => c.id === commande.clientId);
      const clientName = client ? `${client.prenom} ${client.nom}` : '';
      
      const matchesSearch = commande.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           commande.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || commande.statut === filterStatus;
      const matchesPriority = filterPriority === 'all' || commande.priorite === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.dateCommande).getTime() - new Date(b.dateCommande).getTime();
          break;
        case 'livraison':
          comparison = new Date(a.dateLivraison).getTime() - new Date(b.dateLivraison).getTime();
          break;
        case 'montant':
          comparison = a.montantTotal - b.montantTotal;
          break;
        case 'priorite':
          const priorityOrder = { 'Urgente': 4, 'Haute': 3, 'Normale': 2, 'Basse': 1 };
          comparison = (priorityOrder[a.priorite] || 0) - (priorityOrder[b.priorite] || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'En attente', label: 'En attente' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Retouche', label: 'Retouche' },
    { value: 'Livrée', label: 'Livrée' },
    { value: 'Annulée', label: 'Annulée' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Toutes priorités' },
    { value: 'Urgente', label: 'Urgente' },
    { value: 'Haute', label: 'Haute' },
    { value: 'Normale', label: 'Normale' },
    { value: 'Basse', label: 'Basse' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date de commande' },
    { value: 'livraison', label: 'Date de livraison' },
    { value: 'montant', label: 'Montant' },
    { value: 'priorite', label: 'Priorité' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commandes" showLogo={false} />
      
      <main className="p-4 pb-20">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{commandes.length}</div>
            <div className="text-xs text-blue-700">Total</div>
          </Card>
          <Card className="text-center bg-yellow-50 border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {commandes.filter(c => c.statut === 'En cours').length}
            </div>
            <div className="text-xs text-yellow-700">En cours</div>
          </Card>
          <Card className="text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {commandes.filter(c => c.statut === 'Livrée').length}
            </div>
            <div className="text-xs text-green-700">Livrées</div>
          </Card>
          <Card className="text-center bg-red-50 border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {commandes.filter(c => new Date(c.dateLivraison) < new Date() && c.statut !== 'Livrée').length}
            </div>
            <div className="text-xs text-red-700">En retard</div>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par modèle, client ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="secondary"
              size="sm"
              className="text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
            </Button>
          </div>
          
          <Button
            onClick={() => setShowNewModal(true)}
            fullWidth
            className="bg-green-600 hover:bg-green-700 rounded-xl shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle Commande
          </Button>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-3">
          {filteredAndSortedCommandes.map(commande => (
            <CommandeCard 
              key={commande.id} 
              commande={commande}
              client={clients.find(c => c.id === commande.clientId)}
              onUpdate={loadData}
            />
          ))}
          
          {filteredAndSortedCommandes.length === 0 && (
            <Card className="text-center py-12 rounded-xl">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Aucune commande trouvée avec ces critères' 
                  : 'Aucune commande enregistrée'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                <Button
                  onClick={() => setShowNewModal(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus size={16} className="mr-2" />
                  Créer la première commande
                </Button>
              )}
            </Card>
          )}
        </div>
      </main>

      <NewCommandeModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadData}
        clients={clients}
      />

      <Footer />
    </div>
  );
};

// Carte commande améliorée
const CommandeCard: React.FC<{
  commande: Commande;
  client?: Client;
  onUpdate: () => void;
}> = ({ commande, client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Retouche': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Livrée': return 'bg-green-100 text-green-800 border-green-300';
      case 'Annulée': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'text-red-600';
      case 'Haute': return 'text-orange-600';
      case 'Normale': return 'text-blue-600';
      case 'Basse': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgente': return AlertTriangle;
      case 'Haute': return Flag;
      case 'Normale': return Star;
      case 'Basse': return Clock;
      default: return Clock;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Impayé': return 'text-red-600';
      case 'Acompte': return 'text-orange-600';
      case 'Payé': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isLate = new Date(commande.dateLivraison) < new Date() && commande.statut !== 'Livrée';
  const PriorityIcon = getPriorityIcon(commande.priorite);

  return (
    <>
      <Card 
        onClick={() => setShowDetails(true)} 
        className={`hover:shadow-lg cursor-pointer transition-all duration-200 rounded-xl ${
          isLate ? 'border-l-4 border-l-red-500 bg-red-50' : ''
        }`}
      >
        <div className="flex items-start space-x-4 mb-3">
          {/* Image du modèle */}
          <div className="flex-shrink-0">
            {commande.photo ? (
              <img
                src={commande.photo}
                alt={commande.modele}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                <ImageIcon className="text-gray-400" size={24} />
              </div>
            )}
          </div>
          
          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center">
                  {commande.modele || 'Modèle non défini'}
                  <PriorityIcon 
                    size={14} 
                    className={`ml-2 ${getPriorityColor(commande.priorite)}`} 
                  />
                </h3>
                {commande.reference && (
                  <p className="text-xs text-gray-500">Réf: {commande.reference}</p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(commande.statut || '')}`}>
                  {commande.statut || 'Non défini'}
                </span>
                {isLate && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full border border-red-300">
                    En retard
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <User size={14} className="mr-2" />
                <span>{client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-2" />
                <span>
                  Livraison: {commande.dateLivraison ? new Date(commande.dateLivraison).toLocaleDateString('fr-FR') : 'Non définie'}
                </span>
                {isLate && <AlertTriangle size={14} className="ml-2 text-red-500" />}
              </div>
              {commande.priorite !== 'Normale' && (
                <div className="flex items-center">
                  <PriorityIcon size={14} className="mr-2" />
                  <span className={getPriorityColor(commande.priorite)}>
                    Priorité {commande.priorite.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm">
            <DollarSign size={14} className="mr-1" />
            <span className={`font-medium ${getPaymentColor(commande.statutPaiement || '')}`}>
              {commande.statutPaiement || 'Non défini'}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">{commande.montantTotal?.toLocaleString() ?? 0} F</span>
            {commande.reste && commande.reste > 0 && (
              <div className="text-red-600 text-xs">
                Reste: {commande.reste.toLocaleString()} F
              </div>
            )}
          </div>
        </div>
      </Card>

      <CommandeDetailsModal
        commande={commande}
        client={client}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};

// Modal nouvelle commande complète
const NewCommandeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Client[];
}> = ({ isOpen, onClose, onSuccess, clients }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    modele: '',
    photo: '',
    reference: '',
    dateLivraison: '',
    montantTotal: 0,
    acompte: 0,
    priorite: 'Normale' as const,
    couleur: '',
    tissu: '',
    doublure: '',
    accessoires: '',
    instructions: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.clientId || !formData.dateLivraison) {
        alert("Veuillez remplir tous les champs obligatoires !");
        setIsLoading(false);
        return;
      }

      const dateLivraison = new Date(formData.dateLivraison);
      if (isNaN(dateLivraison.getTime())) {
        alert("Date de livraison invalide !");
        setIsLoading(false);
        return;
      }

      const montantTotal = Number(formData.montantTotal) || 0;
      const acompte = Number(formData.acompte) || 0;
      const reste = montantTotal - acompte;
      const statutPaiement = 
        acompte === 0 ? 'Impayé' :
        reste === 0 ? 'Payé' : 'Acompte';

      const id = Date.now().toString();

      await db.commandes.add({
        id,
        clientId: formData.clientId,
        modele: formData.modele || 'Modèle personnalisé',
        photo: formData.photo,
        reference: formData.reference,
        dateCommande: new Date(),
        dateLivraison,
        montantTotal,
        acompte,
        reste,
        statut: 'En attente',
        statutPaiement,
        priorite: formData.priorite,
        couleur: formData.couleur,
        tissu: formData.tissu,
        doublure: formData.doublure,
        accessoires: formData.accessoires,
        instructions: formData.instructions,
        notes: formData.notes
      });

      if (acompte > 0) {
        await db.paiements.add({
          id: (Date.now() + 1).toString(),
          commandeId: id,
          montant: acompte,
          type: 'Acompte',
          datePaiement: new Date(),
          methode: 'Espèces'
        });
      }

      onSuccess();
      onClose();
      setFormData({
        clientId: '',
        modele: '',
        photo: '',
        reference: '',
        dateLivraison: '',
        montantTotal: 0,
        acompte: 0,
        priorite: 'Normale',
        couleur: '',
        tissu: '',
        doublure: '',
        accessoires: '',
        instructions: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert("Erreur lors de la création de la commande.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Commande" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.prenom} {client.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select
              value={formData.priorite}
              onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Basse">Basse</option>
              <option value="Normale">Normale</option>
              <option value="Haute">Haute</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Nom du modèle et référence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nom du modèle"
            value={formData.modele}
            onChange={(value) => setFormData(prev => ({ ...prev, modele: value as string }))}
            placeholder="Robe de soirée, Costume..."
            required
          />

          <FormField
            label="Référence"
            value={formData.reference}
            onChange={(value) => setFormData(prev => ({ ...prev, reference: value as string }))}
            placeholder="REF-001, CMD-2024-001..."
          />
        </div>

        {/* Photo du modèle */}
        <ImageUpload
          label="Photo du modèle"
          value={formData.photo}
          onChange={(photo) => setFormData(prev => ({ ...prev, photo: photo || '' }))}
        />

        {/* Date de livraison */}
        <FormField
          label="Date de livraison"
          type="date"
          value={formData.dateLivraison}
          onChange={(value) => setFormData(prev => ({ ...prev, dateLivraison: value as string }))}
          required
        />

        {/* Détails du vêtement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Couleur principale"
            value={formData.couleur}
            onChange={(value) => setFormData(prev => ({ ...prev, couleur: value as string }))}
            placeholder="Rouge, Bleu marine..."
          />

          <FormField
            label="Tissu"
            value={formData.tissu}
            onChange={(value) => setFormData(prev => ({ ...prev, tissu: value as string }))}
            placeholder="Coton, Soie, Polyester..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Doublure"
            value={formData.doublure}
            onChange={(value) => setFormData(prev => ({ ...prev, doublure: value as string }))}
            placeholder="Satin, Coton..."
          />

          <FormField
            label="Accessoires"
            value={formData.accessoires}
            onChange={(value) => setFormData(prev => ({ ...prev, accessoires: value as string }))}
            placeholder="Boutons, Fermeture éclair..."
          />
        </div>

        {/* Montants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Montant total (FCFA)"
            type="number"
            value={formData.montantTotal}
            onChange={(value) => setFormData(prev => ({ ...prev, montantTotal: Number(value) }))}
          />

          <FormField
            label="Acompte (FCFA)"
            type="number"
            value={formData.acompte}
            onChange={(value) => setFormData(prev => ({ ...prev, acompte: Number(value) }))}
          />
        </div>

        {/* Instructions spéciales */}
        <FormField
          label="Instructions spéciales"
          type="textarea"
          value={formData.instructions}
          onChange={(value) => setFormData(prev => ({ ...prev, instructions: value as string }))}
          placeholder="Instructions particulières pour la confection..."
        />

        {/* Notes */}
        <FormField
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))}
          placeholder="Notes additionnelles..."
        />

        {/* Boutons */}
        <div className="flex space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Annuler
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={isLoading || !formData.clientId || !formData.dateLivraison}
          >
            {isLoading ? 'Création...' : 'Créer la commande'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal détails commande complète
const CommandeDetailsModal: React.FC<{
  commande: Commande;
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ commande, client, isOpen, onClose, onUpdate }) => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [retouches, setRetouches] = useState<Retouche[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showRetoucheModal, setShowRetoucheModal] = useState(false);

  useEffect(() => {
    if (isOpen && commande) {
      loadCommandeData();
    }
  }, [isOpen, commande]);

  const loadCommandeData = async () => {
    try {
      const [paiementsData, retouchesData] = await Promise.all([
        db.paiements.where('commandeId').equals(commande.id).toArray(),
        db.retouches.where('commandeId').equals(commande.id).toArray()
      ]);
      setPaiements(paiementsData);
      setRetouches(retouchesData);
    } catch (error) {
      console.error('Erreur chargement données commande:', error);
    }
  };

  const handleGenerateFacture = async () => {
    if (!client) return;
    setIsLoading(true);
    try {
      await generateFacturePDF(client, commande, paiements);
    } catch (error) {
      console.error('Erreur génération facture:', error);
      alert('Erreur lors de la génération de la facture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await db.commandes.update(commande.id, { statut: newStatus });
      onUpdate();
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Retouche': return 'bg-orange-100 text-orange-800';
      case 'Livrée': return 'bg-green-100 text-green-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-100 text-red-800';
      case 'Haute': return 'bg-orange-100 text-orange-800';
      case 'Normale': return 'bg-blue-100 text-blue-800';
      case 'Basse': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  const isLate = new Date(commande.dateLivraison) < new Date() && commande.statut !== 'Livrée';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Détails de la Commande" 
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* En-tête avec photo et informations principales */}
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg">
          {commande.photo && (
            <img
              src={commande.photo}
              alt={commande.modele}
              className="w-24 h-24 object-cover rounded-lg border-2 border-white shadow-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-bold">{commande.modele}</h3>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(commande.statut)} bg-opacity-90`}>
                  {commande.statut}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${getPriorityColor(commande.priorite)} bg-opacity-90`}>
                  {commande.priorite}
                </span>
                {isLate && (
                  <span className="px-3 py-1 text-sm bg-red-500 text-white rounded-full font-medium">
                    En retard
                  </span>
                )}
              </div>
            </div>
            <p className="text-green-100 text-lg">
              {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
            </p>
            {commande.reference && (
              <p className="text-green-200 text-sm">Référence: {commande.reference}</p>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowEditModal(true)}
            variant="secondary"
            size="sm"
          >
            <Edit size={16} className="mr-1" />
            Modifier
          </Button>
          <Button
            onClick={() => setShowPaiementModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <DollarSign size={16} className="mr-1" />
            Paiement
          </Button>
          <Button
            onClick={() => setShowRetoucheModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
            size="sm"
          >
            <Edit size={16} className="mr-1" />
            Retouche
          </Button>
          <Button
            onClick={handleGenerateFacture}
            disabled={isLoading || !client}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <FileText size={16} className="mr-1" />
            {isLoading ? 'Génération...' : 'Facture PDF'}
          </Button>
        </div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2" size={18} />
              Informations générales
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date commande:</span>
                <span className="font-medium">{commande.dateCommande.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date livraison:</span>
                <span className={`font-medium ${isLate ? 'text-red-600' : ''}`}>
                  {commande.dateLivraison.toLocaleDateString('fr-FR')}
                  {isLate && ' (En retard)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priorité:</span>
                <span className="font-medium">{commande.priorite}</span>
              </div>
              {commande.couleur && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Couleur:</span>
                  <span className="font-medium">{commande.couleur}</span>
                </div>
              )}
              {commande.tissu && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tissu:</span>
                  <span className="font-medium">{commande.tissu}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Informations financières */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="mr-2" size={18} />
              Informations financières
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant total:</span>
                <span className="font-bold text-lg">{commande.montantTotal.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Acompte versé:</span>
                <span className="font-medium text-green-600">{commande.acompte.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reste à payer:</span>
                <span className={`font-medium ${commande.reste > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {commande.reste.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut paiement:</span>
                <span className={`font-medium ${
                  commande.statutPaiement === 'Payé' ? 'text-green-600' :
                  commande.statutPaiement === 'Acompte' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {commande.statutPaiement}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Détails techniques */}
        {(commande.doublure || commande.accessoires || commande.instructions) && (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Détails techniques</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {commande.doublure && (
                <div>
                  <span className="text-gray-600 block">Doublure:</span>
                  <span className="font-medium">{commande.doublure}</span>
                </div>
              )}
              {commande.accessoires && (
                <div>
                  <span className="text-gray-600 block">Accessoires:</span>
                  <span className="font-medium">{commande.accessoires}</span>
                </div>
              )}
              {commande.instructions && (
                <div className="md:col-span-3">
                  <span className="text-gray-600 block">Instructions:</span>
                  <span className="font-medium">{commande.instructions}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Historique des paiements */}
        {paiements.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Historique des paiements</h4>
            <div className="space-y-2">
              {paiements.map(paiement => (
                <div key={paiement.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="font-medium text-blue-800">{paiement.type}</span>
                    <p className="text-sm text-blue-600">
                      {paiement.datePaiement.toLocaleDateString('fr-FR')} - {paiement.methode}
                    </p>
                    {paiement.reference && (
                      <p className="text-xs text-blue-500">Réf: {paiement.reference}</p>
                    )}
                  </div>
                  <span className="font-bold text-blue-800">
                    {paiement.montant.toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Retouches */}
        {retouches.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Retouches</h4>
            <div className="space-y-2">
              {retouches.map(retouche => (
                <div key={retouche.id} className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">{retouche.description}</p>
                      <p className="text-sm text-orange-600">
                        Prévue le {retouche.datePrevue.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      retouche.statut === 'Terminée' ? 'bg-green-100 text-green-800' :
                      retouche.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {retouche.statut}
                    </span>
                  </div>
                  {retouche.cout && (
                    <p className="text-sm text-orange-700 mt-1">
                      Coût: {retouche.cout.toLocaleString()} F
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        {commande.notes && (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {commande.notes}
            </p>
          </Card>
        )}

        {/* Actions de statut */}
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-4">Changer le statut</h4>
          <div className="flex flex-wrap gap-2">
            {['En attente', 'En cours', 'Retouche', 'Livrée', 'Annulée'].map(status => (
              <Button
                key={status}
                onClick={() => handleUpdateStatus(status)}
                variant={commande.statut === status ? 'primary' : 'secondary'}
                size="sm"
                disabled={commande.statut === status}
              >
                {status}
              </Button>
            ))}
          </div>
        </Card>

        {/* Bouton fermer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};