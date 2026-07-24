'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Download, Folder, File as FileIcon, ChevronLeft, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

interface DropboxEntry {
  name: string;
  path: string;
  isFolder: boolean;
}

interface DropboxBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onImported: () => void;
  onDisconnected: () => void;
}

function normalizeEntry(raw: any): DropboxEntry {
  return {
    name: raw.name,
    path: raw.path,
    isFolder: raw.type === 'folder',
  };
}

export default function DropboxBrowserModal({ isOpen, onClose, workspaceId, onImported, onDisconnected }: DropboxBrowserModalProps) {
  const { t } = useLanguage();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [entries, setEntries] = useState<DropboxEntry[]>([]);
  const [pathStack, setPathStack] = useState<{ path: string; name: string }[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const currentPath = pathStack.length > 0 ? pathStack[pathStack.length - 1].path : '';

  const loadFiles = useCallback(async (path: string, reset = true, cursorArg?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ workspaceId });
      if (path) params.set('path', path);
      if (!reset && cursorArg) params.set('cursor', cursorArg);
      const res: any = await api.get(`/dropbox/files?${params.toString()}`);
      const body = res?.data ?? res;
      const rawEntries = body?.entries ?? [];
      const normalized = rawEntries.map(normalizeEntry);
      setEntries(prev => reset ? normalized : [...prev, ...normalized]);
      setCursor(body?.cursor);
      setHasMore(!!(body?.hasMore ?? body?.has_more));
    } catch {
      toast.error(t('Failed to load Dropbox files', 'Impossible de charger les fichiers Dropbox'));
    } finally {
      setLoading(false);
    }
  }, [workspaceId, t]);

  const loadStatus = useCallback(async () => {
    try {
      const res: any = await api.get(`/dropbox/status?workspaceId=${workspaceId}`);
      const body = res?.data ?? res;
      setAccountEmail(body?.accountEmail ?? null);
    } catch {
      // non-fatal — email is a nice-to-have in the header
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!isOpen) return;
    loadStatus();
    setPathStack([]);
    loadFiles('', true);
  }, [isOpen]);

  const enterFolder = (entry: DropboxEntry) => {
    setPathStack(prev => [...prev, { path: entry.path, name: entry.name }]);
    loadFiles(entry.path, true);
  };

  const goBack = () => {
    const next = [...pathStack];
    next.pop();
    setPathStack(next);
    loadFiles(next.length > 0 ? next[next.length - 1].path : '', true);
  };

  const handleImport = async (entry: DropboxEntry) => {
    setImporting(entry.path);
    try {
      await api.post('/dropbox/import', { workspaceId, path: entry.path });
      toast.success(t('Imported to media library!', 'Importé dans la médiathèque !'));
      onImported();
    } catch {
      toast.error(t('Import failed', "Échec de l'import"));
    } finally {
      setImporting(null);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.delete(`/dropbox/disconnect?workspaceId=${workspaceId}`);
      toast.success(t('Dropbox disconnected', 'Dropbox déconnecté'));
      onDisconnected();
      onClose();
    } catch {
      toast.error(t('Could not disconnect Dropbox', 'Impossible de déconnecter Dropbox'));
    } finally {
      setDisconnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#333333]/20 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        className="bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0061FF] text-white px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-sm flex-shrink-0">{t('Dropbox import', 'Import Dropbox')}</span>
            {accountEmail && <span className="text-xs text-white/70 truncate">{accountEmail}</span>}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              title={t('Disconnect Dropbox', 'Déconnecter Dropbox')}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              {disconnecting ? <RefreshCw size={16} className="animate-spin" /> : <LogOut size={16} />}
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 dark:border-white/5 flex-shrink-0 text-sm">
          {pathStack.length > 0 && (
            <button onClick={goBack} className="p-1.5 rounded-[8px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
          )}
          <div className="flex items-center gap-1.5 font-semibold text-[#040028] dark:text-white truncate">
            <span>{t('Root', 'Racine')}</span>
            {pathStack.map(p => (
              <React.Fragment key={p.path}>
                <span className="text-[#8E8E8E]">/</span>
                <span className="truncate">{p.name}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && entries.length === 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-sm font-medium text-[#8E8E8E]">
              {t('This folder is empty', 'Ce dossier est vide')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {entries.map(entry => (
                <div
                  key={entry.path}
                  onClick={() => { if (entry.isFolder) enterFolder(entry); }}
                  className={`flex items-center gap-3 p-3 rounded-[10px] border border-black/5 dark:border-white/5 bg-[#F7F6F3] dark:bg-white/5 transition-all ${entry.isFolder ? 'cursor-pointer hover:border-[#040028]/20 dark:hover:border-white/20' : ''}`}
                >
                  {entry.isFolder
                    ? <Folder size={18} className="text-[#8E8E8E] flex-shrink-0" />
                    : <FileIcon size={18} className="text-[#8E8E8E] flex-shrink-0" />
                  }
                  <span className="flex-1 text-sm font-medium text-[#040028] dark:text-white truncate">{entry.name}</span>
                  {!entry.isFolder && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImport(entry); }}
                      disabled={importing === entry.path}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#174CD2] text-white text-xs font-semibold hover:bg-[#123a9e] disabled:opacity-50 transition-all flex-shrink-0"
                    >
                      {importing === entry.path ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                      {t('Import', 'Importer')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {hasMore && (
            <button
              onClick={() => loadFiles(currentPath, false, cursor)}
              disabled={loading}
              className="w-full py-2.5 rounded-[10px] border border-dashed border-black/10 dark:border-white/10 text-xs font-semibold text-[#8E8E8E] hover:bg-[#F5F7FA] dark:hover:bg-white/5 transition-all"
            >
              {loading ? <RefreshCw size={12} className="animate-spin inline mr-2" /> : null}
              {t('Load more', 'Charger plus')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
