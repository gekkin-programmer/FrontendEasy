'use client';

import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import { useLanguage } from '../context/LanguageContext';

export default function ImpactSection() {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-white border-b-[4px] border-[#D9D9D9] rounded-t-[30px] min-h-[600px] flex items-center">
      <div className="max-w-[1435px] mx-auto w-full flex flex-col md:flex-row items-center justify-between py-[80px] px-[52px] gap-20">
        
        {/* Left Side: Titles */}
        <div className="flex flex-col relative flex-shrink-0">
          <h2 
            style={{ 
              fontFamily: "'Rubik One', 'Rubik Mono One', sans-serif", 
              fontWeight: 400, 
              fontSize: '36px', 
              lineHeight: '45px', 
              color: '#000000',
              position: 'relative',
              zIndex: 2
            }}
          >
            EazyPost
          </h2>
          <h1 
            style={{ 
              fontFamily: "'Rubik One', 'Rubik Mono One', sans-serif", 
              fontWeight: 400, 
              fontSize: '70px', 
              lineHeight: '87px', 
              color: '#174CD2',
              marginTop: '-20px',
              position: 'relative',
              zIndex: 1
            }}
          >
            Impact
          </h1>
        </div>

        {/* Right Side: Stats */}
        <div className="flex flex-row flex-wrap items-center justify-center md:justify-end gap-[120px] w-full">
          {/* Stat 1 */}
          <div className="flex flex-col items-center gap-[10px] w-[192px]">
            <img src="/engagement.svg" alt="Engagement Icon" style={{ width: '60px', height: '60px' }} />
            <div 
              style={{ 
                fontFamily: "'Rubik', sans-serif", 
                fontWeight: 800, 
                fontSize: '32px', 
                lineHeight: '38px', 
                color: '#000000', 
                textAlign: 'center' 
              }}
            >
              {t("Social Platforms", "Plateformes Sociales")}
            </div>
            <div 
              style={{ 
                fontFamily: "'Rubik', sans-serif", 
                fontWeight: 500, 
                fontSize: '36px', 
                lineHeight: '43px', 
                color: '#000000', 
                textAlign: 'center' 
              }}
            >
              <AnimatedCounter end={12} />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center gap-[10px] w-[192px]">
            <img src="/user.svg" alt="User Icon" style={{ width: '60px', height: '60px' }} />
            <div 
              style={{ 
                fontFamily: "'Rubik', sans-serif", 
                fontWeight: 800, 
                fontSize: '32px', 
                lineHeight: '38px', 
                color: '#000000', 
                textAlign: 'center' 
              }}
            >
              {t("Our users", "Nos utilisateurs")}
            </div>
            <div 
              style={{ 
                fontFamily: "'Rubik', sans-serif", 
                fontWeight: 500, 
                fontSize: '36px', 
                lineHeight: '43px', 
                color: '#000000', 
                textAlign: 'center' 
              }}
            >
              <AnimatedCounter end={123908} separator="," />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center gap-[10px] w-[192px]">
            <img src="/email.svg" alt="Email Icon" style={{ width: '60px', height: '60px' }} />
            <div 
              style={{ 
                fontFamily: "'Rubik', sans-serif", 
                fontWeight: 800, 
                fontSize: '32px', 
                lineHeight: '38px', 
                color: '#000000', 
                textAlign: 'center' 
              }}
            >
              {t("Posts per month", "Publications par mois")}
            </div>
            <div 
              style={{ 
                fontFamily: "'Rubik', sans-serif", 
                fontWeight: 500, 
                fontSize: '36px', 
                lineHeight: '43px', 
                color: '#000000', 
                textAlign: 'center' 
              }}
            >
              <AnimatedCounter end={156} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
