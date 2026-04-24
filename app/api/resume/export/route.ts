/**
 * Resume Export API
 * Handles exporting resume in multiple formats (PDF, DOCX, TXT, JSON)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ResumeData, ExportFormat, ResumeAPIResponse } from '@/types/resume'

interface ExportRequest {
  resume: ResumeData
  format: ExportFormat
  filename?: string
}

// Helper: Generate plain text resume
function generatePlainText(resume: ResumeData): string {
  const lines: string[] = []

  // Header
  lines.push(`${resume.contact.name}`.toUpperCase())
  if (resume.contact.title) lines.push(resume.contact.title)
  lines.push('')

  // Contact Info
  const contact = [resume.contact.email, resume.contact.phone, resume.contact.location, resume.contact.linkedin, resume.contact.github]
    .filter(Boolean)
    .join(' | ')
  lines.push(contact)
  lines.push('')

  // Summary
  if (resume.summary) {
    lines.push('PROFESSIONAL SUMMARY')
    lines.push('---')
    lines.push(resume.summary.description)
    lines.push('')
  }

  // Experience
  if (resume.experience.length > 0) {
    lines.push('EXPERIENCE')
    lines.push('---')
    resume.experience.forEach((exp) => {
      lines.push(`${exp.title} at ${exp.company}`)
      if (exp.location) lines.push(`Location: ${exp.location}`)
      lines.push(`${exp.startDate}${exp.endDate ? ' - ' + exp.endDate : ' - Present'}`)
      lines.push(exp.description)
      if (exp.achievements.length > 0) {
        exp.achievements.forEach((ach) => lines.push(`• ${ach}`))
      }
      lines.push('')
    })
  }

  // Education
  if (resume.education.length > 0) {
    lines.push('EDUCATION')
    lines.push('---')
    resume.education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.field}`)
      lines.push(`${edu.institution}`)
      lines.push(`${edu.startDate}${edu.endDate ? ' - ' + edu.endDate : ' - Present'}`)
      if (edu.description) lines.push(edu.description)
      lines.push('')
    })
  }

  // Skills
  if (resume.skills.length > 0) {
    lines.push('SKILLS')
    lines.push('---')
    const skillsByCategory = resume.skills.reduce(
      (acc, skill) => {
        const cat = skill.category || 'Technical'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(skill.name)
        return acc
      },
      {} as Record<string, string[]>
    )

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      lines.push(`${category}: ${skills.join(', ')}`)
    })
    lines.push('')
  }

  // Proven Capabilities
  if (resume.capabilities.length > 0) {
    lines.push('PROVEN CAPABILITIES')
    lines.push('---')
    resume.capabilities.forEach((cap) => {
      lines.push(`• ${cap.name} (${cap.level}) - Credits: ${cap.creditsEarned}`)
      if (cap.description) lines.push(`  ${cap.description}`)
    })
    lines.push('')
  }

  // Projects
  if (resume.projects.length > 0) {
    lines.push('PROJECTS')
    lines.push('---')
    resume.projects.forEach((proj) => {
      lines.push(`${proj.title}`)
      if (proj.link) lines.push(`Link: ${proj.link}`)
      if (proj.github) lines.push(`GitHub: ${proj.github}`)
      lines.push(proj.description)
      if (proj.achievements.length > 0) {
        proj.achievements.forEach((ach) => lines.push(`• ${ach}`))
      }
      lines.push('')
    })
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    lines.push('CERTIFICATIONS')
    lines.push('---')
    resume.certifications.forEach((cert) => {
      lines.push(`${cert.name} - ${cert.issuer}`)
      lines.push(`Issued: ${cert.issueDate}`)
      lines.push('')
    })
  }

  return lines.join('\n')
}

// Helper: Generate HTML for PDF export
function generateHTML(resume: ResumeData, styled: boolean = true): string {
  const styles = styled
    ? `
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 20px;
        background: white;
      }
      .container {
        max-width: 850px;
        margin: 0 auto;
        background: white;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 20px;
        margin-bottom: 20px;
      }
      .name {
        font-size: 28px;
        font-weight: bold;
        color: #0066cc;
      }
      .title {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
      }
      .contact {
        font-size: 12px;
        color: #666;
        margin-top: 8px;
      }
      .section {
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 14px;
        font-weight: bold;
        color: #0066cc;
        border-bottom: 1px solid #0066cc;
        padding-bottom: 5px;
        margin-bottom: 10px;
        text-transform: uppercase;
      }
      .item {
        margin-bottom: 12px;
      }
      .item-header {
        font-weight: bold;
        display: flex;
        justify-content: space-between;
      }
      .item-title {
        font-weight: bold;
      }
      .item-subtitle {
        color: #666;
        font-style: italic;
      }
      .item-date {
        color: #666;
        font-size: 12px;
      }
      .description {
        color: #555;
        margin-top: 5px;
      }
      .skills-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .skill-item {
        font-size: 13px;
        padding: 5px;
        background: #f5f5f5;
        border-radius: 3px;
      }
      ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      li {
        margin: 3px 0;
        font-size: 12px;
      }
    </style>
    `
    : ''

  const contactInfo = [resume.contact.email, resume.contact.phone, resume.contact.location, resume.contact.linkedin, resume.contact.github]
    .filter(Boolean)
    .join(' | ')

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${resume.contact.name} - Resume</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="name">${resume.contact.name}</div>
          <div class="title">${resume.contact.title}</div>
          <div class="contact">${contactInfo}</div>
        </div>
  `

  // Summary
  if (resume.summary) {
    html += `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="description">${resume.summary.description}</div>
      </div>
    `
  }

  // Experience
  if (resume.experience.length > 0) {
    html += '<div class="section"><div class="section-title">Experience</div>'
    resume.experience.forEach((exp) => {
      html += `
        <div class="item">
          <div class="item-header">
            <div class="item-title">${exp.title}</div>
            <div class="item-date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
          </div>
          <div class="item-subtitle">${exp.company}${exp.location ? ', ' + exp.location : ''}</div>
          <div class="description">${exp.description}</div>
          ${exp.achievements.length > 0 ? `<ul>${exp.achievements.map((a) => `<li>${a}</li>`).join('')}</ul>` : ''}
        </div>
      `
    })
    html += '</div>'
  }

  // Education
  if (resume.education.length > 0) {
    html += '<div class="section"><div class="section-title">Education</div>'
    resume.education.forEach((edu) => {
      html += `
        <div class="item">
          <div class="item-header">
            <div class="item-title">${edu.degree} in ${edu.field}</div>
            <div class="item-date">${edu.startDate} - ${edu.endDate || 'Present'}</div>
          </div>
          <div class="item-subtitle">${edu.institution}</div>
          ${edu.description ? `<div class="description">${edu.description}</div>` : ''}
        </div>
      `
    })
    html += '</div>'
  }

  // Skills
  if (resume.skills.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-grid">
          ${resume.skills.map((s) => `<div class="skill-item">${s.name}</div>`).join('')}
        </div>
      </div>
    `
  }

  // Proven Capabilities
  if (resume.capabilities.length > 0) {
    html += '<div class="section"><div class="section-title">Proven Capabilities</div>'
    resume.capabilities.forEach((cap) => {
      html += `
        <div class="item">
          <div class="item-title">${cap.name} <span style="color: #666;">(${cap.level})</span></div>
          <div class="description">${cap.description}</div>
          <div style="color: #999; font-size: 12px;">Credits: ${cap.creditsEarned}</div>
        </div>
      `
    })
    html += '</div>'
  }

  // Projects
  if (resume.projects.length > 0) {
    html += '<div class="section"><div class="section-title">Projects</div>'
    resume.projects.forEach((proj) => {
      html += `
        <div class="item">
          <div class="item-title">${proj.title}</div>
          <div class="description">${proj.description}</div>
          ${proj.github ? `<div style="color: #0066cc; font-size: 12px;"><a href="${proj.github}">GitHub</a></div>` : ''}
          ${proj.achievements.length > 0 ? `<ul>${proj.achievements.map((a) => `<li>${a}</li>`).join('')}</ul>` : ''}
        </div>
      `
    })
    html += '</div>'
  }

  html += `
      </div>
    </body>
    </html>
  `

  return html
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 401 }
      )
    }

    const { resume, format, filename: customFilename } = (await req.json()) as ExportRequest

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume data is required',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 400 }
      )
    }

    const filename = customFilename || `${resume.contact.name.replace(/\s+/g, '_')}_Resume`

    let contentType = 'application/octet-stream'
    let content: any = null
    let fileExtension = ''

    switch (format) {
      case 'txt': {
        contentType = 'text/plain'
        content = generatePlainText(resume)
        fileExtension = '.txt'
        break
      }
      case 'json': {
        contentType = 'application/json'
        content = JSON.stringify(resume, null, 2)
        fileExtension = '.json'
        break
      }
      case 'pdf-plain':
      case 'pdf-styled': {
        // Return HTML that can be converted to PDF on frontend
        contentType = 'text/html'
        content = generateHTML(resume, format === 'pdf-styled')
        fileExtension = '.html'
        break
      }
      case 'docx': {
        // For DOCX, we'll return instructions for frontend
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        content = generatePlainText(resume)
        fileExtension = '.docx'
        break
      }
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid export format',
            timestamp: new Date().toISOString(),
          } as ResumeAPIResponse,
          { status: 400 }
        )
    }

    // Return file content
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}${fileExtension}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export resume',
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse,
      { status: 500 }
    )
  }
}
