'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Download, Image as ImageIcon, Film, Check, ChevronRight, ExternalLink } from 'lucide-react';
import { useAppToast } from '@/hooks/useAppToast';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';

type Tab = 'designs' | 'assets';
type ExportFormat = 'jpg' | 'png' | 'gif' | 'mp4' | 'pdf';

interface CanvaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onImported: () => void;
}

export default function CanvaImportModal({ isOpen, onClose, workspaceId, onImported }: CanvaImportModalProps) {
  const { t } = useLanguage();
  const toast = useAppToast();
  const { socket } = useSocket();
  const [tab, setTab] = useState<Tab>('designs');
  const [designs, setDesigns] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [designsContinuation, setDesignsContinuation] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<any | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('jpg');
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  // Real-time: Canva collaboration events pushed from backend webhook
  useEffect(() => {
    if (!socket || !isOpen) return;
    const handler = (data: { type: string; designId?: string }) => {
      toast.info(t(`Canva update: ${data.type}`, `Canva: ${data.type}`));
      onImported(); // refresh media library
      if (tab === 'designs') loadDesigns(true);
      else loadAssets(true);
    };
    socket.on('canva:event', handler);
    return () => { socket.off('canva:event', handler); };
  }, [socket, isOpen, tab]);

  const loadDesigns = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const cont = reset ? undefined : designsContinuation;
      const res = await api.get<any>(`/canva/designs?workspaceId=${workspaceId}${cont ? `&continuation=${cont}` : ''}`);
      setDesigns(prev => reset ? (res.designs ?? []) : [...prev, ...(res.designs ?? [])]);
      setDesignsContinuation(res.continuation);
    } catch {
      toast.error(t('Failed to load Canva designs', 'Impossible de charger les designs Canva'));
    } finally {
      setLoading(false);
    }
  }, [workspaceId, designsContinuation]);

  const loadAssets = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/canva/assets?workspaceId=${workspaceId}`);
      setAssets(prev => reset ? (res.assets ?? []) : [...prev, ...(res.assets ?? [])]);
    } catch {
      toast.error(t('Failed to load Canva assets', 'Impossible de charger les assets Canva'));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!isOpen) return;
    if (tab === 'designs') loadDesigns(true);
    else loadAssets(true);
  }, [isOpen, tab]);

  // Export flow
  const startExport = async () => {
    if (!selectedDesign) return;
    setImporting(selectedDesign.id);
    try {
      const job = await api.post<any>('/canva/export', {
        workspaceId,
        designId: selectedDesign.id,
        format: exportFormat,
      });
      setPollingJobId(job.id);
      toast.info(t('Export started — processing…', 'Export démarré…'));
    } catch {
      toast.error(t('Failed to start export', "Impossible de démarrer l'export"));
      setImporting(null);
    }
  };

  // Poll export job
  useEffect(() => {
    if (!pollingJobId) return;
    const interval = setInterval(async () => {
      try {
        const job = await api.get<any>(`/canva/export/status?workspaceId=${workspaceId}&jobId=${pollingJobId}`);
        if (job.status === 'success') {
          clearInterval(interval);
          // Save to media library
          await api.post('/canva/export/save', {
            workspaceId,
            jobId: pollingJobId,
            filename: `${selectedDesign?.title || 'canva_design'}.${exportFormat}`,
          });
          toast.success(t('Design imported to media library!', 'Design importé dans la médiathèque !'));
          setPollingJobId(null);
          setImporting(null);
          setSelectedDesign(null);
          onImported();
        } else if (job.status === 'failed') {
          clearInterval(interval);
          toast.error(t('Export failed', "L'export a échoué"));
          setPollingJobId(null);
          setImporting(null);
        }
      } catch {
        clearInterval(interval);
        setPollingJobId(null);
        setImporting(null);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pollingJobId, workspaceId, selectedDesign, exportFormat]);

  const canvaEditUrl = (designId: string) => {
    const returnUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard/${workspaceId}?canva=returned`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://eazlypost.com'}/dashboard/${workspaceId}?canva=returned`;
    return `https://www.canva.com/design/${designId}/edit?return_url=${encodeURIComponent(returnUrl)}`;
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
        <div className="flex items-center justify-between bg-[#174CD2] text-white px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">{t('Canva import', 'Import Canva')}</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/5 dark:border-white/5 flex-shrink-0">
          {(['designs', 'assets'] as Tab[]).map(tb => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={cn(
                'flex-1 py-3 text-sm font-semibold transition-all',
                tab === tb
                  ? 'text-[#174CD2] border-b-2 border-[#174CD2]'
                  : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'
              )}
            >
              {tb === 'designs' ? t('Designs (export)', 'Designs (export)') : t('Assets library', 'Bibliothèque d\'assets')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'designs' && (
            <div className="space-y-4">
              {selectedDesign ? (
                /* Export config panel */
                <div className="rounded-[14px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedDesign(null)} className="p-1.5 rounded-[8px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white transition-colors">
                      <ChevronRight size={14} className="rotate-180" />
                    </button>
                    <span className="font-semibold text-sm text-[#040028] dark:text-white truncate">{selectedDesign.title || selectedDesign.id}</span>
                  </div>

                  {selectedDesign.thumbnail?.url && (
                    <img src={selectedDesign.thumbnail.url} alt="" className="w-full max-h-40 object-contain rounded-[10px] bg-[#F5F7FA] dark:bg-white/5" />
                  )}

                  <div>
                    <p className="text-xs font-semibold text-[#8E8E8E] mb-2">{t('Export format', "Format d'export")}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['jpg', 'png', 'gif', 'mp4', 'pdf'] as ExportFormat[]).map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={cn(
                            'px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all',
                            exportFormat === fmt ? 'bg-[#174CD2] text-white' : 'bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                          )}
                        >
                          {fmt === 'mp4' ? <Film size={11} className="inline mr-1" /> : <ImageIcon size={11} className="inline mr-1" />}
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startExport}
                    disabled={!!importing}
                    className="w-full bg-[#174CD2] text-white py-2.5 rounded-[10px] font-semibold text-sm hover:bg-[#123a9e] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {importing ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    {importing ? t('Exporting…', 'Export en cours…') : t('Export & import to library', 'Exporter vers la médiathèque')}
                  </button>
                </div>
              ) : (
                /* Design grid */
                <>
                  {loading && designs.length === 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-video rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : designs.length === 0 ? (
                    <div className="py-16 text-center text-sm font-medium text-[#8E8E8E]">
                      {t('No designs found', 'Aucun design trouvé')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {designs.map(d => (
                        <div
                          key={d.id}
                          className="group relative aspect-video rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 overflow-hidden transition-all"
                        >
                          {d.thumbnail?.url
                            ? <img src={d.thumbnail.url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-[#8E8E8E]"><ImageIcon size={24} /></div>
                          }
                          <div className="absolute inset-0 bg-[#040028]/0 group-hover:bg-[#040028]/60 transition-colors flex flex-col items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedDesign(d)}
                              className="opacity-0 group-hover:opacity-100 bg-white text-[#040028] rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-white/90 transition-all"
                            >
                              <Download size={11} />{t('Import', 'Importer')}
                            </button>
                            <a
                              href={canvaEditUrl(d.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 bg-[#174CD2] text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-[#123a9e] transition-all"
                            >
                              <ExternalLink size={11} />{t('Edit in Canva', 'Éditer dans Canva')}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {designsContinuation && (
                    <button
                      onClick={() => loadDesigns(false)}
                      disabled={loading}
                      className="w-full py-2.5 rounded-[10px] border border-dashed border-black/10 dark:border-white/10 text-xs font-semibold text-[#8E8E8E] hover:bg-[#F5F7FA] dark:hover:bg-white/5 transition-all"
                    >
                      {loading ? <RefreshCw size={12} className="animate-spin inline mr-2" /> : null}
                      {t('Load more', 'Charger plus')}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'assets' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#8E8E8E]">
                {t('Previously imported from Canva', 'Importés depuis Canva')}
              </p>
              {loading && assets.length === 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="py-16 text-center text-sm font-medium text-[#8E8E8E]">
                  {t('No imported assets yet — use the Designs tab to import', 'Aucun asset importé — utilisez l\'onglet Designs')}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {assets.map((a: any) => (
                    <div key={a.id} className="group relative aspect-square rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 overflow-hidden">
                      {a.mimeType?.startsWith('video')
                        ? <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#8E8E8E]"><Film size={20} /><span className="text-[10px] font-semibold uppercase">{a.filename?.split('.').pop()}</span></div>
                        : <img src={a.url} alt={a.filename} className="w-full h-full object-cover" />
                      }
                      <div className="absolute inset-0 bg-[#040028]/0 group-hover:bg-[#040028]/60 transition-colors flex items-end justify-center pb-2">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-semibold px-1 truncate max-w-full">
                          <Check size={10} className="inline mr-0.5" />{t('In library', 'Dans la médiathèque')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
