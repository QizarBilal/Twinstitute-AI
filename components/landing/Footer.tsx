'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Capability Labs', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    resources: [
      { label: 'Documentation', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Support', href: '#' },
    ],
  };

  const linkVariants = {
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
    <footer
      className="relative border-t"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.borders.light,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/">
              <h3
                style={{
                  ...TYPOGRAPHY.heading.h3,
                  color: COLORS.text.primary,
                }}
                className="text-lg mb-4"
              >
                Twinstitute AI
              </h3>
            </Link>
            <p
              style={{
                ...TYPOGRAPHY.body.small,
                color: COLORS.text.secondary,
              }}
            >
              Building capability at institutional scale.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4
              style={{
                ...TYPOGRAPHY.body.xsmall,
                color: COLORS.accent.primary,
              }}
              className="mb-4"
            >
              PRODUCT
            </h4>
            <div className="space-y-2">
              {links.product.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  style={{
                    ...TYPOGRAPHY.body.small,
                    color: COLORS.text.secondary,
                  }}
                  className="block transition-colors hover:text-white"
                  whileHover={{ color: COLORS.text.primary }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
          >
            <h4
              style={{
                ...TYPOGRAPHY.body.xsmall,
                color: COLORS.accent.primary,
              }}
              className="mb-4"
            >
              COMPANY
            </h4>
            <div className="space-y-2">
              {links.company.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  style={{
                    ...TYPOGRAPHY.body.small,
                    color: COLORS.text.secondary,
                  }}
                  className="block transition-colors hover:text-white"
                  whileHover={{ color: COLORS.text.primary }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4
              style={{
                ...TYPOGRAPHY.body.xsmall,
                color: COLORS.accent.primary,
              }}
              className="mb-4"
            >
              RESOURCES
            </h4>
            <div className="space-y-2">
              {links.resources.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  style={{
                    ...TYPOGRAPHY.body.small,
                    color: COLORS.text.secondary,
                  }}
                  className="block transition-colors hover:text-white"
                  whileHover={{ color: COLORS.text.primary }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div
          className="w-full h-0.5 mb-8"
          style={{ backgroundColor: COLORS.borders.lighter }}
        />

        {/* Bottom */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p
            style={{
              ...TYPOGRAPHY.body.small,
              color: COLORS.text.tertiary,
            }}
          >
            © {currentYear} Twinstitute. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              style={{
                ...TYPOGRAPHY.body.small,
                color: COLORS.text.tertiary,
              }}
              className="transition-colors hover:text-white"
            >
              Privacy
            </a>
            <a
              href="#"
              style={{
                ...TYPOGRAPHY.body.small,
                color: COLORS.text.tertiary,
              }}
              className="transition-colors hover:text-white"
            >
              Terms
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
