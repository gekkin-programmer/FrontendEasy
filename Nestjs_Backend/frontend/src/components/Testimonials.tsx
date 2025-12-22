import React from 'react';
import { useLanguage } from '../context/LanguageContext'; // adjust path

const testimonialsData = [
  {
    quote: {
      en: "Buffer has transformed how we manage our social presence. Game-changer!",
      fr: "Buffer a transformé notre gestion de la présence sur les réseaux sociaux. Révolutionnaire !"
    },
    author: "Sarah Johnson, Marketing Lead",
    avatar: "https://via.placeholder.com/60?text=SJ"
  },
  {
    quote: {
      en: "Easy to use and incredibly effective. Highly recommend.",
      fr: "Facile à utiliser et incroyablement efficace. Fortement recommandé."
    },
    author: "Mike Chen, Founder",
    avatar: "https://via.placeholder.com/60?text=MC"
  },
  {
    quote: {
      en: "The analytics alone are worth it. Grew our audience by 40%.",
      fr: "Les analyses seules en valent la peine. Notre audience a augmenté de 40 %."
    },
    author: "Emma Davis, Content Creator",
    avatar: "https://via.placeholder.com/60?text=ED"
  }
];

const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24">
      <div className="container mx-auto">
        <h2 className="text-center text-4xl font-bold mb-16">
          {t("Loved by creators and brands", "Apprécié par les créateurs et les marques")}
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {testimonialsData.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-md"
            >
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="italic mb-4">"{t(testimonial.quote.en, testimonial.quote.fr)}"</p>
              <p className="font-semibold">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
