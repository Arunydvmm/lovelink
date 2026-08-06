import React, { useEffect, useState } from 'react';
import { Story } from '../types';
import { store } from '../lib/store';
import { DynamicRenderer } from '../components/renderer/DynamicRenderer';
import { ArrowLeft, Share2, Sparkles, Heart } from 'lucide-react';

interface StoryPageProps {
  storyIdOrSlug: string;
  onNavigateHome: () => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ storyIdOrSlug, onNavigateHome }) => {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.getStoryById(storyIdOrSlug).then((s) => {
      if (s) {
        setStory(s);
        store.incrementStoryViews(s.id);
      }
      setLoading(false);
    });
  }, [storyIdOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-rose-300 font-bold uppercase tracking-widest">Opening LoveLink Surprise...</p>
        </div>
      </div>
    );
  }

  if (!story || !story.templateSnapshot || !story.isPublished) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl">
            💔
          </div>
          <h2 className="text-2xl font-bold font-display">Surprise Link Not Found</h2>
          <p className="text-xs text-slate-400">
            {!story 
              ? 'This surprise page link may have expired or been moved by the creator.'
              : !story.templateSnapshot
              ? 'The template for this surprise is no longer available.'
              : 'This surprise page has not been published yet.'}
          </p>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg"
          >
            Create Your Own Surprise
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Dynamic Pure Renderer Engine */}
      <DynamicRenderer
        template={story.templateSnapshot}
        storyData={story.storyData}
        customMusicUrl={story.customMusicUrl}
        customMusicTitle={story.customMusicTitle}
        isWatermarkVisible={!story.isPaid}
      />

      {/* Floating Create Link for recipients */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 rounded-full bg-slate-900/80 text-white backdrop-blur-md text-xs font-bold shadow-xl border border-rose-500/30 hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Made with LoveLink
        </button>
      </div>
    </div>
  );
};
