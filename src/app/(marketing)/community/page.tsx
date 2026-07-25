'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Github, Twitter, Heart, Users, UploadCloud, 
  Check, X, ThumbsUp, Filter, Search, Loader2, Send
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

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

interface Contributor {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  _count: {
    posts: number;
    communityFeedback: number;
  }
}

const StatusBadge = ({ status }: { status: FeedbackStatus }) => {
  const { t } = useLanguage();
  const styles: Record<FeedbackStatus, string> = {
    UNDER_REVIEW: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700',
    PLANNED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/50',
    IN_PROGRESS: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50',
    COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50',
  };
  
  const labels: Record<FeedbackStatus, string> = {
    UNDER_REVIEW: t('Under Review', 'En révision'),
    PLANNED: t('Planned', 'Planifié'),
    IN_PROGRESS: t('In Progress', 'En cours'),
    COMPLETED: t('Shipped', 'Déployé'),
  };

  return (
    <span className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: FeedbackCategory }) => {
    const icons: Record<FeedbackCategory, string> = { FEATURE: '✨', BUG: '🐛', PERFORMANCE: '⚡', OTHER: '💡' };
    return <span className="text-[10px] font-black uppercase border-2 border-black dark:border-white px-2 py-1 bg-black text-white">{icons[category]} {category}</span>;
};

