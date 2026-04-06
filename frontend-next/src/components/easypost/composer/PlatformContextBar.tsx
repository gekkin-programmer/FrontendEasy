'use client';

import React from 'react';
import { PlatformModeResult } from './usePlatformMode';
import { PlatformIcon } from './PlatformIcon';

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
  const { activePlatforms, broadcastPlatforms, postPlatforms, overLimitPlatforms, warningPlatforms } = platformMode;

  if (activePlatforms.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 border-b-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 scrollbar-hide">
      {activePlatforms.map((p) => {
        const isBroadcast = broadcastPlatforms.some((b) => b.id === p.id);
        const count = isBroadcast ? broadcastLength : textLength;
        const isOver = overLimitPlatforms.includes(p.id);
        const isWarn = warningPlatforms.includes(p.id) && !isOver;

        return (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 px-2 py-1 border-2 flex-shrink-0 transition-all ${
              isOver
                ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                : isWarn
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                  : 'border-black dark:border-white bg-white dark:bg-zinc-900'
            }`}
          >
            <PlatformIcon platform={p.id} size={12} />
            <span
              className={`text-[9px] font-black uppercase tracking-widest ${
                isOver
                  ? 'text-red-600'
                  : isWarn
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-black dark:text-white'
              }`}
            >
              {p.label}
            </span>

            {p.charLimit !== null && (
              <span
                className={`text-[9px] font-mono ml-1 ${
                  isOver
                    ? 'text-red-600 font-black animate-pulse'
                    : isWarn
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-400 dark:text-zinc-500'
                }`}
              >
                {count}/{p.charLimit}
              </span>
            )}

            {isOver && (
              <span className="text-[8px] font-black uppercase bg-red-600 text-white px-1">
                OVER
              </span>
            )}

            {p.requiresVideo && (
              <span className="text-[8px] font-black uppercase bg-black dark:bg-white text-white dark:text-black px-1">
                VIDEO
              </span>
            )}

            {p.requiresTitle && (
              <span className="text-[8px] font-black uppercase border border-current px-1">
                TITLE
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
