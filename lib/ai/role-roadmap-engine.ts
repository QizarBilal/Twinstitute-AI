/**
 * UNIVERSAL ROLE-BASED ROADMAP ENGINE
 * 
 * Purpose: Generate role-specific 20-module roadmap structures for ANY job role
 * - Uses Groq AI to intelligently design curricula
 * - Caches structures to avoid regeneration
 * - Ensures 4-phase structure for all roles
 * - Maintains deterministic consistency
 */

import Groq from "groq-sdk";
import { RoleRoadmapStructure, RoadmapPhase, RoadmapModule } from "./roadmap-structure";

interface RoleStructureCache {
  role: string;
  structure: RoleRoadmapStructure;
  generatedAt: Date;
  hits: number;
}

// In-memory cache for role structures (useful during development/session)
const roleStructureCache = new Map<string, RoleStructureCache>();

export async function generateRoleStructure(
  role: string,
  roleDescription?: string
): Promise<RoleRoadmapStructure> {
  const normalizedRole = role.toLowerCase().trim();

  // Check in-memory cache first
  const cached = roleStructureCache.get(normalizedRole);
  if (cached) {
    cached.hits++;
    console.log(`📦 [CACHE HIT] Role "${normalizedRole}" (${cached.hits} hits)`);
    return cached.structure;
  }

  console.log(`🔨 [GENERATING] Role structure for: "${role}"`);

  try {
    const structure = await generateRoleStructureWithAI(role, roleDescription);
    
    // Cache the result
    roleStructureCache.set(normalizedRole, {
      role: normalizedRole,
      structure,
      generatedAt: new Date(),
      hits: 1,
    });

    console.log(`✅ [GENERATED] ${structure.totalModules} modules for "${role}"`);
    return structure;
  } catch (error) {
    console.error(`❌ Failed to generate role structure for "${role}":`, error);
    throw error;
  }
}

async function generateRoleStructureWithAI(
  role: string,
  description?: string
): Promise<RoleRoadmapStructure> {
  const groqClient = getGroqClient();
  if (!groqClient) {
    throw new Error("Groq API key not configured");
  }

  const prompt = `You are an expert curriculum designer. Generate a complete 20-module learning roadmap for the role: "${role}"${
    description ? `\n\nRole context: ${description}` : ""
  }

CRITICAL REQUIREMENTS:
1. Exactly 20 modules total
2. 4 phases: Foundation (6 modules), Core Skills (7 modules), Application (5 modules), Mastery (2 modules)
3. Each module must be specific to this role (not generic)
4. Include realistic base hour estimates (12-40 hours per module)
5. Identify skill dependencies

The role "${role}" has unique responsibilities and learning path. Create a curriculum that:
- Builds foundations first
- Progressively increases in complexity
- Includes practical application
- Leads to mastery/specialization

Return ONLY valid JSON with this structure (NO markdown, NO extra text):
{
  "phases": [
    {
      "phase": "Foundation",
      "description": "Essential fundamentals for this role",
      "modules": [
        {
          "id": "unique-module-id",
          "title": "Module Title (specific to ${role})",
          "description": "What will be learned (2-3 sentences)",
          "coreTopics": ["topic1", "topic2", "topic3"],
          "skills": ["skill1", "skill2"],
          "difficulty": "Beginner",
          "baseHours": 20,
          "dependsOn": []
        }
      ]
    },
    {
      "phase": "Core Skills",
      "description": "Advanced technical skills and core competencies",
      "modules": [...]
    },
    {
      "phase": "Application",
      "description": "Real-world projects and practical application",
      "modules": [...]
    },
    {
      "phase": "Mastery",
      "description": "Specialization, interviews, and continuous growth",
      "modules": [...]
    }
  ]
}

Make the curriculum:
- **Role-specific**: Not generic (e.g., if "${role}" is DevOps Engineer, focus on containerization, orchestration, infrastructure automation)
- **Realistic**: Achievable within time frames
- **Progressive**: Foundation → Core → Application → Mastery
- **Complete**: Covers all essential skills for this role`;

  try {
    // Use Groq SDK's chat.completions.create method (OpenAI-compatible)
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices?.[0]?.message?.content || "";
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    const parsedResponse = parseGroqJSON(content);
    const structure = buildRoleStructure(role, parsedResponse);
    
    // Validate structure
    validateRoleStructure(structure);
    
    return structure;
  } catch (error) {
    console.error(`Failed to generate role structure:`, error);
    throw error;
  }
}

