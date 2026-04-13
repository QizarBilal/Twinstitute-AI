'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, SPACING } from '@/lib/design-system'
import MentorChat from '@/components/dashboard/mentor/MentorChat'
import NextStepsPanel from '@/components/dashboard/mentor/NextStepsPanel'
import RiskAlertsPanel from '@/components/dashboard/mentor/RiskAlertsPanel'
import SuggestionsPanel from '@/components/dashboard/mentor/SuggestionsPanel'


/**
 * AI Mentor System Dashboard
 *
 * A complete real-time guidance system powered by user data:
 * - Context-aware multi-agent AI chat
 * - Real-time risk alerts and guidance panels
 * - Explainable recommendations
 * - Quick action buttons
 *
 * Route: /dashboard/mentor
 */
export default function MentorPage() {
  const [chatHidden, setChatHidden] = useState(false)

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundColor: COLORS.background.primary,
        color: COLORS.text.primary,
      }}
    >
      {/* Page Header */}
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: COLORS.background.tertiary }}
      >
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: COLORS.text.primary }}
          >
            🧠 AI Mentor System
          </h1>
          <p
            className="text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            Your personal learning strategist. Powered by 5 specialized agents analyzing your growth
            in real-time.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Left Column: Chat Interface (2/3 width) */}
        <motion.div
          className="flex-1 flex flex-col min-w-0"
          animate={{
            flex: chatHidden ? 0 : 1,
            opacity: chatHidden ? 0.3 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="rounded-lg border flex flex-col h-full overflow-hidden"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.background.tertiary,
            }}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: COLORS.background.tertiary }}
            >
              <div>
                <h2
                  className="font-semibold text-sm uppercase tracking-wide"
                  style={{ color: COLORS.text.primary }}
                >
                  💬 Mentor Chat
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  Ask anything. I synthesize insights from 5 mentor perspectives
                </p>
              </div>
              <button
                onClick={() => setChatHidden(!chatHidden)}
                className="px-3 py-1 rounded text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  color: COLORS.text.secondary,
                }}
                title={chatHidden ? 'Show chat' : 'Hide chat'}
              >
                {chatHidden ? '▶' : '◀'}
              </button>
            </div>

            {!chatHidden && <MentorChat />}
          </div>
        </motion.div>

        {/* Right Column: Guidance Panels (1/3 width) */}
        <motion.div
          className="w-96 flex flex-col gap-4 overflow-hidden"
          animate={{
            width: chatHidden ? '100%' : 'auto',
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Panels Stack */}
          <div
            className="flex-1 grid gap-4 overflow-hidden"
            style={{
              gridTemplateRows: 'repeat(3, 1fr)',
            }}
          >
            {/* Panel 1: Next Steps */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <NextStepsPanel />
            </motion.div>

            {/* Panel 2: Risk Alerts */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <RiskAlertsPanel />
            </motion.div>

            {/* Panel 3: Suggestions */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SuggestionsPanel />
            </motion.div>
          </div>

          {/* Quick Actions Bar */}
          <motion.div
            className="rounded-lg border p-3 space-y-2"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.background.tertiary,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLORS.text.secondary }}
            >
              ⚡ Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                label="Start Task"
                icon="▶️"
                onClick={() => console.log('Start task')}
              />
              <QuickActionButton
                label="Fix Weak Skill"
                icon="📚"
                onClick={() => console.log('Fix skill')}
              />
              <QuickActionButton
                label="View Skills"
                icon="🧬"
                onClick={() => console.log('View skills')}
              />
              <QuickActionButton
                label="Check Progress"
                icon="📈"
                onClick={() => console.log('Check progress')}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div
        className="border-t px-6 py-3 flex items-center justify-between text-xs"
        style={{
          borderColor: COLORS.background.tertiary,
          color: COLORS.text.secondary,
        }}
      >
        <p>
          💡 Mentor system learns from your behavior. Recommendations improve over time.
        </p>
        <div className="flex gap-4">
          <button className="hover:text-opacity-100 transition-opacity opacity-70">
            Settings
          </button>
          <button className="hover:text-opacity-100 transition-opacity opacity-70">
            Feedback
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Quick Action Button Component
 */
function QuickActionButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors"
      style={{
        backgroundColor: '#0a0a0a',
        borderColor: '#1a1a1a',
        color: '#a1a1a1',
      }}
    >
      <span className="text-base">{icon}</span>
      <p className="text-xs font-semibold mt-1">{label}</p>
    </motion.button>
  )
}
