'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    { title: 'Model', description: 'Digital twin mapped to real-world capability requirements.' },
    { title: 'Train', description: 'Structured execution labs aligned to skill genome.' },
    { title: 'Evaluate', description: 'Continuous assessment against measurable standards.' },
    { title: 'Simulate', description: 'Forecast outcomes based on current trajectory.' },
    { title: 'Strategize', description: 'Intelligent recommendations for next-level growth.' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_CONFIG.duration.normal,
      },
    },
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-6 py-24"
      style={{ backgroundColor: COLORS.background.primary }}
    >
      {/* Subtle divider line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5"
        style={{ backgroundColor: COLORS.borders.light }}
      />

      <motion.div
        className="relative max-w-5xl z-10 w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Section label */}
        <motion.p
          style={{
            ...TYPOGRAPHY.body.xsmall,
            color: COLORS.accent.primary,
          }}
          className="mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: MOTION_CONFIG.duration.normal }}
          viewport={{ once: true, margin: '-100px' }}
        >
          HOW IT WORKS
        </motion.p>

        {/* Main heading */}
        <motion.h2
          style={{
            ...TYPOGRAPHY.heading.h2,
            color: COLORS.text.primary,
          }}
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION_CONFIG.duration.slow,
            delay: MOTION_CONFIG.delays.short,
          }}
          viewport={{ once: true, margin: '-100px' }}
        >
          The operating system for capability.
        </motion.h2>

        {/* Flow description */}
        <motion.div
          className="mb-16 p-6 rounded border"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.borders.light,
          }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION_CONFIG.duration.normal,
            delay: MOTION_CONFIG.delays.medium,
          }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p
            style={{
              ...TYPOGRAPHY.body.base,
              color: COLORS.text.secondary,
            }}
          >
            A continuous cycle designed to transform theory into measurable, executable capability.
          </p>
        </motion.div>

        {/* Carousel Flow with Premium Flowing Glow */}
        <motion.div
          className="mb-16 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="relative w-full">
            {/* Background subtle line */}
            <div
              className="absolute top-16 left-0 right-0 h-0.5"
              style={{
                background: `linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(59, 130, 246, 0) 100%)`,
              }}
            />

            {/* Flowing Energy Line - Animated */}
            <motion.div
              className="absolute top-6 left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent, #00D9FF, transparent)",
                backgroundSize: "200% 100%"
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 0%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Flow circles */}
            <div className="flex justify-between items-start pt-8">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: MOTION_CONFIG.duration.normal,
                    delay: idx * 0.1,
                  }}
                  viewport={{ once: true, margin: '-100px' }}
                >
                  {/* Circle with Premium Glow */}
                  <motion.div
                    animate={{
                      scale: activeIndex === idx ? 1.15 : 1,
                      boxShadow:
                        activeIndex === idx
                          ? "0 0 25px rgba(0,217,255,0.9), 0 0 60px rgba(0,217,255,0.4)"
                          : "0 0 0px rgba(0,0,0,0)"
                    }}
                    transition={{ duration: 0.5 }}
                    className="relative w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center bg-black mb-4 transition-colors"
                  >
                    {/* Dramatic Pulse Ring */}
                    {activeIndex === idx && (
                      <motion.div
                        className="absolute inset-0 rounded-full border border-cyan-400"
                        animate={{
                          scale: [1, 1.6],
                          opacity: [0.6, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      />
                    )}

                    <span
                      style={{
                        ...TYPOGRAPHY.body.small,
                        color: activeIndex === idx ? COLORS.accent.primary : COLORS.text.secondary,
                        fontWeight: activeIndex === idx ? 700 : 500,
                      }}
                      className="relative z-10 text-center transition-colors duration-500"
                    >
                      {step.title}
                    </span>
                  </motion.div>

                  {/* Description with smooth color transition */}
                  <motion.p
                    style={{
                      ...TYPOGRAPHY.body.small,
                    }}
                    className="text-center max-w-xs text-xs transition-colors duration-500"
                    animate={{
                      color: activeIndex === idx ? COLORS.text.primary : COLORS.text.secondary,
                    }}
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              ))}
            </div>

            {/* Cycle indicator */}
            <motion.div
              className="mt-12 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              {steps.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      activeIndex === idx ? COLORS.accent.primary : COLORS.borders.light,
                  }}
                  animate={{
                    backgroundColor:
                      activeIndex === idx ? COLORS.accent.primary : COLORS.borders.light,
                    scale: activeIndex === idx ? 1.2 : 1,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorksSection;
