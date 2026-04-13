'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const SystemExplainedSection: React.FC = () => {
  const blocks = [
    {
      title: 'A capability engineering system',
      description: 'Not a course platform. A system engineered to model, measure, and evolve human capability.',
    },
    {
      title: 'A digital institution',
      description: 'Structured authority with institutional rigor. Replaces outdated educational models.',
    },
    {
      title: 'A continuous training loop',
      description: 'Real execution → reflection → growth → elevated capability. Repeat indefinitely.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 12 },
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
        className="relative max-w-4xl z-10 w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: MOTION_CONFIG.duration.slow }}
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
          WHAT THIS SYSTEM IS
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
          Built on three foundational pillars.
        </motion.h2>

        {/* Block grid */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {blocks.map((block, idx) => (
            <motion.div key={idx} variants={blockVariants} className="border-l-2" style={{ borderColor: COLORS.borders.light }}>
              <div className="pl-6">
                <h3
                  style={{
                    ...TYPOGRAPHY.heading.h3,
                    color: COLORS.text.primary,
                  }}
                  className="mb-3"
                >
                  {block.title}
                </h3>
                <p
                  style={{
                    ...TYPOGRAPHY.body.base,
                    color: COLORS.text.secondary,
                  }}
                >
                  {block.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SystemExplainedSection;
