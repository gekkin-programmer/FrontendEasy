"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';

type Language = 'en' | 'fr' | 'ar';
type Theme = 'light' | 'dark';

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = { en, fr, ar };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, fr: string, ar?: string) => string;
  theme: Theme;
  toggleTheme: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  // Hydration-safe preference load: state must start identical on server and
  // client, then sync from localStorage after mount. A lazy initializer would
  // read localStorage during the client render and cause hydration mismatches.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app_language') as Language;
      if (savedLang) {
        setLanguage(savedLang);
      } else {
        const deviceLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
        localStorage.setItem('app_language', deviceLang);
        setLanguage(deviceLang);
      }

      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        localStorage.setItem('theme', 'dark');
        setTheme('dark');
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'fr' : prev === 'fr' ? 'ar' : 'en';
      localStorage.setItem('app_language', newLang);
      return newLang;
    });
  };

  const setLanguageOverride = (newLang: Language) => {
    localStorage.setItem('app_language', newLang);
    setLanguage(newLang);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const t = (en: string, fr: string, ar?: string) => {
    const langTranslations = translations[language];
    if (langTranslations) {
      const translated = langTranslations[en] || langTranslations[fr];
      if (translated) return translated;
    }
    if (language === 'fr') return fr;
    if (language === 'ar' && ar) return ar;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageOverride, toggleLanguage, t, theme, toggleTheme }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
