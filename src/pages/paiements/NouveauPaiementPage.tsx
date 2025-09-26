import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, CreditCard, User, Package, Calendar, Receipt } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { db } from '../../services/database';
import { Commande, Paiement, Client } from '../../types';

export const NouveauPaiementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const commandeId = searchParams.get('commandeId');
  const navigate = useNavigate();

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    commandeId: commandeId || '',
    montant: 0,
    methode: 'Espèces' as const,
    reference: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.commandeId) {
      const commande = commandes.find(c => c.id === formData.commandeId);
      if (commande) {
        setSelectedCommande(commande);
        const client = clients.find(c => c.id === commande.clientId);
        setSelectedClient(client || null);
      }
    } else {
      setSelectedCommande(null);
      setSelectedClient(null);
    }
  }, [formData.commandeId, commandes, clients]);

  const loadData = async () => {
    try {
      const [commandesData, clientsData] = await Promise.all([
        db.commandes.filter(c => c.reste > 0).toArray(),
        db.clients.toArray()
      ]);
      setCommandes(commandesData);
      setClients(clientsData);

      // Si un commandeId est fourni, le sélectionner
      if (commandeId) {
        const commande = commandesData.find(c => c.id === commandeId);
        if (commande) {
          setFormData(prev => ({ ...prev, commandeId, montant: commande.reste }));
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommande || !formData.montant || formData.montant <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.montant > selectedCommande.reste) {
      alert('Le montant ne peut pas dépasser le reste à payer');
      return;
    }

    setIsLoading(true);
    try {
      const type = formData.montant === selectedCommande.reste ? 'Solde' : 'Acompte';

      // Ajouter le paiement
      await db.paiements.add({
        id: Date.now().toString(),
        commandeId: selectedCommande.id,
        montant: formData.montant,
        type,
        datePaiement: new Date(),
        methode: formData.methode,
        reference: formData.reference,
        notes: formData.notes
      } as Paiement);

      // Mettre à jour la commande
      const nouveauAcompte = selectedCommande.acompte + formData.montant;
      const nouveauReste = selectedCommande.montantTotal - nouveauAcompte;
      const nouveauStatutPaiement = nouveauReste <= 0 ? 'Payé' : 'Acompte';

      await db.commandes.update(selectedCommande.id, {
        acompte: nouveauAcompte,
        reste: nouveauReste,
        statutPaiement: nouveauStatutPaiement
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      alert('Erreur lors de l\'enregistrement du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/commandes');
  };

  const commandesAvecClients = commandes.map(commande => {
    const client = clients.find(c => c.id === commande.clientId);
    return { ...commande, client };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nouveau Paiement" showLogo={false} />
      
      <main className="p-4 pb-20">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/commandes')}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft size={16} className="mr-1" />
            Retour aux commandes
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Sélection de la commande */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="mr-2" size={20} />
              Sélectionner une commande
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commande à payer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.commandeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, commandeId: e.target.value, montant: 0 }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Sélectionner une commande</option>
                  {commandesAvecClients.map(commande => (
                    <option key={commande.id} value={commande.id}>
                      {commande.modele} - {commande.client?.prenom} {commande.client?.nom} - Reste: {commande.reste.toLocaleString()} F
                    </option>
                  ))}
                </select>
              </div>

              {/* Détails de la commande sélectionnée */}
              {selectedCommande && selectedClient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Détails de la commande</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center mb-2">
                        <User size={16} className="mr-2 text-blue-600" />
                        <span className="font-medium">Client:</span>
                      </div>
                      <p className="text-blue-700 ml-6">
                        {selectedClient.prenom} {selectedClient.nom}
                      </p>
                      <p className="text-blue-600 ml-6 text-xs">
                        {selectedClient.telephone}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <Package size={16} className="mr-2 text-blue-600" />
                        <span className="font-medium">Modèle:</span>
                      </div>
                      <p className="text-blue-700 ml-6">{selectedCommande.modele}</p>
                      {selectedCommande.reference && (
                        <p className="text-blue-600 ml-6 text-xs">
                          Réf: {selectedCommande.reference}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-blue-600">Montant total</p>
                        <p className="font-bold text-blue-800">
                          {selectedCommande.montantTotal.toLocaleString()} F
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Déjà payé</p>
                        <p className="font-bold text-green-600">
                          {selectedCommande.acompte.toLocaleString()} F
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Reste à payer</p>
                        <p className="font-bold text-red-600">
                          {selectedCommande.reste.toLocaleString()} F
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Formulaire de paiement */}
          {selectedCommande && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="mr-2" size={20} />
                Détails du paiement
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Montant à payer (FCFA)"
                    type="number"
                    value={formData.montant}
                    onChange={(value) => setFormData(prev => ({ ...prev, montant: Number(value) }))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Méthode de paiement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.methode}
                      onChange={(e) => setFormData(prev => ({ ...prev, methode: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="Espèces">Espèces</option>
                      <option value="Carte">Carte bancaire</option>
                      <option value="Virement">Virement</option>
                      <option value="Mobile">Paiement mobile</option>
                      <option value="Chèque">Chèque</option>
                    </select>
                  </div>
                </div>

                <FormField
                  label="Référence (optionnel)"
                  value={formData.reference}
                  onChange={(value) => setFormData(prev => ({ ...prev, reference: value as string }))}
                  placeholder="Numéro de transaction, chèque..."
                />

                <FormField
                  label="Notes (optionnel)"
                  type="textarea"
                  value={formData.notes}
                  onChange={(value) => setFormData(prev => ({ ...prev, notes: value as string }))}
                  placeholder="Notes sur ce paiement..."
                />

                {/* Boutons de paiement rapide */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">Paiements rapides:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, montant: selectedCommande.reste }))}
                    >
                      Solde complet ({selectedCommande.reste.toLocaleString()} F)
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, montant: Math.round(selectedCommande.reste / 2) }))}
                    >
                      Moitié ({Math.round(selectedCommande.reste / 2).toLocaleString()} F)
                    </Button>
                    {selectedCommande.reste >= 10000 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, montant: 10000 }))}
                      >
                        10 000 F
                      </Button>
                    )}
                  </div>
                </div>

                {/* Résumé */}
                {formData.montant > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Résumé du paiement</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Montant à payer: <span className="font-bold">{formData.montant.toLocaleString()} F</span></p>
                      <p>Nouveau reste: <span className="font-bold">{(selectedCommande.reste - formData.montant).toLocaleString()} F</span></p>
                      <p>Type: <span className="font-bold">
                        {formData.montant === selectedCommande.reste ? 'Solde final' : 'Acompte partiel'}
                      </span></p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
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
                    disabled={isLoading || !formData.montant || formData.montant <= 0 || formData.montant > selectedCommande.reste}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard size={16} className="mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer le paiement'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Liste des commandes impayées */}
          {!selectedCommande && commandes.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Commandes en attente de paiement
              </h3>
              <div className="space-y-3">
                {commandesAvecClients.slice(0, 5).map(commande => (
                  <div
                    key={commande.id}
                    onClick={() => setFormData(prev => ({ ...prev, commandeId: commande.id }))}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{commande.modele}</p>
                      <p className="text-sm text-gray-600">
                        {commande.client?.prenom} {commande.client?.nom}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {commande.reste.toLocaleString()} F
                      </p>
                      <p className="text-xs text-gray-500">à payer</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Modal de succès */}
      <Modal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Paiement enregistré"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Receipt className="text-green-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Paiement enregistré avec succès !</h3>
            <p className="text-gray-600 mt-2">
              Le paiement de {formData.montant.toLocaleString()} F a été enregistré.
            </p>
          </div>
          <Button onClick={handleSuccessClose} fullWidth>
            Retour aux commandes
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};