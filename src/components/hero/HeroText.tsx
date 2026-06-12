import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroText() {
  const { t } = useLanguage();
  return (
    <div 
      className="absolute text-center text-white pointer-events-none w-[90%] md:w-[80%] lg:w-[900px] xl:w-[1000px] font-['Rubik'] font-[800] text-[18px] md:text-[24px] lg:text-[30px] xl:text-[34px] leading-[1.4] xl:leading-[42px] top-[calc(50%+120px)] md:top-[calc(50%+160px)] xl:top-[calc(50%+200px)] left-1/2 -translate-x-1/2"
    >
      {t("Stop juggling. Plan, schedule and automate your content on Facebook, TikTok, LinkedIn and more in one place.", "Arrêtez de jongler. Planifiez, programmez et automatisez votre contenu sur Facebook, TikTok , LinkedIn et autres au même endroit.")}
    </div>
  );
}
