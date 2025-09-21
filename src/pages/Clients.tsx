import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, UserPlus, Phone, Mail, MapPin, Ruler, History, FileText, Trash2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { db } from '../services/database';
import { generateMesuresPDF } from '../services/pdf';
import { Client, Mesure, Commande } from '../types';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        {/* Barre de recherche et actions */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <Button
            onClick={() => setShowNewClientModal(true)}
            fullWidth
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus size={20} className="mr-2" />
            Nouveau Client
          </Button>
        </div>

        {/* Liste des clients */}
        <div className="space-y-3">
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onUpdate={loadClients}
            />
          ))}
          
          {filteredClients.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
              </p>
            </Card>
          )}
        </div>
      </main>

      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSuccess={loadClients}
      />

      <Footer />
    </div>
  );
};

// Composant carte client
const ClientCard: React.FC<{ client: Client; onUpdate: () => void }> = ({ client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Card onClick={() => setShowDetails(true)} className="hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {client.prenom} {client.nom}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Phone size={14} className="mr-1" />
              <span>{client.telephone}</span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Ajouté le</p>
            <p>{client.dateCreation.toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </Card>

      <ClientDetailsModal
        client={client}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};

// Modal détails client
const ClientDetailsModal: React.FC<{
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ client, isOpen, onClose, onUpdate }) => {
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [showMesuresModal, setShowMesuresModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClientData();
    }
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

  const handleGenerateMesuresPDF = async () => {
    if (mesures.length > 0) {
      await generateMesuresPDF(client, mesures[mesures.length - 1]);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${client.prenom} ${client.nom}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Informations de contact */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Phone size={16} className="mr-2 text-gray-500" />
                <span>{client.telephone}</span>
              </div>
              {client.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-gray-500" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-500" />
                  <span>{client.adresse}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mesures */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Mesures ({mesures.length})</h4>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setShowMesuresModal(true)}
                >
                  <Ruler size={16} className="mr-1" />
                  Prendre
                </Button>
                {mesures.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleGenerateMesuresPDF}
                  >
                    <FileText size={16} className="mr-1" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
            
            {mesures.length > 0 ? (
              <div className="text-sm text-gray-600">
                Dernière prise: {mesures[mesures.length - 1].dateCreation.toLocaleDateString('fr-FR')}
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
                {commandes.slice(0, 3).map(commande => (
                  <div key={commande.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{commande.modele}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      commande.statut === 'Livrée' ? 'bg-green-100 text-green-800' :
                      commande.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commande.statut}
                    </span>
                  </div>
                ))}
                {commandes.length > 3 && (
                  <p className="text-xs text-gray-500">
                    et {commandes.length - 3} autre(s)...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune commande</p>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </Modal>

      <MesuresModal
        client={client}
        isOpen={showMesuresModal}
        onClose={() => setShowMesuresModal(false)}
        onSuccess={loadClientData}
      />
    </>
  );
};

// Modal nouveau client
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
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur création client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau Client"
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Nom"
          value={formData.nom}
          onChange={(value) => setFormData(prev => ({ ...prev, nom: value as string }))}
          required
        />
        
        <FormField
          label="Prénom"
          value={formData.prenom}
          onChange={(value) => setFormData(prev => ({ ...prev, prenom: value as string }))}
          required
        />
        
        <FormField
          label="Téléphone"
          type="tel"
          value={formData.telephone}
          onChange={(value) => setFormData(prev => ({ ...prev, telephone: value as string }))}
          required
        />
        
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData(prev => ({ ...prev, email: value as string }))}
        />
        
        <FormField
          label="Adresse"
          value={formData.adresse}
          onChange={(value) => setFormData(prev => ({ ...prev, adresse: value as string }))}
        />
        
        <FormField
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))}
        />

        <div className="flex space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Annuler
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={isLoading || !formData.nom || !formData.prenom || !formData.telephone}
          >
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal prise de mesures
const MesuresModal: React.FC<{
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ client, isOpen, onClose, onSuccess }) => {
  const [mesures, setMesures] = useState({
    dos: 0,
    longueurManche: 0,
    tourManche: 0,
    longueurRobe: 0,
    jupe: 0,
    pantalon: 0,
    taille: 0,
    poitrine: 0,
    sousSein: 0,
    encolure: 0,
    carrure: 0,
    hanches: 0,
    genoux: 0,
    ceinture: 0,
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await db.mesures.add({
        id: Date.now().toString(),
        clientId: client.id,
        ...mesures,
        dateCreation: new Date()
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde mesures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const mesuresFields = [
    { key: 'dos', label: 'Dos (cm)' },
    { key: 'longueurManche', label: 'Longueur manche (cm)' },
    { key: 'tourManche', label: 'Tour de manche (cm)' },
    { key: 'longueurRobe', label: 'Longueur robe (cm)' },
    { key: 'jupe', label: 'Jupe (cm)' },
    { key: 'pantalon', label: 'Pantalon (cm)' },
    { key: 'taille', label: 'Taille (cm)' },
    { key: 'poitrine', label: 'Poitrine (cm)' },
    { key: 'sousSein', label: 'Sous-sein (cm)' },
    { key: 'encolure', label: 'Encolure (cm)' },
    { key: 'carrure', label: 'Carrure (cm)' },
    { key: 'hanches', label: 'Hanches (cm)' },
    { key: 'genoux', label: 'Genoux (cm)' },
    { key: 'ceinture', label: 'Ceinture (cm)' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mesures - ${client.prenom} ${client.nom}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {mesuresFields.map(field => (
            <FormField
              key={field.key}
              label={field.label}
              type="number"
              value={mesures[field.key as keyof typeof mesures] as number}
              onChange={(value) => setMesures(prev => ({ 
                ...prev, 
                [field.key]: value as number 
              }))}
              className="text-sm"
            />
          ))}
        </div>

        <FormField
          label="Notes"
          type="textarea"
          value={mesures.notes}
          onChange={(value) => setMesures(prev => ({ 
            ...prev, 
            notes: value as string 
          }))}
        />

        <div className="flex space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Annuler
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};