import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, Mail, MapPin, Ruler, FileText, User } from 'lucide-react';
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

// === Clients Page ===
export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const loadClients = async () => {
    const data = await db.clients.orderBy('dateCreation').reverse().toArray();
    setClients(data);
  };

  useEffect(() => { loadClients(); }, []);

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
                <Button onClick={() => setShowNewClientModal(true)} className="mt-4 bg-green-600 hover:bg-green-700">
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

// === Client Card + Details Modal ===
const ClientCard: React.FC<{ client: Client; onUpdate: () => void }> = ({ client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <>
      <Card onClick={() => setShowDetails(true)} className="hover:shadow-lg cursor-pointer transition-all duration-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{client.prenom} {client.nom}</h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Phone size={14} className="mr-1" /> <span>{client.telephone}</span>
            </div>
            {client.email && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <Mail size={14} className="mr-1" /> <span>{client.email}</span>
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

  const loadMesures = async () => {
    const data = await db.mesures.where('clientId').equals(client.id).toArray();
    setMesures(data);
  };

  useEffect(() => {
    if (isOpen) loadMesures();
  }, [isOpen, client.id]);

  const handleViewMesure = (mesure: Mesure) => {
    setSelectedMesure(mesure);
    setShowMesuresViewer(true);
  };

  const handleMesuresSaved = () => {
    loadMesures();
    setShowMesuresModal(false);
  };

  const handleGeneratePDF = () => {
    generateMesuresPDF(client, mesures);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${client.prenom} ${client.nom}`} maxWidth="max-w-3xl">
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
                  <Button size="sm" variant="secondary" onClick={handleGeneratePDF}>
                    <FileText size={16} className="mr-1" /> PDF
                  </Button>
                )}
              </div>
            </div>
            {mesures.length > 0 ? (
              <div className="space-y-2">
                {mesures.slice().reverse().map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => handleViewMesure(m)}>
                    <span className="text-sm font-medium text-blue-800">{new Date(m.dateCreation).toLocaleDateString('fr-FR')}</span>
                    <FileText size={16} className="text-blue-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune mesure</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modals pour mesures */}
      <MesuresModal client={client} isOpen={showMesuresModal} onClose={() => setShowMesuresModal(false)} onSuccess={handleMesuresSaved} />

      {selectedMesure && (
        <MesuresViewer isOpen={showMesuresViewer} onClose={() => setShowMesuresViewer(false)} client={client} mesure={selectedMesure} />
      )}
    </>
  );
};

// === NEW CLIENT MODAL ===
interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = async () => {
    await db.clients.add({ prenom, nom, telephone, email, dateCreation: new Date().toISOString() });
    onSuccess();
    onClose();
    setPrenom(''); setNom(''); setTelephone(''); setEmail('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Client">
      <FormField label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
      <FormField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
      <FormField label="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
      <FormField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      <Button className="mt-4 bg-green-600 hover:bg-green-700 w-full" onClick={handleSave}>Enregistrer</Button>
    </Modal>
  );
};
