'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiMoreHorizontal, FiUploadCloud, FiZap, FiDownload, FiTrash2, FiLoader, FiCheck, FiFilter } from 'react-icons/fi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/src/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import SpinningLoader from '../SpinningLoader';

export default function MediaGallery() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Fetch Media
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
        const res = await api.get<any[]>('/media');
        return Array.isArray(res) ? res : (res as any).data || [];
    }
  });

  // 2. Fetch Storage Usage
  const { data: usage = 0 } = useQuery({
    queryKey: ['media-usage'],
    queryFn: async () => {
        const res = await api.get<number>('/media/usage');
        return typeof res === 'number' ? res : (res as any).data || 0;
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
        toast.success("ASSET_DELETED");
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    },
    onError: () => toast.error("DELETE_FAILED")
  });

  // 4. Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/media/upload', formData);
    },
    onSuccess: () => {
        toast.success("UPLOAD_SUCCESSFUL");
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    },
    onError: (err: any) => {
        const msg = err.message || "UPLOAD_FAILED";
        toast.error(msg);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 font-sans text-black">
      
      {/* Storage Indicator */}
      <div className="bg-black text-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase font-mono tracking-widest">STORAGE_USAGE</span>
              <span className="text-[10px] font-black font-mono">{formatSize(usage)} / 100 MB</span>
          </div>
          <div className="w-full h-4 bg-zinc-800 border-2 border-zinc-700 overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((usage / (100 * 1024 * 1024)) * 100, 100)}%` }}
                className={cn(
                    "h-full transition-colors",
                    (usage / (100 * 1024 * 1024)) > 0.9 ? "bg-red-500" : "bg-[#3C48F5]"
                )}
              />
          </div>
      </div>

      {/* Upload Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-black bg-white p-8 flex flex-col items-center justify-center text-black hover:bg-blue-50 transition-all cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_0px_#000]"
      >
         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
         <div className="bg-black text-white p-4 mb-4 border-2 border-black group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_#000]">
            {uploadMutation.isPending ? <FiLoader className="animate-spin" size={32} /> : <FiUploadCloud size={32} strokeWidth={2} />}
         </div>
         <p className="text-lg font-black uppercase tracking-tight group-hover:underline decoration-2 underline-offset-4">
            {uploadMutation.isPending ? "Uploading..." : "Click_to_Upload"}
         </p>
         <p className="text-xs font-mono font-bold text-gray-500 mt-2 bg-white px-2 py-1 border border-black">JPG, PNG, GIF, MP4 (MAX 10MB)</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {isLoading ? (
             <div className="col-span-full py-20 flex flex-col items-center justify-center">
                 <SpinningLoader fullScreen={false} />
                 <span className="font-black uppercase text-xs tracking-widest mt-4">Scanning_Library...</span>
             </div>
         ) : (
            <AnimatePresence>
                {assets.map((asset: any) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={asset.id} 
                    className="group relative aspect-square bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all overflow-hidden"
                >
                    <img src={asset.url} className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0" />
                    
                    {/* Actions Overlay (Hover) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="flex gap-3 items-center">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-black py-2 text-xs font-black uppercase text-black hover:bg-blue-400 transition-all shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none">
                                <FiImage size={14} /> Preview
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm("DELETE_ASSET?")) deleteMutation.mutate(asset.id); }} 
                                className="p-2 bg-red-500 border-2 border-black text-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Metadata Badge */}
                    <div className="absolute top-0 left-0 flex flex-col items-start">
                        <span className="bg-[#3C48F5] text-white text-[10px] font-black uppercase px-2 py-1 border-r-2 border-b-2 border-black">
                            {formatSize(asset.size)}
                        </span>
                        <span className="bg-black text-white text-[8px] font-bold uppercase px-2 py-0.5 border-r-2 border-b-2 border-black">
                            {format(new Date(asset.createdAt), 'MMM d, yyyy')}
                        </span>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
         )}
         {!isLoading && assets.length === 0 && (
             <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-200 text-gray-300 font-black uppercase tracking-tighter text-4xl">
                 Library_Empty
             </div>
         )}
      </div>
    </div>
  )
}