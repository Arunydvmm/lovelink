import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  url?: string;
  title?: string;
  autoplay?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  url,
  title = 'Romantic Melody',
  autoplay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && url) {
      if (autoplay) {
        // Handle browser autoplay policy
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Autoplay blocked - wait for first click
              setIsPlaying(false);
              const enableOnInteract = () => {
                audioRef.current?.play().then(() => setIsPlaying(true));
                window.removeEventListener('click', enableOnInteract);
                window.removeEventListener('touchstart', enableOnInteract);
              };
              window.addEventListener('click', enableOnInteract, { once: true });
              window.addEventListener('touchstart', enableOnInteract, { once: true });
            });
        }
      }
    }
  }, [url, autoplay]);

  if (!url) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
      <audio ref={audioRef} src={url} loop />
      <div className="bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-full shadow-2xl border border-rose-500/30 flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>
        
        <div className="hidden sm:block max-w-[120px] truncate text-xs">
          <span className="font-semibold block truncate text-rose-300">{title}</span>
          <span className="text-[10px] text-slate-400 block">{isPlaying ? 'Playing...' : 'Paused'}</span>
        </div>

        <button
          onClick={toggleMute}
          className="p-1.5 text-slate-300 hover:text-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
