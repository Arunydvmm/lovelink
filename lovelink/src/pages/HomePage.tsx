import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialDb';
import { store } from '../lib/store';
import { Heart, Sparkles, Smartphone, CheckCircle2, Clock, ShieldCheck, ArrowRight, Play, Star, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  onSelectTemplate: (template: Template) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectTemplate }) => {
  const [trendingTemplates, setTrendingTemplates] = useState<Template[]>([]);

  useEffect(() => {
    store.getTemplates().then((tmpls) => {
      setTrendingTemplates(tmpls.slice(0, 3));
    });
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold text-xs uppercase tracking-wider mb-6 border border-rose-200 dark:border-rose-800"
          >
            <Sparkles className="w-4 h-4 text-rose-500 animate-spin-slow" />
            <span>#1 Digital Surprise Builder For Lovers</span>
          </motion.div>

          {/* Large Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]"
          >
            Create Breathtaking <br />
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Digital Surprises
            </span>{' '}
            In 5 Minutes
          </motion.h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn your romantic moments, proposals, birthdays, and anniversaries into interactive digital story pages with custom music, scratch cards, gift boxes, and love timelines.
          </p>

          {/* Hero Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('templates')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white font-bold text-base shadow-xl shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Browse Surprise Templates
            </button>
            <button
              onClick={() => onNavigate('templates')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-base shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-rose-500 fill-rose-500" /> Watch Demo
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-rose-500" /> 100+ Dynamic Templates</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-rose-500" /> Ready in 5 Minutes</span>
            <span className="inline-flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-rose-500" /> 100% Mobile Friendly</span>
          </div>

          {/* Animated Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-sm mx-auto relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-[50px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative rounded-[40px] border-[10px] border-slate-900 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="bg-slate-900 text-white p-4 text-center border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-widest block">Live Preview Sample</span>
                <span className="font-bold text-sm">Sophia & Alex's Proposal</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
                alt="Phone mockup preview"
                className="w-full h-80 object-cover"
              />
              <div className="p-4 bg-slate-950 text-white text-center">
                <span className="text-xs font-serif italic block text-rose-300">"Will You Marry Me?"</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Tap to open interactive story &rarr;</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500 block mb-1">Select Occasion</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">Browse By Category</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {INITIAL_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('templates', cat.id)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group text-center space-y-2"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 fill-rose-500/20" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING TEMPLATES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500 block">Most Popular</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">Trending Templates</h2>
          </div>
          <button
            onClick={() => onNavigate('templates')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            View All &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden">
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
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectTemplate(tmpl)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Create Surprise
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-rose-50/60 dark:bg-slate-900/60 py-16 border-y border-rose-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500 block mb-1">Simple Wizard</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mb-12">
            Ready In 3 Easy Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Choose Template</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick from girlfriend day, proposal, birthday or anniversary themes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Fill Sweet Details</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add partner name, photos, love messages & background music in our step wizard.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Instant Share & QR</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get a unique surprise link & printable QR code instantly!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: 'Can I edit my surprise page after publishing?', a: 'Yes! You can edit photos, messages, and music anytime from your user dashboard without paying again.' },
            { q: 'How long does the surprise link stay active?', a: 'Your published link stays active forever with unlimited visits and views.' },
            { q: 'Is it mobile friendly?', a: '100%! LoveLink is built mobile-first so your partner gets a magical experience on any smartphone.' },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{faq.q}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
