import React from 'react';
import { Language } from '../data/influencerData';

interface MarqueeTickerProps {
  speed?: 'normal' | 'fast';
  lang?: Language;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ speed = 'normal', lang = 'ar' }) => {
  const isAr = lang === 'ar';

  const items = isAr
    ? [
        "MEHDI PITA",
        "سيرفر ديسكورد: PITA COMMUNITY (247+ عضو)",
        "بث كيك المباشر: KICK.COM/MEHDIPITA (2.9K متابع)",
        "فيسبوك: 113K متابع (MEHDI PITA)",
        "تيك توك: 13.2K متابع (@MEHDI.PIITA)",
        "يوتيوب: 23.1K مشترك (@MEHDIPITA)",
        "إنستغرام: 213K متابع (865 يتابعهم)",
        "صانع محتوى كروي بستايل كوميدي🤳",
        "✨حب ما تعمل حتى تعمل ما تحب✨",
        "- Mrmlaaaa9",
        "MEHDIPITACONTACT@GMAIL.COM"
      ]
    : [
        "MEHDI PITA",
        "Serveur Discord: PITA COMMUNITY (247+ membres)",
        "Stream Kick Live: KICK.COM/MEHDIPITA (2.9K followers)",
        "Facebook: 113K abonnés (MEHDI PITA)",
        "TikTok: 13.2K abonnés (@MEHDI.PIITA)",
        "YouTube: 23.1K abonnés (@MEHDIPITA)",
        "Instagram: 213K abonnés (865 abonnements)",
        "Créateur de contenu football & humour 🤳",
        "✨ Aime ce que tu fais jusqu'à ce que tu fasses ce que tu aimes ✨",
        "- Mrmlaaaa9",
        "MEHDIPITACONTACT@GMAIL.COM"
      ];

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-blue-950/70 border-y border-purple-500/25 py-3.5 overflow-hidden select-none backdrop-blur-sm shadow-inner" dir="ltr">
      <div className={`flex ${speed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee'} whitespace-nowrap`}>
        {[...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center mx-6 text-xs sm:text-sm font-black tracking-wide">
            <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent font-display">
              {text}
            </span>
            <span className="mx-5 text-[#53FC18] drop-shadow-[0_0_8px_rgba(83,252,24,0.8)]" aria-hidden="true">
              ⚽
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
