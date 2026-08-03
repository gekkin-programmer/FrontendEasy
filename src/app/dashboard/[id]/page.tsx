'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAppToast } from '@/hooks/useAppToast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { deleteCookie } from 'cookies-next';
import { getBrowserTimezone, getSupportedTimezones } from '@/lib/timezone';

// ICONS
import {
  Layers, BarChart2, Settings as SettingsIcon,
  Check, Plus, Users, Menu, X,
  ExternalLink, Calendar as CalendarIcon,
  AlertTriangle, Crown, MessageCircle, Layout,
  Heart, Bookmark, Share2, Music, Repeat2, MoreHorizontal, ThumbsUp,
  ChevronDown
} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa6';

// COMPONENTS
import Composer from '@/features/dashboard/easypost/Composer';
import PostFeed from '@/features/dashboard/easypost/PostFeed';
import Analytics from '@/features/dashboard/easypost/Analytics';
import Settings from '@/features/dashboard/easypost/Settings';
import Team from '@/features/dashboard/easypost/Team';
import VoiceAiButton from '@/features/dashboard/easypost/VoiceAiButton';
import CalendarView from '@/features/dashboard/easypost/CalendarView';
import SpinningLoader from '@/components/common/SpinningLoader';

// EXTRACTED COMPONENTS
import { NeuButton, NeuCard, NeuInput, NeuModal } from '@/features/dashboard/easypost/DashboardUI';
import { QuickConnectSidebar } from '@/features/dashboard/easypost/QuickConnectSidebar';
import { FacebookPageSelector } from '@/features/dashboard/easypost/FacebookPageSelector';
import { SidebarItem } from '@/features/dashboard/easypost/SidebarItem';
import { EngagementWithTabs } from '@/features/dashboard/easypost/EngagementWithTabs';

// SOCKET
import { SocketProvider, useSocket } from '@/context/SocketContext';
import { useLanguage } from '@/context/LanguageContext';

import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import BoardView from '@/features/dashboard/easypost/BoardView';
import OnboardingGuide from '@/features/dashboard/easypost/OnboardingGuide';

type TabType = 'queue' |'calendar' | 'boards' | 'analytics' | 'engagement' | 'settings' | 'team';

interface PreviewData { text: string; mediaPreviews: string[]; mediaTypes: ('image' | 'video')[]; selectedAccountIds: string[]; tiktokHashtags?: string; }

const PLATFORM_COLORS: Record<string, string> = {
    INSTAGRAM: '#E4405F', FACEBOOK: '#1877F2', TWITTER: '#000000', X: '#000000',
    LINKEDIN: '#0A66C2', TIKTOK: '#010101', YOUTUBE: '#FF0000', DISCORD: '#5865F2',
    TELEGRAM: '#26A5E4', PINTEREST: '#BD081C', SNAPCHAT: '#FFFC00',
};

const STORY_IMAGES = ['/assets/blanche-bailey.png', '/assets/creatrice.png', '/assets/Creatriceee.png', '/assets/3.jpg'];

// ─── Platform-specific preview renderers ───────────────────────────────────

