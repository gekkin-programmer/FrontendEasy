'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutUsSection({ hideBackground = false }: { hideBackground?: boolean }) {
  const { t } = useLanguage();
  const cards = [
    {
      title: t('Centralisation', 'Centralisation'),
      description: t('Centralize all your social networks in one easy-to-use dashboard.', 'Centralise tous tes reseaux sociaux dans un seul tableau de bord simple a utiliser.'),
      iconPath: "/assets/icons/about-centralisation.svg"
    },
    {
      title: t('Scheduling', 'Planification'),
      description: t("Schedule your content in advance to stay consistent, even when busy or without a stable connection.", 'Planifie tes contenus a l\'avance pour rester coherent, meme quand tu es occupe ou sans connexion stable.'),
      iconPath: "/assets/icons/about-planification.svg"
    },
    {
      title: t('AI Assistant', 'Assistant IA'),
      description: t('Generate post ideas, captions and hashtags tailored to your audience with AI.', 'Genere des idees de posts, legendes et hashtags adaptes a ton audience grace a l\'IA.'),
      iconPath: "/assets/icons/about-ia.svg"
    },
    {
      title: t('Statistics', 'Statistiques'),
      description: t('Track your activity (views, interactions, followers) to improve your content with every post.', 'Suis tes activites (vues, interactions, abonnes) pour ameliorer ton contenu a chaque publication.'),
      iconPath: "/assets/icons/about-stats.svg"
    }
  ];

  return (
    <section className={`w-full flex flex-col items-center pt-[20px] max-[375px]:pt-[12px] max-[540px]:pt-[12px] md:pt-[80px] lg:pt-[40px] xl:pt-[80px] pb-[60px] max-[375px]:pb-[32px] max-[540px]:pb-[40px] md:pb-[80px] lg:pb-[90px] 3xl:pb-[120px] px-3 max-[375px]:px-2 md:px-[40px] lg:px-[60px] xl:px-4 3xl:px-[120px] ${hideBackground ? 'bg-transparent' : 'bg-white'} relative overflow-hidden`}>
      
      {/* Light Gradient 07 & 09 Backgrounds - Primary Blue Variations */}
      {!hideBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Ellipse 13 */}
          <div className="absolute w-[1403px] h-[597px] left-[-476px] top-[-270px] bg-[#040028] blur-[200px] opacity-40 -rotate-[23.17deg] rounded-full"></div>
          {/* Ellipse 12 */}
          <div className="absolute w-[541px] h-[541px] left-[-163px] top-[-270px] bg-[#00D2FF] blur-[150px] opacity-30 rounded-full"></div>
          {/* Ellipse 14 */}
          <div className="absolute w-[784.5px] h-[191.22px] left-[-96.91px] top-[514.32px] bg-gradient-to-r from-[#00D2FF] to-[#174CD2] blur-[200px] opacity-40 -rotate-[21.88deg] rounded-full"></div>
          
          {/* Ellipse 26 (Light Gradient 09) - Primary Blue Variation */}
          <div className="absolute w-[500px] md:w-[704px] 3xl:w-[950px] h-[500px] md:h-[704px] 3xl:h-[950px] right-[-10%] md:right-[-20%] 3xl:right-[-10%] top-[30%] md:top-[328px] 3xl:top-[300px] bg-[#174CD2] blur-[150px] md:blur-[200px] 3xl:blur-[280px] opacity-40 rounded-full"></div>
        </div>
      )}

      {/* Frame 1033 */}
      <div className="flex flex-col items-center gap-[40px] max-[375px]:gap-[24px] lg:gap-[32px] 3xl:gap-[80px] w-full max-w-[1161px] 3xl:max-w-[1800px] mx-auto">
        
        {/* Frame 1016 */}          <div className="flex flex-col items-center gap-[40px] lg:gap-[24px] 3xl:gap-[56px] w-full">
          
          {/* Section Title */}
          <div className="flex flex-col items-center gap-[8px] 3xl:gap-[12px] max-w-[1034px] 3xl:max-w-[1400px]">
            <span className="font-['Rubik_One'] font-normal text-[22px] max-[375px]:text-[18px] max-[320px]:text-[16px] md:text-[28px] lg:text-[28px] xl:text-[36px] 3xl:text-[48px] leading-tight text-[#000000] m-0">
              {t('What does', 'Que Fait')}
            </span>
            <h2 className="font-['Rubik_One'] font-normal text-[28px] max-[375px]:text-[24px] max-[320px]:text-[20px] md:text-[50px] lg:text-[50px] xl:text-[70px] 3xl:text-[90px] leading-tight text-[#174CD2] m-0 text-center">
              EazyPost
            </h2>
          </div>

          {/* Frame 997 - Cards Container */}
          <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-[24px] max-[375px]:gap-[16px] max-[540px]:gap-[16px] lg:gap-[20px] xl:gap-[24px] 3xl:gap-[56px] w-full mt-4">
            
            {cards.map((card, index) => {
              return (
              <div key={index} className="flex flex-col items-center w-full md:w-[calc(50%-16px)] lg:w-auto lg:flex-1 lg:min-w-[200px] xl:min-w-[250px] 3xl:min-w-[320px] max-w-[371px] max-[375px]:max-w-[280px] 3xl:max-w-[480px] relative">
                {/* Icon Wrapper (Ellipse 5) */}
                <div className="relative w-[60px] h-[60px] max-[375px]:w-[44px] max-[375px]:h-[44px] max-[320px]:w-[38px] max-[320px]:h-[38px] md:w-[71px] md:h-[71px] 3xl:w-[92px] 3xl:h-[92px] -mb-[30px] max-[375px]:-mb-[22px] md:-mb-[35px] 3xl:-mb-[46px] z-10 flex items-center justify-center bg-[#174CD2] rounded-full shadow-[0px_7.18546px_28.7418px_rgba(54,61,136,0.06)]">
                  <object type="image/svg+xml" data={card.iconPath} className="w-[34px] h-[34px] max-[375px]:w-[24px] max-[375px]:h-[24px] max-[320px]:w-[20px] max-[320px]:h-[20px] md:w-[40px] md:h-[40px] 3xl:w-[52px] 3xl:h-[52px] object-contain"></object>
                </div>
                
                {/* Card Box (Frame 991) */}
                <div className="flex flex-col items-center pt-[56px] max-[375px]:pt-[40px] max-[320px]:pt-[34px] md:pt-[60px] lg:pt-[50px] 3xl:pt-[90px] pb-[32px] max-[375px]:pb-[20px] max-[320px]:pb-[16px] md:pb-[30px] lg:pb-[30px] 3xl:pb-[56px] px-[16px] max-[375px]:px-[10px] max-[320px]:px-[8px] md:px-[20px] lg:px-[20px] xl:px-[32px] 3xl:px-[40px] gap-[10px] 3xl:gap-[14px] w-full bg-white shadow-[2px_4px_38px_rgba(0,0,0,0.08)] rounded-[16px] 3xl:rounded-[20px] z-0 h-auto min-h-[240px] max-[375px]:min-h-[170px] max-[320px]:min-h-[150px] md:min-h-[220px] lg:min-h-[220px] xl:min-h-[273px] 3xl:min-h-[340px]">
                  <div className="flex flex-col items-center gap-[12px] max-[375px]:gap-[6px] max-[320px]:gap-[4px] lg:gap-[8px] 3xl:gap-[20px]">
                    <h3 className="font-['Rubik',_sans-serif] font-semibold text-[20px] max-[375px]:text-[15px] max-[320px]:text-[13px] md:text-[20px] lg:text-[18px] xl:text-[22px] 3xl:text-[28px] leading-[26px] max-[375px]:leading-[20px] max-[320px]:leading-[18px] md:leading-[24px] lg:leading-[24px] xl:leading-[28px] 3xl:leading-[36px] text-center text-[#000000] m-0">
                      {card.title}
                    </h3>
                    <p className="font-['Rubik',_sans-serif] font-normal text-[14px] max-[375px]:text-[11px] max-[320px]:text-[10px] md:text-[14px] lg:text-[13px] xl:text-[15px] 3xl:text-[20px] leading-[1.7] max-[375px]:leading-[1.4] max-[320px]:leading-[1.3] text-center text-[#071210] m-0">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            )})}
            
          </div>

        </div>

        {/* Frame 973 - Button */}
        <button className="flex flex-row items-center justify-center px-[28px] max-[375px]:px-[20px] lg:px-[28px] xl:px-[43px] 3xl:px-[56px] py-[12px] max-[375px]:py-[10px] lg:py-[10px] xl:py-[15px] 3xl:py-[20px] bg-[#174CD2] rounded-[8px] 3xl:rounded-[12px] border-none cursor-pointer shadow-md hover:bg-[#123bb0] transition-colors">
          <span className="font-['Rubik',_sans-serif] font-semibold text-[14px] max-[375px]:text-[13px] lg:text-[16px] xl:text-[16px] 3xl:text-[20px] leading-[22px] max-[375px]:leading-[20px] lg:leading-[24px] xl:leading-[24px] 3xl:leading-[30px] text-[#FFFFFF]">
            {t('Learn more', 'En savoir plus')}
          </span>
        </button>

      </div>
    </section>
  );
}
