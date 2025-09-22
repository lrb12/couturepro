import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, Mail, MapPin, Ruler, FileText, User } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { db } from '../services/database';
import { generateMesuresPDF } from '../services/pdf';
import { Client, Mesure, Commande } from '../types';
import { NewClientModal } from '../components/ui/NewClientModal';
import { MesuresModal } from '../components/ui/MesuresModal';
import { MesuresViewer } from '../components/ui/MesuresViewer';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
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

      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSuccess={loadClients}
      />

      <Footer />
    </div>
  );
};

// ==================== CLIENT CARD ====================

const ClientCard: React.FC<{ client: Client; onUpdate: () => void }> = ({ client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card onClick={() => setShowDetails(true)} className="hover:shadow-lg cursor-pointer transition-all duration-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {client.prenom} {client.nom}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Phone size={14} className="mr-1" />
              <span>{client.telephone}</span>
            </div>
            {client.email && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <Mail size={14} className="mr-1" />
                <span>{client.email}</span>
              </div>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Ajouté le</p>
            <p>{new Date(client.dateCreation).toLocaleDateString('fr-FR')}</p>
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

// ==================== CLIENT DETAILS MODAL ====================

const ClientDetailsModal: React.FC<{
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ client, isOpen, onClose, onUpdate }) => {
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [showMesuresModal, setShowMesuresModal] = useState(false);
  const [showMesuresViewer, setShowMesuresViewer] = useState(false);
  const [selectedMesure, setSelectedMesure] = useState<Mesure | null>(null);

  useEffect(() => {
    if (isOpen) loadClientData();
  }, [isOpen, client.id]);

  const loadClientData = async () => {
    try {
      const mesuresData = await db.mesures.where('clientId').equals(client.id).toArray();
      setMesures(mesuresData);
    } catch (error) {
      console.error('Erreur chargement mesures:', error);
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

  const handleGenerateMesuresPDF = () => {
    generateMesuresPDF(client, mesures);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${client.prenom} ${client.nom}`} maxWidth="max-w-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Mesures ({mesures.length})</h4>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowMesuresModal(true)}>
                <Ruler size={16} className="mr-1" />
                Prendre mesure
              </Button>
              {mesures.length > 0 && (
                <Button size="sm" variant="secondary" onClick={handleGenerateMesuresPDF}>
                  <FileText size={16} className="mr-1" />
                  PDF
                </Button>
              )}
            </div>
          </div>

          {mesures.length > 0 ? (
            <div className="space-y-2">
              {mesures.slice().reverse().map(mesure => (
                <div
                  key={mesure.id}
                  onClick={() => handleViewMesures(mesure)}
                  className="flex justify-between items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <span className="text-sm font-medium">{new Date(mesure.dateCreation).toLocaleDateString('fr-FR')}</span>
                  <FileText size={16} className="text-blue-600" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Aucune mesure enregistrée</p>
          )}
        </div>
      </Modal>

      <MesuresModal
        client={client}
        isOpen={showMesuresModal}
        onClose={() => setShowMesuresModal(false)}
        onSuccess={handleMesuresSaved}
      />

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
