import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Globe2,
  Clock,
  Zap,
} from 'lucide-react';
import { useSettings } from '../firebase/settingsContext';

export const WhyChooseUs: React.FC = () => {
  const { homepageConfig, websiteSettings } = useSettings();

  const comparison = [
    {
      feature: 'Processor Architecture',
      us: 'Ryzen 9 7950X / 9950X (5.7 GHz single-core)',
      others: 'Outdated Xeon / Epyc shared threads (sub 3.5 GHz)',
    },
    {
      feature: 'Memory Standard',
      us: 'DDR5 5600MHz ECC Low-Latency RAM',
      others: 'Overcommitted DDR4 or slow desktop RAM',
    },
    {
      feature: 'DDoS Defense',
      us: 'Path.net 2.5+ Tbps inline Minecraft Packet Filter',
      others: 'Generic web filters causing false player drops',
    },
    {
      feature: 'Order & Support Flow',
      us: 'Direct Discord consultation with server specialists',
      others: 'Automated email bot replies & 48-hour tickets',
    },
    {
      feature: 'TPS & Uptime Commitment',
      us: 'Locked 20.0 TPS Guarantee & 99.99% Hardware SLA',
      others: 'Frequent node lag spikes & unannounced reboots',
    },
  ];

  return (
    <section id="why-us" className="py-20 relative overflow-hidden bg-obsidian-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 shadow-inner">
            ⚡ Architectural Superiority
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {homepageConfig.whyChooseUsTitle || 'Engineered for Performance & Zero Bottlenecks'}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            {homepageConfig.whyChooseUsDescription ||
              'We invest exclusively in top-tier dedicated hardware so your Minecraft community enjoys silky smooth 20.0 TPS with heavy modpacks and high view distances.'}
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="max-w-4xl mx-auto mc-card mc-card-top-diamond rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-950/95 border-b border-slate-800 text-sm font-extrabold p-4 text-center">
            <div className="text-left text-slate-400 font-mono">Minecraft Host Metric</div>
            <div className="text-emerald-400 flex items-center justify-center gap-1.5 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{websiteSettings.websiteName || 'NovaCraft Hosting'}</span>
            </div>
            <div className="text-slate-500 flex items-center justify-center gap-1.5 py-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Generic Budget Hosts</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {comparison.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 gap-3 items-center text-xs sm:text-sm hover:bg-slate-800/40 transition-colors"
              >
                <div className="font-bold text-white">{item.feature}</div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold bg-emerald-950/30 md:bg-transparent p-2.5 md:p-0 rounded-lg border border-emerald-500/20 md:border-none">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.us}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-rose-950/20 md:bg-transparent p-2.5 md:p-0 rounded-lg border border-rose-500/10 md:border-none">
                  <XCircle className="w-4 h-4 text-rose-400/80 shrink-0" />
                  <span>{item.others}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Network Nodes & Stats */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="mc-card mc-card-top-grass rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <Globe2 className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-white">Sub-15ms Ping</p>
            <p className="text-xs text-slate-400 mt-1">Global Premium Datacenters</p>
          </div>

          <div className="mc-card mc-card-top-diamond rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-white">Instant Deployment</p>
            <p className="text-xs text-slate-400 mt-1">Discord Order Coordination</p>
          </div>

          <div className="mc-card mc-card-top-gold rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-white">99.99% SLA Uptime</p>
            <p className="text-xs text-slate-400 mt-1">Guaranteed Hardware Integrity</p>
          </div>
        </div>
      </div>
    </section>
  );
};
