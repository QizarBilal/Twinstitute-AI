/**
 * RESUME AI AGENT
 * AI-powered resume building, optimization, and ATS enhancement
 * Uses OpenRouter as primary provider and GROQ_RESUME_BUILDER_KEY as fallback
 * 
 * Features:
 * - AI-powered content generation (HR/ATS-friendly)
 * - Real-time enhancement while editing
 * - Job description comparison
 * - ATS scoring and recommendations
 * - Template management (8-10 ATS-friendly templates)
 */

import Groq from "groq-sdk";

const OPENROUTER_API_KEY = process.env.Open_Router_AI_Mentor_Key;
const OPENROUTER_MODEL = process.env.OPENROUTER_RESUME_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"] as const;

export interface ResumeEnhancementRequest {
  section: "summary" | "experience" | "skills" | "education" | "projects";
  currentContent: string;
  context?: {
    role?: string;
    targetRole?: string;
    jobDescription?: string;
    yearsOfExperience?: number;
  };
}

export interface ResumeEnhancementResponse {
  enhanced: string;
  suggestions: string[];
  atsScore: number;
  keywords: string[];
}

export interface JobComparisonRequest {
  resumeContent: string;
  jobDescription: string;
  targetRole?: string;
}

export interface JobComparisonResponse {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
  atsRecommendations: string[];
}

export interface ATSScoringResponse {
  score: number;
  breakdown: {
    formatting: number;
    keywords: number;
    structure: number;
    content: number;
  };
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 GROQ CLIENT FOR RESUME BUILDER
// ═══════════════════════════════════════════════════════════════════

function getResumeGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_RESUME_BUILDER_KEY;
  if (!apiKey) {
    console.warn("⚠️ GROQ_RESUME_BUILDER_KEY not set");
    return null;
  }

  try {
    return new Groq({ apiKey });
  } catch (error) {
    console.error("❌ Failed to create Groq client:", error);
    return null;
  }
}

function extractJsonObject(text: string): any | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

async function runOpenRouterJsonCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<any | null> {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as any;
    const text = data?.choices?.[0]?.message?.content || "";
    return extractJsonObject(text);
  } catch {
    return null;
  }
}

