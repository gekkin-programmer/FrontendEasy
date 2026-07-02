'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CareerHeroLayout({ 
  heroImage = "/assets/magnific__background__70466.png",
  titleNode,
  subtitle,
  hideBackground = false
}: { 
  heroImage?: string;
  titleNode?: React.ReactNode;
  subtitle?: string;
  hideBackground?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <section className="w-full relative bg-transparent overflow-hidden flex justify-center items-start xl:min-h-[calc(100vh-172px)]">
      
     

      {/* Decorative SVG - Bottom Right */}
      <div className="absolute bottom-0 right-0 lg:top-[210px] lg:bottom-auto z-0 opacity-40 md:opacity-100 lg:opacity-40 pointer-events-none hidden md:block">
        <svg className="w-[300px] md:w-[450px] lg:w-[450px] xl:w-[650px] h-auto" viewBox="0 0 324 308" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M9.64467 170.231C2.432 148.26 -7.04332 120.571 10.3771 101.044C18.8151 91.5847 30.6842 86.2967 42.1715 82.3449C50.3986 79.5128 63.4618 78.6791 68.5058 69.9721C72.2104 63.5644 72.7234 54.7249 76.0747 47.8598C80.6799 38.4213 87.656 30.6472 95.8404 24.5616C117.162 8.70349 144.933 2.57573 170.258 0.821068C225.286 -2.98621 281.278 27.3366 310.724 77.2254C319.504 92.0964 330.838 107.924 316.649 123.117C301.158 139.692 277.821 147.457 259.332 159.234C252.268 163.73 243.265 169.136 239.324 177.277C236.953 182.171 236.791 188.311 236.683 193.698C236.398 207.419 235.318 219.759 230.088 232.562C222.012 252.348 209.134 270.602 194.541 285.554C181.814 298.592 163.664 313.915 145.181 304.515C131.009 297.292 122.021 281.961 111.01 270.659C98.7557 258.073 83.6008 249.591 66.9584 245.447C50.7691 241.426 33.0125 238.714 24.4804 221.631C21.5537 215.771 18.4959 208.184 17.3988 201.698C15.6276 191.004 13.0343 180.48 9.64467 170.231Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M21.3884 170.386C18.0516 148.2 17.6808 125.067 33.184 107.581C40.4194 99.4233 49.5656 93.6279 58.8145 88.377C65.6192 84.5134 72.6465 81.2546 77.7286 74.9205C82.4372 69.0558 86.0164 62.2463 90.5624 56.2281C96.5591 48.2528 103.734 41.3488 111.812 35.7815C132.061 21.8526 156.693 15.3379 180.259 13.0781C191.667 11.9798 204.041 11.4081 215.372 14.4021C226.315 17.2908 237.135 21.8586 247.197 27.1846C268.587 38.4957 287.124 55.0606 300.563 76.0037C309.777 90.369 314.76 104.337 302.827 118.91C289.375 135.337 268.282 144.4 250.896 155.061C238.972 162.373 225.608 169.541 223.38 185.08C221.607 197.444 220.166 209.179 215.578 220.866C208.748 238.105 198.706 253.721 186.048 266.788C174.472 278.692 159.828 288.793 143.269 282.435C130.15 277.389 119.972 266.084 108.51 258.001C95.7358 248.974 81.7014 243.997 66.9226 239.995C53.6411 236.384 41.1352 230.835 32.5509 219.055C30.7941 216.648 28.9489 214.027 27.5942 211.334C25.8659 207.897 26 204.491 25.6606 200.639C24.7765 190.475 22.8971 180.427 21.3884 170.386Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M34.3372 168.573C34.6223 147.5 39.4256 127.584 52.5812 111.161C58.2055 104.135 64.9216 98.3486 71.1102 91.9109C76.0931 86.7209 80.8024 81.8987 86.5321 77.6219C100.124 67.4952 111.17 54.3907 125.614 45.3731C144.896 33.3174 166.982 26.6537 188.898 23.9894C199.599 22.6873 210.654 22.2322 221.48 23.703C230.779 24.9659 239.685 29.3993 247.946 33.9353C264.137 42.8203 279.858 55.4486 290.371 71.4253C313.55 106.649 267.852 132.258 244.397 147.255C233.61 154.154 217.128 162.144 212.709 175.809C209.551 185.571 207.626 195.499 203.559 204.96C192.632 230.367 170.452 260.25 140.893 256.272C128.245 254.572 116.717 247.667 104.91 243.032C92.7522 238.257 80.2037 235.596 67.5669 232.676C55.7568 229.948 46.344 226.066 38.7158 215.659C35.0698 210.689 35.392 204.74 35.067 198.643C34.5368 188.627 34.209 178.555 34.3372 168.573Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M46.1278 165.874C50.8765 134.065 68.5129 99.3398 94.4452 80.8672C124.949 59.1374 157.996 40.8393 194.442 35.579C211.339 33.1398 229.849 31.9398 245.793 39.9159C257.927 45.9822 272.022 55.0501 278.7 67.8022C295.038 98.9939 258.698 123.825 237.994 138.255C226.847 146.024 212.658 153.594 204.256 164.938C199.382 171.516 196.893 180.217 192.958 187.441C181.032 209.333 161.401 226.991 136.947 230.149C125.64 231.607 114.251 229.803 103.029 228.368C91.5429 226.9 79.9137 226.103 68.4986 224.055C59.3864 222.419 48.6476 219.649 45.2916 209.36C41.0594 196.395 44.1901 178.863 46.1278 165.874Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M57.6901 160.764C64.6158 130.859 79.2813 101.688 103.935 83.8355C117.009 74.3688 132.186 67.8339 146.758 61.3773C163.274 54.0598 180.531 48.3798 198.157 45.5624C220.102 42.0526 255.645 38.889 267.11 65.2724C278.49 91.46 249.733 114.638 232.728 127.846C221.825 136.307 210.157 144.073 199.74 153.323C194.091 158.338 189.74 164.132 184.96 170.014C171.749 186.31 152.915 199.212 133.718 206.099C115.112 212.775 92.0954 215.731 72.4556 213.525C63.9815 212.576 57.9244 209.377 55.3616 200.28C51.8102 187.635 54.8273 173.117 57.6901 160.764Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M69.179 152.709C76.0591 126.379 90.8989 102.33 112.545 86.527C136.809 68.8116 168.052 58.9677 196.769 53.9618C212.033 51.303 245.112 44.0939 252.892 64.7259C260.672 85.3579 238.18 105.69 225.235 116.883C209.524 130.447 192.584 143.543 175.665 155.713C160.964 166.294 145.278 177.112 129.356 185.284C120.376 189.919 111.021 193.704 101.403 196.593C94.2806 198.716 85.2239 201.881 77.757 200.301C58.923 196.312 65.8886 165.299 69.179 152.709Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M83.3601 144.825C98.4557 95.0311 146.283 70.5416 192.333 62.0056C203.034 60.0242 233.032 52.8803 239.013 68.0912C244.809 82.839 226.375 100.329 217.745 108.615C191.003 134.292 157.964 153.331 126.656 172.192C116.884 178.079 99.259 190.854 87.1369 184.961C73.9752 178.551 80.2328 155.15 83.3601 144.825Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M98.8231 135.241C111.951 98.5713 150.135 77.5401 185.241 70.6068C193.839 68.9104 215.677 63.6285 222.19 73.8614C228.217 83.3273 213.834 97.0433 208.453 102.494C196.474 114.631 182.277 124.629 168.252 134.239C155.284 143.13 142.176 152.244 128.531 159.764C121.344 163.723 107.865 172.169 99.6976 166.057C90.9046 159.481 95.9084 143.383 98.8231 135.241Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M115.863 124.527C125.868 100.581 152.667 85.0307 176.306 79.8634C182.667 78.476 196.415 74.8767 201.781 81.2719C206.721 87.1615 198.759 95.7957 195.226 99.7833C179.565 117.458 156.632 133.246 135.62 142.943C130.337 145.38 120.84 150.165 115.405 145.245C109.83 140.192 113.564 130.026 115.863 124.527Z" stroke="#040028"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M133.938 114.468C139.576 102.577 154.312 93.6061 166.519 90.7503C175.11 88.7422 185.436 90.4769 177.949 100.828C170.512 111.099 156.711 120.481 145.015 124.64C136.091 127.811 129.097 124.682 133.938 114.468Z" stroke="#040028"/>
        </svg>
      </div>

      {/* Main Container - Frame 1053 */}
      <div className="w-full max-w-[1440px] 3xl:max-w-[2200px] flex flex-col lg:flex-row items-center lg:items-center gap-[40px] max-[375px]:gap-[24px] max-[540px]:gap-[24px] lg:gap-[40px] xl:gap-[73px] 3xl:gap-[100px] px-3 max-[375px]:px-2 md:px-[40px] lg:px-[40px] xl:pl-[15px] 3xl:px-[120px] pt-[80px] max-[375px]:pt-[76px] max-[540px]:pt-[48px] md:pt-[100px] lg:pt-[100px] xl:pt-[140px] 3xl:pt-[180px] z-10 relative lg:h-full">
        
        {/* Left Column - Frame 987 */}
        <div className="flex flex-col items-start gap-[16px] lg:gap-[16px] xl:gap-[24px] 3xl:gap-[32px] w-full lg:w-[420px] xl:w-[579px] 3xl:w-[750px] z-10">
          
          <div className="flex flex-col items-start gap-[10px] w-full">
            <div className="flex flex-col items-start w-full gap-[10px]">
              {titleNode ? titleNode : (
                <h1 className="flex flex-col font-['Rubik_One'] font-normal m-0 w-full gap-[2px] md:gap-[4px] lg:gap-[4px] xl:gap-[8px] 3xl:gap-[12px]">
                  <span className="text-[#000000] text-[18px] max-[375px]:text-[16px] max-[320px]:text-[14px] md:text-[28px] lg:text-[28px] xl:text-[36px] 3xl:text-[48px] leading-tight">
                    {t('EazyPost for', 'EazyPost pour les')}
                  </span>
                  <span className="text-[#174CD2] text-[28px] max-[375px]:text-[24px] max-[320px]:text-[20px] md:text-[56px] lg:text-[50px] xl:text-[70px] 3xl:text-[90px] leading-[1.1] capitalize">
                    {t('creators', 'créateurs')}
                  </span>
                  
                  <div className="flex flex-row items-baseline gap-[8px] md:gap-[16px] lg:gap-[12px] xl:gap-[16px] 3xl:gap-[24px]">
                    <span className="text-[#000000] text-[18px] max-[375px]:text-[16px] max-[320px]:text-[14px] md:text-[28px] lg:text-[28px] xl:text-[36px] 3xl:text-[48px] leading-tight">{t('of', 'de')}</span>
                    <span className="text-[#174CD2] text-[28px] max-[375px]:text-[24px] max-[320px]:text-[20px] md:text-[56px] lg:text-[50px] xl:text-[70px] 3xl:text-[90px] leading-[1.1] capitalize">{t('content', 'contenus')}</span>
                  </div>
                  
                  <div className="flex flex-row items-baseline gap-[8px] md:gap-[16px] lg:gap-[12px] xl:gap-[16px] 3xl:gap-[24px]">
                    <span className="text-[#000000] text-[18px] max-[375px]:text-[16px] max-[320px]:text-[14px] md:text-[28px] lg:text-[28px] xl:text-[36px] 3xl:text-[48px] leading-tight">{t('and', 'et')}</span>
                    <span className="text-[#174CD2] text-[28px] max-[375px]:text-[24px] max-[320px]:text-[20px] md:text-[56px] lg:text-[50px] xl:text-[70px] 3xl:text-[90px] leading-[1.1] capitalize">{t('Influencers', 'Influenceurs')}</span>
                  </div>
                </h1>
              )}
              <p className="text-[#000000] text-[13px] max-[375px]:text-[12px] max-[320px]:text-[11px] md:text-[20px] lg:text-[16px] xl:text-[20px] 3xl:text-[26px] font-normal leading-[20px] max-[375px]:leading-[18px] md:leading-[30px] lg:leading-[26px] xl:leading-[30px] 3xl:leading-[38px] font-['Rubik'] max-w-[650px] 3xl:max-w-[850px] m-0">
                {subtitle || t('Publish regularly, analyze your performance and professionalize your image, without spending your life on social media.', 'Publie régulièrement, analyse tes performances et professionnalise ton image, sans passer ta vie sur les réseaux.')}
              </p>
            </div>
          </div>

          {/* Action Buttons - Frame 986 (Desktop only) */}
          <div className="hidden lg:flex flex-row items-center justify-center gap-[16px] xl:gap-[24px] 3xl:gap-[32px] w-full">
            {/* Get Started Button */}
            <button className="flex flex-row items-center justify-center px-[24px] xl:px-[43px] 3xl:px-[56px] py-[12px] xl:py-[15px] 3xl:py-[20px] gap-[10px] w-auto h-[48px] xl:h-[54px] 3xl:h-[70px] bg-[#174CD2] rounded-[8px] 3xl:rounded-[12px] font-sans font-semibold text-[16px] xl:text-[16px] 3xl:text-[20px] leading-[24px] text-white shadow-md">
              {t('Start', 'Commencer')}
            </button>
          </div>
          
        </div>

        {/* Right Column (Images & Floating Cards) - Frame 989 */}
        <div className="relative w-full max-w-[650px] md:max-w-[100%] lg:max-w-[400px] xl:max-w-[800px] 3xl:max-w-[1050px] h-[260px] max-[375px]:h-[220px] max-[540px]:h-[200px] max-[320px]:h-[180px] sm:h-[400px] md:h-[500px] lg:h-[420px] xl:h-[740px] 3xl:h-[960px] mt-[12px] max-[375px]:mt-[8px] lg:mt-0 flex-shrink-0 mx-auto">
          
          {/* Yellow Background Box - Frame 988 */}
          <div className="absolute w-full md:w-[90%] lg:w-[360px] xl:w-[700px] 3xl:w-[900px] h-[220px] max-[375px]:h-[186px] max-[540px]:h-[170px] max-[320px]:h-[150px] sm:h-[340px] md:h-[440px] lg:h-[360px] xl:h-[640px] 3xl:h-[830px] left-1/2 -translate-x-1/2 md:left-[5%] md:translate-x-0 lg:left-[20px] xl:left-[38px] 3xl:left-[50px] top-[32px] max-[375px]:top-[28px] max-[320px]:top-[22px] md:top-[40px] lg:top-[20px] xl:top-[80px] 3xl:top-[100px] bg-[#040028] rounded-[20px] rounded-br-[100px] z-0"></div>
          
          {/* Main Image */}
          <div className="absolute w-[90%] sm:w-[320px] md:w-[85%] lg:w-[320px] xl:w-[680px] 3xl:w-[880px] h-[200px] max-[375px]:h-[170px] max-[540px]:h-[160px] max-[320px]:h-[138px] sm:h-[320px] md:h-[480px] lg:h-[380px] xl:h-[720px] 3xl:h-[930px] left-1/2 -translate-x-1/2 md:left-[10%] md:translate-x-0 lg:left-[40px] xl:left-[58px] 3xl:left-[75px] top-0 bg-cover bg-center rounded-[20px] rounded-br-[100px] z-10" style={{ backgroundImage: `url('${heroImage}')` }}></div>
          
          {/* Blur Shadow Effect under Main Image */}
          <div className="absolute w-[80px] max-[375px]:w-[60px] md:w-[173px] xl:w-[173px] 3xl:w-[225px] h-[50px] max-[375px]:h-[40px] md:h-[141px] xl:h-[141px] 3xl:h-[183px] left-0 top-[120px] max-[375px]:top-[100px] max-[320px]:top-[80px] lg:top-[160px] xl:top-[300px] 3xl:top-[390px] bg-[#000000] opacity-5 blur-[64.5px] rounded-[14px] z-0"></div>
          
        </div>
        
        {/* Mobile CTA Button (below image - outside fixed-height container) */}
        <div className="flex lg:hidden items-center justify-center w-full mt-[-12px] max-[375px]:mt-[-10px] sm:mt-[-30px] mb-2">
          <button className="flex flex-row items-center justify-center px-[24px] py-[10px] gap-[10px] w-auto min-w-[160px] h-[44px] bg-[#174CD2] rounded-[8px] font-sans font-semibold text-[15px] leading-[24px] text-white shadow-md">
            {t('hero_button', 'Commencer')}
          </button>
        </div>
      </div>
    </section>
  );
}
