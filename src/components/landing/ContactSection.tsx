'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Mail, MapPin, Twitter, Instagram, MessageCircle } from 'lucide-react';

export default function ContactSection() {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('0');

  return (
    <section className="w-full bg-[#FFFFFF] relative py-[60px] md:py-[100px] flex flex-col items-center justify-center px-4 md:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-[40px] md:mb-[50px] font-sans">
        <h1 className="font-['Rubik_One'] font-normal text-[48px] md:text-[58px] lg:text-[70px] leading-tight lg:leading-[87px] text-[#174CD2]">
          {t('Contact Us', 'Contactez-nous')}
        </h1>
        <p className="font-medium text-[16px] md:text-[18px] leading-[1.5] md:leading-[27px] text-[#717171] mt-[8px]">
          {t('Any question or remarks? Just write us a message!', 'Des questions ou des remarques ? Écrivez-nous un message !')}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-[1320px] bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-[10px] p-[10px] flex flex-col lg:flex-row gap-[10px] lg:gap-0 relative">
        
        {/* Left Panel */}
        <div className="w-full lg:w-[491px] lg:min-w-[491px] bg-[#174CD2] rounded-[10px] relative overflow-hidden flex flex-col px-[20px] py-[30px] md:px-[40px] md:py-[40px] min-h-[500px] lg:min-h-[647px] z-10">
          
          <h2 className="text-white font-sans font-semibold text-[24px] md:text-[28px] leading-[42px]">
            {t('Contact Information', 'Contact Information')}
          </h2>
          <p className="text-white font-sans font-normal text-[16px] md:text-[18px] leading-[27px] mt-[6px]">
            {t('Say something to start a live chat!', 'Dites quelque chose pour démarrer un chat !')}
          </p>

          <div className="flex flex-col gap-[30px] md:gap-[40px] mt-[60px] md:mt-[100px]">
            <div className="flex items-center gap-[25px]">
              <Phone className="w-[24px] h-[24px] text-white shrink-0" fill="white" />
              <span className="text-white font-sans font-normal text-[16px] leading-[24px]">
                +237 6961 01985
              </span>
            </div>

            <div className="flex items-center gap-[25px]">
              <Mail className="w-[24px] h-[24px] text-white shrink-0" fill="white" />
              <span className="text-white font-sans font-normal text-[16px] leading-[24px]">
                support@eazlypost.cm
              </span>
            </div>

            <div className="flex items-start gap-[25px]">
              <MapPin className="w-[24px] h-[24px] text-white shrink-0 mt-[2px]" fill="white" />
              <span className="text-white font-sans font-normal text-[16px] leading-[24px] max-w-[288px] whitespace-pre-line">
                Akwa Carrefour Ancien Dalip{"\n"}Immeuble Digital Trade Center
              </span>
            </div>
          </div>

          <div className="flex gap-[20px] mt-auto pt-[60px] z-10">
            <a href="#" className="w-[30px] h-[30px] bg-[#1B1B1B] rounded-full flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors">
              <Twitter className="w-[14px] h-[14px] fill-current" />
            </a>
            <a href="#" className="w-[30px] h-[30px] bg-white text-black rounded-full flex items-center justify-center hover:bg-[#1B1B1B] hover:text-white transition-colors">
              <Instagram className="w-[14px] h-[14px]" />
            </a>
            <a href="#" className="w-[30px] h-[30px] bg-[#1B1B1B] rounded-full flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors">
              <MessageCircle className="w-[14px] h-[14px] fill-current" />
            </a>
          </div>

          {/* Decorative Circles */}
          <div className="absolute w-[269px] h-[269px] bg-[#040028] rounded-full -bottom-[100px] -right-[100px] z-0"></div>
          <div className="absolute w-[138px] h-[138px] bg-white opacity-20 rounded-full bottom-[50px] right-[50px] z-0"></div>

        </div>

        {/* Right Panel (Form) */}
        <form 
          className="flex-1 px-[20px] py-[30px] md:px-[50px] md:py-[60px] flex flex-col font-sans"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
            {/* First Name */}
            <div className="flex flex-col relative">
              <label className="text-[12px] font-medium text-black leading-[20px] mb-[2px]">
                {t('First Name', 'Prénom')}
              </label>
              <input 
                type="text" 
                placeholder="Donfack"
                className="w-full border-b border-black outline-none py-[4px] text-[14px] text-black font-medium placeholder:text-[#8D8D8D]/50 transition-colors bg-transparent" 
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col relative">
              <label className="text-[12px] font-medium text-black leading-[20px] mb-[2px]">
                {t('Last Name', 'Nom')}
              </label>
              <input 
                type="text" 
                placeholder="Aristide" 
                className="w-full border-b border-black outline-none py-[4px] text-[14px] text-black font-medium placeholder:text-[#8D8D8D]/50 transition-colors bg-transparent" 
              />
            </div>

            {/* Email */}
            <div className="flex flex-col relative">
              <label className="text-[12px] font-medium text-black leading-[20px] mb-[2px]">
                {t('Email', 'E-mail')}
              </label>
              <input 
                type="email" 
                placeholder="DonfackAristide3@gmail.com"
                className="w-full border-b border-black outline-none py-[4px] text-[14px] text-black font-medium placeholder:text-[#8D8D8D]/50 transition-colors bg-transparent" 
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col relative">
              <label className="text-[12px] font-medium text-black leading-[20px] mb-[2px]">
                {t('Phone Number', 'Téléphone')}
              </label>
              <input 
                type="text" 
                placeholder="+237 6 XX XX XX XX" 
                className="w-full border-b border-black outline-none py-[4px] text-[14px] text-black font-medium placeholder:text-[#8D8D8D]/50 bg-transparent" 
              />
            </div>
          </div>

          {/* Select Subject */}
          <div className="mt-[40px] md:mt-[60px] flex flex-col">
            <h3 className="text-[14px] font-semibold text-black leading-[20px] mb-[15px]">
              {t('Select Subject?', 'Sélectionnez le sujet ?')}
            </h3>
            <div className="flex flex-wrap gap-[20px] md:gap-[30px]">
              {[
                { id: '0', en: 'Features & Demo', fr: 'Fonctionnalités & Démo' },
                { id: '1', en: 'Pricing & Plans', fr: 'Tarifs & Forfaits' },
                { id: '2', en: 'Technical Support', fr: 'Support technique' },
                { id: '3', en: 'Partnerships', fr: 'Partenariats' }
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-[10px] cursor-pointer group">
                  <div className={`w-[13px] h-[13px] rounded-full flex items-center justify-center transition-colors ${subject === item.id ? 'bg-[#174CD2]' : 'bg-[#E0E0E0] group-hover:bg-gray-300'}`}>
                    {subject === item.id && <div className="w-[7px] h-[7px] bg-white rounded-full"></div>}
                  </div>
                  <span className="text-[12px] font-normal text-black leading-[20px]">
                    {t(item.en, item.fr)}
                  </span>
                  <input 
                    type="radio" 
                    name="subject" 
                    className="hidden" 
                    checked={subject === item.id} 
                    onChange={() => setSubject(item.id)} 
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mt-[40px] md:mt-[60px] flex flex-col relative">
            <label className="text-[12px] font-medium text-black leading-[20px] mb-[2px]">
              {t('Message', 'Message')}
            </label>
            <input 
              type="text" 
              placeholder={t('Write your message..', 'Écrivez votre message..')} 
              className="w-full border-b border-black outline-none py-[4px] text-[14px] text-black font-medium placeholder:text-[#8D8D8D] placeholder:font-medium transition-colors bg-transparent" 
            />
          </div>

          {/* Submit Button */}
          <div className="mt-[40px] md:mt-[60px] flex justify-end md:mb-[15px]">
            <button className="w-full md:w-[214px] h-[54px] bg-[#174CD2] text-white font-medium text-[16px] leading-[24px] rounded-[5px] shadow-[0px_0px_14px_rgba(0,0,0,0.12)] transition-colors flex items-center justify-center gap-[10px]">
              {t('Send Message', 'Envoyer le message')}
            </button>
          </div>

        </form>

      </div>
    </section>
  );
}
