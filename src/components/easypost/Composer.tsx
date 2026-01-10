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

import { Button } from '@/components/ui/button';
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
const BRAND_COLOR = '#304AEB';

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
    <div className="w-full flex flex-col gap-6">
      
      {/* 1. MAIN COMPOSER CARD */}
      <div className="w-full bg-card dark:bg-[#09090b] rounded-2xl border border-border shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#304AEB]/20">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

        {/* Account Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-black border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2 whitespace-nowrap">Post to</span>
            
            {accounts.map((acc) => (
              <div key={acc.id} className="relative w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center cursor-pointer hover:border-[#304AEB] transition-all shadow-sm flex-shrink-0">
                {acc.avatar ? (
                  <img src={acc.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  <span className="text-xs font-bold text-foreground">{acc.username?.[0].toUpperCase()}</span>
                )}
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-[2px] border border-border shadow-sm">
                  <PlatformIcon platform={acc.platform} />
                </div>
              </div>
            ))}
            
            <button
              onClick={() => router.push(`/dashboard/${workspaceId}?tab=settings`)}
              className="w-9 h-9 flex-shrink-0 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-[#304AEB] hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center text-muted-foreground hover:text-[#304AEB] transition-all"
              title="Connect account"
            >
              <Plus size={16} />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLibraryOpen((v) => !v)}
            className={cn('text-xs gap-2 h-8 font-medium rounded-lg', isLibraryOpen && ' text-muted')}
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">{isLibraryOpen ? 'Hide' : 'Assets'}</span>
          </Button>
        </div>

        {/* Editor Body */}
        <div className="p-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What are we posting today?"
            className="min-h-[140px] border-none shadow-none resize-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-muted-foreground/50 bg-transparent p-0"
          />
          
          {mediaPreview && (
            <div className="relative w-full h-64 rounded-xl overflow-hidden mt-4 border border-border group bg-background">
              <img src={mediaPreview} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() => { setFile(null); setMediaPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t border-border gap-4">
            
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              {/* 🟢 NEUTRAL HOVER BUTTONS */}
              <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="Upload image" />
              <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="Upload video" />
              
              {/* Selling Toggle */}
              <button
                onClick={() => setIsSelling(!isSelling)}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ml-1",
                    isSelling 
                        ? "bg-[#304AEB] text-white border-[#304AEB] shadow-md shadow-green-900/20" 
                        : "bg-transparent text-muted-foreground border-transparent hover:border-border"
                )}
              >
                <ShoppingBag size={14} />
                {isSelling ? 'Selling' : 'Sell'}
              </button>

              <div className="h-5 w-px bg-border mx-1" />
              
              {/* Category Popover */}
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5  hover:border-border rounded-full text-xs font-medium text-foreground transition-colors border border-transparent  whitespace-nowrap">
                    <Tag size={12} className="text-[#304AEB]" />
                    {category}
                    <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1 bg-popover border-border" align="start">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded-md hover:border-border transition flex items-center justify-between',
                        category === cat && 'font-bold text-[#304AEB] bg-[#304AEB]/10'
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs flex-1 sm:flex-none justify-center bg-transparent border-border rounded-xl text-muted-foreground hover:text-foreground">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {date ? format(date, 'MMM d, HH:mm') : 'Schedule'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border" align="center" side="top" sideOffset={8}>
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-md border-0 bg-popover" />
                  <div className="p-3 border-t border-border bg-muted/20 flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <input type="time" className="flex-1 text-sm bg-transparent outline-none font-medium text-foreground" onChange={e => { if (!e.target.value) return; const [h, m] = e.target.value.split(':'); const newDate = date || new Date(); newDate.setHours(parseInt(h)); newDate.setMinutes(parseInt(m)); setDate(new Date(newDate)); }} />
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => handleSubmit(date ? 'queue' : 'draft')}
                disabled={isSubmitting}
                size="sm"
                className="h-9 flex-1 sm:flex-none rounded-xl text-white hover:opacity-90 shadow-md transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isSubmitting ? <Clock className="animate-spin w-3.5 h-3.5" /> : (date ? <Clock className="w-3.5 h-3.5 mr-2"/> : <Send className="w-3.5 h-3.5 mr-2"/>)}
                {date ? 'Schedule' : 'Post Now'}
              </Button>
            </div>
          </div>
          
          {/* Price Input */}
          <AnimatePresence>
            {isSelling && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 flex gap-2 items-center  p-2 rounded-lg border border-border"
                >
                    <span className="text-muted text-xs font-bold pl-2">FCFA</span>
                    <input type="number" placeholder="Price (e.g. 5000)" className="bg-transparent text-sm text-foreground w-full outline-none placeholder:text-muted-foreground/50" />
                    <div className="text-[10px] text-muted-foreground pr-2 font-medium">MoMo Ready</div>
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
            className="w-full bg-card dark:bg-[#09090b] rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-border bg-black flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <LayoutGrid size={14} /> Library
              </span>
              <button onClick={() => setIsLibraryOpen(false)} className="hover:bg-muted rounded-full p-1 transition-colors">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            
            <Tabs defaultValue="media" className="flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-3 pb-2">
                <TabsList className="w-full grid grid-cols-2 h-8 bg-background">
                  <TabsTrigger value="media" className="text-xs data-[state=active]:bg-[#304AEB] data-[state=active]:text-foreground rounded-md">Media</TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs data-[state=active]:bg-[#304AEB] data-[state=active]:text-foreground rounded-md">Templates</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1 p-4 h-64 lg:h-80">
                <TabsContent value="media" className="mt-0 space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-[#304AEB] hover:text-[#304AEB] hover:bg-[#304AEB]/5 cursor-pointer transition-all h-24 group"
                  >
                    <UploadCloud size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Upload</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {mediaLibrary.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => handleUseMedia(url)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-border hover:border-[#304AEB] transition-all"
                      >
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus size={16} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="templates" className="mt-0 space-y-2">
                  {savedTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleUseTemplate(t.content)}
                      className="p-3 bg-muted/10 border border-border rounded-lg hover:border-[#304AEB] hover:shadow-sm cursor-pointer group transition-all"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-foreground">{t.title}</span>
                        <Copy size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#304AEB]" />
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{t.content}</p>
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

// 🟢 NEUTRAL TOOL BUTTON
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
  <button 
    onClick={onClick} 
    title={tooltip} 
    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
  >
    <Icon size={18} />
  </button>
);

const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'facebook': return <Facebook size={14} className="text-blue-600 fill-blue-600" />;
    case 'linkedin': return <Linkedin size={14} className="text-blue-700 fill-blue-700" />;
    case 'twitter': return <Twitter size={14} className="text-black fill-black dark:text-white dark:fill-white" />;
    case 'instagram': return <Instagram size={14} className="text-pink-600" />;
    default: return <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-600 rounded-full" />;
  }
};