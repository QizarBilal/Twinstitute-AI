'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const MESSAGES = [
  {
    title: "Intelligent Formation",
    description: "AI-powered capability insights that adapt to your unique learning trajectory"
  },
  {
    title: "Adaptive Systems",
    description: "Dynamic formation pathways that evolve with your progress and performance"
  },
  {
    title: "Capability Modeling",
    description: "Predictive analytics that build performance readiness for future challenges"
  }
]

export default function RotatingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-32 flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0 flex flex-col justify-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-3"
            initial={{ x: -10 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-sm font-semibold gradient-text uppercase tracking-widest">
              {MESSAGES[currentIndex].title}
            </span>
          </motion.div>
          
          <motion.p
            className="text-2xl font-light text-gray-200 leading-relaxed max-w-md"
            initial={{ x: -10 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {MESSAGES[currentIndex].description}
          </motion.p>
        </motion.div>
      </AnimatePresence>
      
      {/* Progress indicators */}
      <div className="absolute bottom-0 left-0 flex gap-2">
        {MESSAGES.map((_, index) => (
          <motion.div
            key={index}
            className="h-0.5 bg-primary/30 rounded-full"
            style={{ width: 40 }}
            animate={{
              backgroundColor: index === currentIndex 
                ? 'rgba(0, 217, 255, 1)' 
                : 'rgba(0, 217, 255, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            {index === currentIndex && (
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
