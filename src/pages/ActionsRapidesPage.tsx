import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Package, 
  CreditCard, 
  Calculator, 
  FileText, 
  Search,
  TrendingUp,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ActionsRapidesPage: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Nouveau Client',
      description: 'Ajouter un nouveau client avec ses informations',
      icon: UserPlus,
      color: 'bg-blue-500 text-white',
      action: () => navigate('/clients')
    },
    {
      title: 'Nouvelle Commande',
      description: 'Créer une nouvelle commande pour un client',
      icon: Package,
      color: 'bg-green-500 text-white',
      action: () => navigate('/commandes')
    },
    {
      title: 'Nouveau Paiement',
      description: 'Enregistrer un paiement pour une commande',
      icon: CreditCard,
      color: 'bg-purple-500 text-white',
      action: () => navigate('/paiements/nouveau')
    },
    {
      title: 'Calculatrice',
      description: 'Calculer rapidement des montants',
      icon: Calculator,
      color: 'bg-orange-500 text-white',
      action: () => alert('Calculatrice à implémenter')
    },
    {
      title: 'Recherche Rapide',
      description: 'Rechercher un client ou une commande',
      icon: Search,
      color: 'bg-indigo-500 text-white',
      action: () => alert('Recherche à implémenter')
    },
    {
      title: 'Rapport Mensuel',
      description: 'Générer un rapport des activités du mois',
      icon: TrendingUp,
      color: 'bg-red-500 text-white',
      action: () => alert('Rapport à implémenter')
    },
    {
      title: 'Rappels',
      description: 'Gérer les rappels et notifications',
      icon: Clock,
      color: 'bg-yellow-500 text-black',
      action: () => navigate('/alertes')
    },
    {
      title: 'Factures',
      description: 'Générer et gérer les factures',
      icon: FileText,
      color: 'bg-teal-500 text-white',
      action: () => alert('Gestion factures à implémenter')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Actions Rapides" showLogo={false} />
      
      <main className="p-4 pb-20">
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

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Accès rapide aux fonctionnalités
          </h2>
          <p className="text-gray-600 text-sm">
            Sélectionnez une action pour accéder rapidement aux fonctionnalités principales
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              onClick={action.action}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="text-center p-4">
            <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-green-100">
              Utilisez ces actions rapides pour naviguer efficacement dans l'application
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
