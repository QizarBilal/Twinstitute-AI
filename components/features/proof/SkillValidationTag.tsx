'use client'

interface SkillValidationTagProps {
  skill: string
  level: 'verified' | 'developing' | 'weak'
  strength?: number
  proofCount?: number
  size?: 'sm' | 'md' | 'lg'
}

const getLevelConfig = (level: string) => {
  switch (level) {
    case 'verified':
      return {
        icon: '✅',
        label: 'Verified',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        accentColor: 'from-emerald-600',
      }
    case 'developing':
      return {
        icon: '⚠️',
        label: 'Developing',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        accentColor: 'from-blue-600',
      }
    case 'weak':
      return {
        icon: '❌',
        label: 'Weak',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        accentColor: 'from-red-600',
      }
    default:
      return {
        icon: '❓',
        label: 'Unknown',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/30',
        accentColor: 'from-gray-600',
      }
  }
}

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'px-2 py-1 text-xs'
    case 'md':
      return 'px-3 py-1.5 text-sm'
    case 'lg':
      return 'px-4 py-2 text-base'
    default:
      return 'px-3 py-1.5 text-sm'
  }
}

export default function SkillValidationTag({
  skill,
  level,
  strength = 0.5,
  proofCount = 0,
  size = 'md',
}: SkillValidationTagProps) {
  const config = getLevelConfig(level)
  const sizeClasses = getSizeClasses(size)

  return (
    <div
      className={`inline-flex items-center gap-2 font-medium border rounded-full transition-all duration-300 ${sizeClasses} ${config.bgColor} ${config.textColor} ${config.borderColor} hover:shadow-lg hover:shadow-${config.accentColor.replace('from-', '')}/20`}
      title={`Strength: ${Math.round(strength * 100)}% | Proof documents: ${proofCount}`}
    >
      <span className="text-sm">{config.icon}</span>
      <span>{skill}</span>
      {strength > 0 && (
        <div className="h-1.5 w-32 bg-gray-700 rounded-full overflow-hidden ml-1">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${config.accentColor} to-transparent`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
