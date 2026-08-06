import React, { useEffect, useState } from 'react';
import { LegalPage as LegalPageType } from '../types';
import { store } from '../lib/store';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface LegalPageProps {
  slug: string;
  onNavigateHome: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ slug, onNavigateHome }) => {
  const [page, setPage] = useState<LegalPageType | null>(null);

  useEffect(() => {
    store.getLegalPage(slug).then((p) => {
      if (p) setPage(p);
      else setPage({ slug, title: slug.toUpperCase(), content: 'Policy content coming soon.', updatedAt: new Date().toISOString() });
    });
  }, [slug]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={onNavigateHome}
        className="mb-8 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500 block mb-1">
            LoveLink Legal CMS
          </span>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
            {page?.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Last Updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'Recently'}
          </p>
        </div>

        <div className="prose dark:prose-invert text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {page?.content}
        </div>
      </div>
    </div>
  );
};
