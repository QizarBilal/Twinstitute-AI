// lib/orientation/groq-integration.ts
// GROQ AI Integration for role explanations and comparisons
// All functions include fallback support when GROQ is unavailable

import Groq from "groq-sdk";
import { Role } from "./role-database";

const GROQ_API_KEY = process.env.GROQ_ORIENTATION_KEY || process.env.GROQ_API_KEY;

if (!GROQ_API_KEY && typeof window === "undefined") {
  console.warn("Warning: GROQ_ORIENTATION_KEY not set. AI will use fallback mode.");
}

let groqClient: Groq | null | undefined;
let initialized = false;

// Lazy initialization function
function initializeGroq(): Groq | null {
  if (initialized) return groqClient as Groq | null;
  initialized = true;

  try {
    // Only initialize on server-side
    if (typeof window !== "undefined") {
      console.warn("Cannot initialize Groq on client-side");
      groqClient = null;
      return null;
    }

    if (!GROQ_API_KEY) {
      console.warn("GROQ_ORIENTATION_KEY or GROQ_API_KEY not set, using fallback mode");
      groqClient = null;
      return null;
    }

    groqClient = new Groq({ apiKey: GROQ_API_KEY });
    
    // Verify client initialization - use chat.completions.create (correct Groq SDK API)
    if (!groqClient || typeof groqClient.chat?.completions?.create !== 'function') {
      console.warn("Groq client initialized but chat.completions.create not available");
      groqClient = null;
      return null;
    }
    
    console.log("✓ GROQ client initialized successfully with chat API");
    return groqClient;
  } catch (error) {
    console.error("Failed to initialize Groq client:", error instanceof Error ? error.message : String(error));
    groqClient = null;
    return null;
  }
}

// Helper function to safely get client
function getGroqClient(): Groq | null {
  if (!initialized) {
    initializeGroq();
  }
  // Double-check the client is valid before returning  
  if (groqClient && typeof groqClient.chat?.completions?.create === 'function') {
    return groqClient;
  }
  return null;
}

const MODEL = "llama-3.3-70b-versatile";

export interface AIExplanation {
  text: string;
  metadata: {
    role: string;
    type: "role-explanation" | "comparison" | "gap-analysis" | "reasoning";
  };
}

// ====== ROLE EXPLANATION ======
export async function explainRole(role: Role): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.messages?.create !== 'function') {
    return {
      text: `${role.name} involves ${role.dailyWork.join(", ")}. Key skill requirements: ${role.requiredSkills.map(s => s.name).join(", ")}. Growth potential: ${role.growthPath.slice(0, 2).join(" → ")}`,
      metadata: { role: role.id, type: "role-explanation" },
    };
  }

  const prompt = `You are a career mentor. Explain the following job role in a human, conversational way.

Role: ${role.name}
Daily Work: ${role.dailyWork.join(", ")}
Description: ${role.description}

Write 2-3 paragraphs explaining:
1. What they actually do (specific, not generic)
2. Skills that matter most and why
3. What would be hard and rewarding

Be honest about challenges.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0].message.content as any;
    const text = typeof content === 'string' ? content : `${role.name}: ${role.dailyWork.join(', ')}`;

    return {
      text,
      metadata: { role: role.id, type: "role-explanation" },
    };
  } catch (error) {
    console.error("Error explaining role:", error instanceof Error ? error.message : String(error));
    return {
      text: `${role.name} involves: ${role.dailyWork}. Challenges: ${role.challenges}`,
      metadata: { role: role.id, type: "role-explanation" },
    };
  }
}

// ====== ROLE COMPARISON ======
export async function compareRolesWithAI(roles: Role[]): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.chat?.completions?.create !== 'function' || roles.length < 2) {
    const comparison = roles
      .map((r) => `${r.name} (${r.difficulty}, ${r.demandLevel})`)
      .join(" vs ");
    return {
      text: `Comparing: ${comparison}. Each role offers distinct growth paths and requires different skill sets.`,
      metadata: { role: roles.map((r) => r.id).join("-"), type: "comparison" },
    };
  }

  const rolesSummary = roles
    .map((r) => `${r.name}: ${r.difficulty} difficulty, ${r.demandLevel} demand, Salary range: ${r.salaryRangeIndia.entry}L-${r.salaryRangeIndia.senior}L, Daily work: ${r.dailyWork}`)
    .join("\n");

  const prompt = `You are a career advisor comparing job roles to help someone choose between them.

Roles to compare:
${rolesSummary}

Write a detailed comparison (4-5 paragraphs) that covers these aspects WITHOUT using asterisks, bullet points, or markdown formatting:

1. CORE DIFFERENCES: What fundamentally separates these roles? What problems does each solve? What is the daily reality different?

2. THINKING STYLE & PERSONALITY: Which cognitive types and work styles excel in each role? Who thrives in one but struggles in another?

3. GROWTH TRAJECTORIES: Where does each role lead 5-10 years later? What career paths branch from each?

4. WORK ENVIRONMENT & LIFESTYLE: Speed of feedback loops, work environment, remote potential, team dynamics, burnout risk, work-life balance.

5. COMPENSATION & CEILING: How do salaries progress? What's the income potential ceiling in each? Bonus structures?

6. HONEST ASSESSMENT: For someone choosing between these, what should they really know? What common misconceptions exist?

