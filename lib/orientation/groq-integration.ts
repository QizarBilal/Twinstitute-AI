// lib/orientation/groq-integration.ts
// GROQ AI Integration for role explanations and comparisons

import Groq from "groq-sdk";
import { Role } from "./role-intelligence";

const GROQ_API_KEY = process.env.GROQ_ORIENTATION_KEY || process.env.GROQ_API_KEY;

if (!GROQ_API_KEY && typeof window === "undefined") {
  console.warn("Warning: GROQ_ORIENTATION_KEY not set. AI explanations will use fallback.");
}

let groqClient: Groq | null | undefined;
let initialized = false;

// Lazy initialization
function initializeGroq(): Groq | null {
  if (initialized) return groqClient as Groq | null;
  initialized = true;

  try {
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
    
    // Verify client initialization
    if (!groqClient || typeof groqClient.chat?.completions?.create !== 'function') {
      console.warn("Groq client initialized but chat.completions.create not available");
      groqClient = null;
      return null;
    }
    
    console.log("✓ GROQ client initialized successfully with chat completions API");
    return groqClient;
  } catch (error) {
    console.error("Failed to initialize Groq client:", error instanceof Error ? error.message : String(error));
    groqClient = null;
    return null;
  }
}

function getGroqClient(): Groq | null {
  if (!initialized) {
    return initializeGroq();
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
/**
 * Generate human-friendly explanation of what a role actually does
 */
export async function explainRole(role: Role): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.chat?.completions?.create !== 'function') {
    return {
      text: `${role.name} involves ${role.dailyWork}. Key challenges: ${role.challenges}. Growth potential through: ${role.growthPath.join(" → ")}`,
      metadata: { role: role.id, type: "role-explanation" },
    };
  }

  const prompt = `You are a career mentor. Explain the following job role in a human, conversational way that helps someone understand what they'd actually be doing daily.

Role: ${role.name}
Daily Work: ${role.dailyWork}
Challenges: ${role.challenges}

Write 2-3 paragraphs that:
1. Explain what they actually do (not generic)
2. What skills matter most and why
3. What would be hard and rewarding

Be honest about challenges, not just benefits. Make it personal and real.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : "Could not generate explanation";

    return {
      text,
      metadata: {
        role: role.id,
        type: "role-explanation",
      },
    };
  } catch (error) {
    console.error("Error explaining role:", error instanceof Error ? error.message : String(error));
    return {
      text: `${role.name} involves: ${role.dailyWork}`,
      metadata: { role: role.id, type: "role-explanation" },
    };
  }
}

// ====== ROLE COMPARISON ======
/**
 * Compare two or more roles and explain the key differences
 */
export async function compareRolesWithAI(roles: Role[]): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.chat?.completions?.create !== 'function') {
    const roleNames = roles.map((r) => r.name).join(" vs ");
    return {
      text: `Considering ${roleNames}: These roles differ in core focus, work environment, and growth paths. Research the daily responsibilities, compensation ranges, and career trajectories for each. Interview professionals in these roles to understand the real differences beyond job titles, and consider how each aligns with your problem-solving style and career goals.`,
      metadata: { role: roles.map((r) => r.id).join("-"), type: "comparison" },
    };
  }

  const rolesSummary = roles
    .map(
      (r) =>
        `${r.name}: ${r.difficulty} difficulty, ${r.demandLevel} demand, Salary: ${r.salaryRangeIndia.entry}L-${r.salaryRangeIndia.senior}L, Daily: ${r.dailyWork}`
    )
    .join("\n");

  const prompt = `You are a career mentor comparing job roles for someone who's confused between them. Write WITHOUT using asterisks, bullet points, or any markdown formatting.

Roles to compare:
${rolesSummary}

Write 4-5 detailed paragraphs that cover:

1. CORE DIFFERENCES: What fundamentally separates these roles? What does each day actually look like? What problems does each solve differently?

2. THINKING STYLE & PERSONALITY: Which cognitive types and work styles excel in each role? Who thrives in one but struggles in another? What's the personality match?

3. GROWTH TRAJECTORIES: Where does each role lead 5-10 years later? What career paths branch from each? Which has more lateral moves?

4. WORK ENVIRONMENT & LIFESTYLE: Speed of feedback, work environment, remote potential, team dynamics, burnout risk, work-life balance. Which is more sustainable?

5. COMPENSATION & POTENTIAL: How do salaries progress? What's the income ceiling? Bonus structures and equity potential?

Think deeply and be specific with concrete examples. Be honest about tradeoffs and common misconceptions. Natural, conversational tone - no markdown formatting at all.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : "Could not generate comparison";

    return {
      text,
      metadata: {
        role: roles.map((r) => r.id).join("-"),
        type: "comparison",
      },
    };
  } catch (error) {
    console.error("Error comparing roles:", error);
    const roleNames = roles.map((r) => r.name).join(" vs ");
    const fallback = roles.length === 2
      ? `${roleNames}: These roles differ fundamentally in scope and daily work. The first typically focuses on core systems and logic, while the second emphasizes user-facing impact and experience. Your choice depends on whether you prefer working on infrastructure versus features. Consider your thinking style, growth ambitions, and work environment preferences.`
      : `${roleNames}: These roles offer distinct career paths. Research the specific daily responsibilities, growth trajectories, and work environments. Interview people in each role to understand the real differences beyond job titles.`;
    return {
      text: fallback,
      metadata: { role: roles.map((r) => r.id).join("-"), type: "comparison" },
    };
  }
}

