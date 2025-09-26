import jsPDF from 'jspdf';
import { Client, Commande, Paiement, Mesure, Settings } from '../types';
import { db } from './database';

// Fonction utilitaire pour ajouter du texte avec retour à la ligne automatique
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && i > 0) {
      doc.text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  doc.text(line, x, currentY);
  return currentY + lineHeight;
};

// Fonction pour ajouter l'en-tête avec logo
const addHeader = async (doc: jsPDF, title: string) => {
  const settings = await db.settings.get('default');
  const pageWidth = doc.internal.pageSize.width;
  
  // Fond d'en-tête
  doc.setFillColor(27, 127, 77); // Vert principal
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo si disponible
  if (settings?.logo) {
    try {
      doc.addImage(settings.logo, 'JPEG', 15, 8, 24, 24);
    } catch (error) {
      console.warn('Erreur ajout logo:', error);
    }
  }
  
  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings?.atelierName || 'COUTUPRO', settings?.logo ? 45 : 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, settings?.logo ? 45 : 20, 30);
  
  // Informations atelier
  if (settings?.adresse || settings?.telephone) {
    doc.setFontSize(8);
    let infoY = 20;
    if (settings.adresse) {
      doc.text(settings.adresse, pageWidth - 15, infoY, { align: 'right' });
      infoY += 4;
    }
    if (settings.telephone) {
      doc.text(`Tél: ${settings.telephone}`, pageWidth - 15, infoY, { align: 'right' });
      infoY += 4;
    }
    if (settings.email) {
      doc.text(settings.email, pageWidth - 15, infoY, { align: 'right' });
    }
  }
  
  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 45, pageWidth - 15, 45);
  
  return 55; // Position Y après l'en-tête
};

// Fonction pour ajouter le pied de page
const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('Développée par Rénato TCHOBO - COUTUPRO', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
};

