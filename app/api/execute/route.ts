import { NextRequest, NextResponse } from 'next/server'

const JUDGE0_API = 'https://ce.judge0.com'

const headers = {
  'Content-Type': 'application/json',
}

// Language ID mapping for Judge0
// Reference: https://ce.judge0.com/languages
const languageMap: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
  kotlin: 78,
  swift: 83,
}

interface ExecuteRequest {
  code: string
  language: string
  stdin?: string
  taskId?: string
}

interface Judge0Response {
  token?: string
  status?: {
    id: number
    description: string
  }
  stdout?: string
  stderr?: string
  compile_output?: string
  time?: string
  memory?: number
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, stdin = '' } = (await request.json()) as ExecuteRequest

    // Validate language
    const languageId = languageMap[language.toLowerCase()]
    if (!languageId) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported language: ${language}. Supported: ${Object.keys(languageMap).join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate code length (max 64KB)
    if (code.length > 65536) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code exceeds maximum length (64KB)',
        },
        { status: 400 }
      )
    }

    // STEP 1: Submit Code to Judge0
    let token: string
    try {
      const submissionResponse = await fetch(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=false`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: stdin || '',
            cpu_time_limit: 5,
            memory_limit: 256000,
            wall_time_limit: 10,
          }),
        }
      )

      if (!submissionResponse.ok) {
        throw new Error(`Judge0 submission failed: ${submissionResponse.statusText}`)
      }

      const submissionData = (await submissionResponse.json()) as Judge0Response
      token = submissionData.token

      if (!token) {
        throw new Error('No token received from Judge0')
      }
    } catch (error) {
      console.error('Judge0 submission error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to submit code for execution',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 503 }
      )
    }

    // STEP 2: Poll for Result (with exponential backoff + hard timeout)
    let result: Judge0Response | null = null
    const maxAttempts = 30
    const hardTimeoutMs = 10000 // 10 second hard timeout
    const startTime = Date.now()
    let attempt = 0
    let delay = 500 // Start with 500ms

    while (attempt < maxAttempts) {
      // Check hard timeout
      if (Date.now() - startTime > hardTimeoutMs) {
        console.warn('Polling reached hard timeout limit')
        break
      }

      await new Promise((resolve) => setTimeout(resolve, delay))

      try {
        const resultResponse = await fetch(
          `${JUDGE0_API}/submissions/${token}?base64_encoded=false`,
          { method: 'GET', headers }
        )

        if (!resultResponse.ok) {
          throw new Error(`Judge0 result fetch failed: ${resultResponse.statusText}`)
        }

        result = (await resultResponse.json()) as Judge0Response

        // Status codes: 1=queued, 2=processing, 3+=completed
        if (result?.status?.id >= 3) {
          break
        }

        attempt++
        // Exponential backoff: 500ms, 750ms, 1000ms, 1500ms, 2000ms (max)
        delay = Math.min(2000, delay + 250)
      } catch (error) {
        console.error(`Judge0 polling error (attempt ${attempt + 1}):`, error)
        attempt++
      }
    }

    if (!result?.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution service unavailable. Please try again.',
          status: 'Service Unavailable',
        },
        { status: 503 }
      )
    }

    // STEP 3: Format and Return Output
    // Prefer stdout, fallback to stderr, then compile_output, then description, then generic message
    const output =
      result.stdout ??
      result.stderr ??
      result.compile_output ??
      (result.status?.description ? `Execution completed: ${result.status.description}` : 'No output produced')
    const statusDescription = result.status?.description ?? 'Unknown Status'

    // Determine success based on status code (3 = Accepted)
    const isSuccess = result.status?.id === 3

    return NextResponse.json({
      success: isSuccess,
      output: output.trim(),
      status: statusDescription,
      executionTime: result.time ? parseFloat(result.time).toFixed(3) : '0.000',
      memory: result.memory ? Math.round(result.memory / 1024) : 0, // Convert to KB
      language,
      raw: {
        stdout: result.stdout || null,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
      },
    })
  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during code execution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
