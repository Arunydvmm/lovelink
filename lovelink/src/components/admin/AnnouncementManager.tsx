import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { store } from '../../lib/store';
import { Megaphone, Save, CheckCircle2 } from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [text, setText] = useState('💖 Valentine & Girlfriend Day Sale! Get 20% OFF with code: LOVE20');
  const [badge, setBadge] = useState('SPECIAL OFFER');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    store.getAnnouncements().then((anns) => {
      setAnnouncements(anns);
      if (anns.length > 0) {
        setText(anns[0].text);
        setBadge(anns[0].badge || 'OFFER');
        setIsActive(anns[0].isActive);
      }
    });
  }, []);

  const handleSave = async () => {
    const ann: Announcement = {
      id: announcements[0]?.id || 'ann_1',
      text,
      badge,
      isActive,
      linkText: 'Explore Templates',
      linkUrl: '#templates',
      bgColor: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500',
    };
    await store.saveAnnouncement(ann);
    alert('Announcement banner updated!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Announcement Bar Manager</h3>
        <p className="text-xs text-slate-500">Control promotional sale banners shown at top of site</p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Banner Announcement Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold uppercase text-slate-400 mb-1">Badge Tag</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded"
            />
            <label htmlFor="activeCheckbox" className="font-bold text-slate-700 dark:text-slate-300">
              Enable Banner Bar
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Banner Config
        </button>
      </div>
    </div>
  );
};
