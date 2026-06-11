import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroText() {
  const { t } = useLanguage();
  return (
    <div 
      className="absolute text-center text-white pointer-events-none"
      style={{
        width: '1000px',
        height: '80px',
        fontFamily: 'Rubik, sans-serif',
        fontStyle: 'normal',
        fontWeight: 800,
        fontSize: '34px',
        lineHeight: '42px',
        top: 'calc(50% + 200px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {t("Stop juggling. Plan, schedule and automate your content on Facebook, TikTok, LinkedIn and more in one place.", "Arrêtez de jongler. Planifiez, programmez et automatisez votre contenu sur Facebook, TikTok , LinkedIn et autres au même endroit.")}
    </div>
  );
}
