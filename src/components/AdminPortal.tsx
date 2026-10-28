import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Youtube,
  Instagram,
  Facebook,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Video,
  X,
  SlidersHorizontal,
  Sparkles,
  Globe,
  Flame
} from 'lucide-react';
import {
  SocialPlatform,
  RealVideo,
  Language,
  INITIAL_SOCIAL_PLATFORMS,
  REAL_YOUTUBE_VIDEOS,
  formatCompactNumber
} from '../data/influencerData';
import { TikTokIcon } from './BrandIcons';

interface AdminPortalProps {
  currentPlatforms: SocialPlatform[];
  currentVideos: RealVideo[];
  initialLang?: Language;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onSaveData: (data: { platforms: SocialPlatform[]; videos: RealVideo[] }, password: string) => Promise<void>;
  onExit: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentPlatforms,
  currentVideos,
  initialLang = 'fr',
  onLogin,
  onSaveData,
  onExit
}) => {
  // Language state (FR / AR)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pita_admin_lang');
      if (saved === 'ar' || saved === 'fr') return saved;
    } catch {}
    return initialLang;
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'ar' ? 'fr' : 'ar';
      try {
        localStorage.setItem('pita_admin_lang', next);
      } catch {}
      return next;
    });
  };

  const isAr = lang === 'ar';

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Editable data state
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(() => {
    return currentPlatforms.map((p) => ({ ...p }));
  });
  const [videos, setVideos] = useState<RealVideo[]>(() => {
    return currentVideos.map((v) => ({ ...v }));
  });

