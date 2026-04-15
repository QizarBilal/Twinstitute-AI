import Groq from "groq-sdk";

// ═══════════════════════════════════════════════════════════════════
// 🔐 GROQ CLIENT: On-demand initialization with proper error handling
// ═══════════════════════════════════════════════════════════════════

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_ROADMAP_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ GROQ_ROADMAP_KEY not set in environment - will use fallback");
    return null;
  }

  try {
    const client = new Groq({
      apiKey: apiKey,
    });
    return client;
  } catch (error) {
    console.error("❌ Failed to create Groq client:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 ROLE-FIRST SYSTEM: Structure is independent of user skills
// ═══════════════════════════════════════════════════════════════════

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
  userHasSkill: boolean; // ✅ Personalization: does NOT affect structure
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
// 🎯 AI-GENERATED MODULE STRUCTURE
// ═══════════════════════════════════════════════════════════════════

interface AIGeneratedModule {
  title: string;
  description: string;
  skills: string[];
  tasks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  baseHours: number;
}

interface AIGeneratedPhase {
  phase: string;
  modules: AIGeneratedModule[];
}

// ═══════════════════════════════════════════════════════════════════
// �️ ROBUST JSON PARSER: Handle Groq's various response formats
// ═══════════════════════════════════════════════════════════════════

function sanitizeJSONString(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Replace actual newlines/tabs with escape sequences
  cleaned = cleaned
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    // Remove trailing commas before } or ]
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix unescaped quotes in values (common Groq issue)
    .replace(/:\s*"([^"]*)"([^",}\]]*)",/g, ': "$1$2",')
    .trim();
  
  return cleaned;
}

