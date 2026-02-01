'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Github, Twitter, Heart, Users, UploadCloud, 
  Check, X, ThumbsUp, Filter, Search, Loader2, Send
} from 'lucide-react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { toast } from 'sonner';
import { api } from '@/src/lib/api'; 
import { useLanguage } from '@/src/context/LanguageContext';

// --- TYPES ---
type FeedbackStatus = 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
type FeedbackCategory = 'FEATURE' | 'BUG' | 'PERFORMANCE' | 'OTHER';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  upvotes: number;
  hasUpvoted: boolean; 
  author?: { firstName: string; avatar?: string };
  createdAt: string;
}

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: FeedbackStatus }) => {
  const { t } = useLanguage();
  const styles: Record<FeedbackStatus, string> = {
    UNDER_REVIEW: 'bg-gray-200 text-gray-600 border-gray-400',
    PLANNED: 'bg-blue-100 text-blue-700 border-blue-300',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-400',
    COMPLETED: 'bg-green-100 text-green-700 border-green-400',
  };
  
  const labels: Record<FeedbackStatus, string> = {
    UNDER_REVIEW: t('Under Review', 'En révision'),
    PLANNED: t('Planned', 'Planifié'),
    IN_PROGRESS: t('In Progress', 'En cours'),
    COMPLETED: t('Shipped 🚀', 'Déployé 🚀'),
  };

  return (
    <span className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-wider rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: FeedbackCategory }) => {
    const icons: Record<FeedbackCategory, string> = { FEATURE: '✨', BUG: '🐛', PERFORMANCE: '⚡', OTHER: '💡' };
    return <span className="text-xs font-bold uppercase border border-black px-2 py-0.5 bg-white shadow-[2px_2px_0px_0px_#000]">{icons[category]} {category}</span>;
};

const CommunitySocialBtn = ({ icon, href, label, color }: any) => (
    <a href={href} className={`w-10 h-10 flex items-center justify-center border-2 border-black text-white shadow-[2px_2px_0px_0px_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all ${color}`} title={label}>
        {icon}
    </a>
);

