'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bell, Lock, Save, Github, AlertTriangle, Edit2, Check, X, AlertCircle } from 'lucide-react'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// ─── TOAST NOTIFICATION COMPONENT ─────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

function Toast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const colors = {
    success: 'bg-green-600/10 border-green-600/30 text-green-400',
    error: 'bg-red-600/10 border-red-600/30 text-red-400',
    info: 'bg-blue-600/10 border-blue-600/30 text-blue-400',
  }

  const icons = {
    success: '✓',
    error: '⚠',
    info: 'ℹ',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${colors[toast.type]} border rounded-lg p-4 flex items-center justify-between gap-3 mb-3`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icons[toast.type]}</span>
        <p className="text-sm">{toast.message}</p>
      </div>
      <button onClick={onDismiss} className="text-lg font-bold hover:opacity-70">
        ×
      </button>
    </motion.div>
  )
}

// ─── SKELETON LOADER ──────────────────────────────────────────────────────
function SkeletonField() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
      <div className="h-10 bg-gray-800 rounded animate-pulse" />
    </div>
  )
}

interface UserProfile {
  id: string
  fullName: string
  email: string
  mobile: string
  college: string
  degree: string
  stream: string
  joinYear: number
  gradYear: number
  street: string
  city: string
  pincode: string
  state: string
  emailVerified: boolean
  updatedAt: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  
  // ─── PROFILE STATE ────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<Partial<UserProfile>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Toast[]>([])

  // ─── LOAD PROFILE ON MOUNT ────────────────────────────────────────────
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await res.json()
      setProfile(data)
      setEditData(data)
    } catch (error) {
      showToast('Failed to load profile', 'error')
      console.error('Profile load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ─── TOAST MANAGEMENT ────────────────────────────────────────────────
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // ─── VALIDATION ──────────────────────────────────────────────────────
  const validateProfile = (data: Partial<UserProfile>): boolean => {
    const newErrors: Record<string, string> = {}

    if (data.fullName && data.fullName.trim().length === 0) {
      newErrors.fullName = 'Name cannot be empty'
    }

    if (data.mobile && !/^\d{10}$/.test(data.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile must be 10 digits'
    }

    if (data.pincode && !/^\d{6}$/.test(data.pincode.replace(/\D/g, ''))) {
      newErrors.pincode = 'Pincode must be 6 digits'
    }

    if (data.joinYear && data.gradYear && data.joinYear >= data.gradYear) {
      newErrors.gradYear = 'Graduation year must be after joining year'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── SAVE PROFILE ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateProfile(editData)) {
      showToast('Please fix validation errors', 'error')
      return
    }

    try {
      setIsSaving(true)

      // Prepare data for submission
      const submitData = {
        fullName: editData.fullName,
        mobile: editData.mobile,
        college: editData.college,
        degree: editData.degree,
        stream: editData.stream,
        joinYear: editData.joinYear ? parseInt(editData.joinYear.toString()) : null,
        gradYear: editData.gradYear ? parseInt(editData.gradYear.toString()) : null,
        street: editData.street,
        city: editData.city,
        state: editData.state,
        pincode: editData.pincode,
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const updatedProfile = await res.json()
      setProfile(updatedProfile)
      setEditData(updatedProfile)
      setIsEditing(false)
      setErrors({})
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save profile'
      showToast(message, 'error')
      console.error('Save profile error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // ─── EDIT HANDLERS ────────────────────────────────────────────────────
  const handleEdit = () => {
    setEditData(profile || {})
    setErrors({})
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(profile || {})
    setErrors({})
    setIsEditing(false)
  }

  const handleFieldChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  // ─── SETTINGS STATE ───────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    activityUpdates: true,
    strictMode: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <motion.div
      className="px-8 py-8 space-y-8 max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
    >
      {/* Toast Container */}
      <div className="fixed top-8 right-8 z-50 w-96 max-w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage your account, preferences, and integrations</p>
      </motion.div>

      {/* ─── PROFILE SECTION ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="section-title">Complete Profile</h2>
            <p className="section-subtitle">Your comprehensive account and educational information</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              {isLoading ? 'Loading...' : 'Edit Profile'}
            </button>
          )}
        </div>

        {/* Validation Errors Display */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-600/10 border border-red-600/30 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-400 mb-2">Please fix these issues:</p>
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, msg]) => (
                  <li key={field} className="text-sm text-red-400">• {msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="dashboard-card">
            <h3 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <SkeletonField />
                  <SkeletonField />
                  <SkeletonField />
                </>
              ) : (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="stat-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.fullName || ''}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        className={`w-full mt-2 px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName ? 'border-red-600' : 'border-gray-700 focus:border-blue-600'
                        }`}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.fullName || '—'}</p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="stat-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="stat-label">Mobile Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.mobile || ''}
                        onChange={(e) => handleFieldChange('mobile', e.target.value)}
                        className={`w-full mt-2 px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.mobile ? 'border-red-600' : 'border-gray-700 focus:border-blue-600'
                        }`}
                        placeholder="10-digit mobile number"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.mobile || '—'}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Educational Information */}
          <div className="dashboard-card">
            <h3 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider">Educational Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <SkeletonField />
                  <SkeletonField />
                  <SkeletonField />
                  <SkeletonField />
                  <SkeletonField />
                </>
              ) : (
                <>
                  {/* College */}
                  <div>
                    <label className="stat-label">College / University</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.college || ''}
                        onChange={(e) => handleFieldChange('college', e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="e.g., IIT Delhi"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.college || '—'}</p>
                    )}
                  </div>

                  {/* Degree */}
                  <div>
                    <label className="stat-label">Degree</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.degree || ''}
                        onChange={(e) => handleFieldChange('degree', e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="e.g., B.Tech"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.degree || '—'}</p>
                    )}
                  </div>

                  {/* Stream */}
                  <div>
                    <label className="stat-label">Stream / Specialization</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.stream || ''}
                        onChange={(e) => handleFieldChange('stream', e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="e.g., Computer Science"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.stream || '—'}</p>
                    )}
                  </div>

                  {/* Joining Year */}
                  <div>
                    <label className="stat-label">Joining Year</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.joinYear || ''}
                        onChange={(e) => handleFieldChange('joinYear', e.target.value ? parseInt(e.target.value) : null)}
                        className={`w-full mt-2 px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.gradYear ? 'border-red-600' : 'border-gray-700 focus:border-blue-600'
                        }`}
                        placeholder="e.g., 2020"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.joinYear || '—'}</p>
                    )}
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label className="stat-label">Graduation Year</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.gradYear || ''}
                        onChange={(e) => handleFieldChange('gradYear', e.target.value ? parseInt(e.target.value) : null)}
                        className={`w-full mt-2 px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.gradYear ? 'border-red-600' : 'border-gray-700 focus:border-blue-600'
                        }`}
                        placeholder="e.g., 2024"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.gradYear || '—'}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="dashboard-card">
            <h3 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <div className="md:col-span-2">
                    <SkeletonField />
                  </div>
                  <SkeletonField />
                  <SkeletonField />
                  <SkeletonField />
                </>
              ) : (
                <>
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label className="stat-label">Street Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.street || ''}
                        onChange={(e) => handleFieldChange('street', e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="e.g., 123 Main St"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.street || '—'}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="stat-label">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.city || ''}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="e.g., Delhi"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.city || '—'}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="stat-label">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.state || ''}
                        onChange={(e) => handleFieldChange('state', e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none transition-colors"
                        placeholder="e.g., Delhi"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.state || '—'}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="stat-label">Pincode</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.pincode || ''}
                        onChange={(e) => handleFieldChange('pincode', e.target.value)}
                        className={`w-full mt-2 px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.pincode ? 'border-red-600' : 'border-gray-700 focus:border-blue-600'
                        }`}
                        placeholder="6-digit pincode"
                      />
                    ) : (
                      <p className="text-white mt-2">{profile?.pincode || '—'}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 pt-4"
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <Check size={16} />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:cursor-not-allowed border border-gray-800 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={20} className="text-blue-600" />
            <h2 className="section-title">Notifications</h2>
          </div>
          <p className="section-subtitle">Control how and when you receive updates</p>
        </div>

        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates about your progress' },
            { key: 'activityUpdates', label: 'Activity Updates', desc: 'Get notified about new recommendations and achievements' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications for urgent updates' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Learn about new features and promotions' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="dashboard-card flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button
                onClick={() => handleToggle(key as keyof typeof settings)}
                className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ml-4 ${
                  settings[key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings[key as keyof typeof settings] ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Agent Settings */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={20} className="text-blue-600" />
            <h2 className="section-title">Agent Configuration</h2>
          </div>
          <p className="section-subtitle">Control how strictly agents evaluate your work</p>
        </div>

        <div className="space-y-3">
          {['Strict Mode (Enterprise Standard)', 'Balanced Mentorship', 'Encouraging Beginner'].map((level, i) => (
            <div
              key={i}
              onClick={() => handleToggle(i === 0 ? 'strictMode' : 'strictMode')}
              className="dashboard-card flex items-center justify-between cursor-pointer hover:bg-gray-800/80"
            >
              <div>
                <p className="text-sm font-semibold text-white mb-1">{level}</p>
                <p className="text-xs text-gray-500">
                  {i === 0 && 'Enterprise-grade feedback with detailed critiques'}
                  {i === 1 && 'Balanced approach to learning and guidance'}
                  {i === 2 && 'Encouraging feedback for beginners'}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                i === 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
              }`}>
                {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integrations */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Github size={20} className="text-blue-600" />
            <h2 className="section-title">Integrations & Sync</h2>
          </div>
          <p className="section-subtitle">Connect external accounts to enrich your capability profile</p>
        </div>

        <div className="space-y-3">
          <div className="dashboard-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                <Github size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">GitHub Connector</p>
                <p className="text-xs text-gray-500 mt-1">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex-shrink-0">
              Connect
            </button>
          </div>

          <div className="dashboard-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-600/30">
                <span className="text-lg font-bold text-yellow-500">LC</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">LeetCode Connector</p>
                <p className="text-xs text-gray-500 mt-1">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold text-sm rounded-lg transition-colors flex-shrink-0">
              Connect
            </button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h2 className="section-title text-red-600">Danger Zone</h2>
          </div>
          <p className="section-subtitle">Irreversible actions that will affect your capability twin</p>
        </div>

        <div className="dashboard-card border-red-600/20 bg-red-950/10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">Reset Digital Twin</p>
            <p className="text-xs text-red-400/70">Permanently reset your capability twin and start over</p>
          </div>
          <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 font-semibold text-sm rounded-lg transition-colors flex-shrink-0">
            Reset
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 py-8 border-t border-gray-800">
        <p>Settings • All changes are auto-saved • Your data is encrypted</p>
      </div>
    </motion.div>
  )
}
