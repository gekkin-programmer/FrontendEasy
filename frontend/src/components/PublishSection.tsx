import React from 'react';
import pasta from '../assets/Pasta1.jpg';
import pasta2 from '../assets/Pasta2.jpg';
import avatar from '../assets/Avatar.svg';
import { Calendar, Clock, Wand2, Bell } from "lucide-react";
import { useLanguage } from '../context/LanguageContext'; // adjust path if needed

export default function PublishSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-purple-50 min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 max-w-7xl w-full">
        {/* ---------- LEFT – Post Composer ---------- */}
        <div className="p-8 bg-blue-200 rounded-3xl"> 
        <div   className="
    bg-white rounded-2xl shadow-xl border border-gray-200 
    w-full max-w-md lg:max-w-lg p-6 flex flex-col mx-auto 
    transition-transform duration-300 hover:scale-105
  ">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center -space-x-2">
              <img
                src={avatar}
                alt={t("User", "Utilisateur")}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 12h3v8h14v-8h3L12 2z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{t("Thursday 29 11:45 AM", "Jeudi 29 11:45")}</span>
            </div>
          </div>

          {/* Post Text */}
          <div className="mb-4">
            <p className="text-base font-medium text-gray-900">
              {t("Nothing beats the taste of fresh, homemade pasta", "Rien ne vaut le goût des pâtes fraîches faites maison")}
            </p>
            <p className="text-sm text-gray-500">
              {t("#ChefsOfThreads #Pasta #Food", "#ChefsOfThreads #Pâtes #Nourriture")}
            </p>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="relative">
              <img
                src={pasta}
                alt={t("Pasta", "Pâtes")}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <img
                src={pasta2}
                alt={t("Plate", "Assiette")}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              {t("Save as Draft", "Enregistrer comme brouillon")}
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{t("Thursday 29 11:45 AM", "Jeudi 29 11:45")}</span>
              </div>
              <button className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                {t("Schedule Post", "Programmer le post")}
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* ---------- RIGHT – Copy & CTA ---------- */}
        <div className="flex-1 max-w-lg space-y-6 text-center lg:text-left mx-auto">
          <div>
            <p className="text-sm font-semibold text-[#3C48F6] uppercase tracking-wider">
              {t("PUBLISH", "PUBLIER")}
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {t("The most complete set of publishing integrations, ever", "L'ensemble le plus complet d'intégrations de publication, jamais")}
            </h2>
          </div>

          <p className="text-base text-gray-600">
            {t(
              "Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon and X.",
              "Planifiez votre contenu sur les plateformes les plus populaires : Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon et X."
            )}
          </p>

          <div className="space-y-4">
            <FeatureItem
              icon={<Bell className="w-5 h-5 text-[#3C48F6]" />}
              text={t("Auto-publish your content or get a notification when it's time to post", "Publiez automatiquement votre contenu ou recevez une notification lorsqu'il est temps de poster")}
            />
            <FeatureItem
              icon={<Wand2 className="w-5 h-5 text-[#3C48F6]" />}
              text={t("Magically customize and repurpose your post for each platform", "Personnalisez et réutilisez magiquement votre post pour chaque plateforme")}
            />
            <FeatureItem
              icon={<Calendar className="w-5 h-5 text-indigo-600" />}
              text={t("See everything you have scheduled in a calendar or queue view", "Voyez tout ce que vous avez programmé dans un calendrier ou une vue de file d'attente")}
            />
          </div>

          <button className="w-full sm:w-auto px-6 py-3 bg-[#3C48F6] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#2F3AC7] transition-colors">
            {t("Learn more", "En savoir plus")}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* Helper component for the three feature rows */
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm text-gray-600 text-left">{text}</p>
    </div>
  );
}
