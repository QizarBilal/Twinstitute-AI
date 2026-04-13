'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedGrid() {
  const [lines, setLines] = useState<Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>>([])

  useEffect(() => {
    const newLines = []
    for (let i = 0; i < 12; i++) {
      newLines.push({
        id: i,
        x1: Math.random() * 100,
        y1: Math.random() * 100,
        x2: Math.random() * 100,
        y2: Math.random() * 100,
      })
    }
    setLines(newLines)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" style={{ willChange: 'opacity' }}>
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Vertical grid lines */}
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={`${(i + 1) * 12.5}%`}
            y1="0%"
            x2={`${(i + 1) * 12.5}%`}
            y2="100%"
            stroke="url(#gridGradient)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Horizontal grid lines */}
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0%"
            y1={`${(i + 1) * 16.66}%`}
            x2="100%"
            y2={`${(i + 1) * 16.66}%`}
            stroke="url(#gridGradient)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Neural connection lines */}
        {lines.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="#00D9FF"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: line.id * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  )
}
