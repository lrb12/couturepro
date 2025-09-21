import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Plus, Trash2, Users, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { createAccessCode, getAllAccessCodes } from '../services/auth';
import { AccessCode } from '../types';

export const AdminPage: React.FC = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [showNewCodeModal, setShowNewCodeModal] = useState(false);
  const navigate = useNavigate();

  const loadCodes = async () => {
    try {
      const allCodes = await getAllAccessCodes();
      setCodes(allCodes);
    } catch (error) {
      console.error('Erreur chargement codes:', error);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const stats = {
    total: codes.length,
    used: codes.filter(c => c.isUsed).length,
    available: codes.filter(c => !c.isUsed).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Administration" showLogo={false} />
      
      <main className="p-4">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft size={16} className="mr-1" />
            Retour au dashboard
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total codes</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.used}</div>
            <div className="text-sm text-gray-600">Utilisés</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Button
            onClick={() => setShowNewCodeModal(true)}
            fullWidth
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus size={20} className="mr-2" />
            Créer un nouveau code
          </Button>
        </div>

        {/* Liste des codes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Key className="mr-2" size={20} />
            Codes d'accès ({codes.length})
          </h3>
          
          {codes.map(code => (
            <Card key={code.id} className="hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-mono font-semibold text-lg mr-3">
                      {code.code}
                    </span>
                    {code.isUsed ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        <XCircle size={12} className="mr-1" />
                        Utilisé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        <CheckCircle size={12} className="mr-1" />
                        Disponible
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Créé le: {code.createdAt.toLocaleDateString('fr-FR')}</p>
                    {code.isUsed && code.usedAt && (
                      <p>Utilisé le: {code.usedAt.toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  {code.isUsed ? (
                    <Users className="text-red-600" size={20} />
                  ) : (
                    <Key className="text-green-600" size={20} />
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          {codes.length === 0 && (
            <Card className="text-center py-8">
              <Key className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Aucun code d'accès créé</p>
            </Card>
          )}
        </div>

        {/* Informations */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Informations</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>• Chaque code ne peut être utilisé qu'une seule fois</p>
            <p>• Une fois utilisé, le code est lié au navigateur de l'utilisateur</p>
            <p>• L'utilisateur n'aura plus besoin de saisir le code à chaque connexion</p>
            <p>• Cette page d'administration n'est pas accessible aux utilisateurs normaux</p>
          </div>
        </Card>
      </main>

      <NewCodeModal
        isOpen={showNewCodeModal}
        onClose={() => setShowNewCodeModal(false)}
        onSuccess={loadCodes}
      />
    </div>
  );
};

// Modal nouveau code
const NewCodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await createAccessCode(code);
      if (success) {
        onSuccess();
        onClose();
        setCode('');
      } else {
        setError('Ce code existe déjà');
      }
    } catch (error) {
      setError('Erreur lors de la création du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un nouveau code d'accès"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <FormField
              label="Code d'accès"
              value={code}
              onChange={setCode}
              placeholder="Entrez ou générez un code"
              required
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={generateRandomCode}
              className="mt-2"
            >
              Générer aléatoirement
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              <strong>Conseils :</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-1 ml-4">
              <li>• Utilisez 6-12 caractères</li>
              <li>• Mélangez lettres et chiffres</li>
              <li>• Évitez les espaces et caractères spéciaux</li>
              <li>• Chaque code est unique et à usage unique</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};