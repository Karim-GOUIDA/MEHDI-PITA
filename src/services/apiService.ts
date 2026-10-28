import { SocialPlatform, RealVideo } from '../data/influencerData';

export interface AppOnlineData {
  platforms: SocialPlatform[];
  videos: RealVideo[];
  hypeCount?: number;
  updatedAt?: string;
}

const STORAGE_PLATFORMS_KEY = 'pita_custom_platforms';
const STORAGE_VIDEOS_KEY = 'pita_custom_videos';

/**
 * Fetch online data from server /api/data.
 * Returns null if network fails so caller can fall back to local cache.
 */
export async function fetchOnlineData(): Promise<AppOnlineData | null> {
  try {
    const res = await fetch('/api/data', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json && json.success && json.data) {
      const { platforms, videos, hypeCount, updatedAt } = json.data;

      // Update local storage cache
      if (Array.isArray(platforms) && platforms.length > 0) {
        try {
          localStorage.setItem(STORAGE_PLATFORMS_KEY, JSON.stringify(platforms));
        } catch {}
      }
      if (Array.isArray(videos)) {
        try {
          localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(videos));
        } catch {}
      }

      return { platforms, videos, hypeCount, updatedAt };
    }
  } catch (err) {
    console.warn('[Online Data] Failed to fetch latest online data from server:', err);
  }

  return null;
}

/**
 * Save updated platforms & videos directly to the online server.
 */
export async function saveOnlineData(params: {
  platforms: SocialPlatform[];
  videos: RealVideo[];
  hypeCount?: number;
  password?: string;
}): Promise<{ success: boolean; message?: string }> {
  // Always update local cache immediately (optimistic)
  try {
    localStorage.setItem(STORAGE_PLATFORMS_KEY, JSON.stringify(params.platforms));
    localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(params.videos));
  } catch {}

  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        platforms: params.platforms,
        videos: params.videos,
        hypeCount: params.hypeCount,
        password: params.password || 'mrmla9'
      })
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, message: json.message || 'Saved online' };
    } else {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, message: errJson.error || 'Server error' };
    }
  } catch (err: any) {
    console.error('[Online Data] Network error while saving to online server:', err);
    return { success: false, message: err?.message || 'Network error' };
  }
}
