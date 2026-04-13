'use client'

import CapabilityStrengthIndex from './panels/CareerReadinessScore'
import CapabilityPathSimulation from './panels/StrategySimulation'
import SkillGenomeWeakClusterMap from './panels/SkillGapHeatmap'
import FormationMilestoneTimeline from './panels/RoadmapTimeline'
import CapabilityProofConfidence from './panels/RecruiterConfidence'
import CapabilityTwinProjection from './panels/DigitalTwinProjection'
import { ANIMATION_DURATION, ANIMATION_DELAY } from '@/lib/constants/ANIMATION_CONSTANTS'

/**
 * DashboardMetricsGrid
 * 
 * Displays a responsive grid of dashboard metric panels with staggered animations.
 * Each panel represents a key dimension of the user's capability profile.
 * 
 * Panels:
 * - Capability Strength Index (4 cols) - Overall capability assessment
 * - Capability Path Simulation (8 cols) - Career path scenarios
 * - Skill Genome Weak Clusters (5 cols) - Gap analysis heatmap
 * - Formation Milestone Timeline (7 cols) - Progress timeline
 * - Capability Proof Confidence (6 cols) - Credential verification
 * - Capability Twin Projection (6 cols) - Future projections
 */

interface MetricPanelConfig {
  id: string
  Component: React.ComponentType
  colSpan: {
    mobile: string
    tablet: string
    desktop: string
  }
  animationDelay: number
  ariaLabel: string
}

const METRIC_PANELS: MetricPanelConfig[] = [
  {
    id: 'capability-strength',
    Component: CapabilityStrengthIndex,
    colSpan: {
      mobile: 'col-span-12',
      tablet: 'lg:col-span-4',
      desktop: 'lg:col-span-4',
    },
    animationDelay: ANIMATION_DELAY.none,
    ariaLabel: 'Capability strength index showing overall capability score',
  },
  {
    id: 'capability-simulation',
    Component: CapabilityPathSimulation,
    colSpan: {
      mobile: 'col-span-12',
      tablet: 'lg:col-span-8',
      desktop: 'lg:col-span-8',
    },
    animationDelay: ANIMATION_DELAY.short,
    ariaLabel: 'Capability path simulation showing career scenarios',
  },
  {
    id: 'skill-gaps',
    Component: SkillGenomeWeakClusterMap,
    colSpan: {
      mobile: 'col-span-12',
      tablet: 'lg:col-span-5',
      desktop: 'lg:col-span-5',
    },
    animationDelay: ANIMATION_DELAY.medium,
    ariaLabel: 'Skill genome gap analysis heatmap',
  },
  {
    id: 'milestone-timeline',
    Component: FormationMilestoneTimeline,
    colSpan: {
      mobile: 'col-span-12',
      tablet: 'lg:col-span-7',
      desktop: 'lg:col-span-7',
    },
    animationDelay: ANIMATION_DELAY.long,
    ariaLabel: 'Formation milestone timeline showing progress',
  },
  {
    id: 'proof-confidence',
    Component: CapabilityProofConfidence,
    colSpan: {
      mobile: 'col-span-12',
      tablet: 'lg:col-span-6',
      desktop: 'lg:col-span-6',
    },
    animationDelay: ANIMATION_DELAY.veryLong,
    ariaLabel: 'Capability proof confidence score',
  },
  {
    id: 'twin-projection',
    Component: CapabilityTwinProjection,
    colSpan: {
      mobile: 'col-span-12',
      tablet: 'lg:col-span-6',
      desktop: 'lg:col-span-6',
    },
    animationDelay: ANIMATION_DELAY.extraLong,
    ariaLabel: 'Capability twin projection showing future growth',
  },
]

export default function DashboardMetricsGrid() {
  return (
    <div className="p-6 space-y-4" role="region" aria-label="Dashboard metrics grid">
      <div className="grid grid-cols-12 gap-4">
        {METRIC_PANELS.map((panel) => {
          const { Component, colSpan, animationDelay, ariaLabel } = panel
          const colSpanClasses = `${colSpan.mobile} ${colSpan.tablet} ${colSpan.desktop}`
          
          return (
            <div
              key={panel.id}
              className={`${colSpanClasses} animate-in fade-in slide-in-from-bottom-4`}
              style={{
                animationDuration: `${ANIMATION_DURATION.normal}ms`,
                animationDelay: `${animationDelay}ms`,
              }}
              role="article"
              aria-label={ariaLabel}
            >
              <Component />
            </div>
          )
        })}
      </div>
    </div>
  )
}