const ONLINE_HYPE_BASE = 'https://countapi.mileshilliard.com/api/v1';
const ONLINE_HYPE_KEY = 'mehdipita_official_hype_v1';

  // Hype / Force counter state (starts from 0 and saved in variable)
  const [adminHypeCount, setAdminHypeCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pita_hype_counter');
      return saved !== null ? parseInt(saved, 10) || 0 : 0;
    } catch {}
    return 0;
  });

  // Fetch online real-time counter on mount
  React.useEffect(() => {
    fetch(`${ONLINE_HYPE_BASE}/get/${ONLINE_HYPE_KEY}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.value === 'number') {
          setAdminHypeCount(data.value);
          localStorage.setItem('pita_hype_counter', String(data.value));
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateHypeCount = async (newCount: number) => {
    const val = Math.max(0, newCount);
    setAdminHypeCount(val);
    try {
      localStorage.setItem('pita_hype_counter', String(val));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Synchronize to online cloud database
    try {
      await fetch(`${ONLINE_HYPE_BASE}/set/${ONLINE_HYPE_KEY}?value=${val}`);
    } catch {}
  };

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoTitleFr, setNewVideoTitleFr] = useState('');
  const [newVideoTag, setNewVideoTag] = useState('Vidéo à la une');
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to extract clean 11-char YouTube ID from any format
  const extractYoutubeId = (input: string): string => {
    const trimmed = input.trim();
    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (match && match[1]) return match[1];
    if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
    return '';
  };

  // Helper to parse numbers like 213K, 1.2M, 750.6K, 1,000,000 or raw integers into pure numbers
  const parseFollowerNumber = (val: string): number => {
    if (!val) return 0;
    const clean = String(val).trim().toUpperCase().replace(/,/g, '').replace(/\s/g, '');
    if (clean.endsWith('B')) {
      const num = parseFloat(clean.slice(0, -1));
      return isNaN(num) ? 0 : Math.round(num * 1_000_000_000);
    }
    if (clean.endsWith('M')) {
      const num = parseFloat(clean.slice(0, -1));
      return isNaN(num) ? 0 : Math.round(num * 1_000_000);
    }
    if (clean.endsWith('K')) {
      const num = parseFloat(clean.slice(0, -1));
      return isNaN(num) ? 0 : Math.round(num * 1_000);
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const validUsers = ['mrmla9', 'admin', 'pitadmin', 'mehdi'];
    const isValidUser = validUsers.includes(cleanUser) || cleanUser === '';

    if (!isValidUser) {
      setAuthError(
        isAr
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
          : 'Identifiant ou mot de passe incorrect.'
      );
      return;
    }

    try {
      if (await onLogin(cleanUser, cleanPass)) {
        setIsAuthenticated(true);
        showToast(
          isAr
            ? "تم تسجيل الدخول بنجاح! مرحباً بك في لوحة تحكم MEHDI PITA."
            : "Connexion réussie ! Bienvenue dans l'administration MEHDI PITA."
        );
      } else {
        setAuthError(
          isAr
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
            : 'Identifiant ou mot de passe incorrect.'
        );
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : isAr
            ? 'تعذر الاتصال بخدمة تسجيل الدخول.'
            : "Impossible de joindre le service d'authentification."
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const persistData = async (
    data: { platforms: SocialPlatform[]; videos: RealVideo[] },
    successMessage?: string
  ): Promise<boolean> => {
    try {
      await onSaveData(data, password);
      if (successMessage) showToast(successMessage);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast(
        isAr
          ? `فشل حفظ التغييرات: ${message}`
          : `Échec de l'enregistrement : ${message}`
      );
      return false;
    }
  };

  // Follower updates with immediate auto-sync
  const handleFollowerChange = (platformId: string, countStr: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, followersCount: countStr } : p))
    );
  };

  const handleFollowerBlur = async (platformId: string) => {
    const formatted = platforms.map((p) =>
      p.id === platformId ? { ...p, followersCount: formatCompactNumber(p.followersCount) } : p
    );
    setPlatforms(formatted);
    await persistData(
      { platforms: formatted, videos },
      isAr
        ? 'تم تحديث العدد ونشره أونلاين لجميع المتصفحات 🌐'
        : 'Nombre mis à jour en ligne pour tous les navigateurs 🌐'
    );
  };

  // Interactive controls for follower numbers
  const handleStepFollowers = (platformId: string, delta: number) => {
    const nextList = platforms.map((p) => {
      if (p.id !== platformId) return p;
      const current = parseFollowerNumber(p.followersCount);
      const next = Math.max(0, current + delta);
      return {
        ...p,
        followersCount: formatCompactNumber(next)
      };
    });
    setPlatforms(nextList);
    void persistData({ platforms: nextList, videos });
  };

  const handleFormatStyle = (platformId: string, style: 'compact' | 'separated' | 'raw') => {
    const nextList = platforms.map((p) => {
      if (p.id !== platformId) return p;
      const num = parseFollowerNumber(p.followersCount);
      let val = p.followersCount;
      if (style === 'compact') {
        val = formatCompactNumber(num);
      } else if (style === 'separated') {
        val = num.toLocaleString('en-US');
      } else if (style === 'raw') {
        val = String(num);
      }
      return { ...p, followersCount: val };
    });
    setPlatforms(nextList);
    void persistData({ platforms: nextList, videos });
  };

  const handleClearFollowers = (platformId: string) => {
    const nextList = platforms.map((p) =>
      p.id === platformId ? { ...p, followersCount: '0' } : p
    );
    setPlatforms(nextList);
    void persistData({ platforms: nextList, videos });
  };

  // Video Management
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const yId = extractYoutubeId(newVideoUrl);
    if (!yId) {
      showToast(
        isAr
          ? "يرجى إدخال رابط يوتيوب صحيح أو معرّف فيديو صالح يتكون من 11 حرفاً"
          : "Veuillez entrer une URL YouTube valide ou un ID à 11 caractères (ex: DZbqU14j3bI)"
      );
      return;
    }

    const titleAr = newVideoTitle.trim() || `MEHDI PITA — فيديو جديد`;
    const titleFr = newVideoTitleFr.trim() || newVideoTitle.trim() || `MEHDI PITA — Nouvelle Vidéo`;
    const tag = newVideoTag.trim() || (isAr ? 'فيديو مميز' : 'Vidéo officielle');

    const newVid: RealVideo = {
      id: `vid-${Date.now()}`,
      youtubeId: yId,
      titleAr,
      titleFr,
      url: `https://youtu.be/${yId}`,
      embedUrl: `https://www.youtube.com/embed/${yId}?autoplay=1`,
      thumbnail: `https://img.youtube.com/vi/${yId}/hqdefault.jpg`,
      fallbackThumbnail: `https://img.youtube.com/vi/${yId}/mqdefault.jpg`,
      tagAr: tag,
      tagFr: tag
    };

    const updatedVideos = [newVid, ...videos];
    setVideos(updatedVideos);
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoTitleFr('');
    setShowAddModal(false);

    // Auto-save online immediately
    void persistData(
      { platforms, videos: updatedVideos },
      isAr
        ? "تمت إضافة الفيديو وحفظه أونلاين على السيرفر بنجاح! 🚀"
        : "Vidéo ajoutée et synchronisée en ligne avec succès ! 🚀"
    );
  };

  const handleDeleteVideo = (id: string) => {
    const updatedVideos = videos.filter((v) => v.id !== id);
    setVideos(updatedVideos);
    void persistData(
      { platforms, videos: updatedVideos },
      isAr ? 'تم حذف الفيديو وتحديث الموقع أونلاين.' : 'Vidéo retirée et mise à jour en ligne.'
    );
  };

  const handleMoveVideo = (index: number, direction: 'up' | 'down') => {
    const copy = [...videos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setVideos(copy);
    void persistData({ platforms, videos: copy });
  };

  const handleSaveAll = async () => {
    const formattedPlatforms = platforms.map((p) => ({
      ...p,
      followersCount: formatCompactNumber(p.followersCount)
    }));
    setPlatforms(formattedPlatforms);
    await persistData(
      { platforms: formattedPlatforms, videos },
      isAr
        ? 'تم حفظ وتحديث الأرقام والفيديوهات أونلاين على السيرفر مباشرة لجميع الزوار! 🌐'
        : 'Toutes les données ont été enregistrées en ligne pour tous les visiteurs ! 🌐'
    );
  };

  const handleResetDefaults = () => {
    setPlatforms(INITIAL_SOCIAL_PLATFORMS.map((p) => ({ ...p })));
    setVideos(REAL_YOUTUBE_VIDEOS.map((v) => ({ ...v })));
    void persistData(
      {
        platforms: INITIAL_SOCIAL_PLATFORMS,
        videos: REAL_YOUTUBE_VIDEOS
      },
      isAr
        ? 'تمت استعادة القيم الافتراضية وحفظها أونلاين بنجاح.'
        : 'Valeurs par défaut restaurées en ligne avec succès.'
    );
  };

  // Back icon according to direction
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  // 1. LOCKED VIEW (LOGIN SCREEN)
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-[#070614] flex items-center justify-center p-4 relative overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Language Switcher in Login View (Top right/left) */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleLang}
            title={isAr ? "Passer au français" : "التحويل إلى العربية"}
            className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-xs font-bold text-cyan-300 hover:text-white transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-black">{isAr ? 'FR' : 'العربية'}</span>
          </button>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-purple-700/20 via-indigo-600/20 to-cyan-500/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0d0b24]/95 border-2 border-purple-500/40 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-600/40">
              <Lock className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-[11px] font-bold text-cyan-300 font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'منطقة مخصصة · /pitadmin' : 'Accès Réservé · /pitadmin'}</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight font-display">
              {isAr ? 'MEHDI PITA لوحة الإدارة' : 'MEHDI PITA Admin'}
            </h1>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-xs">
              {isAr
                ? 'قم بتسجيل الدخول لتحديث أرقام المتابعين وإدارة فيديوهات الموقع.'
                : 'Connectez-vous pour mettre à jour les abonnés et gérer les vidéos du site.'}
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase font-mono">
                {isAr ? 'اسم المستخدم / المعرّف' : 'Identifiant / Login'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141033] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase font-mono">
                {isAr ? 'كلمة المرور' : 'Mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-[#141033] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors ${
                    isAr ? 'pl-11 pr-4' : 'pr-11 pl-4'
                  }`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer ${
                    isAr ? 'left-3' : 'right-3'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الدخول' : 'Se connecter'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-purple-900/40 text-center">
            <button
              type="button"
              onClick={onExit}
              className="text-xs font-bold text-zinc-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <BackIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'الرجوع إلى الموقع الرسمي لـ MEHDI PITA' : 'Retour au site public MEHDI PITA'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div
      className="min-h-screen bg-[#070614] text-zinc-100 pb-20 selection:bg-cyan-400 selection:text-zinc-950 font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d0b26]/95 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white font-black font-display shadow-lg shadow-indigo-600/30">
              MP
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-lg text-white font-mono">
                  MEHDI PITA
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono border border-cyan-500/40" dir="ltr">
                  /pitadmin
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAr ? 'متصل بالسيرفر (تحديث مباشر أونلاين)' : 'En ligne (Synchro direct)'}
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {isAr
                  ? 'لوحة التحكم الرسمية — التغييرات تحفظ مباشرة أونلاين لجميع زوار الموقع'
                  : 'Panneau officiel — Les changements sont sauvegardés en direct pour tous les visiteurs'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
            {/* Language Switcher Button (FR / AR) */}
            <button
              onClick={toggleLang}
              title={isAr ? "Passer au français" : "التحويل إلى العربية"}
              className="px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-600/50 text-xs font-bold text-cyan-300 hover:text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-black">{isAr ? 'FR' : 'العربية'}</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ التغييرات' : 'Enregistrer'}</span>
            </button>

            <button
              onClick={async () => {
                const formattedPlatforms = platforms.map((p) => ({
                  ...p,
                  followersCount: formatCompactNumber(p.followersCount)
                }));
                if (await persistData({ platforms: formattedPlatforms, videos })) {
                  onExit();
                }
              }}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <BackIcon className="w-4 h-4" />
              <span>{isAr ? 'معاينة الموقع' : 'Voir le site'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:p-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 rounded-xl transition-all text-xs cursor-pointer"
              title={isAr ? 'تسجيل الخروج' : 'Déconnexion'}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-teal-300/40 animate-bounce ${
            isAr ? 'left-6' : 'right-6'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Real-time Global Cloud Sync Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/40">
              <Globe className="w-5 h-5 animate-pulse text-cyan-300" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>{isAr ? 'المزامنة السحابية العالمية الفورية (Online Real-Time)' : 'Synchronisation Cloud Globale (Temps Réel)'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                {isAr
                  ? 'أي تعديل في الأرقام أو الفيديوهات ينتشر فورياً عبر السحابة لجميع الزوار والأجهزة في العالم.'
                  : 'Toutes les modifications se propagent instantanément via le cloud pour tous les visiteurs et navigateurs.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isAr ? 'متصل وحي (Live 0s)' : 'Connecté & En Direct (0s)'}
            </span>
          </div>
        </div>

        {/* SECTION 1: FOLLOWER NUMBERS WITH FULL CONTROLS */}
        <section className="bg-[#0c0a22]/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-900/40">
            <div>
              <div className="text-xs font-bold uppercase text-cyan-400 font-mono tracking-widest mb-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'الإحصائيات والعدادات' : 'Statistiques & Compteurs'}</span>
              </div>
              <h2 className="text-2xl font-black text-white font-display">
                {isAr ? 'تحديث أعداد المتابعين' : "Mettre à jour les chiffres d'abonnés"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {isAr
                  ? 'تحكم في أعداد المتابعين وعدّلها مباشرة لكل منصة (أزرار الزيادة والنقصان، التحويل والخيارات السريعة).'
                  : "Contrôlez et ajustez directement les compteurs pour chaque réseau (boutons pas à pas, formats et ajustements rapides)."}
              </p>
            </div>
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 rounded-xl border border-purple-800/40 transition-colors flex items-center gap-1.5 self-start cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'القيم الافتراضية' : 'Valeurs par défaut'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform) => {
              const isIg = platform.id === 'instagram';
              const isFb = platform.id === 'facebook';
              const isYt = platform.id === 'youtube';
              const isTt = platform.id === 'tiktok';

              return (
                <div
                  key={platform.id}
                  className="p-5 rounded-2xl bg-[#120e30] border border-purple-500/30 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Platform Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center shrink-0">
                        {isIg && <Instagram className="w-5 h-5 text-pink-400" />}
                        {isFb && <Facebook className="w-5 h-5 text-blue-400" />}
                        {isYt && <Youtube className="w-5 h-5 text-red-500" />}
                        {isTt && <TikTokIcon size={20} className="text-cyan-300" />}
                      </div>
                      <div>
                        <div className="font-bold text-base text-white font-mono flex items-center gap-2">
                          <span>{isAr ? platform.name : platform.nameFr}</span>
                          <span className="text-xs text-zinc-400 font-sans font-normal">
                            ({isAr ? platform.nameFr : platform.name})
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400" dir="ltr">{platform.handle}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearFollowers(platform.id)}
                      className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title={isAr ? 'مسح القيمة' : 'Effacer'}
                    >
                      <X className="w-3 h-3" />
                      <span>{isAr ? 'مسح' : 'Effacer'}</span>
                    </button>
                  </div>

                  {/* Main Input with Stepper [-] / [+] Controls */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase font-mono mb-1.5">
                      {isAr ? 'قيمة العداد' : "Valeur du compteur"}
                    </label>

                    <div className="flex items-center gap-2" dir="ltr">
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, -1000)}
                        className="h-11 px-3 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 hover:border-cyan-400/50 text-white font-mono font-bold rounded-xl flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                        title="-1,000"
                      >
                        <Minus className="w-4 h-4 text-cyan-300" />
                      </button>

                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={platform.followersCount}
                          onChange={(e) => handleFollowerChange(platform.id, e.target.value)}
                          onBlur={() => handleFollowerBlur(platform.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full h-11 px-3.5 rounded-xl bg-[#09071c] border-2 border-purple-500/40 focus:border-cyan-400 text-cyan-300 font-mono font-black text-base focus:outline-none transition-colors text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, 1000)}
                        className="h-11 px-3 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 hover:border-cyan-400/50 text-white font-mono font-bold rounded-xl flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                        title="+1,000"
                      >
                        <Plus className="w-4 h-4 text-cyan-300" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Step Buttons Controls */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-zinc-500 font-mono mb-1.5 flex items-center justify-between">
                      <span>{isAr ? 'تحكم سريع (إضافة / إنقاص)' : 'Contrôle rapide (Ajouter / Diminuer)'}</span>
                      <span className="text-zinc-400 font-normal">{isAr ? 'خطوات فورية' : 'Pas instantanés'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, -10000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition-colors cursor-pointer"
                      >
                        -10K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, -1000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition-colors cursor-pointer"
                      >
                        -1K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, 1000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 transition-colors cursor-pointer"
                      >
                        +1K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, 10000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 transition-colors cursor-pointer"
                      >
                        +10K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, 50000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 transition-colors cursor-pointer"
                      >
                        +50K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, 100000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-700/50 text-cyan-300 transition-colors cursor-pointer"
                      >
                        +100K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepFollowers(platform.id, 1000000)}
                        className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-600/50 text-purple-200 transition-colors cursor-pointer"
                      >
                        +1M
                      </button>
                    </div>
                  </div>

                  {/* Format Converter Buttons */}
                  <div className="pt-2 border-t border-purple-950 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {isAr ? 'الصيغة:' : 'Format:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFormatStyle(platform.id, 'compact')}
                        className="px-2 py-0.5 rounded-md bg-purple-950/60 hover:bg-purple-900 border border-purple-700/40 text-[11px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                        title={isAr ? 'صيغة مختصرة K أو M' : 'Formater en K ou M (ex: 213K, 1.2M)'}
                      >
                        {isAr ? 'مختصر (K/M)' : 'Compact (K/M)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatStyle(platform.id, 'separated')}
                        className="px-2 py-0.5 rounded-md bg-purple-950/60 hover:bg-purple-900 border border-purple-700/40 text-[11px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                        title={isAr ? 'فواصل الآلاف (1,000,000)' : 'Formater avec virgules (ex: 213,000)'}
                      >
                        1,000,000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatStyle(platform.id, 'raw')}
                        className="px-2 py-0.5 rounded-md bg-purple-950/60 hover:bg-purple-900 border border-purple-700/40 text-[11px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                        title={isAr ? 'أرقام فقط بدون فواصل' : 'Nombre brut (ex: 1000000)'}
                      >
                        {isAr ? 'خام' : 'Brut'}
                      </button>
                    </div>

                    {/* Auto live preview */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-zinc-500">{isAr ? 'المظهر بالموقع:' : 'Rendu site:'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-black shadow-sm" dir="ltr">
                        {formatCompactNumber(platform.followersCount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* HYPE COUNTER MANAGER */}
          <div className="mt-8 pt-6 border-t border-purple-900/50 p-5 rounded-2xl bg-[#120e30] border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
                <Flame className="w-6 h-6 animate-pulse fill-current" />
              </div>
              <div>
                <div className="font-bold text-sm text-white font-mono flex items-center gap-2">
                  <span>{isAr ? 'عداد حماس وتشجيع الجمهور (الحماس)' : 'Compteur de force & soutien (Hype)'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-orange-950/80 border border-orange-500/40 text-orange-300 font-mono">
                    {adminHypeCount.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {isAr
                    ? 'يبدأ من 0 ويتم حفظ كل نقرة تلقائياً في متغير دائم.'
                    : 'Démarre de 0 et enregistre chaque clic dans une variable persistante.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto" dir="ltr">
              <button
                type="button"
                onClick={() => handleUpdateHypeCount(adminHypeCount - 1)}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-cyan-300 cursor-pointer"
                title="-1"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleUpdateHypeCount(adminHypeCount + 1)}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-cyan-300 cursor-pointer"
                title="+1"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleUpdateHypeCount(adminHypeCount + 10)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
              >
                +10
              </button>

              <button
                type="button"
                onClick={() => handleUpdateHypeCount(adminHypeCount + 100)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
              >
                +100
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(isAr ? 'هل أنت متأكد من تصفير عداد الحماس إلى 0؟' : 'Voulez-vous réinitialiser le compteur de force à 0 ?')) {
                    handleUpdateHypeCount(0);
                    showToast(isAr ? 'تم تصفير عداد الحماس إلى 0.' : 'Compteur de force réinitialisé à 0.');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-800/40 text-red-300 text-xs font-mono font-bold cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصفير (0)' : 'Reset (0)'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: YOUTUBE FEATURED VIDEOS */}
        <section className="bg-[#0c0a22]/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-900/40">
            <div>
              <div className="text-xs font-bold uppercase text-red-400 font-mono tracking-widest mb-1 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>{isAr ? 'إدارة فيديوهات يوتيوب' : 'Gestionnaire Vidéos YouTube'}</span>
              </div>
              <h2 className="text-2xl font-black text-white font-display">
                {isAr ? 'الفيديوهات المعروضة في الصفحة الرئيسية' : "Vidéos affichées sur la page d'accueil"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {isAr
                  ? 'حدد بدقة مقاطع يوتيوب الخاصة بـ MEHDI PITA التي تريد إبرازها للزوار.'
                  : "Choisissez précisément quelles vidéos YouTube de MEHDI PITA montrer dans le lecteur."}
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة فيديو جديد' : 'Ajouter une vidéo'}</span>
            </button>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid, idx) => (
              <div
                key={vid.id}
                className="p-4 rounded-2xl bg-[#120e30] border border-purple-500/30 flex flex-col justify-between group hover:border-red-500/50 transition-all"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3 border border-purple-950">
                    <img
                      src={vid.thumbnail}
                      alt={isAr ? vid.titleAr : vid.titleFr}
                      onError={(e) => {
                        e.currentTarget.src = vid.fallbackThumbnail;
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-cyan-300 font-mono border border-purple-500/30 ${
                        isAr ? 'right-2' : 'left-2'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div
                      className={`absolute top-2 px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold ${
                        isAr ? 'left-2' : 'right-2'
                      }`}
                    >
                      {isAr ? vid.tagAr || 'يوتيوب' : vid.tagFr || 'YouTube'}
                    </div>
                  </div>

                  {/* Editable Title */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase font-mono">
                        {isAr ? 'العنوان (بالفرنسية / الأساسي)' : 'Titre (Français / Principal)'}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={vid.titleFr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVideos((prev) =>
                            prev.map((v) => (v.id === vid.id ? { ...v, titleFr: val } : v))
                          );
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#09071c] border border-purple-500/30 text-white text-xs font-semibold focus:outline-none focus:border-red-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase font-mono">
                        {isAr ? 'العنوان (بالعربية)' : 'العنوان (عربي)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={vid.titleAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVideos((prev) =>
                            prev.map((v) => (v.id === vid.id ? { ...v, titleAr: val } : v))
                          );
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#09071c] border border-purple-500/30 text-white text-xs font-semibold focus:outline-none focus:border-red-400 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase font-mono">
                        {isAr ? 'معرّف يوتيوب' : 'ID YouTube'} ({vid.youtubeId})
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={vid.youtubeId}
                        onChange={(e) => {
                          const val = extractYoutubeId(e.target.value) || e.target.value;
                          setVideos((prev) =>
                            prev.map((v) =>
                              v.id === vid.id
                                ? {
                                    ...v,
                                    youtubeId: val,
                                    url: `https://youtu.be/${val}`,
                                    embedUrl: `https://www.youtube.com/embed/${val}?autoplay=1`,
                                    thumbnail: `https://img.youtube.com/vi/${val}/hqdefault.jpg`,
                                    fallbackThumbnail: `https://img.youtube.com/vi/${val}/mqdefault.jpg`
                                  }
                                : v
                            )
                          );
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#09071c] border border-purple-500/30 text-cyan-300 font-mono text-xs focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Controls (Move & Delete) */}
                <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-1" dir="ltr">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveVideo(idx, 'up')}
                      className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={isAr ? 'تحريك لأعلى' : 'Monter'}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === videos.length - 1}
                      onClick={() => handleMoveVideo(idx, 'down')}
                      className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={isAr ? 'تحريك لأسفل' : 'Descendre'}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-zinc-300 cursor-pointer ml-1"
                      title={isAr ? 'فتح في يوتيوب' : 'Ouvrir sur YouTube'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(vid.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/70 text-red-300 border border-red-800/40 transition-colors cursor-pointer"
                    title={isAr ? 'حذف الفيديو' : 'Supprimer la vidéo'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Big Bottom Save Action Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/80 to-[#120d33] border-2 border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display font-black text-lg text-white">
              {isAr ? 'جاهز لنشر تعديلاتك على الموقع؟' : 'Prêt à publier vos changements ?'}
            </div>
            <div className="text-xs text-zinc-300">
              {isAr
                ? 'جميع التعديلات يتم تطبيقها وعرضها فوراً في الموقع بمجرد الحفظ.'
                : 'Toutes les modifications sont immédiatement visibles sur le site une fois enregistrées.'}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveAll}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:opacity-95 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-teal-900/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ جميع التعديلات' : 'Enregistrer les modifications'}</span>
            </button>
            <button
              onClick={onExit}
              className="flex-1 sm:flex-initial px-5 py-3 bg-purple-900/60 hover:bg-purple-800 text-white font-bold text-sm rounded-xl transition-all border border-purple-700/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAr ? 'معاينة النتيجة مباشرة' : 'Voir le résultat en direct'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* MODAL: AJOUTER UNE NOUVELLE VIDÉO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e0b29] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    {isAr ? 'إضافة فيديو يوتيوب جديد' : 'Ajouter une vidéo YouTube'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isAr
                      ? 'انسخ ببساطة رابط أو كود فيديو MEHDI PITA من يوتيوب'
                      : 'Copiez simplement le lien de la vidéo YouTube de MEHDI PITA'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase font-mono mb-1">
                  {isAr ? 'رابط الفيديو على يوتيوب أو المعرّف (ID) *' : 'Lien YouTube ou ID de la vidéo *'}
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141033] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-red-400 font-mono"
                />
                {extractYoutubeId(newVideoUrl) && (
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5" dir="ltr">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المعرّف المكتشف: ' : 'ID détecté: '}{extractYoutubeId(newVideoUrl)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase font-mono mb-1">
                  {isAr ? 'العنوان بالفرنسية / عنوان العرض' : "Titre en Français / Titre d'affichage"}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={newVideoTitleFr}
                  onChange={(e) => setNewVideoTitleFr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141033] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase font-mono mb-1">
                  {isAr ? 'العنوان بالعربية (اختياري)' : 'العنوان بالعربية (اختياري)'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141033] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-red-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase font-mono mb-1">
                  {isAr ? 'وسم / شارة الفيديو' : 'Badge / Tag'}
                </label>
                <input
                  type="text"
                  value={newVideoTag}
                  onChange={(e) => setNewVideoTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141033] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-red-400"
                />
              </div>

              {/* Instant Thumbnail Preview */}
              {extractYoutubeId(newVideoUrl) && (
                <div className="pt-2">
                  <span className="block text-[11px] font-bold text-zinc-400 mb-1">
                    {isAr ? 'معاينة الصورة المصغرة:' : 'Aperçu de la miniature:'}
                  </span>
                  <div className="w-48 aspect-video rounded-xl overflow-hidden border border-purple-500/40">
                    <img
                      src={`https://img.youtube.com/vi/${extractYoutubeId(newVideoUrl)}/hqdefault.jpg`}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 cursor-pointer"
                >
                  {isAr ? 'إضافة الفيديو' : 'Ajouter la vidéo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
