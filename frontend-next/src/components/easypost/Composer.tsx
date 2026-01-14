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
  LayoutGrid, Plus, UploadCloud, Copy, ChevronDown, Check, ShoppingBag
} from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComposerProps {
  onSchedule: (
    content: string,
    date?: Date,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    category?: string,
    tags?: string[]
  ) => Promise<void>;
}

const CATEGORIES = ['General', 'Technology', 'Marketing', 'Personal', 'News', 'Meme', 'Educational'];
const BRAND_YELLOW = '#FFD700';
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
  
  // Library State - Default OPEN
  const [isLibraryOpen, setIsLibraryOpen] = useState(true); 
  const [isSelling, setIsSelling] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mediaLibrary] = useState([
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400',
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400'
  ]);
  const [savedTemplates] = useState([
    { id: 1, title: 'Hashtag Set', content: '#Growth #SaaS #Tech' },
    { id: 2, title: 'Launch Intro', content: '🚀 We are excited to announce...' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (e) {
        console.error(e);
      }
    };
    if (workspaceId) fetchAccounts();
  }, [workspaceId, API_URL]);

  /* ---- Handlers ---- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setMediaPreview(URL.createObjectURL(selected));
    }
  };

  const handleUseTemplate = (content: string) => {
    setText((p) => p + (p ? '\n\n' : '') + content);
    toast.success('Template inserted');
  };

  const handleUseMedia = (url: string) => {
    setMediaPreview(url);
    toast.success('Media selected');
  };

  const handleSubmit = async (type: 'queue' | 'draft') => {
    if (!text && !file && !mediaPreview) return toast.error('Post cannot be empty');
    setIsSubmitting(true);
    await onSchedule(text, type === 'queue' ? date || new Date() : undefined, mediaPreview || undefined, 'image', category, []);
    setText('');
    setDate(undefined);
    setFile(null);
    setMediaPreview(null);
    setIsSubmitting(false);
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
            
            <button
              onClick={() => router.push(`/dashboard/${workspaceId}?tab=settings`)}
              className="w-10 h-10 flex-shrink-0 border-2 border-dashed border-black hover:bg-white flex items-center justify-center hover:text-blue-600 transition-all"
              title="Connect account"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <button
            onClick={() => setIsLibraryOpen((v) => !v)}
            className={cn(
                "flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase border-2 border-black transition-all",
                isLibraryOpen ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            )}
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">{isLibraryOpen ? 'Hide_Assets' : 'Show_Assets'}</span>
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="TYPE_YOUR_CONTENT_HERE..."
            className="min-h-[160px] border-none shadow-none resize-none focus-visible:ring-0 text-lg font-medium placeholder:text-gray-400 bg-transparent p-0 rounded-none leading-relaxed"
          />
          
          {mediaPreview && (
            <div className="relative w-full h-64 border-2 border-black mt-4 group bg-gray-100 shadow-[4px_4px_0px_0px_#000]">
              <img src={mediaPreview} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() => { setFile(null); setMediaPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 border-2 border-black text-white p-1 hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000]"
              >
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

              {/* Selling Toggle */}
              <button
                onClick={() => setIsSelling(!isSelling)}
                className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000]",
                    isSelling 
                        ? "bg-[#3C48F6] text-white" 
                        : "bg-white hover:bg-yellow-100"
                )}
              >
                <ShoppingBag size={14} />
                {isSelling ? 'SELLING: ON' : 'SELL'}
              </button>
              
              {/* Category Popover */}
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap">
                    <Tag size={12} />
                    {category}
                    <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none" align="start">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-yellow-200 transition flex items-center justify-between border-b border-gray-200 last:border-0 font-bold uppercase',
                        category === cat && 'bg-yellow-400'
                      )}
                    >
                      {cat}
                      {category === cat && <Check size={14} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <NeuButton className="bg-white text-black px-4">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'MMM d, HH:mm') : 'PICK_DATE'}
                  </NeuButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]" align="center" side="top" sideOffset={12}>
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-none bg-white p-3" />
                  <div className="p-3 border-t-2 border-black bg-yellow-50 flex items-center gap-2">
                    <Clock size={16} className="text-black" />
                    <input 
                        type="time" 
                        className="flex-1 text-sm bg-transparent outline-none font-bold text-black border-b-2 border-black/20 focus:border-black" 
                        onChange={e => { if (!e.target.value) return; const [h, m] = e.target.value.split(':'); const newDate = date || new Date(); newDate.setHours(parseInt(h)); newDate.setMinutes(parseInt(m)); setDate(new Date(newDate)); }} 
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <NeuButton
                onClick={() => handleSubmit(date ? 'queue' : 'draft')}
                disabled={isSubmitting}
                className="bg-[#3C48F6] text-white hover:bg-blue-700 px-6 w-full sm:w-auto"
              >
                {isSubmitting ? <Clock className="animate-spin w-4 h-4" /> : (date ? <Clock className="w-4 h-4 mr-2"/> : <Send className="w-4 h-4 mr-2"/>)}
                {date ? 'SCHEDULE' : 'POST_NOW'}
              </NeuButton>
            </div>
          </div>
          
          {/* Price Input */}
          <AnimatePresence>
            {isSelling && (
                <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                    animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="flex gap-0 items-center overflow-hidden"
                >
                    <div className="bg-black text-white text-xs font-bold px-3 py-2 border-y-2 border-l-2 border-black">FCFA</div>
                    <input 
                        type="number" 
                        placeholder="PRICE (e.g. 5000)" 
                        className="bg-white text-sm font-bold text-black w-full outline-none px-3 py-2 border-2 border-black placeholder:text-gray-400 placeholder:font-normal" 
                    />
                    <div className="text-[10px] bg-green-200 text-black px-2 py-2 border-y-2 border-r-2 border-black font-black uppercase whitespace-nowrap">
                        MoMo Ready
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. ASSETS PANEL (Stacked Below) */}
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
                <LayoutGrid size={14} /> Asset_Library
              </span>
              <button onClick={() => setIsLibraryOpen(false)} className="hover:bg-white hover:text-black rounded-none p-1 transition-colors border border-transparent hover:border-white">
                <X size={14} />
              </button>
            </div>
            
            <Tabs defaultValue="media" className="flex-1 flex flex-col min-h-0 bg-yellow-50">
              <div className="px-4 pt-4 pb-0">
                <TabsList className="w-full grid grid-cols-2 h-10 bg-transparent gap-2 p-0">
                  <TabsTrigger 
                    value="media" 
                    className="text-xs font-black uppercase border-2 border-black bg-white data-[state=active]:bg-[#3C48F6] data-[state=active]:text-white shadow-[2px_2px_0px_0px_#000] data-[state=active]:translate-x-[1px] data-[state=active]:translate-y-[1px] data-[state=active]:shadow-none transition-all rounded-none"
                  >
                    Media_Files
                  </TabsTrigger>
                  <TabsTrigger 
                    value="templates" 
                    className="text-xs font-black uppercase border-2 border-black bg-white data-[state=active]:bg-[#3C48F6] data-[state=active]:text-white shadow-[2px_2px_0px_0px_#000] data-[state=active]:translate-x-[1px] data-[state=active]:translate-y-[1px] data-[state=active]:shadow-none transition-all rounded-none"
                  >
                    Text_Templates
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1 p-4 h-64 lg:h-80">
                <TabsContent value="media" className="mt-0 space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black bg-white p-4 flex flex-col items-center justify-center text-black hover:bg-yellow-200 cursor-pointer transition-all h-24 group"
                  >
                    <UploadCloud size={24} className="mb-1" strokeWidth={2} />
                    <span className="text-xs font-black uppercase">Click_to_Upload</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {mediaLibrary.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => handleUseMedia(url)}
                        className="relative aspect-square border-2 border-black overflow-hidden cursor-pointer group hover:shadow-[4px_4px_0px_0px_#000] transition-all bg-white"
                      >
                        <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus size={24} className="text-white drop-shadow-md" strokeWidth={4} />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="templates" className="mt-0 space-y-3">
                  {savedTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleUseTemplate(t.content)}
                      className="p-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer group transition-all"
                    >
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
    </div>
  );
}

// 🟢 NEUTRAL TOOL BUTTON (Re-styled)
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
  <button 
    onClick={onClick} 
    title={tooltip} 
    className="p-2 border-2 border-black bg-white hover:bg-yellow-200 shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all text-black"
  >
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