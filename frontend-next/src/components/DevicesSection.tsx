"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { Wifi, RefreshCw, Smartphone } from 'lucide-react';

export default function DevicesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Wifi size={20} />,
      label: t('Works offline', 'Fonctionne hors ligne'),
    },
    {
      icon: <RefreshCw size={20} />,
      label: t('Real-time sync', 'Synchronisation en temps réel'),
    },
    {
      icon: <Smartphone size={20} />,
      label: t('Native mobile feel', 'Expérience mobile native'),
    },
  ];

  return (
    <section
      className="bg-zinc-50 dark:bg-zinc-950 border-y-4 border-black dark:border-white/10 py-16 md:py-24 px-4 overflow-hidden font-sans"
      aria-label="Multi-device support"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-1 text-xs font-black uppercase tracking-widest mb-5">
            {t('ANY DEVICE. ANYWHERE.', 'N\'IMPORTE OÙ. N\'IMPORTE QUAND.')}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-white uppercase leading-[0.9] tracking-tighter mb-5">
            {t('YOUR FAVORITE', 'VOTRE APPAREIL')}<br />
            <span className="bg-[#3C48F6] text-white px-3 inline-block mt-1">
              {t('DEVICE.', 'PRÉFÉRÉ.')}
            </span>
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 font-bold text-lg max-w-xl mx-auto">
            {t(
              'EasyPost adapts to how you work — whether at your desk, on the couch, or on the go.',
              'EasyPost s\'adapte à votre façon de travailler — que ce soit à votre bureau, sur le canapé ou en déplacement.'
            )}
          </p>
        </div>

        {/* Devices Display — all three side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          <Image
            src="/assets/Macbook-Air-localhost.png"
            alt="EasyPost on MacBook Air"
            width={1200}
            height={750}
            className="w-full object-cover"
            priority
          />
          <Image
            src="/assets/iPad-PRO-11-localhost.png"
            alt="EasyPost on iPad Pro"
            width={800}
            height={600}
            className="w-full object-cover"
          />
          <Image
            src="/assets/iPhone-13-PRO-localhost.png"
            alt="EasyPost on iPhone 13 Pro"
            width={800}
            height={600}
            className="w-full object-cover"
          />
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-4 border-black dark:border-white/20 bg-white dark:bg-zinc-900 px-6 py-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-none font-black text-sm uppercase text-black dark:text-white"
            >
              <span className="text-[#3C48F6]">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
