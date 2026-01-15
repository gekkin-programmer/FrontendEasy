'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiMoreHorizontal, FiUploadCloud, FiZap, FiDownload, FiTrash2, FiLoader, FiCheck, FiFilter } from 'react-icons/fi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock Assets
const INITIAL_ASSETS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80', type: 'image', tags: ['Abstract', 'Background'] },
  { id: 2, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80', type: 'image', tags: ['Tech', 'Setup'] },
  { id: 3, url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80', type: 'image', tags: ['Team', 'Office'] },
  { id: 4, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80', type: 'image', tags: ['Data', 'Analytics'] },
  { id: 5, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80', type: 'image', tags: ['Code', 'Laptop'] },
];

export default function MediaGallery() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Simulate AI Enhancement
  const handleEnhance = (id: number) => {
    setProcessingId(id);
    toast.info("ENHANCING_MEDIA...");
    
    setTimeout(() => {
      setProcessingId(null);
      toast.success("OPTIMIZATION_COMPLETE");
    }, 2500);
  };

  const handleDelete = (id: number) => {
    setAssets(assets.filter(a => a.id !== id));
    toast.success("ASSET_DELETED");
  };

  return (
    <div className="space-y-8 font-sans text-black">
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-black bg-white p-8 flex flex-col items-center justify-center text-black hover:bg-yellow-50 transition-all cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_0px_#000]">
         <div className="bg-black text-white p-4 mb-4 border-2 border-black group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_#000]">
            <FiUploadCloud size={32} strokeWidth={2} />
         </div>
         <p className="text-lg font-black uppercase tracking-tight group-hover:underline decoration-2 underline-offset-4">Click_to_Upload</p>
         <p className="text-xs font-mono font-bold text-gray-500 mt-2 bg-white px-2 py-1 border border-black">JPG, PNG, MP4 (MAX 50MB)</p>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
         {['All_Media', 'Favorites', 'AI_Generated', 'Campaigns'].map((tag, i) => (
            <button 
                key={tag} 
                className={cn(
                    "px-4 py-2 text-xs font-black uppercase border-2 border-black transition-all whitespace-nowrap",
                    i === 0 
                        ? "bg-[#3C48F6] text-white shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]" 
                        : "bg-white text-black hover:bg-yellow-100 hover:shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
                )}
            >
                {tag}
            </button>
         ))}
         <button className="px-3 py-2 border-2 border-black bg-white hover:bg-gray-100"><FiFilter /></button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         <AnimatePresence>
            {assets.map((asset) => (
               <motion.div 
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 key={asset.id} 
                 className="group relative aspect-square bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all overflow-hidden"
               >
                  <img src={asset.url} className={cn(
                      "w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0",
                      processingId === asset.id && "scale-110 blur-sm grayscale"
                  )} />
                  
                  {/* Processing Overlay */}
                  {processingId === asset.id && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-yellow-400 z-20">
                        <FiLoader className="animate-spin mb-2" size={32} />
                        <span className="text-xs font-black uppercase tracking-widest animate-pulse border-2 border-yellow-400 px-2 py-1">Enhancing...</span>
                     </div>
                  )}

                  {/* Actions Overlay (Hover) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                     <div className="flex justify-end">
                        <button className="p-2 bg-white border-2 border-black text-black hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none">
                            <FiMoreHorizontal size={16} />
                        </button>
                     </div>
                     
                     <div className="flex gap-3 items-center">
                        <button 
                            onClick={() => handleEnhance(asset.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#3C48F6] border-2 border-black py-2 text-xs font-black uppercase text-white hover:bg-blue-600 transition-all shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
                        >
                            <FiZap size={14} fill="currentColor" /> AI_Upscale
                        </button>
                        <button 
                            onClick={() => handleDelete(asset.id)} 
                            className="p-2 bg-red-500 border-2 border-black text-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
                        >
                            <FiTrash2 size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Tag Badge */}
                  <div className="absolute top-0 left-0">
                     <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-1 border-r-2 border-b-2 border-black">
                        {asset.tags[0]}
                     </span>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </div>
  )
}