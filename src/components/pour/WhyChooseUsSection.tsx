'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

import feature1Animation from '../../../public/assets/icons/feature-1.json';
import feature2Animation from '../../../public/assets/icons/feature-2.json';
import feature3Animation from '../../../public/assets/icons/feature-3.json';

export default function WhyChooseUsSection({ hideBackground = false }: { hideBackground?: boolean }) {
  const features = [
    {
      title: "Visibilité accrue",
      description: "Plus de régularité dans les posts, donc plus de visibilité et d’abonnés qualifiés.",
      animationData: feature1Animation
    },
    {
      title: "Gain de temps précieux",
      description: "Gain de plusieurs heures par semaine en automatisant la publication et la gestion des messages",
      animationData: feature2Animation
    },
    {
      title: "Image professionnelle",
      description: "Image plus professionnelle, plus attractive pour les marques et partenaires.",
      animationData: feature3Animation
    }
  ];
  return (
    <section className="w-full bg-transparent relative pt-[120px] pb-[60px] md:pt-[160px] md:pb-[100px] flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden">
      
      {/* Decorative SVG - Top Left */}
      <div className="absolute top-0 left-0 z-0 pointer-events-none opacity-40 md:opacity-100">
        <svg width="130" height="246" viewBox="0 0 130 246" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M41.4179 206.384C29.0813 212.806 14.1357 206.004 0.46176 208.545C-22.4227 212.797 -45.3615 237.384 -65.8371 226.314C-84.5202 216.214 -82.4932 186.278 -79.6616 165.229C-77.2342 147.186 -61.8219 134.516 -51.4727 119.537C-45.0373 110.223 -34.4051 104.288 -30.2725 93.7486C-23.2393 75.8113 -32.252 52.3983 -19.4885 37.9655C-6.91738 23.7503 15.7548 15.6207 33.8965 21.1872C52.3478 26.8488 57.1772 50.7475 69.7874 65.3587C80.1584 77.3753 100.42 83.8406 101.629 99.6676C102.917 116.525 82.9723 126.982 75.6587 142.224C70.689 152.582 71.0855 164.462 65.6767 174.597C59.2924 186.56 53.4456 200.123 41.4179 206.384Z" fill="#174CD2"/>
          <mask id="mask0_2001_72350" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="-82" y="19" width="184" height="211">
          <path fillRule="evenodd" clipRule="evenodd" d="M41.4179 206.384C29.0813 212.806 14.1357 206.004 0.46176 208.545C-22.4227 212.797 -45.3615 237.384 -65.8371 226.314C-84.5202 216.214 -82.4932 186.278 -79.6616 165.229C-77.2342 147.186 -61.8219 134.516 -51.4727 119.537C-45.0373 110.223 -34.4051 104.288 -30.2725 93.7486C-23.2393 75.8113 -32.252 52.3983 -19.4885 37.9655C-6.91738 23.7503 15.7548 15.6207 33.8965 21.1872C52.3478 26.8488 57.1772 50.7475 69.7874 65.3587C80.1584 77.3753 100.42 83.8406 101.629 99.6676C102.917 116.525 82.9723 126.982 75.6587 142.224C70.689 152.582 71.0855 164.462 65.6767 174.597C59.2924 186.56 53.4456 200.123 41.4179 206.384Z" fill="#C4C4C4"/>
          </mask>
          <g mask="url(#mask0_2001_72350)">
          <path fillRule="evenodd" clipRule="evenodd" d="M25.0934 198.744C12.7549 205.166 -2.19129 198.367 -15.8668 200.909C-38.7538 205.164 -61.6978 229.748 -82.1739 218.683C-100.857 208.587 -98.8267 178.657 -95.9922 157.612C-93.5625 139.572 -78.1472 126.902 -67.7952 111.926C-61.358 102.613 -50.7241 96.6779 -46.5899 86.1398C-39.5538 68.2052 -48.5645 44.798 -35.7981 30.3666C-23.2241 16.1526 -0.548833 8.02192 17.5938 13.5851C36.0462 19.2433 40.8731 43.1367 53.4827 57.7434C63.8532 69.7563 84.116 76.2179 85.3231 92.0416C86.6088 108.895 66.6613 119.352 59.3452 134.593C54.3738 144.949 54.7689 156.827 49.3583 166.961C42.972 178.922 37.123 192.483 25.0934 198.744Z" stroke="#D0E2FF" strokeWidth="4.30886"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M1.46006 176.84C-9.28102 182.431 -22.2919 176.513 -34.1967 178.726C-54.1205 182.429 -74.0941 203.83 -91.9188 194.199C-108.183 185.411 -106.415 159.357 -103.947 141.037C-101.832 125.334 -88.412 114.305 -79.4001 101.268C-73.7962 93.1613 -64.5391 87.9946 -60.9399 78.8214C-54.8146 63.2095 -62.6583 42.8341 -51.5446 30.2716C-40.5984 17.8984 -20.8589 10.8204 -5.06541 15.6628C10.9977 20.5878 15.1992 41.3864 26.1759 54.1011C35.2034 64.558 52.8426 70.1823 53.8931 83.9566C55.0121 98.6275 37.6472 107.731 31.278 120.997C26.9502 130.012 27.2939 140.352 22.5837 149.173C17.0241 159.585 11.9322 171.39 1.46006 176.84Z" stroke="#D0E2FF" strokeWidth="4.30886"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M-25.2397 160.553C-34.7815 165.523 -46.3483 160.245 -56.9266 162.207C-74.6304 165.491 -92.3663 184.532 -108.214 175.944C-122.674 168.109 -121.12 144.913 -118.94 128.604C-117.07 114.624 -105.152 104.814 -97.1518 93.2126C-92.1772 85.9986 -83.9539 81.4049 -80.7616 73.24C-75.3287 59.3442 -82.3133 41.1978 -72.4451 30.0204C-62.7257 19.0115 -45.188 12.7231 -31.149 17.0453C-16.8704 21.4412 -13.1222 39.962 -3.35856 51.29C4.67133 60.6064 20.3511 65.626 21.2942 77.8905C22.2986 90.9534 6.87262 99.0464 1.22142 110.854C-2.6186 118.877 -2.30604 128.083 -6.48598 135.934C-11.4197 145.201 -15.9368 155.707 -25.2397 160.553Z" stroke="#D0E2FF" strokeWidth="4.30886"/>
          </g>
        </svg>
      </div>
      
      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[52px] xl:px-[100px] flex flex-col lg:flex-row items-center lg:items-center gap-[60px] lg:gap-[100px] z-10 relative">
        
        {/* Left: Image Container */}
        <div className="relative w-full max-w-[500px] lg:max-w-[650px] h-[500px] md:h-[600px] flex-shrink-0 mx-auto lg:mx-0">
          
          {/* Light Gradient 10 - Restrained to Image Area and Primary Blue */}
          {!hideBackground && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              {/* Ellipse 20 */}
              <div className="absolute w-[200px] h-[200px] -left-[62px] top-[140px] bg-[#00D2FF] blur-[150px] opacity-60"></div>
              {/* Ellipse 21 */}
              <div className="absolute w-[300px] h-[300px] left-[113px] top-[178px] bg-[#174CD2] blur-[150px] opacity-60"></div>
              {/* Vector 8 */}
              <div className="absolute w-[350px] h-[450px] -left-[92px] top-[73px] bg-[#040028] blur-[200px] opacity-60"></div>
            </div>
          )}

          {/* Dark Blue Background Box */}
          <div className="absolute w-[90%] md:w-[600px] h-[400px] md:h-[500px] left-0 md:left-[38px] top-[80px] bg-[#040028] rounded-[20px] rounded-br-[100px] z-0"></div>
          
          {/* Main Image */}
          <img 
            src="/assets/magnific_swEz1K6l8e.png"
            alt="Créateur utilisant l'application EazyPost"
            className="absolute w-[85%] md:w-[480px] h-[480px] md:h-[580px] left-0 md:left-[38px] top-0 object-cover object-center rounded-t-[20px] z-10" 
          />
          
        </div>

        {/* Right: Content */}
        <div className="w-full flex flex-col items-start flex-1 gap-[24px] lg:gap-[32px] pb-[60px]">
          {/* Main Title */}
          <h2 className="text-[#174CD2] text-[32px] md:text-[40px] lg:text-[48px] leading-tight font-['Rubik_One'] font-normal">
            Reprenez le contrôle de vos réseaux sociaux
          </h2>
          
          {/* Paragraph */}
          <p className="text-[#000000] text-[16px] md:text-[18px] font-normal leading-[26px] md:leading-[30px] font-['Rubik'] max-w-[500px]">
            Libérez-vous des tâches chronophages. EazyPost vous permet de planifier, centraliser et optimiser votre présence en ligne pour vous concentrer sur la création.
          </p>

          {/* List Items */}
          <div className="flex flex-col gap-[30px] w-full mt-[8px]">
            {features.map((feature, index) => {
              return (
                <div key={index} className="flex flex-row items-center gap-[24px] md:gap-[32px]">
                  {/* Icon */}
                  <div className="w-[64px] h-[64px] flex items-center justify-center shrink-0">
                    <Lottie animationData={feature.animationData} loop={true} autoplay={true} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex flex-col gap-[8px]">
                    <h3 className="font-['Rubik'] font-bold text-[16px] md:text-[18px] leading-[26px] text-[#000000]">
                      {feature.title}
                    </h3>
                    <p className="font-['Rubik'] font-normal text-[14px] leading-[20px] text-[#555C60] max-w-[320px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
