// src/hooks/useMediumSettings.ts
export function useMediumSettings() {
    const getSettings = () => ({
      token: localStorage.getItem('mediumToken') || ''
    });
  
    const saveSettings = (token: string) => {
      localStorage.setItem('mediumToken', token);
    };
  
    return {
      getSettings,
      saveSettings
    };
  }