import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { db } from '../../services/database';
import { Commande, Paiement } from '../../types';

export const NouveauPaiementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const commandeId = searchParams.get('commandeId');
  const navigate = useNavigate();

  const [commande, setCommande] = useState<Commande | null>(null);
  const [montant, setMontant] = useState<number>(0);
  const [methode, setMethode] = useState<'Espèces' | 'Carte' | 'Virement' | 'Mobile'>('Espèces');
  const [isLoading, setIsLoading] = useState(false);

  // Charger la commande
  useEffect(() => {
    const loadCommande = async () => {
      if (!commandeId) return;
      const c = await db.commandes.get(commandeId);
      if (c) setCommande(c);
    };
    loadCommande();
  }, [commandeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commande) return;

    if (montant <= 0 || montant > commande.reste) {
      alert('Montant invalide');
      return;
    }

    setIsLoading(true);
    try {
      const type = montant === commande.reste ? 'Solde' : 'Acompte';

      // Ajouter le paiement
      await db.paiements.add({
        id: Date.now().toString(),
        commandeId: commande.id,
        montant,
        type,
        datePaiement: new Date(),
        methode
      } as Paiement);

      // Mettre à jour la commande
      const nouveauAcompte = commande.acompte + montant;
      const nouveauReste = commande.montantTotal - nouveauAcompte;
      const nouveauStatutPaiement = nouveauReste <= 0 ? 'Payé' : 'Acompte';

      await db.commandes.update(commande.id, {
        acompte: nouveauAcompte,
        reste: nouveauReste,
        statutPaiement: nouveauStatutPaiement
      });

      alert('Paiement enregistré avec succès !');
      navigate('/commandes'); // Retour à la liste des commandes
    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      alert('Erreur lors de l\'enregistrement du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!commande) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Chargement de la commande...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex justify-center items-start">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Nouveau Paiement - {commande.modele}</h1>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p>
            Montant total: <span className="font-semibold">{commande.montantTotal.toLocaleString()} F</span>
          </p>
          <p>
            Acompte versé: <span className="font-semibold text-green-600">{commande.acompte.toLocaleString()} F</span>
          </p>
          <p>
            Reste à payer: <span className="font-semibold text-red-600">{commande.reste.toLocaleString()} F</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Montant"
            type="number"
            value={montant}
            onChange={(value) => setMontant(Number(value))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de paiement
            </label>
            <select
              value={methode}
              onChange={(e) => setMethode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="Espèces">Espèces</option>
              <option value="Carte">Carte</option>
              <option value="Virement">Virement</option>
              <option value="Mobile">Paiement Mobile</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/commandes')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={isLoading || montant <= 0 || montant > commande.reste}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
