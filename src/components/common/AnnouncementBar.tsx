import React, { useEffect, useState } from 'react';
import { store } from '../../lib/store';
import { Announcement } from '../../types';
import { Sparkles, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    store.getAnnouncements().then((anns) => {
      const active = anns.find((a) => a.isActive);
      if (active) setAnnouncement(active);
    });
  }, []);

  if (!announcement || !announcement.isActive || closed) return null;

  return (
    <div className={`relative px-4 py-2 text-white text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm z-50 ${announcement.bgColor || 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full pr-6">
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-yellow-200" />
        {announcement.badge && (
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            {announcement.badge}
          </span>
        )}
        <span>{announcement.text}</span>
        {announcement.linkText && announcement.linkUrl && (
          <a
            href={announcement.linkUrl}
            className="underline font-bold hover:text-yellow-100 transition-colors ml-1"
          >
            {announcement.linkText} &rarr;
          </a>
        )}
      </div>
      <button
        onClick={() => setClosed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
