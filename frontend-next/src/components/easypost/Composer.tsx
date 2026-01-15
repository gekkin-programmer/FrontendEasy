'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Image as ImageIcon, Video, Calendar as CalendarIcon,
  X, Clock, Send, Facebook, Instagram, Linkedin, Twitter, Tag,
  LayoutGrid, Plus, UploadCloud, Copy, ChevronDown, Check, ShoppingBag,
  Folder, CornerLeftUp, Wand2, Save, Eraser, FileCheck
} from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- TYPES ---
type AssetType = 'image' | 'video' | 'folder';

interface LibraryItem {
  id: string;
  type: AssetType;
  name?: string; 
  url?: string;  
  parentId: string | null; 
}

interface TemplateItem {
  id: number;
  title: string;
  content: string;
}

interface ComposerProps {
  onSchedule: (
    content: string,
    date?: Date,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    category?: string,
    tags?: string[],
    status?: 'DRAFT' | 'SCHEDULED' | 'REVIEW' // Added Review status
  ) => Promise<void>;
}

const CATEGORIES = ['General', 'Technology', 'Marketing', 'Personal', 'News', 'Meme', 'Educational'];
const BRAND_BLUE = '#3C48F6';

// --- NEU COMPONENTS ---

const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-bold text-sm transition-all duration-150 border-2 border-black disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    default: "bg-white text-black hover:bg-yellow-100 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    primary: `bg-[${BRAND_BLUE}] text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
    ghost: "bg-transparent border-transparent hover:bg-gray-100 shadow-none hover:shadow-none translate-0"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- CUSTOM MODAL ---
const NeuModal = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-sm overflow-hidden"
            >
                <div className="bg-yellow-400 p-3 border-b-4 border-black flex justify-between items-center">
                    <span className="font-black uppercase tracking-wider">{title}</span>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

