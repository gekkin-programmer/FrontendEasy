'use client';
import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';

export default function GlobalSettingsPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-10 p-4 md:p-8">
      <header>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-black dark:text-white">{t("Global_Settings", "Paramètres_Globaux")}</h1>
        <p className="text-gray-500 dark:text-zinc-400 font-mono text-xs uppercase tracking-widest mt-2">{t("Platform_Configuration_Control", "Contrôle_Configuration_Plateforme")}</p>
      </header>
      <div className="p-20 border-4 border-dashed border-zinc-300 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-600 font-black uppercase text-2xl bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] transition-all">
        {t("Settings_Panel_Coming_Soon", "Panneau_Paramètres_Bientôt_Disponible")}
      </div>
    </div>
  );
}
