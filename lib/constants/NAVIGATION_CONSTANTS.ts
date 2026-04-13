/**
 * Navigation and Dashboard Constants
 * Centralized configuration for dashboard navigation, styling, and behavior
 */

// Navigation Search
export const SEARCH_MIN_QUERY_LENGTH = 2
export const SEARCH_SUGGESTIONS_DEBOUNCE_MS = 200 // Delay before closing dropdown
export const MAX_SEARCH_SUGGESTIONS = 4

// Dashboard Suggestions/Quick Links
export const DASHBOARD_QUICK_LINKS = [
  {
    type: 'lab' as const,
    label: 'Start a Capability Lab Task',
    href: '/dashboard/labs',
    color: 'blue-400',
    bgColor: 'bg-blue-400',
  },
  {
    type: 'simulation' as const,
    label: 'Run Outcome Simulation',
    href: '/dashboard/simulation',
    color: 'purple-400',
    bgColor: 'bg-purple-400',
  },
  {
    type: 'skill' as const,
    label: 'Skill Genome Gap Analysis',
    href: '/dashboard/skills',
    color: 'emerald-400',
    bgColor: 'bg-emerald-400',
  },
  {
    type: 'twin' as const,
    label: 'View your Digital Twin',
    href: '/dashboard/twin',
    color: 'indigo-400',
    bgColor: 'bg-indigo-400',
  },
] as const

// Capability Score Display
export const CAPABILITY_SCORE_MAX = 100
export const CAPABILITY_SCORE_API_ENDPOINT = '/api/twin'
export const CAPABILITY_SCORE_RESPONSE_KEY = 'overallScore'

// User Profile Defaults
export const DEFAULT_USER_NAME = 'Learner'
export const DEFAULT_USER_ROLE = 'Member'
export const MAX_NAME_INITIALS = 2

// Icons
export const ICON_SIZES = {
  small: 12,
  default: 15,
  large: 20,
}