// --- RETRO FOLDER ---
const RetroFolder = ({ name, onClick }: { name: string, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer flex flex-col items-center gap-2 p-2 hover:bg-yellow-50 transition-colors"
  >
    <div className="relative w-16 h-12">
        <div className="absolute top-0 left-0 w-6 h-3 bg-yellow-300 border-2 border-black rounded-t-sm z-0"></div>
        <div className="absolute bottom-0 w-full h-10 bg-yellow-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 group-hover:bg-yellow-300 transition-colors"></div>
        <div className="absolute bottom-0 w-full h-8 bg-yellow-100 border-t-2 border-black opacity-50 z-20 pointer-events-none"></div>
    </div>
    <span className="text-[10px] font-black uppercase text-center bg-white px-1 border border-black max-w-full truncate w-full">
        {name}
    </span>
  </div>
);

export default function Composer({ onSchedule }: ComposerProps) {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  /* ---- State ---- */
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState('General');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  // UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(true); 
  const [isSelling, setIsSelling] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Modals State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [inputFolderName, setInputFolderName] = useState("");
  const [inputTemplateName, setInputTemplateName] = useState("");
  
  // Data State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [libraryData, setLibraryData] = useState<LibraryItem[]>([
    { id: 'f1', type: 'folder', name: 'CAMPAIGNS_24', parentId: null },
    { id: 'f2', type: 'folder', name: 'MEMES_ARCHIVE', parentId: null },
    { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400', parentId: null },
    { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', parentId: 'f1' } 
  ]);

  const [savedTemplates, setSavedTemplates] = useState<TemplateItem[]>([
    { id: 1, title: 'HASHTAG_SET_1', content: '#Growth #SaaS #Tech #Africa' },
    { id: 2, title: 'LAUNCH_INTRO', content: '🚀 We are excited to announce our new feature...' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  // Fetch Accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.socialAccounts || []);
        }
      } catch (e) { console.error(e); }
    };
    if (workspaceId) fetchAccounts();
  }, [workspaceId, API_URL]);

  /* ---- Handlers ---- */
  
  // 1. Post Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setMediaPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (type: 'queue' | 'draft' | 'review') => {
    if (!text && !file && !mediaPreview) return toast.error('POST_CANNOT_BE_EMPTY');
    
    // Map internal type to API status
    let status: any = 'DRAFT';
    if (type === 'queue') status = 'SCHEDULED';
    if (type === 'review') status = 'REVIEW'; // Assuming API handles 'REVIEW' or 'PENDING'

    setIsSubmitting(true);
    await onSchedule(text, type === 'queue' ? date || new Date() : undefined, mediaPreview || undefined, 'image', category, [], status);
    
    // Reset form
    setText('');
    setDate(undefined);
    setFile(null);
    setMediaPreview(null);
    setIsSubmitting(false);
    toast.success(type === 'review' ? 'SENT_FOR_REVIEW' : 'SAVED_SUCCESSFULLY');
  };

  // 2. Library Logic
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const newFiles: LibraryItem[] = Array.from(e.target.files).map((f) => ({
            id: Math.random().toString(36).substr(2, 9),
            type: f.type.startsWith('video') ? 'video' : 'image',
            url: URL.createObjectURL(f),
            parentId: currentFolderId
        }));
        setLibraryData(prev => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} ASSETS_UPLOADED`);
    }
  };

  const handleCreateFolder = () => {
    if (!inputFolderName.trim()) return;
    setLibraryData(prev => [
        ...prev, 
        { id: Math.random().toString(36).substr(2, 9), type: 'folder', name: inputFolderName, parentId: currentFolderId }
    ]);
    setInputFolderName("");
    setShowFolderModal(false);
    toast.success("FOLDER_CREATED");
  };

  const navigateUp = () => setCurrentFolderId(null); // Simple 1-level depth for demo
  const currentItems = libraryData.filter(item => item.parentId === currentFolderId);

  const handleUseMedia = (url?: string) => {
    if(!url) return;
    setMediaPreview(url);
    toast.success('MEDIA_ATTACHED');
  };

  // 3. Template & AI Logic
  const handleAiRewrite = () => {
    if(!text) return toast.error("WRITE_SOMETHING_FIRST");
    setIsAiLoading(true);
    setTimeout(() => {
        setText((prev) => `✨ (AI Enhanced) ${prev} \n\n#EasyPost #Growth`);
        setIsAiLoading(false);
        toast.success("CONTENT_REWRITTEN");
    }, 1500);
  };

  const handleSaveTemplate = () => {
    if(!inputTemplateName.trim()) return;
    setSavedTemplates(prev => [...prev, { id: Date.now(), title: inputTemplateName, content: text }]);
    setInputTemplateName("");
    setShowTemplateModal(false);
    toast.success("TEMPLATE_SAVED");
  };

  const handleUseTemplate = (content: string) => {
    setText((p) => p + (p ? '\n\n' : '') + content);
    toast.success('TEMPLATE_INSERTED');
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-black">
      
      {/* 1. MAIN COMPOSER CARD */}
      <div className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] relative">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

        {/* Header Strip */}
        <div className="px-4 py-3 flex items-center justify-between bg-yellow-400 border-b-2 border-black">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-black uppercase tracking-widest mr-2 whitespace-nowrap bg-black text-white px-2 py-1">
              TARGET_
            </span>
            {accounts.map((acc) => (
              <div key={acc.id} className="relative w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-blue-50 transition-all flex-shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-y-1">
                {acc.avatar ? (
                  <img src={acc.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-sm font-black">{acc.username?.[0].toUpperCase()}</span>
                )}
                <div className="absolute -bottom-2 -right-2 bg-white p-0.5 border-2 border-black z-10">
                  <PlatformIcon platform={acc.platform} />
                </div>
              </div>
            ))}
            <button onClick={() => router.push(`/dashboard/${workspaceId}?tab=settings`)} className="w-10 h-10 flex-shrink-0 border-2 border-dashed border-black hover:bg-white flex items-center justify-center hover:text-blue-600 transition-all" title="Connect account">
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <button onClick={() => setIsLibraryOpen((v) => !v)} className={cn("flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase border-2 border-black transition-all", isLibraryOpen ? "bg-black text-white" : "bg-white hover:bg-gray-100")}>
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">{isLibraryOpen ? 'Hide_Assets' : 'Show_Assets'}</span>
          </button>
        </div>

        {/* Editor Toolbar (New) */}
        <div className="px-6 pt-4 pb-2 flex gap-2 justify-end bg-white">
            <button onClick={handleAiRewrite} disabled={isAiLoading} className="text-[10px] font-black uppercase flex items-center gap-1 bg-purple-100 px-2 py-1 border-2 border-black hover:bg-purple-200 transition-all">
                <Wand2 size={12} className={isAiLoading ? "animate-spin" : ""} /> {isAiLoading ? "Thinking..." : "AI_Rewrite"}
            </button>
            <button onClick={() => { if(!text) return toast.error("Write text first"); setShowTemplateModal(true); }} className="text-[10px] font-black uppercase flex items-center gap-1 bg-green-100 px-2 py-1 border-2 border-black hover:bg-green-200 transition-all">
                <Save size={12} /> Save_Template
            </button>
            <button onClick={() => setText("")} className="text-[10px] font-black uppercase flex items-center gap-1 bg-gray-100 px-2 py-1 border-2 border-black hover:bg-gray-200 transition-all">
                <Eraser size={12} /> Clear
            </button>
        </div>

        {/* Editor Body */}
        <div className="px-6 pb-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="TYPE_YOUR_CONTENT_HERE..."
            className="min-h-[140px] border-none shadow-none resize-none focus-visible:ring-0 text-lg font-medium placeholder:text-gray-400 bg-transparent p-0 rounded-none leading-relaxed"
          />
          
          {mediaPreview && (
            <div className="relative w-full h-64 border-2 border-black mt-4 group bg-gray-100 shadow-[4px_4px_0px_0px_#000]">
              <img src={mediaPreview} className="w-full h-full object-cover" alt="" />
              <button onClick={() => { setFile(null); setMediaPreview(null); }} className="absolute top-2 right-2 bg-red-500 border-2 border-black text-white p-1 hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000]">
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-gray-300 gap-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="Upload image" />
              <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="Upload video" />
              <div className="h-8 w-0.5 bg-black mx-1" />
              <button onClick={() => setIsSelling(!isSelling)} className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000]", isSelling ? "bg-[#3C48F6] text-white" : "bg-white hover:bg-yellow-100")}>
                <ShoppingBag size={14} /> {isSelling ? 'SELLING: ON' : 'SELL'}
              </button>
              
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap">
                    <Tag size={12} /> {category} <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none" align="start">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => { setCategory(cat); setIsCategoryOpen(false); }} className={cn('w-full text-left px-4 py-2 text-sm hover:bg-yellow-200 transition flex items-center justify-between border-b border-gray-200 last:border-0 font-bold uppercase', category === cat && 'bg-yellow-400')}>
                      {cat} {category === cat && <Check size={14} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Popover>
                <PopoverTrigger asChild>
                  <NeuButton className="bg-white text-black px-3">
                    <CalendarIcon className="mr-2 h-4 w-4" /> {date ? format(date, 'MMM d, HH:mm') : 'DATE'}
                  </NeuButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]" align="center" side="top" sideOffset={12}>
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-none bg-white p-3" />
                  <div className="p-3 border-t-2 border-black bg-yellow-50 flex items-center gap-2">
                    <Clock size={16} className="text-black" />
                    <input type="time" className="flex-1 text-sm bg-transparent outline-none font-bold text-black border-b-2 border-black/20 focus:border-black" onChange={e => { if (!e.target.value) return; const [h, m] = e.target.value.split(':'); const newDate = date || new Date(); newDate.setHours(parseInt(h)); newDate.setMinutes(parseInt(m)); setDate(new Date(newDate)); }} />
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex gap-2">
                  <button onClick={() => handleSubmit('review')} disabled={isSubmitting} className="px-3 py-2 bg-purple-100 text-purple-900 font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all flex items-center gap-1">
                      <FileCheck size={14} /> REVIEW
                  </button>
                  <NeuButton onClick={() => handleSubmit(date ? 'queue' : 'draft')} disabled={isSubmitting} className="bg-[#3C48F6] text-white hover:bg-blue-700 px-4">
                    {isSubmitting ? <Clock className="animate-spin w-4 h-4" /> : (date ? <Clock className="w-4 h-4 mr-2"/> : <Send className="w-4 h-4 mr-2"/>)}
                    {date ? 'SCHEDULE' : 'POST'}
                  </NeuButton>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {isSelling && (
                <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="flex gap-0 items-center overflow-hidden">
                    <div className="bg-black text-white text-xs font-bold px-3 py-2 border-y-2 border-l-2 border-black">FCFA</div>
                    <input type="number" placeholder="PRICE (e.g. 5000)" className="bg-white text-sm font-bold text-black w-full outline-none px-3 py-2 border-2 border-black placeholder:text-gray-400 placeholder:font-normal" />
                    <div className="text-[10px] bg-green-200 text-black px-2 py-2 border-y-2 border-r-2 border-black font-black uppercase whitespace-nowrap">MoMo Ready</div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. ASSETS PANEL */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col"
          >
            <div className="px-4 py-2 border-b-2 border-black bg-black text-white flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid size={14} /> OS_Asset_Explorer
              </span>
              <button onClick={() => setIsLibraryOpen(false)} className="hover:bg-white hover:text-black rounded-none p-1 transition-colors border border-transparent hover:border-white"><X size={14} /></button>
            </div>
            
            <Tabs defaultValue="media" className="flex-1 flex flex-col min-h-0 bg-yellow-50/50">
              <div className="px-4 pt-4 pb-0">
                <TabsList className="w-full grid grid-cols-2 h-10 bg-transparent gap-2 p-0">
                  <TabsTrigger value="media" className="text-xs font-black uppercase border-2 border-black bg-white data-[state=active]:bg-[#3C48F6] data-[state=active]:text-white shadow-[2px_2px_0px_0px_#000] data-[state=active]:translate-x-[1px] data-[state=active]:translate-y-[1px] data-[state=active]:shadow-none transition-all rounded-none">
                    System_Files
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs font-black uppercase border-2 border-black bg-white data-[state=active]:bg-[#3C48F6] data-[state=active]:text-white shadow-[2px_2px_0px_0px_#000] data-[state=active]:translate-x-[1px] data-[state=active]:translate-y-[1px] data-[state=active]:shadow-none transition-all rounded-none">
                    Saved_Templates
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1 p-4 h-64 lg:h-80">
                <TabsContent value="media" className="mt-0 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                     <input type="file" ref={libraryInputRef} onChange={handleBulkUpload} multiple accept="image/*,video/*" className="hidden" />
                     <button onClick={() => setShowFolderModal(true)} className="px-3 py-1 bg-white border-2 border-black text-[10px] font-bold uppercase hover:bg-yellow-200 shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-none">+ New_Folder</button>
                     <button onClick={() => libraryInputRef.current?.click()} className="px-3 py-1 bg-white border-2 border-black text-[10px] font-bold uppercase hover:bg-green-200 shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-none">+ Upload_Files</button>
                     {currentFolderId && <button onClick={navigateUp} className="ml-auto px-3 py-1 bg-gray-200 border-2 border-black text-[10px] font-bold uppercase hover:bg-gray-300 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"><CornerLeftUp size={10} /> Up_Level</button>}
                  </div>

                  {currentItems.length === 0 && (
                      <div className="h-32 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-400">
                          <p className="font-mono text-xs font-bold">DIRECTORY_EMPTY</p>
                      </div>
                  )}

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {currentItems.filter(i => i.type === 'folder').map((folder) => (
                        <RetroFolder key={folder.id} name={folder.name || "Untitled"} onClick={() => setCurrentFolderId(folder.id)} />
                    ))}
                    {currentItems.filter(i => i.type !== 'folder').map((item) => (
                      <div key={item.id} onClick={() => handleUseMedia(item.url)} className="relative aspect-square border-2 border-black overflow-hidden cursor-pointer group hover:shadow-[4px_4px_0px_0px_#000] transition-all bg-white">
                        {/* FIX: Removed 'grayscale' class so images are full color */}
                        <img src={item.url} className="w-full h-full object-cover transition-all" alt="" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus size={24} className="text-white drop-shadow-md" strokeWidth={4} />
                        </div>
                        <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-bold px-1 uppercase">{item.type.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="templates" className="mt-0 space-y-3">
                  {savedTemplates.map((t) => (
                    <div key={t.id} onClick={() => handleUseTemplate(t.content)} className="p-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer group transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black uppercase bg-yellow-300 px-1 border border-black">{t.title}</span>
                        <Copy size={14} className="text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 font-mono">{t.content}</p>
                    </div>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}
      <NeuModal title="CREATE_NEW_FOLDER" isOpen={showFolderModal} onClose={() => setShowFolderModal(false)}>
          <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Folder Name</label>
                  <input value={inputFolderName} onChange={(e) => setInputFolderName(e.target.value)} className="w-full border-2 border-black p-2 font-bold uppercase focus:outline-none focus:bg-yellow-50" placeholder="E.G. SUMMER_SALE" autoFocus />
              </div>
              <div className="flex justify-end gap-2">
                  <NeuButton onClick={() => setShowFolderModal(false)} variant="ghost" className="border-2 border-black">Cancel</NeuButton>
                  <NeuButton onClick={handleCreateFolder} variant="primary" disabled={!inputFolderName.trim()}>Create</NeuButton>
              </div>
          </div>
      </NeuModal>

      <NeuModal title="SAVE_AS_TEMPLATE" isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
          <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Template Title</label>
                  <input value={inputTemplateName} onChange={(e) => setInputTemplateName(e.target.value)} className="w-full border-2 border-black p-2 font-bold uppercase focus:outline-none focus:bg-yellow-50" placeholder="E.G. WEEKLY_UPDATE" autoFocus />
              </div>
              <div className="bg-gray-100 p-2 border-2 border-black text-xs font-mono text-gray-600 line-clamp-3">
                  {text || "(No content selected)"}
              </div>
              <div className="flex justify-end gap-2">
                  <NeuButton onClick={() => setShowTemplateModal(false)} variant="ghost" className="border-2 border-black">Cancel</NeuButton>
                  <NeuButton onClick={handleSaveTemplate} variant="primary" disabled={!inputTemplateName.trim()}>Save</NeuButton>
              </div>
          </div>
      </NeuModal>

    </div>
  );
}

// 🟢 NEUTRAL TOOL BUTTON
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
  <button onClick={onClick} title={tooltip} className="p-2 border-2 border-black bg-white hover:bg-yellow-200 shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all text-black">
    <Icon size={18} strokeWidth={2.5} />
  </button>
);

const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'facebook': return <Facebook size={14} className="text-blue-600 fill-blue-600" />;
    case 'linkedin': return <Linkedin size={14} className="text-blue-700 fill-blue-700" />;
    case 'twitter': return <Twitter size={14} className="text-black fill-black" />;
    case 'instagram': return <Instagram size={14} className="text-pink-600" />;
    default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  }
};