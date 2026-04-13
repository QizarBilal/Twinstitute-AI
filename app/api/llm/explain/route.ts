import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const apiKey = process.env.GROQ_API_KEY
        
        const systemPrompt = body.systemPrompt || `You are an elite technical career advisor. Return ONLY a valid JSON object matching this schema or similar to answer the prompt appropriately. Fallback schema: { "explanation": "string" }`
        const userPrompt = body.prompt || JSON.stringify(body)

        let messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userPrompt
            }
        ];

        if (apiKey) {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                try {
                    return NextResponse.json(JSON.parse(content));
                } catch(e) {
                    return NextResponse.json({ explanation: content });
                }
            } else {
                console.error("Groq API Error:", await response.text());
            }
        }
        
        // Universal fallbacks for all structures the frontend might expect if offline
        return NextResponse.json({
             explanation: 'A rigorous technological discipline requiring systemic analysis and deep problem solving.',
             marketDemand: 'Exceptionally High',
             salaryRange: '$95k - $160k',
             requiredSkills: ['System Architecture', 'Coding', 'Algorithms'],
             recommendedPath: 'Advanced Engineering Track',
             recommendations: [
                { role: 'Software Engineer', reason: 'Matches your inputs', confidence: 90 },
                { role: 'Data Engineer', reason: 'Aligns with logic focus', confidence: 85 },
                { role: 'Cloud Architect', reason: 'High market demand', confidence: 80 }
             ],
             question: 'Can you describe a challenging technical problem you recently solved?'
        })
        
    } catch (error) {
        console.error("LLM Route Error:", error);
        return NextResponse.json({ explanation: 'Service currently unavailable.' }, { status: 500 })
    }
}
