'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ContactSection() {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-white relative py-[100px] flex flex-col items-center">
      <div className="w-full max-w-[725px] mx-auto flex flex-col items-center px-[20px] sm:px-0">
        
        {/* Title */}
        <h2 
          className="text-[#174CD2] font-['Rubik'] font-[800] text-[32px] sm:text-[40px] leading-[1.2] sm:leading-[47px] text-center mb-[20px]"
        >
          CONTACTEZ-NOUS
        </h2>

        {/* Subtitle */}
        <p 
          className="text-[#000000] font-['Rubik'] font-[500] text-[18px] sm:text-[20px] leading-[1.2] sm:leading-[24px] text-center mb-[40px]"
        >
          Vous avez des questions ou besoin d'aide ? Contactez-nous.
        </p>

        {/* Form Container (Frame 55) */}
        <form className="w-full flex flex-col gap-[30px]" onSubmit={(e) => e.preventDefault()}>
          
          {/* Nom */}
          <div className="w-full h-[80px] bg-white border border-[#060830] rounded-[20px] relative flex items-center px-[22px]">
            <input 
              type="text" 
              placeholder={t("Enter your name", "Entrez votre nom")}
              className="w-full h-full bg-transparent outline-none text-[#000000] font-['Rubik'] font-[400] text-[20px] leading-[24px] placeholder:text-[#000000]/50"
            />
          </div>

          {/* E-mail */}
          <div className="w-full h-[80px] bg-white border border-[#060830] rounded-[20px] relative flex items-center px-[22px]">
            <input 
              type="email" 
              placeholder={t("Enter your Email", "Entrez votre E-mail")}
              className="w-full h-full bg-transparent outline-none text-[#000000] font-['Rubik'] font-[400] text-[20px] leading-[24px] placeholder:text-[#000000]/50"
            />
          </div>

          {/* Message */}
          <div className="w-full bg-white border border-[#060830] rounded-[20px] relative flex px-[22px] py-[10px]">
  <textarea
    placeholder="Entrez votre message"
    className="w-full h-[160px] sm:h-[200px] resize-none bg-transparent outline-none text-[#000000] font-['Rubik'] font-[400] text-[20px] leading-[28px] placeholder:text-[#000000]/50"
  />
</div>

          {/* Checkbox (Rectangle 115) + Submit Button Area */}
          <div className="w-full flex flex-col mt-[10px] gap-[40px] items-center">
            
            {/* Checkbox wrapper */}
            <label className="flex items-center justify-center gap-[15px] cursor-pointer px-[10px]">
  <input
    type="checkbox"
    className="appearance-none w-[22px] h-[22px] rounded-full border border-[#000000] 
               checked:bg-[#174CD2] checked:border-[#174CD2] cursor-pointer transition-colors"
  />
  <span className="font-['Rubik'] text-[#000000] text-[16px]">
    J'accepte d'être recontacté(e)
  </span>
</label>

            {/* Envoyer Button */}
            <button 
              type="submit"
              className="w-full h-[80px] bg-[#174CD2] rounded-[20px] flex items-center justify-center hover:bg-[#1135A7] transition-colors shadow-lg"
            >
              <span className="font-['Rubik'] font-[700] text-[20px] sm:text-[24px] leading-[1.2] sm:leading-[28px] text-white">
              {t("Send", "Envoyer")}
            </span>
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}
