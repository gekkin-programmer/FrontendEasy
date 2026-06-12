import React, { useState } from 'react';

export default function PublishSection() {
  const [activeTab, setActiveTab] = useState('Publier');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    title: "Publiez en un clic",
    description: "Ne perdez plus de temps à passer d'une application à l'autre. Centralisez vos partages",
  },
  Creer: {
    title: "Créez facilement",
    description: "Donnez vie à vos idées avec des outils simples et puissants.",
  },
  Collaborer: {
    title: "Collaborez en équipe",
    description: "Travaillez ensemble et partagez vos projets en temps réel.",
  },
  Statistique: {
    title: "Analysez vos statistiques",
    description: "Suivez vos performances et optimisez vos contenus.",
  },
  Planifier: {
    title: "Planifiez vos publications",
    description: "Organisez votre calendrier et publiez au bon moment.",
  },
};


  return (
    <section className="w-full bg-white relative pb-[60px] md:pb-[100px] flex flex-col items-center pt-[60px] md:pt-[100px]">
      {/* Content Wrapper */}
      <div className="w-full max-w-[1435px] mx-auto flex flex-col items-start relative px-[16px] md:px-[52px]">
        {/* Title Area */}
        <div className="w-full flex flex-col gap-1 mb-6">
          <h2 
            className="text-[#000000] text-[24px] md:text-[32px] leading-tight"
            style={{ fontFamily: "'Rubik One', sans-serif" }}
          >
            Pilotez tous vos
          </h2>
          <h1 
            className="text-[#174CD2] text-[40px] md:text-[60px] xl:text-[70px] leading-tight -ml-[4px]"
            style={{ fontFamily: "'Rubik One', sans-serif" }}
          >
            Reseaux sociaux
          </h1>
          <h2 
            className="text-[#000000] text-[20px] md:text-[32px] leading-tight tracking-[0.15em] md:tracking-[0.3em]"
            style={{ fontFamily: "'Rubik One', sans-serif" }}
          >
            au meme endroit
          </h2>
        </div>
        <p 
          className="text-[#000000] text-[16px] md:text-[20px] font-medium leading-[26px] md:leading-[30px] max-w-[656px] mt-2 mb-[60px] md:mb-[120px]"
          style={{ fontFamily: "'Rubik', sans-serif" }}
        >
          Créez vos contenus, planifiez vos publications, collaborez en équipe et analysez vos statistiques directement depuis une seule et unique application.
        </p>

        {/* Blue Block Container */}
        <div className="w-full max-w-full bg-[#3C48F6] rounded-[10px] shadow-[0px_15px_40px_15px_rgba(0,0,0,0.35)] relative py-[40px] md:py-[80px] px-0 flex flex-col">
          {/* Menu */}
          <div className="flex flex-row items-center gap-[16px] md:gap-[40px] xl:gap-[90px] mb-10 md:mb-16 px-[16px] md:px-[20px] xl:pl-[84px] overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center justify-center rounded-[50px] px-4 md:w-[120px] h-[50px] flex-shrink-0 cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-white' : 'hover:bg-white/10'}`}
              >
                <span className={`font-bold text-[14px] md:text-[16px] font-['Rubik'] transition-colors duration-300 ${activeTab === tab ? 'text-[#174CD2]' : 'text-white'}`}>
                  {tab}
                </span>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="flex flex-col lg:flex-row flex-wrap justify-between items-center mx-[16px] md:mx-[20px] xl:mx-[84px] px-[16px] md:px-[20px] xl:px-[40px] py-[24px] md:py-[40px] gap-10 bg-black/10 rounded-[20px]">
            {/* Image / Video wrapper */}
            <div className={isFullscreen ? 'fixed inset-0 z-[100] bg-black/95 flex items-center justify-center' : 'relative w-full max-w-[650px]'}>
              <img
                src={tabImages[activeTab]}
                alt={`${activeTab} Preview`}
                className={isFullscreen ? 'max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-[10px]' : 'w-full object-contain shadow-2xl rounded-[10px]'}
              />
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`absolute hover:scale-110 transition-transform flex items-center justify-center p-2 bg-black/20 rounded-full backdrop-blur-sm ${isFullscreen ? 'top-8 right-8' : 'top-4 right-4'}`}
                aria-label="Toggle Fullscreen"
              >
                 {isFullscreen ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 20V14H4M10 14L3 21M14 4V10H20M14 10L21 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 9V3H15M21 3L14 10M3 15V21H9M3 21L10 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 )}
              </button>
            </div>
            
            {/* Text Area */}
            <div className="flex flex-col gap-[28px] max-w-[331px]">
              <h3 className="text-white font-bold text-[32px] leading-[36px] font-['Rubik']">
              {tabContent[activeTab].title}
            </h3>
            <p className="text-white font-normal text-[18px] leading-[24px] font-['Rubik']">
              {tabContent[activeTab].description}
            </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
