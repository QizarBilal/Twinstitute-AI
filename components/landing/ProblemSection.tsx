'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const ProblemSection: React.FC = () => {
  const items = [
    'No clarity on actual capability',
    'No structured growth pathway',
    'No execution depth',
    'No measurable proof',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
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
      id="about"
      style={{ backgroundColor: COLORS.background.primary }}
    >
      {/* Subtle divider line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5"
        style={{ backgroundColor: COLORS.borders.light }}
      />

      <motion.div
        className="relative max-w-4xl z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_CONFIG.duration.slow }}
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Main statement */}
        <motion.h2
          style={{
            ...TYPOGRAPHY.heading.h2,
            color: COLORS.text.primary,
          }}
          className="mb-8 max-w-3xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION_CONFIG.duration.slow }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Students don't lack knowledge.
          {'\n'}
          <span style={{ color: COLORS.accent.primary }}>They lack measurable capability.</span>
        </motion.h2>

        {/* Expansion text */}
        <motion.p
          style={{
            ...TYPOGRAPHY.body.large,
            color: COLORS.text.secondary,
          }}
          className="mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION_CONFIG.duration.slow,
            delay: MOTION_CONFIG.delays.short,
          }}
          viewport={{ once: true, margin: '-100px' }}
        >
          The reality: traditional education builds theory without proof. Students graduate without knowing what they can actually do.
        </motion.p>

        {/* Problem list */}
        <motion.div
          className="space-y-4 mt-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {items.map((item) => (
            <motion.div
              key={item}
              className="flex items-start gap-4"
              variants={itemVariants}
            >
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: COLORS.accent.primary }}
              />
              <p
                style={{
                  ...TYPOGRAPHY.body.base,
                  color: COLORS.text.secondary,
                }}
              >
                {item}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ProblemSection;
