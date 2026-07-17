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
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
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
    <div className="flex flex-col gap-4 font-sans text-[#040028] dark:text-white transition-colors">

      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0A0A2E] p-3 rounded-[16px] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] text-[#040028] dark:text-white">
          <div className="flex items-center gap-3">
              {currentFolderId && (
                  <button onClick={goBack} className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
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
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
              >
                  <FiPlus size={14} /> {t("New folder", "Nouveau dossier")}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#174CD2] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(23,76,210,0.3)] hover:bg-[#123a9e] transition-all"
              >
                  <FiUploadCloud size={14} />
                  {uploadProgress
                    ? t(`${uploadProgress.done}/${uploadProgress.total} uploading...`, `${uploadProgress.done}/${uploadProgress.total} en cours...`)
                    : t("Upload asset", "Télécharger un média")}
              </button>
              <button
                onClick={handleCanvaClick}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
                title={t("Import from Canva", "Importer depuis Canva")}
              >
                  <SiCanva size={13} /> Canva
              </button>
              <button
                onClick={() => toast.info(t("Dropbox import — coming soon", "Import Dropbox — bientôt disponible"))}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
                title={t("Import from Dropbox", "Importer depuis Dropbox")}
              >
                  <SiDropbox size={13} /> Dropbox
              </button>
          </div>
      </div>

      {/* Storage & Folder Creator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideUsage && (
            <div className="bg-white dark:bg-[#0A0A2E] rounded-[14px] border border-black/5 dark:border-white/5 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between text-xs font-semibold text-[#8E8E8E] mb-2">
                    <span>{t("Usage", "Utilisation")}</span>
                    <span>{formatSize(usage)} / 100MB</span>
                </div>
                <div className="h-2 rounded-full bg-[#F5F7FA] dark:bg-white/10 overflow-hidden">
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
                        className="flex-1 bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 text-sm font-medium placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all text-[#040028] dark:text-white"
                      />
                      <button
                        onClick={() => createFolderMutation.mutate(newFolderName)}
                        className="px-4 rounded-[10px] bg-[#174CD2] text-white font-semibold text-xs shadow-[0_4px_14px_rgba(23,76,210,0.3)] hover:bg-[#123a9e] transition-all"
                      >
                          {t("OK", "OK")}
                      </button>
                      <button
                        onClick={() => setIsCreatingFolder(false)}
                        className="px-4 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white font-semibold text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-all"
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
                 <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-[14px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
                   <Skeleton className="w-full aspect-square rounded-[10px]" />
                   <Skeleton className="h-2.5 w-3/4 rounded-[4px]" />
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
                        className="group cursor-pointer flex flex-col items-center gap-2 p-4 rounded-[14px] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all relative"
                    >
                        <div className="text-[#174CD2] group-hover:scale-110 transition-transform">
                            <FiFolder size={44} fill="currentColor" fillOpacity={0.15} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-semibold text-center truncate w-full text-[#040028] dark:text-white">{folder.name}</span>
                        {deleteConfirm?.id === folder.id ? (
                            <div className="absolute top-1 right-1 flex gap-1 z-10">
                                <button onClick={(e) => { e.stopPropagation(); deleteFolderMutation.mutate(folder.id); setDeleteConfirm(null); }} className="px-2 py-1 rounded-[6px] bg-red-500 text-white text-[10px] font-semibold">{t('Delete', 'Suppr.')}</button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="px-2 py-1 rounded-[6px] bg-white text-[#040028] shadow-sm text-[10px] font-semibold">✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({type: 'folder', id: folder.id}); }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-white shadow-sm text-red-500 transition-opacity"
                            >
                                <FiTrash2 size={12} />
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
                        className="group relative aspect-square rounded-[14px] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all overflow-hidden"
                    >
                        {asset.mimeType?.startsWith('video/') ? (
                            <video src={asset.url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                            <img src={asset.url} className="w-full h-full object-cover" alt="" />
                        )}
                        {asset.mimeType?.startsWith('video/') && (
                            <div className="absolute top-2 left-2 rounded-full bg-[#040028]/70 text-white text-[10px] font-semibold px-2 py-0.5 pointer-events-none">
                                {t('Video', 'Vidéo')}
                            </div>
                        )}

                        <div
                            className={cn(
                                "absolute inset-0 bg-[#040028]/0 group-hover:bg-[#040028]/10 transition-all flex flex-col justify-between p-2",
                                sectionMenuFor === asset.id ? "opacity-100 bg-[#040028]/10" : "opacity-0 group-hover:opacity-100"
                            )}
                        >
                            {/* Top row: Edit in Canva + Delete */}
                            <div className="flex justify-end gap-1.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); editInCanva(asset); }}
                                    disabled={canvaUploading === asset.id}
                                    title={t('Edit in Canva', 'Modifier dans Canva')}
                                    className="p-1.5 rounded-full bg-white shadow-sm text-[#040028]"
                                >
                                    {canvaUploading === asset.id
                                        ? <FiLoader size={11} className="animate-spin" />
                                        : <FiEdit2 size={11} />
                                    }
                                </button>
                                {deleteConfirm?.id === asset.id ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); deleteAssetMutation.mutate(asset.id); setDeleteConfirm(null); }} className="px-2 py-1 rounded-[6px] bg-red-500 text-white text-[10px] font-semibold">{t('Delete?', 'Suppr.?')}</button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="p-1.5 rounded-full bg-white shadow-sm text-[#040028]">✕</button>
                                    </>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({type: 'asset', id: asset.id}); }}
                                        title={t('Delete', 'Supprimer')}
                                        className="p-1.5 rounded-full bg-white shadow-sm text-red-500"
                                    >
                                        <FiTrash2 size={11} />
                                    </button>
                                )}
                            </div>

                            {/* Bottom: Use / section selector */}
                            {onUse && sectionMenuFor === asset.id ? (
                                <div className="bg-white dark:bg-[#0A0A2E] rounded-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col gap-1 p-1.5">
                                    {sections.map(s => (
                                        <button
                                            key={s.id}
                                            className="w-full rounded-[6px] bg-[#174CD2] text-white py-1.5 text-[10px] font-semibold hover:bg-[#123a9e] transition-colors"
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
                                    className="w-full rounded-[8px] bg-white text-[#040028] py-1.5 text-xs font-semibold hover:bg-white/90 transition-colors"
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
