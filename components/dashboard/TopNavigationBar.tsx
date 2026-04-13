'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Bell, ChevronDown, Zap } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/system/apiClient'
import {
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_SUGGESTIONS_DEBOUNCE_MS,
  DASHBOARD_QUICK_LINKS,
  CAPABILITY_SCORE_API_ENDPOINT,
  CAPABILITY_SCORE_RESPONSE_KEY,
  DEFAULT_USER_NAME,
  DEFAULT_USER_ROLE,
  MAX_NAME_INITIALS,
  ICON_SIZES,
} from '@/lib/constants/NAVIGATION_CONSTANTS'

// Types
interface UserSession {
  name?: string | null
  email?: string | null
}

interface SearchSuggestion {
  type: 'lab' | 'simulation' | 'skill' | 'twin'
  label: string
  href: string
  color: string
  bgColor: string
}

// Helper Functions
function extractUserInitials(fullName: string, maxLength: number = MAX_NAME_INITIALS): string {
  return fullName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, maxLength)
    .toUpperCase()
}

function filterSearchSuggestions(query: string, allLinks: readonly SearchSuggestion[]): SearchSuggestion[] {
  const normalizedQuery = query.toLowerCase()
  return allLinks.filter(link => link.label.toLowerCase().includes(normalizedQuery))
}

export default function TopNavigationBar() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [capabilityScore, setCapabilityScore] = useState<number | null>(null)
  const [isLoadingScore, setIsLoadingScore] = useState(true)

  const user: UserSession = session?.user || {}
  const userName = user.name || DEFAULT_USER_NAME
  const userInitials = extractUserInitials(userName)
  const userEmail = user.email || ''

  // Load capability score
  useEffect(() => {
    const loadCapabilityScore = async () => {
      try {
        setIsLoadingScore(true)
        const response = await apiClient.get(CAPABILITY_SCORE_API_ENDPOINT)
        const score = response.data?.[CAPABILITY_SCORE_RESPONSE_KEY]
        if (typeof score === 'number') {
          setCapabilityScore(score)
        }
      } catch (error) {
        console.error('Failed to load capability score:', error)
        setCapabilityScore(null)
      } finally {
        setIsLoadingScore(false)
      }
    }

    loadCapabilityScore()
  }, [])

  const visibleSuggestions: SearchSuggestion[] = 
    searchQuery.length >= SEARCH_MIN_QUERY_LENGTH
      ? filterSearchSuggestions(searchQuery, DASHBOARD_QUICK_LINKS as readonly SearchSuggestion[])
      : []

  const getSuggestionColorClass = (suggestionType: SearchSuggestion['type']): string => {
    const suggestion = DASHBOARD_QUICK_LINKS.find(link => link.type === suggestionType)
    return suggestion ? suggestion.bgColor : 'bg-gray-400'
  }

  return (
    <header className="h-14 bg-[#040810]/95 border-b border-gray-800/60 backdrop-blur-xl flex items-center px-5 gap-4 sticky top-0 z-30">
      {/* Page Context */}
      <div className="flex items-center gap-3 min-w-[160px]">
        <h2 className="text-[13px] font-bold text-gray-100 tracking-tight">Dashboard Navigation</h2>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-800" />

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <div
          className={`relative flex items-center bg-gray-900/60 border rounded-xl transition-all duration-200 ${
            isSearchFocused
              ? 'border-blue-500/50 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]'
              : 'border-gray-800'
          }`}
        >
          <Search className="absolute left-3 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), SEARCH_SUGGESTIONS_DEBOUNCE_MS)}
            placeholder="Search labs, simulations, intelligence..."
            className="w-full h-9 bg-transparent pl-9 pr-3 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[9px] text-gray-500 font-mono hidden sm:block">
            ⌘K
          </kbd>
        </div>

        {isSearchFocused && visibleSuggestions.length > 0 && (
          <div className="absolute top-full mt-1.5 w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
            {visibleSuggestions.map((suggestion) => (
              <Link
                key={suggestion.type}
                href={suggestion.href}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/60 border-b border-gray-800/40 last:border-0 group"
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getSuggestionColorClass(suggestion.type)}`} />
                <span className="text-[13px] text-gray-300 group-hover:text-white transition-colors">
                  {suggestion.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Capability Score Pill */}
        {capabilityScore !== null && !isLoadingScore && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
            <Zap className={`w-3 h-3 text-blue-400`} />
            <span className="text-[11px] font-black text-blue-400 tracking-wider">
              {capabilityScore}
              <span className="text-blue-600/80">/{CAPABILITY_SCORE_MAX}</span>
            </span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all">
          <Bell size={ICON_SIZES.default} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#040810]" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-800" />

        {/* User Profile Menu */}
        <button className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-gray-900/50 border border-transparent hover:border-gray-800 transition-all group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-[0_0_10px_rgba(37,99,235,0.3)]">
            {userInitials}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[12px] font-semibold text-gray-200 leading-none">
              {userName.split(' ')[0]}
            </span>
            <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider leading-none mt-0.5">
              {DEFAULT_USER_ROLE}
            </span>
          </div>
          <ChevronDown size={ICON_SIZES.small} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
        </button>
      </div>
    </header>
  )
}
