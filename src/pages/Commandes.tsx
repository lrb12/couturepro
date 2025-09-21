import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, DollarSign, User } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { db } from '../services/database';
import { Commande, Client, Paiement } from '../types';

export const CommandesPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

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

  // Filtrage
  const filteredCommandes = commandes.filter(commande => {
    const client = clients.find(c => c.id === commande.clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : '';
    
    const matchesSearch = commande.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || commande.statut === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'En attente', label: 'En attente' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Retouche', label: 'Retouche' },
    { value: 'Livrée', label: 'Livrée' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commandes" showLogo={false} />
      
      <main className="p-4 pb-20">
        {/* Recherche et filtres */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex space-x-3 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus size={20} className="mr-1" />
              Nouvelle
            </Button>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-3">
          {filteredCommandes.map(commande => (
            <CommandeCard 
              key={commande.id} 
              commande={commande}
              client={clients.find(c => c.id === commande.clientId)}
              onUpdate={loadData}
            />
          ))}
          
          {filteredCommandes.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucune commande trouvée' 
                  : 'Aucune commande enregistrée'
                }
              </p>
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

// Carte commande
const CommandeCard: React.FC<{
  commande: Commande;
  client?: Client;
  onUpdate: () => void;
}> = ({ commande, client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Retouche': return 'bg-orange-100 text-orange-800';
      case 'Livrée': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <>
      <Card onClick={() => setShowDetails(true)} className="hover:shadow-md cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">{commande.modele || 'Non défini'}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <User size={14} className="mr-1" />
              <span>{client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-1" />
              <span>
                Livraison: {commande.dateLivraison ? new Date(commande.dateLivraison).toLocaleDateString('fr-FR') : 'Non définie'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(commande.statut || '')}`}>
              {commande.statut || 'Non défini'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm">
            <DollarSign size={14} className="mr-1" />
            <span className={getPaymentColor(commande.statutPaiement || '')}>
              {commande.statutPaiement || 'Non défini'}
            </span>
          </div>
          <div className="text-right text-sm">
            <span className="font-semibold">{commande.montantTotal?.toLocaleString() ?? 0} F</span>
            {commande.reste > 0 && (
              <span className="text-red-600 ml-2">(-{commande.reste?.toLocaleString() ?? 0})</span>
            )}
          </div>
        </div>
      </Card>

      {/* Modal détails (à implémenter si nécessaire) */}
      {showDetails && (
        <CommandeDetailsModal
          commande={commande}
          client={client}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
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
    reference: '',
    dateLivraison: '',
    montantTotal: 0,
    acompte: 0,
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation stricte
      if (!formData.clientId || !formData.modele || !formData.dateLivraison) {
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
        modele: formData.modele,
        reference: formData.reference,
        dateCommande: new Date(),
        dateLivraison,
        montantTotal,
        acompte,
        reste,
        statut: 'En attente',
        statutPaiement,
        notes: formData.notes || ''
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
        reference: '',
        dateLivraison: '',
        montantTotal: 0,
        acompte: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert("Erreur lors de la création de la commande. Vérifiez la console.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Commande" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit}>
        {/* Client */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Modèle (image) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modèle (image) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setFormData(prev => ({ ...prev, modele: reader.result as string }));
              };
              reader.readAsDataURL(file);
            }}
            required
          />
          {formData.modele && (
            <img
              src={formData.modele}
              alt="Prévisualisation modèle"
              className="mt-2 h-32 object-contain border rounded"
            />
          )}
        </div>

        {/* Référence */}
        <FormField
          label="Référence"
          value={formData.reference}
          onChange={(value) => setFormData(prev => ({ ...prev, reference: value as string }))}
        />

        {/* Date de livraison */}
        <FormField
          label="Date de livraison"
          type="date"
          value={formData.dateLivraison}
          onChange={(value) => setFormData(prev => ({ ...prev, dateLivraison: value as string }))}
          required
        />

        {/* Montant total */}
        <FormField
          label="Montant total (FCFA)"
          type="number"
          value={formData.montantTotal}
          onChange={(value) => setFormData(prev => ({ ...prev, montantTotal: Number(value) }))}
          required
        />

        {/* Acompte */}
        <FormField
          label="Acompte (FCFA)"
          type="number"
          value={formData.acompte}
          onChange={(value) => setFormData(prev => ({ ...prev, acompte: Number(value) }))}
        />

        {/* Notes */}
        <FormField
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))}
        />

        {/* Boutons */}
        <div className="flex space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Annuler
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={
              isLoading ||
              !formData.clientId ||
              !formData.modele ||
              !formData.dateLivraison
            }
          >
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Placeholder pour le modal détails (à implémenter)
const CommandeDetailsModal: React.FC<{
  commande: Commande;
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails Commande" maxWidth="max-w-lg">
      <p>Modal détails commande à implémenter</p>
    </Modal>
  );
};
