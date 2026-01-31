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
  Sparkles, AlertTriangle, MessageCircle, RefreshCw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/src/lib/api';

// --- TYPES ---
type AssetType = 'image' | 'video' | 'folder';
interface LibraryItem { id: string; type: AssetType; name?: string; url?: string; parentId: string | null; }
interface TemplateItem { id: number; title: string; content: string; }

interface ComposerProps {
  accounts: any[]; 
  postToEdit?: any; // New prop
  onSchedule: (
    content: string,
    date?: Date,
    mediaIds?: string[], // ➤ UPDATED: We pass IDs now
    status?: 'DRAFT' | 'SCHEDULED' | 'REVIEW',
    selectedAccountIds?: string[],
    postId?: string // New arg for update
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
    default: "bg-white text-black hover:bg-blue-50 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    primary: `bg-[#3C48F5] text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
    ghost: "bg-transparent border-transparent hover:bg-gray-100 shadow-none hover:shadow-none translate-0"
  };
  return <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>{children}</button>;
};

const NeuModal = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-sm overflow-hidden">
                <div className="bg-[#3C48F5] text-white p-4 border-b-4 border-black flex justify-between items-center"><span className="font-black uppercase tracking-wider">{title}</span><button onClick={onClose}><X size={24} strokeWidth={3}/></button></div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
};

const RetroFolder = ({ name, onClick }: { name: string, onClick: () => void }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col items-center gap-2 p-2 hover:bg-blue-50 transition-colors">
    <div className="relative w-16 h-12"><div className="absolute top-0 left-0 w-6 h-3 bg-gray-800 border-2 border-black rounded-t-sm z-0"></div><div className="absolute bottom-0 w-full h-10 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 group-hover:bg-blue-400 transition-colors flex items-center justify-center"><div className="w-8 h-0.5 bg-black/10"></div></div></div>
    <span className="text-[10px] font-bold uppercase text-center bg-white px-1 border border-black max-w-full truncate w-full font-mono">{name}</span>
  </div>
);
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (<button onClick={onClick} title={tooltip} className="p-2 border-2 border-black bg-white hover:bg-blue-100 shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all text-black"><Icon size={18} strokeWidth={2.5} /></button>);
const PlatformIcon = ({ platform, size = 14 }: { platform?: string, size?: number }) => { switch (platform?.toLowerCase()) { case 'facebook': return <Facebook size={size} className="text-blue-600 fill-blue-600" />; case 'linkedin': return <Linkedin size={size} className="text-blue-700 fill-blue-700" />; case 'twitter': return <Twitter size={size} className="text-black fill-black" />; case 'instagram': return <Instagram size={size} className="text-pink-600" />; default: return <div style={{width: size, height: size}} className="bg-gray-400 rounded-full" />; }};


