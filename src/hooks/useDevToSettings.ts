export function useDevToSettings() {
    const getSettings = () => ({
      token: localStorage.getItem('devToToken') || '',
    });
  
    const saveSettings = (token: string) => {
      localStorage.setItem('devToToken', token);
    };
  
    return {
      getSettings,
      saveSettings
    };
  }