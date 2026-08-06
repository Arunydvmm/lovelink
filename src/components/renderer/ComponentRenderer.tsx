import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GenericComponent } from '../../types';
import { triggerConfetti } from '../../lib/confetti';
import { Heart, Gift, Sparkles, Trophy, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface ComponentRendererProps {
  component: GenericComponent;
  storyData: Record<string, any>;
  theme?: any;
}

// Helper to replace template variables like {{recipientName}} with storyData
function resolveText(templateStr: string, data: Record<string, any>): string {
  if (typeof templateStr !== 'string') return '';
  return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return data[key] !== undefined && data[key] !== '' ? String(data[key]) : `[${key}]`;
  });
}

// ─── Sub-Components (each owns its hooks) ────────────────────────────────────

const CountdownComponent: React.FC<{ props: Record<string, any>; storyData: Record<string, any> }> = ({ props, storyData }) => {
  const targetKey = props.targetDateKey || 'birthdayDate';
  const targetDateStr = storyData[targetKey] || props.targetDate || new Date(Date.now() + 86400000 * 3).toISOString();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const target = new Date(targetDateStr).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return (
    <div className="my-6 p-6 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl max-w-lg mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5" aria-hidden="true" />
        <h4 className="text-sm font-bold tracking-wider uppercase">{props.title || 'Countdown to Celebration'}</h4>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center" role="timer" aria-label="Countdown timer">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Mins' },
          { value: timeLeft.seconds, label: 'Secs' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white/20 backdrop-blur-md rounded-2xl p-2 sm:p-3">
            <span className="text-2xl sm:text-3xl font-black block">{value}</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold opacity-80">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const GiftBoxComponent: React.FC<{ props: Record<string, any>; storyData: Record<string, any> }> = ({ props, storyData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const giftMessage = resolveText(
    storyData[props.giftMessageKey] || props.giftMessage || 'You unlocked a lifetime of happiness & unlimited dates!',
    storyData
  );

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      triggerConfetti('hearts');
    }
  };

  return (
    <div className="my-8 text-center max-w-md mx-auto">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          aria-label="Open gift box"
          className="w-full p-8 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-500 text-white shadow-xl flex flex-col items-center justify-center gap-4 cursor-pointer group"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Gift className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold font-display">{props.coverText || 'Tap To Open Gift Box 🎁'}</span>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Touch To Unwrap</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-rose-400 shadow-2xl relative overflow-hidden"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">🎁 Your Special Gift Unlocked!</h4>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-serif italic bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200/50">
            "{giftMessage}"
          </p>
        </motion.div>
      )}
    </div>
  );
};

