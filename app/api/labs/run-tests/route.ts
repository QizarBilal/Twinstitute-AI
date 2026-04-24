import { NextRequest, NextResponse } from 'next/server'

const JUDGE0_API = 'https://ce.judge0.com'

const headers = {
  'Content-Type': 'application/json',
}

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

interface TestCase {
  input: string
  expected: string
}

interface RunTestsRequest {
  code: string
  language: string
  testCases: TestCase[]
  taskId?: string
}

interface TestResult {
  input: string
  expected: string
  output: string
  passed: boolean
  executionTime?: number
  error?: string
}

interface TestExecutionResponse {
  success: boolean
  results: TestResult[]
  score: number
  passedCount: number
  totalCount: number
  message: string
}

// Reusable function to poll Judge0 result
async function pollResult(token: string, maxAttempts = 30, hardTimeoutMs = 10000) {
  const startTime = Date.now()
  let attempt = 0
  let delay = 500

  while (attempt < maxAttempts) {
    // Hard timeout check
    if (Date.now() - startTime > hardTimeoutMs) {
      throw new Error('Polling timeout exceeded')
    }

    await new Promise((resolve) => setTimeout(resolve, delay))

    try {
      const resultResponse = await fetch(
        `${JUDGE0_API}/submissions/${token}?base64_encoded=false`,
        { method: 'GET', headers }
      )

      if (!resultResponse.ok) {
        throw new Error(`Judge0 fetch failed: ${resultResponse.statusText}`)
      }

      const result = await resultResponse.json()

      // Status codes: 1=queued, 2=processing, 3+=completed
      if (result?.status?.id >= 3) {
        return result
      }

      attempt++
      delay = Math.min(2000, delay + 250)
    } catch (error) {
      console.error(`Polling error (attempt ${attempt + 1}):`, error)
      attempt++
    }
  }

  throw new Error('Polling max attempts reached')
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, testCases } = (await request.json()) as RunTestsRequest

    // Validate input
    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one test case is required' },
        { status: 400 }
      )
    }

    // Validate language
    const languageId = languageMap[language.toLowerCase()]
    if (!languageId) {
      return NextResponse.json(
        { success: false, error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    if (code.length > 65536) {
      return NextResponse.json(
        { success: false, error: 'Code exceeds maximum length (64KB)' },
        { status: 400 }
      )
    }

    // STEP 1: Run code for each test case
    const results: TestResult[] = []
    let successfulTests = 0

    for (const testCase of testCases) {
      try {
        // Submit code with test case input
        const submissionResponse = await fetch(
          `${JUDGE0_API}/submissions?base64_encoded=false&wait=false`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              source_code: code,
              language_id: languageId,
              stdin: testCase.input || '',
              cpu_time_limit: 5,
              memory_limit: 256000,
              wall_time_limit: 10,
            }),
          }
        )

        if (!submissionResponse.ok) {
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            output: '',
            passed: false,
            error: `Failed to submit: ${submissionResponse.statusText}`,
          })
          continue
        }

        const submissionData = await submissionResponse.json()
        const token = submissionData.token

        if (!token) {
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            output: '',
            passed: false,
            error: 'No token received from Judge0',
          })
          continue
        }

        // Poll for result
        const result = await pollResult(token)

        // Extract output
        const output =
          result.stdout ??
          result.stderr ??
          result.compile_output ??
          (result.status?.description ? `Execution: ${result.status.description}` : '')

        // Compare with expected output (trim whitespace)
        const trimmedOutput = (output || '').trim()
        const trimmedExpected = testCase.expected.trim()
        const passed = trimmedOutput === trimmedExpected

        if (passed) {
          successfulTests++
        }

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: trimmedOutput,
          passed,
          executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
        })
      } catch (error) {
        console.error(`Error executing test case with input "${testCase.input}":`, error)
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: '',
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // STEP 2: Calculate score
    const score = Math.round((successfulTests / testCases.length) * 100)

    // STEP 3: Generate message
    let message = `Test Results: ${successfulTests}/${testCases.length} passed`
    if (score === 100) {
      message = `🎉 Perfect Score! All ${testCases.length} test cases passed!`
    } else if (score >= 75) {
      message = `✅ Good Progress! ${successfulTests}/${testCases.length} test cases passed (${score}%)`
    } else if (score >= 50) {
      message = `🤔 Half-way there! ${successfulTests}/${testCases.length} test cases passed (${score}%)`
    } else if (score > 0) {
      message = `⚠️ Keep trying! ${successfulTests}/${testCases.length} test cases passed (${score}%)`
    } else {
      message = `❌ No test cases passed yet. Review the expected outputs and try again.`
    }

    return NextResponse.json({
      success: score === 100,
      results,
      score,
      passedCount: successfulTests,
      totalCount: testCases.length,
      message,
    } as TestExecutionResponse)
  } catch (error) {
    console.error('Test execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
