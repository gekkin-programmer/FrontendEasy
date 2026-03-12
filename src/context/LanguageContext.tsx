"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'fr';
type Theme = 'light' | 'dark';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (en: string, fr: string) => string;
  theme: Theme;
  toggleTheme: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // 1. Language Initialization — always start with 'en' for SSR consistency
  const [language, setLanguage] = useState<Language>('en');

  // 2. Theme Initialization — always start with 'dark' for SSR consistency
  const [theme, setTheme] = useState<Theme>('dark');

  // Hydrate language and theme from localStorage after mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const deviceLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
      localStorage.setItem('app_language', deviceLang);
      setLanguage(deviceLang);
    }

    const savedTheme = localStorage.getItem('theme') as Theme;
    const resolvedTheme = savedTheme || 'dark';
    if (!savedTheme) localStorage.setItem('theme', 'dark');
    setTheme(resolvedTheme);
  }, []);

  // Apply theme class whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'fr' : 'en';
      localStorage.setItem('app_language', newLang);
      return newLang;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const t = (en: string, fr: string) => (language === 'en' ? en : fr);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, theme, toggleTheme }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};