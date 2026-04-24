/**
 * RESUME AI AGENT
 * AI-powered resume building, optimization, and ATS enhancement
 * Uses GROQ_RESUME_BUILDER_KEY for content generation
 * 
 * Features:
 * - AI-powered content generation (HR/ATS-friendly)
 * - Real-time enhancement while editing
 * - Job description comparison
 * - ATS scoring and recommendations
 * - Template management (8-10 ATS-friendly templates)
 */

import Groq from "groq-sdk";

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

// ═══════════════════════════════════════════════════════════════════
// 📝 RESUME CONTENT ENHANCEMENT
// ═══════════════════════════════════════════════════════════════════

export async function enhanceResumeContent(
  request: ResumeEnhancementRequest
): Promise<ResumeEnhancementResponse | null> {
  const groqClient = getResumeGroqClient();
  if (!groqClient) {
    console.warn("Groq client not available");
    return null;
  }

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

    const response = await groqClient.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Failed to parse enhancement response");
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
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
  const groqClient = getResumeGroqClient();
  if (!groqClient) {
    console.warn("Groq client not available");
    return null;
  }

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

    const response = await groqClient.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Failed to parse comparison response");
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
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
  const groqClient = getResumeGroqClient();
  if (!groqClient) {
    console.warn("Groq client not available");
    return null;
  }

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

    const response = await groqClient.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Failed to parse ATS scoring response");
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
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
  const groqClient = getResumeGroqClient();
  if (!groqClient) {
    console.warn("Groq client not available");
    return null;
  }

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

    const response = await groqClient.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating resume content:", error);
    return null;
  }
}
