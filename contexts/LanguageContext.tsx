import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ms' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  getLanguageName: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const getLanguageName = (lang: Language): string => {
    switch (lang) {
      case 'en': return 'English';
      case 'ms': return 'Bahasa Melayu';
      case 'ar': return 'العربية';
      default: return 'English';
    }
  };

  const value = {
    language,
    setLanguage,
    getLanguageName
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};