function buildRoleStructure(
  role: string,
  aiResponse: any
): RoleRoadmapStructure {
  const phases: RoadmapPhase[] = [];
  let totalModules = 0;

  // Expected module counts per phase
  const expectedModules = {
    "Foundation": 6,
    "Core Skills": 7,
    "Application": 5,
    "Mastery": 2,
  };

  if (aiResponse.phases && Array.isArray(aiResponse.phases)) {
    for (const phaseData of aiResponse.phases) {
      const phaseType = phaseData.phase as keyof typeof expectedModules;
      const modules: RoadmapModule[] = [];

      if (phaseData.modules && Array.isArray(phaseData.modules)) {
        for (const moduleData of phaseData.modules) {
          const module: RoadmapModule = {
            id: moduleData.id || sanitizeId(moduleData.title),
            title: moduleData.title,
            description: moduleData.description,
            coreTopics: moduleData.coreTopics || [],
            skills: moduleData.skills || [],
            tasks: [], // Will be populated during task generation
            difficulty: moduleData.difficulty || "Intermediate",
            baseHours: moduleData.baseHours || 24,
            dependsOn: moduleData.dependsOn || [],
          };
          modules.push(module);
        }
      }

      // Ensure we have the right number of modules per phase
      while (modules.length < (expectedModules[phaseType] || 0)) {
        modules.push(createPlaceholderModule(role, phaseType, modules.length + 1));
      }

      // Trim to expected count
      modules.length = expectedModules[phaseType] || modules.length;

      const phase: RoadmapPhase = {
        id: `phase-${phases.length}`,
        phase: phaseType,
        description: phaseData.description || `${phaseType} phase for ${role}`,
        modules,
      };

      phases.push(phase);
      totalModules += modules.length;
    }
  }

  // Ensure all 4 phases exist
  const phaseOrder: Array<keyof typeof expectedModules> = [
    "Foundation",
    "Core Skills",
    "Application",
    "Mastery",
  ];

  for (const phaseType of phaseOrder) {
    if (!phases.find((p) => p.phase === phaseType)) {
      const modules: RoadmapModule[] = [];
      const expectedCount = expectedModules[phaseType];

      for (let i = 0; i < expectedCount; i++) {
        modules.push(createPlaceholderModule(role, phaseType, i + 1));
      }

      phases.push({
        id: `phase-${phases.length}`,
        phase: phaseType,
        description: `${phaseType} phase for ${role}`,
        modules,
      });

      totalModules += modules.length;
    }
  }

  // Ensure total is exactly 20
  while (totalModules < 20) {
    const masteryPhase = phases.find((p) => p.phase === "Mastery");
    if (masteryPhase) {
      masteryPhase.modules.push(
        createPlaceholderModule(role, "Mastery", masteryPhase.modules.length + 1)
      );
      totalModules++;
    } else {
      break;
    }
  }

  return {
    role,
    totalModules: 20,
    phases: phases.slice(0, 4), // Exactly 4 phases
  };
}

function createPlaceholderModule(
  role: string,
  phase: string,
  index: number
): RoadmapModule {
  const moduleId = sanitizeId(`${role}-${phase}-${index}`);
  return {
    id: moduleId,
    title: `${phase} Module ${index} - ${role}`,
    description: `Advanced learning module for ${role}`,
    coreTopics: [`Core concept ${index} for ${role}`],
    skills: [`Skill ${index} for ${role}`],
    tasks: [],
    difficulty: phase === "Foundation" ? "Beginner" : 
               phase === "Core Skills" ? "Intermediate" :
               phase === "Application" ? "Intermediate" : "Advanced",
    baseHours: phase === "Foundation" ? 16 :
               phase === "Core Skills" ? 24 :
               phase === "Application" ? 32 : 20,
    dependsOn: [],
  };
}

function validateRoleStructure(structure: RoleRoadmapStructure): void {
  if (structure.totalModules !== 20) {
    throw new Error(
      `Invalid role structure: expected 20 modules, got ${structure.totalModules}`
    );
  }

  if (structure.phases.length !== 4) {
    throw new Error(
      `Invalid role structure: expected 4 phases, got ${structure.phases.length}`
    );
  }

  const phaseNames = structure.phases.map((p) => p.phase);
  const expected = ["Foundation", "Core Skills", "Application", "Mastery"];
  for (const phase of expected) {
    if (!phaseNames.includes(phase)) {
      throw new Error(`Missing phase: ${phase}`);
    }
  }
}

function parseGroqJSON(response: string): any {
  try {
    return JSON.parse(response);
  } catch (e1) {
    // Try extracting from markdown
    const mdMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (mdMatch) {
      try {
        return JSON.parse(mdMatch[1]);
      } catch (e2) {
        // Continue
      }
    }

    // Try finding JSON object
    const jsonStart = response.indexOf("{");
    const jsonEnd = response.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(response.substring(jsonStart, jsonEnd + 1));
      } catch (e3) {
        console.error("Failed to parse Groq response");
        throw e1;
      }
    }

    throw e1;
  }
}

function sanitizeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

export function getRoleStructureCache() {
  const cacheStats = Array.from(roleStructureCache.values()).map((item) => ({
    role: item.role,
    hits: item.hits,
    generatedAt: item.generatedAt.toISOString(),
  }));

  return {
    totalCached: roleStructureCache.size,
    totalHits: cacheStats.reduce((sum, item) => sum + item.hits, 0),
    cache: cacheStats,
  };
}

export function clearRoleStructureCache(): void {
  roleStructureCache.clear();
  console.log("🗑️  Role structure cache cleared");
}
