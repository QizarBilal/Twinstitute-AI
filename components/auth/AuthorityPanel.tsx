'use client'

import { useState } from 'react'

interface AuthorityPanelProps {
  position: 'left' | 'right'
}

export default function AuthorityPanel({ position }: AuthorityPanelProps) {
  return (
    <div className="relative bg-gray-950 overflow-hidden flex items-center justify-center p-16">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"/>
      
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px),
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
          backgroundSize: '32px 32px',
          animation: 'drift 60s linear infinite'
        }}
      />

      <style jsx>{`
        @keyframes drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(32px, 32px); }
        }
      `}</style>

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full filter blur-3xl"/>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full filter blur-3xl"/>

      <div className="relative z-10 max-w-md space-y-8">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white leading-tight">
            Enterprise Capability<br/>Institution Platform
          </h2>
        </div>

        <div className="space-y-4 border-l border-gray-800 pl-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-500"/>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Institutional Grade
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              SOC 2 Type II certified infrastructure with end-to-end encryption and adaptive security protocols
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-purple-500"/>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                AI-Powered Formation
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Advanced capability modeling using multi-agent institutional systems and real-time performance intelligence
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-500"/>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Enterprise Integration
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Seamless deployment with SSO federation, SCIM provisioning, and compliance reporting
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800">
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>ISO 27001 certified • GDPR compliant • 99.9% uptime SLA</span>
          </div>
        </div>
      </div>
    </div>
  )
}
