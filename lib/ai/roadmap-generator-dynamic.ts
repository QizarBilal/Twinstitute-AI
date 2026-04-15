import Groq from "groq-sdk";

/**
 * FULLY DYNAMIC ROADMAP GENERATOR
 * Generates complete roadmaps from Groq AI based on role and duration
 * No static database dependencies
 */

interface RoadmapGenerationInput {
  role: string;
  userSkills: string[];
  durationMonths: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  skills: string[];
  tasks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  userHasSkill: boolean;
}

interface RoadmapPhase {
  phase: string;
  modules: Module[];
}

interface GeneratedRoadmap {
  roadmap: RoadmapPhase[];
  duration: number;
  intensity: string;
  totalModules: number;
  reasoning: string;
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 GROQ CLIENT: On-demand initialization
// ═══════════════════════════════════════════════════════════════════

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_ROADMAP_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ GROQ_ROADMAP_KEY not set");
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
// 🛡️ ROBUST JSON PARSER: Handle various Groq response formats
// ═══════════════════════════════════════════════════════════════════

function sanitizeJSONString(text: string): string {
  let cleaned = text
    // Remove markdown code blocks
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    // Replace actual newlines/tabs with escape sequences (carefully)
    .split('\n')
    .map((line, idx) => {
      // Keep lines intact if they're inside a string value
      return line;
    })
    .join('\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    // Remove trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    .trim();
  
  return cleaned;
}

function parseGroqJSON(response: string): any {
  // First, try direct parsing
  try {
    return JSON.parse(response);
  } catch (e1) {
    // Try extracting JSON from markdown blocks
    const mdMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (mdMatch) {
      try {
        return JSON.parse(mdMatch[1]);
      } catch (e2) {
        // Continue to next attempt
      }
    }

    // Try finding the JSON object
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const jsonStr = response.substring(jsonStart, jsonEnd + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e3) {
        // Fallback: aggressive sanitization
        const sanitized = sanitizeJSONString(jsonStr);
        try {
          return JSON.parse(sanitized);
        } catch (e4) {
          console.error("❌ All JSON parsing attempts failed");
          console.error("Response:", response.substring(0, 300));
          throw e1;
        }
      }
    }

    throw e1;
  }
}

// ═══════════════════════════════════════════════════════════════════
// ⏱️ INTENSITY LEVELS BY DURATION
// ═══════════════════════════════════════════════════════════════════

function getIntensityLevel(durationMonths: number): string {
  const map: Record<number, string> = {
    1: "Extreme (1 month) - Boot camp, 40-50 hrs/week",
    2: "Very High (2 months) - Intensive, 30-40 hrs/week",
    3: "High (3 months) - Fast-paced, 20-25 hrs/week",
    6: "Moderate (6 months) - Balanced, 10-15 hrs/week",
    12: "Relaxed (12 months) - Spaced, 4-6 hrs/week",
  };
  return map[durationMonths] || map[6];
}

function getTimeMultiplier(durationMonths: number): number {
  const map: Record<number, number> = {
    1: 0.4,
    2: 0.6,
    3: 0.8,
    6: 1.0,
    12: 1.4,
  };
  return map[durationMonths] || 1.0;
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 FULLY DYNAMIC ROADMAP GENERATION
// ═══════════════════════════════════════════════════════════════════

async function generateDynamicRoadmapStructure(
  role: string,
  durationMonths: number
): Promise<RoadmapPhase[]> {
  const groqClient = getGroqClient();
  
  if (!groqClient) {
    throw new Error("Groq API not configured. Set GROQ_ROADMAP_KEY in environment.");
  }

  // Determine module count
  const moduleCounts: Record<number, number> = {
    1: 3,
    2: 5,
    3: 7,
    6: 10,
    12: 15,
  };
  
  const moduleCount = moduleCounts[durationMonths] || 10;
  const intensity = getIntensityLevel(durationMonths);

  const prompt = `You are an expert curriculum designer creating a learning roadmap for ${role}.

Duration: ${durationMonths} months
Intensity: ${intensity}
Target modules: ${moduleCount}

Generate a complete JSON roadmap with this structure:
{
  "phases": [
    {
      "phase": "Phase Name",
      "modules": [
        {
          "title": "Module title",
          "description": "2-3 sentence practical description",
          "skills": ["skill1", "skill2", "skill3"],
          "tasks": [
            "Concrete task 1",
            "Concrete task 2",
            "Concrete task 3"
          ],
          "difficulty": "Beginner|Intermediate|Advanced",
          "hours": 12
        }
      ]
    }
  ]
}

Requirements:
1. Create exactly ${moduleCount} modules total
2. Include Foundation, Core Skills, and Application phases minimum
3. Each module has 2-3 concrete, actionable tasks
4. Tasks should be specific and measurable (not vague)
5. Hours should fit the ${durationMonths}-month timeline
6. Difficulty progression from Beginner → Advanced
7. Return ONLY valid JSON, no markdown, no extra text

Generate a practical, comprehensive curriculum.`;

  try {
    console.log(`🚀 Generating ${moduleCount}-module roadmap for ${role} (${durationMonths}m)`);
    
    const message = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.choices?.[0]?.message?.content || "";
    
    if (!responseText) {
      throw new Error("Empty response from Groq");
    }

    console.log(`📝 Parsing Groq response (${responseText.length} chars)`);

    const parsed = parseGroqJSON(responseText);
    
    if (!parsed.phases || !Array.isArray(parsed.phases)) {
      throw new Error("Invalid phases structure from Groq");
    }

    // Convert Groq response to our RoadmapPhase format
    const phases: RoadmapPhase[] = parsed.phases.map((phase: any) => ({
      phase: phase.phase || "Core",
      modules: (phase.modules || []).map((m: any) => {
        const baseHours = typeof m.hours === 'number' ? m.hours : 12;
        return {
          id: `${role.replace(/\s+/g, '-').toLowerCase()}-${m.title.replace(/\s+/g, '-').toLowerCase()}`,
          title: m.title || "Module",
          description: m.description || "",
          skills: Array.isArray(m.skills) ? m.skills : [],
          tasks: Array.isArray(m.tasks) ? m.tasks.slice(0, 4) : [],
          difficulty: ["Beginner", "Intermediate", "Advanced"].includes(m.difficulty)
            ? m.difficulty
            : "Intermediate",
          estimatedHours: Math.round(baseHours * getTimeMultiplier(durationMonths)),
          userHasSkill: false, // Will be set during personalization
        };
      }),
    }));

    const totalModules = phases.reduce((sum, p) => sum + p.modules.length, 0);
    console.log(`✅ Generated ${totalModules} modules in ${phases.length} phases`);
    
    return phases;
  } catch (error) {
    console.error(`❌ Roadmap generation failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 👤 PERSONALIZATION: Check if user has skills
// ═══════════════════════════════════════════════════════════════════

function personalizeRoadmap(
  phases: RoadmapPhase[],
  userSkills: string[]
): RoadmapPhase[] {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  
  return phases.map(phase => ({
    ...phase,
    modules: phase.modules.map(module => ({
      ...module,
      userHasSkill: module.skills.some(skill =>
        userSkillsLower.includes(skill.toLowerCase())
      ),
    })),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// 📋 MAIN EXPORT: Generate complete roadmap
// ═══════════════════════════════════════════════════════════════════

export async function generateRoadmap(input: RoadmapGenerationInput): Promise<GeneratedRoadmap> {
  const { role, userSkills, durationMonths } = input;

  console.log(`\n📍 [ROADMAP] Generating for: ${role} (${durationMonths}m)`);

  // Generate dynamic structure from Groq
  let phases = await generateDynamicRoadmapStructure(role, durationMonths);

  // Personalize based on user skills
  phases = personalizeRoadmap(phases, userSkills);

  // Calculate totals
  const totalModules = phases.reduce((sum, p) => sum + p.modules.length, 0);
  const totalHours = phases.reduce(
    (sum, p) => sum + p.modules.reduce((s, m) => s + m.estimatedHours, 0),
    0
  );

  const result: GeneratedRoadmap = {
    roadmap: phases,
    duration: durationMonths,
    intensity: getIntensityLevel(durationMonths),
    totalModules,
    reasoning: `This ${durationMonths}-month ${role} roadmap covers ${totalModules} modules with ${totalHours} hours total. ${
      durationMonths === 1 ? "Intensive boot camp covering essentials only." :
      durationMonths === 2 ? "Fast-paced with compressed but complete coverage." :
      durationMonths === 3 ? "Focused learning without overwhelming." :
      durationMonths === 6 ? "Balanced depth and breadth with project application." :
      "Comprehensive mastery with deep expertise in all areas."
    }`,
  };

  console.log(`✅ [ROADMAP] Complete: ${totalModules} modules, ${totalHours} hours`);
  return result;
}
