'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, CheckCircle, Target, Zap, DollarSign, Megaphone, 
  MessageSquare, Sliders, ArrowRight, Loader2, Send, 
  Instagram, Youtube, Twitter, Linkedin, Github
} from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import SpinningLoader from '@/src/components/SpinningLoader';
import { getCookie } from 'cookies-next';

// --- TYPES ---
interface Application {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  totalFollowers: number;
  niche: string;
  createdAt: string;
}

export default function CreatorFundPage() {
  const [activeTab, setActiveTab] = useState<'benefits' | 'apply'>('benefits');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    totalFollowers: '',
    niche: '',
    message: '',
    tiktokHandle: '',
    instagramHandle: '',
    youtubeHandle: '',
    twitterHandle: '',
    linkedinHandle: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load status
  useEffect(() => {
    const fetchStatus = async () => {
      const token = getCookie('accessToken');
      if (!token) {
        setIsLoadingApp(false);
        return;
      }

      try {
        const res = await api.get<Application>('/creator-fund/my-application');
        if (res) setApplication(res);
      } catch (e) {
        // Not logged in or no app
      } finally {
        setIsLoadingApp(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.totalFollowers || !formData.niche) {
      toast.error("Please provide follower count and niche.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<Application>('/creator-fund/apply', {
        ...formData,
        totalFollowers: parseInt(formData.totalFollowers)
      });
      setApplication(res);
      toast.success("Application submitted successfully!");
      setActiveTab('benefits'); // Switch back to see status
    } catch (error: any) {
      const msg = error.response?.data?.message || "Submission failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingApp) return <SpinningLoader fullScreen={true} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#3C48F5] selection:text-white">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
        
        {/* HERO */}
        <section className="text-center mb-20 relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#3C48F5]/20 rounded-full blur-[100px] pointer-events-none" />
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block mb-6">
              <span className="bg-[#3C48F5] text-white px-6 py-2 font-black text-sm uppercase tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_0px_#fff]">
                  Creator_Fund
              </span>
           </motion.div>
           <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
             Fuel Your<br/>
             <span className="text-transparent text-stroke-white italic">Influence.</span>
           </h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto font-bold leading-relaxed mb-10">
             We're looking for the next generation of African creators. Get funded, get promoted, and get the tools you need to reach millions.
           </p>

           <div className="flex justify-center gap-6">
              <button 
                onClick={() => setActiveTab('benefits')}
                className={`px-8 py-4 font-black uppercase border-4 border-white transition-all shadow-[8px_8px_0px_0px_#3C48F5] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${activeTab === 'benefits' ? 'bg-white text-black' : 'bg-transparent text-white'}`}
              >
                The Program
              </button>
              <button 
                onClick={() => setActiveTab('apply')}
                className={`px-8 py-4 font-black uppercase border-4 border-white transition-all shadow-[8px_8px_0px_0px_#3C48F5] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${activeTab === 'apply' ? 'bg-white text-black' : 'bg-transparent text-white'}`}
              >
                {application ? 'My Application' : 'Apply Now'}
              </button>
           </div>
        </section>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === 'benefits' ? (
            <motion.div key="benefits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-24">
                
                {/* STATUS BAR (if applied) */}
                {application && (
                    <div className="bg-[#3C48F5] border-4 border-white p-6 flex flex-col md:flex-row items-center justify-between shadow-[12px_12px_0px_0px_#000]">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <CheckCircle className="w-10 h-10 text-white animate-pulse" />
                            <div>
                                <p className="font-black uppercase text-xs opacity-80">Application Status</p>
                                <p className="text-2xl font-black uppercase tracking-tighter">Your request is {application.status}</p>
                            </div>
                        </div>
                        <p className="text-sm font-mono font-bold bg-black text-white px-4 py-2 border-2 border-white">ID: CF-{application.id.substring(0,8)}</p>
                    </div>
                )}

                {/* 3-COL GRID: BENEFITS */}
                <div className="grid md:grid-cols-3 gap-8">
                    <BenefitCard title="Free Pro Access" desc="Unlock 12 months of EasyPost Pro Plan. Unlimited posts, deep analytics, and AI Magic included." />
                    <BenefitCard title="Cash Stipend" desc="Receive up to 50,000 FCFA/month to support your content production and gear." />
                    <BenefitCard title="Global Reach" desc="We feature your profile and content across our social nodes reaching 100k+ users." />
                </div>

                {/* ELIGIBILITY SECTION */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="bg-zinc-900 border-4 border-white p-10 shadow-[16px_16px_0px_0px_#3C48F5]">
                        <h2 className="text-4xl font-black uppercase mb-8">Eligibility</h2>
                        <ul className="space-y-6">
                            <EligibilityItem text="1,000+ followers on at least one platform." />
                            <EligibilityItem text="Consistent posting (min 3 posts/week)." />
                            <EligibilityItem text="Niche alignment (Tech, Business, Marketing)." />
                            <EligibilityItem text="Primarily Francophone/African audience." />
                        </ul>
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Your<br/><span className="text-[#3C48F5]">Commitment.</span></h2>
                        <p className="text-xl text-gray-400 font-bold">Joining the fund means becoming a partner. We grow together.</p>
                        <div className="space-y-4">
                            <CommitmentItem icon={<MessageSquare />} text="Active participation in our Discord community." />
                            <CommitmentItem icon={<CheckCircle />} text="2 posts per month mentioning EasyPost." />
                            <CommitmentItem icon={<Target />} text="1 tutorial or platform review per quarter." />
                        </div>
                    </div>
                </div>
            </motion.div>
          ) : (
            <motion.div key="apply" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
                {application && application.status === 'PENDING' ? (
                    <div className="bg-zinc-900 border-4 border-white p-12 text-center">
                        <Trophy className="w-20 h-20 text-[#3C48F5] mx-auto mb-6" />
                        <h2 className="text-3xl font-black uppercase mb-4">Application Received!</h2>
                        <p className="text-gray-400 font-bold mb-8">Our team is reviewing your profile. Expect a response via email within 3-5 business days.</p>
                        <button onClick={() => setActiveTab('benefits')} className="px-8 py-3 bg-white text-black font-black uppercase border-2 border-black">Back to Program</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white text-black border-4 border-white p-8 md:p-12 shadow-[16px_16px_0px_0px_#3C48F5] space-y-8">
                        <h2 className="text-3xl font-black uppercase border-b-4 border-black pb-4 mb-8">Apply for Fund</h2>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest">Total Followers</label>
                                <input 
                                    type="number" required placeholder="e.g. 1500" 
                                    value={formData.totalFollowers} onChange={e => setFormData({...formData, totalFollowers: e.target.value})}
                                    className="w-full bg-gray-50 border-4 border-black p-4 font-black focus:bg-blue-50 outline-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest">Niche / Industry</label>
                                <input 
                                    type="text" required placeholder="e.g. Fashion, Tech" 
                                    value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})}
                                    className="w-full bg-gray-50 border-4 border-black p-4 font-black focus:bg-blue-50 outline-none" 
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black uppercase tracking-widest">Social Handles</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <SocialInput icon={<SiTiktok />} placeholder="TikTok" value={formData.tiktokHandle} onChange={v => setFormData({...formData, tiktokHandle: v})} />
                                <SocialInput icon={<Instagram />} placeholder="Instagram" value={formData.instagramHandle} onChange={v => setFormData({...formData, instagramHandle: v})} />
                                <SocialInput icon={<Youtube />} placeholder="YouTube" value={formData.youtubeHandle} onChange={v => setFormData({...formData, youtubeHandle: v})} />
                                <SocialInput icon={<Twitter />} placeholder="Twitter/X" value={formData.twitterHandle} onChange={v => setFormData({...formData, twitterHandle: v})} />
                                <SocialInput icon={<Linkedin />} placeholder="LinkedIn" value={formData.linkedinHandle} onChange={v => setFormData({...formData, linkedinHandle: v})} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-widest">Why should we pick you?</label>
                            <textarea 
                                rows={4} placeholder="Tell us about your audience and goals..." 
                                value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                                className="w-full bg-gray-50 border-4 border-black p-4 font-bold focus:bg-blue-50 outline-none resize-none" 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-[#3C48F5] text-white font-black uppercase py-5 text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <>Send Application <Send size={24} /></>}
                        </button>
                    </form>
                )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface BenefitCardProps {
    title: string;
    desc: string;
}

function BenefitCard({ title, desc }: BenefitCardProps) {
    return (
        <div className="bg-zinc-900 border-2 border-zinc-800 p-8 hover:border-[#3C48F5] transition-colors group">
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter">{title}</h3>
            <p className="text-gray-500 font-bold leading-relaxed">{desc}</p>
        </div>
    )
}

function EligibilityItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-4">
            <div className="w-6 h-6 bg-[#3C48F5] border-2 border-white rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">{text}</span>
        </li>
    )
}

interface CommitmentItemProps {
    icon: React.ReactElement;
    text: string;
}

function CommitmentItem({ icon, text }: CommitmentItemProps) {
    return (
        <div className="flex items-center gap-4 p-4 bg-zinc-900 border-2 border-zinc-800">
            <div className="text-[#3C48F5]">{React.cloneElement(icon, { size: 20 } as any)}</div>
            <span className="font-bold uppercase text-xs tracking-wider">{text}</span>
        </div>
    )
}

interface SocialInputProps {
    icon: React.ReactNode;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
}

function SocialInput({ icon, placeholder, value, onChange }: SocialInputProps) {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
            <input 
                type="text" placeholder={placeholder} 
                value={value} onChange={e => onChange(e.target.value)}
                className="w-full pl-10 pr-2 py-2 bg-gray-50 border-2 border-black text-xs font-bold focus:bg-blue-50 outline-none" 
            />
        </div>
    )
}