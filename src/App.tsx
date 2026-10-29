/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeTicker } from './components/MarqueeTicker';
import { SocialPlatformsGrid } from './components/SocialPlatformsGrid';
import { RealVideosSection } from './components/RealVideosSection';
import { DirectContactSection } from './components/DirectContactSection';
import { QRCodeModal } from './components/QRCodeModal';
import { QuickDock } from './components/QuickDock';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import {
  Language,
  SocialPlatform,
  RealVideo,
  INITIAL_SOCIAL_PLATFORMS,
  REAL_YOUTUBE_VIDEOS
} from './data/influencerData';
import { authenticateAdmin, fetchOnlineData, saveOnlineData } from './services/apiService';
import { Check } from 'lucide-react';

const checkIsAdminPath = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase().replace(/\/$/, '');
  const search = window.location.search.toLowerCase();

  return (
    path.endsWith('/pitadmin') ||
    path.includes('/pitadmin') ||
    path.includes('pitadmin') ||
    hash.includes('pitadmin') ||
    hash === '#/pitadmin' ||
    hash === '#pitadmin' ||
    search.includes('pitadmin') ||
    search.includes('p=/pitadmin') ||
    search.includes('page=pitadmin')
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [highlightedPlatformId, setHighlightedPlatformId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(checkIsAdminPath);

  // Managed customizable platforms (loaded from localStorage or default)
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(() => {
    try {
      const saved = localStorage.getItem('pita_custom_platforms');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load custom platforms', e);
    }
    return INITIAL_SOCIAL_PLATFORMS;
  });

  // Managed customizable videos (loaded from localStorage or default)
  const [videos, setVideos] = useState<RealVideo[]>(() => {
    try {
      const saved = localStorage.getItem('pita_custom_videos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load custom videos', e);
    }
    return REAL_YOUTUBE_VIDEOS;
  });

  // Fetch online data on mount and sync periodically across all connected clients in real-time
  useEffect(() => {
    let isSubscribed = true;

    const syncWithServer = async () => {
      // Don't overwrite if admin is actively in the admin portal editing
      if (isAdminView) return;

      const online = await fetchOnlineData();
      if (!isSubscribed || !online) return;

      if (Array.isArray(online.platforms)) {
        setPlatforms(online.platforms);
      }
      if (Array.isArray(online.videos)) {
        setVideos(online.videos);
      }
    };

    // Initial immediate sync
    syncWithServer();

    // Fast live sync every 4 seconds so any other browser/visitor sees changes in real-time
    const interval = setInterval(syncWithServer, 4000);

    // Sync when tab becomes visible or focused
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isAdminView]);

  // URL / route listener for /pitadmin and #/pitadmin
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(checkIsAdminPath());
    };

    // Secret shortcut: Alt + P to open admin directly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key.toLowerCase() === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p')
      ) {
        e.preventDefault();
        window.location.hash = '#/pitadmin';
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSaveData = async (
    newData: { platforms: SocialPlatform[]; videos: RealVideo[] },
    password: string
  ) => {
    setPlatforms(newData.platforms);
    setVideos(newData.videos);
    await saveOnlineData(newData, password);
  };

  const handleExitAdmin = () => {
    setIsAdminView(false);
    if (window.location.hash.includes('pitadmin')) {
      window.location.hash = '';
    }
    if (window.location.search.includes('pitadmin')) {
      const cleanSearch = window.location.search.replace(/[?&]p(itadmin)?(=[^&]*)?/gi, '');
      const newUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '');
      window.history.pushState(null, '', newUrl);
    }
    if (window.location.pathname.includes('/pitadmin') || window.location.pathname.includes('pitadmin')) {
      const newPath = window.location.pathname.replace(/\/pitadmin\/?$/i, '') || '/';
      window.history.pushState(null, '', newPath);
    }
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'fr' : 'ar'));
  };

  const handleCopyProfileLink = () => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSelectPlatform = (platformId: string) => {
    setHighlightedPlatformId(platformId);
    const element = document.getElementById(`platform-card-${platformId}`) || document.getElementById('platforms');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // If URL matches /pitadmin or #/pitadmin, render Admin View
  if (isAdminView) {
    return (
      <AdminPortal
        currentPlatforms={platforms}
        currentVideos={videos}
        initialLang={lang}
        onLogin={authenticateAdmin}
        onSaveData={handleSaveData}
        onExit={handleExitAdmin}
      />
    );
  }

  const isAr = lang === 'ar';

  return (
    <div
      className="min-h-screen bg-[#070614] text-zinc-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-zinc-950 transition-colors duration-300"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
    >
      {/* Toast Notification */}
      {copiedLink && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black text-xs rounded-full shadow-2xl shadow-indigo-900/80 flex items-center gap-2 animate-bounce border border-cyan-400/50">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>
            {isAr ? 'تم نسخ رابط الموقع الرسمي لـ MEHDI PITA!' : 'Lien officiel de MEHDI PITA copié !'}
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={toggleLang}
        onOpenQr={() => setIsQrOpen(true)}
        onCopyLink={handleCopyProfileLink}
        copied={copiedLink}
      />

      {/* Main Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          lang={lang}
          platforms={platforms}
          onSelectPlatform={handleSelectPlatform}
        />

        {/* Endless Scrolling Ribbon 1 (Dynamic follower counts) */}
        <MarqueeTicker lang={lang} platforms={platforms} speed="normal" />

        {/* All Official Social Media Accounts Grid (Instagram, Facebook, YouTube, TikTok) */}
        <SocialPlatformsGrid
          lang={lang}
          platforms={platforms}
          onSelectPreview={(platform) => handleSelectPlatform(platform.id)}
          selectedPlatformId={highlightedPlatformId}
        />

        {/* Second Endless Scrolling Ribbon 2 (Opposite direction, never stopping) */}
        <MarqueeTicker lang={lang} platforms={platforms} speed="fast" reverse={true} />

        {/* Real YouTube Featured Videos Player (Dynamic configurable videos) */}
        <RealVideosSection lang={lang} videos={videos} />

        {/* Direct Contact & Fan Hype Section */}
        <DirectContactSection lang={lang} platforms={platforms} />
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Floating Bottom Quick Dock */}
      <QuickDock
        lang={lang}
        platforms={platforms}
        onOpenQr={() => setIsQrOpen(true)}
        onSelectPlatform={handleSelectPlatform}
      />

      {/* Universal QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        lang={lang}
      />
    </div>
  );
}
