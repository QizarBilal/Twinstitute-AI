'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center space-x-2 px-5 py-3 rounded-2xl rounded-tl-sm bg-gradient-to-br from-dark-300/60 to-dark-400/40 border border-primary/10 backdrop-blur-xl w-fit"
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -10 }}
      transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform, opacity' }}
        />
      ))}
    </motion.div>
  )
}

export default memo(TypingIndicator)
