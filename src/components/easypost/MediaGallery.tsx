'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiImage, FiUploadCloud, FiTrash2, FiLoader, FiFolder, FiChevronLeft, FiPlus, 
    FiCornerUpLeft, FiMove, FiMoreVertical, FiShare2, FiExternalLink
} from 'react-icons/fi';
import { SiCanva, SiDropbox } from 'react-icons/si';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/src/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import SpinningLoader from '../SpinningLoader';
import Script from 'next/script';

export default function MediaGallery({ hideUsage = false }: { hideUsage?: boolean }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // 1. Fetch Media & Folders
  const { data, isLoading } = useQuery({
    queryKey: ['media', currentFolderId],
    queryFn: async () => {
        const url = currentFolderId ? `/media?folderId=${currentFolderId}` : '/media';
        return api.get<{ folders: any[], assets: any[] }>(url);
    }
  });

  const assets = data?.assets || [];
  const folders = data?.folders || [];

  // 2. Fetch Storage Usage
  const { data: usage = 0 } = useQuery({
    queryKey: ['media-usage'],
    queryFn: async () => {
        const res = await api.get<number>('/media/usage');
        return typeof res === 'number' ? res : (res as any).data || 0;
    }
  });

  // 3. Mutations
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolderId) formData.append('folderId', currentFolderId);
        return api.post('/media/upload', formData);
    },
    onSuccess: () => {
        toast.success("UPLOAD_SUCCESSFUL");
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    }
  });

  const importMutation = useMutation({
    mutationFn: (url: string) => api.post('/media/import-url', { url, folderId: currentFolderId }),
    onSuccess: () => {
        toast.success("EXTERNAL_ASSET_IMPORTED");
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    }
  });

  const createFolderMutation = useMutation({
      mutationFn: (name: string) => api.post('/media/folders', { name, parentId: currentFolderId }),
      onSuccess: () => {
          toast.success("FOLDER_CREATED");
          setIsCreatingFolder(false);
          setNewFolderName("");
          queryClient.invalidateQueries({ queryKey: ['media'] });
      }
  });

  // --- CANVA INTEGRATION ---
  const handleCanvaDesign = () => {
    if (!(window as any).Canva?.DesignButton) {
        return toast.error("CANVA_SDK_NOT_LOADED");
    }

    (window as any).Canva.DesignButton.initialize({
        apiKey: process.env.NEXT_PUBLIC_CANVA_API_KEY || 'YOUR_CANVA_KEY',
        onDesignPublish: (exportUrl: string) => {
            console.log("Canva Export:", exportUrl);
            importMutation.mutate(exportUrl);
        }
    });
  };

  // --- DROPBOX INTEGRATION ---
  const handleDropboxImport = () => {
    if (!(window as any).Dropbox) {
        return toast.error("DROPBOX_SDK_NOT_LOADED");
    }

    const options = {
        success: (files: any[]) => {
            files.forEach(file => {
                importMutation.mutate(file.link);
            });
        },
        cancel: () => {},
        linkType: "direct",
        multiselect: true,
        extensions: ['.png', '.jpg', '.jpeg', '.mp4', '.gif'],
    };

    (window as any).Dropbox.choose(options);
  };

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
        toast.success("ASSET_DELETED");
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/folders/${id}`),
    onSuccess: () => {
        toast.success("FOLDER_DELETED");
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const enterFolder = (folder: any) => {
      setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
      setCurrentFolderId(folder.id);
  };

  const goBack = () => {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 font-sans text-black dark:text-white transition-colors">
      <Script src="https://sdk.canva.com/designbutton/v2/api.js" strategy="lazyOnload" />
      <Script src="https://www.dropbox.com/static/api/2/dropins.js" id="dropboxjs" data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || 'YOUR_APP_KEY'} strategy="lazyOnload" />

      {/* OS Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#3C48F5] p-3 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-white">
          <div className="flex items-center gap-3">
              {currentFolderId && (
                  <button onClick={goBack} className="p-2 bg-black hover:bg-zinc-800 border-2 border-white transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                      <FiChevronLeft size={18} strokeWidth={3} />
                  </button>
              )}
              <div className="flex items-center gap-2 font-black uppercase text-xs tracking-tighter">
                  <FiFolder />
                  <span>ROOT</span>
                  {folderPath.map(p => (
                      <React.Fragment key={p.id}>
                          <span className="opacity-50">/</span>
                          <span>{p.name}</span>
                      </React.Fragment>
                  ))}
              </div>
          </div>

          <div className="flex gap-2">
              <button 
                onClick={handleCanvaDesign}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#00C4CC] hover:bg-[#00A9AF] text-white border-2 border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all"
              >
                  <SiCanva size={14} /> Canva
              </button>
              <button 
                onClick={handleDropboxImport}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0061FF] hover:bg-[#0051D5] text-white border-2 border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all"
              >
                  <SiDropbox size={14} /> Dropbox
              </button>
              <div className="w-px h-8 bg-white/20 mx-1 self-center" />
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-zinc-800 border-2 border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all"
              >
                  <FiPlus /> New_Folder
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                  <FiUploadCloud /> {uploadMutation.isPending || importMutation.isPending ? "Syncing..." : "Upload_Asset"}
              </button>
          </div>
      </div>

      {/* Storage & Folder Creator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideUsage && (
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                    <span>Usage</span>
                    <span>{formatSize(usage)} / 100MB</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 border border-black dark:border-white overflow-hidden">
                    <div className="h-full bg-[#3C48F5]" style={{ width: `${Math.min((usage / (100 * 1024 * 1024)) * 100, 100)}%` }} />
                </div>
            </div>
          )}

          <AnimatePresence>
              {isCreatingFolder && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-2">
                      <input 
                        autoFocus
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        placeholder="FOLDER_NAME..."
                        className="flex-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white px-3 text-xs font-bold uppercase focus:outline-none"
                      />
                      <button 
                        onClick={() => createFolderMutation.mutate(newFolderName)}
                        className="px-4 bg-green-500 border-2 border-black dark:border-white text-white font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#000]"
                      >
                          OK
                      </button>
                      <button 
                        onClick={() => setIsCreatingFolder(false)}
                        className="px-4 bg-white border-2 border-black dark:border-white text-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#000]"
                      >
                          X
                      </button>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />

      {/* Explorer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
         {isLoading ? (
             <div className="col-span-full py-20 flex flex-col items-center justify-center">
                 <SpinningLoader fullScreen={false} />
                 <span className="font-black uppercase text-[10px] tracking-widest mt-4 animate-pulse">Accessing_Data_Stream...</span>
             </div>
         ) : (
            <AnimatePresence mode="popLayout">
                {/* 1. Folders */}
                {folders.map((folder: any) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={folder.id}
                        onDoubleClick={() => enterFolder(folder)}
                        className="group cursor-pointer flex flex-col items-center gap-2 p-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all relative"
                    >
                        <div className="text-[#3C48F5] dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <FiFolder size={48} fill="currentColor" fillOpacity={0.2} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-center truncate w-full">{folder.name}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); if(confirm("DEL_FOLDER?")) deleteFolderMutation.mutate(folder.id); }}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white border border-black"
                        >
                            <FiTrash2 size={10} />
                        </button>
                    </motion.div>
                ))}

                {/* 2. Assets */}
                {assets.map((asset: any) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={asset.id} 
                        className="group relative aspect-square bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all overflow-hidden"
                    >
                        <img src={asset.url} className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0" />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-between items-start">
                                <span className="bg-black text-white text-[8px] px-1 border border-white uppercase truncate max-w-[80px]">{asset.filename}</span>
                                <button className="p-1 bg-white text-black"><FiMoreVertical size={10}/></button>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    className="flex-1 bg-white hover:bg-[#3C48F5] hover:text-white transition-colors py-1 text-[8px] font-black uppercase border border-black"
                                    onClick={() => {
                                        // This button could be used to select asset for composer
                                        toast.info("ASSET_READY_FOR_USE");
                                    }}
                                >Use</button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if(confirm("DEL_ASSET?")) deleteAssetMutation.mutate(asset.id); }}
                                    className="bg-red-500 text-white p-1 border border-black hover:bg-red-600"
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="absolute top-0 left-0 flex flex-col items-start pointer-events-none">
                            <span className="bg-[#3C48F5] text-white text-[7px] font-black uppercase px-1 border-r border-b border-black">
                                {formatSize(asset.size)}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
         )}

         {!isLoading && assets.length === 0 && folders.length === 0 && (
             <div className="col-span-full py-20 text-center border-4 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 font-black uppercase tracking-tighter text-3xl">
                 Folder_Is_Empty
             </div>
         )}
      </div>
    </div>
  )
}