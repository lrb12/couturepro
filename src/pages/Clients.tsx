import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, Mail, MapPin, Ruler, FileText, User, Camera, CreditCard as Edit, Trash2, Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { ImageUpload } from '../components/ui/ImageUpload';
import { db } from '../services/database';
import { generateMesuresPDF } from '../services/pdf';
import { Client, Mesure, MesureType, Commande } from '../types';
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
    client.telephone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Clients" showLogo={false} />

      <main className="p-4 pb-20">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
            <div className="text-xs text-blue-700">Total clients</div>
          </Card>
          <Card className="text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => new Date().getTime() - new Date(c.dateCreation).getTime() < 30 * 24 * 60 * 60 * 1000).length}
            </div>
            <div className="text-xs text-green-700">Ce mois</div>
          </Card>
          <Card className="text-center bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {clients.filter(c => new Date().getTime() - new Date(c.dateCreation).getTime() < 7 * 24 * 60 * 60 * 1000).length}
            </div>
            <div className="text-xs text-purple-700">Cette semaine</div>
          </Card>
        </div>

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

// Client Card améliorée
const ClientCard: React.FC<{ client: Client; onUpdate: () => void }> = ({ client, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card
        onClick={() => setShowDetails(true)}
        className="hover:shadow-lg cursor-pointer transition-all duration-200 rounded-xl"
      >
        <div className="flex items-center space-x-4">
          {/* Photo du client */}
          <div className="flex-shrink-0">
            {client.photo ? (
              <img
                src={client.photo}
                alt={`${client.prenom} ${client.nom}`}
                className="w-16 h-16 object-cover rounded-full border-2 border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center border-2 border-gray-200">
                <User className="text-green-600" size={24} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">
              {client.prenom} {client.nom}
            </h3>
            <div className="space-y-1 mt-1">
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={14} className="mr-2" />
                <span>{client.telephone}</span>
              </div>
              {client.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-2" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-2" />
                  <span className="truncate">{client.adresse}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <p className="font-medium">Ajouté le</p>
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

// Modal détails client complète
const ClientDetailsModal: React.FC<{
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ client, isOpen, onClose, onUpdate }) => {
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [showMesuresModal, setShowMesuresModal] = useState(false);
  const [editingMesure, setEditingMesure] = useState<Mesure | null>(null);
  const [showMesuresViewer, setShowMesuresViewer] = useState(false);
  const [selectedMesure, setSelectedMesure] = useState<Mesure | null>(null);
  const [showEditClient, setShowEditClient] = useState(false);

  useEffect(() => {
    if (isOpen) loadClientData();
  }, [isOpen]);

  const loadClientData = async () => {
    try {
      const [mesuresData, commandesData] = await Promise.all([
        db.mesures.where('clientId').equals(client.id).toArray(),
        db.commandes.where('clientId').equals(client.id).toArray()
      ]);
      setMesures(mesuresData.sort((a, b) => b.version - a.version));
      setCommandes(commandesData.sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime()));
    } catch (error) {
      console.error('Erreur chargement données client:', error);
    }
  };

  const handleViewMesures = (mesure: Mesure) => {
    setSelectedMesure(mesure);
    setShowMesuresViewer(true);
  };

  const handleSaveMesure = () => {
    loadClientData();
    setShowMesuresModal(false);
    setEditingMesure(null);
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

  const handleGenerateMesuresPDF = async () => {
    if (mesures.length === 0) return;
    const latestMesure = mesures[0];
    await generateMesuresPDF(client, latestMesure);
  };

  const totalDepense = commandes.reduce((sum, cmd) => sum + (cmd.montantTotal || 0), 0);
  const commandesLivrees = commandes.filter(cmd => cmd.statut === 'Livrée').length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${client.prenom} ${client.nom}`} maxWidth="max-w-4xl">
        <div className="space-y-6">
          {/* En-tête client avec photo */}
          <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg">
            {client.photo ? (
              <img
                src={client.photo}
                alt={`${client.prenom} ${client.nom}`}
                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white">
                <User size={32} className="text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{client.prenom} {client.nom}</h3>
              <div className="space-y-1 text-blue-100">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span>{client.telephone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center">
                    <Mail size={16} className="mr-2" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.adresse && (
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span>{client.adresse}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowEditClient(true)}
              variant="secondary"
              size="sm"
            >
              <Edit size={16} className="mr-1" />
              Modifier
            </Button>
          </div>

          {/* Statistiques client */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-600">{commandes.length}</div>
              <div className="text-xs text-green-700">Commandes</div>
            </Card>
            <Card className="text-center bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{commandesLivrees}</div>
              <div className="text-xs text-blue-700">Livrées</div>
            </Card>
            <Card className="text-center bg-purple-50 border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{mesures.length}</div>
              <div className="text-xs text-purple-700">Mesures</div>
            </Card>
            <Card className="text-center bg-orange-50 border-orange-200">
              <div className="text-lg font-bold text-orange-600">{totalDepense.toLocaleString()} F</div>
              <div className="text-xs text-orange-700">Total dépensé</div>
            </Card>
          </div>

          {/* Mesures */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <Ruler className="mr-2" size={20} />
                Mesures ({mesures.length})
              </h4>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => {setEditingMesure(null); setShowMesuresModal(true);}}
                >
                  <Plus size={16} className="mr-1" /> 
                  Nouvelle mesure
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mesures.map(mesure => (
                  <div 
                    key={mesure.id} 
                    onClick={() => handleViewMesures(mesure)}
                    className="flex justify-between items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-blue-800">
                        Version {mesure.version} - {new Date(mesure.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                      <p className="text-xs text-blue-600">
                        {Object.keys(mesure.mesures).length} mesures enregistrées
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMesure(mesure);
                          setShowMesuresModal(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Eye size={16} className="text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">
                Aucune mesure enregistrée
              </p>
            )}
          </Card>

          {/* Historique Commandes */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Historique Commandes ({commandes.length})
            </h4>
            {commandes.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {commandes.slice(0, 10).map(commande => (
                  <div key={commande.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{commande.modele}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(commande.statut)}`}>
                          {commande.statut}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(commande.dateCommande).toLocaleDateString('fr-FR')} 
                        {commande.reference && ` - Réf: ${commande.reference}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{commande.montantTotal.toLocaleString()} F</span>
                      {commande.reste > 0 && (
                        <p className="text-xs text-red-600">Reste: {commande.reste.toLocaleString()} F</p>
                      )}
                    </div>
                  </div>
                ))}
                {commandes.length > 10 && (
                  <p className="text-center text-sm text-gray-500 py-2">
                    ... et {commandes.length - 10} autres commandes
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">
                Aucune commande
              </p>
            )}
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {client.notes}
              </p>
            </Card>
          )}
        </div>
      </Modal>

      <MesuresModal 
        client={client} 
        isOpen={showMesuresModal} 
        mesure={editingMesure} 
        onClose={() => {setShowMesuresModal(false); setEditingMesure(null);}} 
        onSuccess={handleSaveMesure} 
      />

      {selectedMesure && (
        <MesuresViewer 
          isOpen={showMesuresViewer} 
          onClose={() => setShowMesuresViewer(false)} 
          client={client} 
          mesure={selectedMesure} 
        />
      )}

      <EditClientModal
        client={client}
        isOpen={showEditClient}
        onClose={() => setShowEditClient(false)}
        onSuccess={() => {
          onUpdate();
          setShowEditClient(false);
        }}
      />
    </>
  );
};

// Modal nouveau client
const NewClientModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void 
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    photo: '',
    notes: ''
  });

  const handleSave = async () => {
    if (!formData.prenom || !formData.nom || !formData.telephone) {
      return alert('Veuillez remplir les champs obligatoires');
    }
    
    try {
      await db.clients.add({
        ...formData,
        id: Date.now().toString(),
        dateCreation: new Date()
      });
      
      onSuccess();
      onClose();
      setFormData({
        prenom: '',
        nom: '',
        telephone: '',
        email: '',
        adresse: '',
        photo: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur création client:', error);
      alert('Erreur lors de la création du client');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Client" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Prénom" 
            value={formData.prenom} 
            onChange={(value) => setFormData(prev => ({ ...prev, prenom: value as string }))} 
            required 
          />
          <FormField 
            label="Nom" 
            value={formData.nom} 
            onChange={(value) => setFormData(prev => ({ ...prev, nom: value as string }))} 
            required 
          />
        </div>
        
        <FormField 
          label="Téléphone" 
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

        <ImageUpload
          label="Photo du client"
          value={formData.photo}
          onChange={(photo) => setFormData(prev => ({ ...prev, photo: photo || '' }))}
        />
        
        <FormField 
          label="Notes" 
          type="textarea"
          value={formData.notes} 
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))} 
          placeholder="Notes particulières sur le client..."
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </div>
    </Modal>
  );
};

// Modal édition client
const EditClientModal: React.FC<{
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ client, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    prenom: client.prenom,
    nom: client.nom,
    telephone: client.telephone,
    email: client.email || '',
    adresse: client.adresse || '',
    photo: client.photo || '',
    notes: client.notes || ''
  });

  useEffect(() => {
    setFormData({
      prenom: client.prenom,
      nom: client.nom,
      telephone: client.telephone,
      email: client.email || '',
      adresse: client.adresse || '',
      photo: client.photo || '',
      notes: client.notes || ''
    });
  }, [client]);

  const handleSave = async () => {
    if (!formData.prenom || !formData.nom || !formData.telephone) {
      return alert('Veuillez remplir les champs obligatoires');
    }
    
    try {
      await db.clients.update(client.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Erreur modification client:', error);
      alert('Erreur lors de la modification du client');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier Client" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Prénom" 
            value={formData.prenom} 
            onChange={(value) => setFormData(prev => ({ ...prev, prenom: value as string }))} 
            required 
          />
          <FormField 
            label="Nom" 
            value={formData.nom} 
            onChange={(value) => setFormData(prev => ({ ...prev, nom: value as string }))} 
            required 
          />
        </div>
        
        <FormField 
          label="Téléphone" 
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

        <ImageUpload
          label="Photo du client"
          value={formData.photo}
          onChange={(photo) => setFormData(prev => ({ ...prev, photo: photo || '' }))}
        />
        
        <FormField 
          label="Notes" 
          type="textarea"
          value={formData.notes} 
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))} 
          placeholder="Notes particulières sur le client..."
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      </div>
    </Modal>
  );
};

// Modal mesures complète
const MesuresModal: React.FC<{ 
  client: Client; 
  isOpen: boolean; 
  mesure: Mesure | null; 
  onClose: () => void; 
  onSuccess: () => void 
}> = ({ client, isOpen, mesure, onClose, onSuccess }) => {
  const [mesureTypes, setMesureTypes] = useState<MesureType[]>([]);
  const [mesuresData, setMesuresData] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState('');
  const [showAddMesureType, setShowAddMesureType] = useState(false);
  const [newMesureTypeName, setNewMesureTypeName] = useState('');

  useEffect(() => {
    loadMesureTypes();
    if (mesure) {
      setMesuresData(mesure.mesures);
      setNotes(mesure.notes || '');
    } else {
      setMesuresData({});
      setNotes('');
    }
  }, [mesure, isOpen]);

  const loadMesureTypes = async () => {
    try {
      const types = await db.mesureTypes.orderBy('ordre').toArray();
      setMesureTypes(types);
    } catch (error) {
      console.error('Erreur chargement types mesures:', error);
    }
  };

  const handleAddMesureType = async () => {
    if (!newMesureTypeName.trim()) return;
    
    try {
      const maxOrdre = Math.max(...mesureTypes.map(t => t.ordre), 0);
      await db.mesureTypes.add({
        id: Date.now().toString(),
        nom: newMesureTypeName.trim(),
        isDefault: false,
        ordre: maxOrdre + 1
      });
      
      setNewMesureTypeName('');
      setShowAddMesureType(false);
      loadMesureTypes();
    } catch (error) {
      console.error('Erreur ajout type mesure:', error);
      alert('Erreur lors de l\'ajout du type de mesure');
    }
  };

  const handleSave = async () => {
    const mesuresWithValues = Object.fromEntries(
      Object.entries(mesuresData).filter(([_, value]) => value > 0)
    );

    if (Object.keys(mesuresWithValues).length === 0) {
      return alert('Veuillez saisir au moins une mesure');
    }

    try {
      if (mesure) {
        // Modification d'une mesure existante
        await db.mesures.update(mesure.id, {
          mesures: mesuresWithValues,
          notes,
          dateCreation: new Date() // Nouvelle date pour l'historique
        });
      } else {
        // Nouvelle mesure
        const existingMesures = await db.mesures.where('clientId').equals(client.id).toArray();
        const nextVersion = Math.max(...existingMesures.map(m => m.version), 0) + 1;
        
        await db.mesures.add({
          id: Date.now().toString(),
          clientId: client.id,
          mesures: mesuresWithValues,
          notes,
          dateCreation: new Date(),
          version: nextVersion
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erreur sauvegarde mesures:', error);
      alert('Erreur lors de la sauvegarde des mesures');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mesure ? "Modifier les mesures" : "Nouvelles mesures"} 
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* En-tête client */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">
            Mesures pour {client.prenom} {client.nom}
          </h4>
          <p className="text-sm text-green-600">
            {mesure ? `Modification de la version ${mesure.version}` : 'Nouvelle prise de mesures'}
          </p>
        </div>

        {/* Grille des mesures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mesureTypes.map(type => (
            <div key={type.id} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {type.nom}
                {!type.isDefault && (
                  <span className="ml-1 text-xs text-blue-600">(personnalisé)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={mesuresData[type.nom] || ''}
                  onChange={(e) => setMesuresData(prev => ({
                    ...prev,
                    [type.nom]: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="0"
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">cm</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton ajouter mesure personnalisée */}
        <div className="border-t pt-4">
          {showAddMesureType ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMesureTypeName}
                onChange={(e) => setNewMesureTypeName(e.target.value)}
                placeholder="Nom de la nouvelle mesure"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button onClick={handleAddMesureType} size="sm">
                Ajouter
              </Button>
              <Button 
                onClick={() => {setShowAddMesureType(false); setNewMesureTypeName('');}} 
                variant="secondary" 
                size="sm"
              >
                Annuler
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowAddMesureType(true)} 
              variant="secondary" 
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              Ajouter une mesure personnalisée
            </Button>
          )}
        </div>

        {/* Notes */}
        <FormField
          label="Notes"
          type="textarea"
          value={notes}
          onChange={(value) => setNotes(value as string)}
          placeholder="Notes particulières sur les mesures..."
        />

        {/* Résumé des mesures saisies */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-2">Résumé des mesures saisies</h5>
          <div className="text-sm text-blue-700">
            {Object.entries(mesuresData).filter(([_, value]) => value > 0).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(mesuresData)
                  .filter(([_, value]) => value > 0)
                  .map(([nom, valeur]) => (
                    <div key={nom} className="flex justify-between">
                      <span>{nom}:</span>
                      <span className="font-medium">{valeur} cm</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="italic">Aucune mesure saisie</p>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {mesure ? 'Modifier' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};