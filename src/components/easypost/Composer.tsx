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
  LayoutGrid, Plus, UploadCloud, Copy, ChevronDown, Check
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
const BRAND = '#304AEB';

/* ----------  COMPONENT  ---------- */
export default function Composer({ onSchedule }: ComposerProps) {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  /* ---- state ---- */
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState('General');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [mediaLibrary] = useState([
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400',
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400'
  ]);
  const [savedTemplates] = useState([
    { id: 1, title: 'Hashtag Set', content: '#Growth #SaaS #Tech' },
    { id: 2, title: 'Launch Intro', content: '🚀 We are excited to announce...' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  /* ---- fetch accounts ---- */
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

  /* ---- handlers ---- */
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
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* =====  MAIN COMPOSER  ===== */}
        <div className="md:col-span-2 order-1">
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-lg overflow-hidden">
            {/* account header */}
            <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-neutral-900 dark:to-black border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Publish to</span>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="relative w-9 h-9 rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-neutral-300 dark:border-neutral-700 flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-md hover:border-brand transition"
                  >
                    {acc.avatar ? (
                      <img src={acc.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{acc.username?.[0].toUpperCase()}</span>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] border shadow-xs">
                      <PlatformIcon platform={acc.platform} />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => router.push(`/dashboard/${workspaceId}?tab=settings`)}
                  className="w-9 h-9 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-brand flex items-center justify-center text-neutral-400 hover:text-brand transition"
                  title="Connect account"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLibraryOpen((v) => !v)}
                className={cn('text-xs gap-2 h-8 font-medium rounded-full', isLibraryOpen && 'bg-brand/10 text-brand')}
              >
                <LayoutGrid size={14} />
                {isLibraryOpen ? 'Hide' : 'Assets'}
              </Button>
            </div>

            {/* editor body */}
            <div className="p-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What’s launching today?"
                className="min-h-[140px] border-none shadow-none resize-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"
              />
              {mediaPreview && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden mt-4 border border-neutral-300 dark:border-neutral-700 group">
                  <img src={mediaPreview} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => {
                      setFile(null);
                      setMediaPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-100 p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-700 shadow-md transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 gap-3">
                <div className="flex items-center gap-2">
                  <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="Upload image" />
                  <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="Upload video" />
                  <div className="h-5 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
                  <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 transition">
                        <Tag size={12} className="text-brand" />
                        {category}
                        <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-between',
                            category === cat && 'font-bold text-brand bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          {cat}
                          {category === cat && <Check size={14} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs flex-1 sm:flex-none justify-center bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-xl"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                        {date ? format(date, 'MMM d, HH:mm') : 'Schedule'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end" side="top" sideOffset={8}>
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-md border-0" />
                      <div className="p-3 border-t bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-2">
                        <Clock size={14} className="text-neutral-500" />
                        <input
                          type="time"
                          className="flex-1 text-sm bg-transparent outline-none font-medium"
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const [h, m] = e.target.value.split(':');
                            const newDate = date || new Date();
                            newDate.setHours(parseInt(h));
                            newDate.setMinutes(parseInt(m));
                            setDate(new Date(newDate));
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    onClick={() => handleSubmit(date ? 'queue' : 'draft')}
                    disabled={isSubmitting}
                    size="sm"
                    className="btn-brand h-9 flex-1 sm:flex-none rounded-xl"
                  >
                    {isSubmitting ? (
                      <Clock className="animate-spin w-3.5 h-3.5" />
                    ) : date ? (
                      <Clock className="w-3.5 h-3.5 mr-2" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-2" />
                    )}
                    {date ? 'Schedule' : 'Post now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====  ASSETS PANEL  ===== */}
        <AnimatePresence>
          {isLibraryOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:col-span-1 order-2"
            >
              <div className="bg-white dark:bg-black rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                    <LayoutGrid size={14} /> Assets
                  </span>
                  <button onClick={() => setIsLibraryOpen(false)} className="hover:bg-black/5 dark:hover:bg-white/5 rounded-full p-1 transition-colors">
                    <X size={14} className="text-neutral-400" />
                  </button>
                </div>
                <Tabs defaultValue="media" className="flex-1 flex flex-col min-h-0">
                  <div className="px-4 pt-3 pb-2">
                    <TabsList className="w-full grid grid-cols-2 h-8 bg-neutral-100 dark:bg-neutral-800">
                      <TabsTrigger value="media" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm rounded-lg">
                        Media
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm rounded-lg">
                        Templates
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <TabsContent value="media" className="mt-0 space-y-3">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-4 flex flex-col items-center justify-center text-neutral-400 hover:border-brand hover:bg-brand/5 cursor-pointer transition-all h-24"
                      >
                        <UploadCloud size={20} className="mb-1" />
                        <span className="text-[10px] font-bold">Upload new</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {mediaLibrary.map((url, i) => (
                          <div
                            key={i}
                            onClick={() => handleUseMedia(url)}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-neutral-300 dark:border-neutral-700 hover:border-brand transition-all"
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
                          className="p-3 bg-white/50 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-brand hover:shadow-md cursor-pointer group transition-all"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{t.title}</span>
                            <Copy size={12} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{t.content}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
    </div>
  );
}

/* ----------  sub-components  ---------- */
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
  <button onClick={onClick} title={tooltip} className="p-2 text-neutral-500 hover:text-brand hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-lg transition-colors">
    <Icon size={18} />
  </button>
);

const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'facebook':
      return <Facebook size={14} className="text-blue-600 fill-blue-600" />;
    case 'linkedin':
      return <Linkedin size={14} className="text-blue-700 fill-blue-700" />;
    case 'twitter':
      return <Twitter size={14} className="text-black fill-black" />;
    case 'instagram':
      return <Instagram size={14} className="text-pink-600" />;
    default:
      return <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-600 rounded-full" />;
  }
};