'use client';

import React, { useState } from 'react';

const faqs = [
  { 
    question: "Qu’est-ce qu’Eazypost exactement ?", 
    answer: "Eazypost est une plateforme web qui te permet de gérer tous tes réseaux sociaux au même endroit : créer, planifier, publier et analyser tes contenus depuis un seul tableau de bord. L’idée est de t’offrir la puissance d’une plateforme flexible et créative, mais avec une interface beaucoup plus simple et adaptée aux réalités d’un marché évolutif (mobile, budget, temps disponible)." 
  },
  { 
    question: "En quoi Eazypost est différent de ses concurrents", 
    answer: "Comme les plateformes concurrentes, Eazypost permet de programmer des posts, gérer plusieurs comptes et suivre les performances, mais sans t’imposer des menus complexes ou des options dont tu n’as pas besoin au quotidien. La plateforme est pensée pour des créateurs de contenus, influenceurs, PME, agences, organisation et institutions que ce soit en Afrique ou à l’international : vocabulaire clair, scénarios d’usage concrets, et une philosophie “je me connecte, je comprends vite, j’agis tout de suite”." 
  },
  { 
    question: "Quels réseaux sociaux puis‑je connecter à Eazypost ?", 
    answer: "Eazypost se concentre d’abord sur les réseaux les plus utilisés : Facebook, Instagram, TikTok, YouTube, LinkedIn, WhatsApp, Discord, X et Telegram, dans l’esprit des intégrations multi‑plateformes proposées par les grands outils du marché. L’objectif n’est pas d’avoir la liste la plus longue possible, mais de couvrir ceux des plus pertinents que tu utilises vraiment au quotidien pour ton activité ou ta communauté." 
  },
  { 
    question: "À qui s’adresse Eazypost ?", 
    answer: "Eazypost est pensé pour les créateurs de contenus, influenceurs, petites et moyennes entreprises, agences marketing et organisations (ONG, écoles, institutions publiques…). Que tu sois seul avec ton ordinateur, un smartphone ou à la tête d’une équipe, l’outil te donne un cadre simple pour organiser ta communication sans devoir devenir “expert en social media”." 
  },
  { 
    question: "Faut‑il être expert des réseaux sociaux pour utiliser Eazypost ?", 
    answer: "Non. Si tu sais déjà publier sur Facebook ou TikTok, tu peux utiliser Eazypost. La plateforme reprend les grands principes des outils de gestion de réseaux (calendrier, file d’attente, statistiques), mais avec des écrans épurés et des explications simples, à la manière des interfaces jugées “faciles à prendre en main”." 
  },
  {
    question: "Comment fonctionne la tarification d’Eazypost ?",
    answer: "Eazypost s’inspire des logiques modernes de tarification des outils social media : des plans qui évoluent avec toi, adaptés à la taille de ton activité (créateur, PME, agence, institution), plutôt que des offres “one size fits all”. L’objectif est de rester accessible pour tous les budgets, là où certains outils internationaux démarrent à des prix très élevés pour de petits utilisateurs ou des équipes naissantes."
  },
  {
    question: "Est‑ce que je peux utiliser Eazypost avec une connexion Internet faible ou seulement sur mobile ?",
    answer: "Oui, c’est un point clé surtout pour le marché africain : une grande partie de l’usage des réseaux sociaux en Afrique se fait sur smartphone, avec des connexions parfois limitées. Eazypost s’inspire des bonnes pratiques des outils “mobile‑first” (interfaces simples, pages légères) pour te permettre de planifier et suivre tes contenus sans avoir besoin d’une connexion ultra rapide ou d’un ordinateur super puissant."
  },
  {
    question: "Comment Eazypost m’aide concrètement à gagner du temps ?",
    answer: "Au lieu d’ouvrir chaque application séparément, tu planifies tes posts pour plusieurs réseaux en une seule fois, comme le proposent les meilleurs planificateurs sociaux media. Tu vois ton calendrier, tes messages importants et tes chiffres clés sur un même écran, ce qui évite les allers‑retours entre applis et t’empêche d’oublier de publier au bon moment."
  },
  {
    question: "Est‑ce que mes données et mes comptes sont en sécurité avec Eazypost ?",
    answer: "Les outils de gestion de réseaux sociaux sérieux utilisent les systèmes d’autorisation officiels des plateformes (comme les connexions via Facebook, Instagram, LinkedIn, etc.) pour ne jamais stocker ton mot de passe en clair. Eazypost adopte la même logique : connexion via les API officielles des réseaux et usage des standards modernes de sécurité pour protéger l’accès à tes comptes et à tes données."
  },
  {
    question: "Puis‑je tester Eazypost gratuitement avant de m’engager ?",
    answer: "Les meilleures plateformes de gestion sociale media proposent généralement un plan gratuit limité ou une période d’essai pour découvrir l’outil avant de payer. Eazypost s’inscrit dans cette approche : te laisser tester les fonctions clés (connexion de quelques comptes, planification de posts, premières statistiques) pour voir si cela correspond à ton besoin avant de passer à une offre plus complète."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white relative flex flex-col items-center pt-[100px] pb-[150px]">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start justify-between px-[20px] md:px-[52px] xl:px-[157px] gap-[40px] lg:gap-[60px]">
        
        {/* Left Side: Text */}
        <div className="flex flex-col w-full lg:w-[35%] gap-2 lg:sticky lg:top-32">
          <h2 className="text-[#000000] text-[40px] md:text-[50px] xl:text-[70px] leading-tight font-black" style={{ fontFamily: "'Rubik One', sans-serif" }}>
            Foire Aux
          </h2>
          <h1 
            className="text-[#174CD2] text-[40px] md:text-[50px] xl:text-[70px] leading-tight font-black"
            style={{ fontFamily: "'Rubik One', sans-serif" }}
          >
            Questions
          </h1>
        </div>

        {/* FAQ Items (Accordion) */}
        {/* Increased width slightly from 930px to 1000px */}
        <div className="w-full lg:w-[65%] max-w-[1000px] flex flex-col gap-[40px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                onClick={() => toggleFaq(index)}
                className="w-full bg-white rounded-[10px] cursor-pointer group transition-all duration-300 flex flex-col overflow-hidden border border-slate-100"
              >
                {/* Header */}
                <div className="w-full min-h-[70px] relative flex items-center justify-between px-[30px] py-[15px]">
                  <span className="font-['Rubik'] text-[18px] font-medium pr-[60px] text-black transition-colors">
                    {faq.question}
                  </span>
                  
                  {/* Plus / Minus Button */}
                  <div className="absolute right-[24px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
                    <div className="absolute w-full h-full left-0 top-0 bg-[#174CD2] rounded-[60px] transition-colors" />
                    <svg 
                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px] text-white transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v14m-7-7h14" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Answer */}
                <div 
                  className={`w-full transition-all duration-300 ease-in-out bg-white ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-[30px] pt-[20px] font-['Rubik'] text-[16px] text-slate-700 leading-relaxed bg-white">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
