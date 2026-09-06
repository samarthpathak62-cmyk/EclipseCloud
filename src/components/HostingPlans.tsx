import React, { useEffect, useState } from 'react';
import {
  Layers,
  Cpu,
  HardDrive,
  Check,
  MessageSquare,
  Sparkles,
  Zap,
  Gem,
  Crown,
  Box,
  Flame,
  Filter,
} from 'lucide-react';
import { HostingPlan, PlanCategory } from '../types';
import { fetchPlans, fetchCategories } from '../firebase/firestoreService';
import { useSettings } from '../firebase/settingsContext';
import { DiscordOrderModal } from './DiscordOrderModal';

interface HostingPlansProps {
  limitCount?: number;
  showAllHeader?: boolean;
}

export const HostingPlans: React.FC<HostingPlansProps> = ({
  limitCount,
  showAllHeader = true,
}) => {
  const { websiteSettings, plans: contextPlans, categories: contextCategories } = useSettings();
  const [plans, setPlans] = useState<HostingPlan[]>(() => (contextPlans || []).filter((p) => p.active));
  const [categories, setCategories] = useState<PlanCategory[]>(() => (contextCategories || []).filter((c) => c.active));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(() => !contextPlans || contextPlans.length === 0);
  const [selectedOrderPlan, setSelectedOrderPlan] = useState<HostingPlan | null>(null);

  useEffect(() => {
    if (contextPlans && contextPlans.length > 0) {
      setPlans(contextPlans.filter((p) => p.active));
      setCategories((contextCategories || []).filter((c) => c.active));
      setLoading(false);
    } else {
      const loadData = async () => {
        setLoading(true);
        try {
          const [loadedPlans, loadedCategories] = await Promise.all([
            fetchPlans(),
            fetchCategories(),
          ]);
          setPlans(loadedPlans.filter((p) => p.active));
          setCategories(loadedCategories.filter((c) => c.active));
        } catch (err) {
          console.warn('Error loading plans from Firebase:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [contextPlans, contextCategories]);

  const getPlanIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'box':
        return <Box className="w-5 h-5 text-emerald-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'gem':
        return <Gem className="w-5 h-5 text-cyan-400" />;
      case 'crown':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      default:
        return <Layers className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getPlanTopBorderClass = (plan: HostingPlan) => {
    if (plan.isPopular) return 'mc-card-top-diamond';
    if (plan.isBestValue) return 'mc-card-top-gold';
    if (plan.ram.includes('16GB') || plan.ram.includes('32GB') || plan.ram.includes('64GB')) return 'mc-card-top-nether';
    return 'mc-card-top-grass';
  };

  const filteredPlans = plans.filter((plan) => {
    if (selectedCategory === 'all') return true;
    return (
      plan.category.toLowerCase() === selectedCategory.toLowerCase() ||
      plan.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  const displayedPlans = limitCount ? filteredPlans.slice(0, limitCount) : filteredPlans;

  return (
    <section id="plans" className="py-16 sm:py-24 relative bg-obsidian-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showAllHeader && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3 shadow-inner">
              ⛏️ Minecraft Server Node Catalog
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              High-Performance Minecraft Server Plans
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-300">
              Select your optimal server tier. Every plan features dedicated Ryzen 9 clocking, instant setup, and 2.5+ Tbps DDoS mitigation.
            </p>
          </div>
        )}

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2.5 mb-12">
            <button
              id="category-filter-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 border border-emerald-300/30 font-black'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Minecraft Plans ({plans.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`category-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 border border-emerald-300/30 font-black'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Plans Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : displayedPlans.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-slate-900/80 rounded-2xl border border-slate-800 p-8 max-w-lg mx-auto">
            <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No plans found</h3>
            <p className="text-sm text-slate-400 mt-1">
              There are currently no active plans listed under the selected category.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 px-4 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg"
            >
              View All Plans
            </button>
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedPlans.map((plan) => {
              const isHighlighted = plan.isPopular || plan.isBestValue;
              const topBorderClass = getPlanTopBorderClass(plan);

              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  className={`mc-card ${topBorderClass} relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-300 ease-out group ${
                    isHighlighted
                      ? 'bg-slate-900/95 border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950/60 scale-[1.01] hover:scale-[1.035] hover:-translate-y-2 hover:border-emerald-400 hover:shadow-emerald-900/60'
                      : 'bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-xl hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-950/70'
                  }`}
                >
                  {/* Highlight Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg ${
                          plan.isPopular
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border border-emerald-200/40'
                            : plan.isBestValue
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border border-cyan-200/40'
                            : 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{plan.badge}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 pt-1">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:border-emerald-500/50 transition-all duration-300">
                            {getPlanIcon(plan.icon)}
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">{plan.category}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="flex items-baseline justify-end">
                          <span className="text-sm font-bold text-slate-400 mr-0.5">
                            {plan.currency}
                          </span>
                          <span className="text-3xl font-black text-white tracking-tight">
                            {plan.price}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">{plan.billingPeriod || '/mo'}</span>
                      </div>
                    </div>

                    {/* Plan Description */}
                    <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[38px]">
                      {plan.description}
                    </p>

                    {/* Hardware Badges */}
                    <div className="mt-5 grid grid-cols-3 gap-2 py-3 px-3 bg-slate-950/80 border border-slate-800/90 rounded-xl text-center shadow-inner">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">RAM</span>
                        <span className="text-xs font-extrabold text-emerald-400 mt-0.5">{plan.ram}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center border-x border-slate-800/90 px-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CPU Clock</span>
                        <span className="text-xs font-extrabold text-cyan-400 mt-0.5 truncate max-w-full">{plan.cpu}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">NVMe Storage</span>
                        <span className="text-xs font-extrabold text-amber-400 mt-0.5 truncate max-w-full">{plan.storage}</span>
                      </div>
                    </div>

                    {/* Feature Bullets */}
                    <div className="mt-6 space-y-2.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Server Inclusions:
                      </p>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan CTA Button */}
                  <div className="mt-8 pt-4 border-t border-slate-800/80">
                    <button
                      id={`buy-plan-btn-${plan.id}`}
                      onClick={() => setSelectedOrderPlan(plan)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all shadow-md cursor-pointer ${
                        isHighlighted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02]'
                          : 'bg-slate-800 hover:bg-[#5865F2] text-white border border-slate-700/80 hover:border-[#5865F2] hover:scale-[1.01]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{plan.discordCtaText || 'Order on Discord'}</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
                      Fast setup via Discord #order-support
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discord Order System Modal */}
      {selectedOrderPlan && (
        <DiscordOrderModal
          plan={selectedOrderPlan}
          onClose={() => setSelectedOrderPlan(null)}
        />
      )}
    </section>
  );
};
