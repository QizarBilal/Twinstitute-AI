'use client'

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export default function OTPInput({ value, onChange, error }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const valueArray = value.padEnd(6, ' ').split('').slice(0, 6)

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return

    const newValueArray = valueArray.map((char, i) => (i === index ? inputValue.slice(0, 1) : char))
    const newValue = newValueArray.join('').replace(/ /g, '')
    onChange(newValue)

    if (inputValue && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentValue = valueArray[index].trim()
      if (!currentValue && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const newValueArray = valueArray.map((char, i) => (i === index ? ' ' : char))
        const newValue = newValueArray.join('').replace(/ /g, '')
        onChange(newValue)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (!/^\d{6}$/.test(pastedData)) return

    onChange(pastedData)
    inputRefs.current[5]?.focus()
  }

  return (
    <div className="flex gap-2.5">
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const cellValue = valueArray[index].trim()
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={cellValue}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`
              w-12 h-14 text-center text-xl font-medium
              bg-white dark:bg-gray-950
              border rounded
              transition-all duration-150
              focus:outline-none focus:ring-1 focus:ring-offset-0
              ${error 
                ? 'border-red-600 focus:border-red-600 focus:ring-red-600/30 text-red-600' 
                : cellValue
                  ? 'border-blue-600 focus:border-blue-700 focus:ring-blue-600/30 text-gray-900 dark:text-white'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-600 focus:ring-blue-600/30 text-gray-900 dark:text-white'
              }
            `}
          />
        )
      })}
    </div>
  )
}
