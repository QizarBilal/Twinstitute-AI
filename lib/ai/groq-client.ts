import Groq from 'groq-sdk'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export const groqClient = GROQ_API_KEY
  ? new Groq({
      apiKey: GROQ_API_KEY,
    })
  : null

export async function generateText(
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<string> {
  if (!groqClient) {
    throw new Error('GROQ_API_KEY is not defined in environment variables')
  }

  const response = await groqClient.chat.completions.create({
    model: options?.model || 'llama-3.1-70b-versatile',
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return response.choices[0]?.message?.content || ''
}
