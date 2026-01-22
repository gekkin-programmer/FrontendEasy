"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Upload, Grid3X3, Link2, Plus, PenTool } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 

// ---------- Types ----------
interface CardData {
  title: { en: string; fr: string };
  body: { en: string; fr: string };
  image?: string;
}

interface ColumnProps {
  title: string;
  cards: CardData[];
  color: string;
}

// ---------- Data ----------
const todoCards: CardData[] = [
  {
    title: { en: 'Threads idea', fr: 'Idée de Threads' },
    body: { en: 'New post about the earliest ceramics date back to 24,000', fr: 'Nouveau post sur les plus anciennes céramiques datant de 24 000 ans' },
    image: '/assets/threads.png',
  },
];

const draftCards: CardData[] = [
  {
    title: { en: 'Meet the Maker', fr: 'Rencontrez le Créateur' },
    body: { en: 'If the making out of the holiday market is anything to go by, we’ve got some serious talent here!', fr: 'Si le marché des vacances est un indicateur, nous avons ici un talent sérieux !' },
    image: '/assets/MeetTheMaker.jpg',
  },
];

const doneCards: CardData[] = [
  {
    title: { en: 'Event Workshop', fr: 'Atelier Événement' },
    body: { en: 'We love seeing our pieces in their new homes!', fr: 'Nous adorons voir nos pièces dans leurs nouveaux foyers !' },
    image: '/assets/GardenBells.jpg',
  },
];

const textsToType = [
  { en: "Create stunning posts effortlessly!", fr: "Créez des publications époustouflantes facilement !" },
  { en: "Plan, schedule, and post in seconds", fr: "Planifiez, programmez et publiez en quelques secondes" },
  { en: "EasyPost makes posting fun and simple", fr: "EasyPost rend la publication amusante et simple" },
];

const TYPE_SPEED = 70;
const DELETE_SPEED = 90;
const PAUSE = 1500;

// ---------- COMPONENTS ----------

const BrutalCard = ({ children, color = "bg-white", className = "" }: any) => (
  <div className={`border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${color} ${className} transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]`}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#3C48F6]", textColor = "text-white" }: any) => (
  <span className={`inline-block px-3 py-1 font-black text-xs md:text-sm uppercase tracking-widest border-2 border-black ${color} ${textColor}`}>
    {children}
  </span>
);

export default function CreateSection() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter Effect
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
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [prompt, isDeleting, currentIndex, t]);

  return (
    <section 
      className="min-h-screen bg-yellow-100 dark:bg-black/90 border-b-4 border-black dark:border-white/5 p-4 sm:p-6 md:p-12 relative overflow-hidden font-sans"
      aria-label="Content Creation Features"
    >
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-white/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start relative z-10">
        
        {/* Left – Hero Content */}
        <div className="space-y-6 md:space-y-8 pt-6 md:pt-10">
          <BrutalBadge color="bg-[#3C48F6]">{t("CREATE","CREER")}</BrutalBadge>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-black dark:text-gray-200 leading-[0.95] tracking-tighter uppercase">
            {t("TURN","TRANSFORMER")}<span className="text-white bg-black dark:bg-white/5 px-2 mx-1">{t("IDEAS","VOS IDEES")}</span><br/>
            {t("INTO","EN")} <span className="text-[#3C48F6]">{t("VIRAL","CONTENU")}</span><br/>
            {t("CONTENT.","VIRAUX.")}
          </h1>

          <p className="text-lg md:text-xl font-bold text-black dark:text-gray-300 border-l-8 border-[#3C48F6] pl-6 leading-snug">
            {t(
              "Whether you’re flying solo or working with a team, EasyPost has all the features to help you create, organize, and repurpose your content.",
              "Que vous travailliez seul ou en équipe, EasyPost dispose de toutes les fonctionnalités pour créer, organiser et recycler votre contenu."
            )}
          </p>

          <a href="/signup" className="w-full sm:w-auto inline-flex justify-center items-center gap-3 bg-white dark:bg-gray-200 text-black font-black text-lg py-4 px-8 border-4 border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
            {t('START CREATING', 'COMMENCEZ')} <ArrowRight strokeWidth={3} />
          </a>

          <div className="grid gap-3 pt-4">
            {[
                { icon: Upload, text: t("Import content from Canva, Dropbox", "Importez depuis Canva, Dropbox") },
                { icon: Grid3X3, text: t("Visually organize your ideas", "Organisez visuellement vos idées") },
                { icon: Link2, text: t("Add a beautiful link-in-bio page", "Ajoutez une belle page link-in-bio") }
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-200 border-2 border-black">
                    <item.icon size={24} className="text-[#3C48F6] flex-shrink-0" strokeWidth={2.5} />
                    <span className="font-bold text-black dark:text-gray-800 text-sm md:text-base">{item.text}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Right – AI + Kanban */}
        <div className="relative mt-8 lg:mt-0 space-y-10">
          
          {/* AI Box (Floating) */}
          <BrutalCard className="w-full max-w-md mx-auto bg-white p-6 rotate-1 hover:rotate-0 transition-transform">
             <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-black p-1"><Sparkles className="text-yellow-400 w-5 h-5" /></div>
                    <h3 className="font-black text-xl text-black uppercase">Easy AI</h3>
                </div>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
             </div>
             
             <div className="bg-gray-100 border-2 border-black p-4 font-mono text-sm min-h-[80px] mb-4">
                <span className="text-[#3C48F6] font-bold">{">"}</span>{" "}
                <span className="text-black font-bold">
                    {prompt}
                </span>
                <span className="animate-pulse w-2 h-4 bg-black inline-block align-middle ml-1"></span>
             </div>

             <button className="w-full bg-[#3C48F6] text-white font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                <PenTool size={18} /> {t("GENERATE MAGIC", "GENERER VOS TEXTES")}
             </button>
          </BrutalCard>

          {/* Kanban Board (Stacked on Mobile) */}
          <div className="bg-white border-4 border-black p-4 shadow-[12px_12px_0px_0px_#000]">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Column title="TO DO" cards={todoCards} color="bg-red-100" />
                <Column title="DRAFT" cards={draftCards} color="bg-yellow-100" />
                <Column title="DONE" cards={doneCards} color="bg-green-100" />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ---------- Column Component ----------
function Column({ title, cards, color }: ColumnProps) {
  const { t } = useLanguage();
  return (
    <div className={`p-3 border-2 border-black ${color} h-full flex flex-col`}>
      <h4 className="font-black text-black text-lg uppercase mb-4 border-b-2 border-black pb-1">{title}</h4>
      <div className="space-y-4 flex-1">
        {cards.map((card, i) => (
            <div key={i} className="bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                {card.image && (
                    <div className="border-2 border-black mb-2 overflow-hidden h-24 relative w-full">
                        <Image 
                           src={card.image} 
                           alt="Kanban Item"
                           fill
                           className="object-cover grayscale hover:grayscale-0 transition-all"
                           sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                )}
                <h5 className="font-bold text-sm text-black leading-tight mb-1">{t(card.title.en, card.title.fr)}</h5>
                <p className="text-xs font-mono text-gray-600 line-clamp-2">{t(card.body.en, card.body.fr)}</p>
            </div>
        ))}
        <div className="border-2 border-dashed border-black text-black p-2 flex justify-center cursor-pointer hover:bg-white/50 mt-auto">
            <Plus />
        </div>
      </div>
    </div>
  );
}
