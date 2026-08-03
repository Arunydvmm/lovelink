import confetti from 'canvas-confetti';

export function triggerConfetti(type: 'standard' | 'hearts' | 'stars' = 'standard') {
  if (type === 'hearts') {
    const scalar = 2;
    const heart = confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    });
    confetti({
      shapes: [heart],
      scalar,
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#f472b6']
    });
  } else if (type === 'stars') {
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#e11d48']
    });
  } else {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
