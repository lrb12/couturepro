import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, DollarSign, User } from 'lucide-react';
import { Image as ImageIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { ImageUpload } from '../components/ui/ImageUpload';
import { db } from '../services/database';
import { generateFacturePDF } from '../services/pdf';
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>
          
          <div className="flex space-x-3 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-green-600 hover:bg-green-700 rounded-xl"
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
            <Card className="text-center py-12 rounded-xl">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucune commande trouvée' 
                  : 'Aucune commande enregistrée'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
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
      <Card onClick={() => setShowDetails(true)} className="hover:shadow-lg cursor-pointer transition-all duration-200 rounded-xl">
        <div className="flex items-start space-x-4 mb-3">
          {/* Image du modèle */}
          <div className="flex-shrink-0">
            {commande.photo ? (
              <img
                src={commande.photo}
                alt={commande.modele}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <ImageIcon className="text-gray-400" size={24} />
              </div>
            )}
          </div>
          
          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{commande.modele || 'Modèle non défini'}</h3>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(commande.statut || '')}`}>
                {commande.statut || 'Non défini'}
              </span>
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
              </div>
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
          <div className="text-right text-sm">
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
        photo: '',
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

        {/* Nom du modèle */}
        <FormField
          label="Nom du modèle"
          value={formData.modele}
          onChange={(value) => setFormData(prev => ({ ...prev, modele: value as string }))}
          placeholder="Robe de soirée, Costume..."
        />

        {/* Photo du modèle */}
        <ImageUpload
          label="Photo du modèle"
          value={formData.photo}
          onChange={(photo) => setFormData(prev => ({ ...prev, photo: photo || '' }))}
        />

        {/* Référence */}
        <FormField
          label="Référence"
          value={formData.reference}
          onChange={(value) => setFormData(prev => ({ ...prev, reference: value as string }))}
          placeholder="REF-001, CMD-2024-001..."
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
          placeholder="Instructions spéciales, détails du modèle..."
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

// Modal détails commande
const CommandeDetailsModal: React.FC<{
  commande: Commande;
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ commande, client, isOpen, onClose, onUpdate }) => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && commande) {
      loadPaiements();
    }
  }, [isOpen, commande]);

  const loadPaiements = async () => {
    try {
      const paiementsData = await db.paiements
        .where('commandeId')
        .equals(commande.id)
        .toArray();
      setPaiements(paiementsData);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Retouche': return 'bg-orange-100 text-orange-800';
      case 'Livrée': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Détails de la Commande" 
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* En-tête avec photo */}
        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg">
          {commande.photo && (
            <img
              src={commande.photo}
              alt={commande.modele}
              className="w-20 h-20 object-cover rounded-lg border-2 border-white"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{commande.modele}</h3>
            <p className="text-green-100">
              {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
            </p>
            <div className="flex items-center mt-2">
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(commande.statut)} bg-opacity-90`}>
                {commande.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Informations</h4>
            <div className="space-y-2 text-sm">
              {commande.reference && (
                <div>
                  <span className="text-gray-600">Référence:</span>
                  <span className="ml-2 font-medium">{commande.reference}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Date commande:</span>
                <span className="ml-2 font-medium">
                  {commande.dateCommande.toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date livraison:</span>
                <span className="ml-2 font-medium">
                  {commande.dateLivraison.toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Financier</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Montant total:</span>
                <span className="ml-2 font-bold text-lg">
                  {commande.montantTotal.toLocaleString()} F
                </span>
              </div>
              <div>
                <span className="text-gray-600">Acompte versé:</span>
                <span className="ml-2 font-medium text-green-600">
                  {commande.acompte.toLocaleString()} F
                </span>
              </div>
              <div>
                <span className="text-gray-600">Reste à payer:</span>
                <span className={`ml-2 font-medium ${commande.reste > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {commande.reste.toLocaleString()} F
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des paiements */}
        {paiements.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Historique des paiements</h4>
            <div className="space-y-2">
              {paiements.map(paiement => (
                <div key={paiement.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="font-medium text-blue-800">{paiement.type}</span>
                    <p className="text-sm text-blue-600">
                      {paiement.datePaiement.toLocaleDateString('fr-FR')} - {paiement.methode}
                    </p>
                  </div>
                  <span className="font-bold text-blue-800">
                    {paiement.montant.toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {commande.notes && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {commande.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleGenerateFacture}
            disabled={isLoading || !client}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText size={16} className="mr-2" />
            {isLoading ? 'Génération...' : 'Générer facture'}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            fullWidth
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
