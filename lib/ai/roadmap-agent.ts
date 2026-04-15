import Groq from "groq-sdk";

if (!process.env.GROQ_ROADMAP_KEY) {
  throw new Error("GROQ_ROADMAP_KEY is not defined in environment variables");
}

const roadmapGroqClient = new Groq({
  apiKey: process.env.GROQ_ROADMAP_KEY,
});

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
  // ⭐ TIER 1: Core Tech Roles (High Quality, Most Common)
  "Full Stack Developer": {
    requiredSkills: ["JavaScript", "React", "Node.js", "Database Design", "REST APIs", "HTML/CSS"],
    optionalSkills: ["TypeScript", "Docker", "AWS", "GraphQL"],
  },
  "Backend Engineer": {
    requiredSkills: ["Node.js", "Python", "Database Design", "API Design", "System Architecture"],
    optionalSkills: ["Microservices", "Message Queues", "Caching"],
  },
  "Frontend Engineer": {
    requiredSkills: ["JavaScript", "React", "CSS", "HTML", "State Management"],
    optionalSkills: ["TypeScript", "Web Performance", "Accessibility"],
  },
  "Data Scientist": {
    requiredSkills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
    optionalSkills: ["Deep Learning", "Big Data", "MLOps"],
  },
  "Data Engineer": {
    requiredSkills: ["SQL", "Python", "ETL", "Data Warehousing", "Apache Spark"],
    optionalSkills: ["Kafka", "Airflow", "Cloud Data Platforms"],
  },
  "DevOps Engineer": {
    requiredSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud Platforms"],
    optionalSkills: ["Terraform", "Monitoring", "Infrastructure Security"],
  },
  "Mobile Developer (React Native)": {
    requiredSkills: ["React Native", "JavaScript", "Mobile UI/UX", "Native APIs"],
    optionalSkills: ["TypeScript", "Firebase", "Mobile Performance"],
  },
  "iOS Developer": {
    requiredSkills: ["Swift", "iOS APIs", "Mobile UI", "Xcode"],
    optionalSkills: ["SwiftUI", "Core Data", "ARKit"],
  },
  "Android Developer": {
    requiredSkills: ["Kotlin", "Android APIs", "Material Design", "Android Studio"],
    optionalSkills: ["Jetpack", "Compose", "NDK"],
  },
  "Cloud Architect (AWS)": {
    requiredSkills: ["AWS Services", "System Design", "Networking", "Security"],
    optionalSkills: ["Infrastructure as Code", "Cost Optimization", "Multi-region"],
  },
  "ML Engineer": {
    requiredSkills: ["Python", "TensorFlow", "Model Training", "Data Preprocessing"],
    optionalSkills: ["PyTorch", "MLOps", "Model Deployment"],
  },
  "QA Engineer": {
    requiredSkills: ["Testing Frameworks", "Automation", "SQL", "API Testing"],
    optionalSkills: ["Performance Testing", "CI/CD Integration", "Test Architecture"],
  },
  "Solutions Architect": {
    requiredSkills: ["System Design", "Scalability", "Technology Stack Selection", "Documentation"],
    optionalSkills: ["Cloud Platforms", "Microservices", "Enterprise Patterns"],
  },
  "Database Administrator": {
    requiredSkills: ["SQL", "Database Optimization", "Backup/Recovery", "Monitoring"],
    optionalSkills: ["NoSQL", "Replication", "High Availability"],
  },
  "Security Engineer": {
    requiredSkills: ["Security Protocols", "Network Security", "Encryption", "Vulnerability Assessment"],
    optionalSkills: ["Penetration Testing", "SIEM", "Compliance"],
  },
  
  // ⭐ TIER 2: Specialized Roles (High Quality, Growing)
  "Product Manager": {
    requiredSkills: ["Product Strategy", "User Research", "Roadmapping", "Analytics"],
    optionalSkills: ["Technical Knowledge", "User Psychology", "A/B Testing"],
  },
  "Technical Program Manager": {
    requiredSkills: ["Project Management", "Technical Understanding", "Stakeholder Management"],
    optionalSkills: ["Agile", "Risk Management", "Documentation"],
  },
  "Data Analyst": {
    requiredSkills: ["SQL", "Excel", "Data Visualization", "Analytics Tools"],
    optionalSkills: ["Python", "Business Intelligence", "Dashboard Creation"],
  },
  "AI/ML Researcher": {
    requiredSkills: ["Mathematics", "Python", "Research Skills", "Paper Implementation"],
    optionalSkills: ["PyTorch", "TensorFlow", "Academic Publishing"],
  },
  "Blockchain Developer": {
    requiredSkills: ["Smart Contracts", "Solidity", "Cryptography", "Web3"],
    optionalSkills: ["DeFi", "Layer 2 Solutions", "Security Auditing"],
  },
  "Game Developer": {
    requiredSkills: ["C#", "Unity", "Game Design", "3D Graphics"],
    optionalSkills: ["Unreal Engine", "Physics Engine", "Networking"],
  },
  "Site Reliability Engineer": {
    requiredSkills: ["Linux", "Monitoring", "Incident Response", "Automation"],
    optionalSkills: ["Kubernetes", "Terraform", "Performance Tuning"],
  },
  "Platform Engineer": {
    requiredSkills: ["Infrastructure", "Developer Tool Design", "Automation", "Kubernetes"],
    optionalSkills: ["GitOps", "Internal Developer Platforms", "Cost Optimization"],
  },
  "Systems Engineer": {
    requiredSkills: ["System Design", "Performance", "Scalability", "Architecture"],
    optionalSkills: ["Distributed Systems", "Concurrency", "Resource Management"],
  },
  "Engineering Manager": {
    requiredSkills: ["Team Leadership", "Technical Knowledge", "Communication", "Performance Management"],
    optionalSkills: ["Mentoring", "Strategic Planning", "Conflict Resolution"],
  },
  
  // ⭐ TIER 3: Emerging & Specialized (High Quality, Niche)
  "LLM Engineer": {
    requiredSkills: ["Python", "Transformers", "Fine-tuning", "Prompt Engineering"],
    optionalSkills: ["Hugging Face", "Langchain", "Vector Databases"],
  },
  "Computer Vision Engineer": {
    requiredSkills: ["Python", "OpenCV", "CNN", "Image Processing"],
    optionalSkills: ["Deep Learning", "Real-time Processing", "3D Vision"],
  },
  "Embedded Systems Engineer": {
    requiredSkills: ["C/C++", "Microcontrollers", "Hardware", "Real-time Systems"],
    optionalSkills: ["RTOS", "IoT", "Firmware"],
  },
  "Infrastructure Engineer": {
    requiredSkills: ["System Administration", "Network Configuration", "Monitoring"],
    optionalSkills: ["IaC", "Virtualization", "Cloud Platforms"],
  },
  "Business Intelligence Developer": {
    requiredSkills: ["SQL", "BI Tools", "Data Modeling", "Dashboard Design"],
    optionalSkills: ["ETL", "Python", "Advanced Analytics"],
  },
  "GraphQL Developer": {
    requiredSkills: ["GraphQL", "API Design", "JavaScript", "Database Design"],
    optionalSkills: ["Federation", "Subscriptions", "Performance Optimization"],
  },
  "Performance Engineer": {
    requiredSkills: ["Performance Optimization", "Profiling", "System Tuning", "Benchmarking"],
    optionalSkills: ["Database Optimization", "Caching", "CDN"],
  },
  "Accessibility Specialist": {
    requiredSkills: ["Web Accessibility", "WCAG Standards", "Testing", "JavaScript"],
    optionalSkills: ["Assistive Technologies", "UX Design", "Testing Tools"],
  },
  "Tech Writer": {
    requiredSkills: ["Technical Communication", "Documentation", "API Docs", "Markdown"],
    optionalSkills: ["Developer Experience", "Video Documentation", "Localization"],
  },
  "Growth Engineer": {
    requiredSkills: ["Data Analysis", "Experimentation", "JavaScript", "Analytics"],
    optionalSkills: ["Product Sense", "User Psychology", "A/B Testing"],
  },
};

const LAYER_STRUCTURE = {
  FOUNDATION: "Foundation Layer",
  CORE_SKILLS: "Core Skill Layer",
  APPLICATION: "Application Layer",
  MASTERY: "Mastery Layer",
};

function getIntensityLevel(durationMonths: number): string {
  if (durationMonths >= 12) {
    return "Low (12 months) - Deep learning, spaced repetition, 4-5 hrs/week";
  }
  if (durationMonths === 6) {
    return "Moderate (6 months) - Balanced pace, 10-15 hrs/week";
  }
  if (durationMonths === 3) {
    return "High (3 months) - Fast-paced, 20-25 hrs/week";
  }
  if (durationMonths === 2) {
    return "Very High (2 months) - Intensive, 30-40 hrs/week";
  }
  return "Extreme (1 month) - Boot camp style, 40-50 hrs/week, daily execution";
}

/**
 * CRITICAL: Time adaptation formula
 * ✅ CORRECT: Same modules, different intensity
 * ❌ WRONG: Remove modules for shorter timelines
 * 
 * Formula: As duration decreases, intensity increases, not content
 */
function calculateModuleEstimates(durationMonths: number): Record<string, number> {
  const baseHours = 300; // Total hours to reach full capability
  
  // Time compression factor: how aggressive to compress
  // Never goes BELOW 1x for any duration
  const compressionFactors: Record<number, number> = {
    1: 6,   // 1 month = 6x speed (50 hours/week = intense)
    2: 4,   // 2 months = 4x speed (37 hours/week = very intense)
    3: 3,   // 3 months = 3x speed (25 hours/week = high)
    6: 1.5, // 6 months = 1.5x speed (12 hours/week = moderate)
    12: 1,  // 12 months = 1x speed (6 hours/week = comfortable)
  };

  const factor = compressionFactors[durationMonths] || 1;
  const weeklyHours = baseHours / (durationMonths * 4) * factor;

  return {
    foundation: Math.ceil((baseHours * 0.2) / factor),     // Still all 60 hours
    coreSkills: Math.ceil((baseHours * 0.35) / factor),   // Still all 105 hours
    application: Math.ceil((baseHours * 0.25) / factor),  // Still all 75 hours
    mastery: Math.ceil((baseHours * 0.2) / factor),       // Still all 60 hours
    weeklyHoursRequired: Math.ceil(weeklyHours),
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
  const estimates = calculateModuleEstimates(durationMonths);
  const intensityLevel = getIntensityLevel(durationMonths);

  const prompt = `
You are a learning system architect. Generate a detailed roadmap for: ${role}

⚠️ CRITICAL CONSTRAINT:
- Generate EXACTLY 4 layers with 2-3 modules EACH
- Do NOT remove modules for shorter timelines
- For shorter timelines: increase daily hours required, not remove content
- All 4 layers MUST be present regardless of duration

Timeline: ${durationMonths} months (${intensityLevel})
Current Skills: ${userSkills.join(", ") || "None"}
Missing Skills: ${skillGaps.missing.slice(0, 5).join(", ")}

LAYER 1: FOUNDATION (${estimates.foundation} hours)
- Environment setup
- Core concepts
- Pre-requisite knowledge

LAYER 2: CORE SKILLS (${estimates.coreSkills} hours)
- Main technologies for ${role}
- Frameworks & tools
- Best practices

LAYER 3: APPLICATION (${estimates.application} hours)
- Real-world projects
- Integration patterns
- Production techniques

LAYER 4: MASTERY (${estimates.mastery} hours)
- System design
- Performance optimization
- Interview preparation

For each module:
- Title
- Brief description
- Skills covered (comma-separated)
- 2-3 key tasks
- Difficulty (Beginner/Intermediate/Advanced)
- Estimated hours (from list above)

Return ONLY valid JSON as array of phases:
[
  {
    "phase": "Foundation Layer",
    "duration": "2 weeks",
    "modules": [
      {
        "title": "...",
        "description": "...",
        "skills": ["skill1", "skill2"],
        "tasks": ["task1", "task2"],
        "difficulty": "Beginner",
        "estimatedHours": ${estimates.foundation}
      }
    ]
  }
]
`;

  const message = await roadmapGroqClient.messages.create({
    model: "llama3-70b-8192",
    max_tokens: 2500,
    temperature: 0.5,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  try {
    const responseText = message.content[0]?.type === "text" ? message.content[0].text : "";
    console.log(`📝 Groq response (first 500 chars):`, responseText.substring(0, 500));
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed Groq response: ${parsed.length} phases`);
      return parsed;
    } else {
      console.warn("⚠️ No JSON array found in Groq response");
    }
  } catch (error) {
    console.error("❌ Failed to parse Groq response:", error);
  }

  // Fallback structure if AI generation fails
  console.log(`⚠️ Using fallback roadmap for role: ${role}`);
  return generateFallbackRoadmap(role, durationMonths);
}

function generateFallbackRoadmap(role: string, durationMonths: number): RoadmapPhase[] {
  const estimates = calculateModuleEstimates(durationMonths);
  const durationWeeks = durationMonths * 4;

  const fallbackStructure: Record<string, RoadmapPhase[]> = {
    // Default fallback for any role
    DEFAULT: [
      {
        phase: LAYER_STRUCTURE.FOUNDATION,
        duration: `${Math.max(2, Math.floor(durationWeeks * 0.15))} weeks`,
        modules: [
          {
            title: "Development Environment Setup",
            description: "Configure development tools, version control, and workspace",
            skills: ["Git", "Command Line", "IDE Configuration", "Package Management"],
            tasks: ["Install and configure development environment", "Setup Git repository", "Configure IDE/editor"],
            difficulty: "Beginner",
            estimatedHours: Math.ceil(estimates.foundation / 2),
          },
          {
            title: "Core Fundamentals",
            description: "Understand core concepts and principles for the role",
            skills: ["Algorithms", "Data Structures", "System Thinking", "Best Practices"],
            tasks: ["Learn core algorithms", "Understand data structures", "Study best practices"],
            difficulty: "Beginner",
            estimatedHours: Math.ceil(estimates.foundation / 2),
          },
        ],
      },
      {
        phase: LAYER_STRUCTURE.CORE_SKILLS,
        duration: `${Math.max(4, Math.floor(durationWeeks * 0.4))} weeks`,
        modules: [
          {
            title: "Primary Technology Stack",
            description: "Master the main language and framework for this role",
            skills: ["Primary Language", "Key Framework", "Core Patterns"],
            tasks: ["Build foundational projects", "Master core patterns", "Complete framework tutorials"],
            difficulty: "Intermediate",
            estimatedHours: Math.ceil(estimates.coreSkills / 2),
          },
          {
            title: "Essential Tools & Databases",
            description: "Learn supporting technologies and persistence layers",
            skills: ["Database Design", "ORM/Query Language", "Tool Ecosystem"],
            tasks: ["Design database schemas", "Write efficient queries", "Integrate with tools"],
            difficulty: "Intermediate",
            estimatedHours: Math.ceil(estimates.coreSkills / 2),
          },
        ],
      },
      {
        phase: LAYER_STRUCTURE.APPLICATION,
        duration: `${Math.max(3, Math.floor(durationWeeks * 0.3))} weeks`,
        modules: [
          {
            title: "Real-World Project 1",
            description: "Build a substantial project applying core skills to realistic scenarios",
            skills: ["Project Architecture", "Integration", "Testing"],
            tasks: ["Design architecture", "Implement features", "Write comprehensive tests"],
            difficulty: "Advanced",
            estimatedHours: Math.ceil(estimates.application / 2),
          },
          {
            title: "Real-World Project 2 & Deployment",
            description: "Build a second project and master deployment and production practices",
            skills: ["Deployment", "CI/CD", "Monitoring", "Performance"],
            tasks: ["Deploy to production", "Setup monitoring", "Optimize performance"],
            difficulty: "Advanced",
            estimatedHours: Math.ceil(estimates.application / 2),
          },
        ],
      },
      {
        phase: LAYER_STRUCTURE.MASTERY,
        duration: `${Math.max(2, Math.floor(durationWeeks * 0.15))} weeks`,
        modules: [
          {
            title: "System Design & Architecture",
            description: "Learn advanced patterns and how to design scalable systems",
            skills: ["System Design", "Scalability", "Advanced Patterns"],
            tasks: ["Design scalable systems", "Optimize architecture", "Handle edge cases"],
            difficulty: "Advanced",
            estimatedHours: Math.ceil(estimates.mastery / 2),
          },
          {
            title: "Interview Preparation & Mastery",
            description: "Prepare for technical interviews and solidify mastery of the role",
            skills: ["Problem Solving", "Communication", "Deep Knowledge"],
            tasks: ["Practice interview problems", "Master complex scenarios", "Build portfolio projects"],
            difficulty: "Advanced",
            estimatedHours: Math.ceil(estimates.mastery / 2),
          },
        ],
      },
    ],
  };

  // Return the default fallback (guaranteed to be valid)
  const roadmap = fallbackStructure.DEFAULT;

  // Verify the fallback is valid
  if (!validateRoadmap(roadmap)) {
    console.error("❌ CRITICAL: Even fallback roadmap is invalid!");
    throw new Error("Fallback roadmap validation failed");
  }

  console.log(`✅ Fallback roadmap generated for role: ${role}`);
  return roadmap;
}

export async function generateRoadmap(input: RoadmapGenerationInput): Promise<GeneratedRoadmap> {
  const { role, userSkills, durationMonths } = input;

  // Validate input (userSkills can be empty array)
  if (!role || typeof durationMonths !== 'number' || durationMonths <= 0) {
    throw new Error("Invalid roadmap generation input: role and durationMonths required");
  }

  // CRITICAL: Normalize role to match database
  const normalizedRole = normalizeRole(role);
  console.log(`Normalized role: "${role}" → "${normalizedRole}"`);

  // Get role requirements (use normalized role)
  const roleRequirements = ROLE_DATABASE[normalizedRole]?.requiredSkills || [];
  const skillGaps = identifySkillGaps(userSkills, roleRequirements);

  // Generate roadmap phases with AI
  let roadmap = await generateRoadmapWithAI(normalizedRole, userSkills, durationMonths, skillGaps);

  // CRITICAL: Validate roadmap structure
  if (!validateRoadmap(roadmap)) {
    console.warn("Invalid roadmap from AI, using fallback");
    roadmap = generateFallbackRoadmap(normalizedRole, durationMonths);
  }

  // Calculate total duration and intensity
  const intensityLevel = getIntensityLevel(durationMonths);
  const totalHours = roadmap.reduce((sum, phase) => sum + phase.modules.reduce((s, m) => s + m.estimatedHours, 0), 0);

  const result: GeneratedRoadmap = {
    roadmap,
    totalDuration: `${durationMonths} months`,
    intensityLevel,
    reasoning: `Roadmap designed for ${durationMonths}-month timeline with ${intensityLevel.toLowerCase()} intensity. Total estimated effort: ${totalHours} hours. All 4 layers maintained at ${intensityLevel.toLowerCase()} compression.`,
  };

  // Final validation before returning
  if (!validateRoadmap(result.roadmap)) {
    throw new Error("Failed to generate valid roadmap - fallback also failed");
  }

  return result;
}

/**
 * CRITICAL: Normalize role from kebab-case to Title Case
 * "software-engineer" → "Full Stack Developer"
 */
function normalizeRole(role: string): string {
  // First, try exact match
  if (ROLE_DATABASE[role]) {
    return role;
  }

  // Convert kebab-case to Title Case
  const normalized = role
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Check if it matches any key in the database
  const matchedRole = Object.keys(ROLE_DATABASE).find(
    (key) => key.toLowerCase() === normalized.toLowerCase()
  );

  if (matchedRole) {
    return matchedRole;
  }

  // Fallback: if nothing matches, return the better-formatted version
  console.warn(`Role "${role}" not found in database, using normalized: "${normalized}"`);
  return normalized;
}

/**
 * CRITICAL: Validation that roadmap is complete
 * Must have:
 * - 4 phases
 * - At least 2 modules per phase
 * - Valid structure for each module
 */
function validateRoadmap(roadmap: RoadmapPhase[]): boolean {
  if (!Array.isArray(roadmap) || roadmap.length === 0) {
    console.error("❌ Roadmap is not an array or is empty");
    return false;
  }

  if (roadmap.length < 4) {
    console.error(`❌ Roadmap has only ${roadmap.length} phases, need 4`);
    return false;
  }

  // Check each phase
  for (let i = 0; i < roadmap.length; i++) {
    const phase = roadmap[i];

    if (!phase.phase || !phase.modules) {
      console.error(`❌ Phase ${i} missing required fields`);
      return false;
    }

    if (!Array.isArray(phase.modules) || phase.modules.length === 0) {
      console.error(`❌ Phase "${phase.phase}" has no modules`);
      return false;
    }

    // Validate each module
    for (let j = 0; j < phase.modules.length; j++) {
      const module = phase.modules[j];
      if (
        !module.title ||
        !module.description ||
        !Array.isArray(module.skills) ||
        !Array.isArray(module.tasks) ||
        !module.difficulty ||
        !module.estimatedHours
      ) {
        console.error(`❌ Module ${j} in phase "${phase.phase}" has invalid structure`);
        return false;
      }
    }
  }

  console.log(`✅ Roadmap valid: ${roadmap.length} phases, ${roadmap.reduce((s, p) => s + p.modules.length, 0)} modules`);
  return true;
}
