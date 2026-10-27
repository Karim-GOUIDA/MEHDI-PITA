import { useState, useEffect, useCallback } from 'react';
import { SOCIAL_PLATFORMS, SocialPlatform } from '../data/influencerData';

export interface LiveStatsState {
  platforms: SocialPlatform[];
  isSyncing: boolean;
  lastSynced: Date;
  autoSyncActive: boolean;
  discordOnline?: number;
  kickIsLive?: boolean;
}

export function formatFollowerCount(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export const fetchLivePlatformStats = async (): Promise<{
  kickFollowers?: number;
  kickIsLive?: boolean;
  discordMembers?: number;
  discordOnline?: number;
}> => {
  const result: {
    kickFollowers?: number;
    kickIsLive?: boolean;
    discordMembers?: number;
    discordOnline?: number;
  } = {};

  // 1. Fetch live Discord Invite stats
  try {
    const discordRes = await fetch('https://discord.com/api/v9/invites/GnxEWBnkCP?with_counts=true', {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (discordRes.ok) {
      const data = await discordRes.json();
      if (typeof data.approximate_member_count === 'number') {
        result.discordMembers = data.approximate_member_count;
      }
      if (typeof data.approximate_presence_count === 'number') {
        result.discordOnline = data.approximate_presence_count;
      }
    }
  } catch (err) {
    console.debug('Discord live fetch error:', err);
  }

  // 2. Fetch live Kick Channel stats
  try {
    const kickRes = await fetch('https://kick.com/api/v2/channels/mehdipita', {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (kickRes.ok) {
      const data = await kickRes.json();
      if (typeof data.followers_count === 'number') {
        result.kickFollowers = data.followers_count;
      }
      result.kickIsLive = Boolean(data.livestream);
    }
  } catch (err) {
    console.debug('Kick live fetch error:', err);
  }

  return result;
};

export function useLiveStats() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(SOCIAL_PLATFORMS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [discordOnline, setDiscordOnline] = useState<number>(11);
  const [kickIsLive, setKickIsLive] = useState<boolean>(false);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const liveData = await fetchLivePlatformStats();

      setPlatforms((prev) =>
        prev.map((platform) => {
          // Update Discord
          if (platform.id === 'discord' && liveData.discordMembers) {
            const countStr = `${liveData.discordMembers}`;
            const onlineStr = liveData.discordOnline ? ` · ${liveData.discordOnline} متصل الآن` : '';
            const onlineStrFr = liveData.discordOnline ? ` · ${liveData.discordOnline} en ligne` : '';

            return {
              ...platform,
              followersCount: countStr,
              followersRaw: liveData.discordMembers,
              highlightsAr: `${countStr} عضو${onlineStr} · شات مباشر`,
              highlightsFr: `${countStr} membres${onlineStrFr} · Chat actif`,
              isLiveSynced: true
            };
          }

          // Update Kick
          if (platform.id === 'kick' && liveData.kickFollowers) {
            const formatted = formatFollowerCount(liveData.kickFollowers);
            return {
              ...platform,
              followersCount: formatted,
              followersRaw: liveData.kickFollowers,
              highlightsAr: `${formatted} متابع · سهرات كروية وبث مباشر`,
              highlightsFr: `${formatted} followers · Live streaming & réacs`,
              isLiveSynced: true
            };
          }

          return platform;
        })
      );

      if (liveData.discordOnline !== undefined) {
        setDiscordOnline(liveData.discordOnline);
      }
      if (liveData.kickIsLive !== undefined) {
        setKickIsLive(liveData.kickIsLive);
      }
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    sync();

    // Auto polling every 45 seconds
    const interval = setInterval(() => {
      sync();
    }, 45000);

    return () => clearInterval(interval);
  }, [sync]);

  return {
    platforms,
    isSyncing,
    lastSynced,
    discordOnline,
    kickIsLive,
    refreshNow: sync
  };
}
