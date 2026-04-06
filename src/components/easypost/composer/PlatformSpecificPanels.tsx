'use client';

import React from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { PlatformModeResult } from './usePlatformMode';
import { PlatformIcon } from './PlatformIcon';

const YT_CATEGORIES = [
  'Film & Animation', 'Autos & Vehicles', 'Music', 'Pets & Animals',
  'Sports', 'Travel & Events', 'Gaming', 'People & Blogs',
  'Comedy', 'Entertainment', 'News & Politics', 'Howto & Style',
  'Education', 'Science & Technology', 'Nonprofits & Activism',
];

interface PlatformSpecificPanelsProps {
  platformMode: PlatformModeResult;
  expandedPanels: Set<string>;
  onTogglePanel: (id: string) => void;
  submitAttempted: boolean;
  // YouTube
  ytTitle: string; setYtTitle: (v: string) => void;
  ytCategory: string; setYtCategory: (v: string) => void;
  ytTags: string[]; setYtTags: (v: string[]) => void;
  // Pinterest
  pinTitle: string; setPinTitle: (v: string) => void;
  pinDestUrl: string; setPinDestUrl: (v: string) => void;
  pinBoard: string; setPinBoard: (v: string) => void;
  // LinkedIn
  liArticleMode: boolean; setLiArticleMode: (v: boolean) => void;
  // Instagram / TikTok
  firstComment: string; setFirstComment: (v: string) => void;
  altText: string; setAltText: (v: string) => void;
}

function PanelHeader({
  id, platform, label, badge, expanded, onToggle,
}: {
  id: string; platform: string; label: string; badge?: string;
  expanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-2 border-t-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
    >
      <div className="flex items-center gap-2">
        <PlatformIcon platform={platform} size={12} />
        <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">
          {label}
        </span>
        {badge && (
          <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-yellow-600 dark:text-yellow-400">
            <AlertTriangle size={9} /> {badge}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronDown size={14} className="text-black dark:text-white" />
      ) : (
        <ChevronRight size={14} className="text-black dark:text-white" />
      )}
    </button>
  );
}

const inputCls =
  'w-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white px-3 py-2 font-mono text-xs focus:outline-none placeholder:text-gray-400 dark:placeholder:text-zinc-600';

