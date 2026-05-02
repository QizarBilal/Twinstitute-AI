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
// TEMPLATE 11: CREATIVE DESIGNER (Image placeholder + 2-column)
// ═══════════════════════════════════════════════════════════════
export function Template11CreativeDesigner({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px' }}>
      {/* Image Placeholder Section */}
      <div className="w-full h-48 bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 flex items-center justify-center border-b-4 border-purple-600">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-purple-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">PHOTO</span>
          </div>
          <p className="text-xs text-purple-700 mt-3 font-semibold">Add Your Profile Photo</p>
        </div>
      </div>
      
      {enabledSections.contact && (
        <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h1 className="text-3xl font-black text-purple-900">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-lg font-bold text-pink-600 mt-1">{resume.contact.title}</p>}
          <div className="text-xs text-purple-700 mt-3 space-y-0.5 font-semibold">
            {resume.contact.email && <div>✉ {resume.contact.email}</div>}
            {resume.contact.phone && <div>📞 {resume.contact.phone}</div>}
          </div>
        </div>
      )}
      
      <div className="flex">
        {/* Left Column */}
        <div className="w-60 px-6 py-6 bg-gray-50 border-r-2 border-purple-200 space-y-5">
          {enabledSections.skills && resume.skills?.length > 0 && (
            <section>
              <h3 className="text-xs font-black text-purple-900 mb-3 pb-2 border-b-2 border-purple-600">SKILLS</h3>
              <div className="space-y-2">
                {resume.skills.map(s => (
                  <div key={s.id} className="text-xs">
                    <span className="font-bold text-purple-900">{s.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {enabledSections.languages && resume.languages?.length > 0 && (
            <section>
              <h3 className="text-xs font-black text-purple-900 mb-3 pb-2 border-b-2 border-purple-600">LANGUAGES</h3>
              <div className="space-y-1">
                {resume.languages.map(l => (
                  <div key={l.id} className="text-xs">
                    <span className="font-bold text-purple-900">{l.language}</span>
                    <p className="text-purple-700 text-xs">{l.proficiency}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* Right Column */}
        <div className="flex-1 px-6 py-6 space-y-4">
          {enabledSections.summary && resume.summary && (
            <section>
              <h2 className="text-xs font-black text-purple-900 mb-2 pb-2 border-b-2 border-purple-600">ABOUT ME</h2>
              <p className="text-xs leading-relaxed">{resume.summary.description}</p>
            </section>
          )}
          
          {enabledSections.experience && resume.experience?.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-purple-900 mb-2 pb-2 border-b-2 border-purple-600">EXPERIENCE</h2>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="mb-2 pb-2 border-b border-gray-300 last:border-0">
                  <h3 className="font-bold text-xs text-gray-900">{exp.title}</h3>
                  <p className="text-xs text-pink-600 font-semibold">{exp.company}</p>
                  <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                </div>
              ))}
            </section>
          )}
          
          {enabledSections.projects && resume.projects?.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-purple-900 mb-2 pb-2 border-b-2 border-purple-600">FEATURED WORK</h2>
              {resume.projects.map((proj) => (
                <div key={proj.id} className="mb-2">
                  <h3 className="font-bold text-xs text-gray-900">{proj.title}</h3>
                  <p className="text-xs text-gray-700">{proj.description}</p>
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
// TEMPLATE 12: SALES PROFESSIONAL (Achievement badges, callouts)
// ═══════════════════════════════════════════════════════════════
export function Template12SalesProfessional({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px' }}>
      {enabledSections.contact && (
        <div className="px-10 py-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <h1 className="text-4xl font-black">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-xl font-bold text-green-100 mt-2">{resume.contact.title}</p>}
          <div className="text-xs text-green-100 mt-6 font-semibold">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-6 space-y-5">
        {enabledSections.summary && resume.summary && (
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 px-4 py-4 rounded">
            <p className="text-xs leading-relaxed font-semibold text-gray-800">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.achievements && resume.achievements?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-green-600">🏆 KEY ACHIEVEMENTS</h2>
            <div className="grid grid-cols-2 gap-3">
              {resume.achievements.map((achievement) => (
                <div key={achievement.id} className="bg-green-100 border-l-4 border-green-600 px-3 py-3 rounded">
                  <h3 className="text-xs font-black text-green-900">{achievement.title}</h3>
                  <p className="text-xs text-green-800 mt-1">{achievement.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-green-600">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-3 pb-3 border-b border-gray-300 last:border-0">
                <div className="flex justify-between">
                  <h3 className="font-bold text-xs text-gray-900">{exp.title}</h3>
                  <span className="text-xs text-gray-600">{exp.startDate}</span>
                </div>
                <p className="text-xs font-bold text-green-700">{exp.company}</p>
                <p className="text-xs mt-2 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-3 border-green-600">CORE COMPETENCIES</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1.5 bg-green-200 text-green-900 font-bold text-xs rounded-full border border-green-600">
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
// TEMPLATE 13: RESEARCHER (Publication-focused, academic format)
// ═══════════════════════════════════════════════════════════════
export function Template13Researcher({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px', fontFamily: 'Georgia, serif' }}>
      {enabledSections.contact && (
        <div className="px-10 py-8 border-b-4 border-indigo-900 bg-indigo-50">
          <h1 className="text-3xl font-bold text-indigo-900">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-sm italic text-indigo-800 mt-2">{resume.contact.title}</p>}
          <div className="text-xs text-indigo-700 mt-4">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-6 space-y-6">
        {enabledSections.summary && resume.summary && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-indigo-900 text-indigo-900">RESEARCH STATEMENT</h2>
            <p className="text-xs leading-relaxed text-justify italic">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-indigo-900 text-indigo-900">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-3 pb-3 border-b border-gray-300 last:border-0">
                <h3 className="font-bold text-xs text-indigo-900">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                <p className="text-xs italic text-indigo-800">{edu.institution}</p>
                <p className="text-xs text-gray-600">{edu.startDate} – {edu.endDate || 'Present'}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.projects && resume.projects?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-indigo-900 text-indigo-900">PUBLICATIONS & RESEARCH</h2>
            {resume.projects.map((proj, idx) => (
              <div key={proj.id} className="mb-2 pb-2">
                <p className="text-xs">
                  <span className="font-bold">{idx + 1}.</span> {proj.title}. <span className="italic">{proj.description}</span>
                </p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 pb-2 border-b-2 border-indigo-900 text-indigo-900">PROFESSIONAL EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                <h3 className="font-bold text-xs">{exp.title}</h3>
                <p className="text-xs italic text-indigo-800">{exp.company}</p>
                <p className="text-xs text-gray-600">{exp.startDate} – {exp.endDate || 'Present'}</p>
                <p className="text-xs mt-1">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 14: CAREER CHANGER (Skills-first, 2-column layout)
// ═══════════════════════════════════════════════════════════════
export function Template14CareerChanger({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900 flex" style={{ width: '794px', minHeight: '1122px' }}>
      {/* Left Column - Skills & Achievements */}
      <div className="w-56 bg-gradient-to-b from-orange-500 to-red-600 text-white px-6 py-8 space-y-6">
        {enabledSections.contact && (
          <div>
            <h1 className="text-2xl font-black">{resume.contact.name}</h1>
            {resume.contact.title && <p className="text-sm font-bold text-orange-100 mt-2">{resume.contact.title}</p>}
          </div>
        )}
        
        {enabledSections.skills && resume.skills?.length > 0 && (
          <section>
            <h3 className="text-xs font-black text-orange-100 mb-3 pb-2 border-b-2 border-orange-100">⭐ KEY SKILLS</h3>
            <div className="space-y-2">
              {resume.skills.slice(0, 6).map(s => (
                <div key={s.id} className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">
                  {s.name}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {enabledSections.achievements && resume.achievements?.length > 0 && (
          <section>
            <h3 className="text-xs font-black text-orange-100 mb-3 pb-2 border-b-2 border-orange-100">🎯 HIGHLIGHTS</h3>
            <div className="space-y-2">
              {resume.achievements.slice(0, 3).map(a => (
                <div key={a.id} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  ✓ {a.title}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      
      {/* Right Column */}
      <div className="flex-1 px-7 py-8 space-y-4">
        {enabledSections.summary && resume.summary && (
          <section>
            <p className="text-xs leading-relaxed font-semibold text-gray-800">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.experience && resume.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-black mb-2 pb-2 border-b-2 border-orange-600 text-orange-600">EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-2.5 pb-2.5 border-b border-gray-300 last:border-0">
                <h3 className="font-bold text-xs text-gray-900">{exp.title}</h3>
                <p className="text-xs text-orange-600 font-semibold">{exp.company}</p>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {enabledSections.education && resume.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-black mb-2 pb-2 border-b-2 border-orange-600 text-orange-600">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-1 pb-1">
                <h3 className="font-bold text-xs">{edu.degree}</h3>
                <p className="text-xs text-orange-600">{edu.institution}</p>
                <p className="text-xs text-gray-600">{edu.startDate}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 15: STARTUP FOUNDER (Vision + metrics, 2-column)
// ═══════════════════════════════════════════════════════════════
export function Template15StartupFounder({ resume, enabledSections }: TemplateComponentProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: '794px', minHeight: '1122px' }}>
      {enabledSections.contact && (
        <div className="px-10 py-10 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white">
          <h1 className="text-4xl font-black">{resume.contact.name}</h1>
          {resume.contact.title && <p className="text-xl font-bold text-cyan-100 mt-3">{resume.contact.title}</p>}
          <div className="text-xs text-cyan-100 mt-6 font-semibold space-y-1">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>
      )}
      
      <div className="px-10 py-6 space-y-5">
        {enabledSections.summary && resume.summary && (
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 px-5 py-4 rounded">
            <h3 className="text-xs font-black text-blue-900 mb-2">🚀 VISION</h3>
            <p className="text-xs leading-relaxed font-semibold text-gray-800">{resume.summary.description}</p>
          </section>
        )}
        
        {enabledSections.achievements && resume.achievements?.length > 0 && (
          <section>
            <h2 className="text-sm font-black mb-3 pb-2 border-b-3 border-blue-600 text-blue-600">📊 METRICS & ACHIEVEMENTS</h2>
            <div className="grid grid-cols-3 gap-3">
              {resume.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="bg-blue-100 border-2 border-blue-600 px-3 py-3 rounded text-center">
                  <h4 className="text-xs font-black text-blue-900">{achievement.title}</h4>
                  <p className="text-xs text-blue-800 mt-1">{achievement.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Experience */}
          <section>
            <h2 className="text-xs font-black mb-2 pb-2 border-b-2 border-blue-600 text-blue-600">EXPERIENCE</h2>
            {enabledSections.experience && resume.experience?.length > 0 && (
              <div className="space-y-2">
                {resume.experience.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="pb-2 border-b border-gray-200 last:border-0">
                    <h3 className="font-bold text-xs text-gray-900">{exp.title}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{exp.company}</p>
                    <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Right: Skills & Education */}
          <section>
            <h2 className="text-xs font-black mb-2 pb-2 border-b-2 border-purple-600 text-purple-600">SKILLS & EDUCATION</h2>
            {enabledSections.skills && resume.skills?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-800">Core Skills:</p>
                <p className="text-xs text-gray-700 mt-1">{resume.skills.slice(0, 4).map(s => s.name).join(', ')}</p>
              </div>
            )}
            {enabledSections.education && resume.education?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-800">Education:</p>
                {resume.education.slice(0, 1).map((edu) => (
                  <div key={edu.id} className="text-xs text-gray-700 mt-1">
                    <span className="font-semibold">{edu.degree}</span>
                    <p>{edu.institution}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
