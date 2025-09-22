import React, { useState } from 'react';
import { Settings as SettingsIcon, Palette, Upload, Download, Trash2, LogOut, Save, Building } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { ColorPicker } from '../components/ui/ColorPicker';
import { ImageUpload } from '../components/ui/ImageUpload';
import { Modal } from '../components/ui/Modal';
import { useSettings } from '../hooks/useSettings';
import { logout } from '../services/auth';
import { db } from '../services/database';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    atelierName: settings?.atelierName || '',
    logo: settings?.logo || '',
    primaryColor: settings?.primaryColor || '#1B7F4D',
    secondaryColor: settings?.secondaryColor || '#3EBE72',
    accentColor: settings?.accentColor || '#0C3A24'
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        atelierName: settings.atelierName,
        logo: settings.logo || '',
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings(formData);
      if (success) {
        alert('Paramètres sauvegardés avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = {
        clients: await db.clients.toArray(),
        mesures: await db.mesures.toArray(),
        commandes: await db.commandes.toArray(),
        paiements: await db.paiements.toArray(),
        retouches: await db.retouches.toArray(),
        settings: await db.settings.toArray(),
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
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.clients || !data.commandes) {
        throw new Error('Format de fichier invalide');
      }
      
      await db.transaction('rw', [db.clients, db.mesures, db.commandes, db.paiements, db.retouches, db.settings], async () => {
        if (data.clients) await db.clients.bulkPut(data.clients);
        if (data.mesures) await db.mesures.bulkPut(data.mesures);
        if (data.commandes) await db.commandes.bulkPut(data.commandes);
        if (data.paiements) await db.paiements.bulkPut(data.paiements);
        if (data.retouches) await db.retouches.bulkPut(data.retouches);
        if (data.settings) await db.settings.bulkPut(data.settings);
      });
      
      alert('Données importées avec succès');
      setShowImportModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'import des données');
    }
    event.target.value = '';
  };

  const handleResetData = async () => {
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
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Paramètres" showLogo={false} />
      
      <main className="p-4 pb-20">
        {/* Profil Atelier */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <Building className="text-green-600 mr-2" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">Profil de l'Atelier</h2>
          </div>
          
          <FormField
            label="Nom de l'atelier"
            value={formData.atelierName}
            onChange={(value) => setFormData(prev => ({ ...prev, atelierName: value as string }))}
            placeholder="Mon Atelier de Couture"
          />
          
          <ImageUpload
            label="Logo de l'atelier"
            value={formData.logo}
            onChange={(logo) => setFormData(prev => ({ ...prev, logo: logo || '' }))}
          />
        </Card>

        {/* Personnalisation des couleurs */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <Palette className="text-green-600 mr-2" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">Couleurs du thème</h2>
          </div>
          
          <ColorPicker
            label="Couleur principale"
            value={formData.primaryColor}
            onChange={(color) => setFormData(prev => ({ ...prev, primaryColor: color }))}
          />
          
          <ColorPicker
            label="Couleur secondaire"
            value={formData.secondaryColor}
            onChange={(color) => setFormData(prev => ({ ...prev, secondaryColor: color }))}
          />
          
          <ColorPicker
            label="Couleur d'accent"
            value={formData.accentColor}
            onChange={(color) => setFormData(prev => ({ ...prev, accentColor: color }))}
          />
        </Card>

        {/* Bouton de sauvegarde */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          fullWidth
          className="mb-6 bg-green-600 hover:bg-green-700"
        >
          <Save size={20} className="mr-2" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </Button>

        {/* Gestion des données */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="text-green-600 mr-2" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">Gestion des données</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => setShowExportModal(true)}
              variant="secondary"
              fullWidth
            >
              <Download size={20} className="mr-2" />
              Exporter les données
            </Button>
            
            <Button
              onClick={() => setShowImportModal(true)}
              variant="secondary"
              fullWidth
            >
              <Upload size={20} className="mr-2" />
              Importer les données
            </Button>
            
            <Button
              onClick={() => setShowResetModal(true)}
              variant="danger"
              fullWidth
            >
              <Trash2 size={20} className="mr-2" />
              Réinitialiser l'application
            </Button>
          </div>
        </Card>

        {/* Déconnexion */}
        <Button
          onClick={handleLogout}
          variant="secondary"
          fullWidth
          className="mb-6"
        >
          <LogOut size={20} className="mr-2" />
          Se déconnecter
        </Button>

        {/* Informations */}
        <Card className="bg-gray-800 text-white">
          <div className="text-center p-4">
            <h4 className="font-semibold mb-1">COUTUPRO v2.0</h4>
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
        title="Exporter les données"
      >
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Download className="text-blue-600 mr-3" size={24} />
            <div>
              <h4 className="font-medium text-blue-800">Export complet</h4>
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
              disabled={isExporting}
              fullWidth
            >
              {isExporting ? 'Export...' : 'Télécharger'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importer les données"
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
              fullWidth
            >
              Confirmer la suppression
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};