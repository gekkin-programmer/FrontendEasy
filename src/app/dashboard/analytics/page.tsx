'use client';
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-10 p-4 md:p-8">
      <header>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-black dark:text-white">{t("Analytics_Engine", "Moteur_Analytique")}</h1>
        <p className="text-gray-500 dark:text-zinc-400 font-mono text-xs uppercase tracking-widest mt-2">{t("Global_Performance_Metrics", "Métriques_Performance_Globale")}</p>
      </header>
      <div className="p-20 border-4 border-dashed border-zinc-300 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-600 font-black uppercase text-2xl bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] transition-all">
        {t("Analytics_Charts_Coming_Soon", "Graphiques_Analytiques_Bientôt_Disponibles")}
      </div>
    </div>
  );
}
