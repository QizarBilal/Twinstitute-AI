'use client'

import React from 'react'
import { ResumeData } from '@/types/resume'

interface TemplateComponentProps {
  resume: ResumeData
  enabledSections: {
    contact: boolean
    summary: boolean
    experience: boolean
    projects: boolean
    skills: boolean
    education: boolean
    certifications: boolean
    languages: boolean
    achievements: boolean
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 1: MODERN ATS (Already exists - single column, clean)
// ═══════════════════════════════════════════════════════════════
export function Template1ModernATS({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900 font-sans" style={{ width: '794px', minHeight: '1122px' }}>
      {enabledSections.contact && (
        <div className="px-10 py-8 border-b-4 border-blue-600">
          <h1 className="text-3xl font-bold mb-1 text-blue-600">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-lg font-semibold text-blue-800 mb-4">{resume.contact.title}</p>}
          <div className="text-xs flex flex-wrap gap-3">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <><span>•</span><span>{resume.contact.phone}</span></>}
            {resume.contact.location && <><span>•</span><span>{resume.contact.location}</span></>}
            {resume.contact.linkedin && <><span>•</span><span>{resume.contact.linkedin}</span></>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-6 space-y-4">
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-blue-800 uppercase tracking-wide">Professional Summary</h2>
            <p className="text-xs leading-relaxed">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-blue-800 uppercase tracking-wide">Experience</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-2.5 pb-2 border-b border-gray-300 last:border-0">
                <div className="flex justify-between mb-0.5">
                  <h3 className="font-bold text-xs">{exp.title}</h3>
                  <span className="text-xs text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                <p className="text-xs font-semibold text-blue-700">{exp.company}</p>
                <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-blue-800 uppercase tracking-wide">Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-2 pb-2 border-b border-gray-300 last:border-0">
                <div className="flex justify-between mb-0.5">
                  <h3 className="font-bold text-xs">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                  <span className="text-xs text-gray-600">{edu.startDate} - {edu.endDate || 'Present'}</span>
                </div>
                <p className="text-xs font-semibold text-blue-700">{edu.institution}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-blue-800 uppercase tracking-wide">Skills</h2>
            <p className="text-xs leading-relaxed">{resume.skills.map(s => s.name).join(' • ')}</p>
          </section>
        )}
        
        {enabledSections.languages && resume.languages?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-blue-800 uppercase tracking-wide">Languages</h2>
            <p className="text-xs leading-relaxed">{resume.languages.map(l => `${l.language} (${l.proficiency})`).join(' • ')}</p>
          </section>
        )}
        
        {enabledSections.achievements && resume.achievements?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-blue-800 uppercase tracking-wide">Achievements</h2>
            <ul className="text-xs space-y-1 ml-4">
              {resume.achievements.map(a => <li key={a.id} className="list-disc">• {a.title}</li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 2: CLASSIC CORPORATE (1-column, serif, professional)
// ═══════════════════════════════════════════════════════════════
export function Template2ClassicCorporate({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px', fontFamily: 'Georgia, serif' }}>
      {enabledSections.contact && (
        <div className="px-12 py-10 border-t-8 border-gray-800">
          <h1 className="text-4xl font-bold mb-0.5" style={{ fontFamily: 'Georgia, serif' }}>{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-lg text-gray-700 mb-4 font-semibold">{resume.contact.title}</p>}
          <div className="text-xs text-gray-600 space-y-0.5">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-12 py-8 space-y-5">
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-800">PROFESSIONAL SUMMARY</h2>
            <p className="text-xs leading-relaxed text-justify">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-800">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-3 pb-3 border-b border-gray-300 last:border-0">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-xs text-gray-800">{exp.title}</h3>
                  <span className="text-xs text-gray-600">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">{exp.company}</p>
                <p className="text-xs mt-1.5 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-800">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-2 pb-2 border-b border-gray-300 last:border-0">
                <div className="flex justify-between mb-0.5">
                  <h3 className="font-bold text-xs">{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                  <span className="text-xs text-gray-600">{edu.startDate} – {edu.endDate || 'Present'}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">{edu.institution}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-gray-800">SKILLS</h2>
            <p className="text-xs leading-relaxed">{resume.skills.map(s => s.name).join(', ')}</p>
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 3: TECH FOCUSED (2-column: sidebar on left)
// ═══════════════════════════════════════════════════════════════
export function Template3TechFocused({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900 flex" style={{ width: '794px', minHeight: '1122px' }}>
      {/* Left Sidebar - Skills */}
      <div className="w-48 bg-gradient-to-b from-slate-800 to-slate-900 text-white px-6 py-8 space-y-6">
        {enabledSections.contact && (
          <div>
            <h1 className="text-lg font-bold text-cyan-300">{resume.contact.name}</h1>
            <p className="text-xs text-cyan-200 mt-1">{resume.contact.title}</p>
          </div>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-cyan-300 mb-2 pb-2 border-b border-cyan-600">SKILLS</h3>
            <div className="space-y-1">
              {resume.skills.map(s => (
                <div key={s.id} className="text-xs text-gray-200">
                  <span className="font-semibold">{s.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {enabledSections.languages && resume.languages?.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-cyan-300 mb-2 pb-2 border-b border-cyan-600">LANGUAGES</h3>
            <div className="space-y-1">
              {resume.languages.map(l => (
                <div key={l.id} className="text-xs text-gray-200">
                  <span className="font-semibold">{l.language}</span>
                  <p className="text-gray-400 text-xs">{l.proficiency}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      
      {/* Right Content */}
      <div className="flex-1 px-8 py-8 space-y-4">
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="text-sm font-bold mb-2 text-cyan-700 pb-1 border-b-2 border-cyan-700">SUMMARY</h2>
            <p className="text-xs leading-relaxed">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-2 text-cyan-700 pb-1 border-b-2 border-cyan-700">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                <div className="flex justify-between">
                  <h3 className="font-bold text-xs">{exp.title}</h3>
                  <span className="text-xs text-gray-600">{exp.startDate}</span>
                </div>
                <p className="text-xs text-cyan-700 font-semibold">{exp.company}</p>
                <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.projects && resume.projects?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-2 text-cyan-700 pb-1 border-b-2 border-cyan-700">PROJECTS</h2>
            {resume.projects.map((proj) => (
              <div key={proj.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                <h3 className="font-bold text-xs">{proj.title}</h3>
                <p className="text-xs mt-1 leading-relaxed">{proj.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 4: ACADEMIC (1-column, education prioritized)
// ═══════════════════════════════════════════════════════════════
export function Template4Academic({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900 font-serif" style={{ width: '794px', minHeight: '1122px' }}>
      {enabledSections.contact && (
        <div className="px-10 py-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-4 border-indigo-800">
          <h1 className="text-3xl font-bold text-indigo-900">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-sm text-indigo-700 mt-1">{resume.contact.title}</p>}
          <div className="text-xs text-indigo-700 mt-3 space-y-0.5">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-6 space-y-5">
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-indigo-800 text-indigo-900">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-3 pb-3 border-b border-gray-300 last:border-0">
                <h3 className="font-bold text-sm text-indigo-900">{edu.degree}</h3>
                <p className="text-xs font-semibold text-indigo-700">{edu.institution}</p>
                {edu.field && <p className="text-xs text-gray-700">Field: {edu.field}</p>}
                <span className="text-xs text-gray-600">{edu.startDate} – {edu.endDate || 'Present'}</span>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-indigo-800 text-indigo-900">PROFESSIONAL EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-2.5 pb-2.5 border-b border-gray-300 last:border-0">
                <h3 className="font-bold text-xs">{exp.title}</h3>
                <p className="text-xs text-indigo-700">{exp.company}</p>
                <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.projects && resume.projects?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-indigo-800 text-indigo-900">PUBLICATIONS & PROJECTS</h2>
            {resume.projects.map((proj) => (
              <div key={proj.id} className="mb-2 pb-2 border-b border-gray-300 last:border-0">
                <h3 className="font-bold text-xs">{proj.title}</h3>
                <p className="text-xs mt-1">{proj.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 5: STARTUP (Creative, 1-column, bold, minimal)
// ═══════════════════════════════════════════════════════════════
export function Template5Startup({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px' }}>
      {enabledSections.contact && (
        <div className="px-10 py-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600" style={{ lineHeight: '1.2' }}>
            {resume.contact.name}
          </h1>
          {resume.contact.title && (
            <p className="text-2xl font-bold text-pink-600 mt-2">{resume.contact.title}</p>
          )}
          <div className="text-xs text-gray-600 mt-5 space-y-1 font-semibold">
            {resume.contact.email && <div>✉ {resume.contact.email}</div>}
            {resume.contact.phone && <div>📞 {resume.contact.phone}</div>}
            {resume.contact.location && <div>📍 {resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-6 space-y-6">
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="text-lg font-black text-pink-600 mb-3">ABOUT</h2>
            <p className="text-xs leading-relaxed font-medium text-gray-700">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-pink-600 mb-3">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <h3 className="font-black text-sm text-gray-900">{exp.title}</h3>
                <p className="text-xs font-bold text-pink-600">{exp.company}</p>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-pink-600 mb-3">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1 bg-pink-100 text-pink-700 font-bold text-xs rounded-full">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 6: EXECUTIVE PREMIUM (3-part layout with sidebar)
// ═══════════════════════════════════════════════════════════════
export function Template6ExecutivePremium({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px' }}>
      {/* Top Bar - Name & Title */}
      {enabledSections.contact && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-10 py-8">
          <h1 className="text-3xl font-bold">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-lg text-gray-300 mt-1">{resume.contact.title}</p>}
        </div>
      )}
      
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-40 bg-gray-50 px-6 py-6 border-r-2 border-gray-300 space-y-6">
          {enabledSections.contact && (
            <section>
              <h3 className="text-xs font-bold text-gray-900 mb-2 pb-2 border-b-2 border-gray-900">CONTACT</h3>
              <div className="text-xs space-y-1 text-gray-700">
                {resume.contact.email && <div className="break-all">{resume.contact.email}</div>}
                {resume.contact.phone && <div>{resume.contact.phone}</div>}
                {resume.contact.location && <div>{resume.contact.location}</div>}
              </div>
            </section>
          )}
          
          {enabledSections.skills && resume.skills?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-900 mb-2 pb-2 border-b-2 border-gray-900">KEY SKILLS</h3>
              <div className="space-y-1">
                {resume.skills.slice(0, 5).map(s => (
                  <div key={s.id} className="text-xs text-gray-700 font-semibold">{s.name}</div>
                ))}
              </div>
            </section>
          )}
          
          {enabledSections.languages && resume.languages?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-900 mb-2 pb-2 border-b-2 border-gray-900">LANGUAGES</h3>
              <div className="space-y-1">
                {resume.languages.map(l => (
                  <div key={l.id} className="text-xs">
                    <span className="font-semibold">{l.language}</span>
                    <p className="text-gray-600 text-xs">{l.proficiency}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 px-8 py-6 space-y-4">
          {enabledSections.summary && resume.summary && (
            <section>
              <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-gray-900 uppercase">Professional Summary</h2>
              <p className="text-xs leading-relaxed">{resume.summary.description}</p>
            </section>
          )}
          
          {enabledSections.experience && resume.experience?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-gray-900 uppercase">Experience</h2>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-xs">{exp.title}</h3>
                    <span className="text-xs text-gray-600">{exp.startDate}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{exp.company}</p>
                  <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}
          
          {enabledSections.education && resume.education?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-2 pb-2 border-b-2 border-gray-900 uppercase">Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="mb-1 pb-1">
                  <h3 className="font-bold text-xs">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                  <p className="text-xs text-gray-700">{edu.institution}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 7: MINIMAL EDGE (Ultra-clean, maximum whitespace)
// ═══════════════════════════════════════════════════════════════
export function Template7MinimalEdge({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px', letterSpacing: '0.05em' }}>
      {enabledSections.contact && (
        <div className="px-12 py-12 border-b border-gray-200">
          <h1 className="text-4xl font-light tracking-wider">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-sm font-light tracking-widest text-gray-600 mt-6">{resume.contact.title}</p>}
          <div className="text-xs text-gray-600 mt-8 space-y-2 font-light">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-12 py-10 space-y-10">
        {enabledSections.summary && resume.summary && (
          <section>
            <p className="text-xs leading-relaxed text-gray-700 font-light">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-light tracking-widest text-gray-500 mb-6 pb-4 border-b border-gray-200">EXPERIENCE</h2>
            {resume.experience.map((exp, idx) => (
              <div key={exp.id} className={`mb-8 ${idx !== resume.experience!.length - 1 ? 'pb-8 border-b border-gray-200' : ''}`}>
                <h3 className="text-xs font-light tracking-wider text-gray-900">{exp.title}</h3>
                <p className="text-xs font-light text-gray-600 mt-2">{exp.company}</p>
                <p className="text-xs font-light text-gray-500 mt-1">{exp.startDate} – {exp.endDate || 'Present'}</p>
                <p className="text-xs font-light text-gray-700 mt-4 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-light tracking-widest text-gray-500 mb-6 pb-4 border-b border-gray-200">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-6">
                <h3 className="text-xs font-light tracking-wider text-gray-900">{edu.degree}</h3>
                <p className="text-xs font-light text-gray-600 mt-2">{edu.institution}</p>
                <p className="text-xs font-light text-gray-500 mt-1">{edu.startDate} – {edu.endDate || 'Present'}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 8: COMPACT PROFESSIONAL (1-page, tight spacing)
// ═══════════════════════════════════════════════════════════════
export function Template8CompactProfessional({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900 text-xs" style={{ width: '794px', minHeight: '1122px', fontSize: '10px' }}>
      {enabledSections.contact && (
        <div className="px-8 py-6 border-b-2 border-blue-700">
          <h1 className="text-2xl font-bold text-blue-700">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-sm text-blue-600 font-semibold mt-0.5">{resume.contact.title}</p>}
          <div className="text-xs text-gray-700 mt-2 flex flex-wrap gap-2">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <><span>|</span><span>{resume.contact.phone}</span></>}
            {resume.contact.location && <><span>|</span><span>{resume.contact.location}</span></>}
          </div>
        </div>
      )}
      
      <div className="px-8 py-4 space-y-2">
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="font-bold text-blue-700 mb-1 pb-0.5 border-b border-blue-700">SUMMARY</h2>
            <p className="leading-tight text-justify">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="font-bold text-blue-700 mb-1 pb-0.5 border-b border-blue-700">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-1.5">
                <div className="flex justify-between">
                  <span className="font-bold">{exp.title}</span>
                  <span className="text-gray-600">{exp.startDate}</span>
                </div>
                <div className="text-blue-700 font-semibold">{exp.company}</div>
                <p className="leading-tight">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="font-bold text-blue-700 mb-1 pb-0.5 border-b border-blue-700">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-0.5">
                <span className="font-bold">{edu.degree}</span> - {edu.institution} ({edu.startDate})
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h2 className="font-bold text-blue-700 mb-1 pb-0.5 border-b border-blue-700">SKILLS</h2>
            <p>{resume.skills.map(s => s.name).join(', ')}</p>
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 9: TECHNICAL SPECIALIST (2-column: skills LEFT, content RIGHT)
// ═══════════════════════════════════════════════════════════════
export function Template9TechnicalSpecialist({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-gray-50 text-gray-900 flex" style={{ width: '794px', minHeight: '1122px', fontFamily: 'Courier New, monospace' }}>
      {/* Left Sidebar - Technical Skills */}
      <div className="w-44 bg-gray-900 text-gray-100 px-5 py-8 space-y-6">
        {enabledSections.contact && (
          <div>
            <h1 className="text-sm font-bold text-green-400" style={{ fontFamily: 'Courier New, monospace' }}>$ {resume.contact.name}</h1>
            {resume.contact.title && <p className="text-xs text-gray-400 mt-2">&gt; {resume.contact.title}</p>}
          </div>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-green-400 mb-3 pb-2 border-b border-green-400">// SKILLS</h3>
            <div className="space-y-2">
              {resume.skills.map(s => (
                <div key={s.id} className="text-xs text-gray-300">
                  <span className="text-green-400">⚡</span> {s.name}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {enabledSections.certifications && resume.certifications?.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-green-400 mb-3 pb-2 border-b border-green-400">// CERTS</h3>
            <div className="space-y-1">
              {resume.certifications.map(c => (
                <div key={c.id} className="text-xs text-gray-300">✓ {c.name}</div>
              ))}
            </div>
          </section>
        )}
      </div>
      
      {/* Right Content */}
      <div className="flex-1 bg-white px-7 py-8 space-y-4">
        {enabledSections.contact && (
          <div className="text-xs text-gray-600 mb-4">
            {resume.contact.email && <div>📧 {resume.contact.email}</div>}
            {resume.contact.phone && <div>📱 {resume.contact.phone}</div>}
            {resume.contact.location && <div>📍 {resume.contact.location}</div>}
          </div>
        )}
        
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="text-xs font-bold mb-2 text-gray-900 pb-1 border-b-2 border-gray-300">OVERVIEW</h2>
            <p className="text-xs leading-relaxed">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 text-gray-900 pb-1 border-b-2 border-gray-300">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                <h3 className="font-bold text-xs text-gray-800">{exp.title}</h3>
                <p className="text-xs text-gray-700">{exp.company} | {exp.startDate}</p>
                <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.projects && resume.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold mb-2 text-gray-900 pb-1 border-b-2 border-gray-300">PROJECTS</h2>
            {resume.projects.map((proj) => (
              <div key={proj.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                <h3 className="font-bold text-xs">{proj.title}</h3>
                <p className="text-xs mt-1">{proj.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 10: CONSULTING ELITE (Metrics-focused, results emphasis)
// ═══════════════════════════════════════════════════════════════
export function Template10ConsultingElite({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px' }}>
      {enabledSections.contact && (
        <div className="px-10 py-10 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <h1 className="text-4xl font-bold">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-lg text-blue-100 mt-2">{resume.contact.title}</p>}
          <div className="text-xs text-blue-200 mt-6 space-y-1">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-8 space-y-5">
        {enabledSections.summary && resume.summary && (
          <section className="bg-blue-50 border-l-4 border-blue-900 px-4 py-4 rounded">
            <p className="text-xs leading-relaxed font-semibold text-gray-800">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-blue-900">PROFESSIONAL EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-4 pb-4 border-b border-gray-300 last:border-0">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-sm text-gray-900">{exp.title}</h3>
                  <span className="text-xs text-gray-600 font-semibold">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <p className="text-xs font-bold text-blue-900 mb-2">{exp.company}</p>
                <div className="bg-blue-100 border-l-2 border-blue-900 px-3 py-2 rounded mb-2">
                  <p className="text-xs font-semibold text-blue-900">Key Achievements:</p>
                  <p className="text-xs text-gray-800 mt-1">{exp.description}</p>
                </div>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-blue-900">CORE COMPETENCIES</h2>
            <div className="grid grid-cols-2 gap-2">
              {resume.skills.map((skill) => (
                <div key={skill.id} className="bg-gray-100 px-3 py-2 rounded">
                  <p className="text-xs font-semibold text-gray-900">{skill.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// Continuing with Templates 11-15...
// Will add remaining templates in next section due to size
