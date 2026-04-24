'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  HelpCircle,
  Zap,
  BookOpen,
  Users,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Check,
  ArrowRight,
  Lightbulb,
  Shield,
  TrendingUp,
  Rocket,
  Code,
  Brain,
} from 'lucide-react'

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const cardHoverVariants = {
  hover: {
    y: -8,
    boxShadow: '0 20px 50px rgba(0, 217, 255, 0.15)',
    transition: { duration: 0.3 },
  },
}

// ─── FAQ ITEM COMPONENT ──────────────────────────────────────────────────
function FAQItem({
  question,
  answer,
  index,
}: {
  question: string
  answer: string
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border border-gray-800 rounded-lg overflow-hidden hover:border-blue-600/30 transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900/30 transition-colors"
      >
        <span className="text-left font-medium text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} className="text-blue-400 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-800"
          >
            <div className="px-6 py-4 text-gray-300 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── STAT CARD COMPONENT ────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color = 'from-blue-600/20 to-cyan-600/20',
}: {
  icon: React.ReactNode
  label: string
  value: string
  color?: string
}) {
  return (
    <motion.div
      whileHover="hover"
      variants={cardHoverVariants}
      className={`bg-gradient-to-br ${color} border border-gray-800 rounded-lg p-6`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-600/20 rounded-lg">{Icon}</div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── FEATURE CARD COMPONENT ────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover="hover"
      variants={cardHoverVariants}
      className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 group"
    >
      <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg w-fit mb-4 group-hover:from-blue-600/30 group-hover:to-cyan-600/30 transition-colors">
        {Icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ─── RESOURCE CARD COMPONENT ────────────────────────────────────────────
function ResourceCard({
  icon: Icon,
  title,
  description,
  link,
  external = false,
  index,
}: {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  external?: boolean
  index: number
}) {
  const Component = external ? 'a' : Link
  const props = external ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : { href: link }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Component
        {...props}
        className="block bg-gray-900/40 border border-gray-800 rounded-lg p-6 hover:border-blue-600/50 hover:bg-gray-900/60 transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg group-hover:from-blue-600/30 group-hover:to-cyan-600/30 transition-colors">
            {Icon}
          </div>
          <ArrowRight
            size={18}
            className="text-gray-500 group-hover:text-blue-400 transition-colors"
          />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </Component>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────
export default function HelpSupportPage() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'What is Twinstitute AI and how does it help me?',
      answer:
        'Twinstitute AI is an advanced platform that combines AI-powered mentorship, skill assessment, and career roadmapping. It helps you identify your strengths, develop in-demand skills, and create a personalized career strategy. Our AI analyzes your learning patterns and provides tailored recommendations to accelerate your professional growth.',
    },
    {
      question: 'How does the Capability Twin feature work?',
      answer:
        'The Capability Twin creates a digital profile of your professional capabilities by analyzing your skills, experience, and learning history. It continuously learns from your interactions and provides real-time insights about your strengths, areas for improvement, and personalized development recommendations.',
    },
    {
      question: 'Can I integrate my GitHub and LinkedIn accounts?',
      answer:
        'Yes! You can securely connect your GitHub and LinkedIn accounts in the Settings section. This allows Twinstitute AI to analyze your projects, contributions, and professional profile to provide more accurate assessments and personalized recommendations.',
    },
    {
      question: 'How is my data protected?',
      answer:
        'We follow enterprise-grade security standards including end-to-end encryption, secure OAuth integration, and GDPR compliance. Your data is stored securely and never shared with third parties without your explicit consent. You have full control over what data you share.',
    },
    {
      question: 'How can I track my progress?',
      answer:
        'Your dashboard provides comprehensive progress tracking through milestones, semester overviews, skill assessments, and strategy signals. You can view detailed analytics, track your learning velocity, and measure your growth against your personalized roadmap.',
    },
    {
      question: 'What if I encounter technical issues?',
      answer:
        'Visit our status page for known issues, or contact our support team using the channels below. For urgent technical matters, use the live chat feature. We also maintain detailed documentation and video tutorials in our Knowledge Base.',
    },
    {
      question: 'How do I update my profile and preferences?',
      answer:
        'Go to the Settings page in your dashboard to update your personal information, notification preferences, privacy settings, and integrations. All changes are saved automatically and reflected across the platform.',
    },
    {
      question: 'Is there a mobile app available?',
      answer:
        'Currently, Twinstitute AI is optimized for web and responsive on all devices. We are developing native mobile apps for iOS and Android, which will be available soon. Subscribe to updates to be notified when they launch.',
    },
  ]

  return (
    <motion.div
      className="min-h-screen bg-black pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="relative px-4 md:px-8 py-12 md:py-20 border-b border-gray-800"
      >
        <div className="max-w-5xl mx-auto">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2 w-fit">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <HelpCircle size={24} className="text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                  Support Center
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Help & Support Center
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl">
                Welcome to Twinstitute AI support. Find answers, explore features, and get help whenever you need it.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
            >
              <StatCard
                icon={<BookOpen size={24} className="text-blue-400" />}
                label="Resources"
                value="50+"
                color="from-blue-600/10 to-blue-600/5"
              />
              <StatCard
                icon={<Users size={24} className="text-cyan-400" />}
                label="Active Users"
                value="10K+"
                color="from-cyan-600/10 to-cyan-600/5"
              />
              <StatCard
                icon={<Zap size={24} className="text-amber-400" />}
                label="Avg. Response"
                value="< 2h"
                color="from-amber-600/10 to-amber-600/5"
              />
              <StatCard
                icon={<Check size={24} className="text-green-400" />}
                label="Satisfaction"
                value="98%"
                color="from-green-600/10 to-green-600/5"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── QUICK START SECTION ──────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20 border-b border-gray-800"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Getting Started</h2>
            <p className="text-gray-400">Everything you need to know in the first 5 minutes</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <FeatureCard
              icon={<Rocket size={24} className="text-blue-400" />}
              title="Create Your Profile"
              description="Set up your account with educational background, skills, and career aspirations to get personalized recommendations."
              index={0}
            />
            <FeatureCard
              icon={<Brain size={24} className="text-cyan-400" />}
              title="Meet Your Twin"
              description="Explore your Capability Twin - your AI-powered digital twin that understands your strengths and growth potential."
              index={1}
            />
            <FeatureCard
              icon={<TrendingUp size={24} className="text-amber-400" />}
              title="Track Progress"
              description="Monitor your skill development, milestones, and career strategy through our comprehensive analytics dashboard."
              index={2}
            />
            <FeatureCard
              icon={<Code size={24} className="text-green-400" />}
              title="Connect Integrations"
              description="Link your GitHub and LinkedIn to unlock advanced insights about your professional work and networks."
              index={3}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ─── FEATURES INFOGRAPHIC SECTION ──────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20 border-b border-gray-800 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Powerful Features at Your Fingertips
            </h2>
            <p className="text-gray-400">Discover what makes Twinstitute AI your ultimate career companion</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Brain size={24} className="text-blue-400" />}
              title="AI Mentor"
              description="Get personalized guidance from our advanced AI mentor that understands your learning style and career goals."
              index={0}
            />
            <FeatureCard
              icon={<Shield size={24} className="text-cyan-400" />}
              title="Security First"
              description="Enterprise-grade encryption and privacy controls keep your data safe and under your complete control."
              index={1}
            />
            <FeatureCard
              icon={<Lightbulb size={24} className="text-amber-400" />}
              title="Smart Insights"
              description="Receive data-driven recommendations based on your skills, interests, and market demand analysis."
              index={2}
            />
            <FeatureCard
              icon={<TrendingUp size={24} className="text-green-400" />}
              title="Progress Analytics"
              description="Comprehensive dashboards show your growth trajectory, milestone achievements, and performance metrics."
              index={3}
            />
            <FeatureCard
              icon={<Users size={24} className="text-purple-400" />}
              title="Community"
              description="Connect with thousands of learners, share experiences, and grow together in a supportive ecosystem."
              index={4}
            />
            <FeatureCard
              icon={<Zap size={24} className="text-red-400" />}
              title="Real-time Updates"
              description="Stay up-to-date with the latest opportunities, skill trends, and career market insights instantly."
              index={5}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ─── POPULAR RESOURCES SECTION ──────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20 border-b border-gray-800"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Popular Resources</h2>
            <p className="text-gray-400">Quick access to the most helpful guides and documentation</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <ResourceCard
              icon={<BookOpen size={24} className="text-blue-400" />}
              title="Getting Started Guide"
              description="A comprehensive walkthrough to set up your account and complete your first learning task."
              link="#"
              index={0}
            />
            <ResourceCard
              icon={<Users size={24} className="text-cyan-400" />}
              title="Profile Setup Tips"
              description="Learn how to optimize your profile to get the best personalized recommendations from our AI."
              link="#"
              index={1}
            />
            <ResourceCard
              icon={<Code size={24} className="text-amber-400" />}
              title="Integration Guide"
              description="Step-by-step instructions for connecting GitHub, LinkedIn, and other professional platforms."
              link="#"
              index={2}
            />
            <ResourceCard
              icon={<TrendingUp size={24} className="text-green-400" />}
              title="Understanding Your Metrics"
              description="Deep dive into what your analytics mean and how to interpret your capability assessments."
              link="#"
              index={3}
            />
            <ResourceCard
              icon={<Shield size={24} className="text-purple-400" />}
              title="Privacy & Security"
              description="Everything you need to know about data protection, encryption, and privacy controls."
              link="#"
              index={4}
            />
            <ResourceCard
              icon={<Lightbulb size={24} className="text-red-400" />}
              title="Best Practices"
              description="Pro tips from successful users on how to maximize your learning and career growth."
              link="#"
              index={5}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ─── FAQ SECTION ──────────────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20 border-b border-gray-800"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-gray-400">
              Find answers to common questions about features, account, and troubleshooting
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </motion.div>

          {/* Can't Find Answer */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-600/30 rounded-lg p-6 text-center"
          >
            <p className="text-gray-300 mb-4">Still looking for answers?</p>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Contact Support Team
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── CONTACT SECTION ──────────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20 border-b border-gray-800"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Get in Touch</h2>
            <p className="text-gray-400">Our support team is here to help you succeed</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 text-center hover:border-blue-600/30 transition-colors group"
            >
              <div className="p-3 bg-blue-600/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-blue-600/30 transition-colors">
                <MessageSquare size={24} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-gray-400 text-sm mb-4">Instant support available 24/7</p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Start Chat →
              </button>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 text-center hover:border-blue-600/30 transition-colors group"
            >
              <div className="p-3 bg-cyan-600/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-cyan-600/30 transition-colors">
                <Mail size={24} className="text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Email Support</h3>
              <p className="text-gray-400 text-sm mb-4">Response within 2 hours</p>
              <a
                href="mailto:support@twinstitute.ai"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                support@twinstitute.ai
              </a>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 text-center hover:border-blue-600/30 transition-colors group"
            >
              <div className="p-3 bg-amber-600/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-amber-600/30 transition-colors">
                <BookOpen size={24} className="text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Knowledge Base</h3>
              <p className="text-gray-400 text-sm mb-4">Comprehensive documentation</p>
              <button className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                Browse Docs →
              </button>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 text-center hover:border-blue-600/30 transition-colors group"
            >
              <div className="p-3 bg-green-600/20 rounded-lg w-fit mx-auto mb-3 group-hover:bg-green-600/30 transition-colors">
                <Zap size={24} className="text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Status Page</h3>
              <p className="text-gray-400 text-sm mb-4">System health and updates</p>
              <button className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                Check Status →
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── SOCIAL & COMMUNITY SECTION ────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20 border-b border-gray-800 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Join Our Community</h2>
            <p className="text-gray-400">Connect with thousands of learners and stay updated</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              {
                icon: Github,
                label: 'GitHub',
                color: 'hover:text-gray-300',
                href: '#',
              },
              {
                icon: Linkedin,
                label: 'LinkedIn',
                color: 'hover:text-blue-400',
                href: '#',
              },
              {
                icon: Twitter,
                label: 'Twitter',
                color: 'hover:text-cyan-400',
                href: '#',
              },
              {
                icon: MessageSquare,
                label: 'Discord',
                color: 'hover:text-purple-400',
                href: '#',
              },
            ].map((social, index) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-4 bg-gray-900/40 border border-gray-800 rounded-lg ${social.color} transition-colors group`}
                >
                  <Icon size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── CTA SECTION ──────────────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        className="px-4 md:px-8 py-16 md:py-20"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-600/30 rounded-xl p-8 md:p-12 text-center space-y-6"
          >
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Accelerate Your Growth?</h2>
              <p className="text-lg text-gray-300">
                Start using Twinstitute AI today and unlock your full potential with AI-powered career guidance.
              </p>
            </div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
              <button className="px-8 py-3 border border-blue-600/50 hover:border-blue-600 text-blue-400 hover:text-blue-300 font-semibold rounded-lg transition-colors">
                Schedule Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  )
}
