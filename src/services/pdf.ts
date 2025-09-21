import jsPDF from 'jspdf';
import { Client, Commande, Paiement } from '../types';

export const generateFacturePDF = async (
  client: Client,
  commande: Commande,
  paiements: Paiement[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // En-tête
  doc.setFontSize(20);
  doc.text('COUTUPRO', 20, 30);
  doc.setFontSize(12);
  doc.text('Facture de Couture', 20, 40);
  
  // Informations client
  doc.setFontSize(14);
  doc.text('Client:', 20, 60);
  doc.setFontSize(12);
  doc.text(`${client.prenom} ${client.nom}`, 20, 70);
  doc.text(`Tél: ${client.telephone}`, 20, 80);
  if (client.email) doc.text(`Email: ${client.email}`, 20, 90);
  if (client.adresse) doc.text(`Adresse: ${client.adresse}`, 20, 100);
  
  // Informations commande
  doc.setFontSize(14);
  doc.text('Commande:', pageWidth - 100, 60);
  doc.setFontSize(12);
  doc.text(`Modèle: ${commande.modele}`, pageWidth - 100, 70);
  doc.text(`Date: ${commande.dateCommande.toLocaleDateString('fr-FR')}`, pageWidth - 100, 80);
  doc.text(`Livraison: ${commande.dateLivraison.toLocaleDateString('fr-FR')}`, pageWidth - 100, 90);
  doc.text(`Statut: ${commande.statut}`, pageWidth - 100, 100);
  
  // Détails financiers
  let yPos = 130;
  doc.setFontSize(14);
  doc.text('Détails financiers:', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.text(`Montant total: ${commande.montantTotal.toLocaleString()} FCFA`, 20, yPos);
  yPos += 10;
  doc.text(`Acompte versé: ${commande.acompte.toLocaleString()} FCFA`, 20, yPos);
  yPos += 10;
  doc.text(`Reste à payer: ${commande.reste.toLocaleString()} FCFA`, 20, yPos);
  yPos += 20;
  
  // Historique des paiements
  if (paiements.length > 0) {
    doc.text('Historique des paiements:', 20, yPos);
    yPos += 15;
    
    paiements.forEach(paiement => {
      doc.text(
        `${paiement.datePaiement.toLocaleDateString('fr-FR')} - ${paiement.type}: ${paiement.montant.toLocaleString()} FCFA (${paiement.methode})`,
        25,
        yPos
      );
      yPos += 10;
    });
  }
  
  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text('Développée par Rénato TCHOBO', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text(`Générée le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Télécharger
  doc.save(`Facture-${client.nom}-${commande.modele}.pdf`);
};

export const generateMesuresPDF = async (client: Client, mesures: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('FICHE DE MESURES', 20, 30);
  
  doc.setFontSize(14);
  doc.text(`Client: ${client.prenom} ${client.nom}`, 20, 50);
  doc.text(`Date: ${mesures.dateCreation.toLocaleDateString('fr-FR')}`, 20, 65);
  
  let yPos = 90;
  const mesuresData = [
    ['Dos', mesures.dos],
    ['Longueur manche', mesures.longueurManche],
    ['Tour de manche', mesures.tourManche],
    ['Longueur robe', mesures.longueurRobe],
    ['Jupe', mesures.jupe],
    ['Pantalon', mesures.pantalon],
    ['Taille', mesures.taille],
    ['Poitrine', mesures.poitrine],
    ['Sous-sein', mesures.sousSein],
    ['Encolure', mesures.encolure],
    ['Carrure', mesures.carrure],
    ['Hanches', mesures.hanches],
    ['Genoux', mesures.genoux],
    ['Ceinture', mesures.ceinture]
  ];
  
  mesuresData.forEach(([label, value]) => {
    if (value) {
      doc.text(`${label}: ${value} cm`, 20, yPos);
      yPos += 12;
    }
  });
  
  if (mesures.notes) {
    yPos += 10;
    doc.text('Notes:', 20, yPos);
    yPos += 10;
    doc.text(mesures.notes, 20, yPos);
  }
  
  doc.save(`Mesures-${client.nom}.pdf`);
};