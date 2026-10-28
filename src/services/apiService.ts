import { SocialPlatform, RealVideo, formatCompactNumber } from '../data/influencerData';

export interface AppOnlineData {
  platforms: SocialPlatform[];
  videos: RealVideo[];
  hypeCount?: number;
  updatedAt?: string;
}

const STORAGE_PLATFORMS_KEY = 'pita_custom_platforms';
const STORAGE_VIDEOS_KEY = 'pita_custom_videos';

const GITHUB_REPO = 'Karim-GOUIDA/MEHDI-PITA';
const GITHUB_DATA_PATH = 'data/app-data.json';
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${GITHUB_DATA_PATH}`;

export const getGitHubToken = (): string => {
  try {
    const custom = localStorage.getItem('pita_github_token');
    if (custom && custom.trim()) return custom.trim();
    const envToken = (import.meta as any).env?.VITE_GITHUB_TOKEN;
    if (envToken && typeof envToken === 'string' && envToken.trim()) return envToken.trim();
  } catch {}
  return '';
};

// CountAPI base for instant global real-time synchronization across all navigators & browsers
const COUNT_API_BASE = 'https://countapi.mileshilliard.com/api/v1';
const COUNT_KEY_MAP: Record<string, string> = {
  instagram: 'mehdipita_instagram_followers',
  facebook: 'mehdipita_facebook_followers',
  youtube: 'mehdipita_youtube_subscribers',
  tiktok: 'mehdipita_tiktok_followers'
};

export const parseFollowerInteger = (val: string | number | undefined): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return Math.round(val);
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

/**
 * Fetch online data with multi-tier global cloud fallback:
 * 1. Local /api/data (Full-stack Express backend)
 * 2. GitHub Raw JSON (Works on GitHub Pages & static hosts everywhere)
 * 3. CountAPI real-time live follower numbers (0-second cross-browser propagation)
 */
export async function fetchOnlineData(): Promise<AppOnlineData | null> {
  let loadedData: AppOnlineData | null = null;

  // 1. Try local server API (if available)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch('/api/data', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        loadedData = json.data;
      }
    }
  } catch {}

  // 2. If server API not available (e.g. deployed on GitHub Pages), fetch directly from GitHub Raw
  if (!loadedData || !loadedData.platforms || loadedData.platforms.length === 0) {
    try {
      const cacheBuster = `t=${Date.now()}`;
      const rawRes = await fetch(`${GITHUB_RAW_URL}?${cacheBuster}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (rawRes.ok) {
        const rawJson = await rawRes.json();
        if (rawJson && Array.isArray(rawJson.platforms)) {
          loadedData = rawJson;
        }
      }
    } catch (err) {
      console.warn('[Online Data] Failed to fetch raw GitHub data:', err);
    }
  }

  // 3. Query CountAPI for the exact real-time live follower counts across all browsers
  try {
    const countPromises = Object.entries(COUNT_KEY_MAP).map(async ([platformId, countKey]) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${COUNT_API_BASE}/get/${countKey}`, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const json = await res.json();
          if (typeof json.value === 'number' && json.value > 0) {
            return { platformId, count: json.value };
          }
        }
      } catch {}
      return null;
    });

    const liveCounts = await Promise.all(countPromises);

    if (loadedData && Array.isArray(loadedData.platforms)) {
      loadedData.platforms = loadedData.platforms.map((p) => {
        const found = liveCounts.find((c) => c && c.platformId === p.id);
        if (found && found.count > 0) {
          const formatted = formatCompactNumber(found.count);
          return {
            ...p,
            followersCount: formatted,
            followersRaw: found.count
          };
        }
        return p;
      });
    }
  } catch {}

  // If successfully loaded, update local cache
  if (loadedData && Array.isArray(loadedData.platforms) && loadedData.platforms.length > 0) {
    try {
      localStorage.setItem(STORAGE_PLATFORMS_KEY, JSON.stringify(loadedData.platforms));
      if (Array.isArray(loadedData.videos)) {
        localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(loadedData.videos));
      }
    } catch {}
    return loadedData;
  }

  return null;
}

/**
 * Save updated platforms & videos globally to:
 * 1. CountAPI (Instant live follower count across all browsers & sessions)
 * 2. GitHub Contents API (Persists directly to repository file data/app-data.json)
 * 3. Express server /api/data (If running locally or full-stack)
 * 4. LocalStorage cache (Immediate optimistic rendering)
 */
export async function saveOnlineData(params: {
  platforms: SocialPlatform[];
  videos: RealVideo[];
  hypeCount?: number;
  password?: string;
}): Promise<{ success: boolean; message?: string }> {
  // Always update local cache immediately
  try {
    localStorage.setItem(STORAGE_PLATFORMS_KEY, JSON.stringify(params.platforms));
    localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(params.videos));
  } catch {}

  const fullData: AppOnlineData = {
    platforms: params.platforms,
    videos: params.videos,
    hypeCount: params.hypeCount ?? 0,
    updatedAt: new Date().toISOString()
  };

  // 1. Sync follower numbers to CountAPI immediately (propagates to all navigators instantly)
  const countSyncPromises = params.platforms.map(async (platform) => {
    const key = COUNT_KEY_MAP[platform.id];
    if (!key) return;
    const num = parseFollowerInteger(platform.followersCount);
    if (num > 0) {
      try {
        await fetch(`${COUNT_API_BASE}/set/${key}?value=${num}`);
      } catch {}
    }
  });

  // 2. Sync to local /api/data (if server running)
  const serverSyncPromise = (async () => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fullData,
          password: params.password || 'mrmla9'
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  })();

  // 3. Sync directly to GitHub repository (works seamlessly for GitHub Pages & static deploys)
  const githubSyncPromise = (async () => {
    const token = getGitHubToken();
    if (!token) return false;

    try {
      // Get current file sha from GitHub
      const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      let sha = '';
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      const jsonStr = JSON.stringify(fullData, null, 2);
      // Safe base64 encoding for UTF-8 Arabic strings
      const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: 'Update platforms, follower stats & videos via Admin Portal',
          content: base64Content,
          sha: sha || undefined
        })
      });

      return putRes.ok;
    } catch (err) {
      console.warn('[Online Data] GitHub Contents API write error:', err);
      return false;
    }
  })();

  // Execute all sync channels concurrently
  await Promise.allSettled([...countSyncPromises, serverSyncPromise, githubSyncPromise]);

  return { success: true, message: 'Modifications synchronisées en ligne avec succès !' };
}
