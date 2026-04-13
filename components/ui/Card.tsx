import React from 'react'
import { motion } from 'framer-motion'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'gradient' | 'danger' | 'success'
  interactive?: boolean
  noPadding?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      interactive = false,
      noPadding = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-gray-900/50 border-gray-800',
      secondary: 'bg-gray-800/30 border-gray-700',
      gradient:
        'bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-800',
      danger: 'bg-red-900/10 border-red-500/20',
      success: 'bg-emerald-900/10 border-emerald-500/20',
    }

    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { borderColor: 'rgb(59, 130, 246, 0.3)' } : {}}
        className={`
          border rounded-lg
          ${variants[variant]}
          ${!noPadding ? 'p-6' : ''}
          ${interactive ? 'cursor-pointer transition-colors' : ''}
          ${className || ''}
        `}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// Card header
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={`mb-4 pb-4 border-b border-gray-800 ${className || ''}`} {...props}>
    {children}
  </div>
)

// Card footer
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={`mt-4 pt-4 border-t border-gray-800 ${className || ''}`} {...props}>
    {children}
  </div>
)
