"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useLanguage } from "../context/LanguageContext"; 

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
    <div className="flex flex-col items-center justify-center p-8 border-r-4 border-black dark:border-white/5 last:border-r-0 hover:bg-yellow-300 dark:hover:bg-white/5 transition-colors cursor-default group">
      <div className="text-4xl md:text-6xl font-black font-mono text-black dark:text-gray-200 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform">
        <span ref={ref}>{count.toLocaleString()}</span>{suffix}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-black dark:group-hover:text-gray-200">
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
    <section className="w-full bg-white dark:bg-black/90 border-b-4 border-black dark:border-white/5">
      <div className="container mx-auto px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 divide-black">
          {stats.map((item) => (
            <StatsCard key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
