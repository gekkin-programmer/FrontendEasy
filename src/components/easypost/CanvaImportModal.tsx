'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Download, Image as ImageIcon, Film, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';
import { useLanguage } from '@/src/context/LanguageContext';
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
  const [tab, setTab] = useState<Tab>('designs');
  const [designs, setDesigns] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [designsContinuation, setDesignsContinuation] = useState<string | undefined>();
  const [assetsContinuation, setAssetsContinuation] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<any | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('jpg');
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

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
      const cont = reset ? undefined : assetsContinuation;
      const res = await api.get<any>(`/canva/assets?workspaceId=${workspaceId}${cont ? `&continuation=${cont}` : ''}`);
      setAssets(prev => reset ? (res.assets ?? []) : [...prev, ...(res.assets ?? [])]);
      setAssetsContinuation(res.continuation);
    } catch {
      toast.error(t('Failed to load Canva assets', 'Impossible de charger les assets Canva'));
    } finally {
      setLoading(false);
    }
  }, [workspaceId, assetsContinuation]);

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

  // Asset import
  const importAsset = async (assetId: string) => {
    setImporting(assetId);
    try {
      await api.post('/canva/assets/import', { workspaceId, assetId });
      toast.success(t('Asset imported to media library!', 'Asset importé dans la médiathèque !'));
      onImported();
    } catch {
      toast.error(t('Failed to import asset', "Impossible d'importer l'asset"));
    } finally {
      setImporting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[16px_16px_0px_0px_#000] dark:shadow-[16px_16px_0px_0px_#fff] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-black dark:bg-white text-white dark:text-black px-5 py-3 border-b-4 border-black dark:border-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black uppercase tracking-widest text-sm">CANVA IMPORT</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black dark:border-white flex-shrink-0">
          {(['designs', 'assets'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all',
                tab === t
                  ? 'bg-[#3C48F5] text-white'
                  : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              {t === 'designs' ? '⬡ Designs (Export)' : '🗂 Assets Library'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'designs' && (
            <div className="space-y-4">
              {selectedDesign ? (
                /* Export config panel */
                <div className="border-2 border-black dark:border-white p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedDesign(null)} className="p-1 border-2 border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <ChevronRight size={14} className="rotate-180" />
                    </button>
                    <span className="font-black uppercase text-sm text-black dark:text-white truncate">{selectedDesign.title || selectedDesign.id}</span>
                  </div>

                  {selectedDesign.thumbnail?.url && (
                    <img src={selectedDesign.thumbnail.url} alt="" className="w-full max-h-40 object-contain border-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-800" />
                  )}

                  <div>
                    <p className="text-[10px] font-black uppercase mb-2 text-black dark:text-white">{t('Export Format', "Format d'export")}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['jpg', 'png', 'gif', 'mp4', 'pdf'] as ExportFormat[]).map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={cn(
                            'px-3 py-1 border-2 border-black dark:border-white text-[10px] font-black uppercase transition-all',
                            exportFormat === fmt ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          )}
                        >
                          {fmt === 'mp4' ? <Film size={10} className="inline mr-1" /> : <ImageIcon size={10} className="inline mr-1" />}
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startExport}
                    disabled={!!importing}
                    className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-2.5 font-black uppercase text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_#3C48F5] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    {importing ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    {importing ? t('Exporting…', 'Export en cours…') : t('Export & Import to Library', 'Exporter vers la médiathèque')}
                  </button>
                </div>
              ) : (
                /* Design grid */
                <>
                  {loading && designs.length === 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-video bg-zinc-100 dark:bg-zinc-800 animate-pulse border-2 border-black dark:border-white" />
                      ))}
                    </div>
                  ) : designs.length === 0 ? (
                    <div className="py-16 text-center text-xs font-black uppercase text-gray-400 dark:text-zinc-600">
                      {t('No designs found', 'Aucun design trouvé')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {designs.map(d => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDesign(d)}
                          className="group relative aspect-video bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white hover:border-[#3C48F5] overflow-hidden transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                          {d.thumbnail?.url
                            ? <img src={d.thumbnail.url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={24} /></div>
                          }
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-black uppercase">Select</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {designsContinuation && (
                    <button
                      onClick={() => loadDesigns(false)}
                      disabled={loading}
                      className="w-full py-2 border-2 border-dashed border-black dark:border-white text-[10px] font-black uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
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
              {loading && assets.length === 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-800 animate-pulse border-2 border-black dark:border-white" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="py-16 text-center text-xs font-black uppercase text-gray-400 dark:text-zinc-600">
                  {t('No assets found', 'Aucun asset trouvé')}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {assets.map(a => (
                    <div key={a.id} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white overflow-hidden shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                      {a.thumbnail?.url
                        ? <img src={a.thumbnail.url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={20} /></div>
                      }
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <button
                          onClick={() => importAsset(a.id)}
                          disabled={importing === a.id}
                          className="opacity-0 group-hover:opacity-100 bg-white text-black border-2 border-black px-2 py-1 text-[9px] font-black uppercase hover:bg-zinc-100 transition-all"
                        >
                          {importing === a.id
                            ? <RefreshCw size={10} className="animate-spin" />
                            : <><Check size={10} className="inline mr-1" />{t('Import', 'Importer')}</>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {assetsContinuation && (
                <button
                  onClick={() => loadAssets(false)}
                  disabled={loading}
                  className="w-full py-2 border-2 border-dashed border-black dark:border-white text-[10px] font-black uppercase hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  {t('Load more', 'Charger plus')}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
