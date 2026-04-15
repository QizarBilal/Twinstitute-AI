import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

interface TaskGenerationRequest {
    difficulty: number
    weakAreas: string[]
}

interface GeneratedTask {
    id: string
    title: string
    description: string
    constraints: string[]
    expectedOutcome: string
    difficulty: number
    taskType: 'coding' | 'debugging' | 'system_design' | 'optimization'
    starterCode: string
    language: 'javascript' | 'python' | 'typescript'
}

export async function POST(request: NextRequest) {
    try {
        if (!groq) {
            throw new Error('GROQ_API_KEY not configured')
        }

        const { difficulty, weakAreas } = (await request.json()) as TaskGenerationRequest

        const systemPrompt = `You are an AI task generator for Twinstitute Labs. Generate real-world coding tasks.

Generate a JSON task with this structure:
{
  "title": "Clear task name",
  "description": "What to build",
  "constraints": ["Constraint 1", "Constraint 2"],
  "expectedOutcome": "What success looks like",
  "difficulty": ${Math.min(difficulty, 10)},
  "taskType": "coding",
  "starterCode": "// starter code here",
  "language": "javascript"
}

Make tasks progressively harder. Focus on: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'fundamentals'}`

        const userPrompt = `Generate a coding task at difficulty level ${difficulty}. ${weakAreas.length > 0 ? `Focus on these weak areas: ${weakAreas.join(', ')}` : 'Choose a fundamental topic.'} Return only valid JSON.`

        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            model: 'llama3-70b-8192',
            temperature: 0.7,
            max_tokens: 1000,
        })

        const content = response.choices[0]?.message?.content || ''
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const taskData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

        const task: GeneratedTask = {
            id: `task_${Date.now()}`,
            title: taskData.title || 'Coding Challenge',
            description: taskData.description || 'Build a solution',
            constraints: taskData.constraints || [],
            expectedOutcome: taskData.expectedOutcome || 'Working solution',
            difficulty: taskData.difficulty || difficulty,
            taskType: taskData.taskType || 'coding',
            starterCode: taskData.starterCode || '// Your code here',
            language: taskData.language || 'javascript',
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error('Task generation error:', error)
        return NextResponse.json(
            {
                id: `task_${Date.now()}`,
                title: 'REST API Endpoint Design',
                description: 'Design and implement a scalable REST API for a user management system.',
                constraints: [
                    'Must support pagination',
                    'Implement proper error handling',
                    'Use appropriate HTTP status codes',
                ],
                expectedOutcome: 'Working API endpoints that pass all tests',
                difficulty: 7,
                taskType: 'coding',
                starterCode: 'function createAPI() {\n  // Implement API\n}',
                language: 'javascript',
            },
            { status: 200 }
        )
    }
}
