'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppToast } from '@/hooks/useAppToast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Video, X, Clock, Send,
  Tag, LayoutGrid, Plus, Copy,
  ChevronDown, Check, CornerLeftUp, Wand2, Loader2,
  Sparkles, AlertTriangle, MessageCircle, RefreshCw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { zonedTimeToUtc, utcToZonedNaiveISO } from '@/lib/timezone';
import { DateInput } from '@astryxdesign/core/DateInput';
import { type ISODateString } from '@astryxdesign/core/Calendar';
import MediaGallery from './MediaGallery';
import { usePlatformMode } from './composer/usePlatformMode';
import { PlatformContextBar } from './composer/PlatformContextBar';
import { BroadcastPanel } from './composer/BroadcastPanel';
import { PlatformSpecificPanels } from './composer/PlatformSpecificPanels';
import { PlatformIcon } from './composer/PlatformIcon';
import { BROADCAST_IDS } from './composer/platformConfig';
import { useLanguage } from '@/context/LanguageContext';

// --- TYPES ---
type AssetType = 'image' | 'video' | 'folder';
interface LibraryItem { id: string; type: AssetType; name?: string; url?: string; parentId: string | null; }
interface TemplateItem { id: number; title: string; content: string; }

interface ComposerProps {
  workspaceId: string;
  accounts: any[];
  postToEdit?: any;
  initialDate?: string;
  isPreviewActive?: boolean;
  onPreviewToggle?: () => void;
  onPreviewDataChange?: (data: { text: string; mediaPreviews: string[]; mediaTypes: ('image' | 'video')[]; selectedAccountIds: string[]; tiktokHashtags?: string }) => void;
  workspaceTimezone?: string;
  onSchedule: (
    content: string,
    date?: Date,
    mediaIds?: string[],
    status?: 'DRAFT' | 'SCHEDULED' | 'REVIEW',
    selectedAccountIds?: string[],
    postId?: string,
    workspaceId?: string,
    platformMeta?: Record<string, any>
  ) => Promise<void>;
}

const CATEGORIES = ['General', 'Technology', 'Marketing', 'Personal', 'News', 'Meme', 'Educational'];

// 15-minute increments, 12h display — click-to-select only, no typing.
const TIME_SLOTS: { value: string; label: string }[] = Array.from({ length: 96 }, (_, i) => {
  const totalMinutes = i * 15;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const value = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 < 12 ? 'AM' : 'PM';
  const label = `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
  return { value, label };
});

const AI_TONES = [
  { id: 'PROFESSIONAL', label: 'PROFESSIONAL ' },
  { id: 'CASUAL', label: 'CASUAL ' },
  { id: 'CAMFRANGLAIS', label: 'CAMFRANGLAIS ' },
  { id: 'NOUCHI', label: 'NOUCHI ' },
  { id: 'URGENT', label: 'URGENT ' },
];

// --- NEU COMPONENTS ---
const NeuButton = ({ children, onClick, className = "", variant = "default", disabled = false, ...props }: any) => {
  const baseStyles = "relative font-semibold text-sm rounded-[10px] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  const variants = {
    default: "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40",
    primary: `bg-[#174CD2] text-white hover:bg-[#123a9e]`,
    ghost: "bg-transparent hover:bg-black/[0.03] dark:hover:bg-white/5"
  };
  return <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.default, className)} {...props}>{children}</button>;
};

const NeuModal = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040028]/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden">
                <div className="bg-[#174CD2] text-white px-5 py-4 flex justify-between items-center"><span className="font-bold">{title}</span><button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X size={20}/></button></div>
                <div className="p-6 text-[#040028] dark:text-white">{children}</div>
            </motion.div>
        </div>
    );
};

const NeuInput = (props: any) => (
  <input
    {...props}
    className={cn("bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 py-2.5 font-medium text-sm placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all w-full text-[#040028] dark:text-white", props.className)}
  />
);

