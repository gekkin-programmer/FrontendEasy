import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SafariHeroVideo } from '@/components/landing/SafariHeroVideo';

// TODO: replace with the real product demo video URL once one exists — the
// modal renders a "Video coming soon" placeholder until this is set.
const DEMO_VIDEO_SRC = '';

export default function PublishSection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Publier');
  const tabs = ['Publier', 'Creer', 'Collaborer', 'Statistique', 'Planifier'];

  const tabImages: Record<string, string> = {
  Publier: "/Image Publier.png",
  Creer: "/Image Publier.png",
  Collaborer: "/Image Publier.png",
  Statistique: "/Image Publier.png",
  Planifier: "/Image Publier.png",
};

const tabContent: Record<string, { title: string; description: string }> = {
  Publier: {
    title: t("Publish in one click", "Publiez en un clic"),
    description: t("Stop wasting time switching from one app to another. Centralize your shares.", "Ne perdez plus de temps à passer d'une application à l'autre. Centralisez vos partages"),
  },
  Creer: {
    title: t("Create easily", "Créez facilement"),
    description: t("Bring your ideas to life with simple and powerful tools.", "Donnez vie à vos idées avec des outils simples et puissants."),
  },
  Collaborer: {
    title: t("Collaborate as a team", "Collaborez en équipe"),
    description: t("Work together and share your projects in real time.", "Travaillez ensemble et partagez vos projets en temps réel."),
  },
  Statistique: {
    title: t("Analyze your statistics", "Analysez vos statistiques"),
    description: t("Track your performance and optimize your content.", "Suivez vos performances et optimisez vos contenus."),
  },
  Planifier: {
    title: t("Schedule your posts", "Planifiez vos publications"),
    description: t("Organize your calendar and publish at the right time.", "Organisez votre calendrier et publiez au bon moment."),
  },
};


  return (
    <section className="w-full bg-white relative pb-[60px] md:pb-[100px] flex flex-col items-center pt-[60px] md:pt-[100px] mt-5">
      {/* Content Wrapper */}
      <div className="w-full max-w-[1435px] 3xl:max-w-[1900px] mx-auto flex flex-col items-center md:items-start relative px-[16px] md:px-[52px]">
        {/* Title Area */}
        <div className="w-full flex flex-col items-center md:items-start text-center md:text-left mb-6">
          <h2 className="font-['Rubik_One'] font-normal text-[24px] md:text-[30px] lg:text-[36px] leading-tight lg:leading-[45px] text-black relative z-2">
            {t("Manage all your", "Pilotez tous vos")}
          </h2>
          <h1 className="font-['Rubik_One'] font-normal text-[48px] md:text-[58px] lg:text-[70px] leading-tight lg:leading-[87px] text-[#174CD2] mt-[-5px] md:mt-[-10px] lg:mt-[-20px] relative z-1">
            {t("Social networks", "Reseaux sociaux")}
          </h1>
        </div>
        <p 
          className="text-[#666666] text-[16px] md:text-[18px] font-medium leading-[26px] md:leading-[30px] max-w-[656px] mt-3 mb-[60px] md:mb-[120px] text-center md:text-left mx-auto md:mx-0"
          style={{ fontFamily: "'Rubik', sans-serif" }}
        >
          {t("Create your content, schedule your posts, collaborate with your team, and analyze your statistics directly from a single application.", "Créez vos contenus, planifiez vos publications, collaborez en équipe et analysez vos statistiques directement depuis une seule et unique application.")}
        </p>

        {/* Blue Block Container */}
        <div className="w-full max-w-full bg-[#174CD2] rounded-[10px] shadow-[0px_15px_40px_15px_rgba(0,0,0,0.35)] relative py-[40px] md:py-[80px] px-0 flex flex-col">
          {/* Menu */}
          <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-[12px] md:gap-[40px] xl:gap-[40px] 2xl:gap-[90px] mb-10 md:mb-16 px-[16px] md:px-[20px] xl:px-[40px] 2xl:pl-[84px]">
            {tabs.map((tab) => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center justify-center rounded-[50px] px-4 md:w-[120px] h-[50px] flex-shrink-0 cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-white' : 'hover:bg-white/10'}`}
              >
                <span className={`font-bold text-[14px] md:text-[16px] font-['Rubik'] transition-colors duration-300 ${activeTab === tab ? 'text-[#174CD2]' : 'text-white'}`}>
                  {tab === 'Publier' ? t('Publish', 'Publier') : 
                   tab === 'Creer' ? t('Create', 'Creer') : 
                   tab === 'Collaborer' ? t('Collaborate', 'Collaborer') : 
                   tab === 'Statistique' ? t('Statistics', 'Statistique') : 
                   tab === 'Planifier' ? t('Schedule', 'Planifier') : tab}
                </span>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="flex flex-col lg:flex-row flex-wrap justify-between items-center mx-[16px] md:mx-[20px] xl:mx-[40px] 2xl:mx-[84px] px-[16px] md:px-[20px] xl:px-[30px] 2xl:px-[40px] py-[24px] md:py-[40px] gap-8 2xl:gap-10 bg-black/10 rounded-[20px]">
            {/* Image / Video wrapper */}
            <div className="relative w-full max-w-[650px]">
              <SafariHeroVideo
                imageSrc={tabImages[activeTab]}
                videoSrc={DEMO_VIDEO_SRC}
                url="app.eazypost.cm"
              />
            </div>
            
            {/* Text Area */}
            <div className="flex flex-col gap-[28px] max-w-[331px] items-center md:items-start text-center md:text-left">
              <h3 className="text-white font-bold text-[32px] leading-[36px] font-['Rubik']">
              {tabContent[activeTab].title}
            </h3>
            <p className="text-white font-normal text-[18px] leading-[24px] font-['Rubik']">
              {tabContent[activeTab].description}
            </p>

            <button className="bg-white text-[#174CD2] font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 w-fit hover:bg-gray-100 transition-all hover:scale-105 mx-auto md:mx-0">
              {t("Learn more", "En savoir plus")}
            </button>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}