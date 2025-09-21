import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { authenticateWithCode, isAdminCode } from '../services/auth';

export const LoginPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isAdminCode(code)) {
        navigate('/admin-secret');
        return;
      }

      const success = await authenticateWithCode(code);
      if (success) {
        navigate('/');
      } else {
        setError(isRegister ? 'Code invalide ou déjà utilisé' : 'Code d\'accès invalide');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">COUTUPRO</h1>
          <p className="text-gray-600 mt-2">
            {isRegister ? 'Inscription avec votre code' : 'Connexion à votre espace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Code d'accès"
            value={code}
            onChange={setCode}
            placeholder="Entrez votre code"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={isLoading || !code.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <div className="flex items-center justify-center">
              {isRegister ? <UserPlus size={20} className="mr-2" /> : <LogIn size={20} className="mr-2" />}
              {isLoading ? 'Vérification...' : (isRegister ? 'S\'inscrire' : 'Se connecter')}
            </div>
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            {isRegister ? 'Déjà inscrit ? Se connecter' : 'Premier accès ? S\'inscrire'}
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Application développée par Rénato TCHOBO</p>
        </div>
      </div>
    </div>
  );
};