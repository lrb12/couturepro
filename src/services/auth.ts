import { db } from './database';
import { User, AccessCode } from '../types';

const MASTER_CODE = 'ADMIN2024';

// Générer un identifiant unique basé sur le code d'accès plutôt que sur le navigateur
export const generateUserSession = (code: string): string => {
  return `session_${code}_${Date.now()}`;
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // Vérifier s'il y a une session active dans localStorage
    const sessionData = localStorage.getItem('coutupro_session');
    if (!sessionData) return false;

    const { code, sessionId } = JSON.parse(sessionData);
    
    // Vérifier que le code existe toujours et est utilisé
    const accessCode = await db.accessCodes.where('code').equals(code).first();
    if (!accessCode || !accessCode.isUsed) return false;

    // Vérifier que la session existe
    const user = await db.users.where('id').equals(sessionId).first();
    return !!user;
  } catch {
    return false;
  }
};

export const authenticateWithCode = async (code: string): Promise<boolean> => {
  try {
    // Vérifier le code
    const accessCode = await db.accessCodes.where('code').equals(code).first();
    if (!accessCode) return false;

    // Si le code n'est pas encore utilisé, le marquer comme utilisé
    if (!accessCode.isUsed) {
      await db.accessCodes.update(accessCode.id, {
        isUsed: true,
        usedAt: new Date()
      });
    }

    // Créer une nouvelle session utilisateur
    const sessionId = generateUserSession(code);
    await db.users.add({
      id: sessionId,
      code,
      usedAt: new Date(),
      browserFingerprint: 'multi_browser_session'
    });

    // Sauvegarder la session dans localStorage
    localStorage.setItem('coutupro_session', JSON.stringify({
      code,
      sessionId,
      loginTime: new Date().toISOString()
    }));

    return true;
  } catch (error) {
    console.error('Erreur authentification:', error);
    return false;
  }
};

export const isAdminCode = (code: string): boolean => {
  return code === MASTER_CODE;
};

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

export const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  return await db.accessCodes.orderBy('createdAt').reverse().toArray();
};

export const logout = async (): Promise<void> => {
  try {
    const sessionData = localStorage.getItem('coutupro_session');
    if (sessionData) {
      const { sessionId } = JSON.parse(sessionData);
      await db.users.where('id').equals(sessionId).delete();
    }
    localStorage.removeItem('coutupro_session');
  } catch (error) {
    console.error('Erreur déconnexion:', error);
  }
};