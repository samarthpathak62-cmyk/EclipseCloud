import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle, Search, MessageSquare } from 'lucide-react';
import { FaqItem } from '../types';
import { fetchFaqs } from '../firebase/firestoreService';
import { useSettings } from '../firebase/settingsContext';

export const FaqSection: React.FC = () => {
  const { homepageConfig, discordSettings } = useSettings();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchFaqs();
        setFaqs(items.filter((f) => f.active));
        if (items.length > 0) {
          setOpenId(items[0].id);
        }
      } catch (err) {
        console.warn('Error loading FAQs:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="faq" className="py-20 bg-obsidian-mesh border-t border-slate-800/80 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3 shadow-inner">
            ⛏️ Got Questions?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {homepageConfig.faqTitle || 'Frequently Asked Questions'}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            {homepageConfig.faqSubtitle ||
              'Everything you need to know about our plans, Discord ordering process, and Minecraft hardware.'}
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. Discord ordering, mods, DDoS)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
            />
          </div>
        </div>

        {/* FAQs Accordion */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-sm">
            No questions matching "{searchTerm}". Check our Discord server for instant answers!
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="mc-card rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm sm:text-base font-extrabold text-white">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Discord Support Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-left">
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#7983f5]" />
              Need custom RAM allocations or plugin assistance?
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Join our Discord community to speak directly with node engineers and request custom specs.
            </p>
          </div>
          <a
            href={discordSettings.mainInviteUrl || 'https://discord.gg'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all shadow-md shrink-0 cursor-pointer"
          >
            Ask in Discord #support
          </a>
        </div>
      </div>
    </section>
  );
};
