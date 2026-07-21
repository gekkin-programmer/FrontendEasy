'use client';

import React, { useRef } from 'react';
import { Send, Clock } from 'lucide-react';
import { PlatformConfig } from './platformConfig';
import { PlatformIcon } from './PlatformIcon';
import { useLanguage } from '@/context/LanguageContext';

interface BroadcastPanelProps {
  broadcastPlatforms: PlatformConfig[];
  broadcastAccounts: any[];         // filtered to only broadcast accounts
  text: string;
  setText: (v: string) => void;
  sendNow: boolean;
  setSendNow: (v: boolean) => void;
  scheduledTime?: Date;
  setScheduledTime: (v?: Date) => void;
  isSubmitting: boolean;
  onBroadcast: () => void;
  /** When true, render as a lane inside split mode (no full-height takeover) */
  asLane?: boolean;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  setText: (v: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selected = val.slice(start, end);
  const newVal =
    val.slice(0, start) + before + selected + after + val.slice(end);
  setText(newVal);
  // Restore selection after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + before.length,
      start + before.length + selected.length,
    );
  });
}

const MD_ACTIONS = [
  { label: 'B', title: 'Bold', before: '**', after: '**', className: 'font-bold' },
  { label: 'I', title: 'Italic', before: '_', after: '_', className: 'italic' },
  { label: '`', title: 'Code', before: '`', after: '`', className: 'font-mono' },
  { label: '~~', title: 'Strikethrough', before: '~~', after: '~~', className: 'line-through' },
];

export function BroadcastPanel({
  broadcastPlatforms,
  broadcastAccounts,
  text,
  setText,
  sendNow,
  setSendNow,
  scheduledTime,
  setScheduledTime,
  isSubmitting,
  onBroadcast,
  asLane = false,
}: BroadcastPanelProps) {
  const { t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const primaryPlatform = broadcastPlatforms[0];
  const primaryColor = primaryPlatform?.color ?? '#26A5E4';
  const charLimit = primaryPlatform?.charLimit ?? 4096;
  const pct = Math.min((text.length / charLimit) * 100, 100);
  const isOver = text.length > charLimit;
  const isWarn = text.length > (primaryPlatform?.charWarning ?? charLimit * 0.93);

  const platformLabel = broadcastPlatforms.map((p) => p.label).join(' + ');

  return (
    <div className={asLane ? '' : 'space-y-0'}>
      {/* Lane header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]"
      >
        <div className="flex items-center gap-1">
          {broadcastPlatforms.map((p) => (
            <PlatformIcon key={p.id} platform={p.id} size={14} />
          ))}
        </div>
        <span className="text-xs font-semibold text-[#040028] dark:text-white">
          {platformLabel} {t('Broadcast', 'Diffusion')}
        </span>
      </div>

      {/* Markdown toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E]">
        {MD_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.title}
            onClick={() => {
              if (textareaRef.current) {
                insertMarkdown(textareaRef.current, action.before, action.after, setText);
              }
            }}
            className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-xs text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all ${action.className}`}
          >
            {action.label}
          </button>
        ))}
        <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-1" />
        <span
          className={`text-xs ml-auto ${
            isOver ? 'text-red-600 font-semibold' : isWarn ? 'text-yellow-600 dark:text-yellow-400' : 'text-[#8E8E8E]'
          }`}
        >
          {text.length}/{charLimit}
        </span>
      </div>

      {/* Broadcast textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('Write your broadcast message... (Markdown supported)', 'Écrivez votre message de diffusion... (Markdown pris en charge)')}
        rows={10}
        className="w-full px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white text-sm resize-none focus:outline-none placeholder:text-[#8E8E8E] min-h-[240px]"
      />

      {/* Char progress bar */}
      <div className="h-1 bg-[#F5F7FA] dark:bg-white/5 border-b border-black/5 dark:border-white/5">
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: isOver ? '#dc2626' : isWarn ? '#ca8a04' : primaryColor,
          }}
        />
      </div>

      {/* Channel context */}
      {broadcastAccounts.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-black/5 dark:border-white/5 bg-[#F5F7FA] dark:bg-white/[0.02]">
          <span className="text-xs font-semibold text-[#8E8E8E] flex-shrink-0">
            {t('Sending to:', 'Envoi à :')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {broadcastAccounts.map((acc: any) => (
              <span
                key={acc.id}
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white"
              >
                <PlatformIcon platform={acc.platform} size={10} />
                {acc.displayName || acc.username || acc.platform}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Send toggle + CTA */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0A0A2E]">
        {/* Send now / schedule toggle */}
        <div className="flex bg-[#F5F7FA] dark:bg-white/5 rounded-[10px] p-1">
          <button
            type="button"
            onClick={() => setSendNow(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              sendNow
                ? 'bg-[#174CD2] text-white'
                : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'
            }`}
          >
            <Send size={12} /> {t('Send now', 'Envoyer')}
          </button>
          <button
            type="button"
            onClick={() => setSendNow(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              !sendNow
                ? 'bg-[#174CD2] text-white'
                : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'
            }`}
          >
            <Clock size={12} /> {t('Schedule', 'Planifier')}
          </button>
        </div>

        {/* Inline time picker when schedule is selected */}
        {!sendNow && (
          <div className="flex items-center rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 overflow-hidden">
            <div className="text-xs font-semibold text-[#8E8E8E] px-3 whitespace-nowrap select-none">
              {t('Schedule', 'Planifier')}
            </div>
            <input
              type="datetime-local"
              value={scheduledTime ? scheduledTime.toISOString().slice(0, 16) : ''}
              onChange={(e) =>
                setScheduledTime(e.target.value ? new Date(e.target.value) : undefined)
              }
              className="bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white px-3 py-2 text-xs font-medium focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* BROADCAST CTA */}
        <button
          type="button"
          onClick={onBroadcast}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          <Send size={14} />
          {sendNow ? t('Broadcast', 'Diffuser') : t('Schedule broadcast', 'Planifier la diffusion')}
        </button>
      </div>
    </div>
  );
}
