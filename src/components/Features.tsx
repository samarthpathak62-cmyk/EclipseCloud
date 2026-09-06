import React, { useEffect, useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  HardDrive,
  Server,
  MessageSquare,
  Activity,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import { FeatureItem } from '../types';
import { fetchFeatures } from '../firebase/firestoreService';
import { useSettings } from '../firebase/settingsContext';

export const Features: React.FC = () => {
  const { homepageConfig } = useSettings();
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const feats = await fetchFeatures();
        setFeatures(feats.filter((f) => f.active));
      } catch (e) {
        console.warn('Error fetching features:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'cpu':
        return <Cpu className="w-6 h-6 text-emerald-400" />;
      case 'shieldcheck':
      case 'shield':
        return <ShieldCheck className="w-6 h-6 text-indigo-400" />;
      case 'harddrive':
        return <HardDrive className="w-6 h-6 text-cyan-400" />;
      case 'server':
        return <Server className="w-6 h-6 text-amber-400" />;
      case 'messagesquare':
        return <MessageSquare className="w-6 h-6 text-[#7983f5]" />;
      case 'activity':
        return <Activity className="w-6 h-6 text-emerald-400" />;
      case 'globe':
        return <Globe className="w-6 h-6 text-blue-400" />;
      case 'lock':
        return <Lock className="w-6 h-6 text-emerald-400" />;
      default:
        return <Zap className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <section id="features" className="py-20 bg-obsidian-mesh border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3 shadow-inner">
            ⛏️ Pure Bare-Metal Minecraft Power
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {homepageConfig.featuresTitle || 'Next-Generation Infrastructure'}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            {homepageConfig.featuresSubtitle ||
              'Everything you need to run a flawless Minecraft community without server lag or downtime.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.id}
                id={`feature-card-${feat.id}`}
                className="mc-card mc-card-top-grass rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                    {getIcon(feat.icon)}
                  </div>
                  {feat.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                      {feat.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
