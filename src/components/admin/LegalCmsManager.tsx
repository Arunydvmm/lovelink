import React, { useState, useEffect } from 'react';
import { LegalPage } from '../../types';
import { store } from '../../lib/store';
import { Save, FileText, CheckCircle2 } from 'lucide-react';

export const LegalCmsManager: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState('terms');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    store.getLegalPage(selectedSlug).then((p) => {
      if (p) {
        setTitle(p.title);
        setContent(p.content);
      } else {
        setTitle(selectedSlug.toUpperCase());
        setContent('');
      }
    });
  }, [selectedSlug]);

  const handleSave = async () => {
    await store.saveLegalPage({
      slug: selectedSlug,
      title,
      content,
      updatedAt: new Date().toISOString(),
    });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Legal CMS Editor</h3>
        <p className="text-xs text-slate-500">Edit Terms & Conditions, Privacy Policy & Refund Policy dynamically</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['terms', 'privacy', 'refund', 'cookie', 'faq'].map((slug) => (
          <button
            key={slug}
            onClick={() => setSelectedSlug(slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              selectedSlug === slug
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {slug} Policy
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Page Content (Markdown / Plain Text)</label>
          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-xl border text-xs font-mono leading-relaxed bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
        >
          {savedStatus ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {savedStatus ? 'Saved Successfully!' : 'Save Policy Content'}
        </button>
      </div>
    </div>
  );
};