// ====== SKILL GAP ANALYSIS ======
/**
 * Analyze specific skill gaps and create learning path
 */
export async function analyzeSkillGap(
  targetRole: Role,
  userSkills: string[],
  missingSkills: string[]
): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.chat?.completions?.create !== 'function') {
    const monthsEstimate = missingSkills.length > 3 ? "6-12" : "3-6";
    return {
      text: `You have ${userSkills.length} relevant skills. Missing: ${missingSkills.join(", ")}. Learning path: ${monthsEstimate} months focused practice.`,
      metadata: { role: targetRole.id, type: "gap-analysis" },
    };
  }

  const userSkillsStr = userSkills.join(", ") || "None mentioned";
  const missingSkillsStr = missingSkills.join(", ");

  const prompt = `You are a technical mentor helping someone transition into a new role.

Target Role: ${targetRole.name}
Current Skills: ${userSkillsStr}
Missing Skills to Master: ${missingSkillsStr}

Write 2-3 paragraphs that:
1. Acknowledge their current skills and how they transfer
2. Explain missing skills in context (why they matter for the role)
3. Suggest a realistic path to fill gaps (months, not years)
4. Be encouraging but honest about the effort needed

Make it feel like a mentor's honest feedback, not a course advertisement.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : "Could not generate analysis";

    return {
      text,
      metadata: {
        role: targetRole.id,
        type: "gap-analysis",
      },
    };
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    return {
      text: `Your current skills: ${userSkillsStr}. To reach ${targetRole.name}, focus on: ${missingSkillsStr}`,
      metadata: { role: targetRole.id, type: "gap-analysis" },
    };
  }
}

// ====== COGNITIVE TYPE REASONING ======
/**
 * Explain why certain roles match a user's cognitive profile
 */
export async function explainCognitiveMatch(
  cognitiveType: string,
  relatedRoles: Role[]
): Promise<AIExplanation> {
  const client = getGroqClient();
  const rolesStr = relatedRoles.map((r) => r.name).join(", ");

  if (!client || typeof client.chat?.completions?.create !== 'function') {
    return {
      text: `As a ${cognitiveType} thinker, you'd excel in: ${rolesStr}`,
      metadata: { role: cognitiveType, type: "reasoning" },
    };
  }

  const prompt = `You are a career coach explaining role matches based on cognitive type.

Cognitive Type: "${cognitiveType}" (someone who naturally thinks about problems this way)
Roles that match this type: ${rolesStr}

Write 2-3 paragraphs that:
1. Explain what "${cognitiveType}" thinking means concretely
2. Why these roles suit this cognitive type
3. What would frustrate someone with this type in other roles
4. How to test if this description matches them

Be specific, not abstract. Use examples a beginner would understand.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : `${cognitiveType} thinkers work well in: ${rolesStr}`;

    return {
      text,
      metadata: {
        role: cognitiveType,
        type: "reasoning",
      },
    };
  } catch (error) {
    console.error("Error explaining cognitive match:", error);
    return {
      text: `${cognitiveType} thinking works well in: ${rolesStr}`,
      metadata: { role: cognitiveType, type: "reasoning" },
    };
  }
}

// ====== ROLE RECOMMENDATION REASONING ======
/**
 * Explain why specific roles are recommended
 */
export async function explainRecommendations(
  userContext: {
    interests: string[];
    skills: string[];
    currentLevel: "beginner" | "intermediate" | "advanced";
  },
  recommendedRoles: Role[]
): Promise<AIExplanation> {
  const client = getGroqClient();
  if (!client || typeof client.chat?.completions?.create !== 'function') {
    return {
      text: `Based on your profile, these roles match your interests and skill level: ${recommendedRoles.map((r) => r.name).join(", ")}`,
      metadata: { role: recommendedRoles.map((r) => r.id).join("-"), type: "reasoning" },
    };
  }
  const rolesStr = recommendedRoles
    .map((r) => `${r.name} (demand: ${r.demandLevel}, difficulty: ${r.difficulty})`)
    .join("\n");

  const prompt = `You are a career advisor explaining personalized role recommendations.

