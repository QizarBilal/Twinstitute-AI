'use client'

import React from 'react'
import { ResumeData, ResumeTemplate } from '@/types/resume'
import { getTemplate } from '@/lib/resume/templates'

interface ResumePreviewProps {
  resume: ResumeData
  template: ResumeTemplate
}

export function ResumePreview({ resume, template }: ResumePreviewProps) {
  const templateConfig = getTemplate(template)

  if (!templateConfig) {
    return <div className="p-8 text-red-500">Invalid template selected</div>
  }

  const baseStyles = {
    backgroundColor: templateConfig.colors.background,
    color: templateConfig.colors.text,
  }

  // Template 1: Modern ATS (Single Column, Clean)
  if (template === 'modern-ats') {
    return (
      <div
        id="resume-preview"
        className="font-sans rounded-lg overflow-hidden w-full"
        style={baseStyles}
      >
        {/* Header */}
        <div className="px-10 py-8 border-b-4" style={{ borderColor: templateConfig.colors.primary }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: templateConfig.colors.primary }}>
            {resume.contact.name}
          </h1>
          {resume.contact.title && (
            <p className="text-lg font-semibold mb-4" style={{ color: templateConfig.colors.accent }}>
              {resume.contact.title}
            </p>
          )}
          <div className="text-xs flex flex-wrap gap-3 leading-relaxed">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <span>•</span>}
            {resume.contact.phone && <span>{resume.contact.phone}</span>}
            {resume.contact.location && <span>•</span>}
            {resume.contact.location && <span>{resume.contact.location}</span>}
          </div>
        </div>

        <div className="px-10 py-6 space-y-5">
          {/* Experience */}
          {templateConfig.sections.experience && resume.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>
                Experience
              </h2>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-xs">{exp.title}</h3>
                    <span className="text-xs">{exp.startDate}</span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: templateConfig.colors.accent }}>{exp.company}</p>
                  <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {templateConfig.sections.education && resume.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>
                Education
              </h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-xs">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                    <span className="text-xs">{edu.startDate}</span>
                  </div>
                  <p className="text-xs" style={{ color: templateConfig.colors.accent }}>{edu.institution}</p>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {templateConfig.sections.skills && resume.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.slice(0, 15).map((skill) => (
                  <span key={skill.name} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${templateConfig.colors.primary}15` }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {templateConfig.sections.projects && resume.projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>
                Projects
              </h2>
              {resume.projects.slice(0, 3).map((proj) => (
                <div key={proj.id} className="mb-2">
                  <h3 className="font-bold text-xs">{proj.name}</h3>
                  <p className="text-xs mt-1 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    )
  }

  // Template 2: Professional Classic (Simple, Corporate)
  if (template === 'professional-classic') {
    return (
      <div id="resume-preview" className="font-sans rounded-lg overflow-hidden w-full" style={baseStyles}>
        {/* Header */}
        <div className="px-10 py-6">
          <h1 className="text-3xl font-bold mb-0.5" style={{ color: templateConfig.colors.primary }}>
            {resume.contact.name}
          </h1>
          {resume.contact.title && (
            <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: templateConfig.colors.accent }}>
              {resume.contact.title}
            </p>
          )}
          <div className="text-xs space-y-1">
            {resume.contact.email && <div>{resume.contact.email}</div>}
            {resume.contact.phone && <div>{resume.contact.phone}</div>}
            {resume.contact.location && <div>{resume.contact.location}</div>}
          </div>
        </div>

        {/* Content */}
        <div className="px-10 py-4">
          {/* Experience (First Priority) */}
          {templateConfig.sections.experience && resume.experience.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-bold mb-2 pb-1 uppercase tracking-wider" style={{ color: templateConfig.colors.primary }}>Professional Experience</h2>
              {resume.experience.slice(0, 4).map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-xs">{exp.title}</h3>
                    <span className="text-xs">{exp.startDate}</span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: templateConfig.colors.accent }}>{exp.company}</p>
                  <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {templateConfig.sections.education && resume.education.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-bold mb-2 pb-1 uppercase tracking-wider" style={{ color: templateConfig.colors.primary }}>Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-xs">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                    <span className="text-xs">{edu.startDate}</span>
                  </div>
                  <p className="text-xs" style={{ color: templateConfig.colors.accent }}>{edu.institution}</p>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {templateConfig.sections.skills && resume.skills.length > 0 && (
            <section className="mb-4">
              <h2 className="text-xs font-bold mb-2 pb-1 uppercase tracking-wider" style={{ color: templateConfig.colors.primary }}>Core Competencies</h2>
              <div className="flex flex-wrap gap-1">
                {resume.skills.slice(0, 12).map((skill) => (
                  <span key={skill.name} className="text-xs px-2 py-0.5">
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

  // Template 3: Modern Two-Column (Tech-Focused)
  if (template === 'tech-modern') {
    return (
      <div id="resume-preview" className="font-sans rounded-lg overflow-hidden w-full flex" style={baseStyles}>
        {/* Left Column - Contact & Skills */}
        <div className="w-1/3 py-6 px-5" style={{ backgroundColor: `${templateConfig.colors.primary}08` }}>
          <div className="mb-6">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wide">Contact</h3>
            <div className="text-xs space-y-2 leading-relaxed">
              {resume.contact.email && <div className="break-all">{resume.contact.email}</div>}
              {resume.contact.phone && <div>{resume.contact.phone}</div>}
              {resume.contact.location && <div>{resume.contact.location}</div>}
            </div>
          </div>

          {/* Skills */}
          {templateConfig.sections.skills && resume.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold mb-3 uppercase tracking-wide">Skills</h3>
              <div className="space-y-2">
                {resume.skills.slice(0, 10).map((skill) => (
                  <div key={skill.name} className="text-xs p-2 rounded" style={{ backgroundColor: `${templateConfig.colors.primary}20` }}>
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="w-2/3 py-6 px-6">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-3xl font-bold mb-1" style={{ color: templateConfig.colors.primary }}>
              {resume.contact.name}
            </h1>
            {resume.contact.title && (
              <p className="text-sm font-semibold" style={{ color: templateConfig.colors.accent }}>
                {resume.contact.title}
              </p>
            )}
          </div>

          {/* Experience */}
          {templateConfig.sections.experience && resume.experience.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.primary }}>Experience</h2>
              {resume.experience.slice(0, 3).map((exp) => (
                <div key={exp.id} className="mb-3">
                  <h3 className="font-bold text-xs">{exp.title}</h3>
                  <p className="text-xs font-semibold" style={{ color: templateConfig.colors.accent }}>{exp.company}</p>
                  <p className="text-xs text-gray-500 mb-1">{exp.startDate}</p>
                  <p className="text-xs leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {templateConfig.sections.education && resume.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.primary }}>Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <h3 className="font-bold text-xs">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                  <p className="text-xs" style={{ color: templateConfig.colors.accent }}>{edu.institution}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    )
  }

  // Template 4: Academic (Education-First)
  if (template === 'academic') {
    return (
      <div id="resume-preview" className="font-sans rounded-lg overflow-hidden w-full" style={baseStyles}>
        {/* Header */}
        <div className="px-10 py-8 text-center border-b-2" style={{ borderColor: templateConfig.colors.primary }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: templateConfig.colors.primary }}>
            {resume.contact.name}
          </h1>
          {resume.contact.title && (
            <p className="text-xs font-semibold mb-3" style={{ color: templateConfig.colors.accent }}>
              {resume.contact.title}
            </p>
          )}
          <div className="text-xs space-x-3">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && resume.contact.email && <span>|</span>}
            {resume.contact.phone && <span>{resume.contact.phone}</span>}
            {resume.contact.location && (resume.contact.email || resume.contact.phone) && <span>|</span>}
            {resume.contact.location && <span>{resume.contact.location}</span>}
          </div>
        </div>

        <div className="px-10 py-6 space-y-5">
          {/* Education First */}
          {templateConfig.sections.education && resume.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>Academic Background</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-xs">{edu.degree}</h3>
                    <span className="text-xs">{edu.startDate}</span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: templateConfig.colors.accent }}>{edu.institution}</p>
                  {edu.field && <p className="text-xs">Major: {edu.field}</p>}
                  {edu.description && <p className="text-xs mt-1 leading-relaxed">{edu.description}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Experience */}
          {templateConfig.sections.experience && resume.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>Professional Experience</h2>
              {resume.experience.slice(0, 3).map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-xs">{exp.title}</h3>
                    <span className="text-xs">{exp.startDate}</span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: templateConfig.colors.accent }}>{exp.company}</p>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {templateConfig.sections.skills && resume.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 pb-2 border-b-2 uppercase tracking-wide" style={{ borderColor: templateConfig.colors.accent }}>Competencies</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.slice(0, 15).map((skill) => (
                  <span key={skill.name} className="text-xs px-2 py-1" style={{ backgroundColor: `${templateConfig.colors.primary}15` }}>
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

  // Template 5: Startup (Achievement-Focused, Concise)
  if (template === 'startup') {
    return (
      <div id="resume-preview" className="font-sans rounded-lg overflow-hidden w-full" style={baseStyles}>
        {/* Header */}
        <div className="px-10 py-7" style={{ backgroundColor: `${templateConfig.colors.primary}10` }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: templateConfig.colors.primary }}>
            {resume.contact.name}
          </h1>
          {resume.contact.title && (
            <p className="text-sm font-bold mb-3" style={{ color: templateConfig.colors.accent }}>
              {resume.contact.title}
            </p>
          )}
          <div className="text-xs flex gap-4 flex-wrap">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <span>{resume.contact.phone}</span>}
            {resume.contact.location && <span>{resume.contact.location}</span>}
          </div>
        </div>

        <div className="px-10 py-6 space-y-4">
          {/* Experience - Concise */}
          {templateConfig.sections.experience && resume.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: templateConfig.colors.primary }}>► Experience</h2>
              {resume.experience.slice(0, 4).map((exp) => (
                <div key={exp.id} className="mb-2.5">
                  <div className="flex justify-between mb-0.5">
                    <h3 className="font-bold text-xs">{exp.title} @ {exp.company}</h3>
                    <span className="text-xs">{exp.startDate}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Achievements/Projects */}
          {templateConfig.sections.projects && resume.projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: templateConfig.colors.primary }}>► Key Achievements</h2>
              {resume.projects.slice(0, 3).map((proj) => (
                <div key={proj.id} className="mb-2 text-xs leading-relaxed">
                  <strong>{proj.name}:</strong> {proj.description}
                </div>
              ))}
            </section>
          )}

          {/* Skills - Inline */}
          {templateConfig.sections.skills && resume.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: templateConfig.colors.primary }}>► Skills</h2>
              <div className="text-xs leading-relaxed">
                {resume.skills.slice(0, 12).map((s, i) => (
                  <span key={s.name}>
                    {s.name}
                    {i < Math.min(11, resume.skills.length - 1) ? ', ' : ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {templateConfig.sections.education && resume.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: templateConfig.colors.primary }}>► Education</h2>
              {resume.education.slice(0, 2).map((edu) => (
                <div key={edu.id} className="text-xs mb-1">
                  <span className="font-bold">{edu.degree}</span> {edu.field && `in ${edu.field}`} — {edu.institution}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="p-8 text-red-500">
      Template {template} not implemented
    </div>
  )
}
