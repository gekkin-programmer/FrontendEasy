'use client';
import React, { useState, useRef } from 'react';
import { FiImage, FiVideo, FiSmile, FiZap, FiCalendar, FiX, FiCheck, FiMaximize2 } from 'react-icons/fi';
import { CHANNELS, getChannelIcon, Post } from './types'; // Ensure types are imported
import { toast } from 'sonner';

interface ComposerProps {
  // We change the signature to accept a File object if one exists
  onAdd: (postData: any, file?: File | null) => void;
}

export default function Composer({ onAdd }: ComposerProps) {
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['c1']);
  
  // SEPARATE PREVIEW FROM ACTUAL FILE
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  
  const [schedule, setSchedule] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference to hidden input

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // 1. TRIGGER FILE SELECTOR
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 2. HANDLE REAL FILE SELECTION
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for preview
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
      setMediaFile(file);
      toast.success("Image selected");
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdd = (status: 'queued' | 'draft' | 'published') => {
    if (!text && !mediaFile) return toast.error("Post is empty");
    if (selectedChannels.length === 0) return toast.error("Select a channel");

    // 3. PREPARE DATA FOR PARENT (Which will handle FormData/API)
    const postPayload = {
      content: text,
      channels: selectedChannels,
      status: status === 'published' ? 'queued' : status, // 'published' usually means 'queue now' in buffer logic
      scheduledTime: schedule ? new Date(schedule).toISOString() : null, // Convert to UTC
      mediaType: mediaFile ? 'image' : undefined,
    };

    onAdd(postPayload, mediaFile);
    
    // Reset Form
    setText('');
    removeMedia();
    setSchedule('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
      
      {/* Hidden Input for Real File Uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        className="hidden" 
      />

      {/* Channel Selector (Unchanged) */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3 overflow-x-auto scrollbar-hide">
        <span className="text-xs font-bold text-gray-400 uppercase mr-2 whitespace-nowrap">Post to:</span>
        {CHANNELS.map(c => {
          const Icon = getChannelIcon(c.type);
          const isSel = selectedChannels.includes(c.id);
          return (
            <button 
              key={c.id} 
              onClick={() => toggleChannel(c.id)}
              title={c.name}
              className={`flex-shrink-0 relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isSel ? 'border-blue-600 bg-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
              <img src={c.avatar} alt={c.name} className="w-full h-full rounded-full object-cover" />
              {isSel && <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5"><FiCheck size={8}/></div>}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow"><Icon size={10} className="text-gray-600"/></div>
            </button>
          )
        })}
      </div>

      <div className="p-4">
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)}
          placeholder="What's happening?" 
          className="w-full min-h-[120px] resize-none outline-none text-gray-700 text-base bg-transparent"
        />
        
        {/* Preview Area */}
        {mediaPreview && (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mt-2 group">
             <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
             <button onClick={removeMedia} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"><FiX /></button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-1">
            {/* Buttons now trigger the Hidden Input */}
            <ToolButton icon={FiImage} onClick={handleUploadClick} tooltip="Upload Image" />
            <ToolButton icon={FiVideo} onClick={handleUploadClick} tooltip="Upload Video" />
            <ToolButton icon={FiSmile} />
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button onClick={() => setText("Just generated this with AI! 🚀 #Growth")} className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100"><FiZap /> AI Assist</button>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="relative group">
                <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                <input 
                    type="datetime-local" 
                    value={schedule}
                    className="w-8 text-transparent focus:w-auto focus:text-gray-600 h-8 bg-gray-100 rounded cursor-pointer transition-all" 
                    onChange={(e) => setSchedule(e.target.value)} 
                />
             </div>

             <div className="flex rounded-md shadow-sm">
               <button onClick={() => handleAdd('queued')} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-l-md hover:bg-blue-700 transition-colors">
                 {schedule ? 'Schedule' : 'Add to Queue'}
               </button>
               <button onClick={() => handleAdd('published')} className="bg-blue-600 text-white px-2 py-2 rounded-r-md border-l border-blue-500 hover:bg-blue-700"><FiMaximize2 size={14}/></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (
  <button onClick={onClick} title={tooltip} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"><Icon size={18}/></button>
);