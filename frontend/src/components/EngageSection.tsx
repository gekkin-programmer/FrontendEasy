import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProfilePic from '../assets/Profile pic.svg';
import YungEra from '../assets/YungEra.jpg';
import Avatar from '../assets/Avatar.svg';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // adjust path if needed

// --- CommentItem Component (with improved styling) ---
function CommentItem({
  avatar,
  name,
  text,
  time,
}: {
  avatar: string;
  name: string;
  text: string;
  time: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-3">
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
      />
      <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2">
        <p className="text-sm">
          <span className="font-semibold text-gray-900">{name}</span>{' '}
          <span className="text-gray-800">{t(text, text)}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{t(time, time)}</p>
      </div>
    </div>
  );
}


export default function EngageSection() {
  const { t } = useLanguage();
  // LOGIC: State to handle the one-shot reply functionality.
  const [hasReplied, setHasReplied] = useState(false);
  const [replyText, setReplyText] = useState('This looks amazing! How can I join?');

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setHasReplied(true);
  };


  return (
    // RESPONSIVE: Added responsive padding for different screen sizes.
    <div className="relative bg-lime-100 rounded-3xl mt-8 p-6 sm:p-8 md:p-10 shadow-sm overflow-hidden h-full flex flex-col">
      
      {/* === Top: Text Content === */}
      <div className="space-y-4 md:space-y-6 flex-1 z-20"> {/* RESPONSIVE: Less vertical space on mobile */}
        <p className="text-lime-600 font-medium uppercase tracking-wider text-sm">
          {t("Engage", "Engager")}
        </p>

        {/* RESPONSIVE: Font size scales with screen size for better visual hierarchy. */}
        <h2 className="text-3xl sm:text-4xl lg:text-3xl font-semibold text-gray-900 leading-tight max-w-2xl">
          {t("Reply To Comments in a Flash", "Répondez aux commentaires en un éclair")}
        </h2>

        {/* RESPONSIVE: Font size adjusts for better readability on larger screens. */}
        <p className="text-gray-700 text-base lg:text-lg leading-relaxed max-w-3xl">
          {t("Engage with your audience on Facebook and Instagram at", "Interagissez avec votre audience sur Facebook et Instagram à")}
          <span className="font-bold"> {t("10× speed", "10× plus vite")}</span>.
          {t(" Buffer will help you triage and respond to comments from one simple dashboard.", " Buffer vous aidera à trier et répondre aux commentaires depuis un tableau de bord simple.")}
        </p>
      </div>

      {/* === Visual Showcase: Instagram Comment Panel === */}
      <motion.div
        className="relative mt-12 md:mt-8 mb-12 md:mb-16 z-0" // RESPONSIVE: Adjusted margins.
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 max-w-sm sm:max-w-md mx-auto space-y-4 z-20">
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t("3 unanswered comments", "3 commentaires non répondus")}</span>
            <button className="underline hover:text-gray-700">{t("Hide", "Cacher")}</button>
          </div>

          <div className="flex gap-3 border-b border-gray-200 pb-4">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop"
              alt="Knit-along project"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-sm flex-shrink-0" // RESPONSIVE: Smaller image on mobile.
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {t("I’m starting a monthly virtual knit-along where we can all work on the same project together! Who’s in?", "Je commence un tricot collaboratif virtuel mensuel où nous pourrons tous travailler sur le même projet ! Qui est partant ?")}
              </p>
              <div className="flex gap-2 mt-2 text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{t("12 hours ago", "Il y a 12 heures")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <CommentItem avatar={ProfilePic} name="rachelastral" text="Love this idea! How do I sign up?" time="5h" />
            
            {/* LOGIC: Show your reply only after the button has been clicked. */}
            {hasReplied && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <CommentItem avatar={Avatar} name="You" text={replyText} time="1s" />
              </motion.div>
            )}

            <CommentItem avatar={YungEra} name="Creator Yung Era" text="I like this huh!" time="45m" />
          </div>

          {/* LOGIC: Show the reply form only if you haven't replied yet. */}
          {!hasReplied && (
            <form onSubmit={handleReply} className="flex items-center flex-wrap sm:flex-nowrap gap-2 pt-4 border-t border-gray-200">
              <img src={Avatar} alt={t("you", "vous")} className="w-8 h-8 rounded-full" />
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("Reply...", "Répondre...")}
                className="flex-1 min-w-0 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition disabled:bg-gray-300"
                disabled={!replyText.trim()}
              >
                {t("Reply", "Répondre")}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* === Learn More Button – Bottom Left === */}
      <div className="mt-auto z-20">
        <a href="#" className="bg-[#3C48F6] text-white font-medium text-base py-2.5 px-5 sm:py-3 sm:px-6 rounded-3xl flex items-center justify-center gap-2 w-fit transition-transform duration-300 hover:scale-105 hover:shadow-lg">
          {t("Learn more", "En savoir plus")}
        </a>
      </div>
    </div>
  );
}
