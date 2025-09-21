// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Plus, Trash2, Users, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { db } from '../services/database';

interface AccessCode {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date;
  usedBy?: string;
}

// Code administrateur
const MASTER_CODE = 'ADMIN2024';

// Générer un code aléatoire 8 caractères
const generateRandomCodeString = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Supprimer tous les anciens codes DEMO2024
const cleanupOldDemoCodes = async () => {
  try {
    const demoCodes = await db.accessCodes.where('code').equals('DEMO2024').toArray();
    for (const c of demoCodes) {
      await db.accessCodes.delete(c.id);
    }
  } catch (err) {
    console.error('Erreur nettoyage anciens codes DEMO2024', err);
  }
};

// Ajouter un nouveau code
const createAccessCode = async (code: string): Promise<boolean> => {
  try {
    const existing = await db.accessCodes.where('code').equals(code).first();
    if (existing) return false;

    await db.accessCodes.add({
      id: Date.now().toString(),
      code,
      isUsed: false,
      createdAt: new Date()
    });

    return true;
  } catch {
    return false;
  }
};

// Récupérer tous les codes
const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  return await db.accessCodes.orderBy('createdAt').reverse().toArray();
};

export const AdminPage: React.FC = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [showNewCodeModal, setShowNewCodeModal] = useState(false);
  const navigate = useNavigate();

  const loadCodes = async () => {
    await cleanupOldDemoCodes(); // Nettoyer DEMO2024
    const allCodes = await getAllAccessCodes();
    setCodes(allCodes);
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
        <div className="mb-6">
          <Button onClick={() => navigate('/')} variant="secondary" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Retour au dashboard
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

        {/* Bouton création code */}
        <div className="mb-6">
          <Button onClick={() => setShowNewCodeModal(true)} fullWidth className="bg-green-600 hover:bg-green-700">
            <Plus size={20} className="mr-2" /> Créer un nouveau code
          </Button>
        </div>

        {/* Liste des codes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Key className="mr-2" size={20} /> Codes d'accès ({codes.length})
          </h3>
          {codes.map(code => (
            <Card key={code.id} className="hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-mono font-semibold text-lg mr-3">{code.code}</span>
                    {code.isUsed ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        <XCircle size={12} className="mr-1" /> Utilisé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        <CheckCircle size={12} className="mr-1" /> Disponible
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Créé le: {new Date(code.createdAt).toLocaleDateString('fr-FR')}</p>
                    {code.isUsed && code.usedAt && <p>Utilisé le: {new Date(code.usedAt).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
                <div className="flex items-center">{code.isUsed ? <Users className="text-red-600" size={20} /> : <Key className="text-green-600" size={20} />}</div>
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
      </main>

      {/* Modal création code */}
      {showNewCodeModal && <NewCodeModal isOpen={showNewCodeModal} onClose={() => setShowNewCodeModal(false)} onSuccess={loadCodes} />}
    </div>
  );
};

// Modal création code
const NewCodeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRandomCode = () => setCode(generateRandomCodeString());

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
    } catch {
      setError('Erreur lors de la création du code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un nouveau code d'accès">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Code d'accès" value={code} onChange={setCode} placeholder="Entrez ou générez un code" required />
        <Button type="button" variant="secondary" size="sm" onClick={generateRandomCode}>
          Générer aléatoirement
        </Button>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}

        <div className="flex space-x-3">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Annuler
          </Button>
          <Button type="submit" fullWidth disabled={isLoading || !code.trim()}>
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
