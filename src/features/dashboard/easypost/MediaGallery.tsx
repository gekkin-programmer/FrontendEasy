'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiImage, FiUploadCloud, FiTrash2, FiLoader, FiFolder, FiChevronLeft, FiPlus,
  FiCornerUpLeft, FiMove, FiMoreVertical, FiShare2, FiEdit2, FiPlay, FiPause
} from 'react-icons/fi';
import { SiCanva, SiDropbox, SiGoogledrive } from 'react-icons/si';
import { cn } from '@/lib/utils';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { useAppToast } from '@/hooks/useAppToast';
import Folder from '@/components/Folder';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import CanvaImportModal from './CanvaImportModal';
import DropboxBrowserModal from './DropboxBrowserModal';
import { openGoogleDrivePicker } from '@/lib/googleDrivePicker';

interface Section { id: string; label: string; }

// Per-plan cumulative storage quota, confirmed with backend
const STORAGE_QUOTA_BYTES: Record<string, number> = {
  FREE: 100 * 1024 * 1024,
  STARTER: 500 * 1024 * 1024,
  PROFESSIONAL: 2 * 1024 * 1024 * 1024,
  BUSINESS: 10 * 1024 * 1024 * 1024,
  ENTERPRISE: 100 * 1024 * 1024 * 1024,
};

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
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvaModalOpen, setCanvaModalOpen] = useState(false);
  const [canvaUploading, setCanvaUploading] = useState<string | null>(null);
  const [dropboxModalOpen, setDropboxModalOpen] = useState(false);
  const [googleDriveImporting, setGoogleDriveImporting] = useState(false);
  const [playingAssetId, setPlayingAssetId] = useState<string | null>(null);
  const [optionsMenuOpenFor, setOptionsMenuOpenFor] = useState<string | null>(null);
  const [folderMenuOpenFor, setFolderMenuOpenFor] = useState<string | null>(null);
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
    if (canvaParam === 'connected' || canvaParam === 'returned') {
      setCanvaModalOpen(true);
    }
    if (canvaParam === 'connected' || canvaParam === 'returned' || canvaParam === 'error') {
      const url = new URL(window.location.href);
      url.searchParams.delete('canva');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Detect ?dropbox=connected (OAuth callback) or ?dropbox=error
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const dropboxParam = params.get('dropbox');
    if (dropboxParam === 'connected') {
      setDropboxModalOpen(true);
    }
    if (dropboxParam === 'connected' || dropboxParam === 'error') {
      const url = new URL(window.location.href);
      url.searchParams.delete('dropbox');
      url.searchParams.delete('dropbox_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleDropboxClick = async () => {
    if (!workspaceId) return;
    try {
      const res: any = await api.get(`/dropbox/status?workspaceId=${workspaceId}`);
      const connected = res?.data?.connected ?? res?.connected;
      if (connected) {
        setDropboxModalOpen(true);
      } else {
        const authRes: any = await api.get(`/dropbox/auth?workspaceId=${workspaceId}`);
        window.location.href = authRes?.data?.url ?? authRes?.url;
      }
    } catch {
      // Silent — the user can just try again.
    }
  };

  const handleGoogleDriveClick = async () => {
    if (!workspaceId) return;
    setGoogleDriveImporting(true);
    try {
      const picked = await openGoogleDrivePicker();
      if (!picked) { setGoogleDriveImporting(false); return; }
      await api.post('/google-drive/import', {
        workspaceId,
        fileId: picked.fileId,
        accessToken: picked.accessToken,
        folderId: currentFolderId,
      });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    } catch {
      // Silent — the user can just try again.
    } finally {
      setGoogleDriveImporting(false);
    }
  };

  const handleCanvaClick = async () => {
    if (!workspaceId) return;
    try {
      const statusRes = await (api as any).get(`/canva/status?workspaceId=${workspaceId}`);
      const connected = statusRes?.data?.connected ?? statusRes?.connected;
      if (connected) {
        setCanvaModalOpen(true);
      } else {
        const authRes = await (api as any).get(`/canva/auth?workspaceId=${workspaceId}`);
        window.location.href = authRes?.data?.url ?? authRes?.url;
      }
    } catch {
      // Silent — the user can just try again.
    }
  };

  const editInCanva = async (asset: any) => {
    if (!workspaceId) return;
    setCanvaUploading(asset.id);
    // Open the tab synchronously, inside the click — setting its location later
    // (after the awaits below) is outside the user-gesture window and popup
    // blockers silently swallow it, which looks identical to a backend failure.
    const tab = window.open('', '_blank');
    try {
      const statusRes = await (api as any).get(`/canva/status?workspaceId=${workspaceId}`);
      const connected = statusRes?.data?.connected ?? statusRes?.connected;
      if (!connected) {
        tab?.close();
        const authRes = await (api as any).get(`/canva/auth?workspaceId=${workspaceId}`);
        window.location.href = authRes?.data?.url ?? authRes?.url;
        return;
      }
      const res = await api.post<any>('/canva/edit-asset', { workspaceId, assetId: asset.id });
      const editUrl = (res as any)?.editUrl ?? (res as any)?.data?.editUrl;
      if (tab) tab.location.href = editUrl;
      else window.location.href = editUrl;
    } catch {
      tab?.close();
      // Silent — the user can just try again.
    } finally {
      setCanvaUploading(null);
    }
  };

  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string, name: string }[]>([]);
  // Per-file byte progress (0-100), keyed by a client-generated id. fetch() has no
  // upload-progress event, so these uploads go through XHR instead of api.post —
  // that's the only way to get a real percentage rather than faking one.
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string; percent: number }[]>([]);
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
      try { localStorage.setItem(pinnedKey, JSON.stringify(next)); } catch { }
      return next;
    });
  };

  // 1. Fetch Media & Folders
  // placeholderData keeps the previous folder's cards on screen while a new
  // folder loads, instead of collapsing to a fixed-count skeleton grid that
  // doesn't match the real item count — isLoading only fires on true first load.
  const { data, isLoading } = useQuery({
    queryKey: ['media', workspaceId, currentFolderId],
    gcTime: 0,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.set('workspaceId', workspaceId);
      if (currentFolderId) params.set('folderId', currentFolderId);
      const qs = params.toString();
      return api.get<{ folders: any[], assets: any[] }>(qs ? `/media?${qs}` : '/media');
    },
  });

  const assets = data?.assets || [];
  const folders = data?.folders || [];

  // 2. Fetch Storage Usage
  const { data: usage = 0 } = useQuery({
    queryKey: ['media-usage', workspaceId],
    gcTime: 0,
    queryFn: async () => {
      const url = workspaceId ? `/media/usage?workspaceId=${workspaceId}` : '/media/usage';
      const res = await api.get<number>(url);
      return typeof res === 'number' ? res : (res as any).data || 0;
    }
  });

  // 2b. Fetch workspace plan to compute the correct storage quota
  const { data: workspace } = useQuery({
    queryKey: ['workspace-billing', workspaceId],
    gcTime: 0,
    enabled: !hideUsage && !!workspaceId,
    queryFn: () => api.get<any>(`/workspaces/${workspaceId}`),
  });
  const planType: string = workspace?.owner?.planType ?? workspace?.planType ?? 'FREE';
  const storageQuota = STORAGE_QUOTA_BYTES[planType] ?? STORAGE_QUOTA_BYTES.FREE;

  // 3. Mutations
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => api.post<any>('/media/folders', { name, parentId: currentFolderId, workspaceId }),
    onSuccess: (res) => {
      const created = res?.data ?? res;
      queryClient.invalidateQueries({ queryKey: ['media'] });
      if (created?.id) {
        setRenamingFolderId(created.id);
        setRenameValue(created.name || "");
      }
    }
  });

  const nextFolderName = () => {
    const base = t("Folder", "Dossier");
    const pattern = new RegExp(`^${base} (\\d+)$`);
    const usedNumbers = folders
      .map((f: any) => { const m = f.name?.match(pattern); return m ? parseInt(m[1], 10) : null; })
      .filter((n: number | null): n is number => n !== null);
    const next = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
    return `${base} ${next}`;
  };

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}${workspaceId ? `?workspaceId=${workspaceId}` : ''}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/folders/${id}${workspaceId ? `?workspaceId=${workspaceId}` : ''}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/media/folders/${id}`, { name, workspaceId }),
    onSuccess: () => {
      setRenamingFolderId(null);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // matches backend MaxFileSizeValidator

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const uploadId = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
        setUploadingFiles((prev) => [...prev, { id: uploadId, name: file.name, percent: 0 }]);
        try {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`${file.name}: ${t('File too large. Maximum size is 500 MB.', 'Fichier trop volumineux. Taille maximale : 500 Mo.')}`);
          }
          const formData = new FormData();
          formData.append('file', file);
          if (currentFolderId) formData.append('folderId', currentFolderId);
          if (workspaceId) formData.append('workspaceId', workspaceId);
          try {
            await api.uploadWithProgress('/media/upload', formData, (percent) => {
              setUploadingFiles((prev) => prev.map((f) => f.id === uploadId ? { ...f, percent } : f));
            });
          } catch (err: any) {
            console.error('[MediaGallery] Upload failed', { fileName: file.name, fileType: file.type, err });
            throw new Error(`${file.name}: ${err?.message || 'Unknown error'}`);
          }
          // Stays mounted at 100% for a beat so the fill animation is visible,
          // then the real thumbnail takes over once the grid refetches.
          setUploadingFiles((prev) => prev.map((f) => f.id === uploadId ? { ...f, percent: 100 } : f));
          setTimeout(() => setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId)), 400);
        } catch (err) {
          // Failed before completion — remove immediately rather than faking 100%.
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
          throw err;
        }
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;

    if (succeeded > 0) {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-usage'] });
    }
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
    <div className="relative flex h-full flex-col overflow-hidden bg-white dark:bg-[#0A0A2E] font-sans text-[#040028] dark:text-white transition-colors">

      {/* Toolbar — fixed top block, totally opaque */}
      <div className="relative z-20 shrink-0 flex flex-col gap-3 bg-white dark:bg-[#0A0A2E] pb-2 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between p-0 sm:p-3 rounded-none sm:rounded-[14px] border-0 sm:border border-black/5 dark:border-white/5 text-[#040028] dark:text-white bg-white sm:bg-[#F7F6F3] dark:bg-[#0A0A2E] sm:dark:bg-white/5 border-b sm:border-b-0 border-[#E5E5E5] dark:border-white/10 pb-3 sm:pb-5">
          <div className="flex flex-row items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              {currentFolderId && (
                <button onClick={goBack} className="p-1.5 sm:p-2 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
                  <FiChevronLeft size={18} />
                </button>
              )}
              <div className="flex items-center gap-2 font-semibold text-sm text-[#040028] dark:text-white">
                <FiFolder className="text-[#8E8E8E] hidden sm:block" />
                <span>{t("Root", "Racine")}</span>
                {folderPath.map(p => (
                  <React.Fragment key={p.id}>
                    <span className="text-[#8E8E8E]">/</span>
                    <span>{p.name}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => createFolderMutation.mutate(nextFolderName())}
                disabled={createFolderMutation.isPending}
                className="flex items-center justify-center w-7 h-7 rounded-[8px] bg-[#040028] dark:bg-white text-white dark:text-[#0A0A2E] hover:bg-black/80 transition-all disabled:opacity-50"
              >
                <FiPlus size={16} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-7 h-7 rounded-[8px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white transition-all"
              >
                <FiUploadCloud size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <button
              onClick={() => createFolderMutation.mutate(nextFolderName())}
              disabled={createFolderMutation.isPending}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <FiPlus size={14} /> {t("New folder", "Nouveau dossier")}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-xs font-semibold transition-all"
            >
              <FiUploadCloud size={14} />
              {t("Upload asset", "Importer un média")}
            </button>
            <button
              onClick={handleCanvaClick}
              className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-[11px] sm:text-xs font-semibold transition-all"
              title={t("Import from Canva", "Importer depuis Canva")}
            >
              <SiCanva size={13} /> Canva
            </button>
            <button
              onClick={handleDropboxClick}
              className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-[11px] sm:text-xs font-semibold transition-all"
              title={t("Import from Dropbox", "Importer depuis Dropbox")}
            >
              <SiDropbox size={13} /> Dropbox
            </button>
            <button
              onClick={handleGoogleDriveClick}
              disabled={googleDriveImporting}
              className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-[#040028] dark:text-white text-[11px] sm:text-xs font-semibold transition-all disabled:opacity-50"
              title={t("Import from Google Drive", "Importer depuis Google Drive")}
            >
              {googleDriveImporting ? <FiLoader size={13} className="animate-spin" /> : <SiGoogledrive size={13} />} Google Drive
            </button>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" multiple />

      {/* Explorer Grid — scrollable folder area */}
      <div className="relative z-10 flex-1 overflow-y-auto bg-white dark:bg-[#0A0A2E] scrollbar-hide min-h-[400px] pt-1 pb-3 sm:px-1">
        <div className="flex flex-col sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 sm:gap-6 pb-4">
          {isLoading ? (
            <>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-3 rounded-none sm:rounded-[14px] border-b sm:border border-[#E5E5E5] sm:border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]">
                  <Skeleton width="40px" height="40px" radius={2} className="sm:w-full sm:h-auto sm:aspect-square" index={i} />
                  <div className="flex-1 w-full"><Skeleton width="75%" height={10} radius={1} index={i} /></div>
                </div>
              ))}
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {/* 0. In-flight uploads — a real gauge driven by XHR progress events,
                  not a fake animation. Each tile is replaced by the real thumbnail
                  once the grid refetches on upload success. */}
              {uploadingFiles.map((f) => {
                const radius = 26;
                const circumference = 2 * Math.PI * radius;
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-2 p-4 rounded-none sm:rounded-[14px] border-b sm:border border-[#E5E5E5] sm:border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] sm:aspect-square"
                  >
                    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
                      <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-[#E5E5E5] dark:text-white/10" />
                      <circle
                        cx="32" cy="32" r={radius} fill="none" stroke="#174CD2" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - f.percent / 100)}
                        style={{ transition: 'stroke-dashoffset 150ms linear' }}
                      />
                      <text x="32" y="32" textAnchor="middle" dominantBaseline="central" className="text-[13px] font-bold fill-[#040028] dark:fill-white" style={{ transform: 'rotate(90deg)', transformOrigin: '32px 32px' }}>
                        {f.percent}%
                      </text>
                    </svg>
                    <span className="text-xs font-semibold text-center truncate w-full text-[#040028] dark:text-white">{f.name}</span>
                  </motion.div>
                );
              })}

              {/* 1. Folders */}
              {[...folders].sort((a, b) => (pinnedFolderIds.includes(b.id) ? 1 : 0) - (pinnedFolderIds.includes(a.id) ? 1 : 0)).map((folder: any) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  key={folder.id}
                  onClick={() => { if (renamingFolderId !== folder.id) enterFolder(folder); }}
                  className="group cursor-pointer flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 sm:gap-2 px-2 py-3 sm:p-4 rounded-none sm:rounded-[14px] bg-white sm:bg-[#F7F6F3] dark:bg-transparent sm:dark:bg-[#0A0A2E] border-b sm:border border-[#E5E5E5] sm:border-black/5 dark:border-white/5 hover:bg-[#F7F6F3] sm:hover:border-[#040028]/20 sm:dark:hover:border-white/20 transition-all relative"
                >
                  <div className="flex flex-row sm:flex-col items-center gap-4 w-full">
                    {/* Left side on mobile: icon */}
                    <div className="relative shrink-0">
                      {pinnedFolderIds.includes(folder.id) && (
                        <div className="absolute -top-1 -left-1 text-[#040028] dark:text-white" title={t('Pinned', 'Épinglé')}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3a1 1 0 0 1 1 1v6.5l2.6 3.9a1 1 0 0 1-.83 1.6H13v6l-1 2-1-2v-6H5.23a1 1 0 0 1-.83-1.6L7 10.5V4a1 1 0 0 1 1-1h8Z" /></svg>
                        </div>
                      )}
                      <Folder color="#174CD2" size={0.8} />
                    </div>

                    {/* Center on mobile: Text */}
                    <div className="flex flex-col items-start sm:items-center min-w-0 flex-1">
                      {renamingFolderId === folder.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && renameValue.trim()) renameFolderMutation.mutate({ id: folder.id, name: renameValue.trim() });
                            if (e.key === 'Escape') setRenamingFolderId(null);
                          }}
                          onBlur={() => setRenamingFolderId(null)}
                          className="w-full text-xs font-semibold text-left sm:text-center bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[6px] px-1 py-0.5 text-[#040028] dark:text-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-sm sm:text-xs font-semibold text-left sm:text-center truncate w-full text-[#040028] dark:text-white">{folder.name}</span>
                      )}
                      <span className="text-[11px] text-[#8E8E8E] sm:hidden block mt-0.5">{folder.createdAt ? format(new Date(folder.createdAt), 'dd MMM yyyy') : t("Folder", "Dossier")}</span>
                    </div>
                  </div>

                  {/* Right side on mobile: 3-dot menu */}
                  <Popover open={folderMenuOpenFor === folder.id} onOpenChange={(open) => setFolderMenuOpenFor(open ? folder.id : null)}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation(); // Prevents click-outside from triggering immediately on touch
                        }}
                        className={cn(
                          "relative sm:absolute sm:top-1 sm:right-1 px-1.5 py-1.5 sm:px-2.5 sm:py-1.5 sm:rounded-[8px] bg-transparent sm:bg-white sm:dark:bg-[#0A0A2E] sm:border border-[#D9D9D9] sm:dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-all",
                          folderMenuOpenFor === folder.id ? "opacity-100" : "opacity-100 md:opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:hidden text-[#171717] dark:text-white pointer-events-none"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden sm:block pointer-events-none"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent onClick={(e) => e.stopPropagation()} className="w-48 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden" align="end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setFolderMenuOpenFor(null); setRenamingFolderId(folder.id); setRenameValue(folder.name); }}
                        className="w-full h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/10"
                      >
                        {t('Rename', 'Renommer')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFolderMenuOpenFor(null); togglePinFolder(folder.id); }}
                        className="w-full h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/10"
                      >
                        {pinnedFolderIds.includes(folder.id) ? t('Unpin', 'Désépingler') : t('Pin to top', 'Épingler en haut')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFolderMenuOpenFor(null); deleteFolderMutation.mutate(folder.id); }}
                        className="w-full h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/10"
                      >
                        {t('Delete', 'Supprimer')}
                      </button>
                    </PopoverContent>
                  </Popover>
                </motion.div>
              ))}

              {/* 2. Assets */}
              {assets.map((asset: any) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square rounded-[14px] bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 transition-all overflow-hidden"
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
                        playingAssetId === asset.id ? "opacity-0 group-hover:opacity-100" : "opacity-100 md:opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {playingAssetId === asset.id ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
                    </button>
                  )}

                  <div
                    className={cn(
                      "absolute inset-0 transition-all flex flex-col justify-between p-2 pointer-events-none [&>*]:pointer-events-auto",
                      optionsMenuOpenFor === asset.id ? "opacity-100" : "opacity-100 md:opacity-0 group-hover:opacity-100"
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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

                    {/* Bottom: Use — attaches directly, no section picker */}
                    <button
                      className="w-full rounded-[8px] bg-[#F7F6F3] text-[#040028] py-1.5 text-xs font-semibold"
                      onClick={() => {
                        if (onUse) {
                          onUse(asset, sections[0]?.id);
                        } else {
                          navigator.clipboard.writeText(asset.url).catch(() => { });
                          toast.success(t("URL copied", "URL copiée"));
                        }
                      }}
                    >
                      {t("Use", "Utiliser")}
                    </button>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          )}

          {!isLoading && assets.length === 0 && folders.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-[16px] border border-dashed border-black/10 dark:border-white/10 text-[#8E8E8E] font-semibold text-lg">
              {t("Folder is empty", "Le dossier est vide")}
            </div>
          )}
        </div>

        {/* Storage - Moved to bottom */}
        {!hideUsage && (
          <div className="mt-6 mb-2 mx-2 sm:mx-0 bg-[#F7F6F3] dark:bg-white/5 rounded-[14px] border border-black/5 dark:border-white/5 p-4 shrink-0">
            <div className="flex justify-between text-xs font-semibold text-[#040028] dark:text-white mb-2">
              <span>{t("Usage", "Utilisation")}</span>
              <span>{formatSize(usage)} / {formatSize(storageQuota)}</span>
            </div>
            <div className="h-2 rounded-full bg-[#E5E5E5] dark:bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-[#174CD2]" style={{ width: `${Math.min((usage / storageQuota) * 100, 100)}%` }} />
            </div>
          </div>
        )}
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

      {dropboxModalOpen && workspaceId && (
        <DropboxBrowserModal
          isOpen={dropboxModalOpen}
          onClose={() => setDropboxModalOpen(false)}
          workspaceId={workspaceId}
          onImported={() => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            queryClient.invalidateQueries({ queryKey: ['media-usage'] });
          }}
          onDisconnected={() => setDropboxModalOpen(false)}
        />
      )}
    </div>
  )
}