function parseGroqJSON(response: string): any {
  try {
    // Direct parse attempt
    return JSON.parse(response);
  } catch (e) {
    // Try sanitizing
    const sanitized = sanitizeJSONString(response);
    try {
      return JSON.parse(sanitized);
    } catch (e2) {
      // Last resort: extract JSON object manually
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sanitized2 = sanitizeJSONString(jsonMatch[0]);
        return JSON.parse(sanitized2);
      }
      throw e;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🤖 FULLY DYNAMIC ROADMAP GENERATION FROM GROQ
// ═══════════════════════════════════════════════════════════════════

async function generateDynamicRoadmap(
  role: string,
  durationMonths: number
): Promise<AIGeneratedPhase[]> {
  const groqClient = getGroqClient();
  
  if (!groqClient) {
    throw new Error("Groq API not available. Cannot generate dynamic roadmap.");
  }

  // Determine module count based on duration
  const moduleCounts: Record<number, number> = {
    1: 3,
    2: 5,
    3: 7,
    6: 10,
    12: 15,
  };
  
  const moduleCount = moduleCounts[durationMonths] || 10;
  const intensityLevel = getIntensityLevel(durationMonths);

  const prompt = `You are an expert curriculum designer for ${role}.

Generate a comprehensive ${durationMonths}-month learning roadmap for becoming a ${role}.
Intensity: ${intensityLevel}
Total modules needed: ${moduleCount}

Create a JSON response with this exact structure:
{
  "phases": [
    {
      "phase": "Foundation",
      "description": "Essential fundamentals and setup",
      "modules": [
        {
          "title": "Module Name",
          "description": "What learners will build/understand in this module",
          "skills": ["skill1", "skill2", "skill3"],
          "tasks": [
            "Practical task 1 - specific, measurable, actionable",
            "Practical task 2 - specific, measurable, actionable"
          ],
          "difficulty": "Beginner",
          "baseHours": 12
        }
      ]
    }
  ]
}

Requirements:
1. Create ${moduleCount} modules total across multiple phases
2. Each phase should have a clear purpose
3. Include Foundation, Core Skills, Application phases minimum
4. Each module must have exactly 2-4 specific, hands-on tasks
5. Tasks must be actionable (e.g., "Build a login form with validation", "Deploy to production")
6. Skills should be specific technologies/concepts
7. Difficulty: Beginner, Intermediate, or Advanced
8. Hours should be realistic for the ${durationMonths}-month timeline
9. Return ONLY valid JSON, no markdown, no explanations

Focus on creating a practical, implementable roadmap that builds real skills.`;

  try {
    console.log(`🚀 Generating dynamic roadmap from Groq for ${role} (${durationMonths}m, ${moduleCount} modules)`);
    
    const message = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.choices?.[0]?.message?.content || "";
    
    if (!responseText) {
      throw new Error("Empty response from Groq");
    }

    console.log(`📝 Received Groq response (${responseText.length} chars)`);

    const parsed = parseGroqJSON(responseText);
    
    if (!parsed.phases || !Array.isArray(parsed.phases)) {
      throw new Error("Invalid response structure from Groq: missing phases array");
    }

    // Validate and normalize phases
    const validPhases: AIGeneratedPhase[] = parsed.phases.map((phase: any) => {
      if (!phase.modules || !Array.isArray(phase.modules)) {
        phase.modules = [];
      }
      
      return {
        phase: phase.phase || "Core",
        modules: phase.modules.map((m: any) => ({
          title: m.title || "Untitled Module",
          description: m.description || "",
          skills: Array.isArray(m.skills) ? m.skills : [],
          tasks: Array.isArray(m.tasks) ? m.tasks.slice(0, 4) : [],
          difficulty: ["Beginner", "Intermediate", "Advanced"].includes(m.difficulty) 
            ? m.difficulty 
            : "Intermediate",
          baseHours: typeof m.baseHours === 'number' ? Math.max(4, m.baseHours) : 12,
        })),
      };
    });

    const totalModulesGenerated = validPhases.reduce((sum, p) => sum + p.modules.length, 0);
    console.log(`✅ Generated ${totalModulesGenerated} modules across ${validPhases.length} phases`);
    
    return validPhases;
  } catch (error) {
    console.error(`❌ Dynamic roadmap generation failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════
// ⏱️ TIME ADAPTATION: Change intensity, NOT structure
// ═══════════════════════════════════════════════════════════════════

function getIntensityLevel(durationMonths: number): string {
  const intensityMap: Record<number, string> = {
    1: "Extreme (1 month) - Boot camp style, 40-50 hrs/week, minimal theory",
    2: "Very High (2 months) - Intensive, 30-40 hrs/week, compressed content",
    3: "High (3 months) - Fast-paced, 20-25 hrs/week, focused learning",
    6: "Moderate (6 months) - Balanced, 10-15 hrs/week, deep understanding",
    12: "Low (12 months) - Relaxed, 4-6 hrs/week, spaced repetition",
  };
  return intensityMap[durationMonths] || intensityMap[6];
}

interface TimeAdaptation {
  hoursMultiplier: number; // How to scale estimatedHours
  tasksPerModule: number; // Task density
  explanationDepth: "minimal" | "balanced" | "deep";
}

function getTimeAdaptation(durationMonths: number): TimeAdaptation {
  const adaptations: Record<number, TimeAdaptation> = {
    1: { hoursMultiplier: 0.5, tasksPerModule: 2, explanationDepth: "minimal" },
    2: { hoursMultiplier: 0.6, tasksPerModule: 2, explanationDepth: "minimal" },
    3: { hoursMultiplier: 0.75, tasksPerModule: 3, explanationDepth: "balanced" },
    6: { hoursMultiplier: 1.0, tasksPerModule: 4, explanationDepth: "balanced" },
    12: { hoursMultiplier: 1.5, tasksPerModule: 5, explanationDepth: "deep" },
  };
  return adaptations[durationMonths] || adaptations[6];
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 MODULE SELECTION: Select different modules based on duration
// ═══════════════════════════════════════════════════════════════════

function selectModulesByDuration(
  phases: StandardPhase[],
  durationMonths: number
): StandardPhase[] {
  // Determine how many modules to include
  const moduleCount: Record<number, number> = {
    1: 3,    // Essential only: setup + language + basics
    2: 5,    // Add one core skill
    3: 7,    // Add more core skills
    6: 10,   // Add application projects
    12: 13,  // Everything
  };

  const targetCount = moduleCount[durationMonths] || 13;

  // Flatten all modules, prioritizing by phase order
  const allModules: { module: StandardModule; phase: StandardPhase["phase"] }[] = [];
  phases.forEach((p) => {
    p.modules.forEach((m) => {
      allModules.push({ module: m, phase: p.phase });
    });
  });

  // Select modules: prioritize Foundation, then Core Skills, then Application, then Mastery
  const phaseOrder = ["Foundation", "Core Skills", "Application", "Mastery"];
  const selectedModules: typeof allModules = [];
  const selectedByPhase: Record<string, number> = {
    Foundation: 0,
    "Core Skills": 0,
    Application: 0,
    Mastery: 0,
  };

  for (const phaseName of phaseOrder) {
    const phaseModules = allModules.filter((m) => m.phase === phaseName);
    // For each phase, take modules based on remaining budget
    const remaining = targetCount - selectedModules.length;
    const toTake = Math.min(phaseModules.length, remaining);
    selectedModules.push(...phaseModules.slice(0, toTake));
    selectedByPhase[phaseName] = toTake;
  }

  // Rebuild phases with selected modules only
  const result: StandardPhase[] = [];
  for (const phaseName of phaseOrder) {
    const phaseData = phases.find((p) => p.phase === phaseName);
    if (phaseData && selectedByPhase[phaseName] > 0) {
      const selectedPhaseModules = selectedModules
        .filter((m) => m.phase === phaseName)
        .map((m) => m.module)
        .slice(0, selectedByPhase[phaseName]);

      result.push({
        ...phaseData,
        modules: selectedPhaseModules,
      });
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════
// 🧠 STANDARD ROADMAP STRUCTURE: Same for ALL users of same role
// ═══════════════════════════════════════════════════════════════════

interface StandardModule {
  title: string;
  description: string;
  coreContent: string; // What everyone needs to learn
  skills: string[];
  baseHours: number; // Before time adaptation
  baseDifficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface StandardPhase {
  phase: "Foundation" | "Core Skills" | "Application" | "Mastery";
  purpose: string;
  modules: StandardModule[];
}

/**
 * CRITICAL: This structure is THE SAME for all users with the same role.
 * Only personalization applied: userHasSkill flag
 */
const STANDARD_ROADMAPS: Record<string, StandardPhase[]> = {
  "Full Stack Developer": [
    {
      phase: "Foundation",
      purpose: "Environment setup and core concepts",
      modules: [
        {
          title: "Development Environment Setup",
          description: "Configure tools, version control, and development workspace",
          coreContent: "Git, command line, Node.js, npm, IDE configuration, local development server",
          skills: ["Git", "npm", "Command Line", "Node.js", "IDE"],
          baseHours: 12,
          baseDifficulty: "Beginner",
        },
        {
          title: "JavaScript Fundamentals",
          description: "Core language concepts needed for full stack development",
          coreContent: "Variables, data types, functions, callbacks, promises, async/await, ES6+ syntax",
          skills: ["JavaScript", "Async Programming", "ES6+"],
          baseHours: 20,
          baseDifficulty: "Beginner",
        },
        {
          title: "Web Fundamentals",
          description: "HTTP, browsers, DOM, and how the web works",
          coreContent: "HTTP requests, HTML structure, CSS styling, DOM manipulation, browser DevTools",
          skills: ["HTML", "CSS", "DOM", "HTTP"],
          baseHours: 16,
          baseDifficulty: "Beginner",
        },
      ],
    },
    {
      phase: "Core Skills",
      purpose: "Master primary technologies for the role",
      modules: [
        {
          title: "React: Component Architecture",
          description: "Build UIs with React components, hooks, and state management",
          coreContent: "Functional components, hooks (useState, useEffect, useContext), component composition, lifecycle",
          skills: ["React", "Hooks", "Component Design"],
          baseHours: 24,
          baseDifficulty: "Intermediate",
        },
        {
          title: "Node.js & Express Backend",
          description: "Create REST APIs and server logic with Node.js and Express",
          coreContent: "Express setup, routing, middleware, request handling, error handling, middleware chains",
          skills: ["Node.js", "Express", "REST APIs"],
          baseHours: 24,
          baseDifficulty: "Intermediate",
        },
        {
          title: "Database Design & SQL",
          description: "Design schemas and query data with SQL and relational databases",
          coreContent: "Schema design, normalization, CRUD operations, joins, transactions, indexing",
          skills: ["SQL", "Database Design", "PostgreSQL"],
          baseHours: 20,
          baseDifficulty: "Intermediate",
        },
        {
          title: "State Management & Data Flow",
          description: "Manage application state and data flow in full stack apps",
          coreContent: "Props drilling, context API, state management patterns, API integration, error handling",
          skills: ["State Management", "Data Flow", "API Integration"],
          baseHours: 18,
          baseDifficulty: "Intermediate",
        },
      ],
    },
    {
      phase: "Application",
      purpose: "Build real-world projects and production practices",
      modules: [
        {
          title: "Full Stack Project 1: Authentication & CRUD",
          description: "Build an app with user auth, CRUD operations, and database persistence",
          coreContent: "Password hashing, JWT tokens, protected routes, CRUD endpoints, form handling, validation",
          skills: ["Authentication", "CRUD", "API Design", "Security Basics"],
          baseHours: 28,
          baseDifficulty: "Advanced",
        },
        {
          title: "Full Stack Project 2: Real-time Features",
          description: "Implement real-time features, WebSockets, and live updates",
          coreContent: "WebSocket setup, real-time updates, event handling, scaling considerations, caching",
          skills: ["WebSockets", "Real-time Architecture", "Caching"],
          baseHours: 28,
          baseDifficulty: "Advanced",
        },
        {
          title: "Testing & Deployment",
          description: "Write tests and deploy applications to production",
          coreContent: "Unit testing, integration testing, end-to-end testing, CI/CD pipelines, Docker basics, cloud deployment",
          skills: ["Testing", "CI/CD", "Docker", "Deployment"],
          baseHours: 24,
          baseDifficulty: "Advanced",
        },
      ],
    },
    {
      phase: "Mastery",
      purpose: "System design and production optimization",
      modules: [
        {
          title: "System Design & Scalability",
          description: "Design scalable systems, databases, and architectures",
          coreContent: "Load balancing, database optimization, caching strategies, microservices patterns, scaling decisions",
          skills: ["System Design", "Scalability", "Architecture"],
          baseHours: 26,
          baseDifficulty: "Advanced",
        },
        {
          title: "Performance Optimization",
          description: "Optimize frontend and backend performance",
          coreContent: "React optimization, bundle optimization, database query optimization, memory management, monitoring",
          skills: ["Performance", "Optimization", "Monitoring"],
          baseHours: 22,
          baseDifficulty: "Advanced",
        },
        {
          title: "Deployment & DevOps Basics",
          description: "Deploy to production, monitoring, and operational excellence",
          coreContent: "Kubernetes basics, Docker advanced, cloud services (AWS/GCP), monitoring, logging, incident response",
          skills: ["DevOps", "Cloud Platforms", "Monitoring", "Operations"],
          baseHours: 20,
          baseDifficulty: "Advanced",
        },
      ],
    },
  ],
  // Simplified: Other roles follow same 4-phase structure
  "Frontend Engineer": [
    {
      phase: "Foundation",
      purpose: "Web fundamentals and JavaScript",
      modules: [
        {
          title: "HTML & CSS Mastery",
          description: "Modern HTML5 and CSS3 for responsive design",
          coreContent: "Semantic HTML, flexbox, grid, responsive design, accessibility basics",
          skills: ["HTML", "CSS", "Responsive Design"],
          baseHours: 16,
          baseDifficulty: "Beginner",
        },
        {
          title: "JavaScript Fundamentals",
          description: "Core JavaScript concepts and DOM manipulation",
          coreContent: "ES6+ syntax, DOM manipulation, event handling, async programming",
          skills: ["JavaScript", "DOM", "ES6+"],
          baseHours: 20,
          baseDifficulty: "Beginner",
        },
        {
          title: "Development Tools & Workflow",
          description: "Modern frontend tooling and version control",
          coreContent: "Git, npm, webpack, build tools, browser DevTools, debugging",
          skills: ["Git", "npm", "Build Tools"],
          baseHours: 12,
          baseDifficulty: "Beginner",
        },
      ],
    },
    {
      phase: "Core Skills",
      purpose: "React and modern frontend frameworks",
      modules: [
        {
          title: "React Fundamentals",
          description: "Components, hooks, and state management",
          coreContent: "Functional components, hooks, state, effects, context API",
          skills: ["React", "Hooks", "State Management"],
          baseHours: 24,
          baseDifficulty: "Intermediate",
        },
        {
          title: "Advanced React Patterns",
          description: "Performance optimization and advanced patterns",
          coreContent: "Memoization, lazy loading, code splitting, error boundaries, portals",
          skills: ["React Advanced", "Performance", "Patterns"],
          baseHours: 20,
          baseDifficulty: "Intermediate",
        },
        {
          title: "Styling & UI Libraries",
          description: "CSS-in-JS, component libraries, and design systems",
          coreContent: "Styled-components, Tailwind CSS, Material UI, design systems",
          skills: ["Styling", "CSS-in-JS", "Component Libraries"],
          baseHours: 18,
          baseDifficulty: "Intermediate",
        },
        {
          title: "API Integration & Async",
          description: "Fetching data and handling async operations",
          coreContent: "Fetch API, axios, error handling, loading states, data caching",
          skills: ["API Integration", "Async", "Data Fetching"],
          baseHours: 16,
          baseDifficulty: "Intermediate",
        },
      ],
    },
    {
      phase: "Application",
      purpose: "Real-world projects and best practices",
      modules: [
        {
          title: "Frontend Project 1: Dynamic Web App",
          description: "Build a complex single-page application",
          coreContent: "Routing, form handling, state management, API integration, error handling",
          skills: ["SPA", "Routing", "Forms", "Architecture"],
          baseHours: 28,
          baseDifficulty: "Advanced",
        },
        {
          title: "Frontend Project 2: Real-time UI",
          description: "Build real-time interactive interfaces",
          coreContent: "WebSockets, live updates, optimistic UI, animations, performance monitoring",
          skills: ["Real-time UI", "Animations", "Performance"],
          baseHours: 28,
          baseDifficulty: "Advanced",
        },
        {
          title: "Testing & Quality Assurance",
          description: "Write comprehensive tests and ensure code quality",
          coreContent: "Unit testing, integration testing, E2E testing, accessibility testing",
          skills: ["Testing", "Quality Assurance", "Accessibility"],
          baseHours: 24,
          baseDifficulty: "Advanced",
        },
      ],
    },
    {
      phase: "Mastery",
      purpose: "Advanced optimization and system design",
      modules: [
        {
          title: "Performance Mastery",
          description: "Core Web Vitals and advanced optimization",
          coreContent: "LCP, FID, CLS optimization, bundle analysis, code splitting strategies",
          skills: ["Performance", "Optimization", "Monitoring"],
          baseHours: 24,
          baseDifficulty: "Advanced",
        },
        {
          title: "Advanced Architecture",
          description: "Scalable frontend architecture and design patterns",
          coreContent: "Micro frontends, design patterns, advanced state management, testing strategies",
          skills: ["Architecture", "Design Patterns", "Advanced Testing"],
          baseHours: 22,
          baseDifficulty: "Advanced",
        },
        {
          title: "Accessibility & UX Excellence",
          description: "WCAG compliance and exceptional user experiences",
          coreContent: "WCAG 2.1 standards, semantic HTML, screen readers, inclusive design",
          skills: ["Accessibility", "UX", "WCAG"],
          baseHours: 20,
          baseDifficulty: "Advanced",
        },
      ],
    },
  ],
  // Add more roles following the same pattern...
};

// ═══════════════════════════════════════════════════════════════════
// 🧠 NORMALIZE ROLE: Handle kebab-case, title case variations
// ═══════════════════════════════════════════════════════════════════

function normalizeRole(role: string): string {
  // Exact match first
  if (STANDARD_ROADMAPS[role]) {
    return role;
  }

  // Try to match ignoring case
  const matched = Object.keys(STANDARD_ROADMAPS).find((key) => key.toLowerCase() === role.toLowerCase());
  if (matched) {
    return matched;
  }

  // Default to Full Stack Developer if role not found
  console.warn(`⚠️ Role "${role}" not found in database, defaulting to "Full Stack Developer"`);
  return "Full Stack Developer";
}

// ═══════════════════════════════════════════════════════════════════
// ✨ APPLY PERSONALIZATION: userHasSkill flag (does NOT change structure)
// ═══════════════════════════════════════════════════════════════════

function checkUserSkills(module: StandardModule, userSkills: string[]): boolean {
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  return module.skills.some((skill) => userSkillsLower.includes(skill.toLowerCase()));
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 ENHANCE WITH AI: Only descriptions and tasks (NOT structure)
// ═══════════════════════════════════════════════════════════════════

async function enhanceModuleWithAI(
  module: StandardModule,
  role: string,
  durationMonths: number,
  adaptation: TimeAdaptation
): Promise<{ description: string; tasks: string[] }> {
  const groqClient = getGroqClient();

  // If Groq is not available, use fallback
  if (!groqClient) {
    console.log(`📌 Groq unavailable for ${module.title}, using fallback`);
    return {
      description: module.description,
      tasks: Array(adaptation.tasksPerModule)
        .fill(0)
        .map((_, i) => `${module.title} - Task ${i + 1}: Apply ${module.skills[i % module.skills.length] || "practical skills"}`),
    };
  }

  try {
    const intensityLabel = getIntensityLevel(durationMonths);
    const prompt = `You are an expert learning designer. Generate training content for this module.

Role: ${role}
Module: ${module.title}
Duration: ${durationMonths} month${durationMonths > 1 ? "s" : ""} (${intensityLabel})
Core Topics: ${module.coreContent}

Create:
1. One enhanced 2-3 sentence description (practical, action-focused)
2. Exactly ${adaptation.tasksPerModule} specific hands-on tasks

Return ONLY valid JSON:
{
  "description": "...",
  "tasks": ["task1", "task2", "task3"]
}`;

    console.log(`🤖 Calling Groq AI for: ${module.title}`);
    
    const message = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 400,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract response content
    const responseText = message.choices?.[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("Empty response from Groq");
    }

    // Parse JSON from response - handle multiple formats
    let jsonStr: string | null = null;

    // Try 1: Extract from markdown code block ```json ... ```
    const mdMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (mdMatch?.[1]) {
      jsonStr = mdMatch[1].trim();
    }

    // Try 2: Extract first complete JSON object
    if (!jsonStr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }

    if (!jsonStr) {
      console.warn(`⚠️ No JSON found in Groq response for ${module.title}. Response: ${responseText.substring(0, 200)}`);
      throw new Error("Invalid JSON format");
    }

    // Smart JSON cleaning: escape unescaped newlines in string values
    // Replace actual newlines/tabs with their escaped equivalents
    jsonStr = jsonStr
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      // Remove trailing commas before } or ]
      .replace(/,(\s*[}\]])/g, '$1')
      .trim();

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      // Fallback: try to extract just the values we need using regex
      // Use [\s\S]*? to match any character including newlines (non-greedy)
      const descMatch = jsonStr.match(/"description"\s*:\s*"([\s\S]*?)"\s*,/);
      const tasksArrayMatch = jsonStr.match(/"tasks"\s*:\s*\[([\s\S]*?)\]/);
      
      if (descMatch && tasksArrayMatch) {
        try {
          let description = descMatch[1]
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .substring(0, 300);
          
          // Clean up escaped quotes
          description = description.replace(/\\"/g, '"');
          
          const tasksJson = '[' + tasksArrayMatch[1] + ']';
          const tasks = JSON.parse(tasksJson);
          
          result = { description, tasks };
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback parsing failed for ${module.title}: ${fallbackError instanceof Error ? fallbackError.message : fallbackError}`);
          throw parseError;
        }
      } else {
        console.warn(`⚠️ JSON parse error for ${module.title}: ${parseError instanceof Error ? parseError.message : parseError}`);
        console.warn(`Attempted to parse: ${jsonStr.substring(0, 300)}`);
        throw parseError;
      }
    }

    if (!result.description || !Array.isArray(result.tasks)) {
      throw new Error("Invalid response structure");
    }

    console.log(`✅ AI enhanced: ${module.title} (${result.tasks.length} tasks)`);
    return {
      description: result.description,
      tasks: result.tasks.slice(0, adaptation.tasksPerModule),
    };
  } catch (error) {
    console.error(`❌ Groq enhancement failed for ${module.title}:`, error instanceof Error ? error.message : error);
    // Fallback to default tasks
    return {
      description: module.description,
      tasks: Array(adaptation.tasksPerModule)
        .fill(0)
        .map((_, i) => `${module.title} - Task ${i + 1}: Apply ${module.skills[i % module.skills.length] || "core concepts"}`),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎓 BUILD THE ROADMAP: Role-standard + User personalization
// ═══════════════════════════════════════════════════════════════════

export async function generateRoadmap(input: RoadmapGenerationInput): Promise<GeneratedRoadmap> {
  const { role, userSkills, durationMonths } = input;

  console.log(`📍 [ROADMAP] Generating for role: "${role}", duration: ${durationMonths}m, skills: ${userSkills.length}`);

  // Normalize role
  const normalizedRole = normalizeRole(role);
  console.log(`📍 [ROADMAP] Normalized role: "${normalizedRole}"`);

  // Get standard roadmap for this role
  let standardRoadmap = STANDARD_ROADMAPS[normalizedRole];
  if (!standardRoadmap) {
    throw new Error(`No roadmap found for role: ${normalizedRole}`);
  }

  // 🎯 SELECT MODULES BASED ON DURATION
  standardRoadmap = selectModulesByDuration(standardRoadmap, durationMonths);
  console.log(`📊 Selected ${standardRoadmap.reduce((sum, p) => sum + p.modules.length, 0)} modules for ${durationMonths}m duration`);

  // Get time adaptation
  const adaptation = getTimeAdaptation(durationMonths);

  // Generate personalized roadmap
  const generatedRoadmap: RoadmapPhase[] = [];
  let totalModules = 0;

  for (const standardPhase of standardRoadmap) {
    const modules: Module[] = [];

    for (const standardModule of standardPhase.modules) {
      const id = `${normalizedRole.replace(/\s+/g, "-")}-${standardModule.title.replace(/\s+/g, "-")}`;

      // Check if user already has this skill
      const userHasSkill = checkUserSkills(standardModule, userSkills);

      // Enhance with AI (only description and tasks)
      const enhancement = await enhanceModuleWithAI(standardModule, normalizedRole, durationMonths, adaptation);

      modules.push({
        id,
        title: standardModule.title,
        description: enhancement.description || standardModule.description,
        skills: standardModule.skills,
        tasks: enhancement.tasks || [],
        difficulty: standardModule.baseDifficulty,
        estimatedHours: Math.round(standardModule.baseHours * adaptation.hoursMultiplier),
        userHasSkill, // ✅ PERSONALIZATION: Does NOT affect structure
      });

      totalModules++;
    }

    generatedRoadmap.push({
      phase: standardPhase.phase,
      modules,
    });
  }

  const totalHours = generatedRoadmap.reduce((sum, phase) => sum + phase.modules.reduce((s, m) => s + m.estimatedHours, 0), 0);

  const result: GeneratedRoadmap = {
    roadmap: generatedRoadmap,
    duration: durationMonths,
    intensity: getIntensityLevel(durationMonths),
    totalModules,
    reasoning: `This ${durationMonths}-month ${normalizedRole} roadmap covers ${totalModules} modules across ${generatedRoadmap.length} capability layers. Focus: ${
      durationMonths === 1 ? "Boot camp - essentials only, 40-50 hrs/week" :
      durationMonths === 3 ? "Fast-paced learning, 20-25 hrs/week" :
      durationMonths === 6 ? "Balanced depth, 10-15 hrs/week" :
      durationMonths === 12 ? "Comprehensive mastery, 4-6 hrs/week" :
      "Custom pace"
    }. Total effort: ~${totalHours} hours.`,
  };

  console.log(`✅ [ROADMAP] Generated: ${totalModules} modules, ${totalHours} hours`);
  return result;
}
