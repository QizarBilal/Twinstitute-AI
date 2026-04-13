'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * TRUST STRIP - Simple positioning statement
 * "Built for the next generation of engineers and builders"
 */
export function TrustStrip() {
  return (
    <section className="relative py-8 bg-black border-y border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          className="text-center text-gray-400 text-sm tracking-widest uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Built for the next generation of engineers and builders
        </motion.p>
      </div>
    </section>
  )
}



/**
 * SOLUTION SECTION - Three core layers
 * FAANG-grade 3-column card design with modern UI
 */
export function SolutionSection() {
  const layers = [
    {
      title: 'Digital Twin',
      subtitle: 'A continuously evolving AI model of the student.',
      points: [
        'Maps your current capability state: skills, strengths, weaknesses, learning velocity, and behavioral patterns',
        'Understands how you perform, not just what you learn',
        'Becomes the foundation for all decisions: what to learn, what to build, and how to improve'
      ]
    },
    {
      title: 'Execution Labs',
      subtitle: 'Structured, real-world task environments aligned to your capability.',
      points: [
        'Execute, don\'t consume — real-world execution, not passive learning',
        'Dynamic task assignment based on your skill level, target role, and capability gaps',
        'Every task simulates real engineering work — forcing depth, problem-solving, and practical application'
      ]
    },
    {
      title: 'Proof System',
      subtitle: 'Every action is evaluated. Every outcome is measured.',
      points: [
        'Generates verifiable proof artifacts that demonstrate what you can actually do',
        'Encompasses task performance, code quality, problem-solving ability, and execution consistency',
        'Not certificates. Not claims. Real, measurable proof of your capability.'
      ]
    },
  ]

  return (
    <section id="program" className="relative py-24 bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Core System
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Three Layers of Capability</span>
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto mt-6">
            Twinstitute transforms theoretical knowledge into measurable, real-world capability through continuous execution and validation.
          </p>
        </motion.div>

        {/* Three Layers - Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {layers.map((layer, idx) => {
            const colors = [
              { border: 'from-blue-600 to-cyan-600', bg: 'from-blue-600/5 to-cyan-600/5', accent: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
              { border: 'from-purple-600 to-pink-600', bg: 'from-purple-600/5 to-pink-600/5', accent: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-500/20' },
              { border: 'from-orange-600 to-red-600', bg: 'from-orange-600/5 to-red-600/5', accent: 'from-orange-500 to-red-400', shadow: 'shadow-orange-500/20' },
            ]
            const color = colors[idx]
            
            return (
              <motion.div
                key={idx}
                className="group h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
              >
                <div className={`relative h-full rounded-2xl border border-gray-800/60 bg-gradient-to-br ${color.bg} backdrop-blur-sm p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-opacity-100 flex flex-col`}>
                  {/* Accent glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${color.bg} rounded-full blur-3xl`} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Number Badge */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color.bg} border border-gray-700/50 mb-6 group-hover:border-opacity-100 transition-all`}>
                      <span className={`text-xl font-black bg-gradient-to-r ${color.accent} bg-clip-text text-transparent`}>
                        {idx + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors duration-300">
                      {layer.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-gray-400 text-sm font-semibold mb-6 group-hover:text-gray-300 transition-colors duration-300">
                      {layer.subtitle}
                    </p>

                    {/* Accent line */}
                    <div className={`h-1 w-10 bg-gradient-to-r ${color.accent} rounded-full mb-8 group-hover:w-16 transition-all duration-300`} />

                    {/* Points */}
                    <div className="space-y-4 flex-1">
                      {layer.points.map((point, pIdx) => (
                        <motion.div
                          key={pIdx}
                          className="flex gap-3 items-start"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 + pIdx * 0.08 }}
                          viewport={{ once: true }}
                        >
                          <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color.accent} mt-2 group-hover:scale-150 transition-transform`} />
                          <p className="text-gray-350 text-sm leading-relaxed font-light group-hover:text-gray-300 transition-colors">
                            {point}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * HOW IT WORKS - Capability loop explanation
 * Model → Train → Evaluate → Simulate → Strategize
 */
export function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Model',
      description: 'Your digital twin is created based on your current state.'
    },
    {
      number: '2',
      title: 'Train',
      description: 'You are assigned structured execution tasks aligned to your goals.'
    },
    {
      number: '3',
      title: 'Evaluate',
      description: 'Your work is analyzed across multiple dimensions of capability.'
    },
    {
      number: '4',
      title: 'Simulate',
      description: 'The system predicts your future trajectory and readiness.'
    },
    {
      number: '5',
      title: 'Strategize',
      description: 'You receive precise next-step actions to improve.'
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <section id="framework" className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Title Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            How It Works
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">The Capability Loop</span>
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl font-light max-w-2xl mx-auto">
            Twinstitute operates as a continuous loop: Model → Train → Evaluate → Simulate → Strategize
          </p>
        </motion.div>

        {/* Loop visualization */}
        <motion.div
          className="flex items-center justify-center gap-3 lg:gap-6 mb-20 flex-wrap lg:flex-nowrap"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 lg:gap-6">
              <div className="text-center">
                <div className="text-sm lg:text-base font-black text-blue-400 uppercase tracking-wide">
                  {step.title}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="text-2xl text-gray-700 hidden lg:block">→</div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className={`relative group cursor-pointer transition-all duration-300 ${
                activeIndex === idx ? 'lg:scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setActiveIndex(idx)}
            >
              {/* Card */}
              <motion.div
                className="relative p-6 rounded-2xl border backdrop-blur-sm h-full"
                animate={{
                  borderColor: activeIndex === idx ? 'rgba(59, 130, 246, 0.6)' : 'rgba(107, 114, 128, 0.3)',
                  backgroundColor: activeIndex === idx ? 'rgba(59, 130, 246, 0.08)' : 'rgba(31, 41, 55, 0.4)'
                }}
              >
                {/* Number */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 mb-4">
                  <span className={`font-black text-sm ${
                    activeIndex === idx ? 'text-cyan-400' : 'text-gray-500'
                  }`}>
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold mb-3 transition-colors ${
                  activeIndex === idx ? 'text-white' : 'text-gray-300'
                }`}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className={`text-sm leading-relaxed transition-colors ${
                  activeIndex === idx ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {step.description}
                </p>

                {/* Active indicator */}
                {activeIndex === idx && (
                  <motion.div
                    className="absolute -bottom-0.5 left-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    layoutId="activeIndicator"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Explanation paragraph */}
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-lg leading-relaxed font-light">
            This loop repeats continuously —<br />
            <span className="text-white font-semibold">ensuring constant growth, adaptation, and refinement.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * TWINSTITUTE AI SYSTEM - Premium System Visualization
 * Central Intelligence Hub + Orbiting Pillars
 * Production-grade spatial balance and scale precision
 */
export function SystemModulesSection() {
  const systemPillars = [
    {
      number: '01',
      title: 'Real-Time Capability Mapping',
      description: 'Continuously understands your evolving skill state in real-time.',
      features: ['Dynamic skill assessment', 'Behavior pattern recognition', 'Predictive modeling']
    },
    {
      number: '02',
      title: 'Intelligent Task Generation',
      description: 'Generates personalized execution tasks aligned to your growth.',
      features: ['Adaptive difficulty scaling', 'Real-world scenario alignment', 'Skill gap targeting']
    },
    {
      number: '03',
      title: 'Multi-Dimensional Evaluation',
      description: 'Evaluates performance across multiple dimensions of capability.',
      features: ['Code quality analysis', 'Problem-solving patterns', 'Performance metrics']
    },
    {
      number: '04',
      title: 'Verifiable Proof Generation',
      description: 'Creates proof artifacts that employers can verify and trust.',
      features: ['Task completion records', 'Performance analytics', 'Skill verification']
    },
    {
      number: '05',
      title: 'Predictive Career Roadmap',
      description: 'Predicts readiness timeline and provides precise growth actions.',
      features: ['Career path forecasting', 'Capability predictions', 'Personalized growth plans']
    },
  ]

  const RADIUS = 320
  const angles = [0, 72, 144, 216, 288] // Perfect 5-point distribution (360/5 = 72°)

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 5)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="features" className="relative py-24 bg-black overflow-hidden">
      {/* Minimal background - avoid distraction */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, .03) 25%, rgba(0, 217, 255, .03) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, .03) 75%, rgba(0, 217, 255, .03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, .03) 25%, rgba(0, 217, 255, .03) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, .03) 75%, rgba(0, 217, 255, .03) 76%, transparent 77%, transparent)',
        backgroundSize: '80px 80px'
      }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Title Section */}
        <motion.div
          className="text-center mb-32"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            AI-Powered System
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Five Core Pillars</span>
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto">
            A central intelligence coordinating five intelligent subsystems in perfect balance.
          </p>
        </motion.div>

        <div className="relative w-full h-[800px] flex items-center justify-center">
          <div className="absolute left-1/2 top-1/2 z-10">
            {angles.map((angle, idx) => (
              <div
                key={idx}
                className="absolute w-[1px] opacity-40"
                style={{
                  height: `${RADIUS}px`,
                  background:
                    idx === activeIndex
                      ? 'linear-gradient(to top, transparent, rgba(0,217,255,0.9), transparent)'
                      : 'linear-gradient(to top, transparent, rgba(0,217,255,0.2), transparent)',
                  transformOrigin: 'bottom center',
                  transform: `translate(-50%, 0) rotate(${angle}deg)`,
                }}
              />
            ))}
          </div>

          {systemPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="absolute left-1/2 top-1/2 w-[220px] z-20"
              style={{
                transform: `translate(-50%, -50%) rotate(${angles[idx]}deg) translateY(-${RADIUS}px) rotate(-${angles[idx]}deg)`,
              }}
            >
              <div
                className={`
p-5 rounded-xl
bg-white/[0.04]
border transition-all duration-500
backdrop-blur-md
${idx === activeIndex
  ? 'border-cyan-400/60 shadow-[0_0_50px_rgba(0,217,255,0.6)] scale-105'
  : 'border-white/10 opacity-60'}
`}
              >
                <div className="space-y-3">
                  <div className="inline-block">
                    <span className="text-xs font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-400/20">
                      {pillar.number}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    {pillar.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <div className="w-0.5 h-0.5 rounded-full bg-cyan-400/60 flex-shrink-0 mt-1.5" />
                        <span className="text-xs text-gray-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full flex items-center justify-center z-30">
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-cyan-400/20"
              animate={{
                rotate: 360,
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 3, repeat: Infinity },
              }}
            />

            <motion.div
              className="w-full h-full rounded-full bg-cyan-500/10 border border-cyan-400/30 shadow-[0_0_120px_rgba(0,217,255,0.5)] flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-lg font-black text-cyan-300 tracking-wider">AI ENGINE</div>
                <div className="text-sm text-cyan-400/70 font-light">Learning • Evaluating • Predicting</div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

/**
 * DIFFERENCE SECTION - Comparison table
 * Traditional vs Twinstitute
 */
export function DifferenceSection() {
  const comparisons = [
    { traditional: 'Grades & certificates', twinstitute: 'Verified capability' },
    { traditional: 'Years of study', twinstitute: 'Measurable skill proof' },
    {
      traditional: 'Disconnected theory',
      twinstitute: 'Real-world execution',
    },
    { traditional: 'Passive learning', twinstitute: 'Active capability building' },
    {
      traditional: 'No career clarity',
      twinstitute: 'Clear execution roadmap',
    },
  ]

  return (
    <section id="journey" className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Title */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Traditional Learning
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">vs Capability Engineering</span>
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl font-light">See what makes Twinstitute different</p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="space-y-6 max-w-5xl mx-auto relative">
          {comparisons.map((item, idx) => (
            <motion.div
              key={idx}
              className="grid grid-cols-2 gap-6 items-center relative group"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Vertical Glow Divider */}
              <div className="absolute left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent z-0" />

              {/* Left Side: Traditional */}
              <motion.div
                initial={{ x: -20 }}
                whileInView={{ x: 0 }}
                whileHover={{ opacity: 0.5 }}
                className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 text-gray-400 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{item.traditional}</span>
                </div>
              </motion.div>

              {/* Right Side: Twinstitute */}
              <motion.div
                initial={{ x: 20 }}
                whileInView={{ x: 0 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 40px rgba(0,217,255,0.4)"
                }}
                className="p-5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-white transition-all transform origin-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{item.twinstitute}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * OUTCOME SECTION - What you get
 * Emotional, narrative-driven outcomes
 */
export function OutcomeSection() {
  const proofFlows = [
    {
      before: 'Theoretical learning',
      engine: 'System Training',
      after: 'Real capability',
    },
    {
      before: 'No proof',
      engine: 'Evaluation Engine',
      after: 'Verified proof artifacts',
    },
    {
      before: 'Practice only',
      engine: 'Execution Labs',
      after: 'Real experience',
    },
    {
      before: 'Confusion',
      engine: 'Strategy Engine',
      after: 'Clear roadmap',
    },
  ]

  const [activeFlow, setActiveFlow] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % proofFlows.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [proofFlows.length])

  return (
    <section id="proof" className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Title Section */}
        <motion.div
          className="text-center mb-32"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Outcome Proof
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">What You Actually Get</span>
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl font-light mt-6">Evidence flow: before state, transformation engine, measurable outcome.</p>
        </motion.div>

        {/* Outcome Proof Flow */}
        <div className="space-y-7 max-w-6xl mx-auto">
          {proofFlows.map((flow, idx) => (
            <motion.div
              key={idx}
              className="relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
                <motion.div
                  className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm"
                  animate={{
                    opacity: activeFlow === idx ? 0.85 : 0.55,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.1 + 0.05 }}
                  viewport={{ once: true }}
                >
                  <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-3">Before State</div>
                  <p className="text-gray-300 font-medium text-lg leading-tight">{flow.before}</p>
                </motion.div>

                <motion.div
                  className="relative p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md overflow-hidden"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.1 + 0.15 }}
                  viewport={{ once: true }}
                  animate={{
                    boxShadow: activeFlow === idx
                      ? '0 0 45px rgba(0, 217, 255, 0.35), inset 0 0 30px rgba(0, 217, 255, 0.12)'
                      : '0 0 0px rgba(0,0,0,0)',
                  }}
                >
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-300/80 to-transparent" />
                  <div className="text-[11px] uppercase tracking-widest text-cyan-300/80 mb-3">Transformation</div>
                  <p className="text-cyan-100 font-semibold text-lg leading-tight">{flow.engine}</p>

                  <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300"
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    →
                  </motion.div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/18 to-blue-500/12 backdrop-blur-md"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.1 + 0.25 }}
                  viewport={{ once: true }}
                  animate={{
                    scale: activeFlow === idx ? 1.03 : 1,
                    boxShadow: activeFlow === idx ? '0 0 55px rgba(0, 217, 255, 0.35)' : '0 0 0px rgba(0,0,0,0)',
                  }}
                >
                  <div className="text-[11px] uppercase tracking-widest text-cyan-300/80 mb-3">After State</div>
                  <p className="text-white font-semibold text-lg leading-tight">{flow.after}</p>
                </motion.div>
              </div>

              <div className="hidden lg:block pointer-events-none absolute top-1/2 left-1/3 right-1/3 -translate-y-1/2">
                <motion.div
                  className="h-[1px] bg-gradient-to-r from-cyan-400/20 via-cyan-300/70 to-cyan-400/20"
                  animate={{ opacity: activeFlow === idx ? [0.35, 0.85, 0.35] : 0.25 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-14 flex justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {proofFlows.map((_, idx) => (
            <motion.div
              key={idx}
              className="h-2 rounded-full"
              animate={{
                width: activeFlow === idx ? 38 : 18,
                backgroundColor: activeFlow === idx ? 'rgba(0, 217, 255, 0.85)' : 'rgba(75, 85, 99, 0.6)',
              }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </motion.div>

        {/* Final Statement */}
        <motion.div
          className="text-center mt-20 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            You don't just learn.
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              You evolve into measurable capability.
            </span>
          </h3>
          <p className="text-gray-400 text-lg font-light max-w-3xl mx-auto">
            Every step is tracked. Every skill is verified. Every outcome is real.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * FINAL CTA SECTION - Powerful closing
 * Conversion point with strong narrative
 */
export function FinalCTASection() {
  return (
    <section id="portal" className="relative py-24 bg-black overflow-hidden">
      {/* Animated background with parallax */}
      <div className="absolute inset-0 opacity-20">
        {/* Grid pattern that moves slightly */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(37, 99, 235, 0.03) 25%, rgba(37, 99, 235, 0.03) 26%, transparent 27%, transparent 74%, rgba(37, 99, 235, 0.03) 75%, rgba(37, 99, 235, 0.03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(37, 99, 235, 0.03) 25%, rgba(37, 99, 235, 0.03) 26%, transparent 27%, transparent 74%, rgba(37, 99, 235, 0.03) 75%, rgba(37, 99, 235, 0.03) 76%, transparent 77%, transparent)',
            backgroundSize: '80px 80px',
          }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Intro text */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            You've seen the system.
          </h2>
          <p className="text-xl text-gray-400">
            Now decide how you want to grow.
          </p>
        </motion.div>

        {/* Two-column comparison */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* LEFT SIDE - Traditional Path (Faded) */}
          <motion.div
            className="space-y-6 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-colors"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-gray-500 flex items-center gap-3">
              <span className="text-2xl">❌</span>
              Traditional Path Fades Here
            </h3>
            <div className="space-y-4">
              <motion.p
                className="text-gray-500 text-lg font-light opacity-60 blur-sm hover:blur-none transition-all"
                whileHover={{ opacity: 0.8 }}
              >
                Unstructured learning.
              </motion.p>
              <motion.p
                className="text-gray-500 text-lg font-light opacity-60 blur-sm hover:blur-none transition-all"
                whileHover={{ opacity: 0.8 }}
              >
                Unverified skills.
              </motion.p>
              <motion.p
                className="text-gray-500 text-lg font-light opacity-60 blur-sm hover:blur-none transition-all"
                whileHover={{ opacity: 0.8 }}
              >
                Uncertain outcomes.
              </motion.p>
            </div>
          </motion.div>

          {/* RIGHT SIDE - Twinstitute Path (Highlighted with Glow) */}
          <motion.div
            className="space-y-6 p-8 rounded-2xl border-2 border-transparent bg-gradient-to-br from-blue-600/5 to-cyan-600/5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all overflow-hidden relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            style={{
              backgroundImage: 'linear-gradient(to bottom right, rgba(37, 99, 235, 0.05), rgba(6, 182, 212, 0.05))',
              borderImage: 'linear-gradient(135deg, rgb(37, 99, 235, 0.6), rgb(6, 182, 212, 0.4)) 1',
            }}
          >
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-2xl">✓</span>
              Twinstitute Path Highlights
            </h3>
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-white text-lg font-light"
              >
                Measured capability.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-white text-lg font-light"
              >
                Proven execution.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-white text-lg font-light"
              >
                Clear trajectory.
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Core message */}
        <motion.div
          className="text-center mt-16 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="space-y-2">
            <p className="text-gray-400 text-lg">This is not about learning more.</p>
            <h3 className="text-4xl lg:text-5xl font-bold text-white">
              It's about becoming capable.
            </h3>
          </div>

          {/* CTA Button - Matches Navbar Login Button */}
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="px-8 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Twinstitute
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * FOOTER - Simple footer
 */
export function Footer() {
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Framework', href: '#framework' },
    { name: 'Journey', href: '#journey' },
    { name: 'Portal', href: '#portal' },
    { name: 'Program', href: '#program' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <footer id="contact" className="relative py-16 bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Footer Content */}
        <div className="mb-12">
          {/* Brand */}
          <div className="mb-12">
            <h3 className="font-bold text-white text-lg mb-2">Twinstitute</h3>
            <p className="text-gray-500 text-sm max-w-md">
              Building measurable capability, not just credentials. Transforming education through execution.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mb-12">
            <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wide">Navigation</h4>
            <div className="flex flex-wrap gap-8">
              {[
                { name: 'Home', href: '#home' },
                { name: 'Why Different', href: '#program' },
                { name: 'How It Works', href: '#framework' },
                { name: 'Our System', href: '#features' },
                { name: 'The Difference', href: '#journey' },
                { name: 'Get Started', href: '#portal' },
                { name: 'Contact', href: '#contact' },
              ].map((link) => (
                <motion.button
                  key={link.name}
                  onClick={() => {
                    const el = document.getElementById(link.href.substring(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-400 hover:text-white text-sm transition-colors font-medium"
                  whileHover={{ x: 4 }}
                >
                  {link.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© 2026 Twinstitute. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
