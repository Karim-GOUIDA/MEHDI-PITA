import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { INFLUENCER_PROFILE, SocialPlatform, Language } from '../data/influencerData';
import { KickIcon, YoutubeIcon, InstagramIcon, DiscordIcon } from './BrandIcons';

interface HeroSectionProps {
  lang: Language;
  platforms: SocialPlatform[];
  onSelectPlatform: (platformId: string) => void;
  kickIsLive?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  platforms,
  onSelectPlatform,
  kickIsLive
}) => {
  const isAr = lang === 'ar';

  // Find platform data from current synced state
  const kickPlatform = platforms.find((p) => p.id === 'kick');
  const igPlatform = platforms.find((p) => p.id === 'instagram');
  const tiktokPlatform = platforms.find((p) => p.id === 'tiktok');
  const ytPlatform = platforms.find((p) => p.id === 'youtube');
  const fbPlatform = platforms.find((p) => p.id === 'facebook');
  const discordPlatform = platforms.find((p) => p.id === 'discord');

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-purple-950/60">
      {/* Dynamic Purple-Blue ambient glow spheres */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/30 via-indigo-600/25 to-transparent blur-[140px] pointer-events-none rounded-full animate-pulse-glow"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-500/20 via-blue-600/15 to-transparent blur-[130px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Typographic and Content Column */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {/* Live on Kick Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <a
                href="https://kick.com/mehdipita"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/85 border border-[#53FC18]/60 text-xs font-bold text-[#53FC18] shadow-lg shadow-[#53FC18]/20 hover:scale-105 transition-transform"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#53FC18] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#53FC18]"></span>
                </span>
                <span className="tracking-wide font-mono text-xs">
                  {isAr ? 'بث مباشر على كيك · 2.9K متابع' : 'En direct sur Kick · 2.9K followers'}
                </span>
              </a>

              {/* Discord Community Server Badge */}
              <a
                href="https://discord.com/invite/GnxEWBnkCP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/50 text-xs font-bold text-[#8891f7] hover:scale-105 transition-transform"
              >
                <DiscordIcon size={14} className="text-[#5865F2]" />
                <span className="tracking-wide font-mono text-xs">
                  {isAr ? 'سيرفر PITA COMMUNITY' : 'Discord PITA COMMUNITY'}
                </span>
              </a>
            </div>

            {/* Main Headline: MEHDI PITA ONLY */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5">
              <img
                src={INFLUENCER_PROFILE.avatar}
                alt="MEHDI PITA"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg md:hidden shrink-0"
              />
              <h1 className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-[4rem] font-black tracking-tight text-white leading-[1.1] [text-wrap:balance]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 uppercase font-mono">
                  MEHDI PITA
                </span>
              </h1>
            </div>

            {/* Creator Bio & Quotes (clean, well-spaced, never overlapping) */}
            <div className="space-y-3 mb-8">
              <div className="inline-block px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-cyan-300 font-bold text-sm">
                {isAr ? INFLUENCER_PROFILE.roleAr : INFLUENCER_PROFILE.roleFr}
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-300 font-display">
                {isAr ? INFLUENCER_PROFILE.mottoAr : INFLUENCER_PROFILE.mottoFr}
              </p>
              <div className="text-sm font-bold text-purple-300/90 font-mono">
                {INFLUENCER_PROFILE.slogan} · {INFLUENCER_PROFILE.handle}
              </div>
              <p className="text-base text-zinc-300 leading-relaxed max-w-2xl pt-1">
                {isAr ? INFLUENCER_PROFILE.bioAr : INFLUENCER_PROFILE.bioFr}
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
              <a
                href="https://kick.com/mehdipita"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 sm:px-6 py-3.5 bg-[#53FC18] hover:bg-[#45dc10] text-black font-black text-sm rounded-xl transition-all shadow-xl shadow-[#53FC18]/25 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                <KickIcon size={18} />
                <span>{isAr ? 'مشاهدة البث على Kick (2.9K)' : 'Kick Live (2.9K)'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://discord.com/invite/GnxEWBnkCP"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-[#5865F2]/25 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <DiscordIcon size={18} />
                <span>{isAr ? 'سيرفر Discord' : 'Serveur Discord'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://www.instagram.com/mehdipita/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-pink-600/25 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <InstagramIcon size={18} />
                <span>Instagram (213K)</span>
              </a>
            </div>

            {/* Quick jump to channels */}
            <div className="pt-6 border-t border-purple-950/80">
              <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent block mb-3 font-mono">
                {isAr ? 'جميع الحسابات الرسمية وعدد المتابعين' : 'Comptes officiels & Nombre d\'abonnés'}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlatform(p.id)}
                    className="px-3.5 py-2 text-xs font-bold text-zinc-200 hover:text-white bg-purple-950/50 hover:bg-purple-900/70 border border-purple-800/40 hover:border-cyan-500/60 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>{isAr ? p.name : p.nameFr}</span>
                    <span className="text-cyan-400 font-mono text-[11px] font-bold">
                      {p.followersCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo & Clean Instagram Card Column (Visible right beside text in both AR and FR) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center w-full mt-6 md:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-sm md:max-w-full lg:max-w-md mx-auto">
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-violet-600 via-cyan-500 to-[#53FC18] rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

              {/* Clean Unobstructed Photo Container */}
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl bg-zinc-950 group">
                <img
                  src={INFLUENCER_PROFILE.avatar}
                  alt="MEHDI PITA"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

          
              </div>

              {/* Instagram Card Placed CLEANLY BELOW the photo (NO OVERLAP) */}
              <a
                href="https://www.instagram.com/mehdipita/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full p-4 rounded-2xl bg-[#0f0d2c]/95 border-2 border-pink-500/60 shadow-xl flex items-center justify-between gap-3 hover:border-pink-400 hover:scale-[1.02] transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-600/40 group-hover:scale-110 transition-transform">
                    <InstagramIcon size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">
                      {isAr ? '213K متابع على إنستغرام' : '213K followers sur Instagram'}
                    </div>
                    <div className="text-xs text-pink-300 font-mono font-bold mt-0.5" dir="ltr">
                      @mehdipita · {isAr ? '865 يتابعهم' : '865 abonnements'}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 text-xs font-bold shrink-0">
                  {isAr ? 'متابعة' : 'Suivre'}
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* 6-Highlights Real Follower Numbers Strip with exact requested numbers */}
        <div className="mt-16 pt-10 border-t border-purple-950/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {/* Instagram: 213K */}
          <div className="flex flex-col p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-pink-500/40 transition-colors">
            <span className="font-display text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-300 to-pink-400 bg-clip-text text-transparent font-mono tabular-nums">
              {igPlatform?.followersCount || "213,000"}
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">
              {isAr ? 'إنستغرام' : 'Instagram'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5" dir="ltr">@mehdipita (865)</span>
          </div>

          {/* Facebook: 113K */}
          <div className="flex flex-col p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-blue-500/40 transition-colors">
            <span className="font-display text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent font-mono tabular-nums">
              {fbPlatform?.followersCount || "113,000"}
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">
              {isAr ? 'فيسبوك' : 'Facebook'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5" dir="ltr">113K followers</span>
          </div>

          {/* TikTok: 13.2K */}
          <div className="flex flex-col p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-cyan-500/40 transition-colors">
            <span className="font-display text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent font-mono tabular-nums">
              {tiktokPlatform?.followersCount || "13,200"}
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">
              {isAr ? 'تيك توك' : 'TikTok'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5" dir="ltr">@mehdi.piita</span>
          </div>

          {/* YouTube: 23.1K */}
          <div className="flex flex-col p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 hover:border-red-500/40 transition-colors">
            <span className="font-display text-2xl sm:text-3xl font-black bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent font-mono tabular-nums">
              {ytPlatform?.followersCount || "23,100"}
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">
              {isAr ? 'يوتيوب' : 'YouTube'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5" dir="ltr">@Mehdipita</span>
          </div>

          {/* Kick: 2.9K */}
          <div className="flex flex-col p-4 rounded-2xl bg-purple-950/20 border border-[#53FC18]/30 hover:border-[#53FC18] transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl sm:text-3xl font-black text-[#53FC18] font-mono tabular-nums">
                {kickPlatform?.followersCount || "2.9K"}
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#53FC18] animate-ping" />
            </div>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">
              {isAr ? 'كيك (Live)' : 'Kick (Live)'}
            </span>
            <span className="text-[11px] text-[#53FC18] mt-0.5 font-mono" dir="ltr">kick.com/mehdipita</span>
          </div>

          {/* Discord: 247+ */}
          <div className="flex flex-col p-4 rounded-2xl bg-purple-950/20 border border-[#5865F2]/30 hover:border-[#5865F2] transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl sm:text-3xl font-black text-[#8891f7] font-mono tabular-nums">
                {discordPlatform?.followersCount || "247+"}
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#5865F2] animate-pulse" />
            </div>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">
              {isAr ? 'ديسكورد' : 'Discord'}
            </span>
            <span className="text-[11px] text-[#8891f7] mt-0.5 font-mono" dir="ltr">PITA COMMUNITY</span>
          </div>
        </div>
      </div>
    </section>
  );
};
