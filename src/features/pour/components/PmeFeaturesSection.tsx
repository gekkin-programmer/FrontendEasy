import React from 'react';
import { ArrowRight, BarChart2, TrendingUp, Search } from 'lucide-react';

export default function PmeFeaturesSection() {
  return (
    <section className="relative w-full py-[100px] max-[540px]:py-[40px] md:py-[150px] flex justify-center bg-white overflow-hidden">
      <div className="relative w-full max-w-[1296px] px-6 flex flex-col gap-[150px] max-[540px]:gap-[60px] z-10">
        
        {/* Header Content */}
        <div className="flex flex-col gap-6 max-w-[636px]">
          <h2 className="font-['Rubik_One',_sans-serif] font-normal text-[36px] max-[540px]:text-[24px] md:text-[48px] leading-[1.2] text-[#12141D]">
            Leur réalité aujourd’hui
          </h2>
          <p className="font-['Inter',_sans-serif] text-[16px] md:text-[18px] leading-[1.6] text-[#12141D] opacity-70">
            Les agences social media africaines et internationales gèrent plusieurs clients, chacun avec plusieurs comptes. Entre les validations, les reporting manuels et le suivi des messages, les équipes perdent énormément de temps, et augmentent les risques d’erreurs.
          </p>
        </div>

        {/* Block 2: Bring your target users */}
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-[60px] max-[540px]:gap-[32px] lg:gap-[40px]">
          <div className="flex-1 flex flex-col gap-[40px] max-[540px]:gap-[20px] max-w-[636px]">
            <h2 className="font-['Clash_Display',_'Rubik_One',_sans-serif] font-normal text-[32px] max-[540px]:text-[22px] md:text-[48px] leading-[1.2]">
              Bring your target users together on social media
            </h2>
            <p className="font-['Inter',_sans-serif] text-[16px] md:text-[18px] leading-[1.6] opacity-70">
              Social media audience research isn’t complicated. It’s mainly about narrowing your focus while expanding your reach. We’ve created a free social media audience research template to help you keep track of all the information you learn as you conduct your research.
            </p>
          </div>
          
          <div className="flex-1 relative w-full flex justify-center lg:justify-start h-[450px] max-[540px]:h-[300px]">
            <div className="relative transform origin-center lg:origin-left scale-[0.65] md:scale-[0.85] lg:scale-100" style={{ width: 545.36, height: 419 }}>
              
              {/* bg */}
              <div className="absolute left-0 top-[19px] bg-[#174CD2] rounded-[10px]" style={{ width: 526, height: 400 }}></div>

              {/* elements */}
              <div className="absolute left-[85px] top-[41px]" style={{ width: 357, height: 357 }}>
                {/* shape 357 */}
                <div className="absolute left-0 top-0 box-border border-[#FFFFFF] rounded-full" style={{ width: 357, height: 357, borderWidth: 3.06 }}></div>
                {/* shape 255 */}
                <div className="absolute left-[51px] top-[51px] box-border border-[#FFFFFF] rounded-full" style={{ width: 255, height: 255, borderWidth: 3.06 }}></div>

                {/* +40% Increase in sales box (now empty circular) */}
                <div className="absolute left-[107.37px] top-[107.37px] box-border bg-[#FFFFFF] border-[#12141D] flex items-center justify-center text-center p-4 rounded-full" style={{ width: 143.16, height: 143.16, borderWidth: 2.68 }}>
                </div>
              </div>

              {/* Mask Groups (Avatars) */}
              <div className="absolute bg-[#C4C4C4] rounded-full overflow-hidden" style={{ width: 53.68, height: 53.68, left: 359.69, top: 72.32 }}>
                <img src="/assets/magnific_l7uVXlugv9.png" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bg-[#C4C4C4] rounded-full overflow-hidden" style={{ width: 44.74, height: 44.74, left: 130.63, top: 152.84 }}>
                <img src="/assets/magnific_l7uVXlugv9.png" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bg-[#C4C4C4] rounded-full overflow-hidden" style={{ width: 44.74, height: 44.74, left: 349.84, top: 253.05 }}>
                <img src="/assets/magnific_l7uVXlugv9.png" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bg-[#C4C4C4] rounded-full overflow-hidden" style={{ width: 53.68, height: 53.68, left: 85, top: 289.73 }}>
                <img src="/assets/magnific_l7uVXlugv9.png" className="w-full h-full object-cover" />
              </div>

              {/* Layer 2 Vectors (Social Icons replacing colored blocks) */}
              {/* LinkedIn Icon */}
              <div className="absolute bg-[#12141D]" style={{ left: 238.29, top: 325.96, width: 36.55, height: 35.35 }}></div>
              <div className="absolute" style={{ left: 237.11, top: 324.63, width: 35.67, height: 34.46 }}>
                 <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1027_1526)">
                    <path d="M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z" fill="#0A66C2"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1027_1526">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                 </svg>
              </div>
              
              {/* YouTube Icon */}
              <div className="absolute bg-[#12141D]" style={{ left: 112.55, top: 93.2, width: 37.23, height: 28.32 }}></div>
              <div className="absolute" style={{ left: 111.84, top: 92.0, width: 36.02, height: 27.2 }}>
                 <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1027_1533)">
                    <path d="M23.5216 6.18547C23.3859 5.67489 23.1185 5.20889 22.7462 4.83413C22.3738 4.45936 21.9095 4.18897 21.3998 4.05002C19.5234 3.54547 12.0234 3.54547 12.0234 3.54547C12.0234 3.54547 4.52344 3.54547 2.64707 4.05002C2.13737 4.18897 1.6731 4.45936 1.30073 4.83413C0.928354 5.20889 0.660943 5.67489 0.525256 6.18547C0.0234376 8.07002 0.0234375 12 0.0234375 12C0.0234375 12 0.0234376 15.93 0.525256 17.8146C0.660943 18.3251 0.928354 18.7911 1.30073 19.1659C1.6731 19.5407 2.13737 19.8111 2.64707 19.95C4.52344 20.4546 12.0234 20.4546 12.0234 20.4546C12.0234 20.4546 19.5234 20.4546 21.3998 19.95C21.9095 19.8111 22.3738 19.5407 22.7462 19.1659C23.1185 18.7911 23.3859 18.3251 23.5216 17.8146C24.0234 15.93 24.0234 12 24.0234 12C24.0234 12 24.0234 8.07002 23.5216 6.18547Z" fill="#FF0302"/>
                    <path d="M9.56934 15.5687V8.4314L15.8421 12L9.56934 15.5687Z" fill="#FEFEFE"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1027_1533">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                 </svg>
              </div>
              
              {/* Facebook Icon */}
              <div className="absolute bg-[#12141D]" style={{ left: 360.48, top: 157.02, width: 34.39, height: 31.61 }}></div>
              <div className="absolute" style={{ left: 359.69, top: 156.42, width: 33.39, height: 30.58 }}>
                 <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1027_1516)">
                    <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
                    <path d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.80102 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C11.3674 24.0486 12.6326 24.0486 13.875 23.8542V15.4688H16.6711Z" fill="white"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_1027_1516">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                 </svg>
              </div>

              {/* black vectors (squiggly SVG) */}
              <div className="absolute" style={{ left: 479, top: 0 }}>
                 <svg width="67" height="65" viewBox="0 0 67 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.91162 34.0359C7.97262 25.6559 7.83765 17.586 8.08465 9.08597C8.13265 7.42597 6.82864 6.04588 5.17364 5.99588C3.51764 5.94588 2.13561 7.25592 2.08661 8.91592C1.85261 16.9759 2.04163 24.6459 0.0856304 32.6059C-0.310369 34.2159 0.674652 35.8459 2.28265 36.2359C3.88965 36.6359 5.51662 35.6459 5.91162 34.0359Z" fill="#12141D"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.4234 50.2753C37.4054 37.4953 50.5794 21.0554 59.7874 4.45536C60.5904 3.00536 60.0674 1.17528 58.6194 0.375282C57.1714 -0.424717 55.3434 0.0953255 54.5404 1.54533C45.6364 17.5953 32.8954 33.4954 19.3754 45.8454C18.1534 46.9654 18.0684 48.8654 19.1854 50.0854C20.3024 51.3054 22.2014 51.3953 23.4234 50.2753Z" fill="#12141D"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M26.9647 64.2355C39.7527 66.3455 52.9337 62.7455 64.5617 57.6555C66.0787 56.9855 66.7707 55.2156 66.1077 53.7056C65.4437 52.1856 63.6727 51.4955 62.1557 52.1555C51.5657 56.7955 39.5887 60.2355 27.9417 58.3155C26.3077 58.0455 24.7627 59.1555 24.4937 60.7855C24.2237 62.4155 25.3317 63.9655 26.9647 64.2355Z" fill="#12141D"/>
                 </svg>
              </div>

            </div>
          </div>
        </div>

        {/* Block 3: Build your brand */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-[60px] max-[540px]:gap-[32px] lg:gap-[40px]">
          <div className="flex-1 flex flex-col gap-[40px] max-[540px]:gap-[20px] max-w-[636px]">
            <h2 className="font-['Clash_Display',_'Rubik_One',_sans-serif] font-normal text-[32px] max-[540px]:text-[22px] md:text-[48px] leading-[1.2]">
              Build your brand & reach out to social followers
            </h2>
            <p className="font-['Inter',_sans-serif] text-[16px] md:text-[18px] leading-[1.6] opacity-70">
              Brand awareness is cited as the top priority for marketers, and social media channels are a one-to-many solution for getting the word out about your products and services. By creating a strong brand presence on social media, you can reach a broader audience & get partners brand advocates to post content.
            </p>
          </div>

          <div className="flex-1 relative w-full flex justify-center lg:justify-end h-[450px] max-[540px]:h-[300px]">
            <div className="relative transform origin-center lg:origin-right scale-[0.65] md:scale-[0.85] lg:scale-100" style={{ width: 526, height: 400 }}>
               {/* bg */}
               <div className="absolute left-0 top-0 bg-[#FFACAC] rounded-[10px]" style={{ width: 526, height: 400 }}></div>
               <div className="absolute left-0 top-0 bg-[#86E7B8] rounded-[10px]" style={{ width: 526, height: 400 }}></div>

               {/* Black vector bar at bottom */}
               <div className="absolute bg-[#12141D]" style={{ left: 289, top: 320, width: 266.86, height: 36.78 }}></div>

               {/* Rotated shapes and outlines */}
               <div className="absolute rounded-full overflow-hidden" style={{ left: -87, top: -76, width: 318.54, height: 285, transform: 'rotate(180deg)' }}>
                  <div className="absolute left-0 top-0 bg-[#C4C4C4] w-full h-full"></div>
               </div>
               
               {/* Outline groups */}
               <div className="absolute" style={{ left: -119.6, top: -112.83, width: 331.6, height: 302.3, transform: 'rotate(180deg)' }}>
                  <div className="absolute box-border border-[#FFFFFF] rounded-full" style={{ left: 13, top: 17.36, width: 318.58, height: 284.93, borderWidth: 5.36 }}></div>
                  <div className="absolute box-border border-[#FFFFFF] rounded-full" style={{ left: 13, top: 10.31, width: 277.33, height: 248.03, borderWidth: 5.36 }}></div>
                  <div className="absolute box-border border-[#FFFFFF] rounded-full" style={{ left: 0, top: 0, width: 246.4, height: 220.89, borderWidth: 5.36 }}></div>
               </div>

               {/* Main image container */}
               <div className="absolute box-border bg-[#FFFFFF] border-[#12141D]" style={{ left: 163, top: 100, width: 200, height: 200, borderWidth: 2.68 }}></div>
               <div className="absolute box-border bg-[#FFFFFF] border-[#12141D] overflow-hidden flex items-center justify-center" style={{ left: 179.91, top: 120.09, width: 160.7, height: 160.7, borderWidth: 2.68 }}>
                  <img src="/assets/magnific_l7uVXlugv9.png" className="min-w-[241.92px] min-h-[174.67px] object-cover" />
               </div>

               {/* Badge: Post share-worthy content */}
               <div className="absolute bg-[#FFFFFF] border-[#12141D] rounded-[50px] flex items-center" style={{ left: 40, top: 320, width: 150, height: 40, borderWidth: 2 }}>
                  <div className="relative w-full h-full">
                     <div className="absolute bg-[#12141D]" style={{ left: 16.55, top: 9.09, width: 24.8, height: 22.91 }}></div>
                     <div className="absolute bg-[#88CCFF]" style={{ left: 16, top: 8, width: 24.03, height: 22.17 }}></div>
                     <span className="absolute font-['Inter',_sans-serif] font-bold text-[#12141D] flex items-center" style={{ left: 51.35, top: 8, fontSize: 10, lineHeight: '12px', width: 82, height: 24 }}>
                        Post share-worthy content
                     </span>
                  </div>
               </div>

               {/* Badge: Engage with your followers */}
               <div className="absolute bg-[#FFFFFF] border-[#12141D] rounded-[50px] flex items-center" style={{ left: 336, top: 40, width: 150, height: 40, borderWidth: 2 }}>
                  <div className="relative w-full h-full">
                     <div className="absolute bg-[#12141D]" style={{ left: 15.72, top: 9.13, width: 25.05, height: 22.87 }}></div>
                     <div className="absolute bg-[#91FFCA]" style={{ left: 15, top: 8, width: 24.17, height: 22.22 }}></div>
                     <span className="absolute font-['Inter',_sans-serif] font-bold text-[#12141D] flex items-center" style={{ left: 51.35, top: 8, fontSize: 10, lineHeight: '12px', width: 82, height: 24 }}>
                        Engage with your followers
                     </span>
                  </div>
               </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
