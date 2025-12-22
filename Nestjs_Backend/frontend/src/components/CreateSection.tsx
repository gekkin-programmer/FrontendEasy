// src/components/CreateSection.tsx
import React, { useEffect, useState, useRef } from 'react';
import thredas from '../assets/threads.png';
import meetTheMaker from '../assets/MeetTheMaker.jpg';
import materialInsights from '../assets/materialInsights.jpg';
import gardenBells from '../assets/GardenBells.jpg';
import { Sparkles, ArrowRight, Upload, Grid3X3, Link2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // adjust path if needed

// ---------- Types ----------
interface Card {
  title: { en: string; fr: string };
  body: { en: string; fr: string };
  image?: string;
  status?: 'draft' | 'done';
}

// ---------- Card Data ----------
const todoCards: Card[] = [
  {
    title: { en: 'Threads idea', fr: 'Idée de Threads' },
    body: {
      en: 'New post about the earliest ceramics date back to 24,000',
      fr: 'Nouveau post sur les plus anciennes céramiques datant de 24 000 ans',
    },
    image: thredas,
  },
];

const draftCards: Card[] = [
  {
    title: { en: 'Meet the Maker', fr: 'Rencontrez le Créateur' },
    body: {
      en: 'If the making out of the holiday market is anything to go by, we’ve got some serious talent here!',
      fr: 'Si le marché des vacances est un indicateur, nous avons ici un talent sérieux !',
    },
    image: meetTheMaker,
  },
  {
    title: { en: 'Material Insights', fr: 'Aperçu des Matériaux' },
    body: {
      en: 'Not all clay is created equal—here’s a quick primer on the types of clay you can use and how they behave.',
      fr: 'Toutes les argiles ne se valent pas — voici un petit guide sur les types d’argile et leur comportement.',
    },
    image: materialInsights,
  },
];

const doneCards: Card[] = [
  {
    title: { en: 'Event Workshop – Clay Bells', fr: 'Atelier Événement – Cloches en Argile' },
    body: {
      en: 'We love seeing our pieces in their new homes! Thanks for sharing, @ceramicfan',
      fr: 'Nous adorons voir nos pièces dans leurs nouveaux foyers ! Merci pour le partage, @ceramicfan',
    },
    image: gardenBells,
  },
];

// ---------- Typewriter Effect ----------
// Array of typewriter texts for EasyPost
const textsToType = [
  {
    en: "Create stunning posts effortlessly!",
    fr: "Créez des publications époustouflantes facilement !"
  },
  {
    en: "Get fresh ideas for your next post",
    fr: "Obtenez de nouvelles idées pour votre prochaine publication"
  },
  {
    en: "Plan, schedule, and post in seconds",
    fr: "Planifiez, programmez et publiez en quelques secondes"
  },
  {
    en: "Boost your engagement with creative posts",
    fr: "Augmentez votre engagement avec des publications créatives"
  },
  {
    en: "EasyPost makes posting fun and simple",
    fr: "EasyPost rend la publication amusante et simple"
  },
  {
    en: "Your content, your way, without hassle",
    fr: "Votre contenu, à votre façon, sans tracas"
  }
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
  const timeoutRef = useRef<number | null>(null);
useEffect(() => {
  const currentText = textsToType[currentIndex];

  const type = () => {
    const fullText = t(currentText.en, currentText.fr);

    if (!isDeleting && prompt.length < fullText.length) {
      setPrompt(fullText.slice(0, prompt.length + 1));
      timeoutRef.current = window.setTimeout(type, TYPE_SPEED);
    } else if (!isDeleting && prompt.length === fullText.length) {
      timeoutRef.current = window.setTimeout(() => setIsDeleting(true), PAUSE);
    } else if (isDeleting && prompt.length > 0) {
      setPrompt(fullText.slice(0, prompt.length - 1));
      timeoutRef.current = window.setTimeout(type, DELETE_SPEED);
    } else if (isDeleting && prompt.length === 0) {
      // Move to next random text
      const nextIndex = Math.floor(Math.random() * textsToType.length);
      setCurrentIndex(nextIndex);
      setIsDeleting(false);
      timeoutRef.current = window.setTimeout(type, TYPE_SPEED);
    }
  };

  timeoutRef.current = window.setTimeout(type, TYPE_SPEED);

  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, [prompt, isDeleting, currentIndex]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-orange-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Left – Hero */}
        <div className="space-y-6">
          <p className="text-sm font-semibold text-[#3C48F6] uppercase tracking-wider">
            {t('CREATE', 'CREER')}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            {t(
              'Turn any idea into the perfect post',
              'Transformez n’importe quelle idée en post parfait'
            )}
          </h1>

          <p className="text-lg text-gray-700">
            {t(
              "Whether you’re flying solo or working with a team, Buffer has all the features to help you create, organize, and repurpose your content for any channel. There’s also an ",
              "Que vous travailliez seul ou en équipe, Buffer dispose de toutes les fonctionnalités pour créer, organiser et recycler votre contenu pour n’importe quelle plateforme. Il y a aussi un "
            )}
            <strong>{t('AI Assistant', 'Assistant IA')}</strong>
            {t(' if you need it.', ' si vous en avez besoin.')}
          </p>

          <button className="inline-flex items-center gap-2 bg-[#3C48F6] text-white font-medium px-6 py-3 rounded-full hover:bg-emerald-800 transition">
            {t('Learn more', 'En savoir plus')}

            <ArrowRight className="w-5 h-5" />
          </button>

          <ul className="mt-12 space-y-4 text-gray-700">
            <li className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-[#3C48F6]" />
              {t(
                'Import content from Canva, Dropbox, Google and more',
                'Importer du contenu depuis Canva, Dropbox, Google et plus'
              )}
            </li>
            <li className="flex items-center gap-3">
              <Grid3X3 className="w-6 h-6 text-[#3C48F6]" />
              {t(
                'Visually organize your ideas into groups or themes',
                'Organisez visuellement vos idées en groupes ou thèmes'
              )}
            </li>
            <li className="flex items-center gap-3">
              <Link2 className="w-6 h-6 text-[#3C48F6]" />
              {t(
                'Add a beautiful link in bio page to your profiles',
                'Ajoutez une belle page “link in bio” à vos profils'
              )}
            </li>
          </ul>
        </div>

        {/* Right – AI + Board */}
        <div className="relative">
          {/* AI Assistant Modal */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-10">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#3C48F6]" />
                <h3 className="font-semibold text-gray-900">{t('AI Assistant', 'Assistant IA')}</h3>
              </div>

              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                rows={3}
                value={prompt}
                readOnly
                placeholder=""
              />

              <button className="mt-4 w-full bg-[#3C48F6] text-white font-medium py-2.5 rounded-lg hover:bg-[#3C48F6] transition">
                {t('Generate Ideas', 'Générer des idées')}
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="mt-48 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
  {/* The tabs section remains the same */}
  <div className="flex gap-4 border-b border-gray-200 mb-4">
    {/* ... your buttons ... */}
  </div>

  {/* THIS IS THE UPDATED, RESPONSIVE GRID */}
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
      <h4 className="font-semibold text-gray-800">{title}</h4>
      {cards.map((card, i) => (
        <div
          key={i}
          className={`bg-white rounded-lg shadow-sm p-3 space-y-2 overflow-hidden ${
            card.status === 'draft' ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          {card.image ? (
            <img
              src={card.image}
              alt={card.title.en}
              className="w-full h-32 object-cover rounded-md mb-2"
              loading="lazy"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-md w-full h-32 mb-2" />
          )}
          <h5 className="font-medium text-gray-900 text-sm">{t(card.title.en, card.title.fr)}</h5>
          <p className="text-xs text-gray-600 line-clamp-2">{t(card.body.en, card.body.fr)}</p>
        </div>
      ))}
    </div>
  );
}
