'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const FinalCTASection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_CONFIG.duration.slow,
        ease: MOTION_CONFIG.easing.entrance,
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

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle 600px at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 100%)`,
        }}
      />

      <motion.div
        className="relative max-w-3xl text-center z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Main heading */}
        <motion.h2
          variants={itemVariants}
          style={{
            ...TYPOGRAPHY.heading.h1,
            color: COLORS.text.primary,
          }}
          className="mb-8"
        >
          Enter the system.
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          style={{
            ...TYPOGRAPHY.body.large,
            color: COLORS.text.secondary,
          }}
          className="mb-12 max-w-2xl mx-auto"
        >
          Stop learning. Start building. Get validated.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth/signup">
            <motion.button
              className="px-8 py-4 text-base font-medium rounded-sm transition-all"
              style={{
                backgroundColor: COLORS.accent.primary,
                color: '#ffffff',
              }}
              whileHover={{
                backgroundColor: COLORS.accent.muted,
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>
          </Link>
          <Link href="/auth/login">
            <motion.button
              className="px-8 py-4 text-base font-medium rounded-sm transition-all border"
              style={{
                borderColor: COLORS.borders.light,
                color: COLORS.text.primary,
              }}
              whileHover={{
                borderColor: COLORS.text.primary,
                backgroundColor: COLORS.background.secondary,
              }}
            >
              Login
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FinalCTASection;