export function PlatformSpecificPanels({
  platformMode,
  expandedPanels,
  onTogglePanel,
  submitAttempted,
  ytTitle, setYtTitle,
  ytCategory, setYtCategory,
  ytTags, setYtTags,
  pinTitle, setPinTitle,
  pinDestUrl, setPinDestUrl,
  pinBoard, setPinBoard,
  liArticleMode, setLiArticleMode,
  firstComment, setFirstComment,
  altText, setAltText,
}: PlatformSpecificPanelsProps) {
  const ids = platformMode.postPlatforms.map((p) => p.id);
  const hasYT = ids.includes('youtube');
  const hasPin = ids.includes('pinterest');
  const hasLI = ids.includes('linkedin');
  const hasIGTK = ids.includes('instagram') || ids.includes('tiktok');

  // Tag chip input helpers — declared before early return to satisfy Rules of Hooks
  const [tagInput, setTagInput] = React.useState('');
  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !ytTags.includes(t)) setYtTags([...ytTags, t]);
    setTagInput('');
  };

  if (!hasYT && !hasPin && !hasLI && !hasIGTK) return null;

  return (
    <div>
      {/* ── YouTube ─────────────────────────────────────────────────── */}
      {hasYT && (
        <>
          <PanelHeader
            id="youtube" platform="youtube" label="YouTube Options"
            badge={submitAttempted && !ytTitle ? 'Title required' : undefined}
            expanded={expandedPanels.has('youtube')}
            onToggle={() => onTogglePanel('youtube')}
          />
          {expandedPanels.has('youtube') && (
            <div className="px-4 py-4 space-y-3 border-t-0 bg-white dark:bg-zinc-900">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  placeholder="e.g. How to grow on Instagram in 2026"
                  className={`${inputCls} ${submitAttempted && !ytTitle ? 'border-red-600' : ''}`}
                />
                {submitAttempted && !ytTitle && (
                  <p className="text-[9px] text-red-600 font-black uppercase mt-1">Title is required for YouTube</p>
                )}
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">Category</label>
                <select
                  value={ytCategory}
                  onChange={(e) => setYtCategory(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select category...</option>
                  {YT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag, press Enter"
                    className={`${inputCls} flex-1`}
                  />
                  <button type="button" onClick={addTag} className="px-3 py-1 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase">+</button>
                </div>
                {ytTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ytTags.map((t) => (
                      <span key={t} className="flex items-center gap-1 px-2 py-0.5 border border-black dark:border-white text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                        #{t}
                        <button type="button" onClick={() => setYtTags(ytTags.filter((x) => x !== t))} className="opacity-60 hover:opacity-100">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Pinterest ───────────────────────────────────────────────── */}
      {hasPin && (
        <>
          <PanelHeader
            id="pinterest" platform="pinterest" label="Pinterest Pin"
            expanded={expandedPanels.has('pinterest')}
            onToggle={() => onTogglePanel('pinterest')}
          />
          {expandedPanels.has('pinterest') && (
            <div className="px-4 py-4 space-y-3 bg-white dark:bg-zinc-900">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">Board</label>
                <input type="text" value={pinBoard} onChange={(e) => setPinBoard(e.target.value)} placeholder="e.g. African Fashion" className={inputCls} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">Pin Title</label>
                <input type="text" value={pinTitle} onChange={(e) => setPinTitle(e.target.value)} placeholder="e.g. Top 10 African Tech Startups" className={inputCls} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">Destination URL</label>
                <input type="url" value={pinDestUrl} onChange={(e) => setPinDestUrl(e.target.value)} placeholder="https://yoursite.com/article" className={inputCls} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── LinkedIn ────────────────────────────────────────────────── */}
      {hasLI && (
        <>
          <PanelHeader
            id="linkedin" platform="linkedin" label="LinkedIn Options"
            expanded={expandedPanels.has('linkedin')}
            onToggle={() => onTogglePanel('linkedin')}
          />
          {expandedPanels.has('linkedin') && (
            <div className="px-4 py-4 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-0">
                <button
                  type="button"
                  onClick={() => setLiArticleMode(false)}
                  className={`px-4 py-2 border-2 border-black dark:border-white text-[10px] font-black uppercase transition-all ${!liArticleMode ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-black dark:text-white'}`}
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setLiArticleMode(true)}
                  className={`px-4 py-2 border-2 border-l-0 border-black dark:border-white text-[10px] font-black uppercase transition-all ${liArticleMode ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-black dark:text-white'}`}
                >
                  Article
                </button>
              </div>
              {liArticleMode && (
                <p className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 uppercase mt-2">
                  Content will be published as a LinkedIn article (long-form)
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Instagram / TikTok ──────────────────────────────────────── */}
      {hasIGTK && (
        <>
          <PanelHeader
            id="igtk"
            platform={ids.includes('instagram') ? 'instagram' : 'tiktok'}
            label={`${ids.includes('instagram') ? 'Instagram' : ''}${ids.includes('instagram') && ids.includes('tiktok') ? ' + ' : ''}${ids.includes('tiktok') ? 'TikTok' : ''} Options`}
            expanded={expandedPanels.has('igtk')}
            onToggle={() => onTogglePanel('igtk')}
          />
          {expandedPanels.has('igtk') && (
            <div className="px-4 py-4 space-y-3 bg-white dark:bg-zinc-900">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">
                  First Comment (hashtags)
                </label>
                <textarea
                  value={firstComment}
                  onChange={(e) => setFirstComment(e.target.value)}
                  placeholder="#africantech #startup #cameroon"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 mt-1">{firstComment.length}/2200</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">Alt Text (accessibility)</label>
                <input type="text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe this image for screen readers" className={inputCls} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
