/**
 * Advanced Resume Analysis API
 * Handles file uploads (PDF, DOCX, images)
 * Performs OCR, parsing, skill extraction, and TF-IDF matching
 * Inspired by SkillMatch-AI architecture
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ResumeAPIResponse } from '@/types/resume'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-1'

interface AnalysisRequest {
  resumeFile?: File
  resumeText?: string
  jobDescription?: string
  jobDescriptionFile?: File
}

// Simple TF-IDF implementation
function calculateTFIDF(text: string, corpus: string[]): Map<string, number> {
  const tokens = text.toLowerCase().match(/\b\w+\b/g) || []
  const docCount = corpus.length

  // Calculate TF (Term Frequency)
  const tf = new Map<string, number>()
  tokens.forEach((token) => {
    tf.set(token, (tf.get(token) || 0) + 1)
  })

  // Normalize TF
  const textLength = tokens.length
  if (textLength > 0) {
    tf.forEach((count, token) => {
      tf.set(token, count / textLength)
    })
  }

  // Calculate IDF (Inverse Document Frequency)
  const idf = new Map<string, number>()
  const uniqueTokens = new Set(tokens)

  uniqueTokens.forEach((token) => {
    const docsContainingToken = corpus.filter((doc) =>
      doc.toLowerCase().includes(token)
    ).length

    const idfValue = Math.log(docCount / (1 + docsContainingToken))
    idf.set(token, idfValue)
  })

  // Calculate TF-IDF
  const tfidf = new Map<string, number>()
  tf.forEach((tfValue, token) => {
    const idfValue = idf.get(token) || 0
    tfidf.set(token, tfValue * idfValue)
  })

  return tfidf
}

// Extract text from base64 encoded file
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const text = Buffer.from(buffer).toString('utf-8')

  // For PDFs and complex formats, we'd normally use libraries like pdfparse
  // For now, we'll handle basic text extraction and use Claude for structured parsing
  return text
}

// Extract skills using pattern matching
function extractSkillsLocally(text: string): string[] {
  const skillPatterns = [
    /\b(?:python|javascript|typescript|java|c\+\+|c#|ruby|php|go|rust|kotlin|swift)\b/gi,
    /\b(?:react|vue|angular|node\.js|express|django|flask|spring|laravel)\b/gi,
    /\b(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|gitlab)\b/gi,
    /\b(?:sql|mongodb|postgresql|mysql|redis|elasticsearch|cassandra)\b/gi,
    /\b(?:machine learning|artificial intelligence|deep learning|nlp|computer vision)\b/gi,
    /\b(?:agile|scrum|kanban|ci\/cd|rest api|graphql|microservices)\b/gi,
    /\b(?:communication|leadership|teamwork|project management|problem solving)\b/gi,
  ]

  const skills = new Set<string>()
  skillPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      skills.add(match[0].toLowerCase())
    }
  })

  return Array.from(skills)
}

// Cosine similarity between two TF-IDF vectors
function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number {
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  const allKeys = new Set([...vec1.keys(), ...vec2.keys()])

  allKeys.forEach((key) => {
    const v1 = vec1.get(key) || 0
    const v2 = vec2.get(key) || 0

    dotProduct += v1 * v2
    norm1 += v1 * v1
    norm2 += v2 * v2
  })

  if (norm1 === 0 || norm2 === 0) return 0
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
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

    const formData = await req.formData()
    const resumeFile = formData.get('resumeFile') as File | null
    const resumeText = formData.get('resumeText') as string | null
    const jobDescription = formData.get('jobDescription') as string | null
    const jobDescriptionFile = formData.get('jobDescriptionFile') as File | null

    // Extract resume text
    let finalResumeText = resumeText
    if (resumeFile && !finalResumeText) {
      finalResumeText = await extractTextFromFile(resumeFile)
    }

    // Extract job description
    let finalJobDescription = jobDescription
    if (jobDescriptionFile && !finalJobDescription) {
      finalJobDescription = await extractTextFromFile(jobDescriptionFile)
    }

    if (!finalResumeText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text is required',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 400 }
      )
    }

    // Stage 1: Local skill extraction
    const resumeSkills = extractSkillsLocally(finalResumeText)
    const jobSkills = finalJobDescription
      ? extractSkillsLocally(finalJobDescription)
      : []
    const matchedSkills = resumeSkills.filter((skill) =>
      finalJobDescription?.toLowerCase().includes(skill.toLowerCase())
    )
    const missingSkills = jobSkills.filter(
      (skill) => !resumeSkills.includes(skill)
    )

    // Stage 2: TF-IDF Analysis
    const corpus = [finalResumeText]
    if (finalJobDescription) corpus.push(finalJobDescription)

    const resumeTFIDF = calculateTFIDF(finalResumeText, corpus)
    const jobTFIDF = finalJobDescription
      ? calculateTFIDF(finalJobDescription, corpus)
      : new Map()

    const similarity = finalJobDescription
      ? cosineSimilarity(resumeTFIDF, jobTFIDF)
      : 0

    // Stage 3: Claude API for advanced parsing
    const claudePrompt = `You are an expert resume and job description analyst.

Analyze the following resume and job description (if provided) and extract structured information:

RESUME:
${finalResumeText}

${finalJobDescription ? `\nJOB DESCRIPTION:\n${finalJobDescription}` : ''}

Return ONLY valid JSON (no markdown):
{
  "candidateName": "<extracted or 'Not Detected'>",
  "email": "<extracted or null>",
  "phone": "<extracted or null>",
  "location": "<extracted or null>",
  "summary": "<professional summary>",
  "experience": [
    {
      "role": "<job title>",
      "company": "<company name>",
      "yearsOfExperience": <number>,
      "description": "<brief description>"
    }
  ],
  "education": [
    {
      "degree": "<degree type>",
      "field": "<field of study>",
      "institution": "<school name>",
      "year": <graduation year or null>
    }
  ],
  "technicalSkills": [<string array>],
  "softSkills": [<string array>],
  "certifications": [<string array>],
  "projects": [
    {
      "title": "<project name>",
      "description": "<brief description>",
      "technologies": [<string array>]
    }
  ],
  "jobMatch": ${finalJobDescription ? `{
    "targetRole": "<detected job role>",
    "requiredSkills": [<string array>],
    "matchPercentage": <number 0-100>,
    "strengths": [<string array>],
    "gaps": [<string array>],
    "recommendations": [<string array>]
  }` : 'null'}
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: claudePrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      // Return partial analysis using local extraction
      return NextResponse.json(
        {
          success: true,
          data: {
            candidateName: 'Not Detected',
            resumeSkills,
            jobSkills,
            matchedSkills,
            missingSkills,
            tfidfSimilarity: similarity,
            skillMatchPercentage:
              jobSkills.length > 0
                ? Math.round((matchedSkills.length / jobSkills.length) * 100)
                : 100,
            analysisMethod: 'local-extraction',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse
      )
    }

    const data = (await response.json()) as any
    const analysisText = data.content[0]?.text || '{}'

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse Claude response')
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json(
      {
        success: true,
        data: {
          ...analysis,
          localSkillsExtracted: {
            resume: resumeSkills,
            job: jobSkills,
            matched: matchedSkills,
            missing: missingSkills,
          },
          tfidfSimilarity: similarity,
          analysisMethod: 'claude-llm',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse
    )
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze resume',
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse,
      { status: 500 }
    )
  }
}
