import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useLanguage } from "../context/LanguageContext"; // adjust path

interface StatsCardProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ end, label, suffix = "", duration = 2 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
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
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
        <span ref={ref}>
          {count.toLocaleString()}
          {suffix}
        </span>
      </div>
      <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { end: 191726, label: t("Active users", "Utilisateurs actifs") },
    { end: 7858881, label: t("Posts published last month", "Publications publiées le mois dernier") },
    { end: 11, label: t("Social platforms supported", "Plateformes sociales prises en charge") },
  ];

  return (
    <section className="w-full bg-white dark:bg-gray-900 py-12 md:py-16 border-t border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((item) => (
            <StatsCard key={item.label} end={item.end} label={item.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
