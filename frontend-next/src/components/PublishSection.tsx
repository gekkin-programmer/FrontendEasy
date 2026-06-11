import React, { useState } from 'react';

export default function PublishSection() {
  const [activeTab, setActiveTab] = useState('Publier');
  const tabs = ['Publier', 'Creer', 'Collaborer', 'Statistique', 'Planifier'];

  return (
    <section className="w-full bg-white relative pb-[100px] flex flex-col items-center">
      {/* Content Wrapper */}
      <div className="w-full max-w-[1435px] mx-auto flex flex-col items-start relative px-[52px]">
        {/* Title Area */}
        <div className="relative w-full h-[200px] mb-2">
          <h2 
            className="absolute text-[#000000] text-[32px] leading-[40px]"
            style={{ fontFamily: "'Rubik One', sans-serif", top: '24px', left: '8px' }}
          >
            Pilotez tous vos
          </h2>
          <h1 
            className="absolute text-[#174CD2] text-[70px] leading-[87px]"
            style={{ fontFamily: "'Rubik One', sans-serif", top: '49px', left: '4px' }}
          >
            Reseaux sociaux
          </h1>
          <h2 
            className="absolute text-[#000000] text-[32px] leading-[40px] tracking-[0.3em]"
            style={{ fontFamily: "'Rubik One', sans-serif", top: '125px', left: '8px' }}
          >
            au meme endroit
          </h2>
        </div>
        <p 
          className="text-[#000000] text-[20px] font-medium leading-[30px] max-w-[656px] pl-[8px] mt-2 mb-[120px]"
          style={{ fontFamily: "'Rubik', sans-serif" }}
        >
          Créez vos contenus, planifiez vos publications, collaborez en équipe et analysez vos statistiques directement depuis une seule et unique application.
        </p>

        {/* Blue Block Container */}
        <div className="w-full max-w-full bg-[#3C48F6] rounded-[10px] shadow-[0px_15px_40px_15px_rgba(0,0,0,0.35)] relative py-[80px] px-0 flex flex-col">
          {/* Menu */}
          <div className="flex flex-row items-center gap-[90px] mb-16 pl-[84px] overflow-x-auto">
            {tabs.map((tab) => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center justify-center rounded-[50px] w-[120px] h-[50px] flex-shrink-0 cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-white' : 'hover:bg-white/10'}`}
              >
                <span className={`font-bold text-[16px] font-['Rubik'] transition-colors duration-300 ${activeTab === tab ? 'text-[#174CD2]' : 'text-white'}`}>
                  {tab}
                </span>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="flex flex-row flex-wrap justify-between items-center mx-[84px] px-[40px] py-[40px] gap-10 bg-black/10 rounded-[20px]">
            {/* Image Publier */}
            <img 
              src="/Image Publier.png" 
              alt="Dashboard Preview" 
              className="w-full max-w-[650px] object-contain shadow-2xl rounded-[10px]"
            />
            
            {/* Text Area */}
            <div className="flex flex-col gap-[28px] max-w-[331px]">
              <h3 className="text-white font-bold text-[32px] leading-[36px] font-['Rubik']">Publiez en un clic</h3>
              <p className="text-white font-normal text-[18px] leading-[24px] font-['Rubik']">
                Ne perdez plus de temps à passer d'une application à l'autre. Centralisez vos partages
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
