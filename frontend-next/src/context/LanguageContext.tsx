"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';
type Theme = 'light' | 'dark';

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
  // 1. Language — lazy init from localStorage (client only, fallback 'en' for SSR)
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('app_language') as Language;
    if (saved) return saved;
    const deviceLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
    localStorage.setItem('app_language', deviceLang);
    return deviceLang;
  });

  // 2. Theme — lazy init from localStorage (client only, fallback 'dark' for SSR)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('theme') as Theme;
    if (!saved) localStorage.setItem('theme', 'dark');
    return saved || 'dark';
  });

  // Apply theme class whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync <html lang> with selected language
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