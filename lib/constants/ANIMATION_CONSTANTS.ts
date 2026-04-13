/**
 * Animation Constants
 * Centralized timing and delay values for consistent animations across the application
 */

// Animation Duration
export const ANIMATION_DURATION = {
  fast: 200,      // Quick transitions
  normal: 500,    // Standard animations
  slow: 800,      // Slower, more impactful animations
  verySlowMs: 1000,
} as const

// Staggered Animation Delays
export const ANIMATION_DELAY = {
  none: 0,
  veryShort: 50,
  short: 100,
  medium: 200,
  long: 300,
  veryLong: 400,
  extraLong: 500,
} as const

// Common Animation Patterns
export const FADE_IN_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_DURATION.normal / 1000 },
} as const

export const SLIDE_UP_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: ANIMATION_DURATION.normal / 1000 },
} as const

export const SCALE_ANIMATION = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: ANIMATION_DURATION.normal / 1000 },
} as const
