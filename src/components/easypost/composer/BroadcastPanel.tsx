'use client';

import React, { useRef } from 'react';
import { Send, Clock } from 'lucide-react';
import { PlatformConfig } from './platformConfig';
import { PlatformIcon } from './PlatformIcon';

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
  { label: 'B', title: 'Bold', before: '**', after: '**', className: 'font-black' },
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
        className="flex items-center gap-2 px-4 py-2 border-b-2 border-black dark:border-white"
        style={{ backgroundColor: primaryColor + '18' }}
      >
        <div className="flex items-center gap-1">
          {broadcastPlatforms.map((p) => (
            <PlatformIcon key={p.id} platform={p.id} size={14} />
          ))}
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
          {platformLabel} BROADCAST
        </span>
      </div>

      {/* Markdown toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900">
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
            className={`w-7 h-7 flex items-center justify-center border-2 border-black dark:border-white text-[11px] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all ${action.className}`}
          >
            {action.label}
          </button>
        ))}
        <div className="h-5 w-px bg-black dark:bg-white mx-1 opacity-30" />
        <span
          className={`text-[10px] font-mono ml-auto ${
            isOver ? 'text-red-600 font-black' : isWarn ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-zinc-500'
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
        placeholder="Write your broadcast message... (Markdown supported)"
        rows={5}
        className="w-full px-4 py-3 border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white font-mono text-sm resize-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-zinc-600"
      />

      {/* Char progress bar */}
      <div className="h-1 bg-gray-100 dark:bg-zinc-800 border-b-2 border-black dark:border-white">
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
        <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 flex-shrink-0">
            Sending to:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {broadcastAccounts.map((acc: any) => (
              <span
                key={acc.id}
                className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 border border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white"
              >
                <PlatformIcon platform={acc.platform} size={10} />
                {acc.displayName || acc.username || acc.platform}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Send toggle + CTA */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900">
        {/* Send now / schedule toggle */}
        <div className="flex items-center gap-0">
          <button
            type="button"
            onClick={() => setSendNow(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black dark:border-white text-[10px] font-black uppercase transition-all ${
              sendNow
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Send size={10} /> SEND_NOW
          </button>
          <button
            type="button"
            onClick={() => setSendNow(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-l-0 border-black dark:border-white text-[10px] font-black uppercase transition-all ${
              !sendNow
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock size={10} /> SCHEDULE
          </button>
        </div>

        {/* Inline time picker when schedule is selected */}
        {!sendNow && (
          <input
            type="datetime-local"
            value={scheduledTime ? scheduledTime.toISOString().slice(0, 16) : ''}
            onChange={(e) =>
              setScheduledTime(e.target.value ? new Date(e.target.value) : undefined)
            }
            className="border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white px-2 py-1 text-[10px] font-mono focus:outline-none"
          />
        )}

        {/* BROADCAST CTA */}
        <button
          type="button"
          onClick={onBroadcast}
          disabled={isSubmitting || isOver || text.trim().length === 0}
          className="flex items-center gap-2 px-5 py-2 border-2 border-black font-black text-xs uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          <Send size={14} />
          {sendNow ? 'BROADCAST' : 'SCHEDULE BROADCAST'}
        </button>
      </div>
    </div>
  );
}
