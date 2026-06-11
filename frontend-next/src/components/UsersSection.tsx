"use client";

import React, { useState } from 'react';

export default function UsersSection() {
  const [selectedCard, setSelectedCard] = useState(0);

  const getCardClasses = (index: number, leftPosition: string) => {
    const baseClasses = `absolute ${leftPosition} bg-white rounded-[10px] cursor-pointer transition-all duration-300 origin-top-left w-[229px] h-[231px]`;
    if (selectedCard === index) {
      return `${baseClasses} top-[0px] shadow-2xl scale-[1.3] z-20`;
    } else {
      return `${baseClasses} top-[72px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] scale-[1.25] hover:scale-[1.3] hover:-translate-y-2 hover:shadow-2xl z-10`;
    }
  };

const influencers = [
  {
    name: "Blanche Bahoken",
    image: "/star1.png",
    tiktok: "1.1M",
    instagram: "1.1M",
    facebook: "1.1M",
    position: "top-[417px] left-[202px] rotate-[-2deg]",
  },
  {
    name: "Mayole Francine",
    image: "/star2.png",
    tiktok: "1.1M",
    instagram: "1.1M",
    facebook: "1.1M",
    position: "top-[500px] right-[140px] rotate-[2deg]",
  },
  {
    name: "Blanche Bally",
    image: "/bally.jpg",
    tiktok: "1.1M",
    instagram: "1.1M",
    facebook: "1.1M",
    position: "top-[650px] left-[500px] rotate-[-1deg]",
  },
];

  return (
    <section className="w-full bg-white relative flex flex-col items-center pt-[100px] pb-[150px]">
      
      {/* 
        The section uses a relative wrapper that explicitly matches the Figma width structure 
        so all absolute components align exactly as spec'd.
      */}
      <div className="w-full relative h-full z-10">
        
        {/* New Header Text - Aligned with global page max-width */}
        <div className="w-full max-w-[1435px] mx-auto px-[52px] pt-[120px] relative z-10 flex flex-col">
          <span className="font-sans font-black text-[36px] leading-[45px] text-[#000000]">
            EazyPost
          </span>
          <h2 className="font-sans font-black text-[70px] leading-[87px] text-[#174CD2] mt-[-5px]">
            pour tout types de profils
          </h2>
        </div>

        {/* Main Container for Cards and Blue Bg */}
        <div className="w-full relative mt-[150px] h-[861px]">
          {/* Blue Background Full Width */}
          <div className="absolute top-[188px] left-0 w-full h-[673px] bg-[#174CD2] rounded-t-[50px] z-0 border-t border-black/15 box-border"></div>

          {/* Inner Constraints for Cards & Images */}
          <div className="w-full max-w-[1438px] mx-auto relative h-full z-10">
            
            {/* Card 1 */}
            <div 
              onClick={() => setSelectedCard(0)} 
              className={getCardClasses(0, "left-[85px]")}
            >
              <h3 className="absolute top-[15px] left-[12px] font-sans font-bold text-[16px] leading-[19px] text-[#000000] w-[110px]">
                Createurs & Influenceurs
              </h3>
              <p className="absolute top-[74px] left-[12px] font-sans font-light text-[10px] leading-[12px] text-[#000000] w-[186px]">
                EazyPost t’aide à publier régulièrement, à analyser tes performances et à professionnaliser ton image, sans passer ta vie sur les réseaux.
              </p>
              <div className="absolute top-[125px] left-[70px] w-[80px] h-[80px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 192 192"><g clipPath="url(#j9NIKFc-Hva)"><g stroke="#174cd2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="1.5" clipPath="url(#A_tufkDvSnb)"><path strokeWidth="4.5" d="M59.5 114.716c-7.338 11.18-19.865 30.669-27.312 45.157-2.476 4.816 2.297 5.906 3.963 4.406 7.36-6.626 18.233-14.215 20.358-13.717 2.5.587 6.602 22.191 11.427 22.192.584 0 14.576-27.399 22.112-42.254"/><path fill="#174cd2" strokeWidth="1.4994" d="M67.936 172.755c-1.584.08-3.225-2.874-3.594-3.639-.208-.627 12.66-26.238 21.365-41.523 0 0 1.23 1.075 2.075 1.651.908.619 2.265 1.256 2.265 1.256-7.687 15.091-21.532 42.255-22.111 42.255"/><path strokeWidth="4.5" d="M103.481 130.689c7.585 14.793 21.412 41.579 21.992 41.579 4.825-.002 8.927-21.606 11.427-22.192 2.125-.499 12.723 8.641 20.083 15.267 1.665 1.499 5.262.506 2.786-4.31-7.332-14.263-18.471-34.661-25.154-46.72"/><path strokeWidth="2.9988" d="m111.789 164.243-11.056-19.121"/><path fill="#174cd2" fillRule="evenodd" strokeWidth="4.5" d="M97.093 40c-3.01 5.038-5.819 19.084-7.116 20.396-.497.503-18.368-.727-18.976.6-.104.226 12.849 8.2 15.418 10.798.587.594-10.01 20.306-8.302 22.196.089.098 3.292-.252 18.976-14.397.718-.647 15.814 14.528 18.383 13.797 1.391-.396-8.488-21.914-8.302-22.196.636-.964 14.943-10.738 14.825-10.798-.92-.465-17.312.88-17.79 0-1.459-2.684-4.685-16.143-7.116-20.396" clipRule="evenodd"/><path strokeWidth="3" d="M159 87c11.307-4.955 9.828-24.91.565-31M30.535 80.55c-2.65-6.953-3.511-19.341 4.764-24.475"/><path strokeWidth="4.5009" d="M83.034 18.943C85.32 14.455 90.794 11 97 11s11.677 3.455 13.965 7.943c4.206-2.733 10.66-2.966 16.034.163 5.375 3.129 8.402 8.88 8.157 13.919 4.999-.245 10.701 2.807 13.804 8.225 3.104 5.419 2.874 11.926.163 16.167 4.449 2.307 7.876 7.826 7.876 14.084 0 6.256-3.427 11.775-7.876 14.082 2.711 4.24 2.941 10.748-.163 16.167s-8.805 8.472-13.804 8.225c.245 5.04-2.782 10.79-8.157 13.919-5.374 3.128-11.828 2.898-16.034.163C108.677 128.545 103.205 132 97 132c-6.207 0-11.68-3.455-13.967-7.943-4.206 2.735-10.66 2.966-16.034-.163s-8.4-8.879-8.157-13.919c-4.997.247-10.701-2.805-13.804-8.225-3.104-5.419-2.872-11.926-.162-16.167C40.427 83.276 37 77.757 37 71.5s3.427-11.777 7.877-14.084c-2.71-4.24-2.942-10.748.162-16.167 3.103-5.418 8.807-8.47 13.804-8.225-.244-5.039 2.783-10.79 8.157-13.92 5.374-3.128 11.828-2.895 16.034-.162" clipRule="evenodd"/><path fill="#174cd2" d="M157.077 163.87c1.066 1.972 5.168 1.979 2.692-2.837-7.333-14.265-18.474-34.667-25.157-46.725-.587 2.004-1.626 3.974-3.063 5.718 7.758 13.61 22.065 37.437 25.528 43.844"/><path fill="#174cd2" fillRule="evenodd" strokeWidth="2.9933" d="M146 71.5c0 26.786-21.714 48.5-48.5 48.5S49 98.286 49 71.5 70.714 23 97.5 23 146 44.714 146 71.5m-8 0c0 22.368-18.132 40.5-40.5 40.5S57 93.868 57 71.5 75.132 31 97.5 31 138 49.133 138 71.5" clipRule="evenodd"/></g></g><defs><clipPath id="j9NIKFc-Hva"><path fill="#fff" d="M0 0h192v192H0z"/></clipPath><clipPath id="A_tufkDvSnb"><path fill="#fff" d="M0 0h192v192H0z"/></clipPath></defs></svg>
              </div>
              <div className="absolute top-[17px] left-[189px] w-[30px] h-[30px] bg-[#174CD2]/80 rounded-full flex items-center justify-center">
                <div className="w-[20px] h-[20px] bg-[#174CD2] rounded-full overflow-hidden"></div>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => setSelectedCard(1)} 
              className={getCardClasses(1, "left-[419px]")}
            >
              <h3 className="absolute top-[15px] left-[12px] font-sans font-bold text-[16px] leading-[19px] text-[#000000] w-[165px]">
                Petites & Moyennes Entreprises
              </h3>
              <p className="absolute top-[74px] left-[12px] font-sans font-light text-[10px] leading-[12px] text-[#000000] w-[202px]">
                EazyPost permet aux petites et moyennes entreprises de gérer leurs réseaux comme de grandes marques, avec peu de temps et peu de ressources.
              </p>
              <div className="absolute top-[125px] left-[70px] w-[80px] h-[80px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 192 192"><g stroke="#174cd2" strokeLinejoin="round" clipPath="url(#Z9PVRZCQjga)"><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3.0019" d="M158.161 128.315c6.606-4.44 5.24-17.765 5.24-17.688"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3.0011" d="M110.631 42.386c7.727-5.194 6.129-20.78 6.129-20.69"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.5029" d="M145.228 98.226c-3.036.053-8.73.902-11.653 5.971-1.864 3.233-2.041 7.676-1.192 11.121.737 2.988 1.802 6.337 3.448 8.96 3.153 5.022 8.885 8.337 14.357 4.639.803-.543 1.921-1.668 2.569-2.417 5.273-6.099 5.295-14.333 4.526-18.227-.739-3.747-2.351-10.218-12.055-10.047" clipRule="evenodd"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.5016" d="M96.36 7.45c-3.552.062-10.212 1.055-13.632 6.985-2.18 3.782-2.387 8.979-1.394 13.009.862 3.495 2.108 7.413 4.034 10.48 3.687 5.875 10.392 9.753 16.793 5.428.94-.636 2.248-1.952 3.005-2.828 6.169-7.135 6.195-16.766 5.296-21.321-.865-4.383-2.751-11.953-14.102-11.754" clipRule="evenodd"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3.0009" d="M21.601 163.953c3.384.01 4.503.06 12.997.021"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.4981" d="M48.42 98.313c-3.042.053-8.746.904-11.675 5.983-1.867 3.238-2.044 7.69-1.194 11.141.739 2.994 1.806 6.349 3.455 8.977 3.158 5.031 8.9 8.352 14.383 4.647.805-.544 1.925-1.671 2.574-2.421 5.283-6.111 5.305-14.36 4.535-18.261-.74-3.754-2.356-10.237-12.078-10.066" clipRule="evenodd"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.5006" d="M139.417 128.656c-1.554 3.847-2.908 4.186-5.387 4.808-1.326.332-2.976.746-5.15 1.821-7.273 3.596-9.282 10.051-9.614 15.09m32.237-22.081c.773 5.724 5.787 6.19 8.197 6.414.458.043.822.077 1.045.136 13.095 3.501 9.58 23.189 9.151 23.185-2.108-.024-7.264-.058-13.505-.1a8503 8503 0 0 1-27.738-.212"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.503" d="M89.562 43.046c-2.791 6.91-5.03 4.147-12.327 7.755C61.92 58.374 66.56 76.79 66.681 76.853c.433.219 50.14.46 58.534.553.503.005 4.614-23.026-10.704-27.121-1.633-.436-9.736.307-10.811-7.662"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3.0004" d="M137.816 135.084c2.289 1.542 4.845 2.736 7.268 2.801 3.032.081 5.921-.937 7.753-2.13"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3.002" d="M87.689 50.566c2.677 1.803 5.667 3.2 8.502 3.276 3.546.094 6.926-1.096 9.069-2.492"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.4977" d="M42.299 128.622c-1.587 3.928-2.969 4.275-5.5 4.909-1.355.34-3.039.762-5.26 1.86-13.368 6.61-9.319 22.686-9.212 22.741.267.135 21.984.279 37.303.381l5.826.039m-10.815-30.3c.788 5.845 5.908 6.321 8.369 6.55.468.043.84.078 1.067.139 7.885 2.108 9.872 9.963 10.085 16.054"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.4974" d="M160.283 134.285c-8.204.338-8.743-6.229-8.862-6.134-.047.037-2.332 1.061-2.287 1.267.227 1.029 2.163 6.425 8.734 7.296 1.784.236 3.957.853 5.813 2.605 2.843 2.683 4.909 7.976 3.874 18.427-.022.222 3.024.134 3.066-.084 3.753-19.344-8.396-23.458-10.338-23.377Z" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.5027" d="M54.517 128.622c.273 1.103 1.515 6.115 8.647 5.821 1.675-.069 11.065 3.033 10.868 16.619a25 25 0 0 0-3.456 2.158c.13-7.487-1.694-11.583-4.07-13.826-1.825-1.723-3.963-2.329-5.717-2.561-6.463-.857-8.367-6.164-8.59-7.177-.035-.16 1.377-.829 1.981-1.115.157-.074.259-.123.268-.13.014-.011.033.066.069.211Z" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.5003" d="M141.562 99.202c12.592-.16 13.16 8.494 13.157 13.009-.007 8.726-3.477 15.561-9.654 16.662-1.594.284-4.069-.347-7.682-2.988-.216-.158 3.758 5.397 9.268 4.331 10.018-1.938 10.774-13.659 10.447-19.179-.991-16.714-15.791-11.92-15.536-11.835Z" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.4968" d="M44.751 99.94c12.385-.158 12.944 8.354 12.94 12.794-.006 8.582-3.42 15.304-9.495 16.387-1.567.279-4-.341-7.555-2.939-.212-.155 3.697 5.308 9.115 4.26 9.853-1.907 10.596-13.434 10.275-18.863-.974-16.439-15.53-11.722-15.28-11.64Z" clipRule="evenodd"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="2.9985" d="M40.664 135.186c2.337 1.574 4.947 2.793 7.422 2.859 3.095.083 6.045-.956 7.916-2.174"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.4998" d="M89.119 141.631c-3.304 8.179-5.954 4.909-14.592 9.18-18.131 8.965-12.64 30.768-12.495 30.842.513.259 59.357.544 69.295.654.595.007 5.462-27.259-12.672-32.106-1.933-.517-11.526.363-12.798-9.071"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="2.9969" d="M86.903 150.533c3.169 2.135 6.709 3.788 10.065 3.878 4.198.112 8.199-1.298 10.736-2.95"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="4.5002" d="M96.947 100.044c-4.15.073-11.931 1.233-15.927 8.162-2.547 4.417-2.789 10.489-1.628 15.197 1.007 4.084 2.462 8.662 4.712 12.246 4.308 6.862 12.142 11.393 19.62 6.34 1.098-.743 2.627-2.28 3.511-3.304 7.207-8.335 7.237-19.588 6.187-24.91-1.011-5.12-3.214-13.964-16.475-13.731" clipRule="evenodd"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3.0001" d="M78.47 8.477c-2.821 4.116-6.265 11.374-2.995 19.366"/><path strokeLinecap="round" strokeMiterlimit="1.5" strokeWidth="3" d="M79.924 82.27c-4.45 4.45-9.71 9.07-15.568 11.61M96.29 81.737c-.116 2.11.043 9.069.024 11.732m16.575-10.822c2.825 4.474 9.445 9.334 15.02 10.807"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.5008" d="M113.674 49.754c-9.592.396-10.222-7.283-10.362-7.172-.055.044-2.727 1.241-2.674 1.481.266 1.204 2.529 7.514 10.213 8.532 2.086.276 4.627.997 6.797 3.046 3.324 3.138 5.74 9.327 4.53 21.548-.026.259 3.536.156 3.585-.1 4.388-22.618-9.817-27.428-12.089-27.335Z" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.5013" d="M91.783 8.732c14.724-.188 15.389 9.932 15.385 15.211-.008 10.204-4.066 18.196-11.289 19.483-1.864.332-4.757-.405-8.983-3.494-.252-.184 4.395 6.311 10.838 5.065 11.714-2.267 12.597-15.972 12.215-22.426C108.791 3.026 91.486 8.633 91.783 8.732Z" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.499" d="M117.451 149.602c-11.116.458-11.846-8.441-12.007-8.312-.064.051-3.16 1.438-3.099 1.717.308 1.395 2.931 8.706 11.835 9.887 2.417.32 5.362 1.155 7.876 3.529 3.853 3.637 6.652 10.808 5.25 24.971-.03.3 4.098.181 4.155-.115 5.084-26.211-11.377-31.786-14.01-31.677Z" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeMiterlimit="2" strokeWidth="1.4954" d="M92.093 101.701c17.063-.218 17.833 11.51 17.829 17.627-.01 11.824-4.713 21.087-13.082 22.578-2.16.385-5.513-.47-10.41-4.049-.292-.213 5.093 7.314 12.559 5.869 13.575-2.627 14.599-18.509 14.156-25.988-1.342-22.65-21.397-16.152-21.052-16.037Z" clipRule="evenodd"/></g><defs><clipPath id="Z9PVRZCQjga"><path fill="#fff" d="M0 0h192v192H0z"/></clipPath></defs></svg>
              </div>
              <div className="absolute top-[17px] left-[189px] w-[30px] h-[30px] bg-[#174CD2]/80 rounded-full flex items-center justify-center">
                <div className="w-[20px] h-[20px] bg-[#174CD2] rounded-full overflow-hidden"></div>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => setSelectedCard(2)} 
              className={getCardClasses(2, "left-[753px]")}
            >
              <h3 className="absolute top-[15px] left-[12px] font-sans font-bold text-[16px] leading-[19px] text-[#000000] w-[165px]">
                Agences
              </h3>
              <p className="absolute top-[74px] left-[12px] font-sans font-light text-[10px] leading-[12px] text-[#000000] w-[202px]">
                Gérez plus de clients, sans essouffler vos équipes.
              </p>
              <div className="absolute top-[125px] left-[70px] w-[80px] h-[80px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 192 192"><g stroke="#174cd2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="1.5" clipPath="url(#QABYIBkVAsa)"><path strokeWidth="4.5" d="M163.76 65.565c-16.764-.148-111.818-.01-137.47.223-4.057.037-6.368 3.883-6.354 7.047.067 15.75.276 50.111.49 64.978.204 14.09 4.512 13.562 17.957 13.698 27.931.281 81.833.358 111.012-.327 16.781-.395 19.875-1.575 20.211-13.38.426-14.948-.377-55.07-.662-68.057-.054-2.417-1.966-4.153-5.184-4.182" clipRule="evenodd"/><path fill="#174cd2" d="M38.223 26.4c6.026.061 13.815.093 22.313.182 3.063.032 11.245 22.465 11.5 22.47 3.447.066 71.965.176 91.381.373 3.218.032 5.131 2.013 5.184 4.77.066 3.429.177 8.73.305 15.066-.285-2.16-2.148-3.67-5.146-3.695-16.764-.15-111.817-.011-137.468.222-3.916.036-6.206 3.618-6.35 6.712h-.012c-.036-11.45-.032-22.042.04-29.996.127-14.22 2.092-16.268 18.253-16.104"/><path strokeWidth="3.0039" d="M105.213 91.103c8.512.018 36.928-.35 50.394-.35m-50.435 30.162c8.512.019 36.928-.349 50.394-.349m-50.632-14.404c8.513.018 36.928-.35 50.395-.35"/><path fill="#174cd2" fillRule="evenodd" d="M85.734 108.545c.025 0-.26-15.443-.285-17.325 0-.127-51.814.36-51.82.579-.03.995-.345 17.251.209 17.246 11.857-.11 41.55-.333 51.896-.5" clipRule="evenodd"/><path strokeWidth="3" d="M179.297 79.799c.026 19.988-.216 44.989-.216 59.889m-146.564 21.71c10.713-.17 40.565-.278 47.396-.261m8.265-.27c8.681-.091 17.143-.023 26.678-.142m-34.975-120.6c5.421.055 48.358.371 63.182.371"/></g><defs><clipPath id="QABYIBkVAsa"><path fill="#fff" d="M0 0h192v192H0z"/></clipPath></defs></svg>
              </div>
              <div className="absolute top-[17px] left-[189px] w-[30px] h-[30px] bg-[#174CD2]/80 rounded-full flex items-center justify-center">
                <div className="w-[20px] h-[20px] bg-[#174CD2] rounded-full overflow-hidden"></div>
              </div>
            </div>

            {/* Card 4 */}
            <div 
              onClick={() => setSelectedCard(3)} 
              className={getCardClasses(3, "left-[1091px]")}
            >
              <h3 className="absolute top-[15px] left-[12px] font-sans font-bold text-[16px] leading-[19px] text-[#000000] w-[165px]">
                Organisations & Institutions
              </h3>
              <p className="absolute top-[74px] left-[12px] font-sans font-light text-[10px] leading-[12px] text-[#000000] w-[202px]">
                EazyPost aide les institutions, ONG, associations et administrations à parler d’une seule voix sur les réseaux sociaux.
              </p>
              <div className="absolute top-[125px] left-[70px] w-[80px] h-[80px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 192 192"><g clipPath="url(#LZHWzJbM_Fa)"><g stroke="#174cd2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="1.5" clipPath="url(#0eJ0_cJAQJb)"><path strokeWidth="4.5" d="M82.266 76.716c-5.312-11.358-25.569-31.629-35.654-25.204-4.026 2.565-7.532 6.31-9.646 18.081-3.37 18.774-1.197 44.328 23.039 68.134 25.292 24.844 50.822 27.581 68.698 22.274 9.515-2.825 17.758-9.136 21.704-13.283 6.12-6.431-25.508-45.401-38.991-32.58-2.42 2.302-5.675 5.961-5.196 8.591 3.46 19-6.814 14.866-7.362 14.871-1.51.013-11.774-2.3-24.342-15.309-12.155-12.583-14.697-21.147-15.497-23.154-1.1-2.752.766-10.015 10.014-7.304 1.28.375 4.587.778 6.255-.795 3.262-3.074 8.89-10.232 6.978-14.322" clipRule="evenodd"/><path fill="#174cd2" fillRule="evenodd" strokeWidth="4.5" d="M106.307 121.183c-.071.28 11.531 5.488 21.802 14.427 9.589 8.347 14.363 17.694 14.531 17.578 3.289-2.25 5.972-4.583 7.767-6.47 6.12-6.431-25.508-45.401-38.991-32.58-1.974 1.877-4.502 4.656-5.109 7.045M82.266 76.716c-5.312-11.358-25.569-31.629-35.654-25.205-2.066 1.316-3.995 2.944-5.67 5.806-.055.094 8.718 6.68 17.673 15.934 10.452 10.802 15.96 18.3 16.07 18.236.217-.127.421-.276.603-.45 3.262-3.073 8.89-10.231 6.978-14.32" clipRule="evenodd"/><path strokeWidth="4.4995" d="M96.405 41.99c.011-4.247 3.104-7.336 7.797-7.397 14.423-.185 45.222-.105 58.464.24 3.89.101 6.284 3.365 6.305 6.692.065 10.102.166 29.455-.034 39.81-.082 4.218-3.865 6.931-6.442 6.93-14.448-.01-44.209.05-46.033.089-2.51.052-13.067 13.287-13.38 12.979-.307-.301.844-12.641.47-13.016-.124-.125-1.03-.114-2.15-.077-2.038.065-4.866-3.14-4.892-6.881-.07-10.076-.134-29.045-.106-39.368" clipRule="evenodd"/><path strokeWidth="3" d="M168.555 96.205c-8.702.11-41.733.071-44.112.071"/><path fill="#174cd2" fillRule="evenodd" strokeWidth="1.5074" d="M138.871 42.131c-3.438-.521-12.082-.596-12.149.317-.245 3.34.632 13.012-.281 13.072-2.956.195-12.443-.702-12.504.091-.161 2.082-.538 9.687.165 11.295.255.583 11.993-.065 12.608.243.81.405-.447 12.565.598 12.674 2.98.312 9.49.088 11.913-.02.43-.02.027-9.686.147-12.09.057-1.16 12.043-.088 12.108-.663.195-1.712-.11-10.354-.497-10.91-.641-.92-11.752.35-11.919-.49-.213-1.069.725-13.38-.189-13.519" clipRule="evenodd"/><path strokeWidth="3" d="M25.856 64.432c-5.406 14.093-3.993 37.636 5.802 58.711m7.602 11.318c8.235 12.461 19.936 23.034 35.5 28.707M89.864 44.864c.047-2.954.078-7.984.103-11.62.014-1.973 1.995-4.479 4.959-4.55 7.869-.188 22.868.011 27.439-.103"/></g></g><defs><clipPath id="LZHWzJbM_Fa"><path fill="#fff" d="M0 0h192v192H0z"/></clipPath><clipPath id="0eJ0_cJAQJb"><path fill="#fff" d="M0 0h192v192H0z"/></clipPath></defs></svg>
              </div>
              <div className="absolute top-[17px] left-[189px] w-[30px] h-[30px] bg-[#174CD2]/80 rounded-full flex items-center justify-center">
                <div className="w-[20px] h-[20px] bg-[#174CD2] rounded-full overflow-hidden"></div>
              </div>
            </div>

            {/* Floating Influencer Cards */}
{influencers.map((person, index) => (
  <div
    key={index}
    className={`
      absolute
      ${person.position}
      bg-white
      rounded-[12px]
      p-3
      w-[340px]
      shadow-[0_12px_30px_rgba(0,0,0,0.12)]
      hover:-translate-y-2
      hover:scale-105
      hover:shadow-2xl
      transition-all
      duration-300
      cursor-pointer
      z-20
    `}
  >
    <div className="flex items-center gap-4">

      {/* Profile Picture */}
      <img
        src={person.image}
        alt={person.name}
        className="
          w-[110px]
          h-[115px]
          rounded-[5px]
          object-cover
          flex-shrink-0
        "
      />

      {/* Content */}
      <div className="flex flex-col justify-center">

        {/* Name */}
        <h3 className="font-semibold text-[18px] leading-none text-black">
          {person.name}
        </h3>

        {/* Stats */}
        <div className="mt-3 flex flex-col gap-1">

          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="currentColor"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.74h-3.09v13.4a2.79 2.79 0 1 1-2.79-2.79c.31 0 .61.05.89.14V9.57a5.86 5.86 0 0 0-.89-.07A5.89 5.89 0 1 0 15.82 15V8.16a7.9 7.9 0 0 0 4.62 1.48V6.69z"/>
            </svg>

            <span className="text-[14px] text-gray-700">
              {person.tiktok} Abonnés
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="#E1306C"
            >
              <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm4.2 4.3a5.7 5.7 0 1 0 0 11.4 5.7 5.7 0 0 0 0-11.4zm0 1.9a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zm5.9-.9a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/>
            </svg>

            <span className="text-[14px] text-gray-700">
              {person.instagram} Abonnés
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="#1877F2"
            >
              <path d="M22 12A10 10 0 1 0 10.44 21.9v-7h-2.6V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.52h-1.3c-1.28 0-1.68.8-1.68 1.61V12h2.86l-.46 2.9h-2.4v7A10 10 0 0 0 22 12z"/>
            </svg>

            <span className="text-[14px] text-gray-700">
              {person.facebook} Abonnés
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
))}

          </div>
        </div>
      </div>
    </section>
  );
}