Write naturally without any markdown formatting or asterisks. Be specific and concrete with examples.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : `Comparing ${roles.map((r) => r.name).join(" vs ")}. Each offers different growth paths and work environments.`;

    return {
      text,
      metadata: { role: roles.map((r) => r.id).join("-"), type: "comparison" },
    };
  } catch (error) {
    console.error("Error comparing roles:", error instanceof Error ? error.message : String(error));
    return {
      text: `Comparing ${roles.map((r) => r.name).join(" vs ")}. Backend and data roles focus on systems thinking and logic. Frontend emphasizes user experience and visual feedback. DevOps prioritizes infrastructure, stability, and automation. Your choice depends on whether you prefer working on core systems, user-facing features, or operational infrastructure.`,
      metadata: { role: roles.map((r) => r.id).join("-"), type: "comparison" },
    };
  }
}

// ====== SKILL GAP ANALYSIS ======
export async function analyzeSkillGap(
  targetRole: Role,
  userSkills: string[],
  missingSkills: string[]
): Promise<AIExplanation> {
  const client = getGroqClient();
  
  // Defensive check - ensure client is valid Groq instance
  if (!client || typeof client.chat?.completions?.create !== 'function') {
    const monthsEstimate = missingSkills.length > 3 ? "6-12" : "3-6";
    const fallbackText = `You have ${userSkills.length} relevant skills. Missing skills: ${missingSkills.join(", ")}. Realistic learning time: ${monthsEstimate} months.`;
    console.log("Falling back for skill gap analysis - using built-in estimation");
    return {
      text: fallbackText,
      metadata: { role: targetRole.id, type: "gap-analysis" },
    };
  }

  const userSkillsStr = userSkills.join(", ") || "None yet";
  const missingSkillsStr = missingSkills.join(", ");

  const prompt = `Help someone transition to a new role.

Target Role: ${targetRole.name}
Current Skills: ${userSkillsStr}
Missing Skills: ${missingSkillsStr}

Write 2-3 paragraphs:
1. Acknowledge current skills and how they transfer
2. Explain missing skills in context (why they matter)
3. Realistic path to fill gaps (in months)
4. Be encouraging but honest

Feel like a mentor, not a sales pitch.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0].message.content;
    const text = typeof content === 'string' ? content : `Path to ${targetRole.name}: Master ${missingSkillsStr}`;

    return {
      text,
      metadata: { role: targetRole.id, type: "gap-analysis" },
    };
  } catch (error) {
    console.error("Error analyzing gap:", error instanceof Error ? error.message : String(error));
    const monthsEstimate = missingSkills.length > 3 ? "6-12" : "3-6";
    return {
      text: `Current skills: ${userSkillsStr}. Focus on: ${missingSkillsStr}. Learning path: ~${monthsEstimate} months.`,
      metadata: { role: targetRole.id, type: "gap-analysis" },
    };
  }
}

// ====== COGNITIVE TYPE MATCHING ======
export async function explainCognitiveMatch(
  cognitiveType: string,
  relatedRoles: Role[]
): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.chat?.completions?.create !== 'function' || relatedRoles.length === 0) {
    const rolesStr = relatedRoles.map((r) => r.name).join(", ") || "multiple roles";
    return {
      text: `As a ${cognitiveType} thinker, you'd excel in: ${rolesStr}`,
      metadata: { role: cognitiveType, type: "reasoning" },
    };
  }

  const rolesStr = relatedRoles.map((r) => r.name).join(", ");

  const prompt = `Explain cognitive type matching.

Type: "${cognitiveType}"
Roles: ${rolesStr}

Write 2-3 paragraphs:
1. What "${cognitiveType}" thinking means concretely
2. Why these roles suit this type
3. What would frustrate this type in other roles

Use specific examples.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0].message.content;
    const text = typeof content === 'string' ? content : `${cognitiveType} thinkers thrive in: ${rolesStr}`;

    return {
      text,
      metadata: { role: cognitiveType, type: "reasoning" },
    };
  } catch (error) {
    console.error("Error matching cognitive type:", error instanceof Error ? error.message : String(error));
    return {
      text: `${cognitiveType}: Good fit for ${rolesStr}`,
      metadata: { role: cognitiveType, type: "reasoning" },
    };
  }
}

// ====== GROWTH PATH EXPLANATION ======
export async function explainGrowthPath(role: Role): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client) {
    return {
      text: `Growth path: ${role.growthPath.join(" → ")}. Salary: ${role.salaryRangeIndia.junior} (entry) to ${role.salaryRangeIndia.senior} (senior).`,
      metadata: { role: role.id, type: "reasoning" },
    };
  }

  const growthPathStr = role.growthPath.join(" → ");

  const prompt = `Explain career progression.

Role: ${role.name}
Growth Paths: ${growthPathStr}
Salary: ${role.salaryRangeIndia.junior} → ${role.salaryRangeIndia.mid} → ${role.salaryRangeIndia.senior}

Write 2-3 paragraphs:
1. What each path looks like practically
2. Decision points
3. Salary progression
4. Time horizons

Be realistic. IC track is valid too.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0].message.content;
    const text = typeof content === 'string' ? content : `Career paths: ${growthPathStr}`;

    return {
      text,
      metadata: { role: role.id, type: "reasoning" },
    };
  } catch (error) {
    console.error("Error explaining growth path:", error);
    return {
      text: `Growth: ${growthPathStr}. Entry: ${role.salaryRangeIndia.junior}, Senior: ${role.salaryRangeIndia.senior}`,
      metadata: { role: role.id, type: "reasoning" },
    };
  }
}

// ====== FALLBACK VALIDATION ======
export async function validateAIResponse(text: string): Promise<boolean> {
  return text && text.length > 50 && !text.toLowerCase().includes("error");
}

export function hasGroqClient(): boolean {
  const client = getGroqClient();
  return client !== null;
}
