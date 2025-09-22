import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Settings } from '../types';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settingsData = await db.settings.get('default');
      if (settingsData) {
        setSettings(settingsData);
        // Appliquer les couleurs CSS
        applyThemeColors(settingsData);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updated = {
        ...settings,
        ...newSettings,
        updatedAt: new Date()
      } as Settings;
      
      await db.settings.put(updated);
      setSettings(updated);
      applyThemeColors(updated);
      return true;
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      return false;
    }
  };

  const applyThemeColors = (settings: Settings) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
    root.style.setProperty('--accent-color', settings.accentColor);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    loadSettings
  };
};