import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

interface HintRequest {
    taskId?: string
    level: number
    taskContext?: any
}

export async function POST(request: NextRequest) {
    try {
        if (!groq) {
            throw new Error('GROQ_API_KEY not configured')
        }

        const { taskContext, level } = (await request.json()) as HintRequest

        const hintPrompts = {
            1: 'Give a directional hint about the approach - what area should they focus on?',
            2: 'Provide a partial solution hint or pseudocode overview',
            3: 'Give step-by-step guidance on the key concepts needed',
        }

        const systemPrompt = `You are a coding mentor providing a level ${level} hint for this task:
Task: ${taskContext?.title}
Description: ${taskContext?.description}
Constraints: ${taskContext?.constraints?.join(', ') || 'None'}

${hintPrompts[level as keyof typeof hintPrompts] || 'Help the student solve this'}

Be concise and educational.`

        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Provide a helpful hint.' },
            ],
            model: 'llama3-70b-8192',
            temperature: 0.5,
            max_tokens: 300,
        })

        const hint = response.choices[0]?.message?.content || 'Think about breaking the problem into smaller parts.'

        return NextResponse.json({ hint })
    } catch (error) {
        console.error('Hint generation error:', error)
        const hints = [
            'Try breaking down the problem into smaller functions.',
            'Think about edge cases - what inputs might break your solution?',
            'Consider the time and space complexity of your approach.',
        ]
        return NextResponse.json({ hint: hints[Math.floor(Math.random() * hints.length)] }, { status: 200 })
    }
}
