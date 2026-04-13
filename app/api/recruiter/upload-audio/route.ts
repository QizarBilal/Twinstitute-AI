/**
 * POST /api/recruiter/upload-audio
 * Uploads audio file to storage and returns URL
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

function apiResponse<T>(success: boolean, data?: T, error?: string): Response {
  return Response.json(
    success
      ? { success: true, data }
      : { success: false, error: error || 'Unknown error' }
  )
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob | null

    if (!audioFile) {
      return apiResponse(false, undefined, 'No audio file provided')
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
    if (!allowedTypes.includes(audioFile.type)) {
      return apiResponse(false, undefined, `Invalid audio type: ${audioFile.type}`)
    }

    // Validate file size (max 25MB for most audio APIs)
    const maxSize = 25 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return apiResponse(false, undefined, `File too large. Max size: ${maxSize / 1024 / 1024}MB`)
    }

    // Generate unique filename
    const ext = getExtensionFromMimeType(audioFile.type)
    const filename = `${uuidv4()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'audio')

    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Directory might already exist
    }

    // Write file to disk
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/audio/${filename}`

    return apiResponse(true, {
      url,
      filename,
      size: audioFile.size,
      type: audioFile.type,
    })
  } catch (error) {
    console.error('Audio upload error:', error)
    return apiResponse(
      false,
      undefined,
      error instanceof Error ? error.message : 'Upload failed'
    )
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/wav': 'wav',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
  }
  return typeMap[mimeType] || 'webm'
}
