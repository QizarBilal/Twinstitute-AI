/**
 * POST /api/recruiter/evaluate
 * Main interview evaluation endpoint
 * 
 * Flow:
 * 1. Receive audio URL and question details
 * 2. Transcribe audio to text
 * 3. Evaluate answer using AI
 * 4. Store in database
 * 5. Return results with score and feedback
 */

import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { transcribeAudioWithWhisper } from '@/lib/ai/transcribe'
import { evaluateInterview } from '@/lib/ai/interviewEvaluator'

interface EvaluationRequest {
  audioUrl: string
  audioBlob?: string // base64 encoded
  question: string
  role: string
  domain?: string
}

interface EvaluationResponse {
  success: boolean
  data?: any
  error?: string
}

function apiResponse(success: boolean, data?: any, error?: string): Response {
  return Response.json(
    success
      ? { success: true, data }
      : { success: false, error: error || 'Unknown error' }
  )
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Get authenticated user
    const session = await getServerSession()
    if (!session?.user?.email) {
      return apiResponse(false, undefined, 'Unauthorized')
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return apiResponse(false, undefined, 'User not found')
    }

    // Parse request body
    const body = (await req.json()) as EvaluationRequest
    const { audioUrl, audioBlob, question, role, domain } = body

    if (!audioUrl && !audioBlob) {
      return apiResponse(false, undefined, 'Audio URL or base64 blob required')
    }

    if (!question || !role) {
      return apiResponse(false, undefined, 'Question and role are required')
    }

    // Step 1: Transcribe audio
    console.log('[INTERVIEW] Starting transcription...')
    let transcript = ''

    if (audioBlob) {
      // Base64 encoded audio
      try {
        const buffer = Buffer.from(audioBlob, 'base64')
        const transcriptionResult = await transcribeAudioWithWhisper(buffer, 'audio/webm')
        if (!transcriptionResult.success) {
          throw new Error(transcriptionResult.error || 'Transcription failed')
        }
        transcript = transcriptionResult.transcript
      } catch (error) {
        console.error('Transcription error:', error)
        return apiResponse(
          false,
          undefined,
          `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    } else if (audioUrl) {
      try {
        // If the audioUrl is a local public path (e.g., /uploads/audio/xyz.webm), read file from disk
        if (audioUrl.startsWith('/')) {
          const { readFile } = await import('fs/promises')
          const path = require('path')
          const filepath = path.join(process.cwd(), 'public', audioUrl.replace(/^\//, ''))
          const buffer = await readFile(filepath)
          const ext = path.extname(filepath).replace('.', '')
          const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/webm'
          const transcriptionResult = await transcribeAudioWithWhisper(buffer, mime)
          if (!transcriptionResult.success) {
            throw new Error(transcriptionResult.error || 'Transcription failed')
          }
          transcript = transcriptionResult.transcript
        } else {
          // External URL: fetch and transcribe
          const res = await fetch(audioUrl)
          if (!res.ok) throw new Error('Failed to download audio')
          const arrayBuffer = await res.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const transcriptionResult = await transcribeAudioWithWhisper(buffer, 'audio/webm')
          if (!transcriptionResult.success) {
            throw new Error(transcriptionResult.error || 'Transcription failed')
          }
          transcript = transcriptionResult.transcript
        }
      } catch (error) {
        console.error('Transcription error (audioUrl):', error)
        return apiResponse(false, undefined, `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log('[INTERVIEW] Transcription complete:', transcript.substring(0, 100))

    if (!transcript.trim()) {
      return apiResponse(false, undefined, 'Transcription produced an empty transcript. Please record again.')
    }

    if (/^\[Transcription of audio at .*\]$/.test(transcript.trim())) {
      return apiResponse(false, undefined, 'Transcription is still using a placeholder response. Configure a real transcription API key and retry.')
    }

    // Step 2: Evaluate using AI
    console.log('[INTERVIEW] Starting AI evaluation...')
    const evaluationResult = await evaluateInterview(transcript, question, role, domain)

    if (!evaluationResult.success) {
      return apiResponse(false, undefined, evaluationResult.feedback)
    }

    console.log('[INTERVIEW] Evaluation complete. Score:', evaluationResult.score)

    // Step 3: Store in database
    console.log('[INTERVIEW] Storing evaluation in database...')
    // Generate a unique proofArtifactId to avoid unique-index collisions when the field is nullable in the schema
    const proofArtifactId = crypto.randomBytes(12).toString('hex')
    const interviewRecord = await (prisma as any).interviewEvaluation.create({
      data: {
        userId: user.id,
        question,
        role,
        domain: domain || null,
        audioUrl: audioUrl || 'blob:uploaded',
        audioFileSize: audioBlob ? Buffer.byteLength(audioBlob, 'base64') : 0,
        transcript,
        score: evaluationResult.score,
        technicalDepth: evaluationResult.detailedScores.technicalDepth,
        clarity: evaluationResult.detailedScores.clarity,
        structure: evaluationResult.detailedScores.structure,
        confidence: evaluationResult.detailedScores.confidence,
        completeness: evaluationResult.detailedScores.completeness,
        strengths: JSON.stringify(evaluationResult.strengths),
        weaknesses: JSON.stringify(evaluationResult.weaknesses),
        suggestions: JSON.stringify(evaluationResult.suggestions),
        feedback: evaluationResult.feedback,
        status: 'evaluated',
        evaluationModel: 'llama-3.3-70b',
        evaluatedAt: new Date(),
        proofArtifactId,
      },
    })

    console.log('[INTERVIEW] Stored. ID:', interviewRecord.id)

    // Step 4: Update capability twin with interview score impact
    console.log('[INTERVIEW] Updating capability twin...')
    const twin = await prisma.capabilityTwin.findUnique({
      where: { userId: user.id },
    })

    if (twin) {
      // Boost execution reliability and problem solving based on score
      const scoreBoost = (evaluationResult.score / 100) * 5 // Up to 5 point boost
      
      await prisma.capabilityTwin.update({
        where: { userId: user.id },
        data: {
          executionReliability: Math.min(100, twin.executionReliability + scoreBoost * 0.6),
          problemSolvingDepth: Math.min(100, twin.problemSolvingDepth + scoreBoost * 0.8),
          consistency: Math.min(100, twin.consistency + scoreBoost * 0.4),
          lastUpdated: new Date(),
        },
      })
    }

    // Return comprehensive result
    return apiResponse(true, {
      id: interviewRecord.id,
      score: evaluationResult.score,
      strengths: evaluationResult.strengths,
      weaknesses: evaluationResult.weaknesses,
      suggestions: evaluationResult.suggestions,
      feedback: evaluationResult.feedback,
      detailedScores: evaluationResult.detailedScores,
      transcript: transcript.substring(0, 500) + '...', // Return truncated transcript
      storedAt: interviewRecord.evaluatedAt,
    })
  } catch (error) {
    console.error('[INTERVIEW] Evaluation error:', error)
    return apiResponse(
      false,
      undefined,
      error instanceof Error ? error.message : 'Evaluation failed'
    )
  }
}