export default function Composer({ onSchedule, accounts = [], postToEdit }: ComposerProps) {
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
    } catch (e) { console.error("Library fetch failed", e); }
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
      if (!generatedContent) throw new Error("Empty response from AI");

      // Typewriter Effect
      const prefix = text ? "\n\n" : "";
      const textToType = prefix + generatedContent;
      
      let charIndex = 0;
      const speed = 15; // ms per char

      const intervalId = setInterval(() => {
        setText((prev) => prev + textToType.charAt(charIndex));
        charIndex++;
        if (charIndex === textToType.length) {
            clearInterval(intervalId);
            setIsAiGenerating(false);
            setIsAiOpen(false); 
            setAiContext("");
            toast.success("AI: COPY_GENERATED");
        }
      }, speed);

    } catch (e) {
      console.error(e);
      toast.error("AI_ERROR: GENERATION_FAILED");
      setIsAiGenerating(false);
    }
  };

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
        let finalMediaIds = [...selectedMediaIds];
        
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
            text, 
            action === 'queue' ? date || new Date() : undefined,
            finalMediaIds, 
            status, 
            targets,
            postToEdit?.id // Pass ID if editing
        );
        
        setText(''); setDate(undefined); setLocalFiles([]); setSelectedMediaIds([]); setMediaPreviews([]);
    } catch (e) { toast.error("ERR: SUBMISSION_FAILED"); } finally { setIsSubmitting(false); }
  };

  const currentItems = libraryData.filter(item => item.parentId === currentFolderId);

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-black">
      <div className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] relative overflow-hidden transition-all">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

        {/* HEADER */}
        <div className="px-4 py-3 flex items-center justify-between bg-yellow-400 border-b-2 border-black">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-black uppercase tracking-widest mr-2 bg-black text-white px-2 py-1">TARGETS:</span>

            {accounts.filter(a => selectedAccountIds.includes(a.id)).map((acc) => {
                const isExpired = acc.isActive === false;
                return (
                  <div key={acc.id} className="relative w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000]" title={isExpired ? 'Connection expired' : acc.username}>
                    {acc.avatar ? <img src={acc.avatar} className="w-full h-full object-cover" /> : <span className="text-xs font-black">{acc.username?.[0]?.toUpperCase()}</span>}
                    <div className="absolute -bottom-1 -right-1 bg-white p-[1px] border border-black z-10"><PlatformIcon platform={acc.platform} size={10} /></div>
                    {isExpired && <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center z-20 cursor-not-allowed"><AlertTriangle className="w-4 h-4 text-white" strokeWidth={3} /></div>}
                  </div>
                );
            })}

            <Popover>
              <PopoverTrigger asChild>
                <button className={cn("w-8 h-8 flex-shrink-0 border-2 border-dashed border-black hover:bg-white/50 flex items-center justify-center transition-all", selectedAccountIds.length === 0 ? "bg-red-500 animate-pulse" : "bg-white")}>
                  <Plus size={14} strokeWidth={3} className={selectedAccountIds.length === 0 ? "text-white" : "text-black"} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none" align="start">
                <div className="bg-black text-white p-2 text-[10px] font-mono uppercase">AVAILABLE NODES</div>
                <div className="max-h-60 overflow-y-auto">
                  {accounts.map((acc) => {
                    const isExpired = acc.isActive === false;
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <div key={acc.id} onClick={() => { if (isExpired) { toast.error(`Please reconnect ${acc.username}`); return; } setSelectedAccountIds((prev) => prev.includes(acc.id) ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]); }} className={cn("flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 transition-colors", isExpired ? "bg-red-50 opacity-70 cursor-not-allowed" : "hover:bg-yellow-50 cursor-pointer")}>
                        <div className={cn("w-4 h-4 border-2 flex items-center justify-center", isExpired ? "border-red-500" : "border-black")}>{isExpired ? (<AlertTriangle className="w-3 h-3 text-red-500" />) : (isSelected && <div className="w-2 h-2 bg-black" />)}</div>
                        <div className="flex-1"><div className={cn("text-xs font-bold uppercase", isExpired && "text-red-600")}>{acc.username}</div><div className="text-[8px] font-mono text-gray-500">{acc.platform} {isExpired && "(EXPIRED)"}</div></div>
                        <PlatformIcon platform={acc.platform} size={14} />
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
             <button onClick={() => setIsAiOpen(v => !v)} className={cn("flex items-center gap-2 px-3 py-1 font-bold text-[10px] uppercase border-2 border-black transition-all", isAiOpen ? "bg-purple-600 text-white" : "bg-white hover:bg-purple-100")}>
                <Sparkles size={12} /> <span className="hidden sm:inline">AI_MAGIC</span>
             </button>
             <button onClick={() => setIsLibraryOpen(v => !v)} className={cn("flex items-center gap-2 px-3 py-1 font-bold text-[10px] uppercase border-2 border-black transition-all", isLibraryOpen ? "bg-black text-white" : "bg-white hover:bg-gray-100")}>
                <LayoutGrid size={12} /> <span className="hidden sm:inline">{isLibraryOpen ? 'CLOSE_LIB' : 'OPEN_LIB'}</span>
             </button>
          </div>
        </div>

        {/* AI PANEL */}
        <AnimatePresence>
            {isAiOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b-2 border-black bg-purple-50 p-4">
                    <div className="flex flex-col sm:flex-row gap-4 mb-3">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase mb-1 block">WHAT_ARE_WE_SELLING?</label>
                            <input value={aiContext} onChange={(e) => setAiContext(e.target.value)} className="w-full bg-white border-2 border-black p-2 text-xs font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#000]" placeholder="E.G. 50% OFF SNEAKERS IN DOUALA..." />
                        </div>
                        <div className="w-full sm:w-1/3">
                            <label className="text-[10px] font-bold uppercase mb-1 block">VIBE_CHECK</label>
                            <div className="relative">
                                <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-full bg-white border-2 border-black p-2 text-xs font-bold uppercase appearance-none focus:outline-none">
                                    {AI_TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <NeuButton onClick={handleAiGenerate} disabled={isAiGenerating} className="bg-black text-white px-4 py-2 w-full sm:w-auto">
                            {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                            {isAiGenerating ? "WRITING..." : "GENERATE_COPY"}
                        </NeuButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* COMPOSER BODY */}
        <div className="px-6 pb-6 bg-white">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="INPUT_CONTENT_STREAM..." className="min-h-[140px] border-none shadow-none resize-none focus-visible:ring-0 text-lg font-medium placeholder:text-gray-300 bg-transparent p-0 rounded-none leading-relaxed font-mono" />
          
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {mediaPreviews.map((url, idx) => (
                <div key={idx} className="relative aspect-square border-2 border-black group bg-gray-100 shadow-[4px_4px_0px_0px_#000]">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-red-600 border-2 border-black text-white p-0.5 hover:bg-red-700 transition-colors shadow-[2px_2px_0px_0px_#000] opacity-0 group-hover:opacity-100"><X size={12} strokeWidth={3} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-gray-300 gap-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="UPLOAD_IMG" />
              <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="UPLOAD_VID" />
              <div className="h-8 w-0.5 bg-black mx-1" />
              <button onClick={() => setIsSelling(!isSelling)} className={cn("flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000]", isSelling ? "bg-[#3C48F6] text-white" : "bg-white hover:bg-yellow-100")}><ShoppingBag size={12} /> {isSelling ? 'COMMERCE: ON' : 'COMMERCE: OFF'}</button>
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}><PopoverTrigger asChild><button className="flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none whitespace-nowrap"><Tag size={12} /> {category} <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} /></button></PopoverTrigger><PopoverContent className="w-48 p-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none" align="start">{CATEGORIES.map((cat) => (<button key={cat} onClick={() => { setCategory(cat); setIsCategoryOpen(false); }} className={cn('w-full text-left px-4 py-2 text-xs hover:bg-yellow-200 transition flex items-center justify-between border-b border-gray-200 last:border-0 font-bold uppercase', category === cat && 'bg-yellow-400')}>{cat} {category === cat && <Check size={14} />}</button>))}</PopoverContent></Popover>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Popover><PopoverTrigger asChild><NeuButton className="bg-white text-black px-3"><CalendarIcon className="mr-2 h-4 w-4" /> {date ? format(date, 'MMM d, HH:mm') : 'NOW'}</NeuButton></PopoverTrigger><PopoverContent className="w-auto p-0 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]" align="center" side="top" sideOffset={12}><Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-none bg-white p-3" /><div className="p-3 border-t-2 border-black bg-yellow-50 flex items-center gap-2"><Clock size={16} className="text-black" /><input type="time" className="flex-1 text-sm bg-transparent outline-none font-bold text-black border-b-2 border-black/20 focus:border-black" onChange={e => { if (!e.target.value) return; const [h, m] = e.target.value.split(':'); const newDate = date || new Date(); newDate.setHours(parseInt(h)); newDate.setMinutes(parseInt(m)); setDate(newDate); }} /></div></PopoverContent></Popover>
              <div className="flex gap-2">
                  <button onClick={() => setIsPreviewOpen(true)} className="px-3 py-2 bg-yellow-100 text-black font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all flex items-center gap-1 uppercase"><LayoutGrid size={14} /> PREVIEW</button>
                  <button onClick={() => handleSubmit('review')} disabled={isSubmitting} className="px-3 py-2 bg-purple-100 text-purple-900 font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all flex items-center gap-1 uppercase"><FileCheck size={14} /> REVIEW</button>
                  <NeuButton onClick={() => handleSubmit(date ? 'queue' : 'execute')} disabled={isSubmitting} className="bg-[#3C48F6] text-white hover:bg-blue-700 px-4">
                      {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (date ? <Clock className="w-4 h-4 mr-2"/> : <Send className="w-4 h-4 mr-2"/>)}
                      {postToEdit ? 'UPDATE' : (date ? 'SCHEDULE' : 'EXECUTE')}
                  </NeuButton>
              </div>
            </div>
          </div>
          <AnimatePresence>{isSelling && (<motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="flex gap-0 items-center overflow-hidden"><div className="bg-black text-white text-[10px] font-bold px-3 py-2 border-y-2 border-l-2 border-black">XAF</div><input type="number" placeholder="PRICE (e.g. 5000)" className="bg-white text-sm font-bold text-black w-full outline-none px-3 py-2 border-2 border-black placeholder:text-gray-400 placeholder:font-normal font-mono" /><div className="text-[10px] bg-green-200 text-black px-2 py-2 border-y-2 border-r-2 border-black font-black uppercase whitespace-nowrap">MOMO_ACTIVE</div></motion.div>)}</AnimatePresence>
        </div>
      </div>
      
      {/* 🟢 LIBRARY & MODALS */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b-2 border-black bg-black text-white flex justify-between items-center"><span className="text-xs font-black uppercase tracking-wider flex items-center gap-2 font-mono"><LayoutGrid size={14} /> OS_ASSET_EXPLORER</span><button onClick={() => setIsLibraryOpen(false)} className="hover:bg-white hover:text-black rounded-none p-1 transition-colors border border-transparent hover:border-white"><X size={14} /></button></div>
            <Tabs defaultValue="media" className="flex-1 flex flex-col min-h-0 bg-yellow-50/50">
              <div className="px-4 pt-4 pb-0"><TabsList className="w-full grid grid-cols-2 h-10 bg-transparent gap-2 p-0"><TabsTrigger value="media" className="text-[10px] font-black uppercase border-2 border-black bg-white data-[state=active]:bg-[#3C48F6] data-[state=active]:text-white shadow-[2px_2px_0px_0px_#000] data-[state=active]:translate-x-[1px] data-[state=active]:translate-y-[1px] data-[state=active]:shadow-none transition-all rounded-none">SYSTEM_FILES</TabsTrigger><TabsTrigger value="templates" className="text-[10px] font-black uppercase border-2 border-black bg-white data-[state=active]:bg-[#3C48F6] data-[state=active]:text-white shadow-[2px_2px_0px_0px_#000] data-[state=active]:translate-x-[1px] data-[state=active]:translate-y-[1px] data-[state=active]:shadow-none transition-all rounded-none">SAVED_TPLS</TabsTrigger></TabsList></div>
              <ScrollArea className="flex-1 p-4 h-64 lg:h-80">
                <TabsContent value="media" className="mt-0 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                     <input type="file" ref={libraryInputRef} onChange={() => {}} multiple accept="image/*,video/*" className="hidden" />
                     <button onClick={() => setShowFolderModal(true)} className="px-3 py-1 bg-white border-2 border-black text-[10px] font-bold uppercase hover:bg-yellow-200 shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-none">+ DIR</button>
                     <button onClick={() => libraryInputRef.current?.click()} className="px-3 py-1 bg-white border-2 border-black text-[10px] font-bold uppercase hover:bg-green-200 shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-none">+ INGEST</button>
                     {currentFolderId && <button onClick={() => setCurrentFolderId(null)} className="ml-auto px-3 py-1 bg-gray-200 border-2 border-black text-[10px] font-bold uppercase hover:bg-gray-300 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"><CornerLeftUp size={10} /> ROOT</button>}
                  </div>
                  {currentItems.length === 0 && <div className="h-32 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-400"><p className="font-mono text-xs font-bold">DIRECTORY_EMPTY</p></div>}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {currentItems.filter(i => i.type === 'folder').map((folder) => (<RetroFolder key={folder.id} name={folder.name || "Untitled"} onClick={() => setCurrentFolderId(folder.id)} />))}
                    {currentItems.filter(i => i.type !== 'folder').map((item) => (<div key={item.id} onClick={() => handleSelectFromLibrary(item)} className="relative aspect-square border-2 border-black overflow-hidden cursor-pointer group hover:shadow-[4px_4px_0px_0px_#000] transition-all bg-white"><img src={item.url} className="w-full h-full object-cover transition-all" alt="" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2"><Check size={20} className="text-white drop-shadow-md hover:scale-110 transition-transform" /></div><div className="absolute top-0 right-0 bg-black text-white text-[8px] font-bold px-1 uppercase font-mono">{item.type.toUpperCase().substring(0,3)}</div></div>))}
                  </div>
                </TabsContent>
                <TabsContent value="templates" className="mt-0 space-y-3">{savedTemplates.map((t) => (<div key={t.id} onClick={() => { setText(p => p + (p ? '\n\n' : '') + t.content); toast.success('TPL_INJECTED'); }} className="p-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer group transition-all"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-black uppercase bg-yellow-300 px-1 border border-black">{t.title}</span><Copy size={14} className="text-black opacity-0 group-hover:opacity-100 transition-opacity" /></div><p className="text-xs font-medium text-gray-800 line-clamp-2 font-mono">{t.content}</p></div>))}</TabsContent>
              </ScrollArea>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuModal isOpen={showFolderModal} onClose={() => setShowFolderModal(false)} title="NEW_FOLDER">
          <input value={inputFolderName} onChange={e => setInputFolderName(e.target.value)} className="w-full border-2 border-black p-2 font-bold mb-4" placeholder="NAME" autoFocus />
          <NeuButton onClick={() => { setLibraryData(p => [...p, { id: Date.now().toString(), type: 'folder', name: inputFolderName, parentId: currentFolderId }]); setInputFolderName(""); setShowFolderModal(false); }} className="w-full bg-black text-white py-2">CREATE</NeuButton>
      </NeuModal>
      <NeuModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="NEW_TEMPLATE">
          <input value={inputTemplateName} onChange={e => setInputTemplateName(e.target.value)} className="w-full border-2 border-black p-2 font-bold mb-4" placeholder="TEMPLATE_NAME" autoFocus />
          <div className="bg-gray-100 p-2 text-xs font-mono mb-4 border border-black max-h-20 overflow-y-auto">{text || "NO CONTENT TO SAVE"}</div>
          <NeuButton onClick={() => { setSavedTemplates(p => [...p, { id: Date.now(), title: inputTemplateName, content: text }]); setInputTemplateName(""); setShowTemplateModal(false); }} className="w-full bg-black text-white py-2" disabled={!text}>SAVE</NeuButton>
      </NeuModal>

      {/* 🚀 TEST 10: PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_#000] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-sans text-black">
                <div className="bg-yellow-400 p-4 border-b-4 border-black flex justify-between items-center">
                    <span className="font-black uppercase tracking-tighter text-xl">LIVE_PREVIEW_STREAM</span>
                    <button onClick={() => setIsPreviewOpen(false)} className="hover:bg-black hover:text-white transition-colors p-1 border-2 border-transparent hover:border-black"><X size={24} strokeWidth={3}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-[#F0F2F5]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* 1. FACEBOOK PREVIEW */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000]">FACEBOOK_FEED</span>
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full border border-gray-300"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                        <div className="h-2 w-16 bg-gray-100 rounded mt-1"></div>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{text || "Your content here..."}</p>
                                {mediaPreviews.length > 0 && (
                                    <div className={cn(
                                        "grid gap-1 rounded-md overflow-hidden border border-gray-100",
                                        mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                    )}>
                                        {mediaPreviews.slice(0, 4).map((url, i) => (
                                            <img key={i} src={url} className="w-full aspect-square object-cover" />
                                        ))}
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-100 flex justify-between text-gray-500 text-xs font-bold uppercase">
                                    <span>Like</span><span>Comment</span><span>Share</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. TWITTER PREVIEW */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000]">X_TIMELINE</span>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex gap-1 items-center">
                                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                                    </div>
                                    <p className="text-sm leading-snug whitespace-pre-wrap">{text.length > 280 ? text.substring(0, 277) + '...' : (text || "What's happening?")}</p>
                                    {mediaPreviews.length > 0 && (
                                        <div className={cn(
                                            "grid gap-0.5 rounded-2xl overflow-hidden border border-gray-100 max-h-64",
                                            mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                        )}>
                                            {mediaPreviews.slice(0, 4).map((url, i) => (
                                                <img key={i} src={url} className="w-full h-full object-cover" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between max-w-xs pt-1 text-gray-400">
                                        <MessageCircle size={16} /><RefreshCw size={16} /><Check size={16} /><Send size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. LINKEDIN PREVIEW */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase bg-[#0077B5] text-white px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000]">LINKEDIN_NETWORK</span>
                            <div className="bg-white border border-gray-200 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 bg-gray-200 rounded shadow-sm"></div>
                                    <div>
                                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                        <div className="h-2 w-24 bg-gray-100 rounded mt-1"></div>
                                    </div>
                                </div>
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{text || "Share an update..."}</p>
                                {mediaPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-1 rounded border border-gray-100">
                                        {mediaPreviews.slice(0, 4).map((url, i) => (
                                            <img key={i} src={url} className="w-full aspect-square object-cover" />
                                        ))}
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-100 flex gap-6 text-gray-500 text-xs font-bold uppercase">
                                    <span>Like</span><span>Comment</span><span>Repost</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="p-6 border-t-4 border-black bg-white flex justify-end gap-4">
                    <NeuButton variant="secondary" onClick={() => setIsPreviewOpen(false)} className="px-8">CLOSE</NeuButton>
                    <NeuButton variant="primary" onClick={() => { setIsPreviewOpen(false); handleSubmit('execute'); }} className="px-8 bg-green-600 hover:bg-green-700">SATISFIED_PUBLISH</NeuButton>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}