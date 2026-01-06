'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// UI & Icons
import { 
  Image as ImageIcon, Video, Smile, Zap, Calendar as CalendarIcon, 
  X, Clock, Send, Facebook, Instagram, Linkedin, Twitter, Tag, Sparkles
} from 'lucide-react';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ComposerProps {
  onSchedule: (
    content: string, 
    date?: Date, 
    mediaUrl?: string, 
    mediaType?: "image" | "video",
    category?: string,
    tags?: string[]
  ) => Promise<void>;
}

const CATEGORIES = ["General", "Technology", "Marketing", "Personal", "News", "Meme", "Educational"];

export default function Composer({ onSchedule }: ComposerProps) {
  const params = useParams();
  const workspaceId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // 1. Local State
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("General");
  const [accounts, setAccounts] = useState<any[]>([]); // To store connected accounts
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. FETCH ACCOUNTS (On Mount) ---
  useEffect(() => {
    const fetchAccounts = async () => {
        const token = localStorage.getItem('accessToken');
        if(!token) return;
        try {
            // We fetch the workspace details to get connected accounts
            const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setAccounts(data.socialAccounts || []);
            }
        } catch (e) {
            console.error("Failed to load accounts", e);
        }
    };
    if(workspaceId) fetchAccounts();
  }, [workspaceId, API_URL]);


  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMediaPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeMedia = () => {
    setFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAiAssist = async () => {
    setIsAiLoading(true);
    const token = localStorage.getItem('accessToken');
    
    try {
        const res = await fetch(`${API_URL}/ai/test-copywriting`, { // Replace with real endpoint later
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                product: text || "Social Media Post", 
                tone: "CASUAL" 
            })
        });
        
        const generatedText = await res.text(); // Or .json() depending on your endpoint
        setText(generatedText);
        toast.success("AI Magic applied! ✨");
    } catch (e) {
        toast.error("AI Assistant is taking a nap. Try again.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const extractHashtags = (content: string) => {
    const regex = /#[a-z0-9_]+/gi;
    return content.match(regex) || [];
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (type: 'queue' | 'draft') => {
    if (!text && !file) return toast.error("Post cannot be empty");
    
    setIsSubmitting(true);
    let uploadedUrl: string | undefined = undefined;
    let mediaType: "image" | "video" | undefined = undefined;

    try {
      // 1. Handle File Upload (To NestJS -> Cloudinary)
      if (file) {
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
        
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('accessToken');
        const uploadRes = await fetch(`${API_URL}/media/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, // Do NOT set Content-Type for FormData
            body: formData
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.media.url; // Assuming NestJS returns { media: { url: ... } }
      }

      // 2. Prepare Data
      const scheduledDate = type === 'queue' ? (date || new Date()) : undefined;
      const extractedTags = extractHashtags(text);

      // 3. Pass Data to Parent
      await onSchedule(text, scheduledDate, uploadedUrl, mediaType, category, extractedTags);
      
      // 4. Reset Form
      setText('');
      setDate(undefined);
      setCategory("General");
      removeMedia();

    } catch (error) {
      console.error(error);
      toast.error("Failed to post. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm overflow-hidden mb-8 transition-all focus-within:ring-2 focus-within:ring-primary/20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

      {/* 1. Account Selector Header */}
      <div className="bg-gray-50 dark:bg-zinc-950 px-4 py-3 border-b border-border flex items-center gap-3 overflow-x-auto scrollbar-hide">
        <span className="text-xs font-bold text-muted-foreground uppercase mr-2 whitespace-nowrap">Post to:</span>
        
        {accounts.length === 0 ? (
           <span className="text-xs text-red-400">No accounts connected. Go to Settings.</span>
        ) : (
          accounts.map(acc => (
            <div 
              key={acc.id}
              className="relative group w-9 h-9 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
              title={acc.username}
            >
              {acc.avatar ? (
                 <img src={acc.avatar} alt={acc.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                 <span className="text-xs font-bold text-gray-700">{acc.username?.charAt(0).toUpperCase()}</span>
              )}
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-[2px] shadow-sm border border-gray-100">
                <PlatformIcon platform={acc.platform} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. Composer Body */}
      <div className="p-4">
        <Textarea 
          value={text} 
          onChange={e => setText(e.target.value)}
          placeholder="What's new with your project?" 
          className="min-h-[120px] border-none shadow-none resize-none focus-visible:ring-0 text-base p-0 placeholder:text-muted-foreground bg-transparent"
        />
        
        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative w-full h-64 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden mt-4 group border border-border">
             {file?.type.startsWith('video') ? (
                <video src={mediaPreview} controls className="w-full h-full object-cover" />
             ) : (
                <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
             )}
             
             <button 
               onClick={removeMedia} 
               disabled={isSubmitting}
               className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
             >
               <X size={16} />
             </button>
          </div>
        )}

        {/* 3. Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-border gap-4">
          
          {/* Left Tools */}
          <div className="flex items-center gap-1">
            <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="Add Media" disabled={isSubmitting} />
            <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="Add Video" disabled={isSubmitting} />
            <ToolButton icon={Smile} tooltip="Emoji (Coming Soon)" disabled={isSubmitting} />
            
            {/* Category Selector */}
            <div className="flex items-center ml-2 pl-2 border-l border-gray-200 relative group">
                <Tag size={16} className="text-gray-400 absolute left-4 pointer-events-none" />
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="pl-8 pr-2 py-1.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-md text-gray-700 outline-none hover:bg-gray-100 cursor-pointer appearance-none transition-colors"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <button 
              onClick={handleAiAssist} 
              disabled={isSubmitting || isAiLoading}
              className="ml-2 flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} className={isAiLoading ? "animate-spin" : ""} />
              {isAiLoading ? "Thinking..." : "AI Assist"}
            </button>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant={"outline"}
                   size="sm"
                   disabled={isSubmitting}
                   className={cn(
                     "justify-start text-left font-normal h-9",
                     !date && "text-muted-foreground border-transparent hover:bg-gray-100"
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {date ? format(date, "MMM d, HH:mm") : "Schedule"}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="end">
                 <Calendar
                   mode="single"
                   selected={date}
                   onSelect={setDate}
                   initialFocus
                 />
                 <div className="p-3 border-t border-border">
                    <input 
                      type="time" 
                      className="w-full text-sm p-1 border rounded bg-transparent"
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

             <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

             {date ? (
               <Button 
                disabled={isSubmitting}
                onClick={() => handleSubmit('queue')}
                className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
               >
                 <Clock className="w-4 h-4 mr-2" />
                 {isSubmitting ? 'Uploading...' : 'Schedule Post'}
               </Button>
             ) : (
               <>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => handleSubmit('draft')} 
                   disabled={isSubmitting}
                   className="text-muted-foreground"
                 >
                   Save Draft
                 </Button>
                 <Button 
                    disabled={isSubmitting} 
                    onClick={() => handleSubmit('queue')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                 >
                   <Send className="w-4 h-4 mr-2" /> 
                   {isSubmitting ? 'Posting...' : 'Post Now'}
                 </Button>
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const ToolButton = ({ icon: Icon, onClick, tooltip, disabled }: any) => (
  <Button 
    variant="ghost" 
    size="icon" 
    onClick={onClick} 
    disabled={disabled}
    title={tooltip} 
    className="text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800"
  >
    <Icon size={18}/>
  </Button>
);

const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'facebook': 
      return <Facebook size={12} className="text-blue-600 fill-blue-600" />;
    case 'instagram': 
      return <Instagram size={12} className="text-pink-600" />;
    case 'twitter': 
    case 'x':
      return <Twitter size={12} className="text-black fill-black dark:text-white dark:fill-white" />;
    case 'linkedin': 
      return <Linkedin size={12} className="text-blue-700 fill-blue-700" />;
    case 'tiktok':
        return <span className="text-[8px] font-bold text-black dark:text-white">TT</span>;
    default: 
      return <span className="text-[10px] text-gray-400">#</span>;
  }
};