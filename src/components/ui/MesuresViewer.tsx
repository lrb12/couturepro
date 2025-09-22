import React from 'react';
import { Ruler, User, Calendar, FileText } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
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

  const mesuresData = [
    { label: 'Dos', value: mesure.dos, unit: 'cm' },
    { label: 'Longueur manche', value: mesure.longueurManche, unit: 'cm' },
    { label: 'Tour de manche', value: mesure.tourManche, unit: 'cm' },
    { label: 'Longueur robe', value: mesure.longueurRobe, unit: 'cm' },
    { label: 'Jupe', value: mesure.jupe, unit: 'cm' },
    { label: 'Pantalon', value: mesure.pantalon, unit: 'cm' },
    { label: 'Taille', value: mesure.taille, unit: 'cm' },
    { label: 'Poitrine', value: mesure.poitrine, unit: 'cm' },
    { label: 'Sous-sein', value: mesure.sousSein, unit: 'cm' },
    { label: 'Encolure', value: mesure.encolure, unit: 'cm' },
    { label: 'Carrure', value: mesure.carrure, unit: 'cm' },
    { label: 'Hanches', value: mesure.hanches, unit: 'cm' },
    { label: 'Genoux', value: mesure.genoux, unit: 'cm' },
    { label: 'Ceinture', value: mesure.ceinture, unit: 'cm' }
  ].filter(item => item.value > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fiche de Mesures"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* En-tête client */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4">
          <div className="flex items-center mb-2">
            <User className="mr-2" size={20} />
            <h3 className="text-lg font-semibold">
              {client.prenom} {client.nom}
            </h3>
          </div>
          <div className="flex items-center text-green-100">
            <Calendar className="mr-2" size={16} />
            <span className="text-sm">
              Mesures prises le {mesure.dateCreation.toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Grille des mesures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mesuresData.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
            >
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <span className="text-lg font-bold text-green-600">
                {item.value} {item.unit}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {mesure.notes && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <FileText className="mr-2" size={16} />
              Notes
            </h4>
            <p className="text-blue-700 text-sm">{mesure.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
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
            fullWidth
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};