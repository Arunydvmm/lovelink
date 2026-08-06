import React from 'react';
import { motion } from 'motion/react';

interface FloatingHeartsProps {
  count?: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 12 }) => {
  const hearts = Array.from({ length: count });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((_, i) => {
        const size = Math.random() * 20 + 12;
        const left = Math.random() * 100;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute text-rose-500/20 dark:text-rose-400/20"
            style={{
              left: `${left}%`,
              bottom: '-20px',
              fontSize: `${size}px`,
            }}
            animate={{
              y: ['0vh', '-110vh'],
              x: [0, Math.sin(i) * 40, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'linear',
            }}
          >
            ❤️
          </motion.div>
        );
      })}
    </div>
  );
};
