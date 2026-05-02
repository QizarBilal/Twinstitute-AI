'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, FileJson, BookOpen, Loader, Check, Zap, Users, Code, Share2 } from 'lucide-react'
import { ResumeData, ExportFormat } from '@/types/resume'

interface ExportOptionsProps {
  resume: ResumeData
  onExport: (format: ExportFormat) => Promise<void>
  isExporting: boolean
}

const EXPORT_OPTIONS: Array<{
  format: ExportFormat
  name: string
  description: string
  icon: React.ReactNode
  use_case: string
  icon_color: string
  recommended?: boolean
  best_for: string[]
}> = [
  {
    format: 'pdf-styled',
    name: 'PDF (Styled)',
    description: 'Beautiful formatted PDF with colors and styling',
    icon: <FileText size={24} />,
    use_case: 'Visual Impression',
    icon_color: 'from-rose-500 to-pink-500',
    best_for: ['Portfolios', 'Creative roles', 'Visual impact'],
    recommended: true,
  },
  {
    format: 'pdf-plain',
    name: 'PDF (Plain)',
    description: 'Simple ATS-friendly PDF without styling',
    icon: <FileText size={24} />,
    use_case: 'ATS Optimized',
    icon_color: 'from-cyan-500 to-blue-500',
    best_for: ['ATS systems', 'Most accurate parsing', 'Safe format'],
  },
  {
    format: 'docx',
    name: 'Word Document',
    description: 'Editable .docx format for Microsoft Word',
    icon: <BookOpen size={24} />,
    use_case: 'Editable Format',
    icon_color: 'from-blue-500 to-indigo-500',
    best_for: ['Editing', 'Google Docs compatible', 'Further customization'],
  },
  {
    format: 'txt',
    name: 'Plain Text',
    description: 'Simple text format for quick sharing',
    icon: <Share2 size={24} />,
    use_case: 'Quick Share',
    icon_color: 'from-gray-500 to-slate-500',
    best_for: ['Emails', 'Chat applications', 'Universal compatibility'],
  },
  {
    format: 'json',
    name: 'JSON',
    description: 'Structured JSON for system integration',
    icon: <Code size={24} />,
    use_case: 'System Integration',
    icon_color: 'from-amber-500 to-orange-500',
    best_for: ['APIs', 'Data systems', 'Database storage'],
  },
]


export function ExportOptions({ resume, onExport, isExporting }: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf-plain')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)

  const handleExport = async () => {
    setIsDownloading(true)
    setDownloadComplete(false)
    try {
      await onExport(selectedFormat)
      setDownloadComplete(true)
      setTimeout(() => setDownloadComplete(false), 3000)
    } finally {
      setIsDownloading(false)
    }
  }

  const selectedOption = EXPORT_OPTIONS.find(opt => opt.format === selectedFormat)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-amber-400" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Export Your Resume
          </h3>
        </div>
        <p className="text-sm text-slate-400">Choose your preferred format and download instantly</p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 gap-3">
        {EXPORT_OPTIONS.map((option, idx) => (
          <motion.button
            key={option.format}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFormat(option.format)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`group relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden ${
              selectedFormat === option.format
                ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 shadow-lg shadow-cyan-500/20'
                : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600/50 hover:bg-slate-800/30'
            }`}
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-opacity" />

            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                  selectedFormat === option.format
                    ? `bg-gradient-to-br ${option.icon_color} text-white shadow-lg`
                    : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-slate-100 text-base">{option.name}</h4>
                  {option.recommended && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-1 bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300 text-xs font-medium rounded-full border border-green-500/30 flex items-center gap-1"
                    >
                      <Zap size={12} />
                      Recommended
                    </motion.span>
                  )}
                  {selectedFormat === option.format && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Check className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-2">{option.description}</p>

                {/* Use case and best for */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">
                    {option.use_case}
                  </span>
                  {selectedFormat === option.format && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex gap-1"
                      >
                        {option.best_for.map((item) => (
                          <span
                            key={item}
                            className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded border border-cyan-700/50"
                          >
                            {item}
                          </span>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Format Info */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/50 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
              <div className="flex-1">
                <h5 className="font-semibold text-blue-300 mb-2">Why choose {selectedOption.name}?</h5>
                <p className="text-sm text-blue-200">
                  {selectedFormat === 'pdf-styled' &&
                    '✨ Perfect for making a strong visual impression. Includes all colors, fonts, and design elements. Best for applying directly to companies where design matters.'}
                  {selectedFormat === 'pdf-plain' &&
                    '🎯 Maximum ATS compatibility. Removes all styling and formatting to ensure every applicant tracking system can parse your resume accurately. Recommended for most applications.'}
                  {selectedFormat === 'docx' &&
                    '✏️ Fully editable format. Open and modify in Microsoft Word, Google Docs, or any word processor. Perfect for last-minute tweaks before sending.'}
                  {selectedFormat === 'txt' &&
                    '📤 Universal format that works everywhere. No compatibility issues. Great for pasting into application portals and email bodies.'}
                  {selectedFormat === 'json' &&
                    '⚙️ Structured data format for developers and system integration. Perfect for building custom applications or storing in databases.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">{resume.skills.length}</div>
          <div className="text-xs text-slate-400 mt-1">Skills</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{resume.experience.length}</div>
          <div className="text-xs text-slate-400 mt-1">Experiences</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{resume.projects.length}</div>
          <div className="text-xs text-slate-400 mt-1">Projects</div>
        </motion.div>
      </div>

      {/* Export Button */}
      <motion.button
        whileHover={!isDownloading ? { scale: 1.02 } : {}}
        whileTap={!isDownloading ? { scale: 0.98 } : {}}
        onClick={handleExport}
        disabled={isExporting || isDownloading}
        className={`w-full px-6 py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-base ${
          downloadComplete
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/50'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {downloadComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Download Complete!
            </motion.div>
          ) : isDownloading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader className="w-5 h-5 animate-spin" />
              Preparing Your Resume...
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Download size={20} />
              Download Resume
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Footer Info */}
      <div className="space-y-3">
        <p className="text-xs text-slate-500 text-center">
          💾 Your resume is automatically saved as you edit
        </p>
        <div className="flex items-center gap-2 justify-center text-xs text-slate-400 bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
          <Users size={14} />
          <span>Pro tip: Export to PDF (Plain) for best ATS compatibility</span>
        </div>
      </div>
    </div>
  )
}
