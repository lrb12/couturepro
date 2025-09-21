import { db } from './database';
import { User, AccessCode } from '../types';

// Code super-admin (uniquement pour accéder à /admin-secret)
const MASTER_CODE = 'ADMIN2024';

// Générer une empreinte unique du navigateur
export const generateBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Browser fingerprint', 2, 2);

  return btoa(JSON.stringify({
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    canvas: canvas.toDataURL()
  }));
};

// Vérifie si un utilisateur est connecté
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const fingerprint = generateBrowserFingerprint();
    const user = await db.users.where('browserFingerprint').equals(fingerprint).first();
    return !!user;
  } catch {
    return false;
  }
};

// Authentification avec un code d’accès
export const authenticateWithCode = async (code: string): Promise<boolean> => {
  try {
    const fingerprint = generateBrowserFingerprint();

    // Vérifier si déjà connecté
    const existingUser = await db.users.where('browserFingerprint').equals(fingerprint).first();
    if (existingUser) return true;

    // Vérifier si c’est un code admin
    if (isAdminCode(code)) {
      await db.users.add({
        id: Date.now().toString(),
        code,
        usedAt: new Date(),
        browserFingerprint: fingerprint
      });
      return true;
    }

    // Vérifier si le code existe dans la DB
    const accessCode = await db.accessCodes.where('code').equals(code).first();
    if (!accessCode || accessCode.isUsed) return false;

    // Marquer le code comme utilisé
    await db.accessCodes.update(accessCode.id, {
      isUsed: true,
      usedBy: fingerprint,
      usedAt: new Date()
    });

    // Créer l’utilisateur
    await db.users.add({
      id: Date.now().toString(),
      code,
      usedAt: new Date(),
      browserFingerprint: fingerprint
    });

    return true;
  } catch (error) {
    console.error('Erreur authentification:', error);
    return false;
  }
};

// Vérifie si c’est le code super-admin
export const isAdminCode = (code: string): boolean => {
  return code === MASTER_CODE;
};

// Création d’un code d’accès (réservé à l’admin)
export const createAccessCode = async (code: string): Promise<boolean> => {
  try {
    const existing = await db.accessCodes.where('code').equals(code).first();
    if (existing) return false;

    await db.accessCodes.add({
      id: Date.now().toString(),
      code,
      isUsed: false,
      createdAt: new Date()
    });

    return true;
  } catch {
    return false;
  }
};

// Récupérer tous les codes
export const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  return await db.accessCodes.orderBy('createdAt').reverse().toArray();
};

// Déconnexion
export const logout = async (): Promise<void> => {
  const fingerprint = generateBrowserFingerprint();
  await db.users.where('browserFingerprint').equals(fingerprint).delete();
};