async function runGroqJsonCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<any | null> {
  const groqClient = getResumeGroqClient();
  if (!groqClient) {
    return null;
  }

  for (const model of GROQ_MODELS) {
    try {
      const response = await groqClient.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || "";
      const parsed = extractJsonObject(content);
      if (parsed) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function runResumeJsonWithFallback(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<any | null> {
  const openRouterResult = await runOpenRouterJsonCompletion(systemPrompt, userPrompt, maxTokens);
  if (openRouterResult) {
    return openRouterResult;
  }

  return runGroqJsonCompletion(systemPrompt, userPrompt, maxTokens);
}

// ═══════════════════════════════════════════════════════════════════
// 📝 RESUME CONTENT ENHANCEMENT
// ═══════════════════════════════════════════════════════════════════

export async function enhanceResumeContent(
  request: ResumeEnhancementRequest
): Promise<ResumeEnhancementResponse | null> {
  try {
    const { section, currentContent, context } = request;

    const systemPrompt = `You are an expert HR professional and ATS specialist. You help candidates write powerful, ATS-friendly resume content that gets past automated screening systems while impressing human recruiters.

Guidelines:
- Use action verbs and quantifiable achievements
- Include industry keywords naturally
- Keep sentences concise and impactful
- Focus on results and impact
- Avoid images, tables, and special formatting
- Use standard formatting and clear structure
- Highlight relevant skills and experience`;

    const userPrompt = `Enhance this ${section} section of a resume to be more ATS-friendly and impactful.

Current Content:
${currentContent}

${context?.role ? `\nCurrent Role: ${context.role}` : ""}
${context?.targetRole ? `\nTarget Role: ${context.targetRole}` : ""}
${context?.jobDescription ? `\nJob Description:\n${context.jobDescription}` : ""}
${context?.yearsOfExperience ? `\nYears of Experience: ${context.yearsOfExperience}` : ""}

Provide response in JSON format:
{
  "enhanced": "improved content here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "atsScore": <0-100>
}`;

    const result = await runResumeJsonWithFallback(systemPrompt, userPrompt, 1500);
    if (!result) {
      return null;
    }

    return result as ResumeEnhancementResponse;
  } catch (error) {
    console.error("Error enhancing resume content:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 JOB DESCRIPTION COMPARISON
// ═══════════════════════════════════════════════════════════════════

export async function compareResumeWithJob(
  request: JobComparisonRequest
): Promise<JobComparisonResponse | null> {
  try {
    const { resumeContent, jobDescription, targetRole } = request;

    const systemPrompt = `You are an expert ATS analyst and recruiter. Analyze resumes against job descriptions to identify matches, gaps, and opportunities.

Focus on:
- Hard skills match
- Experience level alignment
- Keywords and terminology
- Role-specific requirements`;

    const userPrompt = `Compare this resume with the job description and provide actionable insights.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

${targetRole ? `\nTarget Role: ${targetRole}` : ""}

Provide response in JSON format:
{
  "matchScore": <0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "suggestedImprovements": ["improvement1", "improvement2"],
  "atsRecommendations": ["recommendation1", "recommendation2"]
}`;

    const result = await runResumeJsonWithFallback(systemPrompt, userPrompt, 1500);
    if (!result) {
      return null;
    }

    return result as JobComparisonResponse;
  } catch (error) {
    console.error("Error comparing resume with job:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📊 ATS SCORING
// ═══════════════════════════════════════════════════════════════════

export async function scoreResumeATS(
  resumeContent: string
): Promise<ATSScoringResponse | null> {
  try {
    const systemPrompt = `You are an expert ATS system analyst. Score resumes on their compatibility with Applicant Tracking Systems.

Scoring criteria:
- Formatting (0-100): Plain text, standard fonts, logical structure
- Keywords (0-100): Industry terms, technical skills, role-specific terms
- Structure (0-100): Clear sections, consistent formatting, proper hierarchy
- Content (0-100): Quantifiable achievements, action verbs, relevance`;

    const userPrompt = `Score this resume on ATS compatibility:

${resumeContent}

Provide response in JSON format:
{
  "score": <0-100>,
  "breakdown": {
    "formatting": <0-100>,
    "keywords": <0-100>,
    "structure": <0-100>,
    "content": <0-100>
  },
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const result = await runResumeJsonWithFallback(systemPrompt, userPrompt, 1000);
    if (!result) {
      return null;
    }

    return result as ATSScoringResponse;
  } catch (error) {
    console.error("Error scoring resume ATS:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 ATS-FRIENDLY RESUME TEMPLATES
// ═══════════════════════════════════════════════════════════════════

export const RESUME_TEMPLATES = [
  {
    id: "modern-ats-v1",
    name: "Modern ATS Professional",
    description: "Clean, modern design optimized for ATS parsing",
    category: "modern",
    atsScore: 98,
  },
  {
    id: "classic-corporate",
    name: "Classic Corporate",
    description: "Traditional professional format, highly compatible",
    category: "traditional",
    atsScore: 100,
  },
  {
    id: "tech-focused",
    name: "Tech Focused",
    description: "Designed for tech roles and engineer positions",
    category: "tech",
    atsScore: 97,
  },
  {
    id: "creative-ats",
    name: "Creative with ATS",
    description: "Creative layout that's still ATS-friendly",
    category: "creative",
    atsScore: 92,
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Minimal design with maximum readability",
    category: "minimal",
    atsScore: 99,
  },
  {
    id: "data-driven",
    name: "Data-Driven Resume",
    description: "Perfect for data science and analytics roles",
    category: "specialized",
    atsScore: 96,
  },
  {
    id: "executive-resume",
    name: "Executive Resume",
    description: "Designed for senior management positions",
    category: "executive",
    atsScore: 95,
  },
  {
    id: "startup-culture",
    name: "Startup Culture",
    description: "Perfect for startup and fast-paced environments",
    category: "modern",
    atsScore: 94,
  },
  {
    id: "academic-research",
    name: "Academic & Research",
    description: "For academic and research-focused positions",
    category: "academic",
    atsScore: 98,
  },
  {
    id: "functional-hybrid",
    name: "Functional-Hybrid",
    description: "Combines functional and chronological formats",
    category: "hybrid",
    atsScore: 93,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 🎯 GENERATE CONTENT FOR SPECIFIC CONTEXT
// ═══════════════════════════════════════════════════════════════════

export async function generateResumeContent(
  context: {
    role: string;
    targetPosition: string;
    yearsExperience: number;
    skills: string[];
  }
): Promise<{
  summary: string;
  keywords: string[];
} | null> {
  try {
    const systemPrompt = `You are a resume writer expert. Generate powerful, ATS-optimized resume content that showcases impact and results.`;

    const userPrompt = `Generate a professional resume summary for:
    
Role: ${context.role}
Target Position: ${context.targetPosition}
Years of Experience: ${context.yearsExperience}
Key Skills: ${context.skills.join(", ")}

Provide response in JSON format:
{
  "summary": "2-3 sentence professional summary",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const result = await runResumeJsonWithFallback(systemPrompt, userPrompt, 800);
    if (!result) {
      return null;
    }

    return {
      summary: typeof result.summary === "string" ? result.summary : "",
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
    };
  } catch (error) {
    console.error("Error generating resume content:", error);
    return null;
  }
}
