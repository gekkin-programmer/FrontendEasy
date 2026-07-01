'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Sparkles, X, Facebook, Instagram, Twitter, Linkedin, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = [
  { id: 'FACEBOOK', icon: Facebook, color: '#1877F2' },
  { id: 'INSTAGRAM', icon: Instagram, color: '#E4405F' },
  { id: 'TWITTER', icon: Twitter, color: '#1DA1F2' },
  { id: 'LINKEDIN', icon: Linkedin, color: '#0A66C2' },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function CalendarHeatmap({ workspaceId, onClose }: { workspaceId: string, onClose: () => void }) {
  const [platform, setPlatform] = useState('FACEBOOK');

  const { data, isLoading } = useQuery({
    queryKey: ['heatmap', workspaceId, platform],
    queryFn: () => api.get<any>(`/ai/smart-scheduling/heatmap?workspaceId=${workspaceId}&platform=${platform}`),
  });

  const getCellColor = (score: number) => {
    // Score is 0.0 to 1.0
    if (score < 0.2) return 'bg-blue-50 dark:bg-zinc-900';
    if (score < 0.4) return 'bg-blue-200 dark:bg-blue-900/40';
    if (score < 0.6) return 'bg-blue-400 dark:bg-blue-800/60';
    if (score < 0.8) return 'bg-blue-600 dark:bg-blue-700/80';
    return 'bg-[#3C48F5]'; // Hottest
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-white dark:bg-zinc-900 border-b-4 border-black dark:border-white overflow-hidden transition-colors"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Sparkles size={20} className="text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Engagement_Heatmap</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Predicted high-traffic hours for your audience</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 dark:bg-black p-1 border-2 border-black dark:border-white">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={cn(
                  "p-2 transition-all flex items-center gap-2",
                  platform === p.id ? "bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] border-2 border-black dark:border-white translate-x-[-1px] translate-y-[-1px]" : "opacity-50 grayscale hover:opacity-100"
                )}
              >
                <p.icon size={14} style={{ color: platform === p.id ? p.color : '' }} />
                <span className="text-[10px] font-black">{p.id}</span>
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3 border-4 border-dashed border-gray-200 dark:border-zinc-800">
             <div className="w-8 h-8 border-4 border-[#3C48F5] border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase animate-pulse">Running Neural Prediction Engine...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1">
                {/* Header: Hours */}
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="text-[8px] font-black text-center text-gray-400">{h}h</div>
                ))}

                {/* Rows: Days */}
                {DAYS.map((day, dIdx) => (
                  <React.Fragment key={day}>
                    <div className="text-[10px] font-black flex items-center">{day}</div>
                    {Array.from({ length: 24 }).map((_, hIdx) => {
                      const score = data?.heatmap?.find((s: any) => s.day === dIdx && s.hour === hIdx)?.score || 0;
                      return (
                        <div 
                          key={hIdx} 
                          title={`${day} ${hIdx}:00 - Score: ${Math.round(score * 100)}%`}
                          className={cn(
                            "h-8 border border-black/10 dark:border-white/10 transition-transform hover:scale-110 hover:z-10 cursor-help",
                            getCellColor(score)
                          )} 
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[9px] font-bold uppercase text-gray-400">Cold</span>
                       <div className="flex gap-0.5">
                          <div className="w-3 h-3 bg-blue-50 border border-black/10" />
                          <div className="w-3 h-3 bg-blue-200 border border-black/10" />
                          <div className="w-3 h-3 bg-blue-400 border border-black/10" />
                          <div className="w-3 h-3 bg-blue-600 border border-black/10" />
                          <div className="w-3 h-3 bg-[#3C48F5] border border-black/10" />
                       </div>
                       <span className="text-[9px] font-bold uppercase text-gray-400">Hot</span>
                    </div>
                 </div>
                 
                 <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 flex items-center gap-2 border-2 border-dashed border-blue-200 dark:border-blue-800">
                    <Info size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">Pro Tip: Schedule during &ldquo;Hottest&rdquo; slots to increase reach by up to 25%</span>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
