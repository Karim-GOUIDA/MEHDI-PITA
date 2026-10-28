import { SocialPlatform, RealVideo } from '../data/influencerData';

export interface AppOnlineData {
  platforms: SocialPlatform[];
  videos: RealVideo[];
  hypeCount?: number;
  updatedAt?: string;
}

const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/Karim-GOUIDA/MEHDI-PITA/main/data/app-data.json';
const STORAGE_PLATFORMS_KEY = 'pita_custom_platforms';
const STORAGE_VIDEOS_KEY = 'pita_custom_videos';

const getSupabaseFunctionUrl = (): string | null => {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '');
  return projectUrl ? `${projectUrl}/functions/v1/site-data` : null;
};

const updateLocalCache = (data: AppOnlineData) => {
  try {
    localStorage.setItem(STORAGE_PLATFORMS_KEY, JSON.stringify(data.platforms));
    localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(data.videos));
  } catch (error) {
    console.warn('[Online Data] Could not update local cache:', error);
  }
};

export async function fetchOnlineData(): Promise<AppOnlineData | null> {
  const functionUrl = getSupabaseFunctionUrl();

  if (functionUrl) {
    try {
      const response = await fetch(functionUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`Supabase returned HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = result?.data as AppOnlineData | null;
      if (data && Array.isArray(data.platforms) && Array.isArray(data.videos)) {
        updateLocalCache(data);
        return data;
      }
    } catch (error) {
      console.error('[Online Data] Failed to load shared Supabase data:', error);
    }
  }

  try {
    const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Fallback data returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as AppOnlineData;
    if (Array.isArray(data.platforms) && Array.isArray(data.videos)) {
      updateLocalCache(data);
      return data;
    }
  } catch (error) {
    console.warn('[Online Data] Failed to load fallback data:', error);
  }

  return null;
}

async function postToSupabase(payload: Record<string, unknown>): Promise<Response> {
  const functionUrl = getSupabaseFunctionUrl();
  if (!functionUrl) {
    throw new Error('Shared storage is not configured. Set VITE_SUPABASE_URL and deploy the Supabase function.');
  }

  return fetch(functionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  const response = await postToSupabase({ action: 'login', username, password });
  if (response.status === 401) return false;
  if (!response.ok) {
    throw new Error(`Admin authentication failed (HTTP ${response.status}).`);
  }
  return true;
}

export async function saveOnlineData(
  data: { platforms: SocialPlatform[]; videos: RealVideo[] },
  password: string
): Promise<void> {
  const response = await postToSupabase({ action: 'save', password, data });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error || `Could not save shared data (HTTP ${response.status}).`);
  }

  updateLocalCache({
    ...data,
    updatedAt: new Date().toISOString()
  });
}