export default function CommunityPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'submit'>('roadmap');
  const [roadmapData, setRoadmapData] = useState<FeedbackItem[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('FEATURE');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FETCH ROADMAP ---
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get<any[]>('/community/roadmap');
        setRoadmapData(res);
      } catch (e) {
        console.error("Roadmap fetch failed", e);
      } finally {
        setIsLoadingRoadmap(false);
      }
    };
    fetchRoadmap();
  }, []);

  const handleUpvote = async (id: string) => {
    try {
        const res = await api.post<any>(`/community/feedback/${id}/upvote`, {});
        // Update local state
        setRoadmapData(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    upvotes: res.upvoted ? item.upvotes + 1 : item.upvotes - 1,
                    hasUpvoted: res.upvoted
                };
            }
            return item;
        }));
        toast.success(res.upvoted ? t("Vote added!", "Vote ajouté !") : t("Vote removed", "Vote retiré"));
    } catch (e) {
        toast.error(t("Login to vote!", "Connectez-vous pour voter !"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
        toast.error(t("Please fill in all fields", "Veuillez remplir tous les champs"));
        return;
    }

    setIsSubmitting(true);

    try {
        const payload = {
            title,
            description,
            category,
            screenshotUrl: "" 
        };

        await api.post('/community/feedback', payload);

        toast.success(t("Feedback submitted!", "Feedback soumis !"), {
            description: t("We'll review it soon.", "Nous l'examinerons bientôt.")
        });
        
        // Reset and refresh
        setTitle('');
        setDescription('');
        setFile(null);
        const res = await api.get<any[]>('/community/roadmap');
        setRoadmapData(res);
        setActiveTab('roadmap');

    } catch (error) {
        toast.error(t("Login required to submit feedback.", "Connexion requise pour soumettre un feedback."));
    } finally {
        setIsSubmitting(false);
    }
  };

  // Helper for date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('just now', 'à l\'instant');
    const date = new Date(dateStr);
    return date.toLocaleDateString(t('en-US', 'fr-FR'), { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white font-sans selection:bg-[#3C48F5] selection:text-white">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block mb-4">
             <div className="bg-black text-white px-4 py-1 font-black text-sm uppercase tracking-widest -rotate-2 shadow-[4px_4px_0px_0px_#3C48F5]">
                {t('Community Hub', 'Espace Communauté')}
             </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
            {t('Build ', 'Construisez ')} <span className="text-[#3C48F5] underline decoration-4 underline-offset-4 decoration-black dark:decoration-white">EasyPost</span><br/>{t('With Us.', 'Avec Nous.')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            {t('Vote on features, report bugs, and chat with the team. We ship updates every week based on your feedback.', 'Votez pour les fonctionnalités, signalez des bugs et discutez avec l\'équipe. Nous publions des mises à jour chaque semaine.')}
          </p>
        </section>

        {/* TABS & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b-4 border-black dark:border-gray-700 pb-6">
            <div className="flex gap-4">
                <button 
                    onClick={() => setActiveTab('roadmap')}
                    className={`px-6 py-3 font-black uppercase text-sm border-2 border-black transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${activeTab === 'roadmap' ? 'bg-[#3C48F5] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                >
                    {t('Public Roadmap', 'Feuille de Route')}
                </button>
                <button 
                    onClick={() => setActiveTab('submit')}
                    className={`px-6 py-3 font-black uppercase text-sm border-2 border-black transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${activeTab === 'submit' ? 'bg-[#3C48F5] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                >
                    {t('Submit Idea', 'Soumettre une Idée')}
                </button>
            </div>

            {/* External Links */}
            <div className="flex gap-3">
                <CommunitySocialBtn icon={<MessageCircle size={20} />} href="#" label="Discord" color="bg-[#5865F2]" />
                <CommunitySocialBtn icon={<Twitter size={20} />} href="#" label="Twitter" color="bg-[#1DA1F2]" />
                <CommunitySocialBtn icon={<Github size={20} />} href="#" label="Github" color="bg-[#333]" />
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="grid lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="lg:col-span-8">
                <AnimatePresence mode='wait'>
                    {activeTab === 'roadmap' ? (
                        <motion.div 
                            key="roadmap"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Filters */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {['All', 'Planned', 'In Progress', 'Shipped'].map(f => (
                                    <button key={f} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-black text-xs font-bold uppercase whitespace-nowrap hover:bg-white transition-colors">
                                        {t(f, f)}
                                    </button>
                                ))}
                            </div>

                            {/* List */}
                            {isLoadingRoadmap ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin w-12 h-12 text-[#3C48F5]" /></div>
                            ) : roadmapData.length === 0 ? (
                                <div className="py-20 text-center border-4 border-dashed border-gray-200 font-black uppercase text-gray-400">{t('No suggestions yet. Be the first!', 'Aucune suggestion pour le moment. Soyez le premier !')}</div>
                            ) : roadmapData.map((item) => (
                                <div key={item.id} className="group relative bg-white dark:bg-gray-900 border-4 border-black dark:border-gray-700 p-6 shadow-[8px_8px_0px_0px_#000] dark:shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                    <div className="flex items-start gap-6">
                                        {/* Vote Box */}
                                        <button 
                                            onClick={() => handleUpvote(item.id)}
                                            className={`flex flex-col items-center justify-center w-16 h-16 border-2 border-black flex-shrink-0 transition-colors ${item.hasUpvoted ? 'bg-[#3C48F5] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                        >
                                            <div className="text-[10px] font-black uppercase mt-1">{t('Vote', 'Voter')}</div>
                                            <div className="text-xl font-black">{item.upvotes}</div>
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <StatusBadge status={item.status} />
                                                <CategoryBadge category={item.category} />
                                                <span className="text-xs text-gray-500 font-mono">• {formatDate(item.createdAt)}</span>
                                            </div>
                                            <h3 className="text-xl font-black uppercase mb-2">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="submit"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white dark:bg-gray-900 border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]"
                        >
                            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                                <Send className="text-[#3C48F5]" /> {t('Submit Feedback', 'Soumettre un Feedback')}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black uppercase mb-2">{t('Title', 'Titre')} <span className="text-red-500">*</span></label>
                                    <input 
                                        value={title} onChange={e => setTitle(e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#3C48F5] transition-all text-black"
                                        placeholder={t("e.g. Add dark mode to calendar", "ex: Ajouter le mode sombre au calendrier")}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-black">
                                    <div>
                                        <label className="block text-sm font-black uppercase mb-2 dark:text-white">{t('Category', 'Catégorie')}</label>
                                        <select 
                                            value={category} onChange={e => setCategory(e.target.value as any)}
                                            className="w-full bg-gray-50 border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#3C48F5]"
                                        >
                                            <option value="FEATURE">✨ {t('Feature Request', 'Demande de fonction')}</option>
                                            <option value="BUG">🐛 {t('Bug Report', 'Signalement de bug')}</option>
                                            <option value="PERFORMANCE">⚡ {t('Performance', 'Performance')}</option>
                                            <option value="OTHER">💡 {t('Other', 'Autre')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase mb-2 dark:text-white">{t('Urgency', 'Urgence')}</label>
                                        <select className="w-full bg-gray-50 border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#3C48F5]">
                                            <option>{t('Low', 'Basse')}</option>
                                            <option>{t('Medium', 'Moyenne')}</option>
                                            <option>{t('High', 'Haute')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black uppercase mb-2">{t('Description', 'Description')} <span className="text-red-500">*</span></label>
                                    <textarea 
                                        value={description} onChange={e => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-50 border-2 border-black p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_#3C48F5] transition-all resize-none text-black"
                                        placeholder={t("Describe your idea or the bug you found...", "Décrivez votre idée ou le bug trouvé...")}
                                    />
                                </div>

                                {/* Screenshot Upload */}
                                <div>
                                    <label className="block text-sm font-black uppercase mb-2">{t('Screenshot (Optional)', 'Capture d\'écran (Optionnel)')}</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-black bg-gray-50 hover:bg-blue-50 cursor-pointer p-8 flex flex-col items-center justify-center transition-colors group"
                                    >
                                        <input 
                                            type="file" ref={fileInputRef} className="hidden" accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        {file ? (
                                            <div className="flex items-center gap-2 text-[#3C48F5] font-bold">
                                                <Check /> {file.name}
                                                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 hover:bg-red-100 rounded text-red-500"><X size={16}/></button>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#3C48F5] mb-2 transition-colors" />
                                                <p className="text-xs font-bold uppercase text-gray-500">{t('Click to upload or drag & drop', 'Cliquez ou glissez-déposez')}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white font-black uppercase py-4 text-lg border-2 border-transparent hover:bg-[#3C48F5] hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>{t('Submit Feedback', 'Soumettre')} <Send size={18} /></>}
                                </button>
                                
                                <p className="text-center text-xs text-gray-500 font-bold mt-2">
                                    {t("We'll notify you via email when the status changes.", "Nous vous préviendrons par email en cas de changement de statut.")}
                                </p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Sidebar Stats */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Contributors */}
                <div className="bg-[#FFE5E5] border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
                    <h3 className="font-black text-xl uppercase mb-4 flex items-center gap-2 text-black">
                        <Users className="text-red-500" /> {t('Top Contributors', 'Contributeurs')}
                    </h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-3 bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
                                <div className="w-10 h-10 bg-gray-200 border-2 border-black overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase text-black">User_{100+i}</p>
                                    <p className="text-xs text-gray-500 font-mono font-bold">{t('12 Ideas Shipped', '12 Idées Déployées')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Summary */}
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] text-black">
                    <h3 className="font-black text-xl uppercase mb-4">{t('Live Status', 'Statut en direct')}</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold border-b border-gray-100 pb-2">
                            <span>{t('Planned', 'Planifié')}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 border border-black">12</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold border-b border-gray-100 pb-2">
                            <span>{t('In Progress', 'En cours')}</span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 border border-black">5</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span>{t('Shipped (v2.0)', 'Déployé (v2.0)')}</span>
                            <span className="bg-green-100 text-green-800 px-2 border border-black">48</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
