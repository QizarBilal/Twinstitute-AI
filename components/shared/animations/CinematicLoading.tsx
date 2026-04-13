'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CinematicLoading: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const phases = [
      { duration: 1500, text: 'Initializing cognitive flow...' },
      { duration: 1500, text: 'Aligning intelligence vectors...' },
      { duration: 1500, text: 'Organizing neural pathways...' },
      { duration: 1500, text: 'Stabilizing system architecture...' },
    ];

    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 100 / (totalDuration / 50), 100);

        // Calculate current phase
        let elapsed = 0;
        for (let i = 0; i < phases.length; i++) {
          elapsed += phases[i].duration;
          if ((newProgress / 100) * totalDuration < elapsed) {
            setCurrentPhase(i);
            break;
          }
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onComplete?.();
            }, 600); // Match fade duration
          }, 300);
        }

        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const phases = [
    'Initializing cognitive flow...',
    'Aligning intelligence vectors...',
    'Organizing neural pathways...',
    'Stabilizing system architecture...',
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: progress === 100 ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Brain Background Image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 1200 800%27%3E%3Ccircle cx=%27600%27 cy=%27400%27 r=%27200%27 fill=%27none%27 stroke=%27%23888%27 stroke-width=%271%27/%3E%3C/svg%3E")',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md">
        {/* Progress Bar */}
        <div className="w-full">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-2 text-center">{Math.round(progress)}%</p>
        </div>

        {/* Phase Text */}
        <div className="text-center h-6">
          {phases.map((phase, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentPhase === idx ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-gray-400"
            >
              {phase}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CinematicLoading;
