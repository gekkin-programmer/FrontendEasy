'use client';

import { useEffect, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { eazypostTheme } from '@/lib/eazypost';

/**
 * The rest of the app toggles dark mode via a manual `.dark` class on
 * <html> (see dashboard page.tsx's `isDark` state) — independent of the
 * OS preference. Astryx's own `mode="system"` default instead follows
 * `prefers-color-scheme` directly via `color-scheme: light dark`, so the
 * two can disagree (e.g. OS set to dark while the app itself is in light
 * mode) and Astryx components render the wrong variant. Mirror the actual
 * `.dark` class instead of guessing from the OS.
 */
function useAppDarkMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setMode(el.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return mode;
}

export default function AstryxProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppDarkMode();

  return (
    <Theme theme={eazypostTheme} mode={mode}>
      <LayerProvider toast={{ position: 'bottomEnd' }}>
        {children}
      </LayerProvider>
    </Theme>
  );
}
