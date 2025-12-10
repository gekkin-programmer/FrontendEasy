'use client';
import React, { useState, useRef } from 'react';
import { FiImage, FiVideo, FiSmile, FiZap, FiCalendar, FiX, FiClock, FiFileText } from 'react-icons/fi';
import { CHANNELS, getChannelIcon } from './types';
import { toast } from 'sonner';

interface ComposerProps {
  onAdd: (postData: any, file?: File | null) => void;
}

export default function Composer({ onAdd }: ComposerProps) {
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['c1']);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [schedule, setSchedule] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
      setMediaFile(file);
      // SILENT: No toast here anymore as requested
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (status: 'queued' | 'draft') => {
    if (!text && !mediaFile) return toast.error("Post cannot be empty");
    if (selectedChannels.length === 0) return toast.error("Select at least one channel");

    const postPayload = {
      content: text,
      channels: selectedChannels,
      status: status, // Pass the specific status
      scheduledTime: schedule ? new Date(schedule).toISOString() : null,
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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

      {/* Channel Selector */}
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
              {isSel && <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5"><FiImage size={8}/></div>}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow"><Icon size={10} className="text-gray-600"/></div>
            </button>
          )
        })}
      </div>

      <div className="p-4">
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)}
          placeholder="What would you like to share?" 
          className="w-full min-h-[100px] resize-none outline-none text-gray-700 text-base bg-transparent placeholder:text-gray-400"
        />
        
        {mediaPreview && (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mt-2 group">
             <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
             <button onClick={removeMedia} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"><FiX /></button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-1">
            <ToolButton icon={FiImage} onClick={handleUploadClick} tooltip="Add Image" />
            <ToolButton icon={FiVideo} onClick={handleUploadClick} tooltip="Add Video" />
            <ToolButton icon={FiSmile} />
            <button onClick={() => setText(text + "  #Growth")} className="ml-2 flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100"><FiZap /> AI Assist</button>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Date Picker */}
             <div className="relative group">
                <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                <input 
                    type="datetime-local" 
                    value={schedule}
                    className="pl-7 pr-2 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500 outline-none" 
                    onChange={(e) => setSchedule(e.target.value)} 
                />
             </div>

             {/* Action Buttons */}
             <div className="flex gap-2">
                 <button 
                   onClick={() => handleSubmit('draft')} 
                   className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
                 >
                    <FiFileText /> Save Draft
                 </button>
                 <button 
                   onClick={() => handleSubmit('queued')} 
                   className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#3C48F6] hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                 >
                    <FiClock /> {schedule ? 'Schedule' : 'Add to Queue'}
                 </button>
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