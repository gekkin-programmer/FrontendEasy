'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

// Icons
import { 
  FiMessageCircle, FiFilter, FiCheck, FiCheckCircle, FiSearch, FiMoreHorizontal,
  FiSend, FiSmile, FiArchive, FiTrash2, FiUser,
  FiExternalLink, FiRefreshCw, FiZap
} from 'react-icons/fi';
import { 
  FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// --- CONFIGS ---
const PLATFORM_ICONS: any = {
  twitter: <FaTwitter className="text-black" />,
  instagram: <FaInstagram className="text-black" />,
  facebook: <FaFacebook className="text-black" />,
  linkedin: <FaLinkedin className="text-black" />,
  tiktok: <FaTiktok className="text-black" />,
};

const SENTIMENT_STYLES: any = {
  positive: 'bg-green-100 text-black border-2 border-black',
  negative: 'bg-red-100 text-black border-2 border-black',
  neutral: 'bg-gray-100 text-black border-2 border-black',
  question: 'bg-blue-100 text-black border-2 border-black',
};

// --- MOCK DATA ---
const MOCK_ENGAGEMENTS = [
  {
    _id: '1',
    authorName: 'Sarah Jenkins',
    authorHandle: '@sarahj',
    authorAvatar: '',
    platform: 'twitter',
    content: 'Love this new feature! Does it support video uploads?',
    receivedAt: Date.now() - 3600000, 
    status: 'unread',
    sentiment: 'question',
    aiSuggestions: ['Yes, we support MP4 and MOV formats up to 100MB.', 'Glad you like it! Video support is fully integrated.']
  },
  {
    _id: '2',
    authorName: 'TechDaily',
    authorHandle: '@techdaily',
    authorAvatar: '',
    platform: 'linkedin',
    content: 'Great insights on the latest post.',
    receivedAt: Date.now() - 7200000,
    status: 'read',
    sentiment: 'positive',
    aiSuggestions: ['Thanks for the support!', 'We appreciate the feedback.']
  }
];

export default function Engagement() {
  const params = useParams();
  const workspaceId = params.id as string;

  // 1. STATE
  const [engagements, setEngagements] = useState(MOCK_ENGAGEMENTS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  
  // 2. DERIVED STATE
  const activeEngagement = engagements.find(e => e._id === activeId);
  const filteredEngagements = engagements.filter(e => {
      if (filter === 'unread') return e.status === 'unread';
      return true;
  });

  // 3. ACTIONS
  const handleReply = async () => {
    if (!activeId || !replyText) return;
    try {
        toast.success("REPLY_SENT");
        setEngagements(prev => prev.map(e => 
            e._id === activeId ? { ...e, status: 'replied' } : e
        ));
        setReplyText('');
    } catch (e) {
        toast.error("ERROR_SENDING");
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    setEngagements(prev => prev.map(e => 
        e._id === id ? { ...e, status } : e
    ));
    if (status === 'archived' && activeId === id) setActiveId(null);
    toast.success(`MARKED_AS_${status.toUpperCase()}`);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden animate-in fade-in font-sans text-black">
      
      {/* LEFT PANEL: INBOX LIST */}
      <div className="w-[380px] flex flex-col border-r-2 border-black bg-white">
        
        {/* Header & Filters */}
        <div className="p-4 border-b-2 border-black flex flex-col gap-4 bg-yellow-400">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tight">Inbox</h2>
            <div className="flex gap-2">
                <button className="p-2 border-2 border-black bg-white hover:shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"><FiFilter size={16} /></button>
                <button className="p-2 border-2 border-black bg-white hover:shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all" title="Refresh"><FiRefreshCw size={16} /></button>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH_MESSAGES..." 
              className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <FilterBadge label="ALL" active={filter === 'all'} onClick={() => setFilter('all')} />
             <FilterBadge label="UNREAD" active={filter === 'unread'} count={engagements.filter(e => e.status === 'unread').length} onClick={() => setFilter('unread')} />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filteredEngagements.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-sm font-mono border-b-2 border-dashed border-gray-300">NO_MESSAGES_FOUND</div>
          )}
          {filteredEngagements.map((e) => (
            <div 
              key={e._id}
              onClick={() => setActiveId(e._id)}
              className={`p-4 cursor-pointer border-b-2 border-black transition-all group relative hover:bg-yellow-50 
                ${activeId === e._id ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              {activeId === e._id && <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400 border-r-2 border-black" />}
              <div className={`flex gap-3 ${activeId === e._id ? 'pl-2' : ''}`}>
                 <div className="flex-shrink-0 relative">
                    <div className={`w-10 h-10 border-2 border-black flex items-center justify-center text-xs font-black 
                        ${activeId === e._id ? 'bg-white text-black' : 'bg-gray-100 text-black'}`}>
                        {e.authorAvatar || e.authorName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 border-2 border-black z-10">
                        <span className="text-xs">{PLATFORM_ICONS[e.platform]}</span>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm font-black truncate uppercase ${e.status === 'unread' ? '' : 'opacity-80'}`}>
                            {e.authorName}
                        </span>
                        <span className={`text-[10px] font-mono ${activeId === e._id ? 'text-gray-300' : 'text-gray-500'}`}>
                            {formatDistanceToNow(e.receivedAt, { addSuffix: true })}
                        </span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${activeId === e._id ? 'text-gray-200' : 'text-gray-800'}`}>
                        {e.content}
                    </p>
                    <div className="flex gap-2 mt-2">
                         {e.status === 'replied' && (
                             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-green-400 text-black border-2 border-black">
                                 <FiCheck size={10} strokeWidth={4} /> REPLIED
                             </span>
                         )}
                         {e.sentiment && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${activeId === e._id ? 'bg-white text-black border-2 border-black' : SENTIMENT_STYLES[e.sentiment]}`}>
                                {e.sentiment}
                            </span>
                         )}
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: DETAIL VIEW */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {activeEngagement ? (
           <>
             {/* Toolbar */}
             <div className="h-16 border-b-2 border-black flex items-center justify-between px-6 bg-white z-10">
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-1">
                      <div className="w-8 h-8 border-2 border-black bg-yellow-300 flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                         {activeEngagement.authorAvatar || activeEngagement.authorName.charAt(0)}
                      </div>
                   </div>
                   <div>
                       <div className="text-sm font-black uppercase leading-none">{activeEngagement.authorName}</div>
                       <div className="text-xs font-mono text-gray-500">{activeEngagement.authorHandle}</div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                    <ActionButton icon={<FiCheckCircle />} tooltip="Mark Read" onClick={() => handleStatusChange(activeEngagement._id, 'read')} />
                    <ActionButton icon={<FiArchive />} tooltip="Archive" onClick={() => handleStatusChange(activeEngagement._id, 'archived')} />
                    <ActionButton icon={<FiTrash2 />} tooltip="Delete" variant="danger" />
                    <div className="w-0.5 h-6 bg-black mx-2" />
                    <ActionButton icon={<FiMoreHorizontal />} />
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-8 relative z-0">
                 <div className="max-w-3xl mx-auto space-y-8">
                     
                     {/* The Message Bubble */}
                     <div className="flex gap-4">
                         <div className="w-12 h-12 border-2 border-black bg-white flex-shrink-0 flex items-center justify-center text-lg font-black shadow-[4px_4px_0px_0px_#000]">
                            {activeEngagement.authorAvatar || activeEngagement.authorName.charAt(0)}
                         </div>
                         <div className="flex-1">
                             <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
                                <div className="flex justify-between mb-4 border-b-2 border-black pb-2 border-dashed">
                                     <div className="flex items-center gap-2">
                                        <span className="font-black uppercase text-sm">{activeEngagement.authorName}</span>
                                        <span className="text-xs font-mono text-gray-500">{new Date(activeEngagement.receivedAt).toLocaleTimeString()}</span>
                                     </div>
                                     <span className="text-black cursor-pointer hover:bg-yellow-200 px-1 border border-transparent hover:border-black transition-all"><FiExternalLink size={14} /></span>
                                </div>
                                <p className="text-black text-base font-medium leading-relaxed">{activeEngagement.content}</p>
                             </div>
                             
                             {/* AI Suggestions */}
                             {activeEngagement.aiSuggestions && (
                                <div className="mt-6 space-y-3">
                                   <div className="flex items-center gap-2 text-xs font-black uppercase bg-black text-white inline-block px-2 py-1">
                                      <FiZap size={12} fill="white" />
                                      <span>AI_SUGGESTIONS</span>
                                   </div>
                                   <div className="flex flex-wrap gap-3">
                                      {activeEngagement.aiSuggestions.map((s, i) => (
                                          <button 
                                            key={i}
                                            onClick={() => setReplyText(s)}
                                            className="text-left text-xs bg-white hover:bg-blue-50 text-black border-2 border-black px-4 py-3 shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all max-w-xl font-medium"
                                          >
                                            {s}
                                          </button>
                                      ))}
                                   </div>
                                </div>
                             )}
                         </div>
                     </div>
                 </div>
             </div>

             {/* Composer */}
             <div className="p-6 bg-white border-t-2 border-black z-20 shadow-[0px_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_#000] transition-all">
                        <textarea 
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           className="w-full p-4 text-sm font-medium focus:outline-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase"
                           placeholder={`REPLY TO ${activeEngagement.authorHandle}...`}
                        />
                        <div className="flex items-center justify-between p-2 bg-gray-50 border-t-2 border-black">
                            <div className="flex gap-2">
                                <IconButton icon={<FiSmile />} />
                                <IconButton icon={<FiUser />} />
                            </div>
                            <button 
                                onClick={handleReply}
                                disabled={!replyText}
                                className="bg-black text-white text-xs font-black uppercase px-6 py-2 border-2 border-transparent hover:bg-yellow-400 hover:text-black hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] hover:shadow-[2px_2px_0px_0px_#000]"
                            >
                                <FiSend size={14} strokeWidth={3} /> REPLY
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        <p className="text-[10px] font-mono text-gray-400">CMD+ENTER_TO_SEND</p>
                    </div>
                </div>
             </div>
           </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-black">
                <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                    <FiMessageCircle size={32} strokeWidth={1.5} />
                </div>
                <p className="text-lg font-black uppercase tracking-tight">Select_Message</p>
                <p className="text-xs font-mono text-gray-500 mt-2">CLICK_ITEM_FROM_INBOX</p>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const FilterBadge = ({ label, active, count, onClick }: any) => (
    <button onClick={onClick} className={`
        whitespace-nowrap px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all flex items-center gap-2
        ${active 
            ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]' 
            : 'bg-white text-black hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
        }
    `}>
        {label}
        {count !== undefined && <span className={`px-1.5 py-0.5 text-[10px] border border-current ${active ? 'bg-white text-black' : 'bg-black text-white'}`}>{count}</span>}
    </button>
);

const ActionButton = ({ icon, tooltip, onClick, variant = 'default' }: any) => (
    <button 
        onClick={onClick} 
        className={`p-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none
            ${variant === 'danger' 
                ? 'bg-white hover:bg-red-500 hover:text-white' 
                : 'bg-white hover:bg-yellow-200 text-black'
            }`} 
        title={tooltip}
    >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
    </button>
);

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-2 text-black hover:bg-white border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_#000] transition-all">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
    </button>
);