import { useMemo } from 'react';
import { PLATFORM_CONFIG, BROADCAST_IDS, PlatformConfig } from './platformConfig';

export type ComposerMode = 'post' | 'broadcast' | 'split';

export interface PlatformModeResult {
  mode: ComposerMode;
  activePlatforms: PlatformConfig[];
  broadcastPlatforms: PlatformConfig[];
  postPlatforms: PlatformConfig[];
  /** Min non-null charLimit across postPlatforms */
  tightestCharLimit: number | null;
  requiresVideo: boolean;
  requiresTitle: boolean;
  /** IDs of platforms where text.length > charWarning */
  warningPlatforms: string[];
  /** IDs of platforms where text.length > charLimit */
  overLimitPlatforms: string[];
  /** Primary broadcast color (for mode-driven border/header) */
  broadcastColor: string;
}

export function usePlatformMode(
  selectedAccountIds: string[],
  accounts: any[],
  text: string,
): PlatformModeResult {
  return useMemo(() => {
    // Map selected account IDs → platform configs
    const selectedAccounts = accounts.filter((a) =>
      selectedAccountIds.includes(a.id),
    );

    const activePlatforms: PlatformConfig[] = [];
    const seen = new Set<string>();

    for (const acc of selectedAccounts) {
      const key = (acc.platform as string)?.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const cfg = PLATFORM_CONFIG[key];
      if (cfg) activePlatforms.push(cfg);
    }

    const broadcastPlatforms = activePlatforms.filter((p) =>
      BROADCAST_IDS.has(p.id),
    );
    const postPlatforms = activePlatforms.filter(
      (p) => !BROADCAST_IDS.has(p.id),
    );

    const mode: ComposerMode =
      broadcastPlatforms.length === 0
        ? 'post'
        : postPlatforms.length === 0
          ? 'broadcast'
          : 'split';

    // Tightest post char limit (exclude null = unlimited)
    const limits = postPlatforms
      .map((p) => p.charLimit)
      .filter((l): l is number => l !== null);
    const tightestCharLimit = limits.length > 0 ? Math.min(...limits) : null;

    const requiresVideo = activePlatforms.some((p) => p.requiresVideo);
    const requiresTitle = activePlatforms.some((p) => p.requiresTitle);

    const warningPlatforms = activePlatforms
      .filter((p) => p.charWarning !== null && text.length >= p.charWarning!)
      .map((p) => p.id);

    const overLimitPlatforms = activePlatforms
      .filter((p) => p.charLimit !== null && text.length > p.charLimit!)
      .map((p) => p.id);

    // Dominant broadcast color
    const broadcastColor =
      broadcastPlatforms[0]?.color ?? '#26A5E4';

    return {
      mode,
      activePlatforms,
      broadcastPlatforms,
      postPlatforms,
      tightestCharLimit,
      requiresVideo,
      requiresTitle,
      warningPlatforms,
      overLimitPlatforms,
      broadcastColor,
    };
  }, [selectedAccountIds, accounts, text]);
}
