import React from 'react';
import Automn from '../assets/Automn.jpg';
import { ArrowRight, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // adjust path if needed

function LearnMoreButton({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <button
      className={`
        inline-flex items-center gap-1 bg-[#3C48F6] text-white text-sm font-medium
        px-3 py-1.5 rounded-full hover:bg-[#3C48F6] transition-shadow hover:shadow-md
        whitespace-nowrap ${className}
      `}
    >
      {t("Learn more", "En savoir plus")}
      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
    </button>
  );
}

function CommentBubble({
  avatar,
  text,
  className = '',
}: {
  avatar: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 bg-white rounded-full shadow-md px-3 py-1.5 text-sm font-medium ${className}`}
    >
      <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
      <span className="text-gray-800">{text}</span>
    </div>
  );
}

export default function CollaborateSection() {
  const { t } = useLanguage();

  return (
    <div className="relative bg-amber-100 rounded-3xl mt-8 p-8 md:p-10 shadow-sm overflow-hidden h-full flex flex-col">
      {/* === Top: Text Content === */}
      <div className="space-y-6 flex-1">
        <p className="text-amber-600 font-medium uppercase tracking-wider text-sm">
          {t("Collaborate", "Collaborer")}
        </p>

        <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
          {t("Great Content, Created Together", "Du contenu génial, créé ensemble")}
        </h2>

        <p className="text-gray-700 text-base md:text-lg leading-relaxed">
          {t(
            "Collaborate seamlessly with your team. Invite unlimited collaborators, assign roles and permissions, and keep everyone aligned with saved drafts and notes.",
            "Collaborez facilement avec votre équipe. Invitez des collaborateurs illimités, attribuez des rôles et des autorisations, et gardez tout le monde aligné grâce aux brouillons et notes sauvegardés."
          )}
        </p>
      </div>

      {/* === Visual Showcase === */}
      <div className="relative mt-10 mb-12">
        {/* Floating comment bubbles */}
        <CommentBubble
          avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
          text={t("This image looks so good!", "Cette image est superbe !")}
          className="left-6 top-4"
        />

        <CommentBubble
          avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
          text={t("Good to go!", "Prêt à être publié !")}
          className="right-6 bottom-16"
        />

        {/* Central post card */}
        <div className="bg-white rounded-2xl shadow-md p-5 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <img
              src={Automn}
              alt="yoyo_ceramics"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">yoyo_ceramics</p>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "Our new autumn collection just dropped! Let us know your favourite piece…",
                  "Notre nouvelle collection d'automne vient de sortir ! Dites-nous quelle pièce vous préférez…"
                )}
              </p>
            </div>
          </div>

          {/* Post image placeholder */}
          <div className="mt-4">
            <img
              src={Automn}
              alt={t("Autumn pottery collection", "Collection de poterie d'automne")}
              className="w-full h-48 md:h-56 object-cover rounded-xl shadow-sm"
            />
          </div>

          {/* Approval buttons */}
          <div className="mt-4 flex gap-2 justify-center">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <X className="w-4 h-4" />
              {t("Reject", "Refuser")}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition">
              <Check className="w-4 h-4" />
              {t("Approve", "Approuver")}
            </button>
          </div>
        </div>
      </div>

      {/* === Learn More Button – Bottom Left === */}
      <div className="mt-auto">
                <a
          href="#"
          className="bg-[#3C48F6] text-white font-semibold py-3 px-6 rounded-3xl flex items-center justify-center gap-2 w-fit transition-transform duration-400 hover:scale-105 hover:shadow-3xl hover:bg-[#3C48F6] ease-in-out"
        >
          {t("Learn more", "En savoir plus")}
        </a>
      </div>
    </div>
  );
}
