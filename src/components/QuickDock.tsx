import React, { useState, useEffect } from 'react';
import { SOCIAL_PLATFORMS, SocialPlatform, Language } from '../data/influencerData';
import { PlatformIcon, KickIcon, DiscordIcon } from './BrandIcons';
import { QrCode } from 'lucide-react';

interface QuickDockProps {
  lang: Language;
  platforms?: SocialPlatform[];
  onOpenQr: () => void;
  onSelectPlatform: (id: string) => void;
}

export const QuickDock: React.FC<QuickDockProps> = ({
  lang,
  platforms = SOCIAL_PLATFORMS,
  onOpenQr,
  onSelectPlatform
}) => {
  const [visible, setVisible] = useState(false);
  const isAr = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label={isAr ? "شريط الوصول السريع" : "Barre d'accès rapide"}
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] pointer-events-auto"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-2xl bg-[#09071c]/90 backdrop-blur-2xl border border-purple-500/30 shadow-2xl shadow-indigo-950/80">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55vw] sm:max-w-none pr-1.5">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => onSelectPlatform(platform.id)}
              title={`${isAr ? platform.name : platform.nameFr} (${platform.followersCount})`}
              className="p-2 text-zinc-400 hover:text-cyan-300 rounded-xl hover:bg-purple-950/50 transition-colors shrink-0 group relative cursor-pointer"
            >
              <PlatformIcon type={platform.iconType} size={18} />
              <span className="hidden sm:group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg bg-[#0c0a22] border border-purple-500/40 text-[10px] font-bold text-cyan-300 whitespace-nowrap shadow-xl">
                {isAr ? platform.name : platform.nameFr} ({platform.followersCount})
              </span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-purple-900/60 shrink-0" />

        <button
          onClick={onOpenQr}
          title={isAr ? "باركود الهاتف" : "QR Code"}
          className="p-2 text-zinc-400 hover:text-cyan-300 rounded-xl hover:bg-purple-950/50 transition-colors shrink-0 cursor-pointer hidden sm:block"
        >
          <QrCode className="w-4 h-4" />
        </button>

        <a
          href="https://discord.com/invite/GnxEWBnkCP"
          target="_blank"
          rel="noopener noreferrer"
          title="PITA COMMUNITY Discord"
          className="p-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-[#8891f7] rounded-xl transition-all border border-[#5865F2]/40 shrink-0 flex items-center justify-center cursor-pointer"
        >
          <DiscordIcon size={16} />
        </a>

        <a
          href="https://kick.com/mehdipita"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-[#53FC18] hover:bg-[#45dc10] text-black font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <KickIcon size={14} />
          <span className="hidden sm:inline">{isAr ? 'Kick Live (2.9K)' : 'Kick Live (2.9K)'}</span>
          <span className="sm:hidden">Kick</span>
        </a>
      </div>
    </aside>
  );
};
