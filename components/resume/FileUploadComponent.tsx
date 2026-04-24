'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  File,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  Download,
  BarChart3,
} from 'lucide-react'

interface FileUploadProps {
  onAnalyze?: (data: any) => void
}

export default function FileUploadComponent({ onAnalyze }: FileUploadProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescFile, setJobDescFile] = useState<File | null>(null)
  const [jobDescText, setJobDescText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const jobDescInputRef = useRef<HTMLInputElement>(null)

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
      ]
      if (validTypes.includes(file.type)) {
        setResumeFile(file)
        setError(null)
      } else {
        setError('Please upload a PDF, DOCX, or image file')
      }
    }
  }

  const handleJobDescUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['application/pdf', 'text/plain']
      if (validTypes.includes(file.type)) {
        setJobDescFile(file)
        setError(null)
      } else {
        setError('Please upload a PDF or text file for job description')
      }
    }
  }

  const handleAnalyze = async () => {
    if (!resumeFile && !jobDescText) {
      setError('Please upload a resume or provide text')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      if (resumeFile) formData.append('resumeFile', resumeFile)
      if (jobDescFile) formData.append('jobDescriptionFile', jobDescFile)
      if (jobDescText) formData.append('jobDescription', jobDescText)

      const response = await fetch('/api/resume/analyze-file', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data.data)
        onAnalyze?.(data.data)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Failed to analyze files')
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Resume Upload Zone */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => resumeInputRef.current?.click()}
        className="relative group cursor-pointer"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl"
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 rounded-xl p-8 transition-all">
          <motion.div
            className="flex flex-col items-center gap-4"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 10, scale: 1.1 }}
              whileHover={{ rotate: 0, scale: 1.15 }}
              className="text-cyan-400"
            >
              <Upload className="w-12 h-12" />
            </motion.div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-100">
                Upload Your Resume
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                PDF, DOCX, or Image (PNG/JPG)
              </p>
            </div>
          </motion.div>

          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* Selected Resume File */}
      <AnimatePresence>
        {resumeFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-lg p-4 flex items-center justify-between"
          >
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ x: 5 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-green-400"
              >
                <File className="w-5 h-5" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-green-300">
                  {resumeFile.name}
                </p>
                <p className="text-xs text-green-400">
                  {(resumeFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setResumeFile(null)}
              className="text-green-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Description Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Job Description (optional)
        </label>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative"
        >
          <textarea
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            placeholder="Paste job description here or upload a file..."
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <motion.div
            className="absolute inset-0 border border-cyan-500/0 rounded-lg pointer-events-none"
            whileFocus={{ borderColor: 'rgba(0, 217, 255, 0.3)' }}
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => jobDescInputRef.current?.click()}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          or upload file
        </motion.button>

        <input
          ref={jobDescInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleJobDescUpload}
          className="hidden"
        />
      </div>

      {/* Job Desc File Selected */}
      <AnimatePresence>
        {jobDescFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/50 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <File className="w-4 h-4" />
              {jobDescFile.name}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setJobDescFile(null)}
              className="text-blue-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            variants={shakeVariants}
            className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyze Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAnalyze}
        disabled={isAnalyzing || (!resumeFile && !jobDescText)}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader className="w-5 h-5" />
            </motion.div>
            Analyzing...
          </>
        ) : (
          <>
            <BarChart3 className="w-5 h-5" />
            Analyze Resume
          </>
        )}
      </motion.button>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/20 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-100">
                Analysis Complete
              </h3>
            </div>

            {analysisResult.candidateName && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-300"
              >
                <p className="text-sm text-slate-400">Candidate</p>
                <p className="font-medium">{analysisResult.candidateName}</p>
              </motion.div>
            )}

            {analysisResult.jobMatch && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <p className="text-sm font-medium text-cyan-300">Job Match</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-xs text-slate-400">Role</p>
                    <p className="text-sm font-medium text-slate-100">
                      {analysisResult.jobMatch.targetRole}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-xs text-slate-400">Match Score</p>
                    <p className="text-sm font-medium text-cyan-400">
                      {analysisResult.jobMatch.matchPercentage}%
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {analysisResult.matchedSkills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-medium text-green-300 mb-2">
                  Matched Skills ({analysisResult.matchedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.matchedSkills.slice(0, 5).map((skill: string, i: number) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-green-900/40 border border-green-700/50 text-green-300 px-3 py-1 rounded text-xs font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {analysisResult.missingSkills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm font-medium text-yellow-300 mb-2">
                  Missing Skills ({analysisResult.missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills.slice(0, 5).map((skill: string, i: number) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-yellow-900/40 border border-yellow-700/50 text-yellow-300 px-3 py-1 rounded text-xs font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
