import React from 'react';
import { FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext'; // adjust path

const SupportSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#FDFDFC] py-8 px-4 font-sans">
      <div 
        className="
          container mx-auto flex max-w-3xl flex-col 
          items-center gap-6 text-center
        "
      >
        {/* Top Label */}
        <p className="text-sm font-semibold uppercase tracking-widest text-[#0F172A]">
          {t("Customer Support", "Support client")}
        </p>

        {/* Main Heading */}
        <h2 className="text-5xl font-bold text-[#0F172A] leading-tight">
          {t("Human support, worldwide", "Support humain, partout dans le monde")}
        </h2>

        {/* First Paragraph */}
        <p className="text-lg leading-relaxed text-gray-700">
          {t(
            "Our global Customer Advocacy team is spread across time zones to make sure help is always nearby. Whether you have a quick question, need technical support, or just want to connect, we're here for you — no bots, just real people who care.",
            "Notre équipe mondiale de défense des clients est répartie sur plusieurs fuseaux horaires pour s'assurer que l'aide est toujours à portée de main. Que vous ayez une question rapide, besoin d'assistance technique ou simplement envie de vous connecter, nous sommes là pour vous — pas de bots, juste de vraies personnes attentionnées."
          )}
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <a
            href="#"
            className="
              rounded-full px-8 py-3 font-semibold 
              text-white transition-colors duration-200 
              bg-[#3C48F6] border border-[#3C48F6] hover:text-white
            "
          >
            {t("Visit the Help Center", "Visitez le centre d'aide")}
          </a>
          <a
            href="#"
            className="
              flex items-center justify-center gap-2 rounded-full 
              border border-gray-400 bg-white px-8 py-3 
              font-semibold text-gray-800 transition-colors 
              duration-200 hover:bg-gray-100
            "
          >
            <FaWhatsapp />
            {t("Join Whatsapp Community", "Rejoindre la communauté Whatsapp")}
          </a>
        </div>

        {/* Second Paragraph */}
        <p className="mt-8 text-base text-gray-600">
          {t(
            "We prioritize customer connection as a company and you could end up speaking with a teammate in any role at EasyPost, from Marketers to Engineers.",
            "Nous privilégions la connexion avec les clients en tant qu'entreprise, et vous pourriez finir par parler avec un collègue occupant n'importe quel rôle chez EasyPost, des marketeurs aux ingénieurs."
          )}
        </p>

        {/* Final Link */}
        <a
          href="#"
          className="
            group mt-2 inline-flex items-center gap-2 
            font-semibold text-[#3C48F6]
          "
        >
          {t(
            "Learn more about our global team",
            "En savoir plus sur notre équipe mondiale"
          )}
          <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
};

export default SupportSection;
