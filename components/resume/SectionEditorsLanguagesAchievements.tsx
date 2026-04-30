'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react'
import { Language, Achievement } from '@/types/resume'

interface LanguagesEditorProps {
  languages: Language[]
  onAddLanguage: (language: Language) => void
  onUpdateLanguage: (language: Language) => void
  onDeleteLanguage: (id: string) => void
}

interface AchievementsEditorProps {
  achievements: Achievement[]
  onAddAchievement: (achievement: Achievement) => void
  onUpdateAchievement: (achievement: Achievement) => void
  onDeleteAchievement: (id: string) => void
}

// LANGUAGES EDITOR
export function LanguagesEditor({
  languages,
  onAddLanguage,
  onUpdateLanguage,
  onDeleteLanguage,
}: LanguagesEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ language: '', proficiency: 'Intermediate' as const })

  const handleAdd = () => {
    if (!formData.language.trim()) return
    onAddLanguage({
      id: Date.now().toString(),
      language: formData.language,
      proficiency: formData.proficiency as Language['proficiency'],
    })
    setFormData({ language: '', proficiency: 'Intermediate' })
    setIsAdding(false)
  }

  const handleEdit = (lang: Language) => {
    setEditingId(lang.id)
    setFormData({ language: lang.language, proficiency: lang.proficiency })
  }

  const handleUpdate = (id: string) => {
    if (!formData.language.trim()) return
    onUpdateLanguage({
      id,
      language: formData.language,
      proficiency: formData.proficiency as Language['proficiency'],
    })
    setEditingId(null)
    setFormData({ language: '', proficiency: 'Intermediate' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Languages</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Language
        </button>
      </div>

      {/* Languages List */}
      <div className="space-y-2">
        <AnimatePresence>
          {languages.map((lang) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              {editingId === lang.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="Language name"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={formData.proficiency}
                    onChange={(e) => setFormData({ ...formData, proficiency: e.target.value as Language['proficiency'] })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option>Elementary</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Fluent</option>
                    <option>Native</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(lang.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-green-600/30 hover:bg-green-600/50 text-green-300 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setFormData({ language: '', proficiency: 'Intermediate' })
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600/30 hover:bg-slate-600/50 text-slate-300 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{lang.language}</p>
                    <p className="text-xs text-slate-400">{lang.proficiency}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(lang)}
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLanguage(lang.id)}
                      className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-slate-800/50 border border-blue-500/30 space-y-2"
        >
          <input
            type="text"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            placeholder="e.g., English, Spanish, Mandarin"
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
          />
          <select
            value={formData.proficiency}
            onChange={(e) => setFormData({ ...formData, proficiency: e.target.value as Language['proficiency'] })}
            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option>Elementary</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Fluent</option>
            <option>Native</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-1.5 rounded-lg bg-green-600/30 hover:bg-green-600/50 text-green-300 text-xs flex items-center justify-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setFormData({ language: '', proficiency: 'Intermediate' })
              }}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600/30 hover:bg-slate-600/50 text-slate-300 text-xs flex items-center justify-center gap-1 transition-all"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      {languages.length === 0 && !isAdding && (
        <p className="text-xs text-slate-500 text-center py-4">No languages added yet</p>
      )}
    </div>
  )
}

// ACHIEVEMENTS EDITOR
export function AchievementsEditor({
  achievements,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
}: AchievementsEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'Award' as const,
  })

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.description.trim()) return
    onAddAchievement({
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      category: formData.category as Achievement['category'],
    })
    setFormData({ title: '', description: '', date: '', category: 'Award' })
    setIsAdding(false)
  }

  const handleEdit = (ach: Achievement) => {
    setEditingId(ach.id)
    setFormData({
      title: ach.title,
      description: ach.description,
      date: ach.date,
      category: ach.category || 'Award',
    })
  }

  const handleUpdate = (id: string) => {
    if (!formData.title.trim() || !formData.description.trim()) return
    onUpdateAchievement({
      id,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      category: formData.category as Achievement['category'],
    })
    setEditingId(null)
    setFormData({ title: '', description: '', date: '', category: 'Award' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Achievements</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Achievement
        </button>
      </div>

      {/* Achievements List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {achievements.map((ach) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              {editingId === ach.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Achievement title"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Achievement['category'] })}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option>Award</option>
                      <option>Recognition</option>
                      <option>Publication</option>
                      <option>Speaking</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(ach.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-green-600/30 hover:bg-green-600/50 text-green-300 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setFormData({ title: '', description: '', date: '', category: 'Award' })
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600/30 hover:bg-slate-600/50 text-slate-300 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ach.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{ach.description}</p>
                    <div className="flex gap-2 mt-2">
                      {ach.date && <span className="text-xs text-slate-500">{ach.date}</span>}
                      {ach.category && <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">{ach.category}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(ach)}
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAchievement(ach.id)}
                      className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-slate-800/50 border border-blue-500/30 space-y-2"
        >
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Best Engineer Award 2025"
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the achievement..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Achievement['category'] })}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option>Award</option>
              <option>Recognition</option>
              <option>Publication</option>
              <option>Speaking</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-1.5 rounded-lg bg-green-600/30 hover:bg-green-600/50 text-green-300 text-xs flex items-center justify-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setFormData({ title: '', description: '', date: '', category: 'Award' })
              }}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-600/30 hover:bg-slate-600/50 text-slate-300 text-xs flex items-center justify-center gap-1 transition-all"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      {achievements.length === 0 && !isAdding && (
        <p className="text-xs text-slate-500 text-center py-4">No achievements added yet</p>
      )}
    </div>
  )
}
