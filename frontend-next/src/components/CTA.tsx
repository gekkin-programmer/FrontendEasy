"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-[#3C48F6] dark:bg-blue-900 text-white text-center">
      <div className="container mx-auto px-4">
        
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          {t("Ready to get started?", "Prêt à commencer ?")}
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg md:text-2xl mb-10 opacity-90 font-medium max-w-2xl mx-auto">
          {t(
            "Join 140,000+ small businesses using Wiggle to build their brand. No credit card required.", 
            "Rejoignez plus de 140 000 petites entreprises qui utilisent Wiggle pour développer leur marque. Pas de carte de crédit requise."
          )}
        </p>
        
        {/* Action Button */}
        <Link 
          href="/signup" 
          className="inline-block bg-white text-[#3C48F6] font-bold text-lg px-10 py-4 rounded-full shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300"
        >
          {t("Start my free trial", "Commencer mon essai gratuit")}
        </Link>
        
      </div>
    </section>
  );
};

export default CTA;