function TikTokPreview({ text, media, mediaTypes, account, tiktokHashtags }: { text: string; media: string[]; mediaTypes: ('image' | 'video')[]; account: any; tiktokHashtags?: string }) {
    const isVideo = mediaTypes[0] === 'video';
    const hashtagTokens = tiktokHashtags
        ? tiktokHashtags.split(/[\s,]+/).filter(Boolean).map(h => h.startsWith('#') ? h : `#${h}`)
        : [];
    return (
        <div className="relative bg-black overflow-hidden" style={{ height: 520 }}>
            {media[0]
                ? isVideo
                    ? <video src={media[0]} className="absolute inset-0 w-full h-full object-cover opacity-90" autoPlay muted loop playsInline />
                    : <img src={media[0]} className="absolute inset-0 w-full h-full object-cover opacity-70" alt="" />
                : <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
            }
            {/* Following | For You */}
            <div className="absolute top-0 left-0 right-0 flex justify-center gap-5 pt-3 z-20">
                <span className="text-white/50 text-[11px] font-semibold">Following</span>
                <span className="text-white text-[11px] font-bold border-b-[2px] border-white pb-0.5">For You</span>
            </div>
            {/* Right action column */}
            <div className="absolute right-2 bottom-16 flex flex-col items-center gap-4 z-20">
                <div className="relative">
                    <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-zinc-600">
                        {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center">
                        <Plus size={9} className="text-white" strokeWidth={3} />
                    </div>
                    <FaTiktok size={10} className="text-white absolute -bottom-0.5 -right-1" />
                </div>
                {[Heart, MessageCircle, Bookmark, Share2].map((Icon, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                        <Icon size={22} className="text-white" strokeWidth={1.5} />
                        <span className="text-white text-[9px]">0</span>
                    </div>
                ))}
            </div>
            {/* Bottom: username + caption + hashtags + sound */}
            <div className="absolute bottom-0 left-0 right-12 p-3 z-20">
                <div className="text-white text-[11px] font-bold">@{account?.username || 'creator'}</div>
                <div className="text-white/90 text-[10px] line-clamp-2 mt-0.5">{text || 'Your caption here…'}</div>
                {hashtagTokens.length > 0 && (
                    <div className="flex flex-wrap gap-x-1 mt-0.5">
                        {hashtagTokens.map((tag, i) => (
                            <span key={i} className="text-white text-[10px] font-semibold">{tag}</span>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-1 mt-1.5">
                    <Music size={10} className="text-white" />
                    <span className="text-white/70 text-[9px]">Original sound</span>
                </div>
            </div>
        </div>
    );
}

function InstagramPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    const [carouselIdx, setCarouselIdx] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const stories = [1, 2, 3, 4];

    const scrollToSlide = (i: number) => {
        const el = carouselRef.current;
        if (!el) return;
        el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    };

    const handleCarouselScroll = () => {
        const el = carouselRef.current;
        if (!el || el.clientWidth === 0) return;
        setCarouselIdx(Math.round(el.scrollLeft / el.clientWidth));
    };

    return (
        <div className="bg-white">
            {/* App header */}
            <div className="flex items-center justify-between px-3 py-2.5">
                <svg width="72" height="21" viewBox="0 0 163 47" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M8.38362 0.161971C5.0526 1.58369 1.38136 5.59034 0.226183 10.6229C-1.23757 16.9964 4.86271 19.6944 5.36909 18.8139C5.94668 17.7719 4.2693 17.4164 3.92116 14.1126C3.47017 9.83934 5.43239 5.06528 7.89307 2.97309C8.35197 2.58535 8.32824 3.12657 8.32824 4.12824C8.32824 5.92154 8.23329 22.0047 8.23329 25.357C8.23329 29.8968 8.05131 31.3347 7.719 32.7484C7.37878 34.1862 6.84075 35.1556 7.25218 35.5272C7.71109 35.9472 9.66539 34.9536 10.7889 33.3461C12.1419 31.4236 12.6166 29.1133 12.7037 26.6091C12.8065 23.5799 12.7986 18.7897 12.8065 16.0513C12.8065 13.539 12.8461 6.19619 12.767 1.77756C12.7353 0.703193 9.78408 -0.427718 8.38362 0.161971ZM162.251 24.0161C161.769 24.0161 161.547 24.525 161.365 25.3732C160.732 28.3378 160.068 29.0083 159.205 29.0083C158.248 29.0083 157.385 27.5381 157.164 24.5977C156.99 22.2874 157.014 18.0304 157.235 13.7975C157.283 12.9251 157.045 12.0688 154.751 11.2207C153.762 10.8572 152.322 10.3159 151.61 12.0769C149.592 17.0287 148.801 20.9627 148.611 22.5621C148.603 22.6429 148.5 22.659 148.484 22.4732C148.366 21.1888 148.104 18.8624 148.065 13.9752C148.057 13.022 147.859 12.2062 146.823 11.5438C146.15 11.1156 144.109 10.3482 143.373 11.2611C142.74 12.0042 141.996 13.9995 141.229 16.3663C140.604 18.2889 140.177 19.5894 140.177 19.5894C140.177 19.5894 140.184 14.3953 140.192 12.4324C140.192 11.6892 139.694 11.4468 139.544 11.3984C138.863 11.1964 137.518 10.8652 136.948 10.8652C136.244 10.8652 136.078 11.2611 136.078 11.8427C136.078 11.9154 135.967 18.6766 135.967 23.4022V24.0727C135.58 26.2456 134.322 29.1941 132.953 29.1941C131.576 29.1941 130.935 27.9662 130.935 22.3278C130.935 19.0401 131.03 17.6103 131.078 15.2354C131.101 13.8702 131.157 12.812 131.157 12.5778C131.149 11.8427 129.899 11.4792 129.321 11.3418C128.736 11.2045 128.229 11.148 127.834 11.1722C127.272 11.2045 126.876 11.5761 126.876 12.0931C126.876 12.3677 126.876 12.8928 126.876 12.8928C126.156 11.7457 125.001 10.946 124.226 10.7118C122.153 10.0898 119.985 10.6391 118.347 12.9655C117.049 14.8073 116.266 16.8994 115.957 19.9044C115.728 22.1016 115.807 24.3311 116.203 26.2133C115.72 28.3378 114.818 29.2102 113.837 29.2102C112.413 29.2102 111.376 26.8434 111.495 22.7479C111.574 20.0579 112.104 18.1677 112.682 15.4293C112.927 14.266 112.729 13.6521 112.223 13.0705C111.764 12.5374 110.775 12.2627 109.359 12.5939C108.354 12.8362 106.906 13.0947 105.592 13.2886C105.592 13.2886 105.672 12.9655 105.735 12.4C106.075 9.41928 102.886 9.66162 101.866 10.6148C101.257 11.1884 100.845 11.8588 100.687 13.0624C100.442 14.9769 101.977 15.8816 101.977 15.8816C101.47 18.2242 100.236 21.2858 98.9621 23.4991C98.2816 24.6866 97.7515 25.5671 97.079 26.496C97.079 26.1487 97.079 25.8013 97.0711 25.454C97.0552 20.5264 97.1185 16.649 97.1502 15.2515C97.1739 13.8864 97.2293 12.8605 97.2293 12.6181C97.2214 12.085 96.9128 11.8831 96.2719 11.6246C95.7022 11.3984 95.0376 11.2449 94.3414 11.1884C93.471 11.1156 92.9409 11.5922 92.9567 12.1496C92.9567 12.2546 92.9567 12.9009 92.9567 12.9009C92.2367 11.7538 91.0815 10.9541 90.3062 10.7198C88.2332 10.0978 86.0652 10.6471 84.4274 12.9736C83.1298 14.8153 82.2832 17.4084 82.0379 19.8883C81.8164 22.1986 81.856 24.1615 82.1645 25.8175C81.8322 27.4735 80.8828 29.2102 79.8146 29.2102C78.4458 29.2102 77.6625 27.9824 77.6625 22.344C77.6625 19.0563 77.7575 17.6265 77.8049 15.2515C77.8366 13.8864 77.8841 12.8282 77.8841 12.5939C77.8761 11.8588 76.626 11.4953 76.0484 11.358C75.4392 11.2126 74.917 11.1641 74.5135 11.1964C73.9834 11.2368 73.6115 11.7215 73.6115 12.0769V12.9089C72.8915 11.7619 71.7284 10.9622 70.9609 10.7279C68.8879 10.1059 66.7358 10.6714 65.0901 12.9817C64.014 14.4922 63.1437 16.1644 62.7006 19.864C62.5661 20.9303 62.5107 21.932 62.5186 22.869C62.0914 25.5348 60.2004 28.5963 58.6575 28.5963C57.7555 28.5963 56.8931 26.8111 56.8931 23.0144C56.8931 17.9496 57.2017 10.7441 57.257 10.0494C57.257 10.0494 59.2114 10.0171 59.5911 10.009C60.5643 10.0009 61.4505 10.0251 62.7481 9.95243C63.3969 9.92011 64.0219 7.5452 63.3573 7.2544C63.0488 7.11707 60.8966 7.00398 60.0421 6.98782C59.3617 6.94744 57.3599 6.79395 57.3599 6.79395C57.3599 6.79395 57.5419 2.01182 57.5814 1.50291C57.6131 1.08286 57.0751 0.864752 56.7744 0.735505C56.0228 0.412387 55.3581 0.258906 54.5669 0.0973478C53.4671 -0.136912 52.9766 0.0892699 52.8737 1.03439C52.7234 2.4561 52.6522 6.64047 52.6522 6.64047C51.8451 6.64047 49.0996 6.47892 48.3005 6.47892C47.5488 6.47892 46.7497 9.7424 47.7783 9.78279C48.9651 9.83126 51.0381 9.87165 52.4148 9.91204C52.4148 9.91204 52.3515 17.2387 52.3515 19.5005C52.3515 19.7348 52.3515 19.9691 52.3515 20.1952C51.5998 24.2019 48.9335 26.3587 48.9335 26.3587C49.5031 23.7091 48.34 21.722 46.2354 20.0418C45.46 19.4198 43.933 18.2485 42.216 16.956C42.216 16.956 43.2051 15.9624 44.0912 13.9672C44.7163 12.5535 44.74 10.9299 43.213 10.5744C40.689 9.98474 38.6002 11.8669 37.983 13.8864C37.5004 15.4454 37.7615 16.6006 38.703 17.8042C38.7663 17.893 38.8455 17.9819 38.9246 18.0707C38.3549 19.1936 37.5716 20.6961 36.907 21.8593C35.0634 25.0986 33.6709 27.6593 32.6186 27.6593C31.7799 27.6593 31.7878 25.0582 31.7878 22.6267C31.7878 20.5264 31.9381 17.376 32.0647 14.1045C32.1043 13.022 31.5742 12.4081 30.6801 11.8507C30.1421 11.5115 28.9869 10.841 28.3144 10.841C27.3095 10.841 24.4216 10.9783 21.6919 19.0078C21.3517 20.0175 20.6712 21.8674 20.6712 21.8674L20.7266 12.2142C20.7266 11.9881 20.6079 11.77 20.3389 11.6165C19.88 11.358 18.6457 10.841 17.5538 10.841C17.0316 10.841 16.7705 11.0914 16.7705 11.5842L16.6756 26.6899C16.6756 27.837 16.7072 29.1779 16.818 29.7595C16.9288 30.3411 17.1107 30.8258 17.3323 31.1085C17.5538 31.3913 17.8149 31.6094 18.2343 31.6982C18.6299 31.779 20.7978 32.0617 20.9086 31.2216C21.0431 30.2119 21.051 29.1214 22.1903 25.0582C23.9627 18.7251 26.273 15.6393 27.357 14.5407C27.5469 14.3468 27.7684 14.3387 27.7526 14.6538C27.7051 16.0432 27.5469 19.5167 27.4361 22.4571C27.1434 30.3411 28.5517 31.8032 30.5693 31.8032C32.1122 31.8032 34.288 30.2442 36.6221 26.3022C38.078 23.8465 39.4863 21.4312 40.507 19.6944C41.2112 20.3568 42.0103 21.0757 42.8015 21.8351C44.6451 23.6122 45.2464 25.3005 44.8508 26.8999C44.5422 28.1278 43.387 29.3879 41.3299 28.1601C40.7285 27.8047 40.4754 27.53 39.874 27.118C39.5496 26.8999 39.0512 26.8353 38.7584 27.0696C37.9909 27.6593 37.5479 28.4105 37.2947 29.3395C37.0494 30.2442 37.9435 30.7208 38.8613 31.1408C39.6604 31.5044 41.3694 31.8275 42.4613 31.8679C46.7101 32.0133 50.1124 29.7838 52.486 24.0323C52.9133 29.0002 54.7172 31.8113 57.8505 31.8113C59.9472 31.8113 62.0518 29.0567 62.9696 26.3506C63.2307 27.4573 63.6263 28.4186 64.1248 29.2264C66.5459 33.1199 71.2299 32.2798 73.5878 28.976C74.3157 27.9581 74.4264 27.5866 74.4264 27.5866C74.7667 30.7046 77.2432 31.7952 78.6594 31.7952C80.2419 31.7952 81.8797 31.0358 83.027 28.4105C83.1615 28.6932 83.3118 28.9679 83.47 29.2264C85.8833 33.1199 90.5752 32.2798 92.9251 28.976C93.0358 28.8225 93.1308 28.6852 93.2178 28.5559L93.289 30.6077C93.289 30.6077 91.944 31.8598 91.1211 32.6272C87.4894 36.0118 84.7281 38.5806 84.5224 41.5695C84.2613 45.3822 87.3074 46.7959 89.6099 46.9817C92.0547 47.1755 94.1515 45.8104 95.4332 43.8878C96.5647 42.1995 97.3084 38.5564 97.253 34.9698C97.2293 33.5319 97.1976 31.7063 97.166 29.7434C98.4398 28.2409 99.8799 26.3345 101.201 24.113C102.641 21.6816 104.192 18.4262 104.983 15.8897C104.983 15.8897 106.328 15.8978 107.76 15.8089C108.219 15.7847 108.346 15.8736 108.267 16.2128C108.164 16.6248 106.455 23.3214 108.014 27.7804C109.082 30.8339 111.487 31.8194 112.911 31.8194C114.581 31.8194 116.179 30.5431 117.033 28.6367C117.136 28.8467 117.247 29.0487 117.366 29.2425C119.779 33.1361 124.455 32.2879 126.829 28.9921C127.367 28.2489 127.667 27.6027 127.667 27.6027C128.174 30.8339 130.65 31.8275 132.067 31.8275C133.538 31.8275 134.939 31.2135 136.078 28.4832C136.125 29.6868 136.205 30.6723 136.315 30.9793C136.387 31.1651 136.806 31.4074 137.115 31.5205C138.467 32.0294 139.836 31.7871 140.351 31.6821C140.707 31.6094 140.976 31.3186 141.015 30.5835C141.11 28.6367 141.055 25.357 141.632 22.9256C142.606 18.8382 143.515 17.2549 143.951 16.4713C144.188 16.0351 144.465 15.9624 144.473 16.4229C144.497 17.368 144.544 20.1225 144.916 23.8384C145.193 26.5687 145.565 28.1843 145.85 28.6932C146.664 30.1553 147.669 30.22 148.484 30.22C149.006 30.22 150.09 30.0746 149.996 29.1456C149.948 28.6932 150.035 25.8983 150.992 21.8674C151.625 19.2421 152.67 16.8671 153.05 16.0028C153.192 15.6797 153.255 15.9382 153.255 15.9866C153.176 17.7961 152.994 23.7091 153.722 26.9484C154.703 31.3347 157.552 31.8194 158.541 31.8194C160.653 31.8194 162.386 30.1877 162.971 25.8821C163.082 24.8239 162.877 24.0161 162.251 24.0161ZM73.6115 21.3585C73.4928 23.6364 73.0497 25.5428 72.3535 26.9242C71.0796 29.4283 68.5714 30.22 67.4637 26.601C66.6646 23.9919 66.9336 20.4376 67.2659 18.515C67.7565 15.6635 68.9908 13.644 70.9214 13.8379C72.9073 14.0399 73.8647 16.6248 73.6115 21.3585ZM92.9567 21.3908C92.846 23.5395 92.2921 25.7044 91.6987 26.9242C90.4644 29.4445 87.8771 30.2361 86.809 26.601C86.0811 24.1211 86.2551 20.9142 86.6112 18.8947C87.078 16.2694 88.2173 13.8379 90.2666 13.8379C92.2605 13.8379 93.2416 16.0593 92.9567 21.3908ZM93.4631 36.0684C93.4394 39.9943 92.8301 43.4274 91.5246 44.429C89.6732 45.8427 87.1888 44.7845 87.703 41.9249C88.162 39.3884 90.3062 36.8035 93.4631 33.645C93.471 33.6369 93.471 34.3559 93.4631 36.0684ZM126.852 21.415C126.742 23.7738 126.227 25.6236 125.594 26.9242C124.36 29.4445 121.789 30.228 120.705 26.601C120.111 24.63 120.088 21.3262 120.515 18.5716C120.95 15.7685 122.161 13.644 124.17 13.8379C126.14 14.0318 127.066 16.6248 126.852 21.415Z" fill="#121212"/></svg>
                <svg width="20" height="20" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.0145 2.84961C26.4293 2.84962 33.1618 9.41335 33.162 17.3799C33.162 25.3447 26.4137 31.9101 17.9969 31.9102C16.5984 31.9102 15.2694 31.7317 13.9901 31.3916C13.7988 31.3408 13.5994 31.3327 13.4061 31.3672L13.2157 31.416L8.46863 33.0029L8.7157 29.6221C8.74776 29.1812 8.56133 28.7526 8.21765 28.4746C4.91836 25.8061 2.84949 21.8286 2.84949 17.3799C2.84963 9.41426 9.5812 2.84961 18.0145 2.84961Z" stroke="#121212" strokeWidth="2.7" strokeLinejoin="round"/><path d="M27.329 13.4932C25.8076 15.5922 24.3116 17.6798 22.7782 19.7549L22.7762 19.7588C22.3439 20.352 21.8753 20.6241 21.4139 20.6924C21.0005 20.7535 20.4985 20.6652 19.9159 20.3457L19.662 20.1944C18.516 19.4472 17.4357 18.8133 16.3563 18.0664C15.9011 17.7516 15.4147 17.5669 14.8856 17.586C14.4316 17.6023 14.024 17.7663 13.6552 17.9942L13.5009 18.0948C11.9858 19.1243 10.4651 20.0988 8.91492 21.1241L8.90808 21.128C8.79897 21.2018 8.71769 21.257 8.63953 21.3018C8.5736 21.3395 8.52845 21.3569 8.49988 21.3662C8.53024 21.3161 8.56734 21.2589 8.61609 21.1885C9.40307 20.1089 10.185 19.0287 10.9667 17.9502C11.749 16.8708 12.5303 15.7922 13.3163 14.7139L13.3212 14.708C13.6749 14.2123 14.3737 13.8738 15.1356 13.9375C15.1776 13.9437 15.2177 13.9502 15.2616 13.9571C15.2995 13.963 15.3406 13.9691 15.3846 13.9756C16.0419 14.1183 16.7554 14.5036 17.5028 15.0078C17.8722 15.2571 18.2347 15.5241 18.5917 15.7901C18.9432 16.052 19.2967 16.3185 19.6268 16.5469V16.5459C20.0704 16.8593 20.5493 17.0488 21.076 17.0362C21.5944 17.0236 22.0577 16.8176 22.4764 16.5391H22.4774L22.4862 16.5323C23.9812 15.5041 25.5141 14.5343 27.0692 13.5059L27.076 13.501C27.185 13.4273 27.2668 13.3725 27.3456 13.3272C27.4134 13.2882 27.4597 13.2678 27.4901 13.2578C27.4474 13.3242 27.3986 13.3954 27.329 13.4932Z" fill="#121212" stroke="#121212" strokeWidth="1.5"/></svg>
            </div>

            {/* Stories tray */}
            <div className="flex items-center gap-3 px-3 py-2 overflow-x-auto scrollbar-hide">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden" style={{ background: '#7797D7' }}>
                        {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <span className="text-[9px] text-[#121212] truncate max-w-[48px]">Your story</span>
                </div>
                {stories.map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                            <img src={STORY_IMAGES[i % STORY_IMAGES.length]} className="w-full h-full rounded-full border-2 border-white object-cover" alt="" />
                        </div>
                        <span className="text-[9px] text-[#121212] truncate max-w-[48px]">user_{i}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-black/10" />

            {/* Post header */}
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#7797D7' }}>
                        {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <span className="text-[13px] font-bold text-[#121212]">{account?.username || 'your.account'}</span>
                </div>
                <MoreHorizontal size={16} className="text-[#121212] rotate-90" />
            </div>

            {/* Carousel / post media */}
            <div className="relative w-full aspect-[4/5] bg-gray-100">
                {media.length > 0 ? (
                    <div
                        ref={carouselRef}
                        onScroll={handleCarouselScroll}
                        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    >
                        {media.map((url, i) => (
                            <img key={i} src={url} className="w-full h-full flex-shrink-0 snap-center object-cover" alt="" />
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No media</div>
                )}
                {media.length > 1 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-[10px]">
                        {media.map((_, i) => (
                            <button key={i} onClick={() => scrollToSlide(i)} className="w-[12.6px] h-[12.6px] rounded-full" style={{ background: i === carouselIdx ? '#4192EF' : '#C4C4C4' }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Action icons */}
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                    <Heart size={22} strokeWidth={1.5} className="text-[#121212]" />
                    <svg width="22" height="22" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M33.5056 32.7513L31.8366 26.5267C31.7408 26.1778 31.7887 25.8016 31.9528 25.4733C33.4098 22.5525 33.8955 19.064 32.9994 15.425C31.7818 10.5 27.9376 6.54632 23.0263 5.23983C21.6856 4.89098 20.3654 4.71997 19.0863 4.71997C9.9067 4.71997 2.73811 13.3319 5.21429 22.915C6.36345 27.3475 11.0969 31.9373 15.5499 33.0181C16.7538 33.3122 17.9372 33.449 19.0863 33.449C21.5557 33.449 23.8677 32.8129 25.8992 31.7185C26.1249 31.5953 26.378 31.5269 26.6243 31.5269C26.7474 31.5269 26.8705 31.5406 26.9937 31.5748L33.0541 33.1959C33.0883 33.2028 33.1225 33.2096 33.1499 33.2096C33.3825 33.2096 33.5671 32.9907 33.5056 32.7513ZM29.9213 27.0397L30.8652 30.5625L27.5067 29.6664C27.2194 29.5911 26.9253 29.5501 26.6243 29.5501C26.0497 29.5501 25.4683 29.7006 24.9484 29.981C23.1221 30.966 21.1521 31.4654 19.0863 31.4654C18.0671 31.4654 17.0342 31.3354 16.015 31.0891C12.2461 30.1726 8.09403 26.1231 7.1364 22.4157C6.13772 18.5441 6.92435 14.5699 9.29108 11.5123C11.6578 8.45475 15.2284 6.70364 19.0863 6.70364C20.2218 6.70364 21.3778 6.85413 22.5201 7.16194C26.7406 8.28374 30.017 11.6355 31.0773 15.9038C31.8229 18.9135 31.5151 21.9164 30.1812 24.5909C29.7982 25.357 29.7024 26.2257 29.9213 27.0397Z" fill="#121212" stroke="#121212" strokeWidth="1.10133"/></svg>
                    <svg width="20" height="18" viewBox="0 0 35 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M33.3633 1.25145C33.1151 0.813457 32.6406 0.550659 32.1296 0.550659L1.98821 0.572559C1.38231 0.572559 0.856716 0.944856 0.645018 1.50695C0.491719 1.91575 0.528219 2.35374 0.732617 2.71144C0.812917 2.84284 0.915116 2.96694 1.03921 3.07644L12.6534 13.0919L15.4858 28.1371C15.5953 28.7284 16.0479 29.1664 16.6465 29.2613C17.2378 29.3562 17.8218 29.0788 18.1284 28.5605L33.356 2.67494C33.6188 2.22964 33.6188 1.68945 33.3633 1.25145ZM4.03949 2.74064H28.5819L13.8068 11.1721L4.03949 2.74064ZM17.267 25.6989L14.8872 13.0554L29.6842 4.61672L17.267 25.6989Z" fill="#121212" stroke="#121212" strokeWidth="1.10133"/></svg>
                </div>
                <svg width="22" height="22" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.27 3.14661H6.48997C5.51647 3.14661 4.71997 3.85364 4.71997 4.72751V35.3445C4.71997 36.2184 5.29522 36.4408 6.01207 35.8291L18.1631 25.4857C18.4463 25.2474 18.9154 25.2474 19.1986 25.4778L31.739 35.853C32.4559 36.4488 33.04 36.2184 33.04 35.3445V4.72751C33.04 3.85364 32.2523 3.14661 31.27 3.14661ZM30.385 31.4995L20.9951 23.7301C20.3402 23.1899 19.5172 22.9198 18.6853 22.9198C17.8357 22.9198 16.9949 23.1978 16.34 23.7539L7.37497 31.3883V5.52987H30.385V31.4995Z" fill="#121212" stroke="#121212" strokeWidth="1.10133"/></svg>
            </div>

            {/* Likes */}
            <div className="px-3 text-[13px] font-bold text-[#121212]">1,234 likes</div>

            {/* Caption */}
            <div className="px-3 pt-1 text-[12px] text-[#121212] leading-snug">
                <span className="font-bold">{account?.username || 'your.account'} </span>
                <span>{text || <span className="text-gray-400 italic">Your caption…</span>}</span>
            </div>

            {/* Comment row */}
            <div className="flex items-center gap-2 px-3 py-2.5 mt-1">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#7797D7' }}>
                    {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                </div>
                <span className="flex-1 text-[12px] text-[#121212]/60">Add a comment...</span>
            </div>
            <div className="px-3 pb-2 text-[10px] text-gray-400">Just now</div>

            <div className="border-t border-black/10" />

            {/* Bottom tab bar */}
            <div className="flex items-center justify-around px-3 py-3">
                <svg width="20" height="20" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5934 19.7027C13.8283 19.7027 11.5867 21.9443 11.5867 24.7094V32.3876H1.57336V16.8963L16.5934 1.57336L31.6134 16.8963V32.3876H21.6V24.7094C21.6 21.9443 19.3585 19.7027 16.5934 19.7027Z" stroke="#121212" strokeWidth="3.14667" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <svg width="20" height="19" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14.16" cy="14.16" r="12.66" stroke="#121212" strokeWidth="3"/><line x1="31.4921" y1="31.0399" x2="22.6001" y2="22.1479" stroke="#121212" strokeWidth="3" strokeLinecap="round"/></svg>
                <div className="w-7 h-7 rounded-[8px] border-2 border-[#121212] flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} className="text-[#121212]" />
                </div>
                <Heart size={20} strokeWidth={1.8} className="text-[#121212]" />
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#7797D7' }}>
                    {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                </div>
            </div>
        </div>
    );
}

function TwitterPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    const truncated = text.length > 280;
    const display = truncated ? text.slice(0, 277) + '…' : text;
    return (
        <div className="bg-white p-3">
            <div className="flex gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                    {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[12px] font-black truncate">{account?.displayName || account?.username}</span>
                        <span className="text-[11px] text-gray-400 truncate">@{account?.username}</span>
                        <span className="text-[11px] text-gray-400">· now</span>
                    </div>
                    <div className="text-[12px] leading-relaxed mt-0.5 text-gray-900">
                        {display || <span className="text-gray-400">What&apos;s happening?</span>}
                    </div>
                    {media.length > 0 && (
                        <div className={cn("grid gap-0.5 mt-2 rounded-xl overflow-hidden", media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                            {media.slice(0, 4).map((url, i) => <img key={i} src={url} className="w-full aspect-square object-cover" alt="" />)}
                        </div>
                    )}
                    {truncated && <div className="text-[9px] text-red-500 mt-1">{text.length}/280 — will be cut off</div>}
                    <div className="flex items-center justify-between mt-2 max-w-[200px] text-gray-400">
                        <MessageCircle size={15} strokeWidth={1.5} />
                        <Repeat2 size={15} strokeWidth={1.5} />
                        <Heart size={15} strokeWidth={1.5} />
                        <Share2 size={15} strokeWidth={1.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedInPreview({ text, media, account }: { text: string; media: string[]; account: any }) {
    return (
        <div className="bg-white overflow-y-auto" style={{ maxHeight: 400 }}>
            <div className="flex items-start gap-2 p-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
                    {account?.avatar && <img src={account.avatar} className="w-full h-full object-cover" alt="" />}
                </div>
                <div>
                    <div className="text-[12px] font-bold leading-tight">{account?.displayName || account?.username}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">Your headline here</div>
                    <div className="text-[10px] text-gray-400 leading-tight">Just now · 🌐</div>
                </div>
            </div>
            <div className="px-3 pb-2 text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {text || <span className="text-gray-400 italic">Share an update…</span>}
            </div>
            {media.length > 0 && (
                <div className={cn("grid gap-0.5", media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {media.slice(0, 4).map((url, i) => <img key={i} src={url} className="w-full aspect-square object-cover" alt="" />)}
                </div>
            )}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-gray-500">
                <div className="flex items-center gap-1">
                    <ThumbsUp size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Like</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageCircle size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Comment</span>
                </div>
                <div className="flex items-center gap-1">
                    <Repeat2 size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Repost</span>
                </div>
                <div className="flex items-center gap-1">
                    <Share2 size={13} strokeWidth={1.5} />
                    <span className="text-[10px]">Send</span>
                </div>
            </div>
        </div>
    );
}

function GenericFeedPreview({ text, media, account, platform }: { text: string; media: string[]; account: any; platform: string }) {
    const color = PLATFORM_COLORS[platform] ?? '#174CD2';
    return (
        <div className="bg-white overflow-y-auto" style={{ maxHeight: 400 }}>
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: `2px solid ${color}` }}>
                    {account?.avatar
                        ? <img src={account.avatar} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: color + '20', color }}>{account?.username?.[0]?.toUpperCase()}</div>}
                </div>
                <div>
                    <div className="text-[11px] font-bold">{account?.displayName || account?.username}</div>
                    <div className="text-[9px] text-gray-400">Just now</div>
                </div>
            </div>
            <div className="p-3 text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {text || <span className="text-gray-400 italic">Your content here…</span>}
            </div>
            {media.length > 0 && (
                <div className={cn("grid gap-0.5", media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {media.slice(0, 4).map((url, i) => <img key={i} src={url} className="w-full aspect-square object-cover" alt="" />)}
                </div>
            )}
            <div className="px-3 py-2 border-t border-gray-100 flex gap-4 text-gray-500 text-[10px] font-bold">
                <span>Like</span><span>Comment</span><span>Share</span>
            </div>
        </div>
    );
}

// ─── Main preview panel ────────────────────────────────────────────────────

// Dev-only: lets the preview render sample data when no real account is connected
// (e.g. on localhost, before OAuth is set up), so the design can be reviewed live.
const DEV_PREVIEW_FALLBACK = process.env.NODE_ENV !== 'production';
const sampleSlide = (label: string, color: string) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' fill='#fff' font-family='sans-serif' font-size='32' font-weight='bold' text-anchor='middle' dy='.35em'>${label}</text></svg>`)}`;
const DEV_SAMPLE_MEDIA = [sampleSlide('Slide 1', '%237797D7'), sampleSlide('Slide 2', '%23E9C46A'), sampleSlide('Slide 3', '%23E76F51')];

function PhoneMockupPreview({ previewData, accounts }: {
    previewData: PreviewData; accounts: any[];
}) {
    // Build unique platform entries, preserving account metadata
    const platformAccounts: { platform: string; account: any }[] = [];
    accounts
        .filter(a => previewData.selectedAccountIds.includes(a.id))
        .forEach(a => {
            const p = a.platform?.toUpperCase();
            if (p && !platformAccounts.find(x => x.platform === p)) platformAccounts.push({ platform: p, account: a });
        });

    const current = platformAccounts[0] ?? null;
    const usingDevFallback = !current && DEV_PREVIEW_FALLBACK;
    const effective = current ?? (usingDevFallback ? { platform: 'INSTAGRAM', account: { username: 'preview.account', avatar: null } } : null);
    const { text, mediaPreviews, mediaTypes = [], tiktokHashtags } = previewData;
    const effectiveText = usingDevFallback ? (text || 'Sample caption for previewing the design…') : text;
    const effectiveMedia = usingDevFallback && mediaPreviews.length === 0 ? DEV_SAMPLE_MEDIA : mediaPreviews;

    return (
        <div className="rounded-[16px] overflow-hidden border border-black/10 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            {/* Platform UI render */}
            <div className="overflow-hidden">
                {!effective ? null : effective.platform === 'TIKTOK' ? (
                    <TikTokPreview text={effectiveText} media={effectiveMedia} mediaTypes={mediaTypes} account={effective.account} tiktokHashtags={tiktokHashtags} />
                ) : effective.platform === 'INSTAGRAM' ? (
                    <InstagramPreview text={effectiveText} media={effectiveMedia} account={effective.account} />
                ) : effective.platform === 'TWITTER' || effective.platform === 'X' ? (
                    <TwitterPreview text={effectiveText} media={effectiveMedia} account={effective.account} />
                ) : effective.platform === 'LINKEDIN' ? (
                    <LinkedInPreview text={effectiveText} media={effectiveMedia} account={effective.account} />
                ) : (
                    <GenericFeedPreview text={effectiveText} media={effectiveMedia} account={effective.account} platform={effective.platform} />
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const params = useParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';

    return (
        <Suspense fallback={<SpinningLoader fullScreen={true} />}>
            <SocketProvider workspaceId={workspaceId}>
                <DashboardContent />
            </SocketProvider>
        </Suspense>
    );
}

function DashboardContent() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const toast = useAppToast();
    const searchParams = useSearchParams();
    const workspaceId = typeof params?.id === 'string' ? params.id : '';
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    // UI States
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [quickCreateDate, setQuickCreateDate] = useState<string | undefined>(undefined);

    // Composer preview panel state
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData>({ text: '', mediaPreviews: [], mediaTypes: [], selectedAccountIds: [], tiktokHashtags: '' });
    
    // OAUTH STATES
    const [isFbPageSelectorOpen, setIsFbPageSelectorOpen] = useState(
        () => searchParams.get('social_selection') === 'facebook'
    );
    const [tempExchangeToken, setTempExchangeToken] = useState(
        () => searchParams.get('exchange_token') ?? ""
    );
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newWorkspaceTimezone, setNewWorkspaceTimezone] = useState(() => getBrowserTimezone());
    const [newWorkspaceRequiresApproval, setNewWorkspaceRequiresApproval] = useState(false);
    const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
    const [timezoneSearch, setTimezoneSearch] = useState("");
    const [searchTerm] = useState("");

    // Notifications
    type AppNotif = { id: string; type: 'success' | 'error' | 'info'; message: string; time: string; read: boolean };
    const notifKey = `eazlypost_notifs_${workspaceId}`;
    const [, setNotifications] = useState<AppNotif[]>(() => {
        if (typeof window === 'undefined') return [];
        try { return JSON.parse(localStorage.getItem(`eazlypost_notifs_${workspaceId}`) || '[]'); } catch { return []; }
    });
    const addNotification = useCallback((type: AppNotif['type'], message: string) => {
        const notif: AppNotif = { id: Date.now().toString(), type, message, time: new Date().toISOString(), read: false };
        setNotifications(prev => {
            const next = [notif, ...prev].slice(0, 50);
            try { localStorage.setItem(`eazlypost_notifs_${workspaceId}`, JSON.stringify(next)); } catch {}
            return next;
        });
    }, [workspaceId]);

    // Theme switcher
    const [isDark] = useState(false);
    
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    // Switching tabs should land at the top, not keep the previous tab's scroll position
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    // Load Meta FB SDK for WhatsApp Embedded Signup
    useEffect(() => {
        if (typeof window === 'undefined' || (window as any).FB) return;
        const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
        if (!metaAppId) return;
        (window as any).fbAsyncInit = function () {
            (window as any).FB.init({ appId: metaAppId, autoLogAppEvents: true, xfbml: true, version: 'v21.0' });
        };
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }, []);

    // --- QUERIES ---
    const { data: myWorkspaces = [] } = useQuery({
        queryKey: ['workspaces'],
        queryFn: () => api.get<any[]>('/workspaces').then(res => Array.isArray(res) ? res : (res as any)?.data || [])
    });

    const { data: currentUser } = useQuery({
        queryKey: ['auth-profile'],
        queryFn: () => api.get<any>('/auth/profile'),
    });

    const handleLogout = useCallback(() => {
        deleteCookie('accessToken');
        router.push('/login');
    }, [router]);

    const { data: currentWorkspace, isLoading: currentWsLoading } = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: () => api.get<any>(`/workspaces/${workspaceId}`).then(res => res?.data || res),
        enabled: !!workspaceId,
    });

    const { data: members = [] } = useQuery({
        queryKey: ['team-members', workspaceId],
        queryFn: () => api.get<any[]>(`/workspaces/${workspaceId}/members`).then(res => res || []),
        enabled: !!workspaceId,
    });

    const workspaceTimezone = currentWorkspace?.timezone || 'UTC';
    const currentUserMember = members.find((m: any) => m.user?.id === currentUser?.id || m.user?.email === currentUser?.email);
    const canApprove = currentUserMember?.role === 'OWNER' || currentUserMember?.role === 'ADMIN' || currentWorkspace?.ownerId === currentUser?.id;

    const { data: accounts = [], refetch: refetchAccounts } = useQuery({
        queryKey: ['social-accounts', workspaceId],
        queryFn: () => api.get<any[]>(`/social-accounts?workspaceId=${workspaceId}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
    });

    const { data: posts = [], refetch: refetchPosts, isLoading: postsLoading } = useQuery({
        queryKey: ['posts', workspaceId, searchTerm],
        queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}&search=${encodeURIComponent(searchTerm)}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
        enabled: !!workspaceId,
        refetchInterval: 60000,
    });

    // 🟢 REAL-TIME LISTENERS
    useEffect(() => {
        if (!socket) return;

        socket.on('post_created', (newPost) => {
            addNotification('success', `Post published: "${newPost.content.substring(0, 50)}${newPost.content.length > 50 ? '…' : ''}"`);
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        socket.on('post_updated', (updatedPost) => {
            addNotification('info', `Post updated: "${updatedPost.content.substring(0, 50)}${updatedPost.content.length > 50 ? '…' : ''}"`);
            // Patch the cache immediately so the card flips status live, without waiting on the refetch round-trip
            queryClient.setQueryData(['posts', workspaceId, searchTerm], (old: any[] = []) =>
                old.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
            );
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        socket.on('post_deleted', ({ id }) => {
            addNotification('info', 'A post was removed from the queue');
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        });

        return () => {
            socket.off('post_created');
            socket.off('post_updated');
            socket.off('post_deleted');
        };
    }, [socket, workspaceId, searchTerm, queryClient, refetchPosts]);

    // 🟢 MANUAL UPDATE HELPER (Optimistic UI)
    const manuallyAddAccount = (newAccount: any) => {
        queryClient.setQueryData(['social-accounts', workspaceId], (oldData: any[]) => {
            if (!oldData) return [newAccount];
            const exists = oldData.some(a => a.id === newAccount.id);
            return exists ? oldData : [...oldData, newAccount];
        });
    };

    // --- INVITE ACCEPTANCE ---
    const inviteProcessedRef = useRef(false);
    useEffect(() => {
        const inviteToken = searchParams.get('invite');
        if (!inviteToken || !workspaceId || inviteProcessedRef.current) return;
        inviteProcessedRef.current = true;

        api.post(`/workspaces/${workspaceId}/members/accept`, { token: inviteToken })
            .then(() => {
                toast.success('You joined the workspace!');
                queryClient.invalidateQueries({ queryKey: ['team-members', workspaceId] });
                queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            })
            .catch(() => {})
            .finally(() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('invite');
                url.searchParams.delete('email');
                window.history.replaceState(null, '', url.toString());
            });
    }, [searchParams, workspaceId, queryClient]);

    // --- OAUTH LOGIC ---
    useEffect(() => {
        const selectionMode = searchParams.get('social_selection');
        const connected = searchParams.get('social_connected');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const token = searchParams.get('exchange_token');

        if (connected === 'true' || success === 'true') {
            toast.success(t('Social account connected successfully', 'Compte social connecté avec succès'));
            setTimeout(() => addNotification('success', 'Social account connected successfully'), 0);
            const url = new URL(window.location.href);
            url.searchParams.delete('social_connected');
            url.searchParams.delete('social_selection');
            url.searchParams.delete('exchange_token');
            url.searchParams.delete('platform');
            url.searchParams.delete('success');
            window.history.replaceState(null, '', url.pathname);
            refetchAccounts();
            queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
        } else if (error) {
            const oauthErrors: Record<string, [string, string]> = {
                IG_NO_BUSINESS_ACCOUNT: [
                    'Instagram requires a Business or Creator account linked to a Facebook Page. Go to Instagram → Settings → Account type to switch, then retry.',
                    "Instagram nécessite un compte Professionnel ou Créateur lié à une Page Facebook. Allez sur Instagram → Paramètres → Type de compte pour changer, puis réessayez.",
                ],
                IG_NO_FACEBOOK_PAGE: [
                    'Please connect your Facebook Page first, then reconnect Instagram.',
                    "Veuillez d'abord connecter votre Page Facebook, puis reconnecter Instagram.",
                ],
                FB_NO_PAGE: [
                    'No Facebook Pages found — your app permissions have been reset. Please click Connect Facebook again and make sure to grant access to your Page on the consent screen.',
                    "Aucune Page Facebook trouvée — les permissions ont été réinitialisées. Cliquez à nouveau sur Connecter Facebook et accordez l'accès à votre Page sur l'écran de consentement.",
                ],
                FB_PERMISSION_DENIED: [
                    'You denied access to your Facebook Pages. Please click Connect Facebook again and check the box to allow Eazlypost to manage your Page.',
                    "Vous avez refusé l'accès à vos Pages Facebook. Cliquez à nouveau sur Connecter Facebook et cochez la case pour autoriser Eazlypost à gérer votre Page.",
                ],
                FB_NO_PAGES_EXISTS: [
                    'No Facebook Pages found on your account. To connect Facebook, you need a Facebook Page (not a personal profile). Create one at facebook.com/pages/create, then try again.',
                    "Aucune Page Facebook trouvée sur votre compte. Pour connecter Facebook, vous avez besoin d'une Page Facebook (pas d'un profil personnel). Créez-en une sur facebook.com/pages/create, puis réessayez.",
                ],
                IG_API_ERROR: [
                    'Instagram connection failed. Please try again.',
                    'La connexion Instagram a échoué. Veuillez réessayer.',
                ],
                OAUTH_SESSION_LOST: [
                    'Connection session expired. Please try again.',
                    'La session de connexion a expiré. Veuillez réessayer.',
                ],
            };
            const [en, fr] = oauthErrors[error] ?? [error, error];
            toast.error(t(en, fr), { duration: 8000 });
            setTimeout(() => addNotification('error', t(en, fr)), 0);
            const url = new URL(window.location.href);
            url.searchParams.delete('error');
            window.history.replaceState(null, '', url.pathname);
        }
    }, [searchParams, queryClient, workspaceId, refetchAccounts]); // eslint-disable-line react-hooks/exhaustive-deps


    // --- MUTATIONS ---
    const createWorkspaceMutation = useMutation({
        mutationFn: (payload: { name: string; timezone: string; requiresApproval: boolean }) => api.post<any>('/workspaces', payload),
        onSuccess: (res) => {
            setIsCreateModalOpen(false);
            setNewWorkspaceName("");
            setNewWorkspaceTimezone(getBrowserTimezone());
            setNewWorkspaceRequiresApproval(false);
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            router.push(`/dashboard/${res.data.id}`);
        },
        onError: () => {}
    });

    const upsertPostMutation = useMutation({
        mutationFn: (payload: any) => {
            if (payload.id) return api.patch(`/posts/${payload.id}`, payload);
            return api.post('/posts', payload);
        },
        onSuccess: () => {
            addNotification('success', 'Post saved and scheduled successfully');
            refetchPosts();
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            setEditingPost(null);
            setQuickCreateDate(undefined);
            setIsPreviewMode(false);
        },
        onError: () => {
            addNotification('error', 'Post failed to save — please retry');
        }
    });

    const handleCreateWorkspace = () => {
        if (!newWorkspaceName.trim()) return;
        createWorkspaceMutation.mutate({
            name: newWorkspaceName,
            timezone: newWorkspaceTimezone,
            requiresApproval: newWorkspaceRequiresApproval,
        });
    };

    const handleAddPost = async (content: string, date?: Date, mediaIds?: string[], status: 'DRAFT' | 'SCHEDULED' | 'REVIEW' = 'DRAFT', selectedAccountIds?: string[], postId?: string, targetWorkspaceId?: string, platformMeta?: Record<string, any>) => {
        const raw = selectedAccountIds && selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
        // Strip IDs that are no longer in the current workspace's account list (stale Composer state)
        const validAccountIds = new Set(accounts.map((a: any) => a.id));
        const targets = raw.filter((id: string) => validAccountIds.has(id));
        if (targets.length === 0) return;
        upsertPostMutation.mutate({
            id: postId,
            workspaceId: targetWorkspaceId || workspaceId,
            content,
            scheduledFor: date ? date.toISOString() : undefined,
            status,
            socialAccountIds: targets,
            mediaIds: mediaIds || [],
            ...(platformMeta ? { platformMeta } : {}),
        });
    };

    const handleVoiceCommand = (transcription: string) => {
        const text = transcription.toLowerCase();
        if (text.includes("analytics")) setActiveTab("analytics");
        else if (text.includes("team")) setActiveTab("team");
        else if (text.includes("queue")) setActiveTab("queue");
        else {}
    };

    const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

    if (currentWsLoading) return <SpinningLoader fullScreen={true} />;
    
    const navItems = [
        { id: 'queue', label: t('Queue', 'File'), icon: Layers },
        { id: 'calendar', label: t('Calendar', 'Calendrier'), icon: CalendarIcon },
        { id: 'boards', label: t('Boards', 'Tableaux'), icon: Layout },
        { id: 'analytics', label: t('Analytics', 'Analytique'), icon: BarChart2 },
        { id: 'engagement', label: t('Inbox', 'Messages'), icon: MessageCircle },
        { id: 'team', label: t('Team', 'Équipe'), icon: Users },
        { id: 'settings', label: t('Config', 'Config'), icon: SettingsIcon }
    ];

    return (
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#040028] font-sans text-[#040028] dark:text-white relative transition-colors duration-300 -mt-16 md:-mt-1">

            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-white dark:bg-[#0A0A2E] border-b border-black/5 dark:border-white/10 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2"><button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-[10px] active:bg-[#174CD2]/10 transition-colors"><Menu size={22} className="text-[#040028] dark:text-white" /></button><div className="font-['Rubik_One'] text-lg text-[#174CD2]">Eazlypost</div></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10"><img src={currentWorkspace?.logo || getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div></div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-[#040028]/40 z-50 backdrop-blur-sm" /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0A0A2E] flex flex-col z-50 shadow-[0_0_40px_rgba(0,0,0,0.15)]"><div className="p-6 flex justify-between items-center bg-[#174CD2] text-white"><span className="font-bold text-xl">Menu</span><button onClick={() => setIsSidebarOpen(false)} className="text-white/80 hover:text-white transition-colors p-1"><X/></button></div><nav className="p-4 space-y-2">{navItems.map(item => (<SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} />))}</nav></motion.aside></>
                )}
            </AnimatePresence>

            {/* Main Layout */}
            <main className="relative z-10 flex flex-col min-h-screen">
                <header className="hidden lg:flex sticky top-0 z-30 h-16 shrink-0 bg-white/90 dark:bg-[#0A0A2E]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 items-center justify-between px-8">
                    <div className="flex items-center gap-8 self-stretch -ml-8">
                        <div className="relative group self-stretch"><button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="w-72 h-full flex items-center gap-3 pl-8 pr-6 border-r border-gray-200 dark:border-white/10 bg-[#F7F6F3] dark:bg-[#0A0A2E] transition-colors"><div className="w-7 h-7 rounded-full overflow-hidden bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10"><img src={currentWorkspace?.logo || getAvatarUrl(currentWorkspace?.name || 'User')} className="w-full h-full object-cover" /></div><span className="text-sm font-semibold truncate max-w-[120px] text-[#040028] dark:text-white">{currentWorkspace?.name || 'Select'}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90 text-[#040028]/50 dark:text-white/50"><path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                            <AnimatePresence>{isAccountMenuOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-3 right-3 mt-2 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 origin-top overflow-hidden">{myWorkspaces.map((ws: any) => { const isSelected = currentWorkspace?.id === ws.id; return (<button key={ws.id} onClick={() => { router.push(`/dashboard/${ws.id}`); setIsAccountMenuOpen(false); }} className={cn("w-full flex items-center gap-3 h-12 px-4 text-left transition-colors", isSelected ? "bg-[#F7F6F3] dark:bg-white/5" : "hover:bg-[#F7F6F3] dark:hover:bg-white/10")}><div className="w-6 h-6 rounded-full overflow-hidden bg-gray-50 dark:bg-white/10 flex-shrink-0"><img src={ws.logo || getAvatarUrl(ws.name)} className="w-full h-full object-cover" /></div><span className="flex-1 text-base font-medium truncate text-[#171717] dark:text-white">{ws.name}</span>{isSelected && <Check size={20} className="text-[#171717] dark:text-white flex-shrink-0"/>}</button>); })}<div className="h-px bg-black/5 dark:bg-white/10 my-1"/><button onClick={() => { setIsCreateModalOpen(true); setIsAccountMenuOpen(false); }} className="w-full flex items-center gap-3 h-12 px-4 text-base font-medium text-[#171717] dark:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-colors"><Plus size={20}/> {t("New workspace", "Nouvel espace")}</button><div className="h-px bg-black/5 dark:bg-white/10 my-1"/><div className="px-4 py-2 text-sm text-gray-400 truncate">{currentUser?.email}</div><button onClick={handleLogout} className="w-full flex items-center gap-3 h-12 px-4 text-base font-medium text-[#171717] dark:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 7L21 12L16 17M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> {t("Log out", "Déconnexion")}</button></motion.div>)}</AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Desktop left rail — nav, docked below the header */}
                <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-72 bg-[#F7F6F3] dark:bg-[#0A0A2E] border-r border-gray-200 dark:border-white/10 p-4 overflow-hidden z-20">
                    <nav className="space-y-1.5">{navItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id as TabType)} className={`w-full flex items-center justify-between px-4 py-3 rounded-[10px] border transition-all duration-200 group ${activeTab === item.id ? 'bg-white dark:bg-white/5 border-[#D9D9D9] dark:border-white/10 text-[#040028] dark:text-white' : 'border-transparent text-[#040028] dark:text-white hover:bg-[#174CD2]/8'}`}><div className="flex items-center gap-3"><item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} /><span className="font-semibold text-sm">{item.label}</span></div></button>))}</nav>

                    <div className="flex-1 flex items-center justify-center py-4">
                        <QuickConnectSidebar
                            accounts={accounts}
                            workspaceId={workspaceId}
                            currentWorkspace={currentWorkspace}
                            refreshData={() => {
                                refetchAccounts();
                                queryClient.invalidateQueries({ queryKey: ['social-accounts', workspaceId] });
                            }}
                            onManageChannels={() => setActiveTab('settings')}
                        />
                    </div>

                    <div className="mt-6 mb-4 p-5 rounded-[14px] bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-dashed border-black/10 dark:border-white/15 transition-colors"><p className="text-xs font-semibold text-[#040028] dark:text-white mb-2 uppercase tracking-wider">{t("Subscription", "Abonnement")}</p><div className="flex justify-between items-end gap-3 text-[#040028] dark:text-white"><span
  className={`text-xl font-bold truncate min-w-0 ${
    !currentWorkspace?.owner?.planType || currentWorkspace.owner.planType === 'FREE'
      ? 'text-gray-400'
      : currentWorkspace.owner.planType === 'STARTER'
      ? 'text-[#174CD2]'
      : currentWorkspace.owner.planType === 'PRO'
      ? 'text-[#174CD2] animate-pulse'
      : currentWorkspace.owner.planType === 'PROFESSIONAL'
      ? 'animate-rainbow-rtl'
      : currentWorkspace.owner.planType === 'ENTERPRISE'
      ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 bg-clip-text text-transparent animate-pulse'
      : 'text-green-600'
  }`}
>{currentWorkspace?.owner?.planType || 'FREE'}</span><button onClick={() => setActiveTab('settings')} className="flex-shrink-0 text-xs font-semibold underline hover:text-[#174CD2] hover:bg-[#E5E5E5] dark:hover:bg-white/10 rounded-[4px] px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors">{t("Manage", "Gérer")}</button></div></div>
                </aside>

                <div className={cn(
                    "flex-1 bg-white dark:bg-[#0A0A2E] lg:pl-72",
                    activeTab === 'engagement'
                        ? "p-0 pb-0 pt-0 md:pl-8 md:pr-4 md:pb-32 md:pt-8"
                        : "px-3 sm:px-4 md:pl-8 md:pr-4 pb-32 pt-4 md:pt-8"
                )}>
                    <div className="max-w-[1600px] mx-auto">
                        <div className="min-w-0">
                            {/* OnboardingGuide hidden — not enough space */}
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className={cn(activeTab === 'engagement' ? "m-0 md:ml-4" : "ml-0 md:ml-4")}>

                                    {activeTab === 'queue' && (
                                        <div className="grid gap-8">
                                                <Composer
                                    workspaceId={workspaceId}
                                    onSchedule={handleAddPost}
                                    accounts={accounts}
                                    postToEdit={editingPost}
                                    initialDate={quickCreateDate}
                                    isPreviewActive={isPreviewMode}
                                    onPreviewToggle={() => setIsPreviewMode(v => !v)}
                                    onPreviewDataChange={setPreviewData}
                                    workspaceTimezone={workspaceTimezone}
                                />
                                            <div className="mt-4"><PostFeed posts={posts} accounts={accounts} workspaceId={workspaceId} onEdit={setEditingPost} isLoading={postsLoading} canApprove={canApprove} workspaceTimezone={workspaceTimezone} /></div>
                                        </div>
                                    )}
                                    {activeTab === 'calendar' && (
                                        <div className="space-y-4">
                                            <div className="hidden md:flex justify-between items-center">
                                                <h2 className="text-xl font-bold text-[#040028] dark:text-white">{t("Content timeline", "Calendrier de contenu")}</h2>
                                                <NeuButton onClick={() => setActiveTab('queue')} className="hover:border-[#D9D9D9] dark:hover:border-white/20">+ {t("Quick post", "Publication rapide")}</NeuButton>
                                            </div>
                                            <CalendarView
                                                workspaceId={workspaceId}
                                                canApprove={canApprove}
                                                workspaceTimezone={workspaceTimezone}
                                                onQuickPost={() => {
                                                    setEditingPost(null);
                                                    setActiveTab('queue');
                                                }}
                                                onPostClick={(post) => {
                                                    if (post.status === 'PUBLISHED') {
                                                        toast.info(t('Published posts cannot be edited', 'Les publications publiées ne peuvent pas être modifiées'));
                                                        return;
                                                    }
                                                    setEditingPost(post);
                                                    setActiveTab('queue');
                                                }}
                                                onDateClick={(date) => {
                                                    setEditingPost(null);
                                                    setQuickCreateDate(date);
                                                    setActiveTab('queue');
                                                }}
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'boards' && <BoardView workspaceId={workspaceId} />}
                                    {activeTab === 'analytics' && <Analytics />}
                                    {activeTab === 'engagement' && <EngagementWithTabs />}
                                    {activeTab === 'team' && <Team workspaceId={workspaceId} />}
                                    {activeTab === 'settings' && <NeuCard className="p-6 md:p-8"><Settings workspaceId={workspaceId} workspaceName={currentWorkspace?.name} /></NeuCard>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {isPreviewMode && (
                            <div className="hidden lg:block sticky top-16 self-start w-80">
                                <AnimatePresence mode="wait">
                                    <motion.div key="preview" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                        <PhoneMockupPreview
                                            previewData={previewData}
                                            accounts={accounts}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <NeuModal
                title={t("Create workspace", "Créer un espace")}
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                headerClassName="bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white"
                iconClassName="text-[#040028]/70 hover:text-[#040028] dark:text-white/70 dark:hover:text-white"
                maxWidth="max-w-2xl"
                className="min-h-[520px]"
            >
                <div className="flex flex-col h-full space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold mb-1.5 block text-[#040028] dark:text-white">{t("Workspace name", "Nom de l'espace")}</label>
                            <NeuInput
                                value={newWorkspaceName}
                                onChange={(e: any) => setNewWorkspaceName(e.target.value)}
                                placeholder={t("e.g. Digital Agency", "ex : Agence digitale")}
                                className="focus:border-[#040028] focus:ring-[#040028]/15"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold mb-1.5 block text-[#040028] dark:text-white">{t("Timezone", "Fuseau horaire")}</label>
                            <Popover open={isTimezoneOpen} onOpenChange={(open) => { setIsTimezoneOpen(open); if (!open) setTimezoneSearch(""); }}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 py-2.5 font-medium text-sm text-left text-[#040028] dark:text-white hover:border-[#040028]/40 focus:outline-none focus:border-[#040028] focus:ring-2 focus:ring-[#040028]/15 transition-all"
                                    >
                                        <span className="truncate">{newWorkspaceTimezone}</span>
                                        <ChevronDown size={14} className={cn("shrink-0 opacity-50 transition-transform", isTimezoneOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-[110] overflow-hidden" align="start">
                                    <div className="p-2 border-b border-black/5 dark:border-white/5">
                                        <NeuInput
                                            value={timezoneSearch}
                                            onChange={(e: any) => setTimezoneSearch(e.target.value)}
                                            placeholder={t("Search timezone...", "Rechercher un fuseau...")}
                                            className="focus:border-[#040028] focus:ring-[#040028]/15"
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto py-1">
                                        {getSupportedTimezones().filter(tz => tz.toLowerCase().includes(timezoneSearch.toLowerCase())).map((tz) => (
                                            <button
                                                key={tz}
                                                type="button"
                                                onClick={() => { setNewWorkspaceTimezone(tz); setIsTimezoneOpen(false); setTimezoneSearch(""); }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 h-9 px-4 text-left transition-colors text-sm font-medium text-[#040028] dark:text-white",
                                                    tz === newWorkspaceTimezone ? "bg-[#F7F6F3] dark:bg-white/5" : "hover:bg-[#F7F6F3] dark:hover:bg-white/10"
                                                )}
                                            >
                                                <span className="flex-1 truncate">{tz}</span>
                                                {tz === newWorkspaceTimezone && <Check size={16} className="shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-[10px] border border-black/5 dark:border-white/5 bg-[#F7F6F3] dark:bg-white/5">
                        <div>
                            <p className="text-sm font-semibold text-[#040028] dark:text-white">{t("Require approval before publishing", "Exiger une approbation avant publication")}</p>
                            <p className="text-xs text-[#8E8E8E] mt-0.5">{t("Posts from non-owner/admin members need approval first", "Les publications des membres non-propriétaires/admins doivent d'abord être approuvées")}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNewWorkspaceRequiresApproval(v => !v)}
                            className={cn("flex-shrink-0 ml-4 w-11 h-6 rounded-full transition-colors relative", newWorkspaceRequiresApproval ? "bg-[#040028]" : "bg-[#D9D9D9] dark:bg-white/10")}
                        >
                            <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform", newWorkspaceRequiresApproval && "translate-x-5")} />
                        </button>
                    </div>
                    <div className="flex-1" />
                    <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <NeuButton onClick={() => setIsCreateModalOpen(false)} className="hover:border-[#040028]/40">{t("Cancel", "Annuler")}</NeuButton>
                        <NeuButton onClick={handleCreateWorkspace} active className="bg-[#040028] hover:bg-[#040028]/90">{t("Create", "Créer")}</NeuButton>
                    </div>
                </div>
            </NeuModal>
            
            <FacebookPageSelector 
                isOpen={isFbPageSelectorOpen} 
                onClose={() => { 
                    setIsFbPageSelectorOpen(false); 
                    const url = new URL(window.location.href);
                    url.searchParams.delete('social_selection');
                    url.searchParams.delete('exchange_token');
                    window.history.replaceState(null, '', url.pathname);
                }} 
                onAccountConnected={manuallyAddAccount} 
                exchangeToken={tempExchangeToken} 
            />
        </div>
    );
}
