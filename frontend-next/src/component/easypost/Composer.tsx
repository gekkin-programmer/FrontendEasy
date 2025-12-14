'use client';
import React, { useState, useRef } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from 'next/navigation';
import { Id } from "@/convex/_generated/dataModel";

// UI & Icons
import { Image as ImageIcon, Video, Smile, Zap, Calendar as CalendarIcon, X, Clock, Send, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ComposerProps {
  onSchedule: (content: string, date?: Date) => Promise<void>;
}

export default function Composer({ onSchedule }: ComposerProps) {
  const params = useParams();
  const workspaceId = params.id as Id<"workspaces">;

  // 1. Fetch Real Accounts for the header
  const accounts = useQuery(api.accounts.getByWorkspace, { workspaceId });

  // 2. Local State
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date>();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real Convex app, you would upload to `generateUploadUrl` here
      // For now, we just show a preview
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAiAssist = () => {
    // Mock AI insertion
    setText(prev => prev + "\n\n🚀 #Growth #SaaS #BuildingInPublic");
    toast.success("AI Hashtags generated!");
  };

  const handleSubmit = async (type: 'queue' | 'draft') => {
    if (!text) return toast.error("Post cannot be empty");
    
    setIsSubmitting(true);
    try {
      // If type is 'queue', we use the selected date or default to now
      // If type is 'draft', we might pass null date (handled in parent)
      await onSchedule(text, type === 'queue' ? (date || new Date()) : undefined);
      
      // Reset Form
      setText('');
      setDate(undefined);
      removeMedia();
    } catch (error) {
      console.error(error);
      // Toast handled in parent
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
        
        {accounts === undefined ? (
           <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-full" />
        ) : accounts.length === 0 ? (
           <span className="text-xs text-red-400">No accounts connected</span>
        ) : (
          accounts.map(acc => (
            <div 
              key={acc._id}
              className="relative w-9 h-9 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-sm cursor-pointer"
              title={acc.platformUsername}
            >
              {/* Account Avatar Mock - In real app use acc.avatarUrl */}
              <span className="text-xs font-bold text-gray-700">{acc.platformUsername.charAt(0).toUpperCase()}</span>
              
              {/* Platform Badge */}
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-[2px] shadow-sm border border-gray-100">
                <PlatformIcon platform={acc.platform} />
              </div>
            </div>
          ))
        )}
        
        <button className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors">
            <span className="text-lg leading-none">+</span>
        </button>
      </div>

      {/* 2. Composer Body */}
      <div className="p-4">
        <Textarea 
          value={text} 
          onChange={e => setText(e.target.value)}
          placeholder="What's new with your project?" 
          className="min-h-[100px] border-none shadow-none resize-none focus-visible:ring-0 text-base p-0 placeholder:text-muted-foreground"
        />
        
        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative w-full h-64 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden mt-4 group border border-border">
             <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
             <button 
               onClick={removeMedia} 
               className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
             >
               <X size={16} />
             </button>
          </div>
        )}

        {/* 3. Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-border gap-4">
          
          {/* Left Tools */}
          <div className="flex gap-1">
            <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="Add Media" />
            <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip="Add Video" />
            <ToolButton icon={Smile} tooltip="Emoji" />
            
            <button 
              onClick={handleAiAssist} 
              className="ml-2 flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-md hover:bg-purple-100 transition-colors"
            >
              <Zap size={14} /> AI Assist
            </button>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
             {/* Date Picker Popover */}
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant={"outline"}
                   size="sm"
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

             {/* Submit Buttons */}
             {date ? (
               <Button 
                disabled={isSubmitting}
                onClick={() => handleSubmit('queue')}
                className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
               >
                 <Clock className="w-4 h-4 mr-2" />
                 {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
               </Button>
             ) : (
               <>
                 <Button variant="ghost" size="sm" onClick={() => handleSubmit('draft')} className="text-muted-foreground">
                   Save Draft
                 </Button>
                 <Button disabled={isSubmitting} onClick={() => handleSubmit('queue')}>
                   <Send className="w-4 h-4 mr-2" /> Post Now
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

const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
  <Button 
    variant="ghost" 
    size="icon" 
    onClick={onClick} 
    title={tooltip} 
    className="text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800"
  >
    <Icon size={18}/>
  </Button>
);

const PlatformIcon = ({ platform }: { platform?: string }) => {
  switch (platform) {
    case 'twitter': return <span className="text-[10px] text-blue-400">𝕏</span>;
    case 'linkedin': return <span className="text-[10px] text-blue-700">in</span>;
    default: return <span className="text-[10px] text-gray-400">#</span>;
  }
};