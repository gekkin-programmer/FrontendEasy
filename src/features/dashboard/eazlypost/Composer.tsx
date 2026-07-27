'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon, Video, Calendar as CalendarIcon, X, Clock, Send, 
    Facebook, Instagram, Linkedin, Twitter, Tag, LayoutGrid, Plus, Copy, 
    ChevronDown, Check, ShoppingBag, CornerLeftUp, Wand2, FileCheck, Loader2, 
    Sparkles, AlertTriangle, MessageCircle, RefreshCw, Globe, ThumbsUp, MoreHorizontal, Heart, Music
  } from 'lucide-react'; 
import { SiTiktok } from 'react-icons/si';
  
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import MediaGallery from './MediaGallery';

// --- TYPES ---
type AssetType = 'image' | 'video' | 'folder';
interface LibraryItem { id: string; type: AssetType; name?: string; url?: string; parentId: string | null; }
interface TemplateItem { id: number; title: string; content: string; }

interface ComposerProps {
  workspaceId: string;
  accounts: any[]; 
  postToEdit?: any; // New prop
  onSchedule: (
    content: string,
    date?: Date,
    mediaIds?: string[], // ➤ UPDATED: We pass IDs now
    status?: 'DRAFT' | 'SCHEDULED' | 'REVIEW',
    selectedAccountIds?: string[],
    postId?: string, // New arg for update
    workspaceId?: string // New arg for workspace context
  ) => Promise<void>;
}

const CATEGORIES = ['General', 'Technology', 'Marketing', 'Personal', 'News', 'Meme', 'Educational'];

const AI_TONES = [
  { id: 'PROFESSIONAL', label: 'PROFESSIONAL ' },
  { id: 'CASUAL', label: 'CASUAL ' },
  { id: 'CAMFRANGLAIS', label: 'CAMFRANGLAIS ' },
  { id: 'NOUCHI', label: 'NOUCHI ' },
  { id: 'URGENT', label: 'URGENT ' },
];

// --- NEU COMPONENTS ---
const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-black text-xs uppercase tracking-wide transition-all duration-150 border-2 border-black disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  const variants = {
    default: "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-blue-50 dark:hover:bg-zinc-800 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    primary: `bg-[#3C48F5] text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
    ghost: "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none hover:shadow-none translate-0"
  };
  return <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>{children}</button>;
};

const NeuModal = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] w-full max-w-sm overflow-hidden">
                <div className="bg-white text-white p-4 border-b-4 border-black dark:border-white flex justify-between items-center"><span className="font-black uppercase tracking-wider">{title}</span><button onClick={onClose}><X size={24} strokeWidth={3}/></button></div>
                <div className="p-6 text-black dark:text-white">{children}</div>
            </motion.div>
        </div>
    );
};

const RetroFolder = ({ name, onClick }: { name: string, onClick: () => void }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col items-center gap-2 p-2 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors">
    <div className="relative w-16 h-12"><div className="absolute top-0 left-0 w-6 h-3 bg-gray-800 dark:bg-zinc-700 border-2 border-black dark:border-white rounded-t-sm z-0"></div><div className="absolute bottom-0 w-full h-10 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] z-10 group-hover:bg-blue-400 transition-colors flex items-center justify-center"><div className="w-8 h-0.5 bg-black/10 dark:bg-white/10"></div></div></div>
    <span className="text-[10px] font-bold uppercase text-center bg-white dark:bg-zinc-900 px-1 border border-black dark:border-white max-w-full truncate w-full font-mono text-black dark:text-white">{name}</span>
  </div>
);
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (<button onClick={onClick} title={tooltip} className="p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none transition-all text-black dark:text-white"><Icon size={18} strokeWidth={2.5} /></button>);
const PlatformIcon = ({ platform, size = 14 }: { platform?: string, size?: number }) => { switch (platform?.toLowerCase()) { case 'facebook': return <Facebook size={size} className="text-blue-600 fill-blue-600" />; case 'linkedin': return <Linkedin size={size} className="text-blue-700 fill-blue-700" />; case 'twitter': return <Twitter size={size} className="text-black dark:text-white fill-black dark:fill-white" />; case 'instagram': return <Instagram size={size} className="text-pink-600" />; default: return <div style={{width: size, height: size}} className="bg-gray-400 rounded-full" />; }};

