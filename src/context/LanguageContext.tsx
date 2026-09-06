import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { i18n } from '../data/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: typeof i18n.cs;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'en' ? 'en' : 'cs';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
  };

  const toggleLang = () => {
    setLang(lang === 'cs' ? 'en' : 'cs');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (i18n[lang] || i18n.cs) as typeof i18n.cs;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const defaultLanguageContext: LanguageContextType = {
  lang: 'cs',
  setLang: () => {},
  toggleLang: () => {},
  t: i18n.cs,
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context || defaultLanguageContext;
};
