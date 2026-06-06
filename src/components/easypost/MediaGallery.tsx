'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiImage, FiUploadCloud, FiTrash2, FiLoader, FiFolder, FiChevronLeft, FiPlus,
    FiCornerUpLeft, FiMove, FiMoreVertical, FiShare2, FiEdit2
} from 'react-icons/fi';
import { SiCanva, SiDropbox } from 'react-icons/si';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/src/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLanguage } from '@/src/context/LanguageContext';
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
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'asset'|'folder', id: string} | null>(null);

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

  // 1. Fetch Media & Folders
  const { data, isLoading } = useQuery({
    queryKey: ['media', currentFolderId],
    gcTime: 0,
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
    <div className="flex flex-col gap-4 font-sans text-black dark:text-white transition-colors">

      {/* OS Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-3 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-black dark:text-white">
          <div className="flex items-center gap-3">
              {currentFolderId && (
                  <button onClick={goBack} className="p-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 border-2 border-black dark:border-white transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                      <FiChevronLeft size={18} strokeWidth={3} />
                  </button>
              )}
              <div className="flex items-center gap-2 font-black uppercase text-xs tracking-tighter text-black dark:text-white">
                  <FiFolder className="text-black dark:text-white" />
                  <span>{t("ROOT", "RACINE")}</span>
                  {folderPath.map(p => (
                      <React.Fragment key={p.id}>
                          <span className="opacity-50">/</span>
                          <span>{p.name}</span>
                      </React.Fragment>
                  ))}
              </div>
          </div>

          <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black border-2 border-black dark:border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all"
              >
                  <FiPlus /> {t("New Folder", "Nouveau Dossier")}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black border-2 border-black dark:border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all"
              >
                  <FiUploadCloud />
                  {uploadProgress
                    ? t(`${uploadProgress.done}/${uploadProgress.total} Uploading...`, `${uploadProgress.done}/${uploadProgress.total} En cours...`)
                    : t("Upload Asset", "Télécharger un média")}
              </button>
              <button
                onClick={handleCanvaClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black border-2 border-black dark:border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all"
                title={t("Import from Canva", "Importer depuis Canva")}
              >
                  <SiCanva size={13} /> Canva
              </button>
              <button
                onClick={() => toast.info(t("Dropbox Import — Coming Soon", "Import Dropbox — Bientôt disponible"))}
                className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black border-2 border-black dark:border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] transition-all"
                title={t("Import from Dropbox", "Importer depuis Dropbox")}
              >
                  <SiDropbox size={13} /> Dropbox
              </button>
          </div>
      </div>

      {/* Storage & Folder Creator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideUsage && (
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                    <span>{t("Usage", "Utilisation")}</span>
                    <span>{formatSize(usage)} / 100MB</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 border border-black dark:border-white overflow-hidden">
                    <div className="h-full bg-black dark:bg-white" style={{ width: `${Math.min((usage / (100 * 1024 * 1024)) * 100, 100)}%` }} />
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
                        placeholder={t("FOLDER NAME...", "NOM DU DOSSIER...")}
                        className="flex-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white px-3 text-xs font-bold uppercase focus:outline-none"
                      />
                      <button
                        onClick={() => createFolderMutation.mutate(newFolderName)}
                        className="px-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-black hover:text-white transition-all"
                      >
                          {t("OK", "OK")}
                      </button>
                      <button
                        onClick={() => setIsCreatingFolder(false)}
                        className="px-4 bg-white border-2 border-black dark:border-white text-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#000]"
                      >
                          {t("X", "X")}
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
                 <div key={i} className="flex flex-col items-center gap-2 p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                   <Skeleton className="w-full aspect-square" />
                   <Skeleton className="h-2.5 w-3/4" />
                 </div>
               ))}
             </>
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
                        <div className="text-black dark:text-white dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <FiFolder size={48} fill="currentColor" fillOpacity={0.2} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-center truncate w-full">{folder.name}</span>
                        {deleteConfirm?.id === folder.id ? (
                            <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                                <button onClick={(e) => { e.stopPropagation(); deleteFolderMutation.mutate(folder.id); setDeleteConfirm(null); }} className="px-1.5 py-0.5 bg-red-500 text-white border border-black text-[8px] font-black uppercase">{t('Del', 'Sup')}</button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="px-1.5 py-0.5 bg-white text-black border border-black text-[8px] font-black">✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({type: 'folder', id: folder.id}); }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white border border-black"
                            >
                                <FiTrash2 size={10} />
                            </button>
                        )}
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
                        {asset.mimeType?.startsWith('video/') ? (
                            <video src={asset.url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                            <img src={asset.url} className="w-full h-full object-cover" alt="" />
                        )}
                        {asset.mimeType?.startsWith('video/') && (
                            <div className="absolute top-1 left-1 bg-black/80 text-white text-[8px] font-black px-1.5 py-0.5 pointer-events-none tracking-widest">
                                VIDEO
                            </div>
                        )}

                        <div
                            className={cn(
                                "absolute inset-0 transition-opacity flex flex-col justify-between p-1.5",
                                sectionMenuFor === asset.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                        >
                            {/* Top row: Edit in Canva + Delete */}
                            <div className="flex justify-end gap-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); editInCanva(asset); }}
                                    disabled={canvaUploading === asset.id}
                                    title={t('Edit in Canva', 'Modifier dans Canva')}
                                    className="p-1.5 bg-white text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                                >
                                    {canvaUploading === asset.id
                                        ? <FiLoader size={10} className="animate-spin" />
                                        : <FiEdit2 size={10} />
                                    }
                                </button>
                                {deleteConfirm?.id === asset.id ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); deleteAssetMutation.mutate(asset.id); setDeleteConfirm(null); }} className="p-1.5 bg-red-500 text-white border border-black shadow-[1px_1px_0px_0px_#000] text-[8px] font-black uppercase">{t('Del?', 'Sup?')}</button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="p-1.5 bg-white text-black border border-black shadow-[1px_1px_0px_0px_#000] text-[8px] font-black">✕</button>
                                    </>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({type: 'asset', id: asset.id}); }}
                                        title={t('Delete', 'Supprimer')}
                                        className="p-1.5 bg-white text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                                    >
                                        <FiTrash2 size={10} />
                                    </button>
                                )}
                            </div>

                            {/* Bottom: Use / section selector */}
                            {onUse && sectionMenuFor === asset.id ? (
                                <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white flex flex-col gap-1 p-1">
                                    {sections.map(s => (
                                        <button
                                            key={s.id}
                                            className="w-full bg-black text-white py-1 text-[8px] font-black uppercase border border-black hover:bg-zinc-700 transition-colors"
                                            onClick={() => { onUse(asset, s.id); setSectionMenuFor(null); }}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                    <button
                                        className="w-full bg-white dark:bg-zinc-800 text-black dark:text-white py-1 text-[8px] font-black uppercase border border-black dark:border-white"
                                        onClick={() => setSectionMenuFor(null)}
                                    >
                                        {t("Cancel", "Annuler")}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-full bg-white text-black py-1 text-[8px] font-black uppercase border border-black hover:bg-zinc-100 transition-colors rounded-lg"
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
             <div className="col-span-full py-20 text-center border-4 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 font-black uppercase tracking-tighter text-3xl">
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
