'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bell, Lock, Save, Github, Linkedin, AlertTriangle, Edit2, Check, X, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load heavy component
const ProfileOptimizationDashboard = dynamic(
  () => import('@/components/dashboard/ProfileOptimizationDashboard'),
  { loading: () => <div className="h-40 bg-gray-900/50 border border-gray-800 rounded-lg animate-pulse" /> }
)

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// ─── MEMOIZED TOAST NOTIFICATION COMPONENT ──────────────────────────────
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const Toast = memo(function Toast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
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
})

// ─── MEMOIZED SKELETON LOADER ────────────────────────────────────────────
const SkeletonField = memo(function SkeletonField() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
      <div className="h-10 bg-gray-800 rounded animate-pulse" />
    </div>
  )
})

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
  selectedRole?: string
  selectedDomain?: string
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

  // ─── INTEGRATIONS STATE ──────────────────────────────────────────────
  const [integrations, setIntegrations] = useState<Record<string, any>>({
    github: { isConnected: false, isLoading: false },
    linkedin: { isConnected: false, isLoading: false },
    leetcode: { isConnected: false, isLoading: false, username: '' },
  })
  const [leetcodeInput, setLeetcodeInput] = useState('')
  const [showLeetcodeInput, setShowLeetcodeInput] = useState(false)
  const [linkedinInput, setLinkedinInput] = useState('')
  const [showLinkedinManual, setShowLinkedinManual] = useState(false)

  // ─── LOAD PROFILE & INTEGRATIONS IN PARALLEL ──────────────────────────
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadProfile = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal,
      })

      if (!res.ok) throw new Error('Failed to fetch profile')

      const data = await res.json()
      setProfile(data)
      setEditData(data)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        showToast('Failed to load profile', 'error')
        console.error('Profile load error:', error)
      }
    }
  }, [])

  const loadIntegrations = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch('/api/integrations/status', { signal })
      if (res.ok) {
        const data = await res.json()
        const integrationsMap: Record<string, any> = {
          github: { isConnected: false, isLoading: false },
          linkedin: { isConnected: false, isLoading: false },
          leetcode: { isConnected: false, isLoading: false, username: '' },
        }

        data.data.forEach((integration: any) => {
          integrationsMap[integration.platform] = {
            isConnected: integration.isConnected,
            isLoading: false,
            username: integration.platformUsername || '',
            lastSynced: integration.lastSyncedAt,
          }
        })

        setIntegrations(integrationsMap)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to load integrations:', error)
      }
    }
  }, [])

  // ─── INITIAL DATA LOAD (PARALLEL) ──────────────────────────────────
  useEffect(() => {
    setIsLoading(true)
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    // Load profile and integrations in parallel
    Promise.all([
      loadProfile(signal),
      loadIntegrations(signal)
    ]).finally(() => {
      setIsLoading(false)
    })

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search)
    const successPlatform = params.get('integration_success')
    const errorPlatform = params.get('integration_error')
    const errorMessage = params.get('message')

    if (successPlatform) {
      showToast(`${successPlatform} connected successfully!`, 'success')
      setIntegrations(prev => ({
        ...prev,
        [successPlatform]: { ...prev[successPlatform], isConnected: true, isLoading: false },
      }))
      window.history.replaceState({}, document.title, '/dashboard/settings')
    }

    if (errorPlatform) {
      showToast(`Failed to connect ${errorPlatform}: ${errorMessage || 'Unknown error'}`, 'error')
      setIntegrations(prev => ({
        ...prev,
        [errorPlatform]: { ...prev[errorPlatform], isLoading: false },
      }))
      window.history.replaceState({}, document.title, '/dashboard/settings')
    }

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [loadProfile, loadIntegrations])

  const handleConnectOAuth = useCallback(async (platform: 'github' | 'linkedin') => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: { ...prev[platform], isLoading: true },
    }))

    try {
      window.location.href = `/api/integrations/${platform}/auth`
    } catch (error) {
      showToast(`Failed to connect ${platform}`, 'error')
      setIntegrations(prev => ({
        ...prev,
        [platform]: { ...prev[platform], isLoading: false },
      }))
    }
  }, [])

  const handleConnectLeetCode = useCallback(async () => {
    if (!leetcodeInput.trim()) {
      showToast('Please enter a LeetCode username', 'error')
      return
    }

    setIntegrations(prev => ({
      ...prev,
      leetcode: { ...prev.leetcode, isLoading: true },
    }))

    try {
      const res = await fetch('/api/integrations/leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: leetcodeInput.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to connect LeetCode')
      }

      showToast('LeetCode connected successfully!', 'success')
      setIntegrations(prev => ({
        ...prev,
        leetcode: {
          isConnected: true,
          isLoading: false,
          username: leetcodeInput.trim(),
        },
      }))
      setLeetcodeInput('')
      setShowLeetcodeInput(false)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to connect LeetCode', 'error')
      setIntegrations(prev => ({
        ...prev,
        leetcode: { ...prev.leetcode, isLoading: false },
      }))
    }
  }, [leetcodeInput])

  const handleConnectLinkedInManual = useCallback(async () => {
    if (!linkedinInput.trim()) {
      showToast('Please enter a LinkedIn profile URL or username', 'error')
      return
    }

    setIntegrations(prev => ({
      ...prev,
      linkedin: { ...prev.linkedin, isLoading: true },
    }))

    try {
      const res = await fetch('/api/integrations/linkedin/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl: linkedinInput.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to connect LinkedIn')
      }

      showToast('LinkedIn profile connected successfully!', 'success')
      setIntegrations(prev => ({
        ...prev,
        linkedin: {
          isConnected: true,
          isLoading: false,
        },
      }))
      setLinkedinInput('')
      setShowLinkedinManual(false)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to connect LinkedIn', 'error')
      setIntegrations(prev => ({
        ...prev,
        linkedin: { ...prev.linkedin, isLoading: false },
      }))
    }
  }, [linkedinInput])

  const handleDisconnect = useCallback(async (platform: 'github' | 'linkedin' | 'leetcode') => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return

    try {
      await fetch(`/api/integrations/status`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      showToast(`${platform} disconnected successfully`, 'success')
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          isConnected: false,
          isLoading: false,
          username: '',
        },
      }))
    } catch (error) {
      showToast('Failed to disconnect', 'error')
    }
  }, [])

  // ─── CHECK FOR OAUTH CALLBACK (HANDLED IN MAIN USEEFFECT) ─────────────

  // ─── MEMOIZED TOAST & UTILITY FUNCTIONS ────────────────────────────────
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const validateProfile = useCallback((data: Partial<UserProfile>): boolean => {
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
  }, [])

  const handleSave = useCallback(async () => {
    if (!validateProfile(editData)) {
      showToast('Please fix validation errors', 'error')
      return
    }

    try {
      setIsSaving(true)

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
  }, [editData, validateProfile, showToast])

  const handleEdit = useCallback(() => {
    setEditData(profile || {})
    setErrors({})
    setIsEditing(true)
  }, [profile])

  const handleCancel = useCallback(() => {
    setEditData(profile || {})
    setErrors({})
    setIsEditing(false)
  }, [profile])

  const handleFieldChange = useCallback((field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  // ─── SETTINGS STATE ───────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    activityUpdates: true,
    strictMode: true,
  })

  // ─── AGENT CONFIGURATION STATE ────────────────────────────────────────
  const [agentMode, setAgentMode] = useState<'strict' | 'balanced' | 'encouraging'>('strict')
  const [isResettingTwin, setIsResettingTwin] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmStep, setResetConfirmStep] = useState<'confirm' | 'verify'>(
    'confirm'
  )
  const [resetVerificationInput, setResetVerificationInput] = useState('')

  const handleToggle = useCallback((key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleAgentModeChange = useCallback((mode: 'strict' | 'balanced' | 'encouraging') => {
    setAgentMode(mode)
    showToast(`Agent mode changed to ${mode === 'strict' ? 'Strict Mode' : mode === 'balanced' ? 'Balanced Mentorship' : 'Encouraging Beginner'}`, 'success')
  }, [showToast])

  const handleResetDigitalTwin = useCallback(async () => {
    try {
      setIsResettingTwin(true)
      const res = await fetch('/api/twin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to reset Digital Twin')
      }

      showToast('Digital Twin has been successfully reset. Page will reload...', 'success')
      setShowResetConfirm(false)
      setResetConfirmStep('confirm')
      setResetVerificationInput('')
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to reset Digital Twin', 'error')
      console.error('Reset error:', error)
    } finally {
      setIsResettingTwin(false)
    }
  }, [showToast])

  const handleOpenResetDialog = useCallback(() => {
    setShowResetConfirm(true)
    setResetConfirmStep('confirm')
    setResetVerificationInput('')
  }, [])

  const handleCloseResetDialog = useCallback(() => {
    setShowResetConfirm(false)
    setResetConfirmStep('confirm')
    setResetVerificationInput('')
  }, [])

  const handleConfirmReset = useCallback(() => {
    setResetConfirmStep('verify')
    setResetVerificationInput('')
  }, [])

  const handleVerifyAndReset = useCallback(() => {
    if (resetVerificationInput !== 'RESET') {
      showToast('Incorrect verification code. Please type "RESET" exactly.', 'error')
      return
    }
    handleResetDigitalTwin()
  }, [resetVerificationInput, showToast, handleResetDigitalTwin])

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

          {/* Career Profile - Read-only */}
          <div className="dashboard-card">
            <h3 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider">Career Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <SkeletonField />
                  <SkeletonField />
                </>
              ) : (
                <>
                  {/* Finalized Role */}
                  <div>
                    <label className="stat-label">Finalized Role</label>
                    <div className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 flex items-center">
                      <p>{profile?.selectedRole || '—'}</p>
                    </div>
                  </div>

                  {/* Finalized Domain */}
                  <div>
                    <label className="stat-label">Finalized Domain</label>
                    <div className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 flex items-center">
                      <p>{profile?.selectedDomain || '—'}</p>
                    </div>
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
          {[
            { id: 'strict', label: 'Strict Mode (Enterprise Standard)', desc: 'Enterprise-grade feedback with detailed critiques' },
            { id: 'balanced', label: 'Balanced Mentorship', desc: 'Balanced approach to learning and guidance' },
            { id: 'encouraging', label: 'Encouraging Beginner', desc: 'Encouraging feedback for beginners' },
          ].map((option) => (
            <motion.button
              key={option.id}
              onClick={() => handleAgentModeChange(option.id as 'strict' | 'balanced' | 'encouraging')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full dashboard-card flex items-center justify-between cursor-pointer transition-all ${
                agentMode === option.id
                  ? 'border-blue-600/60 bg-blue-600/10'
                  : 'hover:border-gray-700 hover:bg-gray-800/50'
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-white mb-1">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                agentMode === option.id
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-600 hover:border-blue-400'
              }`}>
                {agentMode === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.button>
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
          {/* GitHub */}
          <div className="dashboard-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                <Github size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">GitHub Connector</p>
                <p className="text-xs text-gray-500 mt-1">
                  {integrations.github.isConnected ? '✓ Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                integrations.github.isConnected
                  ? handleDisconnect('github')
                  : handleConnectOAuth('github')
              }
              disabled={integrations.github.isLoading}
              className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors flex-shrink-0 ${
                integrations.github.isConnected
                  ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {integrations.github.isLoading
                ? 'Connecting...'
                : integrations.github.isConnected
                  ? 'Disconnect'
                  : 'Connect'}
            </button>
          </div>

          {/* LinkedIn - Unified Connection */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-600/30">
                  <Linkedin size={24} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">LinkedIn Connector</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {integrations.linkedin.isConnected ? '✓ Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              {integrations.linkedin.isConnected && (
                <button
                  onClick={() => handleDisconnect('linkedin')}
                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-semibold rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
            
            {!integrations.linkedin.isConnected ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-3">
                  Enter your LinkedIn profile URL or username
                </p>
                <input
                  type="text"
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                  placeholder="e.g., https://www.linkedin.com/in/yourprofile or yourprofile"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleConnectLinkedInManual}
                    disabled={integrations.linkedin.isLoading || !linkedinInput.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {integrations.linkedin.isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                <p className="text-xs text-green-400">
                  ✓ LinkedIn profile connected as: <span className="font-semibold">{integrations.linkedin.username || 'LinkedIn User'}</span>
                </p>
              </div>
            )}
          </div>

          {/* LeetCode */}
          <div className="dashboard-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-600/30">
                <span className="text-lg font-bold text-yellow-500">LC</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">LeetCode Connector</p>
                <p className="text-xs text-gray-500 mt-1">
                  {integrations.leetcode.isConnected
                    ? `✓ Connected (@${integrations.leetcode.username})`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            {integrations.leetcode.isConnected ? (
              <button
                onClick={() => handleDisconnect('leetcode')}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold text-sm rounded-lg transition-colors flex-shrink-0"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => setShowLeetcodeInput(!showLeetcodeInput)}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold text-sm rounded-lg transition-colors flex-shrink-0"
              >
                Connect
              </button>
            )}
          </div>

          {/* LeetCode Username Input */}
          {showLeetcodeInput && !integrations.leetcode.isConnected && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="dashboard-card">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">LeetCode Username</label>
                  <input
                    type="text"
                    value={leetcodeInput}
                    onChange={(e) => setLeetcodeInput(e.target.value)}
                    placeholder="Enter your LeetCode username"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConnectLeetCode}
                    disabled={integrations.leetcode.isLoading}
                    className="flex-1 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {integrations.leetcode.isLoading ? 'Connecting...' : 'Verify & Connect'}
                  </button>
                  <button
                    onClick={() => {
                      setShowLeetcodeInput(false)
                      setLeetcodeInput('')
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Profile Optimization Intelligence */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Github size={20} className="text-blue-600" />
            <h2 className="section-title">Career Optimization Intelligence</h2>
          </div>
          <p className="section-subtitle">AI-powered analysis to help you land your target role</p>
        </div>

        <ProfileOptimizationDashboard />
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

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="dashboard-card border-red-600/30 bg-red-950/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:border-red-600/50 hover:bg-red-950/25"
        >
          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">Reset Digital Twin</p>
            <p className="text-xs text-red-400/70">Permanently reset your capability twin and start over</p>
          </div>
          <motion.button
            onClick={handleOpenResetDialog}
            disabled={isResettingTwin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-red-600/30 hover:bg-red-600/40 border border-red-600/50 hover:border-red-600/80 text-red-400 hover:text-red-300 font-semibold text-sm rounded-lg transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResettingTwin ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                Resetting...
              </span>
            ) : (
              'Reset'
            )}
          </motion.button>
        </motion.div>

        {/* Warning Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-600/10 border border-red-600/30 rounded-lg"
        >
          <p className="text-xs text-red-400/80 leading-relaxed">
            <span className="font-semibold">Warning:</span> This action will permanently delete your Digital Twin and all associated data. You will need to go through the orientation process again. Make sure you have backups of any important information before proceeding.
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 py-8 border-t border-gray-800">
        <p>Settings • All changes are auto-saved • Your data is encrypted</p>
      </div>

      {/* CUSTOM RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseResetDialog}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleCloseResetDialog}
                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400 hover:text-white" />
                  </button>
                </div>

                {resetConfirmStep === 'confirm' ? (
                  <>
                    {/* STEP 1: CONFIRMATION */}
                    <div className="p-6 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/20 mx-auto">
                          <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white text-center">
                          Reset Digital Twin?
                        </h2>
                      </div>

                      <div className="space-y-3 text-sm text-gray-300">
                        <p className="text-center font-medium">
                          This action is <span className="text-red-400 font-semibold">PERMANENT</span> and
                          <span className="text-red-400 font-semibold"> CANNOT BE UNDONE</span>.
                        </p>

                        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                            Will be permanently deleted:
                          </p>
                          <ul className="space-y-1.5 text-xs text-gray-300">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Capability assessments
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Learning history
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Progress milestones
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Custom recommendations
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              All capability data
                            </li>
                          </ul>
                        </div>

                        <p className="text-center text-gray-400 text-xs italic">
                          You will need to complete the orientation process again.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          onClick={handleCloseResetDialog}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={handleConfirmReset}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <AlertTriangle size={16} />
                          I Understand, Continue
                        </motion.button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* STEP 2: VERIFICATION */}
                    <div className="p-6 space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/20 mx-auto">
                          <Lock size={24} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white text-center">
                          Final Verification
                        </h2>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm text-gray-300 text-center">
                          Type <span className="font-mono font-semibold text-red-400">RESET</span> below to confirm this irreversible action.
                        </p>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            value={resetVerificationInput}
                            onChange={(e) => setResetVerificationInput(e.target.value)}
                            placeholder="Type RESET here..."
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors font-mono text-center tracking-widest"
                            autoFocus
                            onKeyDown={(e) => {
                              if (
                                e.key === 'Enter' &&
                                resetVerificationInput === 'RESET'
                              ) {
                                handleVerifyAndReset()
                              }
                            }}
                          />
                        </div>

                        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                          <p className="text-xs text-blue-400 text-center">
                            💡 <span className="font-semibold">Tip:</span> Make sure you typed it exactly as shown
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          onClick={() => {
                            setResetConfirmStep('confirm')
                            setResetVerificationInput('')
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition-colors"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          onClick={handleVerifyAndReset}
                          disabled={
                            resetVerificationInput !== 'RESET' ||
                            isResettingTwin
                          }
                          whileHover={{
                            scale:
                              resetVerificationInput === 'RESET' ? 1.02 : 1,
                          }}
                          whileTap={{
                            scale:
                              resetVerificationInput === 'RESET' ? 0.98 : 1,
                          }}
                          className="flex-1 px-4 py-2.5 bg-red-600/80 hover:bg-red-600 disabled:bg-red-600/40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {isResettingTwin ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Resetting...
                            </>
                          ) : resetVerificationInput === 'RESET' ? (
                            <>
                              <Check size={16} />
                              Confirm Reset
                            </>
                          ) : (
                            'Confirm Reset'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
