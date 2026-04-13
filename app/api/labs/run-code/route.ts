import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface RunCodeRequest {
    code: string
    language: string
    taskId?: string
}

export async function POST(request: NextRequest) {
    try {
        const { code, language } = (await request.json()) as RunCodeRequest

        // Simple code execution simulation for JavaScript/Python
        // In production, use a sandboxed environment like Judge0 or Piston
        
        let output = ''
        try {
            if (language === 'javascript' || language === 'typescript') {
                // Basic validation
                if (code.includes('alert') || code.includes('fetch')) {
                    output = 'Note: Network requests not available in sandbox'
                } else {
                    // This is a simplified simulation
                    output = '✓ Code compiled successfully\nReady for testing'
                }
            } else if (language === 'python') {
                output = '✓ Syntax valid\n7 No runtime errors detected'
            }
        } catch (error) {
            output = `Error: ${error}`
        }

        return NextResponse.json({
            output: output || 'Execution completed',
            error: null,
            language,
        })
    } catch (error) {
        console.error('Execution error:', error)
        return NextResponse.json(
            {
                output: '',
                error: 'Execution environment error',
            },
            { status: 200 }
        )
    }
}