export default function CommunityPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'submit'>('roadmap');
  const [roadmapData, setRoadmapData] = useState<FeedbackItem[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('FEATURE');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roadmap, contribs] = await Promise.all([
          api.get<any[]>('/community/roadmap'),
          api.get<any[]>('/community/contributors')
        ]);
        setRoadmapData(roadmap);
        setContributors(contribs);
      } catch (e) {
        console.error("Data fetch failed", e);
      } finally {
        setIsLoadingRoadmap(false);
      }
    };
    fetchData();
  }, []);

  const handleUpvote = async (id: string) => {
// ...
  };

  const handleSubmit = async (e: React.FormEvent) => {
// ...
  };

  // Helper for date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('just now', 'à l\'instant');
    const date = new Date(dateStr);
    return date.toLocaleDateString(t('en-US', 'fr-FR'), { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-[#3C48F5] selection:text-white">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#3C48F5]/20 rounded-full blur-[100px] pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block mb-4">
             <div className="bg-[#3C48F5] text-white px-4 py-1 font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                {t('Community Hub', 'Espace Communauté')}
             </div>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            {t('Build ', 'Construisez ')}<br/>
            <span className="text-black dark:text-transparent dark:text-stroke-white italic">EasyPost</span> {t('With Us.', 'Avec Nous.')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-bold">
            {t('Vote on features, report bugs, and chat with the team. We ship updates every week based on your feedback.', 'Votez pour les fonctionnalités, signalez des bugs et discutez avec l\'équipe. Nous publions des mises à jour chaque semaine.')}
          </p>
        </section>

        {/* TABS & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b-4 border-black dark:border-white pb-6">
            <div className="flex gap-4">
                <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`px-8 py-4 font-black uppercase text-sm border-4 border-black dark:border-white transition-all shadow-[8px_8px_0px_0px_#3C48F5] hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${activeTab === 'roadmap' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                >
                    {t('Public Roadmap', 'Feuille de Route')}
                </button>
                <button
                    onClick={() => setActiveTab('submit')}
                    className={`px-8 py-4 font-black uppercase text-sm border-4 border-black dark:border-white transition-all shadow-[8px_8px_0px_0px_#3C48F5] hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${activeTab === 'submit' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-transparent text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                >
                    {t('Submit Idea', 'Soumettre une Idée')}
                </button>
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
                            className="space-y-8"
                        >
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 md:gap-3 pb-2">
                                {['All', 'Planned', 'In Progress', 'Shipped'].map(f => (
                                    <button key={f} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white text-xs font-black uppercase tracking-widest hover:bg-[#3C48F5] hover:text-white hover:border-[#3C48F5] transition-colors">
                                        {t(f, f)}
                                    </button>
                                ))}
                            </div>

                            {/* List */}
                            {isLoadingRoadmap ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin w-16 h-16 text-[#3C48F5]" /></div>
                            ) : roadmapData.length === 0 ? (
                                <div className="py-32 text-center border-4 border-dashed border-zinc-300 dark:border-zinc-800 font-black uppercase text-zinc-400 dark:text-zinc-600 text-2xl">{t('No suggestions yet. Be the first!', 'Aucune suggestion pour le moment. Soyez le premier !')}</div>
                            ) : roadmapData.map((item) => (
                                <div key={item.id} className="group relative bg-zinc-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-8 shadow-[12px_12px_0px_0px_#3C48F5] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                    <div className="flex items-start gap-8">
                                        {/* Vote Box */}
                                        <button 
                                            onClick={() => handleUpvote(item.id)}
                                            className={`flex flex-col items-center justify-center w-20 h-20 border-4 border-black dark:border-white flex-shrink-0 transition-all ${item.hasUpvoted ? 'bg-black dark:bg-white text-white dark:text-black -translate-y-1 shadow-[4px_4px_0px_0px_#3C48F5]' : 'bg-white dark:bg-black text-black dark:text-white hover:bg-[#3C48F5] hover:text-white hover:border-[#3C48F5]'}`}
                                        >
                                            <div className="text-[10px] font-black uppercase">{t('Vote', 'Voter')}</div>
                                            <div className="text-3xl font-black">{item.upvotes}</div>
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                <StatusBadge status={item.status} />
                                                <CategoryBadge category={item.category} />
                                                <span className="text-xs text-zinc-500 dark:text-zinc-500 font-mono font-bold tracking-tighter uppercase">{formatDate(item.createdAt)}</span>
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight mb-3 truncate">{item.title}</h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed text-sm">
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
                            className="bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white p-10 shadow-[16px_16px_0px_0px_#3C48F5]"
                        >
                            <h2 className="text-4xl font-black uppercase mb-10 border-b-4 border-black dark:border-white pb-4 flex items-center gap-4">
                                <Send size={32} /> {t('Submit Feedback', 'Soumettre')}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t('Title', 'Titre')}</label>
                                    <input
                                        value={title} onChange={e => setTitle(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-4 font-black text-lg text-black dark:text-white focus:bg-blue-50 dark:focus:bg-zinc-800 outline-none"
                                        placeholder={t("e.g. Add dark mode to calendar", "ex: Ajouter le mode sombre au calendrier")}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t('Category', 'Catégorie')}</label>
                                        <select
                                            value={category} onChange={e => setCategory(e.target.value as any)}
                                            className="w-full bg-gray-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-4 font-black uppercase appearance-none outline-none cursor-pointer text-black dark:text-white"
                                        >
                                            <option value="FEATURE"> {t('Feature Request', 'Fonction')}</option>
                                            <option value="BUG"> {t('Bug Report', 'Bug')}</option>
                                            <option value="PERFORMANCE"> {t('Performance', 'Perf')}</option>
                                            <option value="OTHER"> {t('Other', 'Autre')}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t('Urgency', 'Urgence')}</label>
                                        <select className="w-full bg-gray-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-4 font-black uppercase appearance-none outline-none cursor-pointer text-black dark:text-white">
                                            <option>{t('Low', 'Basse')}</option>
                                            <option>{t('Medium', 'Moyenne')}</option>
                                            <option>{t('High', 'Haute')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t('Description', 'Description')}</label>
                                    <textarea
                                        value={description} onChange={e => setDescription(e.target.value)}
                                        rows={5}
                                        className="w-full bg-gray-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-4 font-bold text-sm text-black dark:text-white focus:bg-blue-50 dark:focus:bg-zinc-800 outline-none resize-none leading-relaxed"
                                        placeholder={t("Describe your idea or the bug you found...", "Décrivez votre idée ou le bug trouvé...")}
                                    />
                                </div>

                                {/* Screenshot Upload */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t('Screenshot (Optional)', 'Visuel')}</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-4 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 cursor-pointer p-10 flex flex-col items-center justify-center transition-all group"
                                    >
                                        <input 
                                            type="file" ref={fileInputRef} className="hidden" accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        {file ? (
                                            <div className="flex items-center gap-3 text-[#3C48F5] font-black uppercase text-sm">
                                                <Check strokeWidth={4} /> {file.name}
                                                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black transition-all"><X size={16}/></button>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-12 h-12 text-gray-400 dark:text-zinc-600 group-hover:scale-110 transition-transform mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-zinc-600">{t('Drop visual proof here', 'Glissez une preuve visuelle')}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-[#3C48F5] text-white font-black uppercase py-6 text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>{t('Submit Feedback', 'Soumettre au Board')} <Send size={24} /></>}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: Sidebar Stats */}
            <div className="lg:col-span-4 space-y-10">
                
                {/* Contributors */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-8 shadow-[12px_12px_0px_0px_#3C48F5]">
                    <h3 className="font-black text-2xl uppercase mb-8 flex items-center gap-3 text-black dark:text-white">
                        <Users size={24} color="#3C48F5" className="shrink-0" /> {t('Top Contributors', 'Contributeurs')}
                    </h3>
                    <div className="space-y-6">
                        {contributors.length === 0 ? (
                            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 uppercase">Indexing contributors...</p>
                        ) : contributors.map((user, i) => (
                            <div key={user.id} className="flex items-center gap-4 bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-3 hover:border-black dark:hover:border-white transition-colors">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white overflow-hidden flex-shrink-0">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black">{user.firstName[0]}</div>}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black uppercase truncate">{user.firstName} {user.lastName}</p>
                                    <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase">
                                        {user._count.posts} Posts • {user._count.communityFeedback} Ideas
                                    </p>
                                </div>
                                <div className="ml-auto font-black" style={{ color: '#3C48F5' }}>#{i+1}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>

      </main>
    </div>
  );
}

function StatusLine({ label, count, color }: any) {
    return (
        <div className="flex justify-between items-center text-sm font-black uppercase tracking-tighter">
            <span>{label}</span>
            <span className={`${color} px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]`}>{count}</span>
        </div>
    )
}
