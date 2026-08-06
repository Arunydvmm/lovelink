import React from 'react';
import { Template, Story } from '../../types';
import { ComponentRenderer } from './ComponentRenderer';
import { MusicPlayer } from './MusicPlayer';
import { FloatingHearts } from '../common/FloatingHearts';

interface DynamicRendererProps {
  template: Template;
  storyData: Record<string, any>;
  customMusicUrl?: string;
  customMusicTitle?: string;
  isWatermarkVisible?: boolean;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  template,
  storyData,
  customMusicUrl,
  customMusicTitle,
  isWatermarkVisible = false,
}) => {
  const theme = template.theme || {
    primaryColor: '#e11d48',
    secondaryColor: '#f43f5e',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    fontFamily: 'Playfair Display',
    particleType: 'hearts',
    heartFloating: true,
  };

  const musicUrl = customMusicUrl || template.music?.url;
  const musicTitle = customMusicTitle || template.music?.title || 'Romantic Theme';

  // Section background styles map
  const getSectionBgStyle = (bgStyle?: string) => {
    switch (bgStyle) {
      case 'dark_romantic':
        return 'bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/40 text-slate-100';
      case 'sunset':
        return 'bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 text-white';
      case 'glass':
        return 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-rose-100 dark:border-slate-800 shadow-lg text-slate-900 dark:text-white';
      case 'gradient':
        return 'bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-slate-900 dark:via-rose-950/30 dark:to-slate-900 text-slate-900 dark:text-white';
      case 'hearts':
        return 'bg-rose-50/90 dark:bg-slate-900/90 border-y border-rose-200 dark:border-slate-800 text-slate-900 dark:text-white';
      default:
        return 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white';
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden font-sans transition-colors"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Floating Ambient Hearts Effect */}
      {theme.heartFloating !== false && <FloatingHearts count={16} />}

      {/* Main Dynamic Sections Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12 relative z-10">
        {template.sections && template.sections.length > 0 ? (
          template.sections.map((section, idx) => (
            <section
              key={section.id || idx}
              className={`p-6 sm:p-10 rounded-3xl transition-all ${getSectionBgStyle(section.backgroundStyle)}`}
            >
              {section.title && (
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider opacity-90">
                    {section.title}
                  </h3>
                  {section.subtitle && (
                    <p className="text-xs sm:text-sm opacity-75 mt-1 font-serif italic">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Loop generic components dynamically */}
              <div className="space-y-6">
                {section.components && section.components.length > 0 ? (
                  section.components.map((comp) => (
                    <ComponentRenderer
                      key={comp.id}
                      component={comp}
                      storyData={storyData}
                      theme={theme}
                    />
                  ))
                ) : null}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No sections defined in template JSON.</p>
          </div>
        )}
      </main>

      {/* Music Player */}
      <MusicPlayer url={musicUrl} title={musicTitle} autoplay={template.music?.autoplay !== false} />

      {/* Watermark overlay if previewing before payment */}
      {isWatermarkVisible && (
        <div className="fixed bottom-3 left-4 z-40 bg-black/70 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-semibold border border-white/20 shadow-lg flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>LoveLink Preview Mode</span>
        </div>
      )}
    </div>
  );
};
