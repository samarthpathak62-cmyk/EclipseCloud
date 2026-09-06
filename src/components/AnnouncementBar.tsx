import React, { useState, useMemo } from 'react';
import { Megaphone, X, ExternalLink } from 'lucide-react';
import { useSettings } from '../firebase/settingsContext';
import { Announcement } from '../types';

export const AnnouncementBar: React.FC = () => {
  const { announcements, discordSettings } = useSettings();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const safeAnnouncements: Announcement[] = useMemo(() => {
    if (Array.isArray(announcements)) return announcements;
    if (announcements && typeof announcements === 'object') {
      return Object.values(announcements) as Announcement[];
    }
    return [];
  }, [announcements]);

  // Find first active and not dismissed announcement
  const activeAnn = safeAnnouncements.find(
    (a) => a && a.active && !dismissedIds.includes(a.id)
  );

  if (!activeAnn) return null;

  const targetLink = activeAnn.ctaLink || discordSettings.mainInviteUrl;

  const badgeColors = {
    info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    alert: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[activeAnn.type || 'info'];

  return (
    <div
      id="announcement-bar"
      className="relative bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-cyan-950/90 border-b border-emerald-500/30 px-4 py-2.5 text-xs sm:text-sm text-slate-200 z-50 shadow-lg shadow-emerald-950/20"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold shrink-0 ${badgeColors}`}>
            <Megaphone className="w-3.5 h-3.5" />
            <span>{activeAnn.title}</span>
          </span>
          <p className="truncate text-slate-300 font-normal">
            {activeAnn.text}
          </p>
          {activeAnn.ctaText && targetLink && (
            <a
              id="announcement-cta-btn"
              href={targetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0 transition-colors ml-1"
            >
              <span>{activeAnn.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <button
          id="announcement-dismiss-btn"
          onClick={() => setDismissedIds((prev) => [...prev, activeAnn.id])}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
