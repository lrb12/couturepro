import React, { useState } from 'react';
import { User, Download, Upload, Trash2, LogOut, Settings, Archive, RotateCcw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { logout } from '../services/auth';
import { db } from '../services/database';

export const ProfilePage: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const data = {
        clients: await db.clients.toArray(),
        mesures: await db.mesures.toArray(),
        commandes: await db.commandes.toArray(),
        paiements: await db.paiements.toArray(),
        retouches: await db.retouches.toArray(),
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `coutupro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validation basique
      if (!data.clients || !data.commandes) {
        throw new Error('Format de fichier invalide');
      }
      
      // Import avec remplacement
      await db.transaction('rw', [db.clients, db.mesures, db.commandes, db.paiements, db.retouches], async () => {
        if (data.clients) await db.clients.bulkPut(data.clients);
        if (data.mesures) await db.mesures.bulkPut(data.mesures);
        if (data.commandes) await db.commandes.bulkPut(data.commandes);
        if (data.paiements) await db.paiements.bulkPut(data.paiements);
        if (data.retouches) await db.retouches.bulkPut(data.retouches);
      });
      
      alert('Données importées avec succès');
      setShowImportModal(false);
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'import des données');
    } finally {
      setIsLoading(false);
      // Reset le input
      event.target.value = '';
    }
  };

  const handleResetData = async () => {
    setIsLoading(true);
    try {
      await db.transaction('rw', [db.clients, db.mesures, db.commandes, db.paiements, db.retouches, db.alertes], async () => {
        await db.clients.clear();
        await db.mesures.clear();
        await db.commandes.clear();
        await db.paiements.clear();
        await db.retouches.clear();
        await db.alertes.clear();
      });
      
      alert('Toutes les données ont été supprimées');
      setShowResetModal(false);
    } catch (error) {
      console.error('Erreur reset:', error);
      alert('Erreur lors de la suppression des données');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      icon: Download,
      title: 'Sauvegarder les données',
      description: 'Exporter toutes vos données en JSON',
      action: () => setShowExportModal(true),
      color: 'text-green-600'
    },
    {
      icon: Upload,
      title: 'Restaurer les données',
      description: 'Importer des données depuis un fichier JSON',
      action: () => setShowImportModal(true),
      color: 'text-blue-600'
    },
    {
      icon: Trash2,
      title: 'Réinitialiser l\'application',
      description: 'Supprimer toutes les données (irréversible)',
      action: () => setShowResetModal(true),
      color: 'text-red-600'
    },
    {
      icon: LogOut,
      title: 'Se déconnecter',
      description: 'Quitter votre session actuelle',
      action: handleLogout,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profil" showLogo={false} />
      
      <main className="p-4 pb-20">
        {/* En-tête profil */}
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center p-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Utilisateur COUTUPRO</h2>
              <p className="text-green-100">Session active</p>
            </div>
          </div>
        </Card>

        {/* Informations application */}
        <Card className="mb-6">
          <div className="flex items-center mb-3">
            <Settings className="text-gray-600 mr-2" size={20} />
            <h3 className="font-semibold text-gray-800">Informations</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium">PWA</span>
            </div>
            <div className="flex justify-between">
              <span>Base de données:</span>
              <span className="font-medium">IndexedDB</span>
            </div>
          </div>
        </Card>

        {/* Menu actions */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Card key={index} onClick={item.action} className="hover:shadow-md cursor-pointer">
              <div className="flex items-center p-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                  item.color === 'text-red-600' ? 'bg-red-50' :
                  item.color === 'text-green-600' ? 'bg-green-50' :
                  item.color === 'text-blue-600' ? 'bg-blue-50' :
                  'bg-gray-50'
                }`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Crédit développeur */}
        <Card className="mt-6 bg-gray-800 text-white">
          <div className="text-center p-4">
            <h4 className="font-semibold mb-1">COUTUPRO</h4>
            <p className="text-sm text-gray-300">
              Application développée avec ❤️ par{' '}
              <span className="font-semibold text-green-400">Rénato TCHOBO</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © 2024 - Tous droits réservés
            </p>
          </div>
        </Card>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Sauvegarder les données"
      >
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Archive className="text-blue-600 mr-3" size={24} />
            <div>
              <h4 className="font-medium text-blue-800">Export des données</h4>
              <p className="text-sm text-blue-600">
                Toutes vos données seront exportées dans un fichier JSON
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              onClick={handleExportData}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Export...' : 'Télécharger'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Restaurer les données"
      >
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-orange-50 rounded-lg">
            <Upload className="text-orange-600 mr-3" size={24} />
            <div>
              <h4 className="font-medium text-orange-800">Import des données</h4>
              <p className="text-sm text-orange-600">
                Les données existantes seront remplacées
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un fichier de sauvegarde
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(false)}
            fullWidth
          >
            Annuler
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Réinitialiser l'application"
      >
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-red-50 rounded-lg">
            <Trash2 className="text-red-600 mr-3" size={24} />
            <div>
              <h4 className="font-medium text-red-800">Attention !</h4>
              <p className="text-sm text-red-600">
                Cette action supprimera définitivement toutes vos données
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              Seront supprimés :
            </p>
            <ul className="text-sm text-gray-600 mt-1 ml-4">
              <li>• Tous les clients</li>
              <li>• Toutes les mesures</li>
              <li>• Toutes les commandes</li>
              <li>• Tous les paiements</li>
              <li>• Toutes les retouches</li>
              <li>• Toutes les alertes</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleResetData}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Suppression...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};