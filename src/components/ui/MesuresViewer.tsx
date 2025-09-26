import React from 'react';
import { Ruler, User, Calendar, FileText, Download } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card } from './Card';
import { Client, Mesure } from '../../types';
import { generateMesuresPDF } from '../../services/pdf';

interface MesuresViewerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  mesure: Mesure;
}

export const MesuresViewer: React.FC<MesuresViewerProps> = ({
  isOpen,
  onClose,
  client,
  mesure
}) => {
  const handleGeneratePDF = async () => {
    await generateMesuresPDF(client, mesure);
  };

  const mesuresEntries = Object.entries(mesure.mesures).filter(([_, value]) => value > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fiche de Mesures Détaillée"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* En-tête client */}
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg">
          {client.photo ? (
            <img
              src={client.photo}
              alt={`${client.prenom} ${client.nom}`}
              className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white">
              <User size={28} className="text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">{client.prenom} {client.nom}</h3>
            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center">
                <Calendar className="mr-2" size={16} />
                <span className="text-sm">
                  Mesures prises le {mesure.dateCreation.toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center">
                <Ruler className="mr-2" size={16} />
                <span className="text-sm">Version {mesure.version}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleGeneratePDF}
            variant="secondary"
            size="sm"
          >
            <Download size={16} className="mr-1" />
            PDF
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{mesuresEntries.length}</div>
            <div className="text-xs text-blue-700">Mesures prises</div>
          </Card>
          <Card className="text-center bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(mesuresEntries.reduce((sum, [_, value]) => sum + value, 0) / mesuresEntries.length) || 0}
            </div>
            <div className="text-xs text-green-700">Moyenne (cm)</div>
          </Card>
          <Card className="text-center bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...mesuresEntries.map(([_, value]) => value), 0)}
            </div>
            <div className="text-xs text-purple-700">Max (cm)</div>
          </Card>
          <Card className="text-center bg-orange-50 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {Math.min(...mesuresEntries.map(([_, value]) => value), 0)}
            </div>
            <div className="text-xs text-orange-700">Min (cm)</div>
          </Card>
        </div>

        {/* Grille des mesures par catégories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mesures du torse */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              Mesures du torse
            </h4>
            <div className="space-y-3">
              {mesuresEntries
                .filter(([nom]) => ['Tour de poitrine', 'Tour de taille', 'Hauteur poitrine', 'Écart poitrine', 'Carrure dos', 'Carrure devant', 'Longueur dos'].includes(nom))
                .map(([nom, valeur]) => (
                  <div key={nom} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium text-blue-800">{nom}</span>
                    <span className="text-lg font-bold text-blue-600">{valeur} cm</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Mesures des bras */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              Mesures des bras
            </h4>
            <div className="space-y-3">
              {mesuresEntries
                .filter(([nom]) => ['Longueur manche', 'Tour de manche', 'Tour de bras', 'Tour de poignet', 'Longueur épaule'].includes(nom))
                .map(([nom, valeur]) => (
                  <div key={nom} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium text-green-800">{nom}</span>
                    <span className="text-lg font-bold text-green-600">{valeur} cm</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Mesures du bas */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              Mesures du bas
            </h4>
            <div className="space-y-3">
              {mesuresEntries
                .filter(([nom]) => ['Tour de hanches', 'Longueur pantalon', 'Entrejambe', 'Tour de cuisse', 'Tour de genou'].includes(nom))
                .map(([nom, valeur]) => (
                  <div key={nom} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="text-sm font-medium text-purple-800">{nom}</span>
                    <span className="text-lg font-bold text-purple-600">{valeur} cm</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Autres mesures */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              Autres mesures
            </h4>
            <div className="space-y-3">
              {mesuresEntries
                .filter(([nom]) => !['Tour de poitrine', 'Tour de taille', 'Hauteur poitrine', 'Écart poitrine', 'Carrure dos', 'Carrure devant', 'Longueur dos', 'Longueur manche', 'Tour de manche', 'Tour de bras', 'Tour de poignet', 'Longueur épaule', 'Tour de hanches', 'Longueur pantalon', 'Entrejambe', 'Tour de cuisse', 'Tour de genou'].includes(nom))
                .map(([nom, valeur]) => (
                  <div key={nom} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium text-orange-800">{nom}</span>
                    <span className="text-lg font-bold text-orange-600">{valeur} cm</span>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Toutes les mesures en tableau */}
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-4">Tableau complet des mesures</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700">Mesure</th>
                  <th className="text-right p-3 font-medium text-gray-700">Valeur</th>
                  <th className="text-center p-3 font-medium text-gray-700">Unité</th>
                </tr>
              </thead>
              <tbody>
                {mesuresEntries.map(([nom, valeur], index) => (
                  <tr key={nom} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-medium">{nom}</td>
                    <td className="p-3 text-right font-bold text-green-600">{valeur}</td>
                    <td className="p-3 text-center text-gray-500">cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Notes */}
        {mesure.notes && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <FileText className="mr-2" size={16} />
              Notes
            </h4>
            <p className="text-blue-700 text-sm leading-relaxed">{mesure.notes}</p>
          </Card>
        )}

        {/* Schéma corporel simple */}
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-4">Schéma de référence</h4>
          <div className="flex justify-center">
            <div className="relative">
              <svg width="200" height="300" viewBox="0 0 200 300" className="border border-gray-200 rounded">
                {/* Silhouette simple */}
                <ellipse cx="100" cy="40" rx="20" ry="25" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
                <rect x="85" y="65" width="30" height="80" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
                <line x1="70" y1="90" x2="130" y2="90" stroke="#6b7280" strokeWidth="2"/>
                <line x1="85" y1="145" x2="75" y2="220" stroke="#6b7280" strokeWidth="2"/>
                <line x1="115" y1="145" x2="125" y2="220" stroke="#6b7280" strokeWidth="2"/>
                <line x1="70" y1="90" x2="60" y2="130" stroke="#6b7280" strokeWidth="2"/>
                <line x1="130" y1="90" x2="140" y2="130" stroke="#6b7280" strokeWidth="2"/>
                
                {/* Annotations */}
                <text x="10" y="50" fontSize="10" fill="#6b7280">Cou</text>
                <text x="10" y="100" fontSize="10" fill="#6b7280">Poitrine</text>
                <text x="10" y="120" fontSize="10" fill="#6b7280">Taille</text>
                <text x="10" y="140" fontSize="10" fill="#6b7280">Hanches</text>
                <text x="150" y="100" fontSize="10" fill="#6b7280">Bras</text>
                <text x="150" y="180" fontSize="10" fill="#6b7280">Jambes</text>
              </svg>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Fiche générée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleGeneratePDF}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileText size={16} className="mr-2" />
              Générer PDF
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};