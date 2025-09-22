import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, UserPlus, Phone, Mail, MapPin,
  Ruler, FileText, User
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { db } from '../services/database';
import { generateMesuresPDF } from '../services/pdf';
import { Client, Mesure, Commande } from '../types';
import { MesuresViewer } from '../components/ui/MesuresViewer';

// ==================== ClientsPage ====================
export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const loadClients = async () => {
    try {
      const clientsData = await db.clients.orderBy('dateCreation').reverse().toArray();
      setClients(clientsData);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Clients" showLogo={false} />

      <main className="p-4 pb-20">
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          <Button
            onClick={() => setShowNewClientModal(true)}
            fullWidth
            className="bg-green-600 hover:bg-green-700 rounded-xl shadow-lg"
          >
            <UserPlus size={20} className="mr-2" />
            Nouveau Client
          </Button>
        </div>

        <div className="space-y-3">
          {filteredClients.map(client => (
            <ClientCard key={client.id} client={client} onUpdate={loadClients} />
          ))}

          {filteredClients.length === 0 && (
            <Card className="text-center py-12 rounded-xl">
              <User className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">
                {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowNewClientModal(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <UserPlus size={16} className="mr-2" />
                  Ajouter le premier client
                </Button>
              )}
            </Card>
          )}
        </div>
      </main>

      {/* === New Client Modal === */}
      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSuccess={loadClients}
      />

      <Footer />
    </div>
  );
};

// ==================== NewClientModal ====================
const NewClientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await db.clients.add({
        id: Date.now().toString(),
        ...formData,
        dateCreation: new Date()
      });
      onSuccess();
      onClose();
      setFormData({ nom:'', prenom:'', telephone:'', email:'', adresse:'', notes:'' });
    } catch (error) {
      console.error('Erreur création client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nom" value={formData.nom} onChange={(v) => setFormData(prev => ({ ...prev, nom: v as string }))} required />
        <FormField label="Prénom" value={formData.prenom} onChange={(v) => setFormData(prev => ({ ...prev, prenom: v as string }))} required />
        <FormField label="Téléphone" type="tel" value={formData.telephone} onChange={(v) => setFormData(prev => ({ ...prev, telephone: v as string }))} required />
        <FormField label="Email" type="email" value={formData.email} onChange={(v) => setFormData(prev => ({ ...prev, email: v as string }))} />
        <FormField label="Adresse" value={formData.adresse} onChange={(v) => setFormData(prev => ({ ...prev, adresse: v as string }))} />
        <FormField label="Notes" type="textarea" value={formData.notes} onChange={(v) => setFormData(prev => ({ ...prev, notes: v as string }))} />

        <div className="flex space-x-3 mt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Annuler</Button>
          <Button type="submit" fullWidth disabled={isLoading || !formData.nom || !formData.prenom || !formData.telephone}>
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ==================== ClientCard ====================
const ClientCard: React.FC<{ client: Client; onUpdate: () => void }> = ({ client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card onClick={() => setShowDetails(true)} className="hover:shadow-lg cursor-pointer transition-all duration-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{client.prenom} {client.nom}</h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Phone size={14} className="mr-1" /> {client.telephone}
            </div>
            {client.email && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <Mail size={14} className="mr-1" /> {client.email}
              </div>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Ajouté le</p>
            <p>{new Date(client.dateCreation).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </Card>

      <ClientDetailsModal client={client} isOpen={showDetails} onClose={() => setShowDetails(false)} onUpdate={onUpdate} />
    </>
  );
};

// ==================== ClientDetailsModal ====================
const ClientDetailsModal: React.FC<{
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ client, isOpen, onClose, onUpdate }) => {
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [showMesuresModal, setShowMesuresModal] = useState(false);
  const [showMesuresViewer, setShowMesuresViewer] = useState(false);
  const [selectedMesure, setSelectedMesure] = useState<Mesure | null>(null);

  useEffect(() => {
    if (isOpen) loadClientData();
  }, [isOpen, client.id]);

  const loadClientData = async () => {
    try {
      const mesuresData = await db.mesures.where('clientId').equals(client.id).toArray();
      const commandesData = await db.commandes.where('clientId').equals(client.id).toArray();
      setMesures(mesuresData);
      setCommandes(commandesData);
    } catch (error) {
      console.error('Erreur chargement données client:', error);
    }
  };

  const handleViewMesures = (mesure: Mesure) => {
    setSelectedMesure(mesure);
    setShowMesuresViewer(true);
  };

  const handleMesuresSaved = () => {
    loadClientData();
    setShowMesuresModal(false);
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

  const handleGenerateMesuresPDF = () => {
    generateMesuresPDF(client, mesures);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${client.prenom} ${client.nom}`} maxWidth="max-w-2xl">
        <div className="space-y-6">

          {/* Contact */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center"><Phone size={16} className="mr-2 text-gray-500" /> {client.telephone}</div>
              {client.email && <div className="flex items-center"><Mail size={16} className="mr-2 text-gray-500" /> {client.email}</div>}
              {client.adresse && <div className="flex items-center"><MapPin size={16} className="mr-2 text-gray-500" /> {client.adresse}</div>}
            </div>
          </div>

          {/* Mesures */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Mesures ({mesures.length})</h4>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowMesuresModal(true)}>
                  <Ruler size={16} className="mr-1" /> Prendre
                </Button>
                {mesures.length > 0 && (
                  <>
                    <Button size="sm" variant="secondary" onClick={handleGenerateMesuresPDF}>
                      <FileText size={16} className="mr-1" /> PDF
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowMesuresModal(true)}>
                      Nouvelle mesure
                    </Button>
                  </>
                )}
              </div>
            </div>

            {mesures.length > 0 ? (
              <div className="space-y-2">
                {mesures.slice().reverse().map((mesure, index) => (
                  <div
                    key={mesure.id}
                    onClick={() => handleViewMesures(mesure)}
                    className="flex justify-between items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-blue-800">
                        {new Date(mesure.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Récente</span>
                      )}
                    </div>
                    <FileText size={16} className="text-blue-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune mesure enregistrée</p>
            )}
          </div>

          {/* Commandes */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Historique Commandes ({commandes.length})</h4>
            {commandes.length > 0 ? (
              <div className="space-y-2">
                {commandes.slice().reverse().map(commande => (
                  <div key={commande.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{commande.modele}</span>
                      <p className="text-xs text-gray-500">{new Date(commande.dateCommande).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(commande.statut)}`}>
                      {commande.statut}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune commande</p>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{client.notes}</p>
            </div>
          )}
        </div>
      </Modal>

      {selectedMesure && (
        <MesuresViewer
          isOpen={showMesuresViewer}
          onClose={() => setShowMesuresViewer(false)}
          client={client}
          mesure={selectedMesure}
        />
      )}
    </>
  );
};
