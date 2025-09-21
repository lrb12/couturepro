// src/services/auth.ts
import { db } from './database';
import { User, AccessCode } from '../types';

/**
 * Code super-admin (uniquement pour accéder à /admin-secret).
 * Garde-le secret et change-le si besoin.
 */
const MASTER_CODE = 'ADMIN2024';

/**
 * Liste des anciens codes de démo / test à bloquer définitivement.
 * Ajoute ici tous les codes que tu veux interdire (ex: 'DEMO2024', 'TEST001', ...).
 */
const BLACKLISTED_CODES = ['DEMO2024', 'TEST001'];

/**
 * Générer une empreinte simple du navigateur (pour lier un accès au navigateur).
 * Ne garantit pas l'unicité parfaite, mais suffit pour le flow "code à usage unique lié au navigateur".
 */
export const generateBrowserFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Browser fingerprint', 2, 2);

    const data = {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      canvas: canvas.toDataURL()
    };

    return btoa(JSON.stringify(data));
  } catch (e) {
    // Fallback simple si l'environnement bloque canvas
    return btoa(JSON.stringify({
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    }));
  }
};

/**
 * Vérifie si l'utilisateur (par empreinte) est déjà authentifié.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const fingerprint = generateBrowserFingerprint();
    const user = await db.users.where('browserFingerprint').equals(fingerprint).first();
    return !!user;
  } catch (error) {
    console.error('isAuthenticated error:', error);
    return false;
  }
};

/**
 * Authentification avec code d'accès.
 * - Bloque définitivement les codes en blacklist.
 * - Autorise le MASTER_CODE (admin) à se connecter (sans consommer d'accessCode).
 * - Pour les codes utilisateurs : vérifie existence + isUsed, marque isUsed, crée une session utilisateur liée à l'empreinte.
 */
export const authenticateWithCode = async (code: string): Promise<boolean> => {
  try {
    // Normalisation minimale
    const trimmed = (code || '').toString().trim();

    // Refuser immédiatement les codes blacklistés
    if (BLACKLISTED_CODES.includes(trimmed)) {
      console.warn(`Tentative d'utilisation d'un code blacklisté: ${trimmed}`);
      return false;
    }

    const fingerprint = generateBrowserFingerprint();

    // Si la même empreinte a déjà une session utilisateur, considérer comme authentifié
    const existingUser = await db.users.where('browserFingerprint').equals(fingerprint).first();
    if (existingUser) return true;

    // Si c'est le MASTER_CODE, autoriser (admin)
    if (isAdminCode(trimmed)) {
      await db.users.add({
        id: Date.now().toString(),
        code: trimmed,
        usedAt: new Date(),
        browserFingerprint: fingerprint,
        isAdmin: true
      } as User);
      return true;
    }

    // Sinon vérifier la présence du code dans accessCodes
    const accessCode = await db.accessCodes.where('code').equals(trimmed).first();
    if (!accessCode) {
      // pour sécurité, on peut aussi supprimer les codes blacklistés de la DB mais on ne le fait pas ici
      return false;
    }

    // Si déjà utilisé => refus
    if (accessCode.isUsed) return false;

    // Marquer le code comme utilisé et enregistrer la session utilisateur
    await db.accessCodes.update(accessCode.id, {
      isUsed: true,
      usedBy: fingerprint,
      usedAt: new Date()
    });

    await db.users.add({
      id: Date.now().toString(),
      code: trimmed,
      usedAt: new Date(),
      browserFingerprint: fingerprint,
      isAdmin: false
    } as User);

    return true;
  } catch (error) {
    console.error('Erreur authentification:', error);
    return false;
  }
};

/**
 * Vérifie (localement) si un code est le MASTER admin.
 * (Pas asynchrone — on compare la constante).
 */
export const isAdminCode = (code: string): boolean => {
  return (code || '').toString().trim() === MASTER_CODE;
};

/**
 * Création d'un code d'accès (réservé à l'admin).
 * Renvoie false si le code existe déjà ou si erreur.
 */
export const createAccessCode = async (code: string): Promise<boolean> => {
  try {
    const trimmed = (code || '').toString().trim();
    if (!trimmed) return false;

    // Empêcher la création d'un code blacklisté
    if (BLACKLISTED_CODES.includes(trimmed)) {
      console.warn('Tentative de création d\'un code blacklisté:', trimmed);
      return false;
    }

    const existing = await db.accessCodes.where('code').equals(trimmed).first();
    if (existing) return false;

    await db.accessCodes.add({
      id: Date.now().toString(),
      code: trimmed,
      isUsed: false,
      createdAt: new Date()
    } as AccessCode);

    return true;
  } catch (error) {
    console.error('createAccessCode error:', error);
    return false;
  }
};

/**
 * Retourne tous les codes (ordre inverse de création).
 */
export const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  try {
    return await db.accessCodes.orderBy('createdAt').reverse().toArray();
  } catch (error) {
    console.error('getAllAccessCodes error:', error);
    return [];
  }
};

/**
 * Déconnexion : supprime la session utilisateur liée à l'empreinte.
 */
export const logout = async (): Promise<void> => {
  try {
    const fingerprint = generateBrowserFingerprint();
    await db.users.where('browserFingerprint').equals(fingerprint).delete();
  } catch (error) {
    console.error('logout error:', error);
  }
};

/**
 * Supprime définitivement les anciens codes de démo/tests de la DB
 * (DEMO2024, TEST001, etc.). Appelle cette fonction au démarrage si tu veux purger
 * automatiquement tous les anciens codes — utile pour forcer la disparition.
 */
export const cleanupOldDemoCodes = async (): Promise<void> => {
  try {
    for (const bad of BLACKLISTED_CODES) {
      try {
        // supprimer toutes les entrées correspondantes
        await db.accessCodes.where('code').equals(bad).delete();
      } catch (inner) {
        console.warn('Erreur suppression code blacklisté', bad, inner);
      }
    }

    // Optionnel : on peut aussi supprimer les sessions utilisateurs créées avec ces codes
    // (par exemple, s'il existe des users dont user.code est DEMO2024)
    try {
      await db.users.where('code').anyOf(BLACKLISTED_CODES).delete();
    } catch (inner) {
      console.warn('Erreur suppression users liés aux codes blacklistés', inner);
    }

    console.info('cleanupOldDemoCodes: suppression terminée');
  } catch (error) {
    console.error('cleanupOldDemoCodes error:', error);
  }
};
