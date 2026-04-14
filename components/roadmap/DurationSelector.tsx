import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'

interface DurationSelectorProps {
  selectedDuration: number
  onDurationChange: (duration: number) => void
  isLoading?: boolean
}

const DURATION_OPTIONS = [
  { months: 1, label: '1 Month (Boot Camp)', description: '50 hours/week' },
  { months: 2, label: '2 Months (Intensive)', description: '37 hours/week' },
  { months: 3, label: '3 Months (Fast)', description: '25 hours/week' },
  { months: 6, label: '6 Months (Balanced)', description: '12 hours/week' },
  { months: 12, label: '12 Months (Comfortable)', description: '6 hours/week' },
]

export default function DurationSelector({
  selectedDuration,
  onDurationChange,
  isLoading = false,
}: DurationSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Select Your Timeline</h3>
        <p className="text-sm text-gray-400">Choose how much time you want to commit</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {DURATION_OPTIONS.map((option) => (
          <motion.button
            key={option.months}
            onClick={() => onDurationChange(option.months)}
            disabled={isLoading}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              selectedDuration === option.months
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="font-bold text-sm text-white">{option.months}m</div>
            <div className="text-xs text-gray-400 mt-1">{option.description}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
