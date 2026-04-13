import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface MentorRequest {
    message: string
    taskId?: string
    taskContext?: any
    conversationHistory: Array<{ role: string; content: string }>
}

export async function POST(request: NextRequest) {
    try {
        const { message, taskContext, conversationHistory } = (await request.json()) as MentorRequest

        const systemPrompt = `You are an expert AI coding mentor at Twinstitute. Your role is to:
        
1. Teach concepts clearly through questions, not by giving full answers
2. Guide students toward solutions with hints and guidance
3. Ask clarifying questions to deepen understanding
4. Provide constructive feedback on their thinking process
5. Encourage exploration and self-discovery

Current task: ${taskContext?.title || 'General coding help'}
Task description: ${taskContext?.description || ''}

Guidelines:
- Be encouraging and supportive
- Ask "What do you think about..." rather than "Here's how..."
- Break down problems into smaller parts
- Reference relevant concepts from computer science
- Be concise and focused`

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...conversationHistory
                .slice(-5)
                .map(msg => ({
                    role: (msg.role === 'mentor' ? 'assistant' : 'user') as 'assistant' | 'user',
                    content: msg.content,
                })),
            { role: 'user' as const, content: message },
        ]

        const response = await groq.chat.completions.create({
            messages,
            model: 'llama3-70b-8192',
            temperature: 0.7,
            max_tokens: 500,
        })

        const mentorResponse = response.choices[0]?.message?.content || "I'm here to help! What would you like to explore?"

        return NextResponse.json({ response: mentorResponse })
    } catch (error) {
        console.error('Mentor error:', error)
        return NextResponse.json(
            { response: 'Let me think about that. Can you elaborate on your question?' },
            { status: 200 }
        )
    }
}
