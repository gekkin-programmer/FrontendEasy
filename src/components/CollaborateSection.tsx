"use client";

import React from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 

// Reusable helper for comments
function CommentBubble({
  avatar,
  text,
  className = '',
}: {
  avatar: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-2 bg-white rounded-full shadow-lg px-3 py-1.5 text-sm font-medium animate-bounce-slow ${className}`}
    >
      <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
      <span className="text-gray-800 whitespace-nowrap">{text}</span>
    </div>
  );
}

export default function CollaborateSection() {
  const { t } = useLanguage();

  // Define the path to your local image
  const autumnImage = "/assets/Automn.jpg";

  return (
    <div className="relative bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-8 md:p-10 shadow-sm overflow-hidden h-full flex flex-col border border-amber-100 dark:border-amber-800/50">
      
      {/* === Top: Text Content === */}
      <div className="space-y-6 flex-1 relative z-10">
        <p className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-sm">
          {t("Collaborate", "Collaborer")}
        </p>

        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {t("Great Content, Created Together", "Du contenu génial, créé ensemble")}
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
          {t(
            "Collaborate seamlessly with your team. Invite unlimited collaborators, assign roles and permissions, and keep everyone aligned with saved drafts and notes.",
            "Collaborez facilement avec votre équipe. Invitez des collaborateurs illimités, attribuez des rôles et des autorisations, et gardez tout le monde aligné."
          )}
        </p>
      </div>

      {/* === Visual Showcase === */}
      <div className="relative mt-10 mb-12 flex justify-center">
        
        {/* Floating comment bubbles */}
        <CommentBubble
          avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
          text={t("Looks good!", "Superbe !")}
          className="-left-4 top-10 md:left-0"
        />

        <CommentBubble
          avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
          text={t("Approved ✅", "Validé ✅")}
          className="-right-4 bottom-20 md:right-0"
        />

        {/* Central post card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 max-w-xs md:max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <img
              src={autumnImage}
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-sm">yoyo_ceramics</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {t(
                  "Our new autumn collection just dropped! Let us know your favourite piece…",
                  "Notre nouvelle collection d'automne vient de sortir ! Dites-nous quelle pièce vous préférez…"
                )}
              </p>
            </div>
          </div>

          {/* Post image placeholder */}
          <div className="mt-4 relative group">
            <img
              src={autumnImage}
              alt={t("Autumn pottery collection", "Collection de poterie d'automne")}
              className="w-full h-40 md:h-48 object-cover rounded-xl shadow-sm group-hover:brightness-110 transition-all"
            />
            {/* Fake 'Tag' on image */}
            <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md">
                @pottery_daily
            </div>
          </div>

          {/* Approval buttons */}
          <div className="mt-4 flex gap-3 justify-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors">
              <X className="w-3 h-3" />
              {t("Reject", "Refuser")}
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-colors">
              <Check className="w-3 h-3" />
              {t("Approve", "Approuver")}
            </button>
          </div>
        </div>
      </div>

      {/* === Learn More Button === */}
      <div className="mt-auto pt-4">
        <a
          href="#"
          className="bg-primary text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 w-fit shadow-lg shadow-primary/30 hover:bg-blue-700 transition-all hover:scale-105"
        >
          {t("Learn more", "En savoir plus")} <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
