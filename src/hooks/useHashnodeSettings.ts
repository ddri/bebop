// src/hooks/useHashnodeSettings.ts
export function useHashnodeSettings() {
    const getSettings = () => ({
      token: localStorage.getItem('hashnodeToken') || '',
      publicationId: localStorage.getItem('hashnodePublicationId') || ''
    });
  
    const saveSettings = (token: string, publicationId: string) => {
      localStorage.setItem('hashnodeToken', token);
      localStorage.setItem('hashnodePublicationId', publicationId);
    };
  
    return {
      getSettings,
      saveSettings
    };
  }