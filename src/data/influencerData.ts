import mehdiAvatar from '../assets/images/mehdipita.jpg';

export type Language = 'ar' | 'fr';

export interface SocialPlatform {
  id: string;
  name: string;
  nameFr: string;
  handle: string;
  url: string;
  followersCount: string;
  followersRaw?: number;
  followersLabelAr: string;
  followersLabelFr: string;
  followingCountAr?: string;
  followingCountFr?: string;
  categoryAr: string;
  categoryFr: string;
  descriptionAr: string;
  descriptionFr: string;
  gradient: string;
  accentColor: string;
  badgeAr: string;
  badgeFr: string;
  highlightsAr: string;
  highlightsFr: string;
  directActionLabelAr: string;
  directActionLabelFr: string;
  iconType: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  isLiveSynced?: boolean;
}

export interface RealVideo {
  id: string;
  youtubeId: string;
  titleAr: string;
  titleFr: string;
  url: string;
  embedUrl: string;
  thumbnail: string;
  fallbackThumbnail: string;
  tagAr: string;
  tagFr: string;
}

export const INFLUENCER_PROFILE = {
  name: "MEHDI PITA", // Always MEHDI PITA, never translated
  handle: "@mehdipita",
  email: "mehdipitacontact@gmail.com",
  roleAr: "صانع محتوى كروي بستايل كوميدي🤳",
  roleFr: "Créateur de contenu football & humour 🤳",
  mottoAr: "✨حب ما تعمل حتى تعمل ما تحب✨",
  mottoFr: "✨ Aime ce que tu fais jusqu'à ce que tu fasses ce que tu aimes ✨",
  slogan: "- Mrmlaaaa9",
  bioAr: "صانع محتوى كروي بستايل كوميدي🤳 ✨حب ما تعمل حتى تعمل ما تحب✨ . أهلاً بكم في الموقع الرسمي لمتابعة أحدث البثوث الكروية، المقاطع الكوميدية، وردود الفعل المباشرة على جميع المنصات.",
  bioFr: "Créateur de contenu football & humour 🤳 ✨ Aime ce que tu fais jusqu'à ce que tu fasses ce que tu aimes ✨ . Bienvenue sur le hub officiel pour suivre tous les streams, vidéos virales et réactions en direct.",
  verified: true,
  avatar: mehdiAvatar,
  stats: {
    instagramFollowers: "213K",
    facebookFollowers: "113K",
    tiktokFollowers: "13.2K",
    youtubeSubscribers: "23.1K"
  }
};

/**
 * Automatically formats follower count to clean social media compact string:
 * e.g. 213000 -> 213K, 1000200 -> 1M, 1000000000 -> 1B, 750600 -> 750.6K, 1200000 -> 1.2M
 */
export function formatCompactNumber(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input).trim();
  if (!str) return '';

  // Already in compact unit format: e.g. 213k, 213K, 1.2M, 750.6k, 1B
  const compactMatch = str.match(/^(\d+(?:\.\d+)?)\s*([kmbKMB])$/);
  if (compactMatch) {
    const num = parseFloat(compactMatch[1]);
    const unit = compactMatch[2].toUpperCase();
    const formattedNum = num % 1 === 0 ? num.toString() : parseFloat(num.toFixed(1)).toString();
    return `${formattedNum}${unit}`;
  }

  // Parse pure numbers or numeric strings with commas/spaces
  const cleanNumeric = str.replace(/,/g, '').replace(/\s+/g, '');
  const parsed = Number(cleanNumeric);
  if (!isNaN(parsed) && parsed > 0) {
    if (parsed >= 1_000_000_000) {
      const b = parsed / 1_000_000_000;
      return `${parseFloat(b.toFixed(1))}B`;
    }
    if (parsed >= 1_000_000) {
      const m = parsed / 1_000_000;
      return `${parseFloat(m.toFixed(1))}M`;
    }
    if (parsed >= 1_000) {
      const k = parsed / 1_000;
      return `${parseFloat(k.toFixed(1))}K`;
    }
    return parsed.toString();
  }

  return str;
}

export const INITIAL_SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "instagram",
    name: "إنستغرام",
    nameFr: "Instagram",
    handle: "@mehdipita",
    url: "https://www.instagram.com/mehdipita/",
    followersCount: "213K",
    followersRaw: 213000,
    followersLabelAr: "متابع (Followers)",
    followersLabelFr: "Abonnés (Followers)",
    categoryAr: "يوميات وستوريات",
    categoryFr: "Stories & Lifestyle",
    descriptionAr: "الحساب الرسمي على إنستغرام: صانع محتوى كروي بستايل كوميدي🤳 ✨حب ما تعمل حتى تعمل ما تحب✨ - ستوريات يومية وتحديثات حصرية.",
    descriptionFr: "Compte officiel Instagram: Créateur de contenu football & humour 🤳 ✨ Aime ce que tu fais jusqu'à ce que tu fasses ce que tu aimes ✨ - Stories quotidiennes et actus exclusives.",
    gradient: "from-purple-600/30 via-pink-600/30 to-orange-500/25",
    accentColor: "#E1306C",
    badgeAr: "حساب موثق",
    badgeFr: "Compte vérifié",
    highlightsAr: "213K متابع · ستوريات يومية",
    highlightsFr: "213K abonnés · Stories quotidiennes",
    directActionLabelAr: "متابعة على Instagram",
    directActionLabelFr: "Suivre sur Instagram",
    iconType: "instagram",
    isLiveSynced: false
  },
  {
    id: "facebook",
    name: "فيسبوك",
    nameFr: "Facebook",
    handle: "Mehdi Pita",
    url: "https://www.facebook.com/profile.php?id=61563910933144",
    followersCount: "113K",
    followersRaw: 113000,
    followersLabelAr: "متابع فيسبوك (Followers)",
    followersLabelFr: "Abonnés Facebook",
    categoryAr: "تواصل ومجتمع",
    categoryFr: "Communauté & Actus",
    descriptionAr: "الصفحة الرسمية المعتمدة لـ MEHDI PITA على فيسبوك للتواصل مع المتابعين ومشاركة المنشورات الكروية والريلز.",
    descriptionFr: "Page officielle Facebook de MEHDI PITA pour échanger avec la communauté, partager des reels et des actus.",
    gradient: "from-blue-600/30 via-indigo-900/30 to-purple-900/25",
    accentColor: "#1877F2",
    badgeAr: "صفحة معتمدة",
    badgeFr: "Page certifiée",
    highlightsAr: "113K متابع · تفاعل جماهيري كبير · ريلز ومشاركات",
    highlightsFr: "113K abonnés · Forte interaction · Reels et actus",
    directActionLabelAr: "متابعة على Facebook",
    directActionLabelFr: "Suivre sur Facebook",
    iconType: "facebook",
    isLiveSynced: false
  },
  {
    id: "youtube",
    name: "يوتيوب",
    nameFr: "YouTube",
    handle: "@Mehdipita",
    url: "https://www.youtube.com/@Mehdipita",
    followersCount: "23.1K",
    followersRaw: 23100,
    followersLabelAr: "مشترك (Subscribers)",
    followersLabelFr: "Abonnés (Subscribers)",
    categoryAr: "فيديوهات كاملة وتحليلات",
    categoryFr: "Vidéos complètes & Débriefs",
    descriptionAr: "القناة الرسمية لـ MEHDI PITA على يوتيوب: حلقات كاملة، تحليلات كروية ساخرة، وتغطيات لأبرز المباريات بدقة عالية.",
    descriptionFr: "Chaîne officielle de MEHDI PITA sur YouTube: Épisodes complets, débriefs foot décalés et récaps de matchs en HD.",
    gradient: "from-red-600/30 via-purple-900/30 to-blue-900/25",
    accentColor: "#FF0000",
    badgeAr: "قناة رسمية",
    badgeFr: "Chaîne officielle",
    highlightsAr: "23.1K مشترك · فيديوهات وتحليلات · محتوى حصري",
    highlightsFr: "23.1K abonnés · Sorties régulières · Exclusivités",
    directActionLabelAr: "اشتراك في YouTube",
    directActionLabelFr: "S'abonner sur YouTube",
    iconType: "youtube",
    isLiveSynced: true
  },
  {
    id: "tiktok",
    name: "تيك توك",
    nameFr: "TikTok",
    handle: "@mehdi.piita",
    url: "https://www.tiktok.com/@mehdi.piita",
    followersCount: "13.2K",
    followersRaw: 13200,
    followersLabelAr: "متابع (Followers)",
    followersLabelFr: "Abonnés (Followers)",
    categoryAr: "فيديوهات قصيرة وفيروسية",
    categoryFr: "Vidéos courtes & virales",
    descriptionAr: "أقوى اللقطات الكروية الكوميدية، مقاطع سريعة، تحديات، وضحك متواصل مع MEHDI PITA على تيك توك.",
    descriptionFr: "Les meilleurs moments de foot comiques, clips rapides, défis et humour avec MEHDI PITA sur TikTok.",
    gradient: "from-cyan-500/30 via-purple-600/30 to-pink-600/25",
    accentColor: "#00F2FE",
    badgeAr: "تيك توك رسمي",
    badgeFr: "TikTok officiel",
    highlightsAr: "13.2K متابع · مقاطع كروية كوميدية وسريعة",
    highlightsFr: "13.2K abonnés · Clips foot comiques & viraux",
    directActionLabelAr: "متابعة على TikTok",
    directActionLabelFr: "Suivre sur TikTok",
    iconType: "tiktok",
    isLiveSynced: false
  }
];

export const SOCIAL_PLATFORMS = INITIAL_SOCIAL_PLATFORMS;

export const REAL_YOUTUBE_VIDEOS: RealVideo[] = [
  {
    id: "vid-1",
    youtubeId: "DZbqU14j3bI",
    titleAr: "MEHDI PITA — الحلقة الأولى #1",
    titleFr: "MEHDI PITA — Épisode #1",
    url: "https://youtu.be/DZbqU14j3bI?si=1-G5vTlBjqzrG_U4",
    embedUrl: "https://www.youtube.com/embed/DZbqU14j3bI?autoplay=1",
    thumbnail: "https://img.youtube.com/vi/DZbqU14j3bI/hqdefault.jpg",
    fallbackThumbnail: "https://img.youtube.com/vi/DZbqU14j3bI/mqdefault.jpg",
    tagAr: "فيديو يوتيوب مميز",
    tagFr: "Vidéo à la une"
  },
  {
    id: "vid-2",
    youtubeId: "LIDrH6l2NGo",
    titleAr: "MEHDI PITA — تحليل كروي كوميدي #2",
    titleFr: "MEHDI PITA — Débrief Foot Comique #2",
    url: "https://youtu.be/LIDrH6l2NGo?si=KE8WdERcWwyGRIj7",
    embedUrl: "https://www.youtube.com/embed/LIDrH6l2NGo?autoplay=1",
    thumbnail: "https://img.youtube.com/vi/LIDrH6l2NGo/hqdefault.jpg",
    fallbackThumbnail: "https://img.youtube.com/vi/LIDrH6l2NGo/mqdefault.jpg",
    tagAr: "تحليل كروي ساخر",
    tagFr: "Analyse décalée"
  },
  {
    id: "vid-3",
    youtubeId: "Do9XsmcC4WI",
    titleAr: "MEHDI PITA — حلقة خاصة ومواقف كروية #3",
    titleFr: "MEHDI PITA — Best-Of & Réactions #3",
    url: "https://youtu.be/Do9XsmcC4WI?si=cAfooBCu3mh_aXjk",
    embedUrl: "https://www.youtube.com/embed/Do9XsmcC4WI?autoplay=1",
    thumbnail: "https://img.youtube.com/vi/Do9XsmcC4WI/hqdefault.jpg",
    fallbackThumbnail: "https://img.youtube.com/vi/Do9XsmcC4WI/mqdefault.jpg",
    tagAr: "ردة فعل ومواقف",
    tagFr: "Réactions & Fun"
  }
];
