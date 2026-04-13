'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const SystemArchitectureSection: React.FC = () => {
  const modules = [
    {
      name: 'Capability Digital Twin',
      description: 'A living model of your capability, updated continuously.',
    },
    {
      name: 'Skill Genome Mapping',
      description: 'Precise taxonomy of competencies with depth measurement.',
    },
    {
      name: 'Capability Labs',
      description: 'Structured execution environments for real-world skill building.',
    },
    {
      name: 'Outcome Simulation',
      description: 'Forecast your trajectory based on current state and effort.',
    },
    {
      name: 'Strategy Intelligence',
      description: 'Personalized guidance for optimal growth path selection.',
    },
  ];

  const moduleVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_CONFIG.duration.normal,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
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
          SYSTEM ARCHITECTURE
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
          Core modules built for precision.
        </motion.h2>

        {/* Modules list */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {modules.map((module, idx) => (
            <motion.div
              key={idx}
              variants={moduleVariants}
              className="border-l-4 pl-6 py-4 transition-colors"
              style={{
                borderColor: idx === 0 ? COLORS.accent.primary : COLORS.borders.light,
              }}
              whileHover={{
                borderColor: COLORS.accent.primary,
              }}
            >
              <h3
                style={{
                  ...TYPOGRAPHY.heading.h3,
                  color: COLORS.text.primary,
                }}
                className="text-lg mb-1"
              >
                {module.name}
              </h3>
              <p
                style={{
                  ...TYPOGRAPHY.body.base,
                  color: COLORS.text.secondary,
                }}
              >
                {module.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SystemArchitectureSection;
