'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const [isHovering, setIsHovering] = useState(false)

  const springConfig = { damping: 35, stiffness: 500 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      const target = e.target as HTMLElement
      if (target && typeof target.closest === 'function') {
        const isInteractive = target.tagName === 'BUTTON' || 
                            target.tagName === 'A' || 
                            target.closest('button') !== null || 
                            target.closest('a') !== null ||
                            target.closest('input') !== null ||
                            target.closest('textarea') !== null
        setIsHovering(isInteractive)
      }
    }

    window.addEventListener('mousemove', moveCursor)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
    }
  }, [cursorX, cursorY])

  return (
    <>
      {/* Main cursor - simple elegant dot */}
      <motion.div
        className="fixed rounded-full pointer-events-none z-[9999]"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          width: isHovering ? 12 : 8,
          height: isHovering ? 12 : 8,
          backgroundColor: isHovering ? '#00D9FF' : '#ffffff',
          opacity: isHovering ? 1 : 0.85,
        }}
        transition={{
          type: 'spring',
          stiffness: 600,
          damping: 30,
        }}
      />
      
      {/* Trailing effect - subtle and smooth */}
      <motion.div
        className="fixed rounded-full pointer-events-none z-[9998] border"
        style={{
          left: cursorX,
          top: cursorY,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          width: isHovering ? 40 : 32,
          height: isHovering ? 40 : 32,
          borderColor: isHovering ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
          opacity: isHovering ? 0.8 : 0.4,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
        }}
      />
    </>
  )
}
