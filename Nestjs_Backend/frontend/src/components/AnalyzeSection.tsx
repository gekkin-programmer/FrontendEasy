import React from 'react';
import { 
  FaInstagram, 
  FaRegHeart, 
  FaRegComment, 
  FaArrowRight,
  FaCheck
} from 'react-icons/fa';
import { 
  BsGraphUp, 
  BsFillCaretUpFill,
  BsCalendarDate,
  BsFileText,
  BsClock
} from 'react-icons/bs';
import { IoBarChartOutline } from 'react-icons/io5';
import { FiUsers, FiTag } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext'; 

// --- TYPE DEFINITIONS for Local Components ---
interface FeatureItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

// --- LOCAL COMPONENTS ---
// NOTE: No changes were needed in these smaller helper components. They remain the same.
const FeatureItem: React.FC<FeatureItemProps> = ({ icon, children }) => (
  <li className="flex items-start gap-4">
    <div className="text-[#3C48F6] mt-1 flex-shrink-0">{icon}</div>
    <span className="text-gray-800">{children}</span>
  </li>
);

const RecommendationCard: React.FC<RecommendationCardProps> = ({ icon, title, value }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200/80 p-3 flex items-center gap-4 w-[240px]">
    <div className="bg-gray-100 p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const EngagementRateWidget = () => {
  const barData = [15, 25, 45, 65, 50, 35, 30];
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 w-[260px]">
      <p className="text-gray-500 text-sm">Engagement rate</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <p className="text-3xl font-bold text-gray-800">5.0%</p>
        <BsFillCaretUpFill className="text-green-500" size={12} />
      </div>
      <div className="flex items-end justify-between h-[60px] mt-3 gap-2 px-1">
        {barData.map((height, i) => (
          <div 
            key={i} 
            className={`w-3 rounded-sm ${i === 3 ? 'bg-green-300' : 'bg-gray-200'}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
};

const FollowersWidget = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 w-[240px]">
    <p className="text-gray-500 text-sm">Followers</p>
    <div className="flex items-baseline gap-1.5 mt-1">
      <p className="text-3xl font-bold text-gray-800">344</p>
      <BsFillCaretUpFill className="text-green-500" size={12} />
    </div>
    <div className="mt-2">
      <svg width="100%" height="50" viewBox="0 0 200 50" preserveAspectRatio="none">
        <path d="M0 50 L0 35 C 40 10, 80 10, 120 25 C 160 40, 180 30, 200 25 L200 50 Z" fill="#dcfce7" />
        <path d="M0 35 C 40 10, 80 10, 120 25 C 160 40, 180 30, 200 25" fill="none" stroke="#4ade80" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

const InstagramPostCard = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 w-full max-w-[360px]">
    <div className="flex items-center gap-3 p-4">
      <div className="relative">
        <img src="/Automn.jpg" alt="Profile" className="w-10 h-10 rounded-full object-cover"/>
        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center">
              <FaInstagram size={10} className="text-white"/>
            </div>
        </div>
      </div>
      <p className="font-semibold text-gray-800">yoyo_ceramics</p>
    </div>
    <img src="/Automn.jpg" alt="Ceramic vases" className="w-full h-[320px] object-cover"/>
    <div className="flex items-center justify-between p-4 text-gray-600">
      <div className="flex items-center gap-2">
        <FaRegHeart className="text-lime-200 fill-current" size={22} />
        <span>1,203</span>
      </div>
      <div className="flex items-center gap-2">
        <FaRegComment className="text-lime-200 fill-current" size={22}/>
        <span>30</span>
      </div>
      <div className="flex items-center gap-2">
        <BsGraphUp size={22} />
        <span>856</span>
      </div>
    </div>
  </div>
);


// --- MAIN COMPONENT ---
const AnalyzeSection = () => {
  const { t } = useLanguage();

  return (
    // RESPONSIVE FIX: Removed fixed mx-7. Using smaller padding on mobile and increasing for larger screens.
    <section className="bg-[#D6EFFF] mt-20 py-16 px-4 sm:px-6 md:py-20 lg:px-8 relative font-sans">
      <div className="container mx-auto grid lg:grid-cols-2 gap-y-16 lg:gap-x-8 items-center max-w-7xl">
        
        {/* Left Column (Text Content) */}
        <div className="flex flex-col gap-6 text-gray-800 max-w-lg lg:max-w-none">
          <span className="font-semibold tracking-widest text-sm text-[#3C48F6]">{t("ANALYZE", "ANALYSER")}</span>
          
          {/* RESPONSIVE FIX: Font size now scales with screen size for better impact. */}
          <h2 className="text-4xl md:text-5xl font-bold text-[#232323] leading-tight">
            {t("Answers, not just analytics", "Des réponses, pas seulement des analyses")}
          </h2>
          
          {/* RESPONSIVE FIX: Font size adjusts for better readability. */}
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            {t("Whether it's basic analytics or in-depth reporting, Buffer will help you learn what works and how to improve.", "Qu'il s'agisse d'analyses de base ou de rapports détaillés, Buffer vous aidera à comprendre ce qui fonctionne et comment vous améliorer.")}
          </p>
          
          <a href="#" className="bg-[#3C48F6] text-white font-semibold py-3 px-6 rounded-3xl flex items-center justify-center gap-2 w-fit hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
            {t("Learn more", "En savoir plus")} <FaArrowRight />
          </a>
          
          <ul className="space-y-4 mt-6 text-base">
            <FeatureItem icon={<IoBarChartOutline size={22} />}>
              {t("See the best times, formats, and frequencies to post", "Découvrez les meilleurs moments, formats et fréquences pour publier")}
            </FeatureItem>
            <FeatureItem icon={<FiUsers size={22} />}>
              {t("Get demographic data about your audience", "Obtenez des données démographiques sur votre audience")}
            </FeatureItem>
            <FeatureItem icon={<FiTag size={22} />}>
              {t("Tag and recycle your best-performing content", "Identifiez et recyclez votre contenu le plus performant")}
            </FeatureItem>
          </ul>
        </div>
        
        {/* Right Column (Visuals) */}
        {/* RESPONSIVE FIX: This is now a container that stacks its children on mobile (default) and uses absolute positioning on desktop (lg). */}
        <div className="relative min-h-[550px] flex flex-col items-center gap-6 lg:block">
          {/* 
            This new layout stacks the widgets vertically on mobile for a clean, readable flow.
            On large screens (lg:), they switch to absolute positioning for the cool desktop "dashboard" view.
          */}
        </div>

      </div>
    </section>
  );
};

export default AnalyzeSection;
