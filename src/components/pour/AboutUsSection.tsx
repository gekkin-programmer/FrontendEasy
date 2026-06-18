import React from 'react';

export default function AboutUsSection({ hideBackground = false }: { hideBackground?: boolean }) {
  const cards = [
    {
      title: "Centralisation",
      description: "Centralise tous tes réseaux sociaux dans un seul tableau de bord simple à utiliser.",
      iconPath: "/assets/icons/about-centralisation.svg"
    },
    {
      title: "Planification",
      description: "Planifier tes contenus à l’avance pour rester cohérent, même quand tu es occupé ou sans connexion stable.",
      iconPath: "/assets/icons/about-planification.svg"
    },
    {
      title: "Assistant IA",
      description: "Générer des idées de posts, légendes et hashtags adaptés à ton audience grâce à l’IA.",
      iconPath: "/assets/icons/about-ia.svg"
    },
    {
      title: "Statistiques",
      description: "Suivre tes activités (vues, interactions, abonnés) pour améliorer ton contenu à chaque publication.",
      iconPath: "/assets/icons/about-stats.svg"
    }
  ];

  return (
    <section className="w-full flex flex-col items-center pt-[140px] md:pt-[200px] pb-[80px] px-4 bg-transparent relative snap-start min-h-[100dvh] justify-center overflow-hidden">
      
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
          <div className="absolute w-[500px] md:w-[704px] h-[500px] md:h-[704px] right-[-10%] md:right-[-20%] top-[30%] md:top-[328px] bg-[#174CD2] blur-[150px] md:blur-[200px] opacity-40 rounded-full"></div>
        </div>
      )}

      {/* Frame 1033 */}
      <div className="flex flex-col items-center gap-[60px] w-full max-w-[1161px] mx-auto">
        
        {/* Frame 1016 */}
        <div className="flex flex-col items-center gap-[40px] w-full">
          
          {/* Section Title */}
          <div className="flex flex-col items-center gap-[8px] max-w-[1034px]">
            <span className="font-['Rubik_One'] font-normal text-[24px] md:text-[36px] leading-tight text-[#000000] m-0">
              Que Fait 
            </span>
            <h2 className="font-['Rubik_One'] font-normal text-[32px] md:text-[70px] leading-tight text-[#174CD2] m-0 text-center">
              EazyPost
            </h2>
          </div>

          {/* Frame 997 - Cards Container */}
          <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-[32px] lg:gap-[40px] w-full mt-4">
            
            {cards.map((card, index) => {
              return (
              <div key={index} className="flex flex-col items-center w-full md:w-[calc(50%-12px)] lg:w-auto lg:flex-1 lg:min-w-[250px] max-w-[371px] relative">
                {/* Icon Wrapper (Ellipse 5) */}
                <div className="relative w-[71px] h-[71px] -mb-[35px] z-10 flex items-center justify-center bg-[#174CD2] rounded-full shadow-[0px_7.18546px_28.7418px_rgba(54,61,136,0.06)]">
                  <object type="image/svg+xml" data={card.iconPath} className="w-[40px] h-[40px] object-contain"></object>
                </div>
                
                {/* Card Box (Frame 991) */}
                <div className="flex flex-col items-center pt-[70px] pb-[40px] px-[20px] lg:px-[32px] gap-[10px] w-full bg-white shadow-[2px_4px_38px_rgba(0,0,0,0.08)] rounded-[16px] z-0 h-auto min-h-[273px]">
                  <div className="flex flex-col items-center gap-[15px]">
                    <h3 className="font-['Rubik',_sans-serif] font-semibold text-[22px] leading-[28px] text-center text-[#000000] m-0">
                      {card.title}
                    </h3>
                    <p className="font-['Rubik',_sans-serif] font-normal text-[15px] leading-[1.8] text-center text-[#071210] m-0">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            )})}
            
          </div>

        </div>

        {/* Frame 973 - Button */}
        <button className="flex flex-row items-center justify-center px-[43px] py-[15px] bg-[#174CD2] rounded-[8px] border-none cursor-pointer shadow-md hover:bg-[#123bb0] transition-colors">
          <span className="font-['Rubik',_sans-serif] font-semibold text-[16px] leading-[24px] text-[#FFFFFF]">
            En savoir plus
          </span>
        </button>

      </div>
    </section>
  );
}
