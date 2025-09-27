import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, DollarSign, User, Package, CreditCard as Edit, Trash2, Eye, FileText, Clock, AlertTriangle, Filter, Download } from 'lucide-react';
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
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'livraison' | 'montant' | 'client'>('date');
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
      
      let matchesDate = true;
      if (filterDateDebut && filterDateFin) {
        const dateCommande = new Date(commande.dateCommande);
        const debut = new Date(filterDateDebut);
        const fin = new Date(filterDateFin);
        matchesDate = dateCommande >= debut && dateCommande <= fin;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
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
        case 'client':
          const clientA = clients.find(c => c.id === a.clientId);
          const clientB = clients.find(c => c.id === b.clientId);
          const nameA = clientA ? `${clientA.prenom} ${clientA.nom}` : '';
          const nameB = clientB ? `${clientB.prenom} ${clientB.nom}` : '';
          comparison = nameA.localeCompare(nameB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts', color: 'bg-gray-100' },
    { value: 'En attente', label: 'En attente', color: 'bg-yellow-100' },
    { value: 'En cours', label: 'En cours', color: 'bg-blue-100' },
    { value: 'Retouche', label: 'Retouche', color: 'bg-orange-100' },
    { value: 'Livrée', label: 'Livrée', color: 'bg-green-100' },
    { value: 'Annulée', label: 'Annulée', color: 'bg-red-100' }
  ];

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

  const handleUpdateStatus = async (commandeId: string, newStatus: string) => {
    try {
      await db.commandes.update(commandeId, { statut: newStatus });
      await loadData();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const handleDeleteCommande = async (commandeId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await db.commandes.delete(commandeId);
        await loadData();
      } catch (error) {
        console.error('Erreur suppression commande:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-app">
      <Header title="Commandes" showLogo={false} />
      
      <main className="p-4 pb-20">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="card-on-blue rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{commandes.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="card-on-blue rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {commandes.filter(c => c.statut === 'En cours').length}
            </div>
            <div className="text-xs text-gray-600">En cours</div>
          </div>
          <div className="card-on-blue rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {commandes.filter(c => c.statut === 'Livrée').length}
            </div>
            <div className="text-xs text-gray-600">Livrées</div>
          </div>
          <div className="card-on-blue rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {commandes.filter(c => new Date(c.dateLivraison) < new Date() && c.statut !== 'Livrée').length}
            </div>
            <div className="text-xs text-gray-600">En retard</div>
          </div>
        </div>

        {/* Barre de recherche et actions */}
        <div className="card-on-blue rounded-xl p-4 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par modèle, client ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowNewModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white flex-1 sm:flex-none"
              >
                <Plus size={20} className="mr-2" />
                Nouvelle Commande
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                className="flex-1 sm:flex-none"
              >
                <Filter size={20} className="mr-2" />
                Filtres
              </Button>
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={filterDateDebut}
                    onChange={(e) => setFilterDateDebut(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={filterDateFin}
                    onChange={(e) => setFilterDateFin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="date">Date commande</option>
                      <option value="livraison">Date livraison</option>
                      <option value="montant">Montant</option>
                      <option value="client">Client</option>
                    </select>
                    <Button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      variant="secondary"
                      size="sm"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="card-on-blue rounded-xl overflow-hidden">
          {filteredAndSortedCommandes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° / Référence
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedCommandes.map((commande, index) => {
                    const client = clients.find(c => c.id === commande.clientId);
                    const isLate = new Date(commande.dateLivraison) < new Date() && commande.statut !== 'Livrée';
                    
                    return (
                      <tr key={commande.id} className={`hover:bg-gray-50 ${isLate ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{String(index + 1).padStart(3, '0')}
                          </div>
                          {commande.reference && (
                            <div className="text-sm text-gray-500">{commande.reference}</div>
                          )}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
                              </div>
                              {client?.telephone && (
                                <div className="text-sm text-gray-500">{client.telephone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {commande.photo && (
                              <img
                                src={commande.photo}
                                alt={commande.modele}
                                className="w-10 h-10 object-cover rounded-lg mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {commande.modele}
                              </div>
                              {commande.couleur && (
                                <div className="text-sm text-gray-500">{commande.couleur}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Commande: {new Date(commande.dateCommande).toLocaleDateString('fr-FR')}</div>
                          <div className={isLate ? 'text-red-600 font-medium' : ''}>
                            Livraison: {new Date(commande.dateLivraison).toLocaleDateString('fr-FR')}
                            {isLate && <AlertTriangle size={14} className="inline ml-1" />}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {commande.montantTotal.toLocaleString()} F
                          </div>
                          {commande.reste > 0 && (
                            <div className="text-sm text-red-600">
                              Reste: {commande.reste.toLocaleString()} F
                            </div>
                          )}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commande.statut)}`}>
                            {commande.statut}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <CommandeDetailsModal
                              commande={commande}
                              client={client}
                              onUpdate={loadData}
                            />
                            
                            <select
                              value={commande.statut}
                              onChange={(e) => handleUpdateStatus(commande.id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="En attente">En attente</option>
                              <option value="En cours">En cours</option>
                              <option value="Retouche">Retouche</option>
                              <option value="Livrée">Livrée</option>
                              <option value="Annulée">Annulée</option>
                            </select>
                            
                            <Button
                              onClick={() => handleDeleteCommande(commande.id)}
                              variant="danger"
                              size="sm"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterDateDebut || filterDateFin
                  ? 'Aucune commande trouvée avec ces critères' 
                  : 'Aucune commande enregistrée'
                }
              </p>
            </div>
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

// Modal nouvelle commande
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
    quantite: 1,
    dateLivraison: '',
    montantTotal: 0,
    acompte: 0,
    couleur: '',
    tissu: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.modele || !formData.dateLivraison) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    try {
      const dateLivraison = new Date(formData.dateLivraison);
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
        modele: formData.modele,
        photo: formData.photo,
        reference: formData.reference,
        quantite: formData.quantite,
        dateCommande: new Date(),
        dateLivraison,
        montantTotal,
        acompte,
        reste,
        statut: 'En attente',
        statutPaiement,
        priorite: 'Normale',
        couleur: formData.couleur,
        tissu: formData.tissu,
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
        quantite: 1,
        dateLivraison: '',
        montantTotal: 0,
        acompte: 0,
        couleur: '',
        tissu: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert("Erreur lors de la création de la commande.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Commande" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <FormField
            label="Référence"
            value={formData.reference}
            onChange={(value) => setFormData(prev => ({ ...prev, reference: value as string }))}
            placeholder="REF-001"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Modèle/Produit"
            value={formData.modele}
            onChange={(value) => setFormData(prev => ({ ...prev, modele: value as string }))}
            placeholder="Robe de soirée, Costume..."
            required
          />

          <FormField
            label="Quantité"
            type="number"
            value={formData.quantite}
            onChange={(value) => setFormData(prev => ({ ...prev, quantite: Number(value) }))}
            required
          />
        </div>

        <ImageUpload
          label="Photo du modèle"
          value={formData.photo}
          onChange={(photo) => setFormData(prev => ({ ...prev, photo: photo || '' }))}
        />

        <FormField
          label="Date de livraison"
          type="date"
          value={formData.dateLivraison}
          onChange={(value) => setFormData(prev => ({ ...prev, dateLivraison: value as string }))}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Couleur"
            value={formData.couleur}
            onChange={(value) => setFormData(prev => ({ ...prev, couleur: value as string }))}
            placeholder="Rouge, Bleu..."
          />

          <FormField
            label="Tissu"
            value={formData.tissu}
            onChange={(value) => setFormData(prev => ({ ...prev, tissu: value as string }))}
            placeholder="Coton, Soie..."
          />
        </div>

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

        <FormField
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))}
          placeholder="Notes additionnelles..."
        />

        <div className="flex space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Annuler
          </Button>
          <Button
            type="submit"
            fullWidth
            className="bg-gradient-to-r from-blue-500 to-blue-600"
          >
            Créer la commande
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal détails commande
const CommandeDetailsModal: React.FC<{
  commande: Commande;
  client?: Client;
  onUpdate: () => void;
}> = ({ commande, client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  const loadPaiements = async () => {
    if (showDetails) {
      const paiementsData = await db.paiements.where('commandeId').equals(commande.id).toArray();
      setPaiements(paiementsData);
    }
  };

  useEffect(() => {
    loadPaiements();
  }, [showDetails]);

  const handleGenerateFacture = async () => {
    if (!client) return;
    try {
      await generateFacturePDF(client, commande, paiements);
    } catch (error) {
      console.error('Erreur génération facture:', error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDetails(true)}
        variant="secondary"
        size="sm"
      >
        <Eye size={14} />
      </Button>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Détails de la Commande"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-start space-x-4">
              {commande.photo && (
                <img
                  src={commande.photo}
                  alt={commande.modele}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-white"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{commande.modele}</h3>
                <p className="text-blue-100">
                  {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
                </p>
                {commande.reference && (
                  <p className="text-blue-200 text-sm">Réf: {commande.reference}</p>
                )}
              </div>
              <Button
                onClick={handleGenerateFacture}
                variant="secondary"
                size="sm"
                disabled={!client}
              >
                <FileText size={16} className="mr-1" />
                Facture PDF
              </Button>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-on-blue p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Informations générales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Date commande:</span>
                  <span className="font-medium">{commande.dateCommande.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date livraison:</span>
                  <span className="font-medium">{commande.dateLivraison.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantité:</span>
                  <span className="font-medium">{commande.quantite}</span>
                </div>
                <div className="flex justify-between">
                  <span>Statut:</span>
                  <span className="font-medium">{commande.statut}</span>
                </div>
              </div>
            </div>

            <div className="card-on-blue p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Informations financières</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Montant total:</span>
                  <span className="font-bold text-lg">{commande.montantTotal.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>Acompte versé:</span>
                  <span className="font-medium text-green-600">{commande.acompte.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>Reste à payer:</span>
                  <span className={`font-medium ${commande.reste > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {commande.reste.toLocaleString()} F
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des paiements */}
          {paiements.length > 0 && (
            <div className="card-on-blue p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Historique des paiements</h4>
              <div className="space-y-2">
                {paiements.map(paiement => (
                  <div key={paiement.id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <div>
                      <span className="font-medium">{paiement.type}</span>
                      <p className="text-sm text-gray-600">
                        {paiement.datePaiement.toLocaleDateString('fr-FR')} - {paiement.methode}
                      </p>
                    </div>
                    <span className="font-bold">{paiement.montant.toLocaleString()} F</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {commande.notes && (
            <div className="card-on-blue p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Notes</h4>
              <p className="text-gray-600">{commande.notes}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};