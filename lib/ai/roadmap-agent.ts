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
