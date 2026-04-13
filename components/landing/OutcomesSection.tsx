'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const OutcomesSection: React.FC = () => {
  const outcomes = [
    'Measurable capability growth',
    'Real execution experience',
    'Verified proof artifacts',
    'Structured progression',
    'Strategic decision guidance',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 12 },
    visible: {
      opacity: 1,
      x: 0,
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
        className="relative max-w-4xl z-10 w-full"
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
          WHAT YOU GET
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
          Tangible outcomes, not promises.
        </motion.h2>

        {/* Outcomes list */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {outcomes.map((outcome, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-sm flex-shrink-0"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.borders.light,
                  border: `1px solid ${COLORS.borders.light}`,
                }}
              >
                <motion.span
                  style={{ color: COLORS.accent.primary }}
                  className="text-lg font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: MOTION_CONFIG.duration.normal,
                    delay: idx * MOTION_CONFIG.delays.short,
                  }}
                >
                  ✓
                </motion.span>
              </div>
              <p
                style={{
                  ...TYPOGRAPHY.body.large,
                  color: COLORS.text.primary,
                }}
              >
                {outcome}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default OutcomesSection;