export const generateFacturePDF = async (
  client: Client,
  commande: Commande,
  paiements: Paiement[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // En-tête
  let currentY = await addHeader(doc, 'FACTURE');
  
  // Numéro de facture et date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Facture N° ${commande.reference || commande.id}`, 20, currentY);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, currentY, { align: 'right' });
  
  currentY += 20;
  
  // Informations client dans un cadre
  doc.setDrawColor(27, 127, 77);
  doc.setLineWidth(0.5);
  doc.rect(20, currentY, (pageWidth - 40) / 2 - 5, 40);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 25, currentY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${client.prenom} ${client.nom}`, 25, currentY + 16);
  doc.text(`Tél: ${client.telephone}`, 25, currentY + 22);
  if (client.email) doc.text(`Email: ${client.email}`, 25, currentY + 28);
  if (client.adresse) {
    currentY = addWrappedText(doc, `Adresse: ${client.adresse}`, 25, currentY + 34, (pageWidth - 40) / 2 - 15, 4) - 4;
  }
  
  // Informations commande
  const commandeX = pageWidth / 2 + 5;
  doc.rect(commandeX, currentY, (pageWidth - 40) / 2 - 5, 40);
  
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS COMMANDE:', commandeX + 5, currentY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Modèle: ${commande.modele}`, commandeX + 5, currentY + 16);
  doc.text(`Commande: ${commande.dateCommande.toLocaleDateString('fr-FR')}`, commandeX + 5, currentY + 22);
  doc.text(`Livraison: ${commande.dateLivraison.toLocaleDateString('fr-FR')}`, commandeX + 5, currentY + 28);
  doc.text(`Statut: ${commande.statut}`, commandeX + 5, currentY + 34);
  
  currentY += 60;
  
  // Tableau des détails
  const tableY = currentY;
  const tableHeaders = ['Description', 'Quantité', 'Prix unitaire', 'Total'];
  const colWidths = [80, 30, 40, 40];
  let tableX = 20;
  
  // En-tête du tableau
  doc.setFillColor(27, 127, 77);
  doc.rect(tableX, tableY, pageWidth - 40, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  for (let i = 0; i < tableHeaders.length; i++) {
    doc.text(tableHeaders[i], tableX + 2, tableY + 7);
    tableX += colWidths[i];
  }
  
  // Ligne du produit
  currentY = tableY + 15;
  tableX = 20;
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  
  doc.text(commande.modele, tableX + 2, currentY + 5);
  doc.text('1', tableX + colWidths[0] + 2, currentY + 5);
  doc.text(`${commande.montantTotal.toLocaleString()} F`, tableX + colWidths[0] + colWidths[1] + 2, currentY + 5);
  doc.text(`${commande.montantTotal.toLocaleString()} F`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 2, currentY + 5);
  
  // Bordures du tableau
  doc.line(20, tableY + 10, pageWidth - 20, tableY + 10);
  doc.line(20, currentY + 10, pageWidth - 20, currentY + 10);
  
  currentY += 25;
  
  // Résumé financier
  const summaryX = pageWidth - 100;
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ:', summaryX, currentY);
  
  doc.setFont('helvetica', 'normal');
  currentY += 8;
  doc.text(`Montant total: ${commande.montantTotal.toLocaleString()} F`, summaryX, currentY);
  currentY += 6;
  doc.text(`Acompte versé: ${commande.acompte.toLocaleString()} F`, summaryX, currentY);
  currentY += 6;
  
  doc.setFont('helvetica', 'bold');
  const resteColor = commande.reste > 0 ? [220, 38, 127] : [34, 197, 94];
  doc.setTextColor(...resteColor);
  doc.text(`Reste à payer: ${commande.reste.toLocaleString()} F`, summaryX, currentY);
  
  currentY += 20;
  
  // Historique des paiements
  if (paiements.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('HISTORIQUE DES PAIEMENTS:', 20, currentY);
    
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    paiements.forEach(paiement => {
      doc.text(
        `${paiement.datePaiement.toLocaleDateString('fr-FR')} - ${paiement.type}: ${paiement.montant.toLocaleString()} F (${paiement.methode})`,
        25,
        currentY
      );
      currentY += 6;
    });
  }
  
  // Notes si présentes
  if (commande.notes) {
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 20, currentY);
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    currentY = addWrappedText(doc, commande.notes, 20, currentY, pageWidth - 40, 5);
  }
  
  // Pied de page
  addFooter(doc);
  
  // Télécharger
  doc.save(`Facture-${client.nom}-${commande.modele}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateMesuresPDF = async (client: Client, mesure: Mesure) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // En-tête
  let currentY = await addHeader(doc, 'FICHE DE MESURES');
  
  // Informations client
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${client.prenom} ${client.nom}`, 20, currentY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Téléphone: ${client.telephone}`, 20, currentY + 8);
  if (client.email) doc.text(`Email: ${client.email}`, 20, currentY + 14);
  
  doc.text(`Date des mesures: ${mesure.dateCreation.toLocaleDateString('fr-FR')}`, pageWidth - 20, currentY, { align: 'right' });
  doc.text(`Version: ${mesure.version}`, pageWidth - 20, currentY + 8, { align: 'right' });
  
  currentY += 30;
  
  // Photo du client si disponible
  if (client.photo) {
    try {
      doc.addImage(client.photo, 'JPEG', pageWidth - 60, currentY, 40, 40);
    } catch (error) {
      console.warn('Erreur ajout photo client:', error);
    }
  }
  
  // Tableau des mesures
  const mesuresEntries = Object.entries(mesure.mesures).filter(([_, value]) => value > 0);
  
  if (mesuresEntries.length > 0) {
    // En-tête du tableau
    doc.setFillColor(27, 127, 77);
    doc.rect(20, currentY, pageWidth - 40, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('MESURE', 25, currentY + 7);
    doc.text('VALEUR', pageWidth - 60, currentY + 7);
    
    currentY += 15;
    
    // Lignes des mesures
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    mesuresEntries.forEach(([nom, valeur], index) => {
      // Alternance de couleur de fond
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY - 3, pageWidth - 40, 8, 'F');
      }
      
      doc.text(nom, 25, currentY + 2);
      doc.text(`${valeur} cm`, pageWidth - 60, currentY + 2);
      
      currentY += 8;
    });
    
    // Bordure du tableau
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, currentY - mesuresEntries.length * 8 - 10, pageWidth - 40, mesuresEntries.length * 8 + 10);
  }
  
  // Notes si présentes
  if (mesure.notes) {
    currentY += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('NOTES:', 20, currentY);
    
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    currentY = addWrappedText(doc, mesure.notes, 20, currentY, pageWidth - 40, 5);
  }
  
  // Schéma corporel (optionnel)
  currentY += 20;
  if (currentY < doc.internal.pageSize.height - 60) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SCHÉMA DE RÉFÉRENCE:', 20, currentY);
    
    // Dessiner un schéma corporel simple
    const schemaX = pageWidth / 2;
    const schemaY = currentY + 20;
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(1);
    
    // Silhouette simple
    doc.ellipse(schemaX, schemaY, 8, 10); // Tête
    doc.line(schemaX, schemaY + 10, schemaX, schemaY + 40); // Corps
    doc.line(schemaX - 15, schemaY + 20, schemaX + 15, schemaY + 20); // Bras
    doc.line(schemaX, schemaY + 40, schemaX - 10, schemaY + 60); // Jambe gauche
    doc.line(schemaX, schemaY + 40, schemaX + 10, schemaY + 60); // Jambe droite
  }
  
  // Pied de page
  addFooter(doc);
  
  // Télécharger
  doc.save(`Mesures-${client.nom}-${client.prenom}-${mesure.dateCreation.toISOString().split('T')[0]}.pdf`);
};

export const generateRapportMensuelPDF = async (mois: number, annee: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // En-tête
  const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  let currentY = await addHeader(doc, `RAPPORT MENSUEL - ${moisNoms[mois]} ${annee}`);
  
  // Récupérer les données du mois
  const startDate = new Date(annee, mois, 1);
  const endDate = new Date(annee, mois + 1, 0);
  
  const commandes = await db.commandes
    .where('dateCommande')
    .between(startDate, endDate)
    .toArray();
  
  const clients = await db.clients
    .where('dateCreation')
    .between(startDate, endDate)
    .toArray();
  
  const paiements = await db.paiements
    .where('datePaiement')
    .between(startDate, endDate)
    .toArray();
  
  // Statistiques générales
  const totalCommandes = commandes.length;
  const commandesLivrees = commandes.filter(c => c.statut === 'Livrée').length;
  const totalRevenus = paiements.reduce((sum, p) => sum + p.montant, 0);
  const nouveauxClients = clients.length;
  
  // Affichage des statistiques
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ EXÉCUTIF', 20, currentY);
  
  currentY += 15;
  
  const stats = [
    ['Nouvelles commandes', totalCommandes.toString()],
    ['Commandes livrées', commandesLivrees.toString()],
    ['Nouveaux clients', nouveauxClients.toString()],
    ['Revenus totaux', `${totalRevenus.toLocaleString()} F`],
    ['Taux de livraison', `${totalCommandes > 0 ? Math.round((commandesLivrees / totalCommandes) * 100) : 0}%`]
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  stats.forEach(([label, value]) => {
    doc.text(label + ':', 25, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - 25, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    currentY += 8;
  });
  
  // Détail des commandes
  if (commandes.length > 0) {
    currentY += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('DÉTAIL DES COMMANDES', 20, currentY);
    
    currentY += 10;
    
    // En-tête du tableau
    doc.setFillColor(27, 127, 77);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Date', 25, currentY + 5);
    doc.text('Modèle', 60, currentY + 5);
    doc.text('Statut', 120, currentY + 5);
    doc.text('Montant', pageWidth - 25, currentY + 5, { align: 'right' });
    
    currentY += 12;
    
    // Lignes des commandes
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    commandes.slice(0, 20).forEach((commande, index) => { // Limiter à 20 pour éviter le débordement
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY - 2, pageWidth - 40, 6, 'F');
      }
      
      doc.text(commande.dateCommande.toLocaleDateString('fr-FR'), 25, currentY + 2);
      doc.text(commande.modele.substring(0, 25), 60, currentY + 2);
      doc.text(commande.statut, 120, currentY + 2);
      doc.text(`${commande.montantTotal.toLocaleString()} F`, pageWidth - 25, currentY + 2, { align: 'right' });
      
      currentY += 6;
    });
  }
  
  // Pied de page
  addFooter(doc);
  
  // Télécharger
  doc.save(`Rapport-${moisNoms[mois]}-${annee}.pdf`);
};