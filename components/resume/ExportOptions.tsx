'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileJson, BookOpen, Loader } from 'lucide-react'
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
  recommended?: boolean
}> = [
  {
    format: 'pdf-styled',
    name: 'PDF (Styled)',
    description: 'Beautiful formatted PDF with colors and styling',
    icon: <FileText size={20} />,
    recommended: true,
  },
  {
    format: 'pdf-plain',
    name: 'PDF (Plain)',
    description: 'Simple ATS-friendly PDF without styling',
    icon: <FileText size={20} />,
  },
  {
    format: 'docx',
    name: 'Word Document',
    description: 'Editable .docx format for Microsoft Word',
    icon: <BookOpen size={20} />,
  },
  {
    format: 'txt',
    name: 'Plain Text',
    description: 'Simple text format for quick sharing',
    icon: <FileText size={20} />,
  },
  {
    format: 'json',
    name: 'JSON',
    description: 'Structured JSON for system integration',
    icon: <FileJson size={20} />,
  },
]

export function ExportOptions({ resume, onExport, isExporting }: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf-styled')
  const [isDownloading, setIsDownloading] = useState(false)

  const handleExport = async () => {
    setIsDownloading(true)
    try {
      await onExport(selectedFormat)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">Export Resume</h3>
        <p className="text-sm text-slate-400">Download your resume in multiple formats</p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXPORT_OPTIONS.map((option) => (
          <motion.button
            key={option.format}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedFormat(option.format)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedFormat === option.format
                ? 'border-cyan-500 bg-slate-800/50'
                : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 ${
                  selectedFormat === option.format ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {option.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-200">{option.name}</h4>
                  {option.recommended && (
                    <span className="px-2 py-0.5 bg-green-900/50 text-green-300 text-xs rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{option.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Export Info */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          {selectedFormat === 'pdf-styled' &&
            '✓ Best for visual impression. Includes colors and formatting.'}
          {selectedFormat === 'pdf-plain' &&
            '✓ Best for ATS systems. Removes styling for maximum compatibility.'}
          {selectedFormat === 'docx' &&
            '✓ Best for editing. Open and modify in Microsoft Word or Google Docs.'}
          {selectedFormat === 'txt' &&
            '✓ Best for quick sharing. Universal compatibility.'}
          {selectedFormat === 'json' &&
            '✓ Best for integration. Structured data for system processing.'}
        </p>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || isDownloading}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isDownloading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Preparing Download...
          </>
        ) : (
          <>
            <Download size={20} />
            Download Resume
          </>
        )}
      </button>

      {/* File Size Info */}
      <p className="text-xs text-slate-500 text-center">
        Your resume contains {resume.skills.length} skills, {resume.experience.length} experiences, and{' '}
        {resume.projects.length} projects
      </p>
    </div>
  )
}
