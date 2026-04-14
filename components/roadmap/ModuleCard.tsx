import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'

interface ModuleCardProps {
  id?: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  skills: string[]
  estimatedHours: number
  onStart?: (moduleId: string) => void
}

export default function ModuleCard({
  id,
  title,
  description,
  difficulty,
  skills,
  estimatedHours,
  onStart,
}: ModuleCardProps) {
  const difficultyColors = {
    Beginner: '#22c55e',
    Intermediate: '#f59e0b',
    Advanced: '#ef4444',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-white text-sm flex-1">{title}</h3>
        <span
          className="text-xs px-2 py-1 rounded font-semibold ml-2 flex-shrink-0"
          style={{
            backgroundColor: difficultyColors[difficulty] + '20',
            color: difficultyColors[difficulty],
          }}
        >
          {difficulty}
        </span>
      </div>

      <p className="text-xs text-gray-400">{description}</p>

      <div className="flex gap-2 flex-wrap">
        {skills.map((skill: string, idx: number) => (
          <span
            key={idx}
            className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <span className="text-xs text-gray-500">{estimatedHours} hours</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart?.(id || title)}
          className="text-xs px-3 py-1 rounded font-semibold"
          style={{
            backgroundColor: COLORS.accent.primary,
            color: '#000',
          }}
        >
          Start
        </motion.button>
      </div>
    </motion.div>
  )
}
