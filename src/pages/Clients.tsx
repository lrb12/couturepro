import React from 'react';
import { Modal } from './Modal';
import { Client, Mesure } from '../../types';

export const MesuresViewer: React.FC<{
  client: Client;
  mesure: Mesure;
  isOpen: boolean;
  onClose: () => void;
}> = ({ client, mesure, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Mesures de ${client.prenom} ${client.nom}`}>
      <div className="space-y-2 text-gray-700">
        <p><strong>Poitrine:</strong> {mesure.poitrine}</p>
        <p><strong>Taille:</strong> {mesure.taille}</p>
        <p><strong>Hanches:</strong> {mesure.hanches}</p>
        <p><strong>Date:</strong> {new Date(mesure.dateCreation).toLocaleDateString('fr-FR')}</p>
      </div>
    </Modal>
  );
};
