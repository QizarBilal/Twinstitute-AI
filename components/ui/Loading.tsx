import React from 'react'
import { motion } from 'framer-motion'

// Spinner component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'gray'
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colors = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
  }

  return (
    <div
      className={`
        border-2 rounded-full animate-spin
        border-transparent
        ${sizes[size]}
        ${colors[color]}
        border-t-current
      `}
    />
  )
}

// Loading overlay
interface LoadingProps {
  fullScreen?: boolean
  message?: string
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        flex items-center justify-center gap-3
        ${fullScreen ? 'fixed inset-0 bg-black/80 backdrop-blur z-50' : ''}
        ${fullScreen ? '' : 'min-h-[200px]'}
      `}
    >
      <Spinner size={fullScreen ? 'lg' : 'md'} color="white" />
      {message && (
        <span className="text-gray-400 text-sm">{message}</span>
      )}
    </motion.div>
  )
}

// Skeleton loader
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  height?: string
  width?: string
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = '1rem',
  width = '100%',
  circle = false,
  className,
  ...props
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`
            bg-gray-800/50 border border-gray-700
            mb-2 last:mb-0
            ${circle ? 'rounded-full' : 'rounded-lg'}
            ${className || ''}
          `}
          {...(props as any)}
        />
      ))}
    </>
  )
}

// Pulse loader
export const Pulse: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    {children}
  </motion.div>
)
