'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t("What exactly is Eazypost?", "Qu’est-ce qu’Eazypost exactement ?"),
      answer: t(
        "Eazypost is a web platform that helps you manage your social networks from one place: create, plan, publish and track performance from a single dashboard.",
        "Eazypost est une plateforme web qui t’aide à gérer tes réseaux sociaux depuis un seul endroit : créer, planifier, publier et suivre les performances depuis un tableau de bord unique."
      ),
    },
    {
      question: t("How is Eazypost different from its competitors?", "En quoi Eazypost est différent de ses concurrents ?"),
      answer: t(
        "It combines simplicity, clarity and speed. You get the essentials without the clutter of overly complex tools, while keeping a strong focus on daily use.",
        "Il combine simplicité, clarté et rapidité. Tu obtiens l’essentiel sans le surplus d’outils trop complexes, tout en gardant un fort focus sur l’utilisation au quotidien."
      ),
    },
    {
      question: t("Which social networks can I connect?", "Quels réseaux sociaux puis-je connecter ?"),
      answer: t(
        "Eazypost is built for the main networks you already use daily, including Facebook, Instagram, TikTok, YouTube, LinkedIn, WhatsApp, Discord, X and Telegram.",
        "Eazypost est pensé pour les principaux réseaux que tu utilises déjà au quotidien, notamment Facebook, Instagram, TikTok, YouTube, LinkedIn, WhatsApp, Discord, X et Telegram."
      ),
    },
    {
      question: t("Who is Eazypost made for?", "À qui s’adresse Eazypost ?"),
      answer: t(
        "It is designed for creators, SMEs, agencies, organizations and teams that want a simple way to organize their communication without becoming social media experts.",
        "Il est pensé pour les créateurs, PME, agences, organisations et équipes qui veulent un moyen simple d’organiser leur communication sans devenir experts en social media."
      ),
    },
    {
      question: t("How long does it take to get started?", "Combien de temps faut-il pour commencer ?"),
      answer: t(
        "Most users can create their first workflow in a few minutes. The interface is designed to be easy to understand from the very first session.",
        "La plupart des utilisateurs peuvent créer leur premier workflow en quelques minutes. L’interface est pensée pour être facile à comprendre dès la première session."
      ),
    },
    {
      question: t("Can I invite my team?", "Puis-je inviter mon équipe ?"),
      answer: t(
        "Yes. Eazypost is built to support collaborative use so that several people can work together on planning and publishing.",
        "Oui. Eazypost est pensé pour soutenir un usage collaboratif afin que plusieurs personnes puissent travailler ensemble sur la planification et la publication."
      ),
    },
    {
      question: t("Is my data secure?", "Mes données sont-elles sécurisées ?"),
      answer: t(
        "Yes. Eazypost uses official platform authorizations and modern security practices to protect your accesses and your data.",
        "Oui. Eazypost utilise les autorisations officielles des plateformes et des pratiques de sécurité modernes pour protéger tes accès et tes données."
      ),
    },
    {
      question: t("Can I test Eazypost before subscribing?", "Puis-je tester Eazypost avant de m’abonner ?"),
      answer: t(
        "Yes. You can explore the main features and evaluate the experience before choosing a more complete plan.",
        "Oui. Tu peux explorer les principales fonctionnalités et évaluer l’expérience avant de choisir un plan plus complet."
      ),
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full bg-white relative flex flex-col items-center px-[20px] py-[80px] md:py-[120px]">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-[40px] lg:gap-[60px]">
        <div className="flex flex-col w-full lg:w-[35%] gap-4 lg:sticky lg:top-24 items-center">
          <div className="inline-flex w-fit items-center justify-center rounded-full px-3 py-1">
            <span className="text-[40px] md:text-[90px] font-semibold uppercase tracking-[0.24em] text-[#174CD2]" style={{ fontFamily: "'Rubik One', sans-serif" }}>
              {t('FAQ', 'FAQ')}
            </span>
          </div>

        {/* <div className="space-y-2">
            <h2 className="text-[#000000] text-[28px] md:text-[32px] xl:text-[36px] leading-tight font-normal" style={{ fontFamily: "'Rubik One', sans-serif" }}>
              {t('Frequently Asked', 'Foire aux')}
            </h2>
            <h1
              className="text-[#174CD2] text-[40px] md:text-[50px] xl:text-[70px] leading-tight font-black"
              style={{ fontFamily: "'Rubik One', sans-serif" }}
            >
              {t('Questions', 'Questions')}
            </h1>
          </div>

          <p className="text-[16px] leading-7 text-slate-600">
            {t(
              'Everything you need to know before starting with Eazypost, from onboarding to pricing and support.',
              'Tout ce qu’il faut savoir avant de commencer avec Eazypost, de l’intégration au prix en passant par l’accompagnement.'
            )}
          </p>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-[14px] font-semibold text-slate-900">
              {t('Still need help?', 'Toujours besoin d’aide ?')}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              {t(
                'Our team is here to help you set up your first campaign or answer any specific question.',
                'Notre équipe peut t’aider à configurer ta première campagne ou à répondre à toute question précise.'
              )}
            </p>
          </div> */}
        </div>

        <div className="w-full lg:w-[65%] max-w-[1000px] flex flex-col gap-[16px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                className="w-full rounded-[18px] border border-slate-200 bg-white px-[24px] py-[18px] text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[1px] hover:border-[#174CD2]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[16px] md:text-[18px] font-medium pr-[40px] text-black" style={{ fontFamily: "'Rubik One', sans-serif" }}>
                    {faq.question}
                  </span>

                  <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#174CD2] text-white transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 5v14m-7-7h14" />
                    </svg>
                  </div>
                </div>

                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-[15px] leading-7 text-slate-700" style={{ fontFamily: "'Rubik', sans-serif" }}>{faq.answer}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
