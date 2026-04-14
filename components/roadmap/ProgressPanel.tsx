import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'

interface ProgressPanelProps {
  totalDuration: string
  intensityLevel: string
  completionPercentage: number
}

export default function ProgressPanel({
  totalDuration,
  intensityLevel,
  completionPercentage,
}: ProgressPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-3 gap-4"
    >
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
        <div className="text-xs text-gray-500 font-semibold mb-2">TIMELINE</div>
        <div className="text-2xl font-bold text-cyan-400">{totalDuration}</div>
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
        <div className="text-xs text-gray-500 font-semibold mb-2">INTENSITY</div>
        <div className="text-sm font-bold text-white">{intensityLevel}</div>
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
        <div className="text-xs text-gray-500 font-semibold mb-2">PROGRESS</div>
        <div className="text-2xl font-bold text-green-400">{completionPercentage}%</div>
      </div>
    </motion.div>
  )
}
