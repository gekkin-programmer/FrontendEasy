"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import SectionBackground from './SectionBackground'; 

interface StatsCardProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ end, label, suffix = "", duration = 2 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <div className="flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 last:border-b-0 last:border-r-0 hover:bg-[#3C48F5] hover:text-white dark:hover:bg-white/5 transition-colors cursor-default group">
      <div className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-black dark:text-gray-200 group-hover:text-white transition-colors">
        <span ref={ref}>{count.toLocaleString()}</span>{suffix}
      </div>
      <p className="mt-4 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-black dark:group-hover:text-gray-200 text-center">
        {label}
      </p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { end: 191726, label: t("Active users", "Utilisateurs actifs") },
    { end: 7858881, label: t("Posts published", "Posts publiés") },
    { end: 11, label: t("Platforms", "Plateformes") },
  ];

  return (
    <section
      className="w-full bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 relative overflow-hidden"
      aria-label="Statistics"
    >
      <SectionBackground />
      <div className="container mx-auto px-0 relative z-10">
        {/* Mobile: Stack vertical (border-b), Desktop: Horizontal (border-r) */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((item) => (
            <StatsCard key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
