import React, { useState } from 'react';
import {
  Server,
  MessageSquare,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  HardDrive,
  Copy,
  Check,
  Globe,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../firebase/settingsContext';

interface HeroProps {
  onExplorePlans: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplorePlans }) => {
  const { homepageConfig, websiteSettings, discordSettings } = useSettings();
  const [copiedIp, setCopiedIp] = useState(false);

  if (!homepageConfig.heroVisible) return null;

  const serverIp = 'play.novacraft-hosting.net';

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2500);
  };

  return (
    <div id="hero-section" className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-obsidian-mesh">
      {/* Background Lighting & Pixel Mesh Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-cyan-500/12 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-mc-grid opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Minecraft Status Pill & Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-lg shadow-emerald-950/40 mb-6 text-xs text-slate-200 backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>⛏️ Minecraft 1.8 - 1.21.x</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              TPS: 20.0 Locked
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400 font-medium">Path.net 2.5+ Tbps DDoS Shield</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            {homepageConfig.heroHeading || 'Ultra-Fast Minecraft Server Hosting'}
          </h1>

          {/* Minecraft Subheading */}
          <p className="mt-5 text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            {homepageConfig.heroSubheading || 'Powered by AMD Ryzen™ 9 7950X & Enterprise DDR5 RAM'}
          </p>

          {/* Hero Description */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            {homepageConfig.heroDescription ||
              'Run buttery-smooth SMPs, Modpacks, and BungeeCord networks with zero lag, instant Discord order fulfillment, and full Pterodactyl panel control.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-primary-cta-btn"
              onClick={onExplorePlans}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.03] active:scale-[0.98] border border-emerald-300/40 cursor-pointer"
            >
              <Server className="w-5 h-5 text-slate-950" />
              <span>{homepageConfig.heroCtaText || 'View Server Plans'}</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>

            <a
              id="hero-discord-cta-btn"
              href={discordSettings.mainInviteUrl || 'https://discord.gg'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-bold bg-slate-900/90 hover:bg-[#5865F2] text-white border border-slate-700/80 hover:border-[#5865F2] shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <MessageSquare className="w-5 h-5 text-[#7983f5] group-hover:text-white" />
              <span>{homepageConfig.heroDiscordText || discordSettings.buttonText || 'Order on Discord'}</span>
            </a>
          </div>

          {/* Minecraft Server Demo IP Bar */}
          <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg max-w-md w-full justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Test Server Node IP</p>
                <p className="text-xs font-mono font-bold text-slate-100">{serverIp}</p>
              </div>
            </div>
            <button
              onClick={handleCopyIp}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700/60 cursor-pointer"
              title="Copy IP"
            >
              {copiedIp ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IP</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Minecraft Server Specs Grid */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="mc-card mc-card-top-grass rounded-xl p-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Processor</p>
                <p className="text-sm font-bold text-white">Ryzen 9 7950X</p>
              </div>
            </div>

            <div className="mc-card mc-card-top-diamond rounded-xl p-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Storage Array</p>
                <p className="text-sm font-bold text-white">Gen4 NVMe RAID</p>
              </div>
            </div>

            <div className="mc-card mc-card-top-gold rounded-xl p-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">DDoS Protection</p>
                <p className="text-sm font-bold text-white">2.5+ Tbps Path.net</p>
              </div>
            </div>

            <div className="mc-card mc-card-top-grass rounded-xl p-4 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Uptime SLA</p>
                <p className="text-sm font-bold text-white">{websiteSettings.uptimeGuarantee || '99.99% Uptime'}</p>
              </div>
            </div>
          </div>

          {/* Minecraft Modpacks & Software Compatibility Tags */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Supported Server Engines:</span>
            {['PaperMC', 'Purpur', 'Fabric', 'Forge', 'NeoForge', 'Spigot', 'Velocity', 'BungeeCord'].map((engine) => (
              <span
                key={engine}
                className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-[11px]"
              >
                {engine}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
