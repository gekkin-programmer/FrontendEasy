"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 

// --- CommentItem Component ---
function CommentItem({
  avatar,
  name,
  text,
  time,
}: {
  avatar: string;
  name: string;
  text: string;
  time: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-3 items-start">
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
      />
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-bold">{name}</span>{' '}
          <span>{t(text, text)}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(time, time)}</p>
      </div>
    </div>
  );
}

export default function EngageSection() {
  const { t } = useLanguage();
  const [hasReplied, setHasReplied] = useState(false);
  const [replyText, setReplyText] = useState('This looks amazing! How can I join?');

  // Define asset paths (Ensure these exist in your public/assets folder)
  // IMPORTANT: Rename 'Profile pic.svg' to 'ProfilePic.svg' in your public folder to avoid spaces
  const ProfilePic = "/assets/Profile pic.svg"; 
  const YungEra = "/assets/YungEra.jpg";
  const Avatar = "/assets/Avatar.svg";

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setHasReplied(true);
  };

  return (
    <div className="relative bg-lime-50 dark:bg-lime-900/20 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm overflow-hidden h-full flex flex-col border border-lime-100 dark:border-lime-800/50">
      
      {/* === Top: Text Content === */}
      <div className="space-y-4 md:space-y-6 flex-1 z-20">
        <p className="text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider text-sm">
          {t("Engage", "Engager")}
        </p>

        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {t("Reply To Comments in a Flash", "Répondez aux commentaires en un éclair")}
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed">
          {t("Engage with your audience on Facebook and Instagram at", "Interagissez avec votre audience sur Facebook et Instagram à")}
          <span className="font-bold text-gray-900 dark:text-white"> {t("10× speed", "10× plus vite")}</span>.
          {t(" Wiggle will help you triage and respond to comments from one simple dashboard.", " Wiggle vous aidera à trier et répondre aux commentaires depuis un tableau de bord simple.")}
        </p>
      </div>

      {/* === Visual Showcase === */}
      <motion.div
        className="relative mt-12 mb-12 z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 max-w-md mx-auto space-y-4 border border-gray-100 dark:border-gray-700">
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{t("3 unanswered comments", "3 commentaires non répondus")}</span>
            <button className="underline hover:text-primary">{t("Hide", "Cacher")}</button>
          </div>

          <div className="flex gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop"
              alt="Post thumbnail"
              className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {t("I’m starting a monthly virtual knit-along where we can all work on the same project together! Who’s in?", "Je commence un tricot collaboratif virtuel mensuel...")}
              </p>
              <div className="flex gap-2 mt-2 text-gray-400 text-xs items-center">
                <MessageCircle className="w-3 h-3" />
                <span>{t("12 hours ago", "Il y a 12 heures")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            <CommentItem avatar={ProfilePic} name="rachelastral" text="Love this idea! How do I sign up?" time="5h" />
            
            {hasReplied && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <CommentItem avatar={Avatar} name="You" text={replyText} time="1s" />
              </motion.div>
            )}

            <CommentItem avatar={YungEra} name="Creator Yung Era" text="I like this huh!" time="45m" />
          </div>

          {!hasReplied && (
            <form onSubmit={handleReply} className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <img src={Avatar} alt="You" className="w-8 h-8 rounded-full" />
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("Reply...", "Répondre...")}
                className="flex-1 min-w-0 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:text-white transition"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!replyText.trim()}
              >
                {t("Reply", "Répondre")}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* === Learn More Button === */}
      <div className="mt-auto z-20 pt-4">
        <a href="#" className="bg-primary text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 w-fit shadow-lg shadow-primary/30 hover:bg-blue-700 transition-all hover:scale-105">
          {t("Learn more", "En savoir plus")} <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
