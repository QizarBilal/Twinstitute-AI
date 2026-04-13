/**
 * WORKFLOW INPUT FORM
 * Handles different input types for each workflow
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, ChevronDown } from 'lucide-react'

interface WorkflowInputFormProps {
  type: 'target-role' | 'interest-assessment' | 'skill-entry' | 'workflow-selection' | 'role-selection'
  onSubmit: (data: any) => void
  isLoading: boolean
  options?: any[]
  placeholder?: string
}

export default function WorkflowInputForm({
  type,
  onSubmit,
  isLoading,
  options,
  placeholder,
}: WorkflowInputFormProps) {
  const [formData, setFormData] = useState<any>({
    targetRole: '',
    coding: 5,
    creativity: 5,
    systems: 5,
    skills: [],
    skillLevel: 'intermediate',
    background: '',
    currentSkills: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Workflow 1: Clear Goal - Target Role & Skills Input
  if (type === 'target-role' || type === 'skill-entry') {
    return (
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-2">Target Role/Domain</label>
          <input
            type="text"
            value={formData.targetRole}
            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
            placeholder="e.g., Backend Engineer, Data Scientist, Product Manager"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Your Current Skills</label>
          <textarea
            value={formData.currentSkills}
            onChange={(e) => setFormData({ ...formData, currentSkills: e.target.value })}
            placeholder="e.g., Python, JavaScript, SQL, System Design, etc. (comma separated)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Skill Level</label>
          <select
            value={formData.skillLevel}
            onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          >
            <option value="basic">Basic (Learning fundamentals)</option>
            <option value="intermediate">Intermediate (Can build projects)</option>
            <option value="advanced">Advanced (Expert level)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.targetRole || !formData.currentSkills}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Analyze My Fit
        </button>
      </motion.form>
    )
  }

  // Workflow 3: Discover - Interest Assessment (Original - 3 sliders)
  if (type === 'interest-assessment') {
    return (
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Coding</label>
            <span className="text-cyan-400 font-semibold">{formData.coding}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.coding}
            onChange={(e) => setFormData({ ...formData, coding: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Creativity & Design</label>
            <span className="text-cyan-400 font-semibold">{formData.creativity}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.creativity}
            onChange={(e) => setFormData({ ...formData, creativity: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Systems & Logic</label>
            <span className="text-cyan-400 font-semibold">{formData.systems}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.systems}
            onChange={(e) => setFormData({ ...formData, systems: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Academic Background</label>
          <input
            type="text"
            value={formData.background}
            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
            placeholder="e.g., Computer Science, Electronics, Self-taught, etc."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Get My Recommendations
        </button>
      </motion.form>
    )
  }

  // Workflow 3: Discover - Expanded Interest Assessment (8 questions)
  if (type === 'interest-assessment-expanded') {
    const [expandedData, setExpandedData] = React.useState({
      coding: 5,
      creativity: 5,
      systems: 5,
      problemSolving: 5,
      communication: 5,
      learning: 5,
      background: '',
      skills: '',
    })

    const handleExpandedSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(expandedData)
    }

    return (
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleExpandedSubmit}
        className="space-y-6 max-h-[600px] overflow-y-auto pr-2"
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Coding</label>
            <span className="text-cyan-400 font-semibold">{expandedData.coding}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={expandedData.coding}
            onChange={(e) => setExpandedData({ ...expandedData, coding: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Creativity & Design</label>
            <span className="text-cyan-400 font-semibold">{expandedData.creativity}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={expandedData.creativity}
            onChange={(e) => setExpandedData({ ...expandedData, creativity: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Systems & Logic</label>
            <span className="text-cyan-400 font-semibold">{expandedData.systems}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={expandedData.systems}
            onChange={(e) => setExpandedData({ ...expandedData, systems: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Problem-Solving & Puzzles</label>
            <span className="text-cyan-400 font-semibold">{expandedData.problemSolving}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={expandedData.problemSolving}
            onChange={(e) => setExpandedData({ ...expandedData, problemSolving: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Communication & Teamwork</label>
            <span className="text-cyan-400 font-semibold">{expandedData.communication}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={expandedData.communication}
            onChange={(e) => setExpandedData({ ...expandedData, communication: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Interest in Learning New Technologies</label>
            <span className="text-cyan-400 font-semibold">{expandedData.learning}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={expandedData.learning}
            onChange={(e) => setExpandedData({ ...expandedData, learning: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Your Academic Background</label>
          <input
            type="text"
            value={expandedData.background}
            onChange={(e) => setExpandedData({ ...expandedData, background: e.target.value })}
            placeholder="e.g., Computer Science, Electronics, Business, Self-taught"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Your Existing Skills (comma separated)</label>
          <input
            type="text"
            value={expandedData.skills}
            onChange={(e) => setExpandedData({ ...expandedData, skills: e.target.value })}
            placeholder="e.g., Python, JavaScript, Figma, Leadership"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Get My Personalized Recommendations
        </button>
      </motion.form>
    )
  }

  // Workflow 2: Selection options (for other input types)
  if (type === 'workflow-selection' && options) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onSubmit(option.id)
            }}
            disabled={isLoading}
            className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-cyan-500 hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            <div className="font-semibold text-sm text-white">{option.label}</div>
            <div className="text-xs text-gray-400 mt-1">{option.description}</div>
          </button>
        ))}
      </motion.div>
    )
  }

  return null
}
