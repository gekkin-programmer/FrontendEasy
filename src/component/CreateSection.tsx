"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, ArrowRight, Upload, Grid3X3, Link2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 

// ---------- Types ----------
interface Card {
  title: { en: string; fr: string };
  body: { en: string; fr: string };
  image?: string;
  status?: 'draft' | 'done';
}

// ---------- Card Data (Using String Paths) ----------
const todoCards: Card[] = [
  {
    title: { en: 'Threads idea', fr: 'Idée de Threads' },
    body: {
      en: 'New post about the earliest ceramics date back to 24,000',
      fr: 'Nouveau post sur les plus anciennes céramiques datant de 24 000 ans',
    },
    image: '/assets/threads.png', // FIXED PATH
  },
];

const draftCards: Card[] = [
  {
    title: { en: 'Meet the Maker', fr: 'Rencontrez le Créateur' },
    body: {
      en: 'If the making out of the holiday market is anything to go by, we’ve got some serious talent here!',
      fr: 'Si le marché des vacances est un indicateur, nous avons ici un talent sérieux !',
    },
    image: '/assets/MeetTheMaker.jpg', // FIXED PATH
  },
  {
    title: { en: 'Material Insights', fr: 'Aperçu des Matériaux' },
    body: {
      en: 'Not all clay is created equal—here’s a quick primer on the types of clay you can use and how they behave.',
      fr: 'Toutes les argiles ne se valent pas — voici un petit guide sur les types d’argile et leur comportement.',
    },
    image: '/assets/materialInsights.jpg', // FIXED PATH
  },
];

const doneCards: Card[] = [
  {
    title: { en: 'Event Workshop – Clay Bells', fr: 'Atelier Événement – Cloches en Argile' },
    body: {
      en: 'We love seeing our pieces in their new homes! Thanks for sharing, @ceramicfan',
      fr: 'Nous adorons voir nos pièces dans leurs nouveaux foyers ! Merci pour le partage, @ceramicfan',
    },
    image: '/assets/GardenBells.jpg', // FIXED PATH
  },
];

// ---------- Typewriter Data ----------
const textsToType = [
  { en: "Create stunning posts effortlessly!", fr: "Créez des publications époustouflantes facilement !" },
  { en: "Get fresh ideas for your next post", fr: "Obtenez de nouvelles idées pour votre prochaine publication" },
  { en: "Plan, schedule, and post in seconds", fr: "Planifiez, programmez et publiez en quelques secondes" },
  { en: "Boost your engagement with creative posts", fr: "Augmentez votre engagement avec des publications créatives" },
  { en: "Wiggle makes posting fun and simple", fr: "Wiggle rend la publication amusante et simple" },
  { en: "Your content, your way, without hassle", fr: "Votre contenu, à votre façon, sans tracas" }
];

const TYPE_SPEED = 70;
const DELETE_SPEED = 90;
const PAUSE = 1500;

// ---------- Main Component ----------
export default function CreateSection() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter Logic
  useEffect(() => {
    const currentText = textsToType[currentIndex];
    const fullText = t(currentText.en, currentText.fr);

    const type = () => {
      if (!isDeleting && prompt.length < fullText.length) {
        setPrompt(fullText.slice(0, prompt.length + 1));
        timeoutRef.current = setTimeout(type, TYPE_SPEED);
      } else if (!isDeleting && prompt.length === fullText.length) {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), PAUSE);
      } else if (isDeleting && prompt.length > 0) {
        setPrompt(fullText.slice(0, prompt.length - 1));
        timeoutRef.current = setTimeout(type, DELETE_SPEED);
      } else if (isDeleting && prompt.length === 0) {
        const nextIndex = Math.floor(Math.random() * textsToType.length);
        setCurrentIndex(nextIndex);
        setIsDeleting(false);
        timeoutRef.current = setTimeout(type, TYPE_SPEED);
      }
    };

    timeoutRef.current = setTimeout(type, TYPE_SPEED);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [prompt, isDeleting, currentIndex, t]); // Added dependencies to be safe

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-orange-100 p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        
        {/* Left – Hero Content */}
        <div className="space-y-6 z-10">
          <p className="text-sm font-bold text-primary uppercase tracking-wider">
            {t('CREATE', 'CREER')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            {t(
              'Turn any idea into the perfect post',
              'Transformez n’importe quelle idée en post parfait'
            )}
          </h1>

          <p className="text-lg text-gray-700 leading-relaxed">
            {t(
              "Whether you’re flying solo or working with a team, Wiggle has all the features to help you create, organize, and repurpose your content for any channel. There’s also an ",
              "Que vous travailliez seul ou en équipe, Wiggle dispose de toutes les fonctionnalités pour créer, organiser et recycler votre contenu. Il y a aussi un "
            )}
            <strong>{t('AI Assistant', 'Assistant IA')}</strong>
            {t(' if you need it.', ' si vous en avez besoin.')}
          </p>

          <button className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            {t('Learn more', 'En savoir plus')}
            <ArrowRight className="w-5 h-5" />
          </button>

          <ul className="mt-12 space-y-4 text-gray-700">
            <li className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm"><Upload className="w-5 h-5 text-primary" /></div>
              {t('Import content from Canva, Dropbox, Google', 'Importer depuis Canva, Dropbox, Google')}
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm"><Grid3X3 className="w-5 h-5 text-primary" /></div>
              {t('Visually organize your ideas into themes', 'Organisez vos idées en thèmes')}
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm"><Link2 className="w-5 h-5 text-primary" /></div>
              {t('Add a beautiful link-in-bio page', 'Ajoutez une belle page “link in bio”')}
            </li>
          </ul>
        </div>

        {/* Right – AI + Board */}
        <div className="relative z-10">
          {/* AI Assistant Modal */}
          <div className="relative md:absolute md:-top-10 md:left-1/2 md:-translate-x-1/2 w-full max-w-md z-20 mb-8 md:mb-0">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                <h3 className="font-bold text-gray-900">{t('AI Assistant', 'Assistant IA')}</h3>
              </div>

              <div className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[80px] text-sm text-gray-600 font-mono">
                {prompt}<span className="animate-pulse">|</span>
              </div>

              <button className="mt-4 w-full bg-primary text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md">
                {t('Generate Ideas', 'Générer des idées')}
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="mt-0 md:mt-48 bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Column title={t('To Do', 'À faire')} cards={todoCards} />
              <Column title={t('Drafts', 'Brouillons')} cards={draftCards} />
              <Column title={t('Done', 'Faits')} cards={doneCards} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Column Component ----------
function Column({ title, cards }: { title: string; cards: Card[] }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide ml-1">{title}</h4>
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer group"
        >
          {card.image ? (
            <div className="overflow-hidden rounded-lg h-32 w-full mb-2">
                <img
                src={card.image}
                alt={t(card.title.en, card.title.fr)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                />
            </div>
          ) : (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-full h-32 mb-2 flex items-center justify-center text-gray-400 text-xs">No Image</div>
          )}
          <h5 className="font-bold text-gray-900 text-sm leading-tight">{t(card.title.en, card.title.fr)}</h5>
          <p className="text-xs text-gray-500 line-clamp-2">{t(card.body.en, card.body.fr)}</p>
        </div>
      ))}
    </div>
  );
}