const ScratchCardComponent: React.FC<{ props: Record<string, any>; storyData: Record<string, any> }> = ({ props, storyData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratchedState] = useState(false);
  const isScratchedRef = useRef(false);
  const message = resolveText(
    storyData[props.hiddenMessageKey] || props.hiddenMessage || 'Secret Love Code: UNLIMITED-HUGS-FOREVER',
    storyData
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(props.coverText || 'Scratch Here With Finger 🪙', canvas.width / 2, canvas.height / 2 + 5);

    let isDrawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      if (!isScratchedRef.current) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] === 0) transparent++;
        }
        if (transparent / (canvas.width * canvas.height) > 0.4) {
          isScratchedRef.current = true;
          setIsScratchedState(true);
          triggerConfetti('stars');
        }
      }
    };

    const start = (e: MouseEvent | TouchEvent) => { isDrawing = true; scratch(e); };
    const stop = () => { isDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: true });
    canvas.addEventListener('touchmove', scratch, { passive: true });
    canvas.addEventListener('touchend', stop);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', scratch);
      canvas.removeEventListener('mouseup', stop);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', scratch);
      canvas.removeEventListener('touchend', stop);
    };
  }, []);

  return (
    <div className="my-6 text-center max-w-sm mx-auto">
      <div
        className="relative w-72 h-36 mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-rose-300 dark:border-slate-700 bg-gradient-to-br from-rose-50 to-pink-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-4"
        role="img"
        aria-label="Scratch card — scratch to reveal message"
      >
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider font-bold text-rose-500 block mb-1">Secret Revealed</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white font-serif">{message}</p>
        </div>
        <canvas
          ref={canvasRef}
          width={288}
          height={144}
          className={`absolute inset-0 cursor-pointer transition-opacity duration-500 ${isScratched ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

const FlipCardComponent: React.FC<{ props: Record<string, any>; storyData: Record<string, any> }> = ({ props, storyData }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="my-4 max-w-sm mx-auto perspective-1000">
      <div
        onClick={() => setFlipped(!flipped)}
        role="button"
        aria-pressed={flipped}
        aria-label={flipped ? 'Flip card back' : 'Flip card to reveal message'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setFlipped(!flipped)}
        className={`relative h-44 rounded-2xl p-6 shadow-md border border-rose-200 dark:border-slate-700 cursor-pointer transition-transform duration-500 transform-style-3d ${
          flipped ? 'rotate-y-180 bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        {!flipped ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Heart className="w-8 h-8 text-rose-500 mb-2 animate-bounce" aria-hidden="true" />
            <h4 className="font-bold text-base">{resolveText(props.frontText || 'Tap to Flip Card', storyData)}</h4>
            <span className="text-xs text-rose-400 mt-2">Touch to reveal &rarr;</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center rotate-y-180">
            <p className="text-sm font-medium leading-relaxed italic">{resolveText(props.backText || 'You are my favorite person!', storyData)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InteractiveQuestionComponent: React.FC<{ props: Record<string, any>; storyData: Record<string, any> }> = ({ props, storyData }) => {
  const [answered, setAnswered] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const questionText = resolveText(props.question || 'Will You Be Mine Forever?', storyData);

  const moveNoButton = useCallback(() => {
    setNoPos({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 150,
    });
  }, []);

  const handleYes = () => {
    setAnswered(true);
    triggerConfetti('hearts');
  };

  return (
    <div className="my-10 p-8 rounded-3xl bg-gradient-to-b from-rose-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 border-2 border-rose-200 dark:border-slate-700 text-center max-w-md mx-auto shadow-xl relative overflow-hidden">
      {!answered ? (
        <div>
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" aria-hidden="true" />
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mb-6">
            {questionText}
          </h3>
          <div className="flex items-center justify-center gap-4 relative min-h-[60px]">
            <button
              onClick={handleYes}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-lg hover:scale-110 active:scale-95 transition-transform"
            >
              {props.yesButtonText || 'YES! ❤️'}
            </button>
            <motion.button
              animate={{ x: noPos.x, y: noPos.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onMouseEnter={moveNoButton}
              onTouchStart={moveNoButton}
              onClick={moveNoButton}
              aria-label="No button — try to click it!"
              className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm"
            >
              {props.noButtonText || 'No 😜'}
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-3xl" aria-hidden="true">
            💍
          </div>
          <h3 className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400 mb-2">
            {props.successMessage || 'YAY! You made my world complete! ❤️'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Forever and always.</p>
        </motion.div>
      )}
    </div>
  );
};

// ─── Main ComponentRenderer (no hooks — only dispatches to sub-components) ───

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, storyData, theme }) => {
  const { type, props } = component;

  // --- 1. HEADING ---
  if (type === 'heading') {
    const title = resolveText(props.title || '', storyData);
    const subtitle = resolveText(props.subtitle || '', storyData);
    const align = props.align || 'center';
    const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

    return (
      <div className={`my-4 ${alignClass}`}>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-rose-600/90 dark:text-rose-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // --- 2. TEXT ---
  if (type === 'text') {
    const content = resolveText(props.content || '', storyData);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="my-3 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap text-center max-w-2xl mx-auto px-2 font-serif italic"
      >
        "{content}"
      </motion.div>
    );
  }

  // --- 3. GALLERY ---
  if (type === 'gallery') {
    const imagesKey = props.imagesKey || 'photoGallery';
    const imagesList: string[] = storyData[imagesKey] || props.images || [];

    if (!imagesList || imagesList.length === 0) return null;

    return (
      <div className="my-6" role="region" aria-label="Photo gallery">
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-none px-2">
          {imagesList.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="snap-center shrink-0 w-64 sm:w-80 h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 relative group bg-slate-100"
            >
              <img
                src={img}
                alt={`Memory ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs font-medium" aria-hidden="true">
                Memory #{i + 1} ❤️
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // --- 4. IMAGE ---
  if (type === 'image') {
    const src = props.src || storyData[props.imageKey] || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80';
    const altText = resolveText(props.alt || props.caption || 'Surprise image', storyData);
    return (
      <div className="my-4 max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl border border-rose-100 dark:border-slate-800">
        <img src={src} alt={altText} className="w-full h-auto object-cover max-h-96" />
        {props.caption && (
          <p className="p-2 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
            {resolveText(props.caption, storyData)}
          </p>
        )}
      </div>
    );
  }

  // --- 5. TIMELINE ---
  if (type === 'timeline') {
    const itemsKey = props.itemsKey || 'timelineEvents';
    const items: Array<{ date: string; title: string; description: string; image?: string }> =
      storyData[itemsKey] || props.items || [];

    if (!items || items.length === 0) return null;

    return (
      <div className="my-8 relative pl-6 border-l-2 border-rose-300 dark:border-rose-700/50 space-y-8 max-w-xl mx-auto" role="list" aria-label="Relationship timeline">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            role="listitem"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15 }}
            className="relative group"
          >
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-rose-500 border-4 border-white dark:border-slate-900 shadow-md group-hover:scale-125 transition-transform" aria-hidden="true" />
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-rose-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <time className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider block mb-1">
                {item.date}
              </time>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="mt-3 rounded-xl w-full h-36 object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // --- 6. COUNTDOWN (extracted sub-component) ---
  if (type === 'countdown') {
    return <CountdownComponent props={props} storyData={storyData} />;
  }

  // --- 7. GIFT BOX (extracted sub-component) ---
  if (type === 'gift_box') {
    return <GiftBoxComponent props={props} storyData={storyData} />;
  }

  // --- 8. SCRATCH CARD (extracted sub-component) ---
  if (type === 'scratch_card') {
    return <ScratchCardComponent props={props} storyData={storyData} />;
  }

  // --- 9. FLIP CARD (extracted sub-component) ---
  if (type === 'flip_card') {
    return <FlipCardComponent props={props} storyData={storyData} />;
  }

  // --- 10. INTERACTIVE QUESTION (extracted sub-component) ---
  if (type === 'interactive_question') {
    return <InteractiveQuestionComponent props={props} storyData={storyData} />;
  }

  // --- 11. CERTIFICATE ---
  if (type === 'certificate') {
    const recipient = resolveText(storyData[props.recipientKey || 'recipientName'] || 'Sophia', storyData);
    const sender = resolveText(storyData[props.senderKey || 'senderName'] || 'Alex', storyData);
    const reason = resolveText(storyData[props.reasonKey || 'certificateReason'] || props.reason || 'For bringing infinite joy into my life.', storyData);

    return (
      <div className="my-8 p-6 sm:p-10 rounded-3xl bg-amber-50/90 dark:bg-slate-800 border-8 border-double border-amber-300 dark:border-amber-600/50 shadow-2xl max-w-xl mx-auto text-center font-serif text-amber-950 dark:text-amber-100 relative" role="article" aria-label="Love certificate">
        <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
          Official Love Award
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold font-display mb-4 text-amber-900 dark:text-amber-200">
          {props.title || 'Certificate of Eternal Love'}
        </h3>
        <p className="text-xs sm:text-sm italic mb-2">This certifies that</p>
        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 underline decoration-amber-300 mb-3 font-sans">
          {recipient}
        </p>
        <p className="text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-6 opacity-90">
          "{reason}"
        </p>
        <div className="flex justify-between items-end border-t border-amber-300 dark:border-amber-700/50 pt-4 text-xs">
          <div>
            <span className="block font-bold text-rose-500 italic font-display text-base">{sender}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Presented By</span>
          </div>
          <div>
            <span className="block font-bold text-amber-800 dark:text-amber-300">{new Date().toLocaleDateString()}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Date Issued</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 12. CONFETTI TRIGGER ---
  if (type === 'confetti') {
    return (
      <div className="my-4 text-center">
        <button
          onClick={() => triggerConfetti('hearts')}
          aria-label="Celebrate with hearts confetti"
          className="px-5 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md hover:bg-rose-600 transition-colors inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" /> Celebrate With Hearts
        </button>
      </div>
    );
  }

  // Default fallback for unknown component types
  return null;
};
