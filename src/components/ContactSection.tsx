'use client';

import React from 'react';

export default function ContactSection() {
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
              placeholder="Entrez votre nom"
              className="w-full h-full bg-transparent outline-none text-[#000000] font-['Rubik'] font-[400] text-[20px] leading-[24px] placeholder:text-[#000000]"
            />
          </div>

          {/* E-mail */}
          <div className="w-full h-[80px] bg-white border border-[#060830] rounded-[20px] relative flex items-center px-[22px]">
            <input 
              type="email" 
              placeholder="Entrez votre E-mail"
              className="w-full h-full bg-transparent outline-none text-[#000000] font-['Rubik'] font-[400] text-[20px] leading-[24px] placeholder:text-[#000000]"
            />
          </div>

          {/* Message */}
          <div className="w-full h-[160px] sm:h-[80px] bg-white border border-[#060830] rounded-[20px] relative flex items-center px-[22px]">
            <input 
              type="text" 
              placeholder="Entrez votre message"
              className="w-full h-full bg-transparent outline-none text-[#000000] font-['Rubik'] font-[400] text-[20px] leading-[24px] placeholder:text-[#000000]"
            />
          </div>

          {/* Checkbox (Rectangle 115) + Submit Button Area */}
          <div className="w-full flex flex-col mt-[10px] gap-[40px] items-center">
            
            {/* Checkbox wrapper */}
            <div className="w-full flex items-center justify-start gap-[15px] px-[10px]">
              <div className="w-[20px] h-[20px] bg-white border border-[#000000] rounded-sm flex-shrink-0 cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors">
                <input type="checkbox" className="opacity-0 absolute cursor-pointer w-[20px] h-[20px]" />
                {/* SVG for a custom checkmark if checked could go here */}
              </div>
              <span className="font-['Rubik'] text-[#000000] text-[16px]">J'accepte d'être recontacté(e)</span>
            </div>

            {/* Envoyer Button */}
            <button 
              type="submit"
              className="w-full h-[80px] bg-[#174CD2] rounded-[20px] flex items-center justify-center hover:bg-[#1135A7] transition-colors shadow-lg"
            >
              <span className="font-['Rubik'] font-[600] text-[32px] leading-[38px] text-white">
                Envoyer
              </span>
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}
