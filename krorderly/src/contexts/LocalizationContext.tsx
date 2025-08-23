import { createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useState, useContext } from 'preact/hooks';

export type Language = 'EN' | 'JA';
interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LocalizationContext = createContext<LocalizationContextType>(null!);
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export const LocalizationProvider = ({ children }: { children: ComponentChildren }) => {
  
  const [language, setLanguage] = useState<Language>('EN');
  const value = {
    language,
    setLanguage,
  };
  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};
