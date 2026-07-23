'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiImage, FiUploadCloud, FiTrash2, FiLoader, FiFolder, FiChevronLeft, FiPlus,
    FiCornerUpLeft, FiMove, FiMoreVertical, FiShare2, FiEdit2, FiPlay, FiPause
} from 'react-icons/fi';
import { SiCanva, SiDropbox } from 'react-icons/si';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CanvaImportModal from './CanvaImportModal';

interface Section { id: string; label: string; }

export default function MediaGallery({
  hideUsage = false,
  onUse,
  sections = [],
  workspaceId,
}: {
  hideUsage?: boolean;
  onUse?: (asset: any, sectionId: string) => void;
  sections?: Section[];
  workspaceId?: string;
}) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sectionMenuFor, setSectionMenuFor] = useState<string | null>(null);
  const [canvaModalOpen, setCanvaModalOpen] = useState(false);
  const [canvaUploading, setCanvaUploading] = useState<string | null>(null);
  const [playingAssetId, setPlayingAssetId] = useState<string | null>(null);
  const [optionsMenuOpenFor, setOptionsMenuOpenFor] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const togglePlayback = (assetId: string) => {
      const video = videoRefs.current[assetId];
      if (!video) return;
      if (video.paused) {
          video.play();
          setPlayingAssetId(assetId);
      } else {
          video.pause();
          setPlayingAssetId(null);
      }
  };

  // Detect ?canva=connected (OAuth callback) or ?canva=returned (return navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const canvaParam = params.get('canva');
    if (canvaParam === 'connected') {
      toast.success(t('Canva connected!', 'Canva connecté !'));
      setCanvaModalOpen(true);
    } else if (canvaParam === 'returned') {
      toast.success(t('Back from Canva — import your design below', 'Retour depuis Canva — importez votre design'));
      setCanvaModalOpen(true);
    } else if (canvaParam === 'error') {
      const errMsg = params.get('canva_error') ?? 'Authorization failed';
      toast.error(t(`Canva: ${errMsg}`, `Canva : ${errMsg}`));
    }
    if (canvaParam === 'connected' || canvaParam === 'returned' || canvaParam === 'error') {
      const url = new URL(window.location.href);
      url.searchParams.delete('canva');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleCanvaClick = async () => {
    if (!workspaceId) { toast.error('No workspace'); return; }
    try {
      const { data } = await (api as any).get(`/canva/status?workspaceId=${workspaceId}`);
      if (data?.connected) {
        setCanvaModalOpen(true);
      } else {
        const authRes = await (api as any).get(`/canva/auth?workspaceId=${workspaceId}`);
        window.location.href = authRes.data?.url ?? authRes.url;
      }
    } catch {
      toast.error(t('Could not connect to Canva', 'Impossible de connecter Canva'));
    }
  };

  const editInCanva = async (asset: any) => {
    if (!workspaceId) return;
    setCanvaUploading(asset.id);
    try {
      const statusRes = await (api as any).get(`/canva/status?workspaceId=${workspaceId}`);
      const connected = statusRes?.data?.connected ?? statusRes?.connected;
      if (!connected) {
        const authRes = await (api as any).get(`/canva/auth?workspaceId=${workspaceId}`);
        window.location.href = authRes?.data?.url ?? authRes?.url;
        return;
      }
      const res = await api.post<any>('/canva/edit-asset', { workspaceId, assetId: asset.id });
      const editUrl = (res as any)?.editUrl ?? (res as any)?.data?.editUrl;
      window.open(editUrl, '_blank', 'noopener,noreferrer');
      toast.success(t('Asset sent to Canva — edit and return when done', 'Asset envoyé à Canva'));
    } catch {
      toast.error(t('Could not open in Canva', "Impossible d'ouvrir dans Canva"));
    } finally {
      setCanvaUploading(null);
    }
  };

  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const pinnedKey = `media_pinned_folders_${workspaceId}`;
  const [pinnedFolderIds, setPinnedFolderIds] = useState<string[]>(() => {
      if (typeof window === 'undefined') return [];
      try { return JSON.parse(localStorage.getItem(pinnedKey) || '[]'); } catch { return []; }
  });
  const togglePinFolder = (id: string) => {
      setPinnedFolderIds(prev => {
          const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
          try { localStorage.setItem(pinnedKey, JSON.stringify(next)); } catch {}
          return next;
      });
  };

  // 1. Fetch Media & Folders
  const { data, isLoading } = useQuery({
    queryKey: ['media', currentFolderId],
    gcTime: 0,
    queryFn: async () => {
        const url = currentFolderId ? `/media?folderId=${currentFolderId}` : '/media';
        return api.get<{ folders: any[], assets: any[] }>(url);
    },
  });

  const assets = data?.assets || [];
  const folders = data?.folders || [];

  // 2. Fetch Storage Usage
  const { data: usage = 0 } = useQuery({
    queryKey: ['media-usage'],
    gcTime: 0,
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
        toast.success(t("Upload successful", "Téléchargement réussi"));
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    }
  });

  const createFolderMutation = useMutation({
      mutationFn: (name: string) => api.post('/media/folders', { name, parentId: currentFolderId }),
      onSuccess: () => {
          toast.success(t("Folder created", "Dossier créé"));
          setIsCreatingFolder(false);
          setNewFolderName("");
          queryClient.invalidateQueries({ queryKey: ['media'] });
      }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
        toast.success(t("Asset deleted", "Média supprimé"));
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/folders/${id}`),
    onSuccess: () => {
        toast.success(t("Folder deleted", "Dossier supprimé"));
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/media/folders/${id}`, { name }),
    onSuccess: () => {
        toast.success(t("Folder renamed", "Dossier renommé"));
        setRenamingFolderId(null);
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadProgress({ done: 0, total: files.length });
    let done = 0;
    await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolderId) formData.append('folderId', currentFolderId);
        await api.post('/media/upload', formData);
        done++;
        setUploadProgress({ done, total: files.length });
      })
    );
    setUploadProgress(null);
    toast.success(t(`Upload complete: ${files.length} file${files.length > 1 ? 's' : ''}`, `Téléchargement terminé: ${files.length} fichier${files.length > 1 ? 's' : ''}`));
    queryClient.invalidateQueries({ queryKey: ['media'] });
    queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    // reset input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="flex flex-col gap-4 font-sans text-[#040028] dark:text-white transition-colors">

      {/* Toolbar */}
      <div className="sticky top-0 isolate z-20 flex flex-wrap gap-4 items-center justify-between bg-[#F7F6F3] dark:bg-[#0A0A2E] p-3 rounded-none border border-black/5 dark:border-white/5 text-[#040028] dark:text-white">
          <div className="flex items-center gap-3">
              {currentFolderId && (
                  <button onClick={goBack} className="p-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
                      <FiChevronLeft size={18} />
                  </button>
              )}
              <div className="flex items-center gap-2 font-semibold text-sm text-[#040028] dark:text-white">
                  <FiFolder className="text-[#8E8E8E]" />
                  <span>{t("Root", "Racine")}</span>
                  {folderPath.map(p => (
                      <React.Fragment key={p.id}>
                          <span className="text-[#8E8E8E]">/</span>
                          <span>{p.name}</span>
                      </React.Fragment>
                  ))}
              </div>
          </div>

          <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
              >
                  <FiPlus size={14} /> {t("New folder", "Nouveau dossier")}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
              >
                  <FiUploadCloud size={14} />
                  {uploadProgress
                    ? t(`${uploadProgress.done}/${uploadProgress.total} uploading...`, `${uploadProgress.done}/${uploadProgress.total} en cours...`)
                    : t("Upload asset", "Télécharger un média")}
              </button>
              <button
                onClick={handleCanvaClick}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
                title={t("Import from Canva", "Importer depuis Canva")}
              >
                  <SiCanva size={13} /> Canva
              </button>
              <button
                onClick={() => toast.info(t("Dropbox import — coming soon", "Import Dropbox — bientôt disponible"))}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
                title={t("Import from Dropbox", "Importer depuis Dropbox")}
              >
                  <SiDropbox size={13} /> Dropbox
              </button>
          </div>
      </div>

      {/* Storage & Folder Creator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideUsage && (
            <div className="bg-[#F7F6F3] dark:bg-[#0A0A2E] rounded-[14px] border border-black/5 dark:border-white/5 p-4">
                <div className="flex justify-between text-xs font-semibold text-[#040028] dark:text-white mb-2">
                    <span>{t("Usage", "Utilisation")}</span>
                    <span>{formatSize(usage)} / 100MB</span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E5E5] dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[#174CD2]" style={{ width: `${Math.min((usage / (100 * 1024 * 1024)) * 100, 100)}%` }} />
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
                        placeholder={t("Folder name...", "Nom du dossier...")}
                        className="flex-1 bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 text-sm font-medium placeholder:text-[#8E8E8E] focus:outline-none focus:ring-2 focus:ring-[#174CD2]/15 transition-all text-[#040028] dark:text-white"
                      />
                      <button
                        onClick={() => createFolderMutation.mutate(newFolderName)}
                        className="px-4 rounded-[10px] bg-[#040028] dark:bg-white text-white dark:text-[#040028] font-semibold text-xs transition-all"
                      >
                          {t("OK", "OK")}
                      </button>
                      <button
                        onClick={() => setIsCreatingFolder(false)}
                        className="px-4 rounded-[10px] bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-[#D9D9D9] dark:border-white/10 font-semibold text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                      >
                          {t("Cancel", "Annuler")}
                      </button>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,image/gif" multiple />

      {/* Explorer Grid — independently scrollable */}
      <div className="overflow-y-auto scrollbar-hide min-h-[160px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
         {isLoading ? (
             <>
               {[...Array(10)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-[14px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]">
                   <Skeleton className="w-full aspect-square rounded-[10px]" />
                   <Skeleton className="h-2.5 w-3/4 rounded-[4px]" />
                 </div>
               ))}
             </>
         ) : (
            <AnimatePresence mode="popLayout">
                {/* 1. Folders */}
                {[...folders].sort((a, b) => (pinnedFolderIds.includes(b.id) ? 1 : 0) - (pinnedFolderIds.includes(a.id) ? 1 : 0)).map((folder: any) => (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        key={folder.id}
                        onClick={() => { if (renamingFolderId !== folder.id) enterFolder(folder); }}
                        className="group cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-[14px] bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 hover:border-[#040028]/20 dark:hover:border-white/20 transition-all relative"
                    >
                        {pinnedFolderIds.includes(folder.id) && (
                            <div className="absolute top-1 left-1 text-[#040028] dark:text-white" title={t('Pinned', 'Épinglé')}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3a1 1 0 0 1 1 1v6.5l2.6 3.9a1 1 0 0 1-.83 1.6H13v6l-1 2-1-2v-6H5.23a1 1 0 0 1-.83-1.6L7 10.5V4a1 1 0 0 1 1-1h8Z"/></svg>
                            </div>
                        )}
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.21736 5.94201C1.21736 4.972 1.31578 3.0322 3.67787 3.0322C4.36858 3.03246 8.41366 2.72544 8.59874 4.00214C9.09084 7.39674 15.9803 5.45704 18.9329 5.45704C21.8855 5.45704 22.8697 6.42698 22.8697 8.85181C22.8697 9.10966 22.8808 9.43881 22.8966 9.82175C23.029 13.0399 23.4878 20.0576 20.4093 20.4909C16.9646 20.9759 1.70944 21.9458 1.21736 18.5511C0.936945 16.6165 0.972797 12.5986 1.07592 9.33678C1.11756 8.01951 1.17018 6.82557 1.21736 5.94201Z" stroke="#040028" strokeLinecap="round"/><path d="M1.07593 9.33667C8.19441 9.33667 22.5244 9.43366 22.8966 9.82164" stroke="#040028" strokeOpacity="0.3" strokeLinecap="round"/></svg>
                        {renamingFolderId === folder.id ? (
                            <input
                                autoFocus
                                value={renameValue}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && renameValue.trim()) renameFolderMutation.mutate({ id: folder.id, name: renameValue.trim() });
                                    if (e.key === 'Escape') setRenamingFolderId(null);
                                }}
                                onBlur={() => setRenamingFolderId(null)}
                                className="w-full text-xs font-semibold text-center bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[6px] px-1 py-0.5 text-[#040028] dark:text-white focus:outline-none"
                            />
                        ) : (
                            <span className="text-xs font-semibold text-center truncate w-full text-[#040028] dark:text-white">{folder.name}</span>
                        )}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 px-2.5 py-1.5 rounded-[8px] bg-white hover:bg-black/5 transition-opacity"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent onClick={(e) => e.stopPropagation()} className="w-48 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden" align="end">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setRenamingFolderId(folder.id); setRenameValue(folder.name); }}
                                    className="w-full h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                    {t('Rename', 'Renommer')}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); togglePinFolder(folder.id); }}
                                    className="w-full h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                    {pinnedFolderIds.includes(folder.id) ? t('Unpin', 'Désépingler') : t('Pin to top', 'Épingler en haut')}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteFolderMutation.mutate(folder.id); }}
                                    className="w-full h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                    {t('Delete', 'Supprimer')}
                                </button>
                            </PopoverContent>
                        </Popover>
                    </motion.div>
                ))}

                {/* 2. Assets */}
                {assets.map((asset: any) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={asset.id}
                        className="group relative aspect-square rounded-[14px] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 transition-all overflow-hidden"
                    >
                        {asset.mimeType?.startsWith('video/') ? (
                            <video
                                ref={(el) => { videoRefs.current[asset.id] = el; }}
                                src={asset.url}
                                className="w-full h-full object-cover"
                                playsInline
                                onEnded={() => setPlayingAssetId(null)}
                                onClick={(e) => { e.stopPropagation(); togglePlayback(asset.id); }}
                            />
                        ) : (
                            <img src={asset.url} className="w-full h-full object-cover" alt="" />
                        )}
                        {asset.mimeType?.startsWith('video/') && (
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlayback(asset.id); }}
                                className={cn(
                                    "absolute inset-0 m-auto w-10 h-10 rounded-full bg-white/90 text-[#040028] flex items-center justify-center transition-opacity",
                                    playingAssetId === asset.id ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                                )}
                            >
                                {playingAssetId === asset.id ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
                            </button>
                        )}

                        <div
                            className={cn(
                                "absolute inset-0 transition-all flex flex-col justify-between p-2 pointer-events-none [&>*]:pointer-events-auto",
                                sectionMenuFor === asset.id || optionsMenuOpenFor === asset.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                        >
                            {/* Top row: overflow menu (Edit in Canva / Delete) */}
                            <div className="flex justify-end">
                                <Popover open={optionsMenuOpenFor === asset.id} onOpenChange={(open) => setOptionsMenuOpenFor(open ? asset.id : null)}>
                                    <PopoverTrigger asChild>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 rounded-full bg-white text-[#040028] hover:bg-[#F7F6F3] transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent onClick={(e) => e.stopPropagation()} className="w-48 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden" align="end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOptionsMenuOpenFor(null); editInCanva(asset); }}
                                            disabled={canvaUploading === asset.id}
                                            className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
                                        >
                                            {canvaUploading === asset.id
                                                ? <FiLoader size={14} className="animate-spin" />
                                                : <FiEdit2 size={14} />
                                            }
                                            {t('Edit in Canva', 'Retoucher sur Canva')}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOptionsMenuOpenFor(null); deleteAssetMutation.mutate(asset.id); }}
                                            className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-red-500 hover:bg-black/5 dark:hover:bg-white/10"
                                        >
                                            <FiTrash2 size={14} />
                                            {t('Delete', 'Supprimer')}
                                        </button>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Bottom: Use / section selector */}
                            {onUse && sectionMenuFor === asset.id ? (
                                <div className="bg-white dark:bg-[#0A0A2E] rounded-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col gap-1 p-1.5">
                                    {sections.map(s => (
                                        <button
                                            key={s.id}
                                            className="w-full rounded-[6px] bg-[#174CD2] text-white py-1.5 text-[10px] font-semibold hover:bg-[#040028] transition-colors"
                                            onClick={() => { onUse(asset, s.id); setSectionMenuFor(null); }}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                    <button
                                        className="w-full rounded-[6px] bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white py-1.5 text-[10px] font-semibold"
                                        onClick={() => setSectionMenuFor(null)}
                                    >
                                        {t("Cancel", "Annuler")}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-full rounded-[8px] bg-white text-[#040028] py-1.5 text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
                                    onClick={() => {
                                        if (onUse) {
                                            setSectionMenuFor(asset.id);
                                        } else {
                                            navigator.clipboard.writeText(asset.url).catch(() => {});
                                            toast.success(t("URL copied", "URL copiée"));
                                        }
                                    }}
                                >
                                    {t("Use", "Utiliser")}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
         )}

         {!isLoading && assets.length === 0 && folders.length === 0 && (
             <div className="col-span-full py-20 text-center rounded-[16px] border border-dashed border-black/10 dark:border-white/10 text-[#8E8E8E] font-semibold text-lg">
                 {t("Folder is empty", "Le dossier est vide")}
             </div>
         )}
      </div>
      </div>

      {canvaModalOpen && workspaceId && (
        <CanvaImportModal
          isOpen={canvaModalOpen}
          onClose={() => setCanvaModalOpen(false)}
          workspaceId={workspaceId}
          onImported={() => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            setCanvaModalOpen(false);
          }}
        />
      )}
    </div>
  )
}
