'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    success?: boolean
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
    ({ label, error, success, className = '', ...props }, ref) => {
        const [focused, setFocused] = useState(false)
        const hasValue = !!props.value || !!props.defaultValue

        const borderClass = error
            ? 'border-red-500/50 focus:border-red-500'
            : success
            ? 'border-green-500/50 focus:border-green-500'
            : 'border-gray-700 focus:border-blue-500/50'

        return (
            <div className="relative">
                <input
                    ref={ref}
                    {...props}
                    className={`peer w-full px-4 pt-5 pb-2 bg-gray-800 border rounded-xl text-sm text-gray-200 placeholder-transparent focus:outline-none transition-colors
                        ${borderClass}
                        ${className}`}
                    placeholder={label}
                    onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
                    onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
                />
                <label
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${focused || hasValue
                            ? `top-1.5 text-[10px] ${success ? 'text-green-400' : 'text-blue-400'}`
                            : 'top-3.5 text-sm text-gray-500'
                        }`}
                >
                    {label}
                </label>
                {error && <p className="text-xs text-red-400 mt-1 ml-1">{error}</p>}
                {success && !error && <p className="text-xs text-green-400 mt-1 ml-1">✓</p>}
            </div>
        )
    }
)

FloatingInput.displayName = 'FloatingInput'
export default FloatingInput

