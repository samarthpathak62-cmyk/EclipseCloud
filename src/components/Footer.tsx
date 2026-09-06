import React from 'react';
import {
  Server,
  MessageSquare,
  Twitter,
  Youtube,
  Github,
  Instagram,
  ExternalLink,
  Shield,
  Heart,
} from 'lucide-react';
import { useSettings } from '../firebase/settingsContext';
import { useAuth } from '../firebase/authContext';

interface FooterProps {
  setCurrentView: (view: 'home' | 'plans' | 'dashboard' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const { websiteSettings, discordSettings, socialLinks } = useSettings();
  const { isAdmin, user, openAuthModal } = useAuth();

  return (
    <footer id="site-footer" className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              {websiteSettings.logoUrl ? (
                <img
                  src={websiteSettings.logoUrl}
                  alt={websiteSettings.websiteName}
                  className="h-9 w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                  <Server className="w-5 h-5" />
                </div>
              )}
              <span className="text-lg font-black tracking-tight text-white">
                {websiteSettings.websiteName || 'Eclipse Cloud'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {websiteSettings.description ||
                'Enterprise-grade, ultra low-latency Minecraft server hosting powered by Ryzen 9 7950X CPUs, NVMe Gen4 SSDs, and 2.5+ Tbps Path.net DDoS protection.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                id="footer-discord-link"
                href={discordSettings.mainInviteUrl || 'https://discord.gg'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-[#7983f5] hover:border-[#5865F2] transition-colors"
                title="Discord Community"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              {socialLinks.twitter && (
                <a
                  id="footer-twitter-link"
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
                  title="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  id="footer-youtube-link"
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {socialLinks.github && (
                <a
                  id="footer-github-link"
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('plans')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Minecraft Plans Catalog
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Hardware & Features
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-emerald-400 transition-colors">
                  Zero Bottlenecks Comparison
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Discord */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ordering & Portal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href={discordSettings.orderInviteUrl || discordSettings.mainInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#7983f5] transition-colors flex items-center gap-1.5"
                >
                  <span>Discord Order Desk</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={discordSettings.supportInviteUrl || discordSettings.mainInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#7983f5] transition-colors flex items-center gap-1.5"
                >
                  <span>24/7 Discord Support</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              {user ? (
                <li>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    User Dashboard (My Plans)
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Sign In / Register
                  </button>
                </li>
              )}
              {isAdmin && (
                <li>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Admin Control Center</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Discord Server Widget */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Join Official Community</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{discordSettings.serverName || 'Official Discord'}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    {discordSettings.memberCountEstimate || '18,400+ Active Members'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {discordSettings.description ||
                  'Open a ticket in #order-support to get your server configured within 5 minutes!'}
              </p>
              <a
                id="footer-join-discord-btn"
                href={discordSettings.mainInviteUrl || 'https://discord.gg'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-colors"
              >
                <span>{discordSettings.buttonText || 'Join Discord'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal and Disclaimer text from Settings */}
        <div className="pt-8 space-y-3 text-[11px] text-slate-400 leading-relaxed">
          <p>{websiteSettings.footerText}</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-900">
            <p className="text-slate-400 font-medium">{websiteSettings.copyrightText}</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <span>Built for Performance</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              </span>
              <span>•</span>
              <button onClick={() => setCurrentView('plans')} className="hover:text-white">
                Plans
              </button>
              <span>•</span>
              <a href={discordSettings.mainInviteUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
