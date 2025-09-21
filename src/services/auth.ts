// ========================
// src/services/auth.ts
// ========================
import { db } from './database';
import { User, AccessCode } from '../types';

const MASTER_CODE = 'ADMIN2024';
const DEMO_PREFIX = 'DEMO';

// Génère l'empreinte unique du navigateur
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

// Vérifie si l'utilisateur est déjà authentifié
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const fingerprint = generateBrowserFingerprint();
    const user = await db.users.where('browserFingerprint').equals(fingerprint).first();
    return !!user;
  } catch {
    return false;
  }
};

// Authentification avec code d'accès
export const authenticateWithCode = async (code: string): Promise<boolean> => {
  try {
    const fingerprint = generateBrowserFingerprint();

    // Déjà authentifié
    const existingUser = await db.users.where('browserFingerprint').equals(fingerprint).first();
    if (existingUser) return true;

    // Vérifie code
    const accessCode = await db.accessCodes.where('code').equals(code).first();
    if (!accessCode || accessCode.isUsed) return false;

    // Marquer le code comme utilisé
    await db.accessCodes.update(accessCode.id, {
      isUsed: true,
      usedBy: fingerprint,
      usedAt: new Date()
    });

    // Crée l'utilisateur
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

// Vérifie si le code est admin
export const isAdminCode = (code: string): boolean => code === MASTER_CODE;

// Crée un nouveau code d'accès
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

// Récupère tous les codes d'accès
export const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  return await db.accessCodes.orderBy('createdAt').reverse().toArray();
};

// Déconnexion
export const logout = async (): Promise<void> => {
  const fingerprint = generateBrowserFingerprint();
  await db.users.where('browserFingerprint').equals(fingerprint).delete();
};

// Supprime les anciens codes DEMO
export const cleanupOldDemoCodes = async (): Promise<void> => {
  try {
    const demoCodes = await db.accessCodes.filter(c => c.code.startsWith(DEMO_PREFIX)).toArray();
    for (const code of demoCodes) {
      await db.accessCodes.delete(code.id);
    }
  } catch (error) {
    console.error('Erreur suppression anciens codes DEMO:', error);
  }
};

// Génère un code aléatoire
export const generateRandomCode = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Initialisation admin si inexistant
export const ensureAdminCode = async (): Promise<void> => {
  const existing = await db.accessCodes.where('code').equals(MASTER_CODE).first();
  if (!existing) {
    await db.accessCodes.add({
      id: Date.now().toString(),
      code: MASTER_CODE,
      isUsed: false,
      createdAt: new Date()
    });
  }
};
ts
Copier le code
// ========================