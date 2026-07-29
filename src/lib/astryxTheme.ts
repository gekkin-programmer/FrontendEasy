import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

/**
 * Brand theme for every Astryx component in the app (Toast, DateTimeInput,
 * Button, etc.) — extends the neutral base so any Astryx component we adopt
 * later automatically matches our Neu design system instead of Astryx's
 * defaults. Update here, not per-instance, when adopting a new component.
 */
export const brandTheme = defineTheme({
  name: 'eazypost',
  extends: neutralTheme,
  color: { accent: '#174CD2' },
  typography: {
    body: { family: 'var(--font-rubik)', fallbacks: 'sans-serif' },
    heading: { family: 'var(--font-rubik)', fallbacks: 'sans-serif' },
  },
  radius: { base: 5, multiplier: 1 },
  tokens: {
    '--color-accent': ['#174CD2', '#174CD2'],
    '--color-text-accent': ['#174CD2', '#174CD2'],
    '--color-icon-accent': ['#174CD2', '#174CD2'],
    '--color-border-blue': ['#174CD2', '#174CD2'],
    '--color-text-primary': ['#040028', '#FFFFFF'],
    '--color-text-secondary': ['#8E8E8E', '#8E8E8E'],
    '--color-icon-primary': ['#040028', '#FFFFFF'],
    '--color-background-surface': ['#FFFFFF', '#0A0A2E'],
    '--color-background-card': ['#FFFFFF', '#0A0A2E'],
    '--color-background-popover': ['#FFFFFF', '#0A0A2E'],
    '--color-background-body': ['#F7F6F3', '#040028'],
    '--color-border': ['#D9D9D9', 'rgba(255, 255, 255, 0.1)'],
    '--color-border-emphasized': ['#D9D9D9', 'rgba(255, 255, 255, 0.15)'],
    // Toast's "inverted surface" (dark card in light mode / light card in dark
    // mode) — brand ink instead of the neutral theme's default charcoal.
    '--color-background-inverted': ['#040028', '#F7F6F3'],
  },
});
