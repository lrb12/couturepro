import React, { useEffect } from 'react';
import { Bell, AlertTriangle, Clock, DollarSign, Scissors, CheckCircle } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAlerts } from '../hooks/useAlerts';

export const AlertsPage: React.FC = () => {
  const { alerts, unreadCount, markAsRead, markAllAsRead, generateAlerts } = useAlerts();

  useEffect(() => {
    generateAlerts();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'livraison': return Clock;
      case 'paiement': return DollarSign;
      case 'retouche': return Scissors;
      default: return AlertTriangle;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      case 'low': return 'Bas';
      default: return 'Normal';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Alertes" showLogo={false} />
      
      <main className="p-4 pb-20">
        {/* En-tête avec actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="text-green-600 mr-2" size={24} />
            <span className="text-lg font-semibold">
              {unreadCount > 0 ? `${unreadCount} nouvelle(s) alerte(s)` : 'Toutes les alertes'}
            </span>
          </div>
          
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={markAllAsRead}
            >
              <CheckCircle size={16} className="mr-1" />
              Tout lire
            </Button>
          )}
        </div>

        {/* Résumé par priorité */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {['high', 'medium', 'low'].map(priority => {
              const count = alerts.filter(a => a.priority === priority && !a.isRead).length;
              const colors = {
                high: 'text-red-600 bg-red-100',
                medium: 'text-orange-600 bg-orange-100',
                low: 'text-blue-600 bg-blue-100'
              };
              
              return (
                <Card key={priority} className={count > 0 ? colors[priority as keyof typeof colors] : 'opacity-50'}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs">{getPriorityText(priority)}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Liste des alertes */}
        <div className="space-y-3">
          {alerts.map(alert => {
            const IconComponent = getAlertIcon(alert.type);
            
            return (
              <Card
                key={alert.id}
                className={`border-l-4 ${getAlertColor(alert.priority)} ${
                  !alert.isRead ? 'border-2 border-green-200' : 'opacity-75'
                }`}
                onClick={() => !alert.isRead && markAsRead(alert.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <IconComponent size={20} className="text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold ${!alert.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {alert.titre}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          alert.priority === 'high' ? 'bg-red-200 text-red-800' :
                          alert.priority === 'medium' ? 'bg-orange-200 text-orange-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {getPriorityText(alert.priority)}
                        </span>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm ${!alert.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {alert.message}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {alert.dateCreation.toLocaleDateString('fr-FR')} à{' '}
                      {alert.dateCreation.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
          
          {alerts.length === 0 && (
            <Card className="text-center py-12">
              <Bell className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucune alerte
              </h3>
              <p className="text-gray-500">
                Toutes vos activités sont à jour !
              </p>
            </Card>
          )}
        </div>

        {/* Légende */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Types d'alertes</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div className="flex items-center">
              <Clock size={16} className="mr-2" />
              <span>Livraisons proches ou en retard</span>
            </div>
            <div className="flex items-center">
              <DollarSign size={16} className="mr-2" />
              <span>Paiements en attente</span>
            </div>
            <div className="flex items-center">
              <Scissors size={16} className="mr-2" />
              <span>Retouches à effectuer</span>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};