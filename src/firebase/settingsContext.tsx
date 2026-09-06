import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  WebsiteSettings,
  DiscordSettings,
  HomepageConfig,
  Announcement,
  SocialLinks,
  HostingPlan,
  PlanCategory,
} from '../types';
import {
  fetchWebsiteSettings,
  fetchDiscordSettings,
  fetchHomepageConfig,
  fetchAnnouncements,
  fetchSocialLinks,
  fetchPlans,
  fetchCategories,
  saveWebsiteSettings,
  saveDiscordSettings,
  saveHomepageConfig,
  saveSocialLinks,
  initializeSeedDataIfNeeded,
} from './firestoreService';
import {
  INITIAL_WEBSITE_SETTINGS,
  INITIAL_DISCORD_SETTINGS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_PLANS,
  INITIAL_CATEGORIES,
} from './seedData';

const CACHE_KEYS = {
  WEBSITE: 'novacraft_cached_website_settings',
  DISCORD: 'novacraft_cached_discord_settings',
  HOMEPAGE: 'novacraft_cached_homepage_config',
  ANNOUNCEMENTS: 'novacraft_cached_announcements',
  SOCIAL: 'novacraft_cached_social_links',
  PLANS: 'novacraft_cached_plans',
  CATEGORIES: 'novacraft_cached_categories',
};

function getLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) {
        if (Array.isArray(parsed)) {
          return parsed as unknown as T;
        }
        if (parsed && typeof parsed === 'object') {
          return Object.values(parsed) as unknown as T;
        }
        return fallback;
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...fallback, ...parsed };
      }
    }
  } catch {
    // ignore
  }
  return fallback;
}

function setLocalCache<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