const AiSchedulerContent = ({ workspaceId, platform, onSelect }: { workspaceId: string, platform: string, onSelect: (hour: number) => void }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['smart-scheduling', workspaceId, platform],
    queryFn: () => api.get<any>(`/ai/smart-scheduling/suggestions?workspaceId=${workspaceId}&platform=${platform}`),
  });

  return (
    <div className="flex flex-col font-sans">
      <div className="bg-black dark:bg-white text-white dark:text-black p-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <Sparkles size={12} className="text-yellow-400" /> Best_Posting_Times
      </div>
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 animate-pulse">
            <RefreshCw size={12} className="animate-spin" /> ANALYZING_AUDIENCE_PATTERNS...
          </div>
        ) : (
          <>
            <p className="text-[9px] font-bold text-gray-400 uppercase leading-tight mb-2">Based on your historical engagement and industry trends.</p>
            {data?.suggestions?.length > 0 ? data.suggestions.map((s: any, i: number) => (
              <button 
                key={i} 
                onClick={() => onSelect(s.hour)}
                className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white hover:bg-yellow-100 dark:hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                  <span className="text-sm font-black">{s.hour}:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[8px] font-black uppercase px-1.5 py-0.5 border",
                    s.confidence === 'high' ? "bg-green-100 border-green-600 text-green-700" : "bg-blue-100 border-blue-600 text-blue-700"
                  )}>
                    {s.confidence}_CONFIDENCE
                  </span>
                  <span className="text-[10px] font-black text-[#3C48F5]">SELECT</span>
                </div>
              </button>
            )) : (
              <div className="text-[10px] font-bold text-center p-4 border-2 border-dashed border-gray-200 uppercase text-gray-400">
                No data patterns found yet. Publish more nodes to activate AI.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function Composer({ onSchedule, accounts = [], postToEdit, workspaceId }: ComposerProps) {
  /* ---- State ---- */
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date>();
  
  // Populate from postToEdit
  useEffect(() => {
    if (postToEdit) {
      setText(postToEdit.content || '');
      setDate(postToEdit.scheduledFor ? new Date(postToEdit.scheduledFor) : undefined);
      if (postToEdit.mediaUrls) setMediaPreviews(postToEdit.mediaUrls);
      if (postToEdit.socialAccountIds) setSelectedAccountIds(postToEdit.socialAccountIds);
    } else {
      // Reset if null (e.g. cancelled edit)
      setText(''); setDate(undefined); setMediaPreviews([]);
    }
  }, [postToEdit]);
  const [category, setCategory] = useState('General');
  
  // Media State
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // ➤ New State
  
  // AI Params
  const [aiContext, setAiContext] = useState("");
  const [aiTone, setAiTone] = useState(AI_TONES[0].id);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Modals / Data
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [inputFolderName, setInputFolderName] = useState("");
  const [inputTemplateName, setInputTemplateName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [libraryData, setLibraryData] = useState<LibraryItem[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<TemplateItem[]>([{ id: 1, title: 'HASHTAG_SET_1', content: '#Growth #SaaS #Tech #Africa' }]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  // Auto-select accounts
  useEffect(() => {
    if (accounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds(accounts.filter(a => a.isActive !== false).map(a => a.id));
    }
  }, [accounts]);

  // ➤ LOGIC: FETCH MEDIA LIBRARY 
  const fetchLibrary = async () => {
    try {
        const res = await api.get<any>('/media');
        // Handle both { data: [...] } and direct [...] array responses
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        
        const formattedMedia = list.map((m: any) => ({
            id: m.id,
            type: (m.mimeType?.includes('video') ? 'video' : 'image') as AssetType, 
            url: m.url,
            name: m.filename,
            parentId: null
        }));
        setLibraryData(formattedMedia);
    } catch (e) { toast.error("MEDIA_LIBRARY_LOAD_FAILED"); }
  };

  useEffect(() => { if (isLibraryOpen) fetchLibrary(); }, [isLibraryOpen]);

  // ➤ LOGIC: UPLOAD MEDIA (Phase 5 Backend)
  const uploadSingleFile = async (fileToUpload: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      try {
          // Use api.post with headers
          const res = await api.post<any>('/media/upload', formData);
          
          await fetchLibrary(); 
          // Backend returns the created MediaLibrary object
          return res.id || res.data?.id; 
      } catch (e) { 
          toast.error("UPLOAD_FAILED"); 
          return null; 
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setLocalFiles(prev => [...prev, ...selected]);
      const newPreviews = selected.map(file => URL.createObjectURL(file));
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleSelectFromLibrary = (item: LibraryItem) => {
      if (!selectedMediaIds.includes(item.id)) {
          setSelectedMediaIds(prev => [...prev, item.id]);
          setMediaPreviews(prev => [...prev, item.url || '']);
          toast.success("MEDIA_LINKED");
      }
  };

  const removeMedia = (index: number) => {
      setMediaPreviews(prev => prev.filter((_, i) => i !== index));
      // Also remove from localFiles or selectedMediaIds if necessary (simplified for MVP)
  };

  // ➤ LOGIC: AI GENERATION
  const handleAiGenerate = async () => {
    if (!aiContext.trim()) return toast.error("ERR: EMPTY_PROMPT");
    setIsAiGenerating(true);
    
    try {
      const res = await api.post<any>('/ai/test-copywriting', {
        product: aiContext,
        tone: aiTone,
      });
      
      const generatedContent = res.content || res.data?.content;
      const aiUsageCount = res.aiUsageCount || res.data?.aiUsageCount;
      if (!generatedContent) throw new Error("Empty response from AI");

      // Typewriter Effect
      const prefix = text ? "\n\n" : "";
      const textToType = prefix + generatedContent;
      
      let charIndex = 0;
      const TYPEWRITER_SPEED_MS = 15;

      const intervalId = setInterval(() => {
        setText((prev) => prev + textToType.charAt(charIndex));
        charIndex++;
        if (charIndex === textToType.length) {
            clearInterval(intervalId);
            setIsAiGenerating(false);
            setIsAiOpen(false); 
            setAiContext("");
            toast.success("AI: COPY_GENERATED");

            // 🚀 FREEMIUM HOOK: AI USAGE TOAST
            if (aiUsageCount >= 8 && aiUsageCount < 10) {
              setTimeout(() => {
                toast.info(`🎉 ${10 - aiUsageCount} générations restantes ce mois.`, {
                  description: "Passez à STARTER pour 100 générations !",
                  action: {
                    label: "Upgrade",
                    onClick: () => window.location.href = '/pricing'
                  }
                });
              }, 1000);
            }
        }
      }, TYPEWRITER_SPEED_MS);

    } catch (e) {
      toast.error("AI_ERROR: GENERATION_FAILED");
      setIsAiGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!text.trim()) return toast.error("ERR: TEXT_EMPTY");
    setIsEnhancing(true);
    try {
        const res = await api.post<any>('/ai/enhance-text', { text });
        const enhanced = res.content || res.data?.content;
        if (!enhanced) throw new Error("Empty enhancement");

        // Typewriter Replace
        setText('');
        let charIndex = 0;
        const intervalId = setInterval(() => {
            setText((prev) => prev + enhanced.charAt(charIndex));
            charIndex++;
            if (charIndex === enhanced.length) {
                clearInterval(intervalId);
                setIsEnhancing(false);
                toast.success("AI: TEXT_ENHANCED");
            }
        }, 10);
    } catch (e) {
        toast.error("ENHANCE_FAILED");
        setIsEnhancing(false);
    }
  };

  // Commerce State
  const [price, setPrice] = useState("");

  // ➤ LOGIC: SUBMIT
  const handleSubmit = async (action: 'queue' | 'execute' | 'review') => {
    if (!text && mediaPreviews.length === 0) return toast.error('ERR: CONTENT_EMPTY');
    
    // Past Date Validation
    if (date && date < new Date()) {
        return toast.error("Cannot schedule in the past");
    }

    const targets = selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
    if (targets.length === 0) return toast.error('ERR: NO_NODES_LINKED');

    setIsSubmitting(true);
    try {
        const finalMediaIds = [...selectedMediaIds];
        let finalContent = text;

        // 🛍️ COMMERCE LOGIC: Generate One-Time Link
        if (isSelling && price) {
            const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const commerceLink = `\n\n📦 Buy now for ${price} XAF:\nhttps://eazlypost.me/pay/${shortId}`;
            finalContent += commerceLink;
            toast.info("COMMERCE_LINK_GENERATED");
        }
        
        // Upload local files
        if (localFiles.length > 0) {
            toast.loading(`SYSTEM: UPLOADING_${localFiles.length}_ASSETS...`);
            for (const file of localFiles) {
                const uploadedId = await uploadSingleFile(file);
                if (uploadedId) finalMediaIds.push(uploadedId);
            }
            toast.dismiss();
        }

        let status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT';
        if (action === 'review') status = 'REVIEW';
        else if (action === 'execute') status = 'SCHEDULED'; 
        else if (action === 'queue') status = 'SCHEDULED';

        await onSchedule(
            finalContent, 
            action === 'queue' ? date || new Date() : undefined,
            finalMediaIds, 
            status, 
            targets,
            postToEdit?.id,
            workspaceId
        );
        
        setText(''); setDate(undefined); setLocalFiles([]); setSelectedMediaIds([]); setMediaPreviews([]); setPrice(""); setIsSelling(false);
    } catch (e) { toast.error("ERR: SUBMISSION_FAILED"); } finally { setIsSubmitting(false); }
  };

  const currentItems = libraryData.filter(item => item.parentId === currentFolderId);

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-black dark:text-white transition-colors">
      <div className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] relative overflow-hidden transition-all">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

        {/* HEADER */}
        <div className="px-4 py-3 flex items-center justify-between bg-[#3C48F5] border-b-2 border-black dark:border-white transition-colors">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-black uppercase tracking-widest mr-2 bg-black dark:bg-white text-white dark:text-black px-2 py-1">TARGETS:</span>

            {accounts.filter(a => selectedAccountIds.includes(a.id)).map((acc) => {
                const isExpired = acc.isActive === false;
                return (
                  <div key={acc.id} className="relative w-8 h-8 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]" title={isExpired ? 'Connection expired' : acc.username}>
                    {acc.avatar ? <img src={acc.avatar} className="w-full h-full object-cover" /> : <span className="text-xs font-black text-black dark:text-white">{acc.username?.[0]?.toUpperCase()}</span>}
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 p-[1px] border border-black dark:border-white z-10"><PlatformIcon platform={acc.platform} size={10} /></div>
                    {isExpired && <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center z-20 cursor-not-allowed"><AlertTriangle className="w-4 h-4 text-white" strokeWidth={3} /></div>}
                  </div>
                );
            })}

            <Popover>
              <PopoverTrigger asChild>
                <button className={cn("w-8 h-8 flex-shrink-0 border-2 border-dashed border-black dark:border-white hover:bg-white/50 dark:hover:bg-zinc-800 flex items-center justify-center transition-all", selectedAccountIds.length === 0 ? "bg-red-500 animate-pulse" : "bg-white dark:bg-zinc-900")}>
                  <Plus size={14} strokeWidth={3} className={selectedAccountIds.length === 0 ? "text-white" : "text-black dark:text-white"} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rounded-none" align="start">
                <div className="bg-black dark:bg-white text-white dark:text-black p-2 text-[10px] font-mono uppercase">AVAILABLE NODES</div>
                <div className="max-h-60 overflow-y-auto">
                  {accounts.map((acc) => {
                    const isExpired = acc.isActive === false;
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <div key={acc.id} onClick={() => { if (isExpired) { toast.error(`Please reconnect ${acc.username}`); return; } setSelectedAccountIds((prev) => prev.includes(acc.id) ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]); }} className={cn("flex items-center gap-3 p-3 border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-colors", isExpired ? "bg-red-50 dark:bg-red-900/20 opacity-70 cursor-not-allowed" : "hover:bg-yellow-50 dark:hover:bg-zinc-800 cursor-pointer")}>
                        <div className={cn("w-4 h-4 border-2 flex items-center justify-center", isExpired ? "border-red-500" : "border-black dark:border-white")}>{isExpired ? (<AlertTriangle className="w-3 h-3 text-red-500" />) : (isSelected && <div className="w-2 h-2 bg-black dark:bg-white" />)}</div>
                        <div className="flex-1"><div className={cn("text-xs font-bold uppercase text-black dark:text-white", isExpired && "text-red-600")}>{acc.username}</div><div className="text-[8px] font-mono text-gray-500 dark:text-zinc-400">{acc.platform} {isExpired && "(EXPIRED)"}</div></div>
                        <PlatformIcon platform={acc.platform} size={14} />
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
             <button onClick={() => setIsAiOpen(v => !v)} className={cn("flex items-center gap-2 px-3 py-1 font-bold text-[10px] uppercase border-2 border-black dark:border-white transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", isAiOpen ? "bg-white dark:bg-zinc-900 text-black dark:text-white" : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200")}>
                <Sparkles size={12} /> <span className="hidden sm:inline">AI_MAGIC</span>
             </button>
             <button onClick={() => setIsLibraryOpen(v => !v)} className={cn("flex items-center gap-2 px-3 py-1 font-bold text-[10px] uppercase border-2 border-black dark:border-white transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", isLibraryOpen ? "bg-white dark:bg-zinc-900 text-black dark:text-white" : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200")}>
                <LayoutGrid size={12} /> <span className="hidden sm:inline">{isLibraryOpen ? 'CLOSE_LIB' : 'OPEN_LIB'}</span>
             </button>
          </div>
        </div>

        {/* AI PANEL */}
        <AnimatePresence>
            {isAiOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b-2 border-black dark:border-white bg-purple-50 dark:bg-purple-900/10 p-4 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4 mb-3">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase mb-1 block text-black dark:text-white">WHAT_ARE_WE_SELLING?</label>
                            <input value={aiContext} onChange={(e) => setAiContext(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-2 text-xs font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] text-black dark:text-white" placeholder="E.G. 50% OFF SNEAKERS IN DOUALA..." />
                        </div>
                        <div className="w-full sm:w-1/3">
                            <label className="text-[10px] font-bold uppercase mb-1 block text-black dark:text-white">VIBE_CHECK</label>
                            <div className="relative">
                                <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-2 text-xs font-bold uppercase appearance-none focus:outline-none text-black dark:text-white">
                                    {AI_TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 pointer-events-none text-black dark:text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <NeuButton onClick={handleAiGenerate} disabled={isAiGenerating} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 w-full sm:w-auto">
                            {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                            {isAiGenerating ? "WRITING..." : "GENERATE_COPY"}
                        </NeuButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* COMPOSER BODY */}
        <div className="px-6 pb-6 bg-white dark:bg-zinc-900 transition-colors">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="INPUT_CONTENT_STREAM..." className="min-h-[140px] border-none shadow-none resize-none focus-visible:ring-0 text-lg font-medium placeholder:text-gray-300 dark:placeholder:text-zinc-600 bg-transparent p-0 rounded-none leading-relaxed font-mono text-black dark:text-white" />
          
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {mediaPreviews.map((url, idx) => (
                <div key={idx} className="relative aspect-square border-2 border-black dark:border-white group bg-gray-100 dark:bg-zinc-800 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-red-600 border-2 border-black dark:border-white text-white p-0.5 hover:bg-red-700 transition-colors shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] opacity-0 group-hover:opacity-100"><X size={12} strokeWidth={3} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-gray-300 dark:border-zinc-700 gap-4 transition-colors">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="UPLOAD_IMG" />
              <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="UPLOAD_VID" />
              <button 
                onClick={handleEnhance} 
                disabled={isEnhancing || !text.trim()} 
                title="AI_ENHANCE_TEXT"
                className={cn(
                    "p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none transition-all text-black dark:text-white disabled:opacity-50",
                    isEnhancing && "animate-pulse"
                )}
              >
                <Wand2 size={18} strokeWidth={2.5} className={cn(isEnhancing && "animate-spin")} />
              </button>
              <div className="h-8 w-0.5 bg-black dark:bg-white mx-1" />
              <button onClick={() => setIsSelling(!isSelling)} className={cn("flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase transition-all border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000]", isSelling ? "bg-[#3C48F5] text-white" : "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-blue-50 dark:hover:bg-zinc-800")}><ShoppingBag size={12} /> {isSelling ? 'COMMERCE: ON' : 'COMMERCE: OFF'}</button>
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}><PopoverTrigger asChild><button className="flex items-center gap-1.5 px-4 py-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none whitespace-nowrap text-black dark:text-white"><Tag size={12} /> {category} <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} /></button></PopoverTrigger><PopoverContent className="w-48 p-0 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rounded-none" align="start">{CATEGORIES.map((cat) => (<button key={cat} onClick={() => { setCategory(cat); setIsCategoryOpen(false); }} className={cn('w-full text-left px-4 py-2 text-xs hover:bg-blue-100 dark:hover:bg-zinc-800 transition flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 last:border-0 font-bold uppercase text-black dark:text-white', category === cat && 'bg-[#3C48F5] text-white')}>{cat} {category === cat && <Check size={14} />}</button>))}</PopoverContent></Popover>
            </div>
                        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                          {/* 🚀 AI SMART SCHEDULING BUTTON */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="px-3 py-2 bg-white hover:bg-white text-black font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1 uppercase">
                                <Sparkles size={14} className="animate-pulse" /> AI_SCHEDULER
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] rounded-none" align="center" side="top">
                              <AiSchedulerContent 
                                workspaceId={workspaceId} 
                                platform={accounts.find(a => selectedAccountIds.includes(a.id))?.platform || 'FACEBOOK'} 
                                onSelect={(hour) => {
                                  const newDate = date || new Date();
                                  newDate.setHours(hour);
                                  newDate.setMinutes(0);
                                  setDate(new Date(newDate));
                                  toast.success(`AI suggested: ${hour}:00 set!`);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
            
                          <Popover><PopoverTrigger asChild><NeuButton className="bg-white dark:bg-zinc-900 text-black dark:text-white px-3"><CalendarIcon className="mr-2 h-4 w-4" /> {date ? format(date, 'MMM d, HH:mm') : 'NOW'}</NeuButton></PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]" align="center" side="top" sideOffset={12}><Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-none bg-white dark:bg-zinc-900 p-3 text-black dark:text-white" /><div className="p-3 border-t-2 border-black dark:border-white bg-yellow-50 dark:bg-yellow-900/10 flex items-center gap-2"><Clock size={16} className="text-black dark:text-white" /><input type="time" className="flex-1 text-sm bg-transparent outline-none font-bold text-black dark:text-white border-b-2 border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white" onChange={e => { if (!e.target.value) return; const [h, m] = e.target.value.split(':'); const newDate = date || new Date(); newDate.setHours(parseInt(h)); newDate.setMinutes(parseInt(m)); setDate(newDate); }} /></div></PopoverContent></Popover>
              <div className="flex gap-2">
                  <button onClick={() => setIsPreviewOpen(true)} className="px-3 py-2 bg-white dark:bg-blue-900/20 text-black dark:text-white font-bold text-[10px] border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all flex items-center gap-1 uppercase"><LayoutGrid size={14} /> PREVIEW</button>
                  <button onClick={() => handleSubmit('review')} disabled={isSubmitting} className="px-3 py-2 bg-white dark:bg-purple-900/20 text-black dark:text-purple-100 font-bold text-[10px] border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all flex items-center gap-1 uppercase"><FileCheck size={14} /> REVIEW</button>
                  <NeuButton onClick={() => handleSubmit(date ? 'queue' : 'execute')} disabled={isSubmitting} className="bg-[#174CD2] text-white hover:bg-blue-700 px-4">
                      {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (date ? <Clock className="w-4 h-4 mr-2"/> : <Send className="w-4 h-4 mr-2"/>)}
                      {postToEdit ? 'UPDATE' : (date ? 'SCHEDULE' : 'EXECUTE')}
                  </NeuButton>
              </div>
            </div>
          </div>
          <AnimatePresence>{isSelling && (<motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="flex gap-0 items-center overflow-hidden transition-all"><div className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-2 border-y-2 border-l-2 border-black dark:border-white">XAF</div><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="PRICE (e.g. 5000)" className="bg-white dark:bg-zinc-900 text-sm font-bold text-black dark:text-white w-full outline-none px-3 py-2 border-2 border-black dark:border-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 placeholder:font-normal font-mono" /><div className="text-[10px] bg-green-200 dark:bg-green-900 text-black dark:text-white px-2 py-2 border-y-2 border-r-2 border-black dark:border-white font-black uppercase whitespace-nowrap">MOMO_ACTIVE</div></motion.div>)}</AnimatePresence>
        </div>
      </div>
      
      {/* 🟢 LIBRARY & MODALS */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ opacity: 0, height: 0 }} 
            className="w-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] overflow-hidden flex flex-col transition-colors z-20 mt-4"
          >
            <div className="px-4 py-3 border-b-4 border-black dark:border-white bg-[#3C48F5] text-white flex justify-between items-center transition-colors">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2 font-mono">
                    <LayoutGrid size={14} /> OS_ASSET_EXPLORER_V2.0
                </span>
                <button onClick={() => setIsLibraryOpen(false)} className="hover:bg-black hover:text-white p-1 transition-colors border-2 border-transparent hover:border-black">
                    <X size={18} strokeWidth={3} />
                </button>
            </div>
            <div className="p-6 bg-[#F4F4F0] dark:bg-zinc-950 min-h-[400px]">
                <MediaGallery 
                    hideUsage={true} 
                    workspaceId={workspaceId}
                    onSelect={(asset) => {
                        if (!selectedMediaIds.includes(asset.id)) {
                            setSelectedMediaIds(prev => [...prev, asset.id]);
                            setMediaPreviews(prev => [...prev, asset.url]);
                            toast.success("ASSET_LINKED_TO_STREAM");
                        }
                    }} 
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuModal isOpen={showFolderModal} onClose={() => setShowFolderModal(false)} title="NEW_FOLDER">
          <input value={inputFolderName} onChange={e => setInputFolderName(e.target.value)} className="w-full border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-2 font-bold mb-4 text-black dark:text-white" placeholder="NAME" autoFocus />
          <NeuButton onClick={() => { setLibraryData(p => [...p, { id: Date.now().toString(), type: 'folder', name: inputFolderName, parentId: currentFolderId }]); setInputFolderName(""); setShowFolderModal(false); }} className="w-full bg-black dark:bg-white text-white dark:text-black py-2">CREATE</NeuButton>
      </NeuModal>
      <NeuModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="NEW_TEMPLATE">
          <input value={inputTemplateName} onChange={e => setInputTemplateName(e.target.value)} className="w-full border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-2 font-bold mb-4 text-black dark:text-white" placeholder="TEMPLATE_NAME" autoFocus />
          <div className="bg-gray-100 dark:bg-zinc-800 p-2 text-xs font-mono mb-4 border border-black dark:border-white max-h-20 overflow-y-auto text-black dark:text-white">{text || "NO CONTENT TO SAVE"}</div>
          <NeuButton onClick={() => { setSavedTemplates(p => [...p, { id: Date.now(), title: inputTemplateName, content: text }]); setInputTemplateName(""); setShowTemplateModal(false); }} className="w-full bg-black dark:bg-white text-white dark:text-black py-2" disabled={!text}>SAVE</NeuButton>
      </NeuModal>

      {/* 🚀 TEST 10: PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[16px_16px_0px_0px_#000] dark:shadow-[16px_16px_0px_0px_#fff] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-sans text-black dark:text-white transition-colors">
                <div className="bg-[#3C48F5] text-white p-4 border-b-4 border-black dark:border-white flex justify-between items-center">
                    <span className="font-black uppercase tracking-tighter text-xl">LIVE_PREVIEW_STREAM</span>
                    <button onClick={() => setIsPreviewOpen(false)} className="hover:bg-black hover:text-white transition-colors p-1 border-2 border-transparent hover:border-black"><X size={24} strokeWidth={3}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-[#F0F2F5] dark:bg-zinc-950 transition-colors">
                    <div className="flex flex-col items-center gap-12 max-w-lg mx-auto">
                        
                        {/* 1. FACEBOOK PREVIEW (Accurate Mockup) */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'FACEBOOK') && (
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white"><Facebook size={12} fill="currentColor"/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Facebook_Preview</span>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 shadow-sm rounded-lg overflow-hidden transition-colors">
                                    <div className="p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border border-black/10 overflow-hidden bg-gray-100">
                                            <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${workspaceId}`} className="w-full h-full" />
                                        </div>
                                        <div>
                                            <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded-sm mb-1"></div>
                                            <div className="h-2 w-16 bg-gray-100 dark:bg-zinc-900 rounded-sm flex items-center gap-1">
                                                <span className="text-[8px] opacity-50 font-bold">Just now • </span>
                                                <Globe size={8} className="opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-3 pb-3 text-[13px] leading-relaxed whitespace-pre-wrap text-black dark:text-zinc-200">
                                        {text || "Sample content goes here..."}
                                    </div>
                                    {mediaPreviews.length > 0 && (
                                        <div className={cn(
                                            "grid gap-px border-y border-gray-100 dark:border-zinc-800",
                                            mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                        )}>
                                            {mediaPreviews.slice(0, 4).map((url, i) => (
                                                <img key={i} src={url} className="w-full aspect-square object-cover" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="px-4 py-2 flex justify-between border-t border-gray-100 dark:border-zinc-800 mt-1">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1 text-gray-500 font-bold text-[11px] uppercase"><ThumbsUp size={14}/> Like</div>
                                            <div className="flex items-center gap-1 text-gray-500 font-bold text-[11px] uppercase"><MessageCircle size={14}/> Comment</div>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 font-bold text-[11px] uppercase"><Send size={14}/> Share</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. INSTAGRAM PREVIEW (Pixel Perfect) */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'INSTAGRAM') && (
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-md flex items-center justify-center text-white"><Instagram size={12}/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Instagram_Preview</span>
                                </div>
                                <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-900 shadow-sm rounded-none overflow-hidden max-w-[400px] mx-auto transition-colors">
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                                                <div className="w-full h-full rounded-full border-2 border-white dark:border-black overflow-hidden bg-gray-100">
                                                    <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${workspaceId}`} className="w-full h-full" />
                                                </div>
                                            </div>
                                            <span className="text-xs font-black tracking-tight dark:text-white">your_brand</span>
                                        </div>
                                        <MoreHorizontal size={16} className="dark:text-white" />
                                    </div>
                                    <div className="aspect-square bg-gray-100 dark:bg-zinc-900 border-y border-black/5 dark:border-white/5 relative">
                                        {mediaPreviews.length > 0 ? (
                                            <img src={mediaPreviews[0]} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-20">
                                                <ImageIcon size={48} />
                                                <span className="text-[10px] font-black uppercase mt-2">Media_Needed</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <div className="flex gap-3">
                                                <Heart size={22} className="dark:text-white" />
                                                <MessageCircle size={22} className="dark:text-white" />
                                                <Send size={22} className="dark:text-white" />
                                            </div>
                                            <div className="w-5 h-6 border-2 border-black dark:border-white rounded-sm"></div>
                                        </div>
                                        <p className="text-xs font-bold dark:text-white">1,234 likes</p>
                                        <div className="text-xs leading-snug">
                                            <span className="font-black mr-2 dark:text-white">your_brand</span>
                                            <span className="dark:text-zinc-300">{text || "Your caption here..."}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold pt-1">2 minutes ago</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. TWITTER / X PREVIEW (Legacy & Dark) */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && (a.platform === 'TWITTER' || a.platform === 'X')) && (
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white"><Twitter size={12} fill="currentColor"/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">X_Preview</span>
                                </div>
                                <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm p-4 flex gap-3 text-black dark:text-white transition-colors">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-full shrink-0 overflow-hidden border border-black/10">
                                        <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${workspaceId}`} className="w-full h-full" />
                                    </div>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex gap-1 items-center">
                                            <span className="text-sm font-black truncate">Your Brand</span>
                                            <span className="text-sm text-gray-500 font-medium truncate">@brand • 1m</span>
                                        </div>
                                        <p className="text-[15px] leading-normal whitespace-pre-wrap font-medium">
                                            {text.length > 280 ? text.substring(0, 277) + '...' : (text || "What's happening?")}
                                        </p>
                                        {mediaPreviews.length > 0 && (
                                            <div className={cn(
                                                "grid gap-px rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800",
                                                mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                            )}>
                                                {mediaPreviews.slice(0, 4).map((url, i) => (
                                                    <img key={i} src={url} className="w-full h-full object-cover aspect-video" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-between max-w-xs pt-2 text-gray-500 dark:text-zinc-500">
                                            <MessageCircle size={18} /><RefreshCw size={18} /><Heart size={18} /><Send size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. LINKEDIN PREVIEW (Professional Mockup) */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'LINKEDIN') && (
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-[#0A66C2] rounded-sm flex items-center justify-center text-white"><Linkedin size={12} fill="currentColor"/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">LinkedIn_Preview</span>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors">
                                    <div className="p-3 flex items-start gap-2">
                                        <div className="w-12 h-12 rounded-none border border-black/10 overflow-hidden bg-gray-100">
                                            <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${workspaceId}`} className="w-full h-full" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 w-32 bg-gray-200 dark:bg-zinc-800 rounded-sm mb-1"></div>
                                            <div className="h-2 w-40 bg-gray-100 dark:bg-zinc-900 rounded-sm mb-1"></div>
                                            <div className="h-2 w-20 bg-gray-50 dark:bg-zinc-950 rounded-sm flex items-center gap-1">
                                                <span className="text-[8px] opacity-50 font-bold">1m • </span>
                                                <Globe size={8} className="opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-3 pb-3 text-[13px] leading-relaxed text-black dark:text-zinc-200">
                                        {text || "Share your professional insights..."}
                                    </div>
                                    {mediaPreviews.length > 0 && (
                                        <div className="border-y border-gray-100 dark:border-zinc-800">
                                            <img src={mediaPreviews[0]} className="w-full h-auto max-h-96 object-cover" />
                                        </div>
                                    )}
                                    <div className="px-3 py-2 flex items-center gap-1 border-b border-gray-100 dark:border-zinc-800">
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-white"><ThumbsUp size={8} className="text-white" /></div>
                                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white"><Heart size={8} className="text-white" /></div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium">12 • 4 comments</span>
                                    </div>
                                    <div className="px-2 py-1 flex justify-around">
                                        <div className="flex flex-col items-center p-2 text-gray-500 font-bold text-[10px] uppercase hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer"><ThumbsUp size={18}/><span>Like</span></div>
                                        <div className="flex flex-col items-center p-2 text-gray-500 font-bold text-[10px] uppercase hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer"><MessageCircle size={18}/><span>Comment</span></div>
                                        <div className="flex flex-col items-center p-2 text-gray-500 font-bold text-[10px] uppercase hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer"><RefreshCw size={18}/><span>Repost</span></div>
                                        <div className="flex flex-col items-center p-2 text-gray-500 font-bold text-[10px] uppercase hover:bg-gray-100 dark:hover:bg-zinc-800 rounded cursor-pointer"><Send size={18}/><span>Send</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. TIKTOK PREVIEW (Vertical Mobile Content) */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'TIKTOK') && (
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white"><SiTiktok size={10} fill="currentColor"/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">TikTok_Mobile_Preview</span>
                                </div>
                                <div className="relative aspect-[9/16] w-full max-w-[300px] mx-auto bg-black rounded-[40px] border-[8px] border-zinc-800 shadow-2xl overflow-hidden group">
                                    {/* Video/Image Background */}
                                    {mediaPreviews.length > 0 ? (
                                        <img src={mediaPreviews[0]} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-700">
                                            <Video size={48} />
                                            <span className="text-[8px] font-black uppercase mt-2">No_Media_Linked</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                                    
                                    {/* Right Side Actions */}
                                    <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-500 mb-1">
                                                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${workspaceId}`} className="w-full h-full" />
                                            </div>
                                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center -mt-3 border-2 border-black"><Plus size={10} className="text-white" /></div>
                                        </div>
                                        <div className="flex flex-col items-center"><Heart size={28} className="text-white fill-white" /><span className="text-[10px] text-white font-bold">12.4K</span></div>
                                        <div className="flex flex-col items-center"><MessageCircle size={28} className="text-white fill-white" /><span className="text-[10px] text-white font-bold">842</span></div>
                                        <div className="flex flex-col items-center"><Send size={28} className="text-white fill-white" /><span className="text-[10px] text-white font-bold">156</span></div>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="absolute bottom-6 left-4 right-16 z-10 space-y-2">
                                        <p className="text-white font-black text-sm">@your_brand</p>
                                        <p className="text-white text-xs line-clamp-2 leading-snug">{text || "Add trending hashtags..."}</p>
                                        <div className="flex items-center gap-2 overflow-hidden w-32">
                                            <Music size={12} className="text-white animate-spin-slow shrink-0" />
                                            <motion.div 
                                                animate={{ x: [120, -150] }} 
                                                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                                className="text-[10px] text-white font-medium whitespace-nowrap"
                                            >
                                                Original Sound - Your Brand Channel
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <div className="p-6 border-t-4 border-black dark:border-white bg-white dark:bg-zinc-900 flex justify-end gap-4 transition-colors">
                    <NeuButton variant="secondary" onClick={() => setIsPreviewOpen(false)} className="px-8 bg-white dark:bg-zinc-900 text-black dark:text-white">CLOSE</NeuButton>
                    <NeuButton variant="primary" onClick={() => { setIsPreviewOpen(false); handleSubmit('execute'); }} className="px-8 bg-green-600 hover:bg-green-700 text-white">SATISFIED_PUBLISH</NeuButton>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}