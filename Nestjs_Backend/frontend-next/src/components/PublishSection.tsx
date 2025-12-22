"use client";

import React from 'react';
import { Calendar, Clock, Wand2, Bell } from "lucide-react";
import { FaStore, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useLanguage } from '../context/LanguageContext'; 

export default function PublishSection() {
  const { t } = useLanguage();

  // Define image paths
  const pasta = "/assets/Pasta1.jpg";
  const pasta2 = "/assets/Pasta2.jpg";
  const avatar = "/assets/Avatar.svg";
  const publish = "/assets/postKanban.PNG";

  return (
    <section className="bg-purple-50 dark:bg-purple-900/10 min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20 font-sans">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-7xl w-full">
        
        {/* ---------- LEFT – Post Composer Visual ---------- */}
        <div className="relative p-6 md:p-12 bg-blue-200 dark:bg-blue-900/30 rounded-[2.5rem] w-full lg:w-1/2 flex items-center justify-center"> 
          <div className="
            bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
            w-full max-w-md p-6 flex flex-col mx-auto 
            transition-transform duration-500 hover:scale-[1.02]
          ">
            <img 
               src={publish}
               alt="Kanban View"
              className="w-full h-120 object-cover rounded-lg mb-6" 
            />
            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {t("Save Draft", "Brouillon")}
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>11:45 AM</span>
                </div>
                <button className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors shadow-lg shadow-blue-500/30">
                  {t("Schedule", "Programmer")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT – Copy & CTA ---------- */}
        <div className="flex-1 max-w-lg space-y-8 text-center lg:text-left">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
              {t("PUBLISH", "PUBLIER")}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              {t("The most complete set of publishing integrations", "L'ensemble le plus complet d'intégrations")}
            </h2>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {t(
              "Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, and X.",
              "Planifiez votre contenu sur les plateformes les plus populaires : Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest et X."
            )}
          </p>

          <div className="space-y-6">
            <FeatureItem
              icon={<Bell className="w-5 h-5 text-primary" />}
              text={t("Auto-publish your content or get a notification when it's time to post", "Publiez automatiquement votre contenu ou recevez une notification lorsqu'il est temps de poster")}
            />
            <FeatureItem
              icon={<Wand2 className="w-5 h-5 text-primary" />}
              text={t("Magically customize and repurpose your post for each platform", "Personnalisez et réutilisez magiquement votre post pour chaque plateforme")}
            />
            <FeatureItem
              icon={<Calendar className="w-5 h-5 text-primary" />}
              text={t("See everything you have scheduled in a calendar or queue view", "Voyez tout ce que vous avez programmé dans un calendrier ou une vue de file d'attente")}
            />
          </div>

          <div className="pt-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              {t("Start Publishing", "Commencer à publier")}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Helper component */
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 text-left leading-relaxed pt-1">{text}</p>
    </div>
  );
}
