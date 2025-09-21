import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  Plus,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  Wallet,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { useDashboardStats, useAlerts } from '../hooks/useAlerts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useDashboardStats();
  const { unreadCount } = useAlerts();

  // Cartes Actions Rapides avec couleurs fixes
  const ctaCards = [
    {
      title: 'Nouveau Client',
      icon: Users,
      color: 'bg-blue-600 text-white',
      onClick: () => navigate('/clients'),
    },
    {
      title: 'Nouvelle Commande',
      icon: Package,
      color: 'bg-red-500 text-white',
      onClick: () => navigate('/commandes'),
    },
    {
      title: 'Nouveau Paiement',
      icon: CreditCard,
      color: 'bg-green-500 text-white',
      onClick: () => navigate('/paiements/nouveau'),
    },
    {
      title: 'Actions Rapides',
      icon: Plus,
      color: 'bg-yellow-400 text-black',
      onClick: () => navigate('/actions'),
    },
  ];

  // Statistiques principales
  const statsCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients ?? 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Commandes Actives',
      value: stats.commandesEnCours ?? 0,
      icon: Package,
      color: 'text-red-500',
    },
    {
      title: 'Revenus Totaux',
      value: `${stats.totalRevenus?.toLocaleString() ?? 0} F`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Alertes',
      value: stats.alertesCount ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
  ];

  // Alertes / activité
  const activityCards = [
    {
      title: 'En Retard',
      value: stats.commandesEnRetard ?? 0,
      icon: Clock,
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Paiements Dus',
      value: stats.paiementsEnAttente ?? 0,
      icon: Wallet,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Message de bienvenue */}
        <section className="mb-6">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
            <div className="p-5 text-center">
              <h3 className="text-xl font-semibold mb-1">Bienvenue sur COUTUPRO</h3>
              <p className="text-blue-100 text-sm">
                Gérez vos clients, commandes et paiements en un seul endroit.
              </p>
            </div>
          </Card>
        </section>

        {/* Statistiques principales */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="text-center shadow bg-white">
                <stat.icon size={28} className={`${stat.color} mx-auto mb-2`} />
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Actions rapides */}
<section className="mb-8">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h2>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
    {ctaCards.map((card, index) => (
      <div
        key={index}
        onClick={card.onClick}
        className={`cursor-pointer rounded-xl shadow-md flex flex-col items-center justify-center p-4 ${card.color}`}
      >
        <card.icon size={36} className="mb-3" />
        <span className={`font-semibold ${card.color.includes('text-') ? '' : 'text-white'}`}>{card.title}</span>
      </div>
    ))}
  </div>
</section>

        {/* Alertes / activité */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Alertes & Activité</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activityCards.map((item, index) => (
              <Card
                key={index}
                className={`${item.bgColor} border-l-4 ${item.color} shadow flex items-center p-4 rounded-lg`}
              >
                <item.icon size={22} className={`${item.color} mr-4`} />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{item.value}</h4>
                  <p className="text-sm text-gray-600">{item.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
