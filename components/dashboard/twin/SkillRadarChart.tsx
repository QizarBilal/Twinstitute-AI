'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface SkillRadarChartProps {
  loading?: boolean
}

export default function SkillRadarChart({ loading }: SkillRadarChartProps) {
  const { data: genome } = useDataFetch('/api/genome')

  const chartData = useMemo(() => {
    if (!genome || !genome.nodes) return null

    // Get top 6-8 skills for radar visibility
    const sortedSkills = [...genome.nodes]
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 8)

    return sortedSkills
  }, [genome])

  if (loading || !chartData) {
    return (
      <div
        className="rounded-lg border p-6 h-full flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="animate-pulse text-center">
          <div className="h-40 w-40 bg-gray-700 rounded-full mx-auto" />
        </div>
      </div>
    )
  }

  const skills = chartData
  const skillCount = skills.length
  const radius = 120
  const maxValue = 100

  // Calculate points for radar chart
  const points = skills.map((skill, i) => {
    const angle = (i / skillCount) * Math.PI * 2 - Math.PI / 2
    const x = 200 + Math.cos(angle) * radius
    const y = 200 + Math.sin(angle) * radius
    const dataX = 200 + Math.cos(angle) * ((skill.proficiency / maxValue) * radius)
    const dataY = 200 + Math.sin(angle) * ((skill.proficiency / maxValue) * radius)

    return {
      skill: skill.label,
      proficiency: skill.proficiency,
      x,
      y,
      dataX,
      dataY,
      angle,
    }
  })

  // Generate grid lines
  const gridLevels = [20, 40, 60, 80, 100]

  // Generate polygon path
  const polygonPath = points.map((p, i) => `${p.dataX},${p.dataY}`).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border p-6 h-full flex flex-col"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.background.tertiary,
      }}
    >
      {/* Title */}
      <div className="mb-4">
        <h3
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: COLORS.text.primary }}
        >
          📊 Skill Distribution
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Your proficiency across key competencies
        </p>
      </div>

      {/* SVG Radar Chart */}
      <div className="flex-1 flex items-center justify-center">
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* Grid background */}
          {gridLevels.map((level, i) => {
            const gridRadius = (level / maxValue) * radius
            const gridPoints = points
              .map((p) => {
                const angle = p.angle
                const x = 200 + Math.cos(angle) * gridRadius
                const y = 200 + Math.sin(angle) * gridRadius
                return `${x},${y}`
              })
              .join(' ')

            return (
              <g key={i}>
                <polygon
                  points={gridPoints}
                  fill="none"
                  stroke={COLORS.background.tertiary}
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* Grid labels */}
                {i === gridLevels.length - 1 && (
                  <text
                    x="200"
                    y={200 - gridRadius - 5}
                    textAnchor="middle"
                    className="text-xs"
                    style={{ fill: COLORS.text.tertiary }}
                  >
                    {level}
                  </text>
                )}
              </g>
            )
          })}

          {/* Axes */}
          {points.map((point, i) => (
            <line
              key={`axis-${i}`}
              x1="200"
              y1="200"
              x2={point.x}
              y2={point.y}
              stroke={COLORS.background.tertiary}
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Data polygon */}
          <motion.polygon
            points={polygonPath}
            fill={COLORS.accent.primary}
            fillOpacity="0.15"
            stroke={COLORS.accent.primary}
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={`point-${i}`}
              cx={point.dataX}
              cy={point.dataY}
              r="4"
              fill={COLORS.accent.primary}
              initial={{ r: 0 }}
              animate={{ r: 4 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            />
          ))}

          {/* Skill labels */}
          {points.map((point, i) => (
            <text
              key={`label-${i}`}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dy="0.3em"
              className="text-xs font-semibold"
              style={{
                fill: COLORS.text.secondary,
                pointerEvents: 'none',
              }}
            >
              {point.skill.length > 10 ? point.skill.slice(0, 10) : point.skill}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <motion.div
        className="mt-4 pt-4 border-t grid grid-cols-2 gap-2"
        style={{ borderColor: COLORS.background.tertiary }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  skill.proficiency > 75
                    ? '#10B981'
                    : skill.proficiency > 50
                      ? COLORS.accent.primary
                      : '#F59E0B',
              }}
            />
            <div className="text-xs flex-1 min-w-0">
              <p
                className="truncate"
                style={{ color: COLORS.text.secondary }}
              >
                {skill.label}
              </p>
              <p
                style={{ color: COLORS.text.tertiary }}
              >
                {skill.proficiency}/100
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
