'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, Star, Zap, Trash2, ArrowRight, Clock, 
  Sparkles, ShieldCheck, History, Info, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import SpinningLoader from '@/components/common/SpinningLoader';
import { NeuButton, NeuCard, NeuModal } from './DashboardUI';
import { format } from 'date-fns';

export default function ContentRecycling({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isRecycleModalOpen, setIsRecycleModalOpen] = useState(false);
  const [scheduledFor, setScheduledFor] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['recycling-candidates', workspaceId],
    queryFn: () => api.get<any[]>(`/recycling/candidates?workspaceId=${workspaceId}`),
  });

  const toggleEvergreenMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: boolean }) => 
      api.patch(`/recycling/posts/${id}/evergreen`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycling-candidates'] });
      toast.success('EVERGREEN_STATUS_UPDATED');
    }
  });

  const recycleMutation = useMutation({
    mutationFn: (data: { id: string, scheduledFor: string }) => 
      api.post(`/recycling/posts/${data.id}/recycle`, { scheduledFor: data.scheduledFor }),
    onSuccess: () => {
      setIsRecycleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['recycling-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('POST_RECYCLED_WITH_AI_VARIATION');
    },
    onError: () => toast.error('RECYCLING_FAILED')
  });

  if (isLoading) return <SpinningLoader />;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Content_Recycler</h2>
          <p className="text-xs font-bold text-gray-500 uppercase italic">Extract 2x more value from your top performers</p>
        </div>
        <div className="bg-yellow-400 border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2">
           <Zap size={16} />
           <span className="text-xs font-black uppercase tracking-tighter">AI_VARIATIONS_ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black text-white p-3 border-2 border-black uppercase text-[10px] font-black tracking-widest flex justify-between items-center">
             <span>Eligible_For_Recycling ({candidates.length})</span>
             <span>Min_Score: 50%</span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-20 text-center border-4 border-dashed border-gray-200">
               <History size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="font-black text-gray-400 uppercase">No content eligible for recycling yet.</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">Publish more content and wait 30 days for analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((post) => (
                <NeuCard key={post.id} className="bg-white dark:bg-zinc-900 border-2 border-black relative group">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 border-2 border-black bg-gray-50 shrink-0 overflow-hidden relative">
                       {post.mediaUrls?.[0] ? (
                         <img src={post.mediaUrls[0]} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-zinc-100 font-black text-[10px] uppercase text-gray-400">Text_Only</div>
                       )}
                       <div className="absolute top-0 right-0 bg-yellow-400 border-l-2 border-b-2 border-black px-1 font-black text-[10px]">
                          {Math.round(post.performanceScore)}%
                       </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black uppercase text-[#3C48F5]">Published {format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                             {post.recycleCount > 0 && (
                               <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 border border-green-600 uppercase">Recycled {post.recycleCount}x</span>
                             )}
                          </div>
                          <p className="text-sm font-bold line-clamp-2 uppercase leading-tight">{post.content}</p>
                       </div>
                       
                       <div className="flex items-center gap-4 mt-2">
                          <button 
                            onClick={() => toggleEvergreenMutation.mutate({ id: post.id, status: !post.isEvergreen })}
                            className={cn(
                              "flex items-center gap-1.5 text-[10px] font-black uppercase transition-colors",
                              post.isEvergreen ? "text-green-600" : "text-gray-400 hover:text-black"
                            )}
                          >
                            <ShieldCheck size={14} /> {post.isEvergreen ? 'Evergreen_ON' : 'Mark_Evergreen'}
                          </button>
                          
                          <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 hover:text-[#3C48F5]">
                             <ExternalLink size={14} /> View_Insights
                          </button>
                       </div>
                    </div>

                    <div className="flex flex-col justify-center">
                       <NeuButton 
                         onClick={() => { setSelectedPostId(post.id); setIsRecycleModalOpen(true); }}
                         className="bg-[#3C48F5] text-white h-12 w-12"
                       >
                          <RefreshCw size={24} />
                       </NeuButton>
                    </div>
                  </div>
                </NeuCard>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Logic Explainer */}
        <div className="space-y-6">
           <NeuCard title="Recycling_Rules" icon={ShieldCheck} className="bg-green-50 dark:bg-zinc-900 border-2 border-black">
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <Star className="text-yellow-500 mt-1 shrink-0" size={16} />
                    <p className="text-xs font-bold uppercase leading-tight">Only posts with 75%+ performance score are auto-suggested.</p>
                 </div>
                 <div className="flex items-start gap-3">
                    <Sparkles className="text-[#3C48F5] mt-1 shrink-0" size={16} />
                    <p className="text-xs font-bold uppercase leading-tight">AI will rewrite your content to avoid audience fatigue while keeping the core message.</p>
                 </div>
                 <div className="flex items-start gap-3">
                    <Clock className="text-purple-500 mt-1 shrink-0" size={16} />
                    <p className="text-xs font-bold uppercase leading-tight">Min. 60 days interval between recycles to maintain fresh feed.</p>
                 </div>
              </div>
           </NeuCard>

           <div className="p-6 bg-blue-50 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <h4 className="font-black uppercase text-sm mb-2 flex items-center gap-2"><Info size={16} /> Why recycle?</h4>
              <p className="text-xs font-medium leading-relaxed uppercase">
                 &ldquo;Social media algorithms show your content to only 5-10% of your audience. Recycling ensures your best ideas reach the other 90%.&rdquo;
              </p>
           </div>
        </div>

      </div>

      {/* Recycle Modal */}
      <NeuModal
        isOpen={isRecycleModalOpen}
        onClose={() => setIsRecycleModalOpen(false)}
        title="EXECUTE_RECYCLING"
      >
        <div className="space-y-6">
           <div className="p-4 bg-yellow-50 border-2 border-dashed border-yellow-600 flex gap-3 items-center">
              <Sparkles className="text-yellow-600" />
              <p className="text-[10px] font-black uppercase text-yellow-800">AI will generate a fresh variation of this post now.</p>
           </div>

           <div>
              <label className="text-xs font-black uppercase mb-1 block">Scheduled For</label>
              <input 
                type="datetime-local" 
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold focus:shadow-[4px_4px_0px_0px_#000] outline-none transition-all"
              />
           </div>

           <div className="flex justify-end gap-3">
              <NeuButton onClick={() => setIsRecycleModalOpen(false)} className="bg-white">CANCEL</NeuButton>
              <NeuButton 
                onClick={() => recycleMutation.mutate({ id: selectedPostId!, scheduledFor })}
                className="bg-[#3C48F5] text-white px-6"
                disabled={recycleMutation.isPending}
              >
                {recycleMutation.isPending ? 'GENERATING...' : 'CONFIRM_RECYCLE'}
              </NeuButton>
           </div>
        </div>
      </NeuModal>
    </div>
  );
}
