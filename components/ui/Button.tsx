import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap'

    const variants = {
      primary:
        'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50 shadow-lg shadow-blue-500/20',
      secondary:
        'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white disabled:opacity-50',
      danger:
        'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 disabled:opacity-50',
      success:
        'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 shadow-lg shadow-emerald-500/20',
      ghost:
        'bg-transparent hover:bg-gray-800/50 border border-gray-700 text-gray-300 disabled:opacity-50',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className || ''}
        `}
        {...(props as any)}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
