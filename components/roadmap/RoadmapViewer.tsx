import { motion } from 'framer-motion'
import ModuleCard from './ModuleCard'

interface Module {
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  skills: string[]
  estimatedHours: number
  id?: string
}

interface Phase {
  phase: string
  duration: string
  modules: Module[]
}

interface RoadmapViewerProps {
  phases: Phase[]
  onModuleStart?: (moduleTitle: string) => void
}

export default function RoadmapViewer({
  phases,
  onModuleStart,
}: RoadmapViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {Array.isArray(phases) && phases.map((phase: Phase, phaseIdx: number) => (
        <motion.div
          key={phaseIdx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + phaseIdx * 0.1 }}
          className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 space-y-4"
        >
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{phase.phase}</h2>
            <p className="text-sm text-gray-400">Duration: {phase.duration}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phase.modules && phase.modules.map((module: Module, modIdx: number) => (
              <ModuleCard
                key={modIdx}
                id={module.id}
                title={module.title}
                description={module.description}
                difficulty={module.difficulty}
                skills={module.skills}
                estimatedHours={module.estimatedHours}
                onStart={onModuleStart}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
