// src/hooks/useHashnodeSettings.ts
import { useCallback } from 'react';

export function useHashnodeSettings() {
    const getSettings = useCallback(() => ({
      token: localStorage.getItem('hashnodeToken') || '',
      publicationId: localStorage.getItem('hashnodePublicationId') || ''
    }), []);
  
    const saveSettings = useCallback((token: string, publicationId: string) => {
      localStorage.setItem('hashnodeToken', token);
      localStorage.setItem('hashnodePublicationId', publicationId);
    }, []);
  
    return {
      getSettings,
      saveSettings
    };
  }