interface SettingsContextValue {
  websiteSettings: WebsiteSettings;
  discordSettings: DiscordSettings;
  homepageConfig: HomepageConfig;
  announcements: Announcement[];
  socialLinks: SocialLinks;
  plans: HostingPlan[];
  categories: PlanCategory[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  updateWebsiteSettings: (newSettings: WebsiteSettings, actorEmail?: string) => Promise<void>;
  updateDiscordSettings: (newSettings: DiscordSettings, actorEmail?: string) => Promise<void>;
  updateHomepageConfig: (newConfig: HomepageConfig, actorEmail?: string) => Promise<void>;
  updateSocialLinks: (newLinks: SocialLinks, actorEmail?: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() =>
    getLocalCache(CACHE_KEYS.WEBSITE, INITIAL_WEBSITE_SETTINGS)
  );
  const [discordSettings, setDiscordSettings] = useState<DiscordSettings>(() =>
    getLocalCache(CACHE_KEYS.DISCORD, INITIAL_DISCORD_SETTINGS)
  );
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() =>
    getLocalCache(CACHE_KEYS.HOMEPAGE, INITIAL_HOMEPAGE_CONFIG)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getLocalCache(CACHE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() =>
    getLocalCache(CACHE_KEYS.SOCIAL, INITIAL_SOCIAL_LINKS)
  );
  const [plans, setPlans] = useState<HostingPlan[]>(() =>
    getLocalCache(CACHE_KEYS.PLANS, INITIAL_PLANS)
  );
  const [categories, setCategories] = useState<PlanCategory[]>(() =>
    getLocalCache(CACHE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Sync document title immediately
  useEffect(() => {
    if (websiteSettings.browserTitle) {
      document.title = websiteSettings.browserTitle;
    } else if (websiteSettings.websiteName) {
      document.title = `${websiteSettings.websiteName} | High Performance Minecraft Hosting`;
    }
  }, [websiteSettings]);

  const refreshPlans = async () => {
    try {
      const [fetchedPlans, fetchedCategories] = await Promise.all([
        fetchPlans(),
        fetchCategories(),
      ]);
      setPlans(fetchedPlans);
      setLocalCache(CACHE_KEYS.PLANS, fetchedPlans);
      setCategories(fetchedCategories);
      setLocalCache(CACHE_KEYS.CATEGORIES, fetchedCategories);
    } catch (err) {
      console.warn('Error refreshing plans:', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const [web, disc, home, ann, soc, fetchedPlans, fetchedCategories] = await Promise.all([
        fetchWebsiteSettings(),
        fetchDiscordSettings(),
        fetchHomepageConfig(),
        fetchAnnouncements(),
        fetchSocialLinks(),
        fetchPlans(),
        fetchCategories(),
      ]);

      setWebsiteSettings(web);
      setLocalCache(CACHE_KEYS.WEBSITE, web);

      setDiscordSettings(disc);
      setLocalCache(CACHE_KEYS.DISCORD, disc);

      setHomepageConfig(home);
      setLocalCache(CACHE_KEYS.HOMEPAGE, home);

      const safeAnn = Array.isArray(ann)
        ? ann
        : (ann && typeof ann === 'object' ? (Object.values(ann) as Announcement[]) : INITIAL_ANNOUNCEMENTS);
      setAnnouncements(safeAnn);
      setLocalCache(CACHE_KEYS.ANNOUNCEMENTS, safeAnn);

      setSocialLinks(soc);
      setLocalCache(CACHE_KEYS.SOCIAL, soc);

      setPlans(fetchedPlans);
      setLocalCache(CACHE_KEYS.PLANS, fetchedPlans);

      setCategories(fetchedCategories);
      setLocalCache(CACHE_KEYS.CATEGORIES, fetchedCategories);

      if (web.browserTitle) {
        document.title = web.browserTitle;
      } else if (web.websiteName) {
        document.title = `${web.websiteName} | High Performance Minecraft Hosting`;
      }
    } catch (err) {
      console.warn('Error refreshing settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check & seed database on first run
    const init = async () => {
      await initializeSeedDataIfNeeded();
      await refreshSettings();
    };
    init();
  }, []);

  const handleUpdateWebsiteSettings = async (newSettings: WebsiteSettings, actorEmail = 'Admin') => {
    setWebsiteSettings(newSettings);
    setLocalCache(CACHE_KEYS.WEBSITE, newSettings);
    if (newSettings.browserTitle) {
      document.title = newSettings.browserTitle;
    } else if (newSettings.websiteName) {
      document.title = `${newSettings.websiteName} | High Performance Minecraft Hosting`;
    }
    try {
      await saveWebsiteSettings(newSettings, actorEmail);
    } catch (err) {
      console.warn('Could not sync website settings to cloud Firestore (saved locally):', err);
    }
  };

  const handleUpdateDiscordSettings = async (newSettings: DiscordSettings, actorEmail = 'Admin') => {
    setDiscordSettings(newSettings);
    setLocalCache(CACHE_KEYS.DISCORD, newSettings);
    try {
      await saveDiscordSettings(newSettings, actorEmail);
    } catch (err) {
      console.warn('Could not sync Discord settings to cloud Firestore (saved locally):', err);
    }
  };

  const handleUpdateHomepageConfig = async (newConfig: HomepageConfig, actorEmail = 'Admin') => {
    setHomepageConfig(newConfig);
    setLocalCache(CACHE_KEYS.HOMEPAGE, newConfig);
    try {
      await saveHomepageConfig(newConfig, actorEmail);
    } catch (err) {
      console.warn('Could not sync homepage config to cloud Firestore (saved locally):', err);
    }
  };

  const handleUpdateSocialLinks = async (newLinks: SocialLinks, actorEmail = 'Admin') => {
    setSocialLinks(newLinks);
    setLocalCache(CACHE_KEYS.SOCIAL, newLinks);
    try {
      await saveSocialLinks(newLinks, actorEmail);
    } catch (err) {
      console.warn('Could not sync social links to cloud Firestore (saved locally):', err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        websiteSettings,
        discordSettings,
        homepageConfig,
        announcements,
        socialLinks,
        plans,
        categories,
        loading,
        refreshSettings,
        refreshPlans,
        updateWebsiteSettings: handleUpdateWebsiteSettings,
        updateDiscordSettings: handleUpdateDiscordSettings,
        updateHomepageConfig: handleUpdateHomepageConfig,
        updateSocialLinks: handleUpdateSocialLinks,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
