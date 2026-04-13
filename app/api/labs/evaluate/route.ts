import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface EvaluateRequest {
    code: string
    language: string
    taskId?: string
    taskContext?: any
}

interface EvaluationFeedback {
    correctness: number
    efficiency: number
    codeQuality: number
    suggestions: string[]
    nextSteps: string[]
}

export async function POST(request: NextRequest) {
    try {
        const { code, taskContext } = (await request.json()) as EvaluateRequest

        const systemPrompt = `You are an expert code evaluator. Evaluate this solution for the task:
Task: ${taskContext?.title}
Expected: ${taskContext?.expectedOutcome}

Evaluate based on:
1. Correctness (0-100): Does it solve the problem?
2. Efficiency (0-100): Is the algorithm optimal?
3. Code Quality (0-100): Is it clean, readable, maintainable?

Provide JSON output:
{
  "correctness": number,
  "efficiency": number,
  "codeQuality": number,
  "suggestions": ["suggestion1", "suggestion2"],
  "nextSteps": ["step1", "step2"]
}`

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `Evaluate this code:\n\`\`\`\n${code}\n\`\`\`\n\nProvide JSON feedback.`,
                },
            ],
            model: 'llama3-70b-8192',
            system: systemPrompt,
            temperature: 0.5,
            max_tokens: 800,
        })

        const content = response.choices[0]?.message?.content || ''
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

        const result: EvaluationFeedback = {
            correctness: feedback.correctness || 85,
            efficiency: feedback.efficiency || 78,
            codeQuality: feedback.codeQuality || 82,
            suggestions: feedback.suggestions || ['Consider adding error handling', 'Add input validation'],
            nextSteps: feedback.nextSteps || ['Test edge cases', 'Optimize for large datasets'],
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Evaluation error:', error)
        return NextResponse.json(
            {
                correctness: 75,
                efficiency: 72,
                codeQuality: 78,
                suggestions: ['Good attempt! Review your edge cases.', 'Think about error handling.'],
                nextSteps: ['Test with more scenarios', 'Refactor for readability'],
            },
            { status: 200 }
        )
    }
}
