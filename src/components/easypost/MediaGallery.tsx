'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiMoreHorizontal, FiUploadCloud, FiZap, FiDownload, FiTrash2, FiLoader, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';

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
    toast.info("Sending to AI Upscaler...");
    
    setTimeout(() => {
      setProcessingId(null);
      toast.success("Image Enhanced & Optimized! ✨");
      // In a real app, this would replace the URL with the new one
    }, 2500);
  };

  const handleDelete = (id: number) => {
    setAssets(assets.filter(a => a.id !== id));
    toast.success("Asset deleted");
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
         <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-white transition-colors">
            <FiUploadCloud size={24} className="text-gray-500 group-hover:text-blue-600" />
         </div>
         <p className="text-sm font-bold text-gray-600">Drop files here or click to upload</p>
         <p className="text-xs">Supports JPG, PNG, MP4 (Max 50MB)</p>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         {['All Media', 'Favorites', 'AI Generated', 'Campaign Assets'].map((tag, i) => (
            <button key={tag} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${i === 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                {tag}
            </button>
         ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         <AnimatePresence>
            {assets.map((asset) => (
               <motion.div 
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 key={asset.id} 
                 className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all"
               >
                  <img src={asset.url} className={`w-full h-full object-cover transition-all duration-700 ${processingId === asset.id ? 'scale-110 blur-sm grayscale' : 'group-hover:scale-105'}`} />
                  
                  {/* Processing Overlay */}
                  {processingId === asset.id && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white z-20">
                        <FiLoader className="animate-spin mb-2" size={24} />
                        <span className="text-xs font-bold tracking-wider animate-pulse">AI ENHANCING...</span>
                     </div>
                  )}

                  {/* Actions Overlay (Hover) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                     <div className="flex justify-end">
                        <button className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-gray-900 transition-colors"><FiMoreHorizontal /></button>
                     </div>
                     
                     <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => handleEnhance(asset.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-md py-2 rounded-lg text-xs font-bold text-purple-700 hover:bg-white hover:scale-105 transition-all"
                        >
                            <FiZap size={12} /> Enhance
                        </button>
                        <button onClick={() => handleDelete(asset.id)} className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-colors">
                            <FiTrash2 size={14} />
                        </button>
                     </div>
                  </div>

                  {/* Tag Badge */}
                  <div className="absolute top-2 left-2">
                     <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-medium">
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