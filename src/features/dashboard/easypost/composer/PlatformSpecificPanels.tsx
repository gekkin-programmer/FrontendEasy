'use client';

import React from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { PlatformModeResult } from './usePlatformMode';
import { PlatformIcon } from './PlatformIcon';
import { useLanguage } from '@/context/LanguageContext';

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
  // Instagram
  firstComment: string; setFirstComment: (v: string) => void;
  altText: string; setAltText: (v: string) => void;
  // TikTok
  tiktokCreatorNickname?: string;
  tiktokTitle: string; setTiktokTitle: (v: string) => void;
  tiktokPrivacyLevel: string; setTiktokPrivacyLevel: (v: string) => void;
  tiktokAllowComment: boolean; setTiktokAllowComment: (v: boolean) => void;
  tiktokDuet: boolean; setTiktokDuet: (v: boolean) => void;
  tiktokStitch: boolean; setTiktokStitch: (v: boolean) => void;
  tiktokDisclosure: boolean; setTiktokDisclosure: (v: boolean) => void;
  tiktokYourBrand: boolean; setTiktokYourBrand: (v: boolean) => void;
  tiktokBrandContent: boolean; setTiktokBrandContent: (v: boolean) => void;
  tiktokHashtags: string; setTiktokHashtags: (v: string) => void;
  tiktokHasVideo: boolean;
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
      className="w-full flex items-center justify-between px-4 py-2.5 border-t border-black/5 dark:border-white/5 bg-[#F5F7FA] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-2">
        <PlatformIcon platform={platform} size={12} />
        <span className="text-xs font-semibold text-[#040028] dark:text-white">
          {label}
        </span>
        {badge && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">
            <AlertTriangle size={10} /> {badge}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronDown size={14} className="text-[#8E8E8E]" />
      ) : (
        <ChevronRight size={14} className="text-[#8E8E8E]" />
      )}
    </button>
  );
}

const inputCls =
  'w-full rounded-[10px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-white/5 text-[#040028] dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 placeholder:text-[#8E8E8E]';

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
  tiktokCreatorNickname,
  tiktokTitle, setTiktokTitle,
  tiktokPrivacyLevel, setTiktokPrivacyLevel,
  tiktokAllowComment, setTiktokAllowComment,
  tiktokDuet, setTiktokDuet,
  tiktokStitch, setTiktokStitch,
  tiktokDisclosure, setTiktokDisclosure,
  tiktokYourBrand, setTiktokYourBrand,
  tiktokBrandContent, setTiktokBrandContent,
  tiktokHashtags, setTiktokHashtags,
  tiktokHasVideo,
}: PlatformSpecificPanelsProps) {
  const { t } = useLanguage();
  const ids = platformMode.postPlatforms.map((p) => p.id);
  const hasYT = ids.includes('youtube');
  const hasPin = ids.includes('pinterest');
  const hasLI = ids.includes('linkedin');
  const hasIG = ids.includes('instagram');
  const hasTK = ids.includes('tiktok');

  // Tag chip input helpers — declared before early return to satisfy Rules of Hooks
  const [tagInput, setTagInput] = React.useState('');
  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !ytTags.includes(tag)) setYtTags([...ytTags, tag]);
    setTagInput('');
  };

  if (!hasYT && !hasPin && !hasLI && !hasIG && !hasTK) return null;

  const tiktokDisclosureInvalid = hasTK && tiktokDisclosure && !tiktokYourBrand && !tiktokBrandContent;

  return (
    <div>
      {/* ── YouTube ─────────────────────────────────────────────────── */}
      {hasYT && (
        <>
          <PanelHeader
            id="youtube" platform="youtube" label={t('YouTube Options', 'Options YouTube')}
            badge={submitAttempted && !ytTitle ? t('Title required', 'Titre requis') : undefined}
            expanded={expandedPanels.has('youtube')}
            onToggle={() => onTogglePanel('youtube')}
          />
          {expandedPanels.has('youtube') && (
            <div className="px-4 py-4 space-y-3 bg-white dark:bg-[#0A0A2E]">
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">
                  {t('Video title', 'Titre de la vidéo')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  placeholder={t('e.g. How to grow on Instagram in 2026', 'ex. Comment grandir sur Instagram en 2026')}
                  className={`${inputCls} ${submitAttempted && !ytTitle ? '!border-red-600' : ''}`}
                />
                {submitAttempted && !ytTitle && (
                  <p className="text-xs text-red-600 font-medium mt-1">{t('Title is required for YouTube', 'Le titre est requis pour YouTube')}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">{t('Category', 'Catégorie')}</label>
                <select
                  value={ytCategory}
                  onChange={(e) => setYtCategory(e.target.value)}
                  className={inputCls}
                >
                  <option value="">{t('Select category...', 'Choisir une catégorie...')}</option>
                  {YT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">{t('Tags', 'Tags')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                    placeholder={t('Add tag, press Enter', 'Ajouter un tag, appuyez sur Entrée')}
                    className={`${inputCls} flex-1`}
                  />
                  <button type="button" onClick={addTag} className="px-4 rounded-[10px] bg-[#174CD2] text-white text-sm font-semibold hover:bg-[#123a9e] transition-all">+</button>
                </div>
                {ytTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ytTags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white">
                        #{tag}
                        <button type="button" onClick={() => setYtTags(ytTags.filter((x) => x !== tag))} className="opacity-60 hover:opacity-100">×</button>
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
            id="pinterest" platform="pinterest" label={t('Pinterest Pin', 'Épingle Pinterest')}
            expanded={expandedPanels.has('pinterest')}
            onToggle={() => onTogglePanel('pinterest')}
          />
          {expandedPanels.has('pinterest') && (
            <div className="px-4 py-4 space-y-3 bg-white dark:bg-[#0A0A2E]">
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">{t('Board', 'Tableau')}</label>
                <input type="text" value={pinBoard} onChange={(e) => setPinBoard(e.target.value)} placeholder={t('e.g. African Fashion', 'ex. Mode Africaine')} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">{t('Pin title', "Titre de l'épingle")}</label>
                <input type="text" value={pinTitle} onChange={(e) => setPinTitle(e.target.value)} placeholder={t('e.g. Top 10 African Tech Startups', 'ex. Top 10 des startups tech africaines')} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">{t('Destination URL', 'URL de destination')}</label>
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
            id="linkedin" platform="linkedin" label={t('LinkedIn Options', 'Options LinkedIn')}
            expanded={expandedPanels.has('linkedin')}
            onToggle={() => onTogglePanel('linkedin')}
          />
          {expandedPanels.has('linkedin') && (
            <div className="px-4 py-4 bg-white dark:bg-[#0A0A2E]">
              <div className="flex bg-[#F5F7FA] dark:bg-white/5 rounded-[10px] p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setLiArticleMode(false)}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${!liArticleMode ? 'bg-[#174CD2] text-white' : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'}`}
                >
                  {t('Post', 'Post')}
                </button>
                <button
                  type="button"
                  onClick={() => setLiArticleMode(true)}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${liArticleMode ? 'bg-[#174CD2] text-white' : 'text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white'}`}
                >
                  {t('Article', 'Article')}
                </button>
              </div>
              {liArticleMode && (
                <p className="text-xs text-[#8E8E8E] mt-2">
                  {t('Content will be published as a LinkedIn article (long-form)', 'Le contenu sera publié comme un article LinkedIn (format long)')}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Instagram ───────────────────────────────────────────────── */}
      {hasIG && (
        <>
          <PanelHeader
            id="instagram" platform="instagram" label={t('Instagram Options', 'Options Instagram')}
            expanded={expandedPanels.has('instagram')}
            onToggle={() => onTogglePanel('instagram')}
          />
          {expandedPanels.has('instagram') && (
            <div className="px-4 py-4 space-y-3 bg-white dark:bg-[#0A0A2E]">
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">
                  {t('First comment', 'Premier commentaire')}
                </label>
                <textarea
                  value={firstComment}
                  onChange={(e) => setFirstComment(e.target.value)}
                  placeholder={t('Appears instantly in the comments section', 'Apparaît instantanément dans la section commentaires')}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-[#8E8E8E] mt-1">{firstComment.length}/2200 — {t('posted as a comment, not in caption', 'publié en commentaire, pas dans la légende')}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">{t('Alt text (accessibility)', 'Texte alternatif (accessibilité)')}</label>
                <input type="text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder={t('Describe this image for screen readers', "Décrivez cette image pour les lecteurs d'écran")} className={inputCls} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TikTok ──────────────────────────────────────────────────── */}
      {hasTK && (
        <>
          <PanelHeader
            id="tiktok" platform="tiktok" label={t('TikTok Settings', 'Paramètres TikTok')}
            badge={
              (submitAttempted && (!tiktokTitle || !tiktokPrivacyLevel)) || tiktokDisclosureInvalid
                ? t('Required fields', 'Champs requis')
                : undefined
            }
            expanded={expandedPanels.has('tiktok')}
            onToggle={() => onTogglePanel('tiktok')}
          />
          {expandedPanels.has('tiktok') && (
            <div className="px-4 py-4 space-y-4 bg-white dark:bg-[#0A0A2E]">

              {/* Point 1: Creator Info */}
              {tiktokCreatorNickname && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5">
                  <span className="text-xs font-semibold text-[#8E8E8E]">{t('Posting as:', 'Publication en tant que :')}</span>
                  <span className="text-xs font-semibold text-[#040028] dark:text-white">@{tiktokCreatorNickname}</span>
                </div>
              )}

              {/* Point 2: Post Title */}
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">
                  {t('Post title', 'Titre du post')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tiktokTitle}
                  onChange={e => setTiktokTitle(e.target.value)}
                  placeholder={t('Describe your video...', 'Décrivez votre vidéo...')}
                  className={`${inputCls} ${submitAttempted && !tiktokTitle ? '!border-red-600' : ''}`}
                />
                {submitAttempted && !tiktokTitle && (
                  <p className="text-xs text-red-600 font-medium mt-1">{t('Title is required for TikTok', 'Le titre est requis pour TikTok')}</p>
                )}
              </div>

              {/* Point 2: Privacy Status */}
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">
                  {t('Privacy status', 'Confidentialité')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={tiktokPrivacyLevel}
                  onChange={e => setTiktokPrivacyLevel(e.target.value)}
                  className={`${inputCls} ${submitAttempted && !tiktokPrivacyLevel ? '!border-red-600' : ''}`}
                >
                  <option value="">{t('Select privacy...', 'Choisir la confidentialité...')}</option>
                  <option value="PUBLIC_TO_EVERYONE">{t('Everyone', 'Tout le monde')}</option>
                  <option value="MUTUAL_FOLLOW_FRIENDS">{t('Friends', 'Amis')}</option>
                  <option value="FOLLOWER_OF_CREATOR">{t('Followers', 'Abonnés')}</option>
                  {!tiktokBrandContent && <option value="SELF_ONLY">{t('Only me', 'Moi uniquement')}</option>}
                </select>
                {submitAttempted && !tiktokPrivacyLevel && (
                  <p className="text-xs text-red-600 font-medium mt-1">{t('Privacy is required for TikTok', 'La confidentialité est requise pour TikTok')}</p>
                )}
              </div>

              {/* Point 2: Interaction Settings */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#8E8E8E] block">
                  {t('Interaction settings', "Paramètres d'interaction")}
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tiktokAllowComment}
                    onChange={e => setTiktokAllowComment(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#174CD2] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#040028] dark:text-white">{t('Allow comment', 'Autoriser les commentaires')}</span>
                </label>
                {tiktokHasVideo && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tiktokDuet}
                        onChange={e => setTiktokDuet(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#174CD2] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#040028] dark:text-white">Duet</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tiktokStitch}
                        onChange={e => setTiktokStitch(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#174CD2] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#040028] dark:text-white">Stitch</span>
                    </label>
                  </>
                )}
              </div>

              {/* Point 2: Music Usage Declaration */}
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                By posting, you agree to TikTok&apos;s{' '}
                <a
                  href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-[#040028] dark:text-white hover:text-[#174CD2] transition-colors"
                >
                  Music Usage Confirmation
                </a>
              </p>

              {/* Point 3: Content Disclosure Setting */}
              <div className="rounded-[14px] bg-[#F5F7FA] dark:bg-white/5 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#040028] dark:text-white block">
                      {t('Content disclosure setting', 'Divulgation de contenu')}
                    </span>
                    <p className="text-xs text-[#8E8E8E] mt-0.5 leading-relaxed">
                      {t('Indicate if content promotes yourself, a brand, product, or service', 'Indiquez si le contenu fait la promotion de vous-même, d\'une marque, d\'un produit ou d\'un service')}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tiktokDisclosure}
                    onClick={() => setTiktokDisclosure(!tiktokDisclosure)}
                    className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${
                      tiktokDisclosure ? 'bg-[#174CD2]' : 'bg-black/10 dark:bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${
                        tiktokDisclosure ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {tiktokDisclosure && (
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tiktokYourBrand}
                        onChange={e => setTiktokYourBrand(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#174CD2] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-[#040028] dark:text-white">{t('Your brand', 'Votre marque')}</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 select-none ${
                        tiktokPrivacyLevel === 'SELF_ONLY' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      title={tiktokPrivacyLevel === 'SELF_ONLY' ? t('Branded content visibility cannot be set to private', 'La visibilité du contenu de marque ne peut pas être privée') : ''}
                    >
                      <input
                        type="checkbox"
                        checked={tiktokBrandContent}
                        disabled={tiktokPrivacyLevel === 'SELF_ONLY'}
                        onChange={e => {
                          const checked = e.target.checked;
                          setTiktokBrandContent(checked);
                          if (checked && tiktokPrivacyLevel === 'SELF_ONLY') setTiktokPrivacyLevel('');
                        }}
                        className="w-3.5 h-3.5 accent-[#174CD2] cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-xs font-medium text-[#040028] dark:text-white">{t('Branded content', 'Contenu de marque')}</span>
                    </label>

                    {(tiktokYourBrand || tiktokBrandContent) ? (
                      <p className="text-xs text-[#8E8E8E]">
                        {tiktokBrandContent
                          ? t("Your photo/video will be labeled as 'Paid partnership'", "Votre photo/vidéo sera étiquetée 'Partenariat rémunéré'")
                          : t("Your photo/video will be labeled as 'Promotional content'", "Votre photo/vidéo sera étiquetée 'Contenu promotionnel'")}
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-red-500">
                        {t('Select at least one option above to continue', 'Sélectionnez au moins une option ci-dessus pour continuer')}
                      </p>
                    )}

                    {tiktokBrandContent && (
                      <p className="text-xs text-[#8E8E8E] leading-relaxed">
                        By posting, you agree to TikTok&apos;s{' '}
                        <a
                          href="https://www.tiktok.com/legal/page/global/bc-policy/en"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold text-[#040028] dark:text-white hover:text-[#174CD2] transition-colors"
                        >
                          Branded Content Policy
                        </a>
                        {' '}and{' '}
                        <a
                          href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold text-[#040028] dark:text-white hover:text-[#174CD2] transition-colors"
                        >
                          Music Usage Confirmation
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Point 5: Post-publish processing notice */}
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                {t('After you finish publishing your content, it may take a few minutes for the content to process and be visible on their profile.', 'Après la publication, le traitement du contenu peut prendre quelques minutes avant d\'être visible sur le profil.')}
              </p>

              {/* Hashtags */}
              <div>
                <label className="text-xs font-semibold text-[#8E8E8E] block mb-1">
                  {t('Hashtags', 'Hashtags')}
                </label>
                <textarea
                  value={tiktokHashtags}
                  onChange={e => setTiktokHashtags(e.target.value)}
                  placeholder="#africantech #startup #cameroon"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-[#8E8E8E] mt-1">{tiktokHashtags.length}/2200 — {t('appended below caption', 'ajouté sous la légende')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
