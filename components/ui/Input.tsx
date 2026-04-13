import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helpText?: string
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      helpText,
      fullWidth = true,
      className,
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              w-full px-4 py-2 rounded-lg
              bg-gray-800/50 border border-gray-700
              text-white placeholder-gray-500
              transition-colors
              focus:outline-none focus:bg-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500/50 bg-red-900/10' : ''}
              ${className || ''}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  fullWidth?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg
            bg-gray-800/50 border border-gray-700
            text-white placeholder-gray-500
            transition-colors
            focus:outline-none focus:bg-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-red-500/50 bg-red-900/10' : ''}
            ${className || ''}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Select variant
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  helpText?: string
  fullWidth?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      helpText,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg
            bg-gray-800/50 border border-gray-700
            text-white
            transition-colors
            focus:outline-none focus:bg-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 bg-red-900/10' : ''}
            ${className || ''}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
