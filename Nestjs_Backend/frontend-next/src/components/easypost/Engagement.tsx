'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from 'next/navigation';
import { Id } from "@/convex/_generated/dataModel";
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

// --- CONFIGS ---
const PLATFORM_ICONS: any = {
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  facebook: <FaFacebook />,
  linkedin: <FaLinkedin />,
  tiktok: <FaTiktok />,
};

const SENTIMENT_STYLES: any = {
  positive: 'text-green-600 bg-green-50 border-green-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200',
  question: 'text-blue-600 bg-blue-50 border-blue-200',
};

export default function Engagement() {
  const params = useParams();
  const workspaceId = params.id as Id<"workspaces">;

  // 1. CONVEX HOOKS
  const engagements = useQuery(api.engagement.getEngagements, { workspaceId });
  const accounts = useQuery(api.accounts.getByWorkspace, { workspaceId });
  
  const replyMutation = useMutation(api.engagement.reply);
  const statusMutation = useMutation(api.engagement.updateStatus);
  const seedMutation = useMutation(api.engagement.seedMockData);

  // 2. STATE
  const [activeId, setActiveId] = useState<Id<"engagements"> | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  
  // 3. DERIVED STATE
  const activeEngagement = engagements?.find(e => e._id === activeId);
  const filteredEngagements = engagements?.filter(e => {
      if (filter === 'unread') return e.status === 'unread';
      return true;
  });

  // 4. ACTIONS
  const handleReply = async () => {
    if (!activeId || !replyText) return;
    try {
        await replyMutation({ engagementId: activeId, text: replyText });
        setReplyText('');
        toast.success("Reply sent!");
    } catch (e) {
        toast.error("Failed to send reply");
    }
  };

  const handleStatusChange = async (id: Id<"engagements">, status: string) => {
    await statusMutation({ id, status });
    if (status === 'archived' && activeId === id) setActiveId(null);
    toast.success(`Marked as ${status}`);
  };

  const handleSeed = async () => {
    if (!accounts || accounts.length === 0) return toast.error("Connect an account first!");
    await seedMutation({ workspaceId, accountId: accounts[0]._id });
    toast.success("Added test messages!");
  };

  if (!engagements) return <div className="p-10 text-center">Loading inbox...</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-in fade-in">
      
      {/* LEFT PANEL: INBOX LIST */}
      <div className="w-[380px] flex flex-col border-r border-gray-200 bg-white">
        
        {/* Header & Filters */}
        <div className="p-3 border-b border-gray-200 flex flex-col gap-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 px-1">Inbox</h2>
            <div className="flex gap-1">
                <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"><FiFilter size={14} /></button>
                <button onClick={handleSeed} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors" title="Generate Test Data"><FiRefreshCw size={14} /></button>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter messages..." 
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <FilterBadge label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
             <FilterBadge label="Unread" active={filter === 'unread'} count={engagements.filter(e => e.status === 'unread').length} onClick={() => setFilter('unread')} />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredEngagements?.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-sm">No messages found.</div>
          )}
          {filteredEngagements?.map((e) => (
            <div 
              key={e._id}
              onClick={() => setActiveId(e._id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors group relative ${activeId === e._id ? 'bg-blue-50/50' : ''}`}
            >
              {activeId === e._id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600" />}
              <div className="flex gap-3">
                 <div className="flex-shrink-0 relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-100">
                        {e.authorAvatar || e.authorName.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                        <span className={`text-[10px] text-gray-600`}>{PLATFORM_ICONS[e.platform]}</span>
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-sm font-medium truncate ${e.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                            {e.authorName}
                        </span>
                        <span className="text-[10px] text-gray-400 tabular-nums">
                            {formatDistanceToNow(e.receivedAt, { addSuffix: true })}
                        </span>
                    </div>
                    <p className={`text-xs line-clamp-2 ${e.status === 'unread' ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {e.content}
                    </p>
                    <div className="flex gap-2 mt-2">
                         {e.status === 'replied' && (
                             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                                 <FiCheck size={8} /> Replied
                             </span>
                         )}
                         {e.sentiment && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${SENTIMENT_STYLES[e.sentiment]}`}>
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
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeEngagement ? (
           <>
             {/* Toolbar */}
             <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px]">
                         {activeEngagement.authorAvatar || activeEngagement.authorName.charAt(0)}
                      </div>
                   </div>
                   <span className="text-sm font-medium text-gray-900">{activeEngagement.authorName}</span>
                   <span className="text-xs text-gray-400">{activeEngagement.authorHandle}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ActionButton icon={<FiCheckCircle />} tooltip="Mark Read" onClick={() => handleStatusChange(activeEngagement._id, 'read')} />
                    <ActionButton icon={<FiArchive />} tooltip="Archive" onClick={() => handleStatusChange(activeEngagement._id, 'archived')} />
                    <ActionButton icon={<FiTrash2 />} tooltip="Delete" />
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <ActionButton icon={<FiMoreHorizontal />} />
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                 <div className="max-w-3xl mx-auto space-y-6">
                     
                     {/* Context (Original Post) */}
                     {activeEngagement.originalPostContent && (
                         <div className="flex gap-4 opacity-60 hover:opacity-100 transition-opacity">
                             <div className="w-8 flex flex-col items-center pt-2">
                                 <div className="w-0.5 h-full bg-gray-200" />
                             </div>
                             <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1 shadow-sm">
                                 <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Replied to post</p>
                                 <p className="text-sm text-gray-600">{activeEngagement.originalPostContent}</p>
                             </div>
                         </div>
                     )}

                     {/* The Message */}
                     <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-100 shadow-sm z-10">
                            {activeEngagement.authorAvatar || activeEngagement.authorName.charAt(0)}
                         </div>
                         <div className="flex-1">
                             <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="flex justify-between mb-2">
                                     <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-sm">{activeEngagement.authorName}</span>
                                        <span className="text-xs text-gray-400">{new Date(activeEngagement.receivedAt).toLocaleTimeString()}</span>
                                     </div>
                                     <span className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiExternalLink size={12} /></span>
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed">{activeEngagement.content}</p>
                             </div>
                             
                             {/* AI Suggestions (Stored in DB) */}
                             {activeEngagement.aiSuggestions && (
                                <div className="mt-4 space-y-2">
                                   <div className="flex items-center gap-2 text-xs font-medium text-violet-600 mb-2">
                                      <FiZap size={12} />
                                      <span>AI Suggested Replies</span>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                      {activeEngagement.aiSuggestions.map((s, i) => (
                                          <button 
                                            key={i}
                                            onClick={() => setReplyText(s)}
                                            className="text-left text-xs bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-100 px-3 py-2 rounded-lg transition-colors max-w-xl"
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
             <div className="p-4 bg-white border-t border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border border-gray-300 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-gray-900 focus-within:border-gray-900 transition-all bg-white">
                        <textarea 
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           className="w-full p-3 text-sm focus:outline-none bg-transparent resize-none min-h-[80px]"
                           placeholder={`Reply to ${activeEngagement.authorHandle}...`}
                        />
                        <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                            <div className="flex gap-1">
                                <IconButton icon={<FiSmile />} />
                                <IconButton icon={<FiUser />} />
                            </div>
                            <button 
                                onClick={handleReply}
                                disabled={!replyText}
                                className="bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <FiSend size={12} /> Reply
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        <p className="text-[10px] text-gray-400">Press <span className="font-mono bg-gray-100 px-1 rounded">Cmd+Enter</span> to send</p>
                    </div>
                </div>
             </div>
           </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiMessageCircle size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No message selected</p>
                <p className="text-xs text-gray-500 mt-1">Select an item from the inbox to view details.</p>
            </div>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const FilterBadge = ({ label, active, count, onClick }: any) => (
    <button onClick={onClick} className={`
        whitespace-nowrap px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5
        ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
    `}>
        {label}
        {count !== undefined && <span className={`px-1 rounded-full text-[9px] ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>}
    </button>
);

const ActionButton = ({ icon, tooltip, onClick }: any) => (
    <button onClick={onClick} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" title={tooltip}>
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
    </button>
);

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors">
        {React.cloneElement(icon as React.ReactElement, { size: 14 })}
    </button>
);