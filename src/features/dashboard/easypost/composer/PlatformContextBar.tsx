'use client';

import React from 'react';
import { PlatformModeResult } from './usePlatformMode';
import { PlatformIcon } from './PlatformIcon';
import { useLanguage } from '@/context/LanguageContext';

interface PlatformContextBarProps {
  platformMode: PlatformModeResult;
  /** Length of the POST lane textarea (not broadcast) */
  textLength: number;
  /** Length of the broadcast textarea (for broadcast/split modes) */
  broadcastLength?: number;
}

export function PlatformContextBar({
  platformMode,
  textLength,
  broadcastLength = 0,
}: PlatformContextBarProps) {
  const { t } = useLanguage();
  const { activePlatforms, broadcastPlatforms, overLimitPlatforms, warningPlatforms } = platformMode;

  if (activePlatforms.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 border-b border-black/5 dark:border-white/5 bg-[#F5F7FA] dark:bg-white/[0.02] scrollbar-hide">
      {activePlatforms.map((p) => {
        const isBroadcast = broadcastPlatforms.some((b) => b.id === p.id);
        const count = isBroadcast ? broadcastLength : textLength;
        const isOver = overLimitPlatforms.includes(p.id);
        const isWarn = warningPlatforms.includes(p.id) && !isOver;

        return (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full flex-shrink-0 transition-all ${
              isOver
                ? 'bg-red-50 dark:bg-red-950/30'
                : isWarn
                  ? 'bg-yellow-50 dark:bg-yellow-950/30'
                  : 'bg-white dark:bg-[#0A0A2E]'
            }`}
          >
            <PlatformIcon platform={p.id} size={12} />
            <span
              className={`text-xs font-semibold ${
                isOver
                  ? 'text-red-600'
                  : isWarn
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-[#040028] dark:text-white'
              }`}
            >
              {p.label}
            </span>

            {p.charLimit !== null && (
              <span
                className={`text-xs ml-1 ${
                  isOver
                    ? 'text-red-600 font-semibold animate-pulse'
                    : isWarn
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-[#8E8E8E]'
                }`}
              >
                {count}/{p.charLimit}
              </span>
            )}

            {isOver && (
              <span className="text-[10px] font-semibold rounded-full bg-red-600 text-white px-1.5">
                {t('Over', 'Dépassé')}
              </span>
            )}

            {p.requiresVideo && (
              <span className="text-[10px] font-semibold rounded-full bg-[#174CD2] text-white px-1.5">
                {t('Video', 'Vidéo')}
              </span>
            )}

            {p.requiresTitle && (
              <span className="text-[10px] font-semibold rounded-full border border-current px-1.5">
                {t('Title', 'Titre')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
