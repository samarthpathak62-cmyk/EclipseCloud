import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Globe, Image, Shield, Sparkles } from 'lucide-react';
import { useSettings } from '../../firebase/settingsContext';
import { useAuth } from '../../firebase/authContext';

export const AdminWebsiteSettingsTab: React.FC = () => {
  const { websiteSettings, updateWebsiteSettings, socialLinks, updateSocialLinks } = useSettings();
  const { user } = useAuth();

  // Website Settings Form State
  const [websiteName, setWebsiteName] = useState(websiteSettings.websiteName || '');
  const [logoUrl, setLogoUrl] = useState(websiteSettings.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(websiteSettings.faviconUrl || '');
  const [description, setDescription] = useState(websiteSettings.description || '');
  const [browserTitle, setBrowserTitle] = useState(websiteSettings.browserTitle || '');
  const [seoDescription, setSeoDescription] = useState(websiteSettings.seoDescription || '');
  const [primaryDiscordLink, setPrimaryDiscordLink] = useState(websiteSettings.primaryDiscordLink || '');
  const [supportDiscordLink, setSupportDiscordLink] = useState(websiteSettings.supportDiscordLink || '');
  const [footerText, setFooterText] = useState(websiteSettings.footerText || '');
  const [copyrightText, setCopyrightText] = useState(websiteSettings.copyrightText || '');
  const [uptimeGuarantee, setUptimeGuarantee] = useState(websiteSettings.uptimeGuarantee || '99.99% Uptime');
  const [serverNodeCount, setServerNodeCount] = useState(websiteSettings.serverNodeCount || '14+ Nodes');

  // Social Links Form State
  const [discordSocial, setDiscordSocial] = useState(socialLinks.discord || '');
  const [twitterSocial, setTwitterSocial] = useState(socialLinks.twitter || '');
  const [youtubeSocial, setYoutubeSocial] = useState(socialLinks.youtube || '');
  const [githubSocial, setGithubSocial] = useState(socialLinks.github || '');
  const [instagramSocial, setInstagramSocial] = useState(socialLinks.instagram || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setWebsiteName(websiteSettings.websiteName || '');
    setLogoUrl(websiteSettings.logoUrl || '');
    setFaviconUrl(websiteSettings.faviconUrl || '');
    setDescription(websiteSettings.description || '');
    setBrowserTitle(websiteSettings.browserTitle || '');
    setSeoDescription(websiteSettings.seoDescription || '');
    setPrimaryDiscordLink(websiteSettings.primaryDiscordLink || '');
    setSupportDiscordLink(websiteSettings.supportDiscordLink || '');
    setFooterText(websiteSettings.footerText || '');
    setCopyrightText(websiteSettings.copyrightText || '');
    setUptimeGuarantee(websiteSettings.uptimeGuarantee || '99.99% Uptime');
    setServerNodeCount(websiteSettings.serverNodeCount || '14+ Nodes');
  }, [websiteSettings]);

  useEffect(() => {
    setDiscordSocial(socialLinks.discord || '');
    setTwitterSocial(socialLinks.twitter || '');
    setYoutubeSocial(socialLinks.youtube || '');
    setGithubSocial(socialLinks.github || '');
    setInstagramSocial(socialLinks.instagram || '');
  }, [socialLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWebsiteSettings({
        websiteName: websiteName.trim(),
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim(),
        description: description.trim(),
        browserTitle: browserTitle.trim(),
        seoDescription: seoDescription.trim(),
        primaryDiscordLink: primaryDiscordLink.trim(),
        supportDiscordLink: supportDiscordLink.trim(),
        footerText: footerText.trim(),
        copyrightText: copyrightText.trim(),
        uptimeGuarantee: uptimeGuarantee.trim(),
        serverNodeCount: serverNodeCount.trim(),
      });

      await updateSocialLinks({
        discord: discordSocial.trim(),
        twitter: twitterSocial.trim(),
        youtube: youtubeSocial.trim(),
        github: githubSocial.trim(),
        instagram: instagramSocial.trim(),
        tiktok: socialLinks.tiktok || '',
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error updating website settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Website & Branding Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Global site configuration. Updating the website name or logo here instantly updates the navbar, hero, footer, dashboard, and browser metadata.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Settings Successfully Saved & Published</p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              New website identity and configuration are now live across all visitor screens and user dashboards.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Identity Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Brand Identity & Visual Assets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Website Name *</label>
              <input
                type="text"
                required
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                placeholder="e.g. NovaCraft Hosting"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Reflected dynamically on navbar, hero, order modal, and dashboard.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Browser Page Title</label>
              <input
                type="text"
                value={browserTitle}
                onChange={(e) => setBrowserTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                placeholder="e.g. NovaCraft - Premium Minecraft Server Hosting"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Logo Image URL (Optional)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                placeholder="https://example.com/logo.png"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                If left blank, the sleek vector server icon badge will be displayed.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Favicon URL (Optional)</label>
              <input
                type="url"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Website Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              placeholder="Enterprise-grade, ultra low-latency Minecraft server hosting..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Meta SEO Description</label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              placeholder="Search engine index description..."
            />
          </div>
        </div>

        {/* Global Node & Hardware Counters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Trust & Hardware Display Badges</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Uptime SLA Text</label>
              <input
                type="text"
                value={uptimeGuarantee}
                onChange={(e) => setUptimeGuarantee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="99.99% Uptime"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Server Locations Text</label>
              <input
                type="text"
                value={serverNodeCount}
                onChange={(e) => setServerNodeCount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="14+ Global Locations"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Social Media Profiles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Twitter / X URL</label>
              <input
                type="url"
                value={twitterSocial}
                onChange={(e) => setTwitterSocial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="https://twitter.com/novacraft"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">YouTube URL</label>
              <input
                type="url"
                value={youtubeSocial}
                onChange={(e) => setYoutubeSocial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="https://youtube.com/@novacraft"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">GitHub URL</label>
              <input
                type="url"
                value={githubSocial}
                onChange={(e) => setGithubSocial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="https://github.com/novacraft"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Instagram URL</label>
              <input
                type="url"
                value={instagramSocial}
                onChange={(e) => setInstagramSocial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="https://instagram.com/novacraft"
              />
            </div>
          </div>
        </div>

        {/* Legal & Footer Text Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
            Footer Text & Disclaimers
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Disclaimer / Footer Text</label>
            <textarea
              rows={2}
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              placeholder="Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Copyright Line</label>
            <input
              type="text"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              placeholder="© 2026 NovaCraft Hosting Ltd. All rights reserved."
            />
          </div>
        </div>

        {/* Publish Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
