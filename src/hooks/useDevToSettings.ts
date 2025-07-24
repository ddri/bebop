// src/hooks/useDevToSettings.ts
import { useCallback } from 'react';

export function useDevToSettings() {
  const getSettings = useCallback(() => ({
    token: localStorage.getItem('devToToken') || ''
  }), []);

  const saveSettings = useCallback((token: string) => {
    localStorage.setItem('devToToken', token);
  }, []);

  return {
    getSettings,
    saveSettings
  };
}