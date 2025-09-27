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

  // Cartes Actions Rapides avec couleurs adaptées au fond bleu
  const ctaCards = [
    {
      title: 'Nouveau Client',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
      onClick: () => navigate('/clients'),
    },
    {
      title: 'Nouvelle Commande',
      icon: Package,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg',
      onClick: () => navigate('/commandes'),
    },
    {
      title: 'Nouveau Paiement',
      icon: CreditCard,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg',
      onClick: () => navigate('/paiements/nouveau'),
    },
    {
      title: 'Actions Rapides',
      icon: Plus,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg',
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
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Commandes Actives',
      value: stats.commandesEnCours ?? 0,
      icon: Package,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Revenus Totaux',
      value: `${stats.totalRevenus?.toLocaleString() ?? 0} F`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Alertes',
      value: stats.alertesCount ?? 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
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
      borderColor: 'border-l-red-500',
    },
    {
      title: 'Paiements Dus',
      value: stats.paiementsEnAttente ?? 0,
      icon: Wallet,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-l-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Message de bienvenue */}
        <section className="mb-6">
          <div className="card-on-blue rounded-2xl shadow-xl p-6 text-center bg-gradient-to-r from-white/90 to-white/95">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue sur COUTUPRO</h3>
            <p className="text-gray-600">
              Gérez vos clients, commandes et paiements en un seul endroit.
            </p>
          </div>
        </section>

        {/* Statistiques principales */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Statistiques</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <div key={index} className="card-on-blue rounded-xl shadow-lg p-6 text-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Actions rapides */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {ctaCards.map((card, index) => (
              <div
                key={index}
                onClick={card.onClick}
                className={`cursor-pointer rounded-xl ${card.color} flex flex-col items-center justify-center p-6 transform hover:scale-105 transition-all duration-200`}
              >
                <card.icon size={32} className="mb-3" />
                <span className="font-semibold text-center">{card.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Alertes / activité */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Alertes & Activité</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activityCards.map((item, index) => (
              <div
                key={index}
                className={`card-on-blue ${item.borderColor} border-l-4 shadow-lg flex items-center p-6 rounded-xl`}
              >
                <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                  <item.icon size={22} className={item.color} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">{item.value}</h4>
                  <p className="text-sm text-gray-600">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};