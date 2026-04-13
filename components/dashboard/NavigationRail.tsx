'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FlaskConical, Cpu, Map, Dna, FileText, FolderKanban,
  FolderOpen, Users, Layers, Globe, Shield, Bot, CalendarDays, Settings,
  Zap
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',             path: '/dashboard',              icon: <LayoutDashboard size={18} /> },
  { id: 'labs',        label: 'Capability Labs',        path: '/dashboard/labs',         icon: <FlaskConical size={18} />, badge: 'NEW' },
  { id: 'simulation',  label: 'Outcome Simulation',     path: '/dashboard/simulation',   icon: <Cpu size={18} /> },
  { id: 'roadmap',     label: 'Formation Roadmap',      path: '/dashboard/roadmap',      icon: <Map size={18} /> },
  { id: 'skills',      label: 'Skill Genome Graph',     path: '/dashboard/skills',       icon: <Dna size={18} /> },
  { id: 'resume',      label: 'Capability Profile',     path: '/dashboard/resume',       icon: <FileText size={18} /> },
  { id: 'portfolio',   label: 'Proof Portfolio',        path: '/dashboard/portfolio',    icon: <FolderKanban size={18} /> },
  { id: 'projects',    label: 'Project Lab',            path: '/dashboard/projects',     icon: <FolderOpen size={18} /> },
  { id: 'recruiter',   label: 'Evaluator Simulator',    path: '/dashboard/recruiter',    icon: <Users size={18} /> },
  { id: 'twin',        label: 'Digital Twin',           path: '/dashboard/twin',         icon: <Layers size={18} /> },
  { id: 'strategy',    label: 'Strategy Console',       path: '/dashboard/strategy',     icon: <Globe size={18} /> },
  { id: 'transcript',  label: 'Capability Transcript',  path: '/dashboard/transcript',   icon: <Shield size={18} /> },
  { id: 'proof',       label: 'Capability Proof',       path: '/dashboard/proof',        icon: <Zap size={18} /> },
  { id: 'mentor',      label: 'Mentor Panel',           path: '/dashboard/mentor',       icon: <Bot size={18} /> },
  { id: 'semesters',   label: 'Semesters',              path: '/dashboard/semesters',    icon: <CalendarDays size={18} /> },
  { id: 'institution', label: 'Institution Portal',     path: '/dashboard/institution',  icon: <LayoutDashboard size={18} /> },
  { id: 'settings',    label: 'Settings',               path: '/dashboard/settings',     icon: <Settings size={18} /> },
]

export default function NavigationRail() {
  const pathname = usePathname()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <nav className="w-[60px] bg-[#040810] border-r border-gray-800/60 flex flex-col py-3 h-screen sticky top-0 z-40 overflow-y-auto scrollbar-hide">
      {/* Logo */}
      <div className="px-2.5 mb-6 mt-1">
        <Link href="/dashboard" className="w-[38px] h-[38px] bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeOpacity="0.7"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeOpacity="0.7"/>
          </svg>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-gray-800/60 mb-3" />

      {/* Nav Items */}
      <div className="flex-1 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
          const isHovered = hoveredId === item.id

          return (
            <div key={item.id} className="relative">
              <Link
                href={item.path}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center relative
                  transition-all duration-150
                  ${isActive
                    ? 'bg-blue-600/15 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]'
                    : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800/50'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
                )}
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-[#040810]" />
                )}
              </Link>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  <div className="bg-gray-900 border border-gray-700/60 text-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-2xl shadow-black/50">
                    {item.label}
                    {item.badge && <span className="ml-2 px-1.5 py-0.5 bg-blue-600/30 text-blue-400 rounded text-[9px] font-bold">{item.badge}</span>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
