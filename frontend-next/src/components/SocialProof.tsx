"use client";

import React from 'react';

const SocialProof = () => {
  const logos = [
    "/logos/newDelices.png",
    "/logos/dibato.PNG",
    "/logos/MaxBurger.jpeg",
    "/logos/SN_SHOES.jpeg",
    "/logos/LaGeneraleDuBatiment.png",
    "/logos/Denilimport.jpeg",
    "/logos/BookHub.jpeg",
    "/logos/dibato.PNG",
  ];

  // We define the track content here to reuse it easily without scope issues
  const LogoGroup = () => (
    <div className="flex items-center justify-around min-w-full shrink-0 animate-marquee gap-16 px-8">
      {logos.map((src, i) => (
        <div key={i} className="group relative flex items-center justify-center">
          <img 
            src={src} 
            alt={`Partner brand ${i}`} 
            className={`
              h-16 md:h-20 w-auto object-contain 
              /* FULL COLOR (No grayscale) */
              hover:scale-110
              transition-transform duration-300 ease-out
              ${/* Keeps white backgrounds transparent for JPEGs */ ''}
              ${src.toLowerCase().endsWith('.jpeg') || src.toLowerCase().endsWith('.jpg') ? 'mix-blend-multiply' : ''} 
            `} 
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="relative py-16 bg-white dark:bg-black/90 border-b-4 border-black dark:border-white/5 overflow-hidden select-none">
        
        {/* Background "Noise" Text */}
        <div className="absolute inset-0 flex items-center dark:opacity-0 justify-center pointer-events-none opacity-5 overflow-hidden">
            <h1 className="text-[20vw] font-black uppercase text-black whitespace-nowrap leading-none">
                EASY POST
            </h1>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                
                {/* Header Section */}
                <div className="md:w-1/4 text-center md:text-left z-20 bg-white md:bg-transparent dark:bg-white/5 p-2">
                    <h3 className="text-3xl font-black text-black dark:text-gray-200 uppercase leading-none">
                        TRUSTED<br/>
                        BY LOCAL<br/>
                        <span className="text-[#3C48F6]">BRANDS.</span>
                    </h3>
                </div>

                {/* Marquee Section */}
                <div className="md:w-3/4 w-full overflow-hidden relative mask-linear">
                    {/* The Wrapper holding TWO tracks */}
                    <div className="flex w-full">
                        <LogoGroup />
                        <LogoGroup />
                    </div>
                </div>

            </div>
        </div>

        {/* Global is generally safer for animations to ensure they persist across scopes */}
        <style jsx global>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
            
            .animate-marquee {
                animation: marquee 40s linear infinite;
            }

            .mask-linear {
                mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            }
        `}</style>
    </section>
  );
};

export default SocialProof;
