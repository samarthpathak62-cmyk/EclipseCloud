import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';
import { ReviewItem } from '../types';
import { fetchReviews } from '../firebase/firestoreService';
import { useSettings } from '../firebase/settingsContext';

export const ReviewsSection: React.FC = () => {
  const { homepageConfig } = useSettings();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchReviews();
        setReviews(items.filter((r) => r.active));
      } catch (err) {
        console.warn('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="reviews" className="py-20 relative bg-obsidian-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3 shadow-inner">
            ⛏️ Real Minecraft Server Owners
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {homepageConfig.reviewsTitle || 'Trusted by Server Owners Worldwide'}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            {homepageConfig.reviewsSubtitle ||
              'See why Minecraft communities, SMP creators, and network owners trust our high-performance infrastructure.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                id={`review-card-${rev.id}`}
                className="mc-card mc-card-top-gold rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-slate-700" />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{rev.authorName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{rev.authorRole}</p>
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Owner</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
