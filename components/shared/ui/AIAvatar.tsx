'use client'

import { motion } from 'framer-motion'

export default function AIAvatar() {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Main avatar container */}
      <div className="relative w-32 h-32" style={{ contain: 'layout style paint' }}>
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30"
          style={{ 
            filter: 'blur(15px)',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Avatar core */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-dark-200 to-dark-400 border-2 border-primary/40 overflow-hidden" style={{ willChange: 'transform' }}>
          {/* Inner glow rings */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ willChange: 'transform, opacity' }}
          />
          
          <motion.div
            className="absolute inset-8 rounded-full border-2 border-primary/50"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
          
          {/* AI Core Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <motion.path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.3, ease: 'easeInOut' }}
              />
              <motion.path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.6, ease: 'easeInOut' }}
              />
            </svg>
          </div>
          
          {/* Scanning line effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            animate={{
              y: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        
        {/* Pulse indicator (eye light) */}
        <motion.div
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-glow"
          animate={{
            opacity: [1, 0.3, 1],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      
      {/* Orbiting particles */}
      {[0, 120, 240].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-primary/60"
          style={{
            transformOrigin: '0 0',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.3,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full bg-primary/60"
            style={{
              transform: `translate(-0.75px, -0.75px) translateX(60px) rotate(${angle}deg)`,
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
