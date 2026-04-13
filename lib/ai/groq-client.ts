import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not defined in environment variables')
}

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateText(
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<string> {
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
