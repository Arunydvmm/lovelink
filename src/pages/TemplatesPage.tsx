import React, { useState, useEffect } from 'react';
import { Template, CategoryId } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialDb';
import { api } from '../lib/api';
import { Sparkles, Search, Filter, Tag, Heart } from 'lucide-react';

interface TemplatesPageProps {
  initialCategory?: string;
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  initialCategory,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    api.getTemplates().then(setTemplates).catch((error) => {
      console.error('Failed to load templates:', error);
    });
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && t.price === 0) ||
      (priceFilter === 'premium' && t.price > 0);
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
          Digital Surprise Templates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Choose a romantic template below. Customize names, photos, messages & music in minutes.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates (e.g. Girlfriend Day, Proposal, Birthday)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${
                priceFilter === 'all' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${
                priceFilter === 'free' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              FREE
            </button>
            <button
              onClick={() => setPriceFilter('premium')}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${
                priceFilter === 'premium' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 pt-2 scrollbar-none border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Categories
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  src={tmpl.coverImage}
                  alt={tmpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {tmpl.category}
                </span>
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md">
                  {tmpl.price === 0 ? 'FREE' : `₹${tmpl.price}`}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{tmpl.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tmpl.description}</p>
                <span className="text-[10px] font-bold text-rose-500 block mt-3">
                  Est. Creation Time: {tmpl.estimatedTime}
                </span>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectTemplate(tmpl)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Create Surprise Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
