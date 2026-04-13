'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Bell, User, LogOut, ChevronDown, Settings, HelpCircle } from 'lucide-react'

interface NavDropdownItems {
  label: string
  href: string
  icon?: React.ReactNode
  description?: string
}

interface NavCategory {
  name: string
  items: NavDropdownItems[]
}

const navigationCategories: NavCategory[] = [
  {
    name: 'Learning',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Labs & Tasks', href: '/dashboard/labs' },
      { label: 'Skills', href: '/dashboard/skills' },
      { label: 'Path & Roadmap', href: '/dashboard/roadmap' },
    ],
  },
  {
    name: 'Progress',
    items: [
      { label: 'Capability Twin', href: '/dashboard/twin' },
      { label: 'Milestone Tracking', href: '/dashboard/milestones' },
      { label: 'Semester Overview', href: '/dashboard/semesters' },
      { label: 'Strategy Signals', href: '/dashboard/strategy' },
    ],
  },
  {
    name: 'Portfolio',
    items: [
      { label: 'Project Portfolio', href: '/dashboard/projects' },
      { label: 'Proof of Work', href: '/dashboard/proof' },
      { label: 'Resume Builder', href: '/dashboard/resume' },
      { label: 'Transcript', href: '/dashboard/transcript' },
    ],
  },
  {
    name: 'Resources',
    items: [
      { label: 'Mentor Sessions', href: '/dashboard/mentor' },
      { label: 'Simulation Labs', href: '/dashboard/simulation' },
      { label: 'Analytics & Insights', href: '/dashboard/analytics' },
      { label: 'Recruiter Connect', href: '/dashboard/recruiter' },
    ],
  },
]

export default function TopNavigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false)
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8">
              <Image
                src="/Logo.png"
                alt="Twinstitute"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm font-bold text-white hidden sm:inline">Twinstitute</span>
          </Link>

          {/* Navigation Categories */}
          <div className="flex items-center gap-1">
            {navigationCategories.map((category) => (
              <div key={category.name} className="relative group">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === category.name ? null : category.name
                    )
                  }
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1 rounded-md hover:bg-gray-900/50"
                >
                  {category.name}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      openDropdown === category.name ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === category.name && (
                  <div className="absolute left-0 mt-0 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 z-50">
                    {category.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Section - Profile, Notifications, Logout */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfileMenu(false)
                }}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                  </div>
                  <div className="p-4 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold text-white truncate">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session?.user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        // Show help or documentation
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <HelpCircle size={16} />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-800 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors rounded-md"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