User Profile:
- Interests: ${userContext.interests.join(", ")}
- Current Skills: ${userContext.skills.join(", ")}
- Experience Level: ${userContext.currentLevel}

Recommended Roles:
${rolesStr}

Write 2-3 paragraphs that:
1. Explain how their interests map to these roles
2. Why these roles are achievable from their current level
3. Growth potential in each direction
4. What to explore first based on their profile

Be personal. Show you understand their situation. This is why WE recommended these, not someone else's path.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : `Recommended roles: ${recommendedRoles.map((r) => r.name).join(", ")}`;

    return {
      text,
      metadata: {
        role: recommendedRoles.map((r) => r.id).join("-"),
        type: "reasoning",
      },
    };
  } catch (error) {
    console.error("Error explaining recommendations:", error);
    return {
      text: `Based on your profile: ${recommendedRoles.map((r) => r.name).join(", ")}`,
      metadata: { role: recommendedRoles.map((r) => r.id).join("-"), type: "reasoning" },
    };
  }
}

// ====== CAREER PATH EXPLANATION ======
/**
 * Explain potential growth paths from a chosen role
 */
export async function explainGrowthPath(role: Role): Promise<AIExplanation> {
  const client = getGroqClient();
  const growthPathStr = role.growthPath.join(" → ");

  if (!client || typeof client.chat?.completions?.create !== 'function') {
    return {
      text: `Growth path: ${growthPathStr}. Salary range: ${role.salaryRangeIndia.junior} → ${role.salaryRangeIndia.senior}`,
      metadata: { role: role.id, type: "reasoning" },
    };
  }

  const prompt = `You are a mentor explaining career progression in tech.

Role: ${role.name}
Natural Growth Paths: ${growthPathStr}
Current Salary Range: ${role.salaryRangeIndia.junior} (junior), ${role.salaryRangeIndia.mid} (mid), ${role.salaryRangeIndia.senior} (senior)

Write 2-3 paragraphs about:
1. What each growth path looks like practically
2. The decision points (when you choose between paths)
3. Salary progression and what unlocks raises
4. Time horizons for progression

Make it realistic. Some people stay as senior ICs forever - that's valid. Leadership isn't the only path up.`;

  try {
    const message = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    } as any);

    const content = message.choices[0]?.message?.content;
    const text = typeof content === 'string' ? content : `Career paths: ${growthPathStr}`;

    return {
      text,
      metadata: {
        role: role.id,
        type: "reasoning",
      },
    };
  } catch (error) {
    console.error("Error explaining growth path:", error);
    return {
      text: `Growth: ${growthPathStr}. Entry: ${role.salaryRangeIndia.junior}, Senior: ${role.salaryRangeIndia.senior}`,
      metadata: { role: role.id, type: "reasoning" },
    };
  }
}

// ====== ERROR HANDLING & STREAMING ======

export async function* explainRoleStreaming(role: Role) {
  const client = getGroqClient();
  const prompt = `You are a career mentor. Explain briefly (150 words) what the "${role.name}" role actually entails daily.`;

  if (!client || typeof client.chat?.completions?.stream !== 'function') {
    yield `${role.name}: ${role.dailyWork}`;
    return;
  }

  try {
    const stream = await client.chat.completions.stream({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    } as any);

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        yield chunk.delta.text;
      }
    }
  } catch (error) {
    console.error("Error streaming role explanation:", error);
    yield `${role.name}: ${role.dailyWork}`;
  }
}

// ====== UTILS ======

export async function validateAIResponse(text: string): Promise<boolean> {
  // Check for minimal quality
  return text.length > 100 && !text.includes("error") && !text.includes("cannot");
}
