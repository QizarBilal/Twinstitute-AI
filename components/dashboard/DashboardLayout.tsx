'use client'

import { ReactNode } from 'react'
import NavigationRail from './NavigationRail'
import TopNavigationBar from './TopNavigationBar'
import AIAgentAssist from './AIAgentAssist'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <NavigationRail />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigationBar />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <AIAgentAssist />
    </div>
  )
}