const RetroFolder = ({ name, onClick }: { name: string, onClick: () => void }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col items-center gap-2 p-2 rounded-[10px] hover:bg-[#174CD2]/8 transition-colors">
    <div className="relative w-16 h-12"><div className="absolute top-0 left-0 w-6 h-3 bg-[#F5C542] rounded-t-md z-0"></div><div className="absolute bottom-0 w-full h-10 bg-[#FFE9A8] rounded-md z-10 group-hover:brightness-95 transition-all flex items-center justify-center"></div></div>
    <span className="text-[11px] font-medium text-center max-w-full truncate w-full text-[#040028] dark:text-white">{name}</span>
  </div>
);
const ToolButton = ({ icon: Icon, onClick, tooltip }: any) => (<button onClick={onClick} title={tooltip} className="shrink-0 p-2.5 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-all text-[#040028] dark:text-white"><Icon size={18} /></button>);

const AiSchedulerContent = ({ workspaceId, platform, onSelect }: { workspaceId: string, platform: string, onSelect: (hour: number) => void }) => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['smart-scheduling', workspaceId, platform],
    queryFn: () => api.get<any>(`/ai/smart-scheduling/suggestions?workspaceId=${workspaceId}&platform=${platform}`),
  });

  return (
    <div className="flex flex-col font-sans">
      <div className="bg-[#174CD2] text-white p-3 text-xs font-semibold flex items-center gap-2">
        <Sparkles size={14} /> {t("Best posting times", "Meilleurs horaires de publication")}
      </div>
      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <RefreshCw size={12} className="animate-spin" /> {t("Analyzing audience patterns...", "Analyse des tendances d'audience...")}
          </div>
        ) : (
          <>
            <p className="text-[11px] text-gray-400 leading-tight mb-2">{t("Based on your historical engagement and industry trends.", "Basé sur votre engagement historique et les tendances du secteur.")}</p>
            {data?.suggestions?.map((s: any, i: number) => (
              <button
                key={i}
                onClick={() => onSelect(s.hour)}
                className="w-full flex items-center justify-between p-2.5 rounded-[10px] hover:bg-[#174CD2]/8 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400 group-hover:text-[#174CD2]" />
                  <span className="text-sm font-semibold">{s.hour}:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    s.confidence === 'high' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {s.confidence === 'high' ? t("High confidence", "Haute confiance") : t("Medium confidence", "Confiance moyenne")}
                  </span>
                  <span className="text-xs font-semibold text-[#174CD2]">{t("Select", "Choisir")}</span>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default function Composer({ onSchedule, accounts = [], postToEdit, initialDate, workspaceId, isPreviewActive, onPreviewToggle, onPreviewDataChange, workspaceTimezone = 'UTC' }: ComposerProps) {
  const { t } = useLanguage();
  const toast = useAppToast();

  /* ---- State ---- */
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date>();
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Populate from postToEdit
  useEffect(() => {
    if (postToEdit) {
      setText(postToEdit.content || '');
      setDate(postToEdit.scheduledFor ? new Date(postToEdit.scheduledFor) : undefined);
      if (postToEdit.mediaUrls) {
        setMediaPreviews(postToEdit.mediaUrls);
        setMediaTypes(postToEdit.mediaUrls.map((url: string) =>
          /\.(mp4|webm|ogg|mov|avi|mkv|m4v)(\?|$|#)/i.test(url) ? 'video' : 'image'
        ));
      }
      if (postToEdit.socialAccountIds) { hasAutoSelectedRef.current = true; setSelectedAccountIds(postToEdit.socialAccountIds); }
    } else {
      // Reset if null (e.g. cancelled edit)
      setText(''); setDate(undefined); setMediaPreviews([]); setMediaTypes([]);
    }
  }, [postToEdit]);

  // Prefill the schedule date from a calendar "quick create" click — only when not editing an existing post
  useEffect(() => {
    if (!postToEdit && initialDate) {
      setDate(zonedTimeToUtc(`${initialDate}T09:00`, workspaceTimezone));
    }
  }, [initialDate, postToEdit, workspaceTimezone]);
  const [category, setCategory] = useState('General');

  // Media State
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const hasAutoSelectedRef = useRef(false);

  // UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsLibraryOpen(true);
    }
  }, []);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // AI Params
  const [aiContext, setAiContext] = useState("");
  const [aiTone, setAiTone] = useState(AI_TONES[0].id);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Modals / Data
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [inputFolderName, setInputFolderName] = useState("");
  const [inputTemplateName, setInputTemplateName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [libraryData, setLibraryData] = useState<LibraryItem[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<TemplateItem[]>([{ id: 1, title: 'HASHTAG_SET_1', content: '#Growth #SaaS #Tech #Africa' }]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  // Platform-specific state
  const [ytTitle, setYtTitle] = useState('');
  const [ytCategory, setYtCategory] = useState('');
  const [ytTags, setYtTags] = useState<string[]>([]);
  const [pinTitle, setPinTitle] = useState('');
  const [pinDestUrl, setPinDestUrl] = useState('');
  const [pinBoard, setPinBoard] = useState('');
  const [liArticleMode, setLiArticleMode] = useState(false);
  const [firstComment, setFirstComment] = useState('');
  const [altText, setAltText] = useState('');
  // TikTok compliance fields (Direct Post API UX requirements)
  const [tiktokTitle, setTiktokTitle] = useState('');
  const [tiktokPrivacyLevel, setTiktokPrivacyLevel] = useState('');
  const [tiktokAllowComment, setTiktokAllowComment] = useState(false);
  const [tiktokDuet, setTiktokDuet] = useState(false);
  const [tiktokStitch, setTiktokStitch] = useState(false);
  const [tiktokDisclosure, setTiktokDisclosure] = useState(false);
  const [tiktokYourBrand, setTiktokYourBrand] = useState(false);
  const [tiktokBrandContent, setTiktokBrandContent] = useState(false);
  const [tiktokHashtags, setTiktokHashtags] = useState('');
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Broadcast lane state
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSendNow, setBroadcastSendNow] = useState(true);
  const [broadcastScheduledTime, setBroadcastScheduledTime] = useState<Date | undefined>();

  // Auto-select accounts — once, on first load only. Re-running this every time the
  // `accounts` array changes (e.g. a new account gets connected elsewhere) would silently
  // re-target every post at every active platform and pop open that platform's options
  // panel unasked, so a newly-connected account no longer changes an already-touched selection.
  useEffect(() => {
    if (!hasAutoSelectedRef.current && accounts.length > 0 && selectedAccountIds.length === 0) {
      hasAutoSelectedRef.current = true;
      setSelectedAccountIds(accounts.filter(a => a.isActive !== false).map(a => a.id));
    }
  }, [accounts]);

  // Sync composer data to parent preview panel in real-time
  const previewDataChangeRef = useRef(onPreviewDataChange);
  previewDataChangeRef.current = onPreviewDataChange;
  useEffect(() => {
    previewDataChangeRef.current?.({ text, mediaPreviews, mediaTypes, selectedAccountIds, tiktokHashtags });
  }, [text, mediaPreviews, mediaTypes, selectedAccountIds, tiktokHashtags]);

  // Derived platform mode
  const platformMode = usePlatformMode(selectedAccountIds, accounts, text);

  // Collapse platform-specific panels whenever the selected targets change — never auto-expand
  useEffect(() => {
    setExpandedPanels(new Set());
  }, [selectedAccountIds]);

  // ➤ LOGIC: FETCH MEDIA LIBRARY
  const fetchLibrary = async () => {
    try {
        const res = await api.get<any>('/media');
        // Handle both { data: [...] } and direct [...] array responses
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

        const formattedMedia = list.map((m: any) => ({
            id: m.id,
            type: (m.mimeType?.includes('video') ? 'video' : 'image') as AssetType,
            url: m.url,
            name: m.filename,
            parentId: null
        }));
        setLibraryData(formattedMedia);
    } catch (e) { console.error("Library fetch failed", e); }
  };

  useEffect(() => { if (isLibraryOpen) fetchLibrary(); }, [isLibraryOpen]);

  // ➤ LOGIC: UPLOAD MEDIA (Phase 5 Backend)
  const uploadSingleFile = async (fileToUpload: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      try {
          // Use api.post with headers
          const res = await api.post<any>('/media/upload', formData);

          await fetchLibrary();
          // Backend returns { message, media: { id, ... } }
          return res.id || res.media?.id || res.data?.id || res.data?.media?.id;
      } catch (e) {
          return null;
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setLocalFiles(prev => [...prev, ...selected]);
      const newPreviews = selected.map(file => URL.createObjectURL(file));
      const newTypes = selected.map(file => file.type.startsWith('video/') ? 'video' : 'image') as ('image' | 'video')[];
      setMediaPreviews(prev => [...prev, ...newPreviews]);
      setMediaTypes(prev => [...prev, ...newTypes]);
    }
  };

  const handleSelectFromLibrary = (item: LibraryItem) => {
      if (!selectedMediaIds.includes(item.id)) {
          setSelectedMediaIds(prev => [...prev, item.id]);
          setMediaPreviews(prev => [...prev, item.url || '']);
          setMediaTypes(prev => [...prev, item.type === 'video' ? 'video' : 'image']);
      }
  };

  const removeMedia = (index: number) => {
      setMediaPreviews(prev => prev.filter((_, i) => i !== index));
      setMediaTypes(prev => prev.filter((_, i) => i !== index));
  };

  // ➤ LOGIC: AI GENERATION
  const handleAiGenerate = async () => {
    if (!aiContext.trim()) return;
    setIsAiGenerating(true);

    try {
      const res = await api.post<any>('/ai/test-copywriting', {
        product: aiContext,
        tone: aiTone,
      });

      const generatedContent = res.content || res.data?.content;
      const aiUsageCount = res.aiUsageCount || res.data?.aiUsageCount;
      if (!generatedContent) throw new Error("Empty response from AI");

      // Typewriter Effect
      const prefix = text ? "\n\n" : "";
      const textToType = prefix + generatedContent;

      let charIndex = 0;
      const speed = 15; // ms per char

      const intervalId = setInterval(() => {
        setText((prev) => prev + textToType.charAt(charIndex));
        charIndex++;
        if (charIndex === textToType.length) {
            clearInterval(intervalId);
            setIsAiGenerating(false);
            setIsAiOpen(false);
            setAiContext("");

            if (aiUsageCount >= 8 && aiUsageCount < 10) {
              setTimeout(() => {}, 1000);
            }
        }
      }, speed);

    } catch (e) {
      console.error(e);
      setIsAiGenerating(false);
    }
  };

  // Broadcast submit
  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    if (!broadcastSendNow && !broadcastScheduledTime) return;
    const broadcastAccIds = selectedAccountIds.filter((id) => {
      const acc = accounts.find((a) => a.id === id);
      return acc && BROADCAST_IDS.has((acc.platform as string)?.toLowerCase());
    });
    if (broadcastAccIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSchedule(
        broadcastText,
        broadcastSendNow ? undefined : broadcastScheduledTime,
        [],
        'SCHEDULED',
        broadcastAccIds,
        undefined,
        workspaceId,
      );
      setBroadcastText('');
      toast.success(t('BROADCAST SENT', 'DIFFUSION ENVOYÉE'));
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  // TikTok derived values
  const tiktokAccount = accounts.find(a => selectedAccountIds.includes(a.id) && a.platform === 'TIKTOK');
  const tiktokCreatorNickname = tiktokAccount?.username as string | undefined;
  const tiktokHasVideo = mediaTypes.some(t => t === 'video');
  const hasTikTokInPost = platformMode.postPlatforms.some(p => p.id === 'tiktok');
  const tiktokDisclosureInvalid = hasTikTokInPost && tiktokDisclosure && !tiktokYourBrand && !tiktokBrandContent;

  // Smart scheduling availability — only show AI SCHEDULER button when data exists
  const selectedPlatform = accounts.find(a => selectedAccountIds.includes(a.id))?.platform ?? 'FACEBOOK';
  const { data: schedulingHints } = useQuery({
    queryKey: ['smart-scheduling', workspaceId, selectedPlatform],
    queryFn: () => api.get<any>(`/ai/smart-scheduling/suggestions?workspaceId=${workspaceId}&platform=${selectedPlatform}`),
    enabled: selectedAccountIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const hasSchedulingData = (schedulingHints?.suggestions?.length ?? 0) > 0;

  // ➤ SCHEDULE DATE/TIME — split into a real calendar DateInput plus a
  // click-only time dropdown (no typing), both operating in workspace tz.
  const naiveScheduled = date ? utcToZonedNaiveISO(date, workspaceTimezone) : undefined;
  const scheduleDateOnly = naiveScheduled ? naiveScheduled.slice(0, 10) : undefined;
  const scheduleTimeOnly = naiveScheduled ? naiveScheduled.slice(11, 16) : undefined;
  const selectedTimeSlot = TIME_SLOTS.find(s => s.value === scheduleTimeOnly);

  const handleScheduleDateChange = (value: string | undefined) => {
    if (!value) { setDate(undefined); return; }
    setDate(zonedTimeToUtc(`${value}T${scheduleTimeOnly || '09:00'}`, workspaceTimezone));
  };
  const handleScheduleTimeChange = (value: string) => {
    const day = scheduleDateOnly || utcToZonedNaiveISO(new Date(), workspaceTimezone).slice(0, 10);
    setDate(zonedTimeToUtc(`${day}T${value}`, workspaceTimezone));
    setIsTimeOpen(false);
  };

  // ➤ LOGIC: SUBMIT
  const handleSubmit = async (action: 'queue' | 'execute' | 'review') => {
    setSubmitAttempted(true);
    if (!text && mediaPreviews.length === 0) {
      toast.error(t('Write something or add media before publishing.', 'Ajoutez du texte ou un média avant de publier.'));
      return;
    }
    if (isPreviewActive && onPreviewToggle) onPreviewToggle();

    // YouTube title validation
    if (platformMode.requiresTitle && !ytTitle) {
      setExpandedPanels(prev => new Set([...prev, 'youtube']));
      return;
    }

    // TikTok required field validation
    if (hasTikTokInPost) {
      if (!tiktokTitle || !tiktokPrivacyLevel || tiktokDisclosureInvalid) {
        setExpandedPanels(prev => new Set([...prev, 'tiktok']));
        return;
      }
    }

    // Past Date Validation
    if (date && date < new Date()) {
        toast.error(t('The selected date is in the past.', 'La date sélectionnée est dans le passé.'));
        return;
    }

    // In split mode, only post-lane accounts go here
    const postAccountIds = platformMode.mode === 'split'
      ? selectedAccountIds.filter((id) => {
          const acc = accounts.find((a) => a.id === id);
          return acc && !BROADCAST_IDS.has((acc.platform as string)?.toLowerCase());
        })
      : selectedAccountIds;

    const targets = postAccountIds.length > 0 ? postAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
    if (targets.length === 0) {
      toast.error(t('Connect or select at least one social account before publishing.', 'Connectez ou sélectionnez au moins un compte social avant de publier.'));
      return;
    }

    setIsSubmitting(true);
    try {
        const finalMediaIds = [...selectedMediaIds];
        const finalContent = text;

        // Upload local files
        if (localFiles.length > 0) {
            for (const file of localFiles) {
                const uploadedId = await uploadSingleFile(file);
                if (uploadedId) finalMediaIds.push(uploadedId);
            }
        }

        let status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT';
        if (action === 'review') status = 'REVIEW';
        else if (action === 'execute') status = 'SCHEDULED';
        else if (action === 'queue') status = 'SCHEDULED';

        // Assemble platform metadata
        const platformMeta: Record<string, any> = {};
        if (ytTitle) platformMeta.youtube = { title: ytTitle, category: ytCategory || undefined, tags: ytTags.length > 0 ? ytTags : undefined };
        if (pinBoard || pinTitle || pinDestUrl) platformMeta.pinterest = { board: pinBoard || undefined, title: pinTitle || undefined, destinationUrl: pinDestUrl || undefined };
        if (liArticleMode) platformMeta.linkedin = { articleMode: true };
        if (firstComment) platformMeta.firstComment = firstComment;
        if (hasTikTokInPost) platformMeta.tiktok = {
          title: tiktokTitle,
          privacyLevel: tiktokPrivacyLevel,
          allowComment: tiktokAllowComment,
          duet: tiktokDuet,
          stitch: tiktokStitch,
          disclosure: tiktokDisclosure,
          yourBrand: tiktokDisclosure ? tiktokYourBrand : false,
          brandContent: tiktokDisclosure ? tiktokBrandContent : false,
          hashtags: tiktokHashtags || undefined,
        };
        if (!hasTikTokInPost && tiktokHashtags) platformMeta.tiktok = { hashtags: tiktokHashtags };
        if (altText) platformMeta.altText = altText;

        await onSchedule(
            finalContent,
            action === 'queue' ? (date || new Date()) : new Date(),
            finalMediaIds,
            status,
            targets,
            postToEdit?.id,
            workspaceId,
            Object.keys(platformMeta).length > 0 ? platformMeta : undefined,
        );

        setText(''); setDate(undefined); setLocalFiles([]); setSelectedMediaIds([]); setMediaPreviews([]); setMediaTypes([]);
        setTiktokTitle(''); setTiktokPrivacyLevel(''); setTiktokAllowComment(false); setTiktokDuet(false); setTiktokStitch(false);
        setTiktokDisclosure(false); setTiktokYourBrand(false); setTiktokBrandContent(false); setTiktokHashtags('');
        setSubmitAttempted(false);
    } catch { } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-[#040028] dark:text-white transition-colors">
      <div className="w-full bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-none relative overflow-hidden transition-all">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" multiple className="hidden" />

        {/* HEADER */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/5 transition-colors">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-bold uppercase tracking-widest mr-2 text-[#8E8E8E]">{t("Targets", "Cibles")}</span>

            {accounts.filter(a => selectedAccountIds.includes(a.id)).map((acc) => {
                const isExpired = acc.isActive === false;
                // TEMP PREVIEW — real accounts don't carry a profile picture from
                // the platform yet (needs backend/OAuth work to fetch and store
                // one); fall back to a placeholder instead of a bare letter.
                const avatarSrc = acc.avatar || `https://i.pravatar.cc/64?u=${acc.id}`;
                return (
                  <div key={acc.id} className="relative w-8 h-8 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A2E] flex items-center justify-center" title={isExpired ? t('Connection expired', 'Connexion expirée') : acc.username}>
                    <span className="text-xs font-bold text-[#040028] dark:text-white">{acc.username?.[0]?.toUpperCase()}</span>
                    <img
                      src={avatarSrc}
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      alt=""
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 z-10 flex items-center justify-center"><PlatformIcon platform={acc.platform} size={9} /></div>
                    {isExpired && <div className="absolute inset-0 rounded-full bg-red-600/80 flex items-center justify-center z-20 cursor-not-allowed"><AlertTriangle className="w-4 h-4 text-white" strokeWidth={3} /></div>}
                  </div>
                );
            })}

            <Popover>
              <PopoverTrigger asChild>
                <button className={cn("w-8 h-8 flex-shrink-0 rounded-full border border-dashed border-black/20 dark:border-white/20 hover:bg-[#174CD2]/8 flex items-center justify-center transition-all", selectedAccountIds.length === 0 ? "bg-white" : "bg-white dark:bg-[#0A0A2E]")}>
                  <Plus size={14} strokeWidth={2.5} className="text-[#040028] dark:text-white" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-[14px] overflow-hidden" align="start" side="right" sideOffset={8}>
                <div className="bg-[#174CD2] text-white p-2 px-3 text-[10px] font-bold uppercase tracking-wide">{t("Available accounts", "Comptes disponibles")}</div>
                <div className="max-h-60 overflow-y-auto">
                  {accounts.map((acc) => {
                    const isExpired = acc.isActive === false;
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <div key={acc.id} onClick={() => { if (isExpired) { return; } setSelectedAccountIds((prev) => prev.includes(acc.id) ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]); }} className={cn("flex items-center gap-3 p-3 border-b border-black/5 dark:border-white/5 last:border-0 transition-colors", isExpired ? "bg-red-50 dark:bg-red-900/20 opacity-70 cursor-not-allowed" : "hover:bg-[#174CD2]/8 cursor-pointer")}>
                        <div className={cn("w-4 h-4 rounded-[4px] border flex items-center justify-center", isExpired ? "border-red-500" : "border-black/20 dark:border-white/20")}>{isExpired ? (<AlertTriangle className="w-3 h-3 text-red-500" />) : (isSelected && <div className="w-2 h-2 rounded-[2px] bg-[#174CD2]" />)}</div>
                        <div className="flex-1"><div className={cn("text-xs font-semibold text-[#040028] dark:text-white", isExpired && "text-red-600")}>{acc.username}</div><div className="text-[10px] text-[#8E8E8E]">{acc.platform} {isExpired && `(${t("expired", "expiré")})`}</div></div>
                        <PlatformIcon platform={acc.platform} size={14} />
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
             <button onClick={() => setIsLibraryOpen(v => !v)} className="hidden md:flex items-center gap-2 px-3 py-1.5 font-semibold text-xs rounded-[10px] transition-all bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-[#D9D9D9] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10">
                <LayoutGrid size={12} /> <span className="hidden sm:inline">{isLibraryOpen ? t('Close library', 'Fermer bib.') : t('Open library', 'Ouvrir bib.')}</span>
             </button>
          </div>
        </div>

        {/* PLATFORM CONTEXT BAR */}
        <PlatformContextBar
          platformMode={platformMode}
          textLength={text.length}
          broadcastLength={broadcastText.length}
        />

        {/* AI PANEL */}
        <AnimatePresence>
            {isAiOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-black/5 dark:border-white/5 bg-[#F5F7FA] dark:bg-black/20 p-4 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4 mb-3">
                        <div className="flex-1">
                            <label className="text-xs font-semibold mb-1 block text-[#040028] dark:text-white">{t("What are we selling?", "Qu'est-ce qu'on vend?")}</label>
                            <NeuInput value={aiContext} onChange={(e: any) => setAiContext(e.target.value)} placeholder={t("E.g. 50% off sneakers in Douala...", "Ex. 50% de réduction sur les baskets à Douala...")} />
                        </div>
                        <div className="w-full sm:w-1/3">
                            <label className="text-xs font-semibold mb-1 block text-[#040028] dark:text-white">{t("Tone", "Ton")}</label>
                            <div className="relative">
                                <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-full bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 py-2.5 text-sm font-medium appearance-none focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 text-[#040028] dark:text-white cursor-pointer pr-8 transition-all">
                                    {AI_TONES.map(tone => <option key={tone.id} value={tone.id}>{tone.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#8E8E8E]" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <NeuButton onClick={handleAiGenerate} disabled={isAiGenerating} variant="primary" className="px-4 py-2 w-full sm:w-auto">
                            {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                            {isAiGenerating ? t("Writing...", "Rédaction...") : t("Generate copy", "Générer le texte")}
                        </NeuButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* BROADCAST MODE — full broadcast panel, no post lane */}
        {platformMode.mode === 'broadcast' && (
          <BroadcastPanel
            broadcastPlatforms={platformMode.broadcastPlatforms}
            broadcastAccounts={accounts.filter(a =>
              selectedAccountIds.includes(a.id) &&
              BROADCAST_IDS.has((a.platform as string)?.toLowerCase())
            )}
            text={broadcastText}
            setText={setBroadcastText}
            sendNow={broadcastSendNow}
            setSendNow={setBroadcastSendNow}
            scheduledTime={broadcastScheduledTime}
            setScheduledTime={setBroadcastScheduledTime}
            isSubmitting={isSubmitting}
            onBroadcast={handleBroadcast}
          />
        )}

        {/* SPLIT MODE — broadcast lane on top */}
        {platformMode.mode === 'split' && (
          <>
            <BroadcastPanel
              asLane
              broadcastPlatforms={platformMode.broadcastPlatforms}
              broadcastAccounts={accounts.filter(a =>
                selectedAccountIds.includes(a.id) &&
                BROADCAST_IDS.has((a.platform as string)?.toLowerCase())
              )}
              text={broadcastText}
              setText={setBroadcastText}
              sendNow={broadcastSendNow}
              setSendNow={setBroadcastSendNow}
              scheduledTime={broadcastScheduledTime}
              setScheduledTime={setBroadcastScheduledTime}
              isSubmitting={isSubmitting}
              onBroadcast={handleBroadcast}
            />
            {/* Post lane header + sync link */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-black/5 dark:border-white/5 bg-[#F7F6F3] dark:bg-black/20">
              <div className="flex items-center gap-2">
                {platformMode.postPlatforms.map(p => (
                  <span key={p.id} className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E]">{p.label}</span>
                ))}
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E]">{t("Post", "Publication")}</span>
              </div>
            </div>
          </>
        )}

        {/* COMPOSER BODY — shown for post + split modes */}
        {(platformMode.mode === 'post' || platformMode.mode === 'split') && (
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 bg-white dark:bg-[#0A0A2E] transition-colors">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Write your content here...", "Rédigez votre contenu ici...")} className={cn("border-none shadow-none resize-none focus-visible:ring-0 text-lg font-medium placeholder:text-[#8E8E8E] dark:placeholder:text-zinc-600 bg-transparent p-0 rounded-none leading-relaxed text-[#040028] dark:text-white", mediaPreviews.length > 0 ? "min-h-[100px]" : "min-h-[180px] md:min-h-[340px]")} />

          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {mediaPreviews.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-[14px] overflow-hidden group bg-[#F5F7FA] dark:bg-zinc-800 border border-black/5 dark:border-white/10">
                  {mediaTypes[idx] === 'video' ? (
                    <video src={url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={url} className="w-full h-full object-cover" alt="" />
                  )}
                  <button onClick={() => removeMedia(idx)} className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"><X size={12} strokeWidth={2.5} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Platform-specific panels (YouTube, Pinterest, LinkedIn, IG+TikTok) */}
          <PlatformSpecificPanels
            platformMode={platformMode}
            expandedPanels={expandedPanels}
            onTogglePanel={(id) => setExpandedPanels(prev => {
              const next = new Set(prev);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            })}
            submitAttempted={submitAttempted}
            ytTitle={ytTitle} setYtTitle={setYtTitle}
            ytCategory={ytCategory} setYtCategory={setYtCategory}
            ytTags={ytTags} setYtTags={setYtTags}
            pinTitle={pinTitle} setPinTitle={setPinTitle}
            pinDestUrl={pinDestUrl} setPinDestUrl={setPinDestUrl}
            pinBoard={pinBoard} setPinBoard={setPinBoard}
            liArticleMode={liArticleMode} setLiArticleMode={setLiArticleMode}
            firstComment={firstComment} setFirstComment={setFirstComment}
            altText={altText} setAltText={setAltText}
            tiktokCreatorNickname={tiktokCreatorNickname}
            tiktokTitle={tiktokTitle} setTiktokTitle={setTiktokTitle}
            tiktokPrivacyLevel={tiktokPrivacyLevel} setTiktokPrivacyLevel={setTiktokPrivacyLevel}
            tiktokAllowComment={tiktokAllowComment} setTiktokAllowComment={setTiktokAllowComment}
            tiktokDuet={tiktokDuet} setTiktokDuet={setTiktokDuet}
            tiktokStitch={tiktokStitch} setTiktokStitch={setTiktokStitch}
            tiktokDisclosure={tiktokDisclosure} setTiktokDisclosure={setTiktokDisclosure}
            tiktokYourBrand={tiktokYourBrand} setTiktokYourBrand={setTiktokYourBrand}
            tiktokBrandContent={tiktokBrandContent} setTiktokBrandContent={setTiktokBrandContent}
            tiktokHashtags={tiktokHashtags} setTiktokHashtags={setTiktokHashtags}
            tiktokHasVideo={tiktokHasVideo}
          />

          {/* Desktop & Mobile Responsive Footer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 py-4 px-4 md:px-6 -mx-4 md:-mx-6 border-t border-black/5 dark:border-white/5 gap-4 bg-[#F7F6F3] dark:bg-transparent transition-colors">
            
            {/* Horizontal scroll on mobile, flex-row on desktop for tools */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 md:pb-0 px-1 shrink-0 w-full md:w-auto">
              <ToolButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip={t("Upload image", "Télécharger une image")} />
              <ToolButton icon={Video} onClick={() => fileInputRef.current?.click()} tooltip={t("Upload video", "Télécharger une vidéo")} />
              <ToolButton icon={Wand2} onClick={() => setIsAiOpen(v => !v)} tooltip={t("AI Assistant", "Assistant IA")} />
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}><PopoverTrigger asChild><button className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 text-xs font-semibold whitespace-nowrap text-[#040028] dark:text-white"><Tag size={12} /> {category} <ChevronDown size={12} className={cn('opacity-50 transition-transform', isCategoryOpen && 'rotate-180')} /></button></PopoverTrigger><PopoverContent className="w-64 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden" align="start">{CATEGORIES.map((cat) => (<button key={cat} onClick={() => { setCategory(cat); setIsCategoryOpen(false); }} className={cn('w-full flex items-center gap-3 h-9 px-4 text-left transition-colors text-sm font-medium text-[#171717] dark:text-white', cat === category ? 'bg-[#F7F6F3] dark:bg-white/5' : 'hover:bg-[#F7F6F3] dark:hover:bg-white/10')}><span className="flex-1 truncate">{cat}</span>{category === cat && <Check size={16} className="text-[#171717] dark:text-white flex-shrink-0" />}</button>))}</PopoverContent></Popover>
              
              {/* On mobile, also push Action Buttons here into the scrollable row */}
              <div className="flex md:hidden items-center gap-2 border-l border-black/10 dark:border-white/10 pl-2">
                  <button onClick={() => onPreviewToggle ? onPreviewToggle() : setIsPreviewOpen(true)} className={cn("shrink-0 px-3 py-2 font-semibold text-xs rounded-[10px] transition-all flex items-center gap-1.5", isPreviewActive ? "bg-[#040028] dark:bg-white text-white dark:text-[#040028]" : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10")}>{t("Preview", "Aperçu")}</button>
                  <button onClick={() => handleSubmit('review')} disabled={isSubmitting} className="shrink-0 px-3 py-2 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white font-semibold text-xs rounded-[10px] border border-black/10 dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-all flex items-center gap-1.5">{t("Review", "Révision")}</button>
                  <NeuButton onClick={() => handleSubmit(date ? 'queue' : 'execute')} disabled={isSubmitting || tiktokDisclosureInvalid} title={tiktokDisclosureInvalid ? 'You need to indicate if your content promotes yourself, a third party, or both' : undefined} variant="primary" className="shrink-0 px-4 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-[#D9D9D9] dark:border-white/10 shadow-none hover:bg-[#F7F6F3] dark:hover:bg-[#0A0A2E]">
                      {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (date && <Clock className="w-4 h-4 mr-2"/>)}
                      {postToEdit ? t('Update', 'Mettre à jour') : (date ? t('Schedule', 'Planifier') : t('Publish', 'Publier'))}
                  </NeuButton>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full overflow-x-auto scrollbar-hide flex-nowrap">
                          {hasSchedulingData && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="shrink-0 px-3 py-2 bg-white dark:bg-[#0A0A2E] hover:border-[#174CD2]/40 text-[#040028] dark:text-white font-semibold text-xs rounded-[10px] border border-black/10 dark:border-white/10 transition-all flex items-center gap-1.5">
                                <Sparkles size={14} className="text-[#174CD2] animate-pulse" /> {t("AI scheduler", "Planif. IA")}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-[14px] overflow-hidden" align="center" side="top">
                              <AiSchedulerContent
                                workspaceId={workspaceId}
                                platform={selectedPlatform}
                                onSelect={(hour) => {
                                  const newDate = date || new Date();
                                  newDate.setHours(hour);
                                  newDate.setMinutes(0);
                                  setDate(new Date(newDate));
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          )}

                          <div className="shrink-0 min-w-[140px]">
                            <DateInput
                              label={t('Date', 'Date')}
                              isLabelHidden
                              size="md"
                              hasClear
                              placeholder="DD/MM/YYYY"
                              value={scheduleDateOnly as ISODateString | undefined}
                              onChange={(value) => handleScheduleDateChange(value)}
                            />
                          </div>

                          <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
                            <PopoverTrigger asChild>
                              <button
                                className="shrink-0 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] text-[#040028] dark:text-white hover:border-[#174CD2]/40 transition-all flex items-center gap-2 h-[38px]"
                              >
                                <Clock size={12} />
                                {selectedTimeSlot ? selectedTimeSlot.label : t('Select a time', 'Choisir une heure')}
                                <ChevronDown size={12} className={cn('opacity-50 transition-transform', isTimeOpen && 'rotate-180')} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 overflow-hidden" align="start">
                              <div className="max-h-60 overflow-y-auto py-1">
                                {TIME_SLOTS.map((slot) => (
                                  <button
                                    key={slot.value}
                                    type="button"
                                    onClick={() => handleScheduleTimeChange(slot.value)}
                                    className={cn(
                                      'w-full flex items-center justify-between gap-2 h-8 px-3 text-left transition-colors text-xs font-medium text-[#040028] dark:text-white',
                                      slot.value === scheduleTimeOnly ? 'bg-[#F7F6F3] dark:bg-white/5' : 'hover:bg-[#F7F6F3] dark:hover:bg-white/10'
                                    )}
                                  >
                                    <span>{slot.label}</span>
                                    {slot.value === scheduleTimeOnly && <Check size={14} className="shrink-0" />}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                </div>
                
                {/* Desktop action buttons */}
                <div className="hidden md:flex gap-2">
                  <button onClick={() => onPreviewToggle ? onPreviewToggle() : setIsPreviewOpen(true)} className={cn("px-3 py-2 font-semibold text-xs rounded-[10px] transition-all flex items-center gap-1.5", isPreviewActive ? "bg-[#040028] dark:bg-white text-white dark:text-[#040028]" : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10")}>{t("Preview", "Aperçu")}</button>
                  <button onClick={() => handleSubmit('review')} disabled={isSubmitting} className="px-3 py-2 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white font-semibold text-xs rounded-[10px] border border-black/10 dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-all flex items-center gap-1.5">{t("Review", "Révision")}</button>
                  <NeuButton onClick={() => handleSubmit(date ? 'queue' : 'execute')} disabled={isSubmitting || tiktokDisclosureInvalid} title={tiktokDisclosureInvalid ? 'You need to indicate if your content promotes yourself, a third party, or both' : undefined} variant="primary" className="px-4 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-[#D9D9D9] dark:border-white/10 shadow-none hover:bg-[#F7F6F3] dark:hover:bg-[#0A0A2E]">
                      {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (date && <Clock className="w-4 h-4 mr-2"/>)}
                      {postToEdit ? t('Update', 'Mettre à jour') : (date ? t('Schedule', 'Planifier') : t('Publish', 'Publier'))}
                  </NeuButton>
                </div>

                {/* Mobile: Big Bibliothèque Button */}
                <button 
                  onClick={() => setIsLibraryOpen(true)} 
                  className="md:hidden mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 rounded-[10px] font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
                >
                   <LayoutGrid size={16} /> {t("Open media library", "Ouvrir la bibliothèque")}
                </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* LIBRARY & MODALS */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div 
             initial={{ opacity: 0, height: 0 }} 
             animate={{ height: 'auto', opacity: 1 }} 
             exit={{ opacity: 0, height: 0 }} 
             className="w-full bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-none overflow-hidden flex flex-col transition-colors
                        md:relative md:max-h-[70vh]
                        fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] md:h-auto md:z-auto"
          >
            <div className="px-4 py-4 md:py-3 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white flex justify-between items-center transition-colors flex-shrink-0">
                <span className="text-base md:text-sm font-semibold flex items-center gap-2"><LayoutGrid size={16} className="md:w-3.5 md:h-3.5" /> {t("Media library", "Bibliothèque de médias")}</span>
                <button onClick={() => setIsLibraryOpen(false)} className="hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-2 md:p-1 transition-colors"><X size={24} className="md:w-3.5 md:h-3.5" /></button>
            </div>
            <div className="p-4 bg-white dark:bg-[#0A0A2E] overflow-hidden flex flex-col flex-1 min-h-0 scrollbar-grey">
                <MediaGallery
                    hideUsage={false}
                    workspaceId={workspaceId}
                    sections={[
                        { id: 'post',         label: t('Attach to Post', 'Joindre à la publication')  },
                        { id: 'firstComment', label: t('First Comment', 'Premier commentaire')   },
                        { id: 'broadcast',    label: t('Broadcast', 'Diffusion')       },
                    ]}
                    onUse={(asset, section) => {
                        if (section === 'post') {
                            const mediaType: AssetType = (asset.mimeType?.startsWith('video/') || asset.type === 'video') ? 'video' : 'image';
                            handleSelectFromLibrary({ id: asset.id, type: mediaType, url: asset.url, name: asset.name, parentId: asset.folderId || null });
                            setIsLibraryOpen(false);
                        } else if (section === 'firstComment') {
                            setFirstComment(prev => (prev ? prev + '\n' : '') + asset.url);
                        } else if (section === 'broadcast') {
                            setBroadcastText(prev => (prev ? prev + '\n' : '') + asset.url);
                        }
                    }}
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuModal isOpen={showFolderModal} onClose={() => setShowFolderModal(false)} title={t("New folder", "Nouveau dossier")}>
          <NeuInput value={inputFolderName} onChange={(e: any) => setInputFolderName(e.target.value)} className="mb-4" placeholder={t("Name", "Nom")} autoFocus />
          <NeuButton variant="primary" onClick={() => { setLibraryData(p => [...p, { id: Date.now().toString(), type: 'folder', name: inputFolderName, parentId: currentFolderId }]); setInputFolderName(""); setShowFolderModal(false); }} className="w-full py-2.5">{t("Create", "Créer")}</NeuButton>
      </NeuModal>
      <NeuModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title={t("New template", "Nouveau modèle")}>
          <NeuInput value={inputTemplateName} onChange={(e: any) => setInputTemplateName(e.target.value)} className="mb-4" placeholder={t("Template name", "Nom du modèle")} autoFocus />
          <div className="bg-[#F5F7FA] dark:bg-white/5 rounded-[10px] p-3 text-xs mb-4 max-h-20 overflow-y-auto text-[#040028] dark:text-white">{text || t("No content to save", "Aucun contenu à enregistrer")}</div>
          <NeuButton variant="primary" onClick={() => { setSavedTemplates(p => [...p, { id: Date.now(), title: inputTemplateName, content: text }]); setInputTemplateName(""); setShowTemplateModal(false); }} className="w-full py-2.5" disabled={!text}>{t("Save", "Enregistrer")}</NeuButton>
      </NeuModal>

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-sans text-[#040028] dark:text-white transition-colors">
                <div className="bg-[#174CD2] text-white p-4 flex justify-between items-center">
                    <span className="font-bold text-lg">{t("Live preview", "Aperçu en direct")}</span>
                    <button onClick={() => setIsPreviewOpen(false)} className="hover:bg-white/15 rounded-full transition-colors p-1.5"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#F5F7FA] dark:bg-black/20 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* 1. FACEBOOK PREVIEW */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'FACEBOOK') && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wide bg-blue-600 text-white px-2.5 py-1 rounded-full">{t("Facebook feed", "Fil Facebook")}</span>
                                <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-zinc-800 p-4 space-y-3 text-black dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-800 rounded-full border border-gray-300 dark:border-zinc-700"></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                                            <div className="h-2 w-16 bg-gray-100 dark:bg-black rounded mt-1"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{text || t("Your content here...", "Votre contenu ici...")}</p>
                                    {mediaPreviews.length > 0 && (
                                        <div className={cn(
                                            "grid gap-1 rounded-md overflow-hidden border border-gray-100 dark:border-zinc-800",
                                            mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                        )}>
                                            {mediaPreviews.slice(0, 4).map((url, i) => (
                                                <img key={i} src={url} className="w-full aspect-square object-cover" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase">
                                        <span>{t("Like", "J'aime")}</span><span>{t("Comment", "Commenter")}</span><span>{t("Share", "Partager")}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. TWITTER PREVIEW */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && (a.platform === 'TWITTER' || a.platform === 'X')) && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wide bg-black dark:bg-white text-white dark:text-black px-2.5 py-1 rounded-full">{t("X timeline", "Fil X")}</span>
                                <div className="bg-white dark:bg-black rounded-xl border border-gray-100 dark:border-zinc-800 p-4 flex gap-3 text-black dark:text-white">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-full shrink-0"></div>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex gap-1 items-center">
                                            <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                                            <div className="h-3 w-16 bg-gray-100 dark:bg-black rounded"></div>
                                        </div>
                                        <p className="text-sm leading-snug whitespace-pre-wrap">{text.length > 280 ? text.substring(0, 277) + '...' : (text || t("What's happening?", "Quoi de neuf?"))}</p>
                                        {mediaPreviews.length > 0 && (
                                            <div className={cn(
                                                "grid gap-0.5 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 max-h-64",
                                                mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                            )}>
                                                {mediaPreviews.slice(0, 4).map((url, i) => (
                                                    <img key={i} src={url} className="w-full h-full object-cover" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-between max-w-xs pt-1 text-gray-400 dark:text-zinc-500">
                                            <MessageCircle size={16} /><RefreshCw size={16} /><Check size={16} /><Send size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. LINKEDIN PREVIEW */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'LINKEDIN') && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wide bg-[#0077B5] text-white px-2.5 py-1 rounded-full">{t("LinkedIn network", "Réseau LinkedIn")}</span>
                                <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 space-y-3 text-black dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                                        <div>
                                            <div className="h-3 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                                            <div className="h-2 w-24 bg-gray-100 dark:bg-black rounded mt-1"></div>
                                        </div>
                                    </div>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{text || t("Share an update...", "Partager une mise à jour...")}</p>
                                    {mediaPreviews.length > 0 && (
                                        <div className="grid grid-cols-2 gap-1 rounded border border-gray-100 dark:border-zinc-800">
                                            {mediaPreviews.slice(0, 4).map((url, i) => (
                                                <img key={i} src={url} className="w-full aspect-square object-cover" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex gap-6 text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase">
                                        <span>{t("Like", "J'aime")}</span><span>{t("Comment", "Commenter")}</span><span>{t("Repost", "Repartager")}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. TIKTOK PREVIEW */}
                        {accounts.some(a => selectedAccountIds.includes(a.id) && a.platform === 'TIKTOK') && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wide bg-black text-[#ff0050] px-2.5 py-1 rounded-full">{t("TikTok mobile", "TikTok mobile")}</span>
                                <div className="bg-black rounded-3xl border-4 border-zinc-800 aspect-[9/16] relative overflow-hidden flex flex-col justify-end p-4">
                                    {mediaPreviews.length > 0 && (
                                        mediaTypes[0] === 'video'
                                          ? <video src={mediaPreviews[0]} className="absolute inset-0 w-full h-full object-cover opacity-80" autoPlay muted loop playsInline />
                                          : <img src={mediaPreviews[0]} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                    )}
                                    <div className="relative z-10 space-y-2 text-white">
                                        <p className="text-sm font-bold">@yourusername</p>
                                        <p className="text-xs line-clamp-3">{text}</p>
                                        <div className="h-1 bg-white/30 rounded-full w-full overflow-hidden">
                                            <div className="h-full bg-white w-1/3"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] flex justify-end gap-3 transition-colors">
                    <NeuButton onClick={() => setIsPreviewOpen(false)} className="px-6 py-2.5">{t("Close", "Fermer")}</NeuButton>
                    <NeuButton onClick={() => { setIsPreviewOpen(false); handleSubmit('execute'); }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white border-none">{t("Publish now", "Publier maintenant")}</NeuButton>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}
