'use client'

import { motion } from 'framer-motion'
import ParticleField from '@/components/shared/animations/ParticleField'

export const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen pt-20 pb-20 flex items-center overflow-hidden bg-black">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <ParticleField />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 z-10"
        >
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tighter text-white">
              Not a platform.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                An institution
              </span>
              <br />
              that builds capability.
            </h1>
          </div>

          {/* Subheading */}
          <motion.p
            className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Model. Train. Evaluate. Prove.
            <br />
            <span className="text-gray-400">
              Twinstitute transforms learning into measurable execution.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Primary CTA */}
            <motion.button
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/60 w-full sm:w-auto text-center transition-all"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Enter System
            </motion.button>
          </motion.div>

          {/* Badge */}
          <motion.div
            className="flex items-center gap-2 text-xs text-gray-500 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Join 10,000+ builders worldwide</span>
          </motion.div>
        </motion.div>

        {/* Right: Visual/Animation */}
        <motion.div
          className="relative h-96 lg:h-full hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Animated Grid Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent rounded-2xl overflow-hidden border border-blue-600/20">
            {/* Animated grid lines */}
            <svg
              className="w-full h-full opacity-20"
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(37, 99, 235, 0.5)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />
            </svg>

            {/* Center glow orb */}
            <motion.div
              className="absolute inset-1/3 bg-blue-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-500 rounded-full"
                animate={{
                  y: [0, -60, 0],
                  x: Math.sin(i) * 40,
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
              />
            ))}
          </div>

          {/* Corner accents */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-blue-600/30 rounded-tr-2xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-blue-600/30 rounded-bl-2xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
