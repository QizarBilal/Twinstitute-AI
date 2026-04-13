import Groq from "@/lib/groq-client";

interface RoadmapGenerationInput {
  role: string;
  userSkills: string[];
  durationMonths: number;
}

interface Module {
  title: string;
  description: string;
  skills: string[];
  tasks: string[];
  difficulty: string;
  estimatedHours: number;
}

interface RoadmapPhase {
  phase: string;
  duration: string;
  modules: Module[];
}

interface GeneratedRoadmap {
  roadmap: RoadmapPhase[];
  totalDuration: string;
  intensityLevel: string;
  reasoning: string;
}

const ROLE_DATABASE: Record<string, { requiredSkills: string[]; optionalSkills: string[] }> = {
  "Full Stack Developer": {
    requiredSkills: ["JavaScript", "React", "Node.js", "Database Design", "REST APIs", "HTML/CSS"],
    optionalSkills: ["TypeScript", "Docker", "AWS", "GraphQL"],
  },
  "Data Scientist": {
    requiredSkills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
    optionalSkills: ["Deep Learning", "Big Data", "MLOps"],
  },
  "DevOps Engineer": {
    requiredSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud Platforms"],
    optionalSkills: ["Terraform", "Monitoring", "Security"],
  },
  "Mobile Developer": {
    requiredSkills: ["React Native or Flutter", "JavaScript/Dart", "Mobile UI/UX", "APIs", "State Management"],
    optionalSkills: ["Native iOS/Android", "Performance Optimization"],
  },
};

const LAYER_STRUCTURE = {
  FOUNDATION: "Foundation Layer",
  CORE_SKILLS: "Core Skill Layer",
  APPLICATION: "Application Layer",
  MASTERY: "Mastery Layer",
};

function getIntensityLevel(durationMonths: number): string {
  if (durationMonths >= 12) return "Low - Deep Learning with Spaced Repetition";
  if (durationMonths >= 6) return "Moderate - Balanced Compression";
  if (durationMonths === 3) return "High - Daily Tasks and Intensity";
  return "Extreme - Critical Concepts Only + Heavy Execution";
}

function calculateModuleEstimates(durationMonths: number): Record<string, number> {
  const baseHours = 200;
  const compressionFactor = 12 / durationMonths;

  return {
    foundation: Math.ceil((baseHours * 0.2) / compressionFactor),
    coreSkills: Math.ceil((baseHours * 0.35) / compressionFactor),
    application: Math.ceil((baseHours * 0.25) / compressionFactor),
    mastery: Math.ceil((baseHours * 0.2) / compressionFactor),
  };
}

function identifySkillGaps(
  userSkills: string[],
  roleRequirements: string[]
): { missing: string[]; optional: string[] } {
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const missing = roleRequirements.filter((req) => !userSkillsLower.some((u) => u.includes(req.toLowerCase())));

  return {
    missing,
    optional: ROLE_DATABASE[Object.keys(ROLE_DATABASE)[0]]?.optionalSkills || [],
  };
}

async function generateRoadmapWithAI(
  role: string,
  userSkills: string[],
  durationMonths: number,
  skillGaps: { missing: string[] }
): Promise<RoadmapPhase[]> {
  const groq = new Groq();

  const prompt = `
You are a learning system architect. Generate a detailed roadmap for a student transitioning to: ${role}

Current Skills: ${userSkills.join(", ")}
Missing Skills: ${skillGaps.missing.join(", ")}
Timeline: ${durationMonths} months
Intensity Level: ${getIntensityLevel(durationMonths)}

Create a structured roadmap with 4 mandatory layers:

1. FOUNDATION LAYER: Programming basics, core logic, environment setup
2. CORE SKILL LAYER: Main technologies, frameworks, tools for ${role}
3. APPLICATION LAYER: Real-world projects, integrations
4. MASTERY LAYER: Optimization, system design, interview readiness

For each layer, provide 2-3 modules with:
- Title
- Description (1-2 sentences)
- Skills covered (list)
- Key tasks (3-4 items)
- Difficulty level (Beginner/Intermediate/Advanced)
- Estimated hours (adjusted for ${durationMonths} month timeline)

Format as JSON array of phases with modules. NO MARKDOWN, PURE JSON ONLY.
`;

  const message = await groq.messages.create({
    model: "llama3-70b-8192",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  try {
    const responseText = message.content[0]?.type === "text" ? message.content[0].text : "";
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse Groq response:", error);
  }

  // Fallback structure if AI generation fails
  return generateFallbackRoadmap(role, durationMonths);
}

function generateFallbackRoadmap(role: string, durationMonths: number): RoadmapPhase[] {
  const estimates = calculateModuleEstimates(durationMonths);

  return [
    {
      phase: LAYER_STRUCTURE.FOUNDATION,
      duration: `${Math.max(1, Math.floor(durationMonths * 0.15))} weeks`,
      modules: [
        {
          title: "Setup & Fundamentals",
          description: "Environment setup, core concepts, and foundational tools",
          skills: ["System Setup", "Version Control", "Development Tools"],
          tasks: ["Setup development environment", "Learn Git basics", "Configure IDE"],
          difficulty: "Beginner",
          estimatedHours: estimates.foundation,
        },
      ],
    },
    {
      phase: LAYER_STRUCTURE.CORE_SKILLS,
      duration: `${Math.max(1, Math.floor(durationMonths * 0.4))} weeks`,
      modules: [
        {
          title: `${role} Core Technologies`,
          description: "Master the main technologies and frameworks for this role",
          skills: ["Primary Language", "Key Framework", "Main Tools"],
          tasks: ["Complete core tutorials", "Build sample projects", "Master core patterns"],
          difficulty: "Intermediate",
          estimatedHours: estimates.coreSkills,
        },
      ],
    },
    {
      phase: LAYER_STRUCTURE.APPLICATION,
      duration: `${Math.max(1, Math.floor(durationMonths * 0.3))} weeks`,
      modules: [
        {
          title: "Real-World Projects",
          description: "Apply knowledge through practical, production-like projects",
          skills: ["Project Architecture", "Integration", "Best Practices"],
          tasks: ["Build capstone project", "Integrate multiple systems", "Deploy application"],
          difficulty: "Advanced",
          estimatedHours: estimates.application,
        },
      ],
    },
    {
      phase: LAYER_STRUCTURE.MASTERY,
      duration: `${Math.max(1, Math.floor(durationMonths * 0.15))} weeks`,
      modules: [
        {
          title: "System Design & Optimization",
          description: "Advanced patterns, optimization, and interview preparation",
          skills: ["System Design", "Performance", "Advanced Patterns"],
          tasks: ["Design complex systems", "Optimize performance", "Prepare for interviews"],
          difficulty: "Advanced",
          estimatedHours: estimates.mastery,
        },
      ],
    },
  ];
}

export async function generateRoadmap(input: RoadmapGenerationInput): Promise<GeneratedRoadmap> {
  const { role, userSkills, durationMonths } = input;

  // Validate input
  if (!role || !userSkills.length || !durationMonths) {
    throw new Error("Invalid roadmap generation input");
  }

  // Get role requirements
  const roleRequirements = ROLE_DATABASE[role]?.requiredSkills || [];
  const skillGaps = identifySkillGaps(userSkills, roleRequirements);

  // Generate roadmap phases
  const roadmap = await generateRoadmapWithAI(role, userSkills, durationMonths, skillGaps);

  // Calculate total duration and intensity
  const intensityLevel = getIntensityLevel(durationMonths);
  const totalHours = roadmap.reduce((sum, phase) => sum + phase.modules.reduce((s, m) => s + m.estimatedHours, 0), 0);

  return {
    roadmap,
    totalDuration: `${durationMonths} months`,
    intensityLevel,
    reasoning: `Roadmap designed for ${durationMonths}-month timeline with ${intensityLevel.toLowerCase()} intensity. Total estimated effort: ${totalHours} hours. All 4 layers maintained at ${intensityLevel.toLowerCase()} compression.`,
  };
}
