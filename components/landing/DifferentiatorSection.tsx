'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const DifferentiatorSection: React.FC = () => {
  const comparisonItems = [
    {
      traditional: 'Grades & Certificates',
      twinstitute: 'Verified Capability',
      icon: '📄',
      iconTwin: '✓',
    },
    {
      traditional: 'Years of Study',
      twinstitute: 'Measurable Skill Proof',
      icon: '⏱',
      iconTwin: '📊',
    },
    {
      traditional: 'Disconnected Theory',
      twinstitute: 'Real-World Execution',
      icon: '📚',
      iconTwin: '🎯',
    },
    {
      traditional: 'Passive Learning',
      twinstitute: 'Active Capability Building',
      icon: '👁',
      iconTwin: '⚡',
    },
    {
      traditional: 'No Career Clarity',
      twinstitute: 'Clear Execution Roadmap',
      icon: '❓',
      iconTwin: '🗺',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
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
        className="relative max-w-6xl z-10 w-full"
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
          WHY THIS IS DIFFERENT
        </motion.p>

        {/* Main heading */}
        <motion.h2
          style={{
            ...TYPOGRAPHY.heading.h2,
            color: COLORS.text.primary,
          }}
          className="mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION_CONFIG.duration.slow,
            delay: MOTION_CONFIG.delays.short,
          }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Side by side comparison.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          style={{
            ...TYPOGRAPHY.body.base,
            color: COLORS.text.secondary,
          }}
          className="mb-16 max-w-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{
            duration: MOTION_CONFIG.duration.normal,
            delay: MOTION_CONFIG.delays.medium,
          }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Traditional education focuses on credentials. We focus on capability.
        </motion.p>

        {/* Comparison cards - Battle UI */}
        <div className="space-y-6">
          {comparisonItems.map((item, idx) => (
            <motion.div
              key={idx}
              className="grid grid-cols-2 gap-6 items-center relative group"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              {/* Vertical Glow Divider */}
              <div className="absolute left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent z-0" />

              {/* VS Indicator */}
              <div className="absolute left-1/2 -translate-x-1/2 text-gray-600 text-xs font-bold bg-black px-2 z-10 rounded">
                VS
              </div>

              {/* LEFT CARD: Traditional */}
              <motion.div
                initial={{ x: -50 }}
                whileInView={{ x: 0 }}
                whileHover={{ opacity: 0.5 }}
                className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 text-gray-400 transition-opacity flex items-center justify-between"
                style={{ opacity: 0.7 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-60">{item.icon}</span>
                  <span className="font-semibold">{item.traditional}</span>
                </div>
              </motion.div>

              {/* RIGHT CARD: Twinstitute */}
              <motion.div
                initial={{ x: 50 }}
                whileInView={{ x: 0 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(0,217,255,0.4)"
                }}
                className="p-5 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-white flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{item.iconTwin}</span>
                  <span className="font-bold text-lg">{item.twinstitute}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom highlight */}
        <motion.div
          className="mt-16 p-8 rounded-lg border"
          style={{
            borderColor: COLORS.accent.primary,
            backgroundColor: `${COLORS.accent.primary}08`,
          }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION_CONFIG.duration.normal,
            delay: MOTION_CONFIG.delays.long,
          }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p
            style={{
              ...TYPOGRAPHY.body.large,
              color: COLORS.text.primary,
            }}
            className="text-center"
          >
            <span style={{ color: COLORS.accent.primary, fontWeight: 700 }}>
              Real skill validation
            </span>
            {' '}replaces credentials. Measurable progress replaces time served.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DifferentiatorSection;
