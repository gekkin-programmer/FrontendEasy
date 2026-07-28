'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Check, X, Link2, FileText, CalendarDays, BarChart2, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SocialAccount { id: string; platform?: string; }
interface Post { status?: string; scheduledFor?: string; scheduledAt?: string; }
interface WorkspaceData { currentMemberCount?: number; }

interface OnboardingGuideProps {
  workspaceId: string;
  accounts: SocialAccount[];
  posts: Post[];
  currentWorkspace: WorkspaceData | null | undefined;
  onSwitchTab: (tab: string) => void;
  onOpenComposer: () => void;
  /** Hide the guide entirely if the user already has multiple workspaces */
  isFirstWorkspace: boolean;
}

interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  titleFr: string;
  desc: string;
  descFr: string;
  action: string;
  actionFr: string;
  done: boolean;
  onAction: () => void;
}

const GUIDE_KEY = (workspaceId: string) => `eazlypost_guide_${workspaceId}`;

export default function OnboardingGuide({
  workspaceId,
  accounts,
  posts,
  currentWorkspace,
  onSwitchTab,
  onOpenComposer,
  isFirstWorkspace,
}: OnboardingGuideProps) {
  const { t } = useLanguage();

  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(GUIDE_KEY(workspaceId));
      return stored ? JSON.parse(stored).dismissed === true : false;
    } catch {
      return false;
    }
  });

  const [collapsed, setCollapsed] = useState(true);

  // Sync dismissed to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GUIDE_KEY(workspaceId), JSON.stringify({ dismissed }));
    } catch {}
  }, [dismissed, workspaceId]);

  // Detect step completion from live data
  const hasAccount = accounts.length > 0;
  const hasPost = posts.length > 0;
  const hasScheduled = posts.some(p => p.status === 'SCHEDULED' || p.scheduledFor || p.scheduledAt);
  const hasAnalytics = (() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(`eazlypost_guide_analytics_${workspaceId}`) === '1'; } catch { return false; }
  })();
  const hasMember = (currentWorkspace?.currentMemberCount ?? 1) > 1;

  const steps: Step[] = [
    {
      id: 'connect',
      icon: Link2,
      title: 'Connect a social account',
      titleFr: 'Connecter un réseau social',
      desc: 'Link Instagram, TikTok, LinkedIn or any platform to start posting.',
      descFr: 'Reliez Instagram, TikTok, LinkedIn ou autre pour commencer à publier.',
      action: 'Connect now →',
      actionFr: 'Connecter →',
      done: hasAccount,
      onAction: () => {
        // Scroll the sidebar into view — it's already visible on desktop
        document.querySelector('[title^="Connect"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      id: 'post',
      icon: FileText,
      title: 'Create your first post',
      titleFr: 'Créer votre premier post',
      desc: 'Write content in the Composer and save it as a draft or schedule it.',
      descFr: 'Rédigez dans le Composer, enregistrez ou planifiez votre contenu.',
      action: 'Open Composer →',
      actionFr: 'Ouvrir Composer →',
      done: hasPost,
      onAction: () => { onSwitchTab('queue'); onOpenComposer(); },
    },
    {
      id: 'schedule',
      icon: CalendarDays,
      title: 'Schedule a post',
      titleFr: 'Planifier un post',
      desc: 'Pick a date and time in the Composer to auto-publish later.',
      descFr: 'Choisissez une date dans le Composer pour publier automatiquement.',
      action: 'Go to Calendar →',
      actionFr: 'Voir le calendrier →',
      done: hasScheduled,
      onAction: () => onSwitchTab('calendar'),
    },
    {
      id: 'analytics',
      icon: BarChart2,
      title: 'Explore your analytics',
      titleFr: 'Explorer vos analyses',
      desc: 'See reach, engagement, and growth metrics for all your channels.',
      descFr: 'Consultez portée, engagement et croissance de vos réseaux.',
      action: 'View Analytics →',
      actionFr: 'Voir Analytics →',
      done: hasAnalytics,
      onAction: () => {
        onSwitchTab('analytics');
        try { localStorage.setItem(`eazlypost_guide_analytics_${workspaceId}`, '1'); } catch {}
      },
    },
    {
      id: 'team',
      icon: Users,
      title: 'Invite a teammate',
      titleFr: 'Inviter un collaborateur',
      desc: 'Bring your team in to collaborate on content and scheduling.',
      descFr: 'Invitez votre équipe pour collaborer sur le contenu.',
      action: 'Go to Team →',
      actionFr: 'Voir l\'équipe →',
      done: hasMember,
      onAction: () => onSwitchTab('team'),
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allComplete = completedCount === steps.length;

  // Auto-dismiss once everything is done
  useEffect(() => {
    if (allComplete) {
      const timer = setTimeout(() => setDismissed(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [allComplete]);

  // Don't show for experienced users who already have other workspaces
  if (!isFirstWorkspace) return null;
  if (dismissed) return null;

  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="onboarding-guide"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 z-40 w-[300px] max-h-[calc(100vh-10rem)] flex flex-col bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden"
          style={{ left: 'max(0.5rem, calc((100vw - min(100vw, 1664px)) / 2 + 2rem))' }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#174CD2]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-white">
                {t('Getting started', 'Démarrage')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed(c => !c)}
                className="text-white/80 hover:text-white transition-colors"
                title={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-white/80 hover:text-white transition-colors"
                title={t('Dismiss guide', 'Fermer le guide')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#F5F7FA] dark:bg-white/10 w-full">
            <motion.div
              className="h-full bg-[#174CD2]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Steps list */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="steps"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-black/5 dark:divide-white/5 overflow-y-auto max-h-[50vh]">
                  {steps.map((step, i) => (
                    <motion.div
                      key={step.id}
                      layout
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        step.done ? 'bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-[#0A0A2E]'
                      }`}
                    >
                      {/* Step number / check */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                        step.done
                          ? 'bg-green-500 text-white'
                          : 'bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white'
                      }`}>
                        {step.done
                          ? <Check size={14} />
                          : <span className="text-xs font-semibold">{i + 1}</span>
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${
                          step.done ? 'line-through text-[#8E8E8E]' : 'text-[#040028] dark:text-white'
                        }`}>
                          {t(step.title, step.titleFr)}
                        </p>
                        {!step.done && (
                          <p className="text-xs text-[#8E8E8E] mt-0.5 leading-relaxed">
                            {t(step.desc, step.descFr)}
                          </p>
                        )}
                      </div>

                      {/* CTA button */}
                      {!step.done && (
                        <button
                          onClick={step.onAction}
                          className="flex-shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-[#174CD2] text-white hover:bg-[#123a9e] transition-all whitespace-nowrap"
                        >
                          {t(step.action, step.actionFr)}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                  <span className="text-xs font-medium text-[#8E8E8E]">
                    {allComplete
                      ? t('All done!', 'Tout terminé !')
                      : t(`${steps.length - completedCount} steps remaining`, `${steps.length - completedCount} étapes restantes`)
                    }
                  </span>
                  <button
                    onClick={() => setDismissed(true)}
                    className="text-xs font-semibold text-[#8E8E8E] hover:text-red-500 transition-colors"
                  >
                    {t('Dismiss guide', 'Fermer le guide')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
