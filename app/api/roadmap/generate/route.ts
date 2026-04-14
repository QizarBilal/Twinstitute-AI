// app/api/roadmap/generate/route.ts
// Generate personalized roadmap based on role, skills, and duration

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/ai/roadmap-agent";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { role, userSkills, durationMonths } = body;

    // Validate input
    if (!role || !userSkills || !Array.isArray(userSkills) || !durationMonths) {
      return NextResponse.json(
        { error: "Missing or invalid required fields: role, userSkills (array), durationMonths" },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 6, 12].includes(durationMonths)) {
      return NextResponse.json(
        { error: "Invalid duration. Must be 1, 2, 3, 6, or 12 months" },
        { status: 400 }
      );
    }

    // Generate roadmap using AI
    const roadmapData = await generateRoadmap({
      role,
      userSkills,
      durationMonths,
    });

    // Store roadmap in database
    const roadmap = await prisma.roadmap.upsert({
      where: {
        userId_role: {
          userId: user.id,
          role: role,
        },
      },
      update: {
        userSkills,
        durationMonths,
        roadmapData: JSON.stringify(roadmapData.roadmap),
        totalDuration: roadmapData.totalDuration,
        intensityLevel: roadmapData.intensityLevel,
        reasoning: roadmapData.reasoning,
        completionPercentage: 0,
        estimatedCompletionMonths: durationMonths,
        readinessScore: 0,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        role,
        domain: "General",
        userSkills,
        durationMonths,
        roadmapData: JSON.stringify(roadmapData.roadmap),
        totalDuration: roadmapData.totalDuration,
        intensityLevel: roadmapData.intensityLevel,
        reasoning: roadmapData.reasoning,
        completionPercentage: 0,
        estimatedCompletionMonths: durationMonths,
        readinessScore: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Roadmap generated successfully",
        roadmapId: roadmap.id,
        roadmap: roadmapData.roadmap,
        totalDuration: roadmapData.totalDuration,
        intensityLevel: roadmapData.intensityLevel,
        reasoning: roadmapData.reasoning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate roadmap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
        skillsGained: ['SQL', 'Data Querying'],
        why: 'Core requirement for querying and managing data',
        impact: { execution: 5, problemSolving: 4 },
        dependencies: [],
      },
      {
        id: 'python_data',
        title: 'Python for Data Analysis',
        type: 'foundation',
        difficulty: 'intermediate',
        estimatedHours: 30,
        skillsGained: ['Python', 'Pandas', 'NumPy'],
        why: 'Essential tool for data manipulation and analysis',
        impact: { execution: 6, problemSolving: 5 },
        dependencies: ['sql_foundation'],
      },
      {
        id: 'statistics',
        title: 'Statistics & Probability',
        type: 'skill',
        difficulty: 'intermediate',
        estimatedHours: 25,
        skillsGained: ['Statistics', 'Probability', 'Distributions'],
        why: 'Foundation for data analysis and inference',
        impact: { execution: 4, problemSolving: 7 },
        dependencies: ['python_data'],
      },
      {
        id: 'etl_pipelines',
        title: 'ETL Pipeline Development',
        type: 'system',
        difficulty: 'intermediate',
        estimatedHours: 35,
        skillsGained: ['ETL', 'Data Pipeline', 'Apache Airflow'],
        why: 'Critical for production data workflows',
        impact: { execution: 7, problemSolving: 6 },
        dependencies: ['python_data', 'sql_foundation'],
      },
      {
        id: 'data_warehouse',
        title: 'Data Warehouse Architecture',
        type: 'system',
        difficulty: 'advanced',
        estimatedHours: 40,
        skillsGained: ['Data Warehouse', 'Snowflake', 'BigQuery'],
        why: 'Essential for scaling data operations',
        impact: { execution: 8, problemSolving: 6 },
        dependencies: ['etl_pipelines', 'statistics'],
      },
      {
        id: 'analytics_project',
        title: 'End-to-End Analytics Project',
        type: 'project',
        difficulty: 'advanced',
        estimatedHours: 50,
        skillsGained: ['Project Management', 'Analytics', 'Visualization'],
        why: 'Demonstrate practical data engineering skills',
        impact: { execution: 9, problemSolving: 8 },
        dependencies: ['data_warehouse', 'etl_pipelines'],
      },
    ],
  },
  'Software Engineer': {
    estimatedCompletionMonths: 6,
    readinessScore: 0,
    nodes: [
      {
        id: 'programming_fundamentals',
        title: 'Programming Fundamentals',
        type: 'foundation',
        difficulty: 'easy',
        estimatedHours: 25,
        skillsGained: ['Variables', 'Data Types', 'Control Flow', 'Functions'],
        why: 'Core concepts for all software development',
        impact: { execution: 6, problemSolving: 4 },
        dependencies: [],
      },
      {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        type: 'skill',
        difficulty: 'intermediate',
        estimatedHours: 40,
        skillsGained: ['Arrays', 'Trees', 'Graphs', 'Sorting'],
        why: 'Essential for coding interviews and efficient systems',
        impact: { execution: 5, problemSolving: 9 },
        dependencies: ['programming_fundamentals'],
      },
      {
        id: 'systems_design',
        title: 'System Design Fundamentals',
        type: 'system',
        difficulty: 'advanced',
        estimatedHours: 50,
        skillsGained: ['Scalability', 'High Availability', 'Load Balancing'],
        why: 'Required for senior and principal engineer roles',
        impact: { execution: 8, problemSolving: 7 },
        dependencies: ['dsa'],
      },
      {
        id: 'microservices',
        title: 'Microservices Architecture',
        type: 'system',
        difficulty: 'advanced',
        estimatedHours: 45,
        skillsGained: ['Docker', 'Kubernetes', 'Service Mesh'],
        why: 'Modern approach to building scalable systems',
        impact: { execution: 9, problemSolving: 6 },
        dependencies: ['systems_design'],
      },
      {
        id: 'backend_project',
        title: 'Backend System Project',
        type: 'project',
        difficulty: 'advanced',
        estimatedHours: 60,
        skillsGained: ['API Design', 'Database', 'Caching'],
        why: 'Demonstrate production-grade backend system',
        impact: { execution: 10, problemSolving: 8 },
        dependencies: ['microservices', 'dsa'],
      },
    ],
  },
}

// Safe JSON parser
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('JSON Parse Error:', e)
    return null
  }
}

// Validate roadmap structure
function validateRoadmapStructure(roadmap: any): boolean {
  if (!roadmap.nodes || !Array.isArray(roadmap.nodes)) {
    console.error('Invalid roadmap: no nodes array')
    return false
  }

  if (roadmap.nodes.length === 0) {
    console.error('Invalid roadmap: empty nodes array')
    return false
  }

  // Validate each node
  for (const node of roadmap.nodes) {
    if (!node.id || !node.title || !node.type) {
      console.error('Invalid node structure:', node)
      return false
    }
  }

  return true
}

// POST /api/roadmap/generate
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { role, domain } = body

    if (!role || !domain) {
      return badRequest('Role and domain are required')
    }

    // Check if roadmap already exists for this role/domain
    const existingRoadmap = await (prisma as any).roadmap.findUnique({
      where: {
        userId_role_domain: {
          userId: session.user.id,
          role,
          domain,
        },
      },
      include: { nodes: true },
    })

    if (existingRoadmap) {
      return success({
        roadmap: existingRoadmap,
        message: 'Using existing roadmap',
      })
    }

    // Get user profile for context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        fullName: true,
        selectedDomain: true,
        directionProfile: true,
      },
    })

    let roadmapData = null
    let usedFallback = false

    // Try to generate with Groq AI
    if (process.env.GROQ_API_KEY) {
      try {
        const systemPrompt = `You are an AI system that generates structured learning roadmaps.

You must:
- Output ONLY valid JSON
- No explanation
- No markdown
- No extra text

The roadmap must:
- Be tailored to the user's role and skills
- Include 15–25 nodes
- Include dependencies
- Include skill progression
- Include realistic difficulty and time estimates

Nodes must follow logical progression:
Foundation → Core → Systems → Projects → Evaluation

Do NOT hallucinate unrealistic skills.

Ensure all nodes are relevant to the role.

Return ONLY valid JSON with this structure:
{
  "estimatedCompletionMonths": number,
  "readinessScore": number (0-100),
  "nodes": [
    {
      "id": "unique_id",
      "title": "Node Title",
      "type": "foundation|skill|system|project|evaluation",
      "difficulty": "easy|intermediate|advanced|expert",
      "estimatedHours": number,
      "skillsGained": ["skill1", "skill2"],
      "why": "Why this node is important",
      "impact": {
        "execution": 0-10,
        "problemSolving": 0-10
      },
      "dependencies": ["node_id1", "node_id2"]
    }
  ]
}`

        const userContext = {
          role,
          domain,
          userName: user?.fullName || 'User',
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: `Generate a comprehensive roadmap for a ${role} in the ${domain} domain. User: ${JSON.stringify(userContext)}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 4096,
          }),
        })

        if (!groqResponse.ok) {
          throw new Error(`Groq API error: ${groqResponse.status}`)
        }

        const groqData = await groqResponse.json()
        const content = groqData.choices?.[0]?.message?.content

        if (content) {
          roadmapData = safeJsonParse(content)
          
          // Validate structure
          if (roadmapData && validateRoadmapStructure(roadmapData)) {
            console.log('✅ Valid AI-generated roadmap')
          } else {
            console.warn('⚠️ AI roadmap validation failed, using fallback')
            roadmapData = null
          }
        }
      } catch (groqError) {
        console.error('Groq API Error:', groqError)
        // Continue to fallback
      }
    }

    // Use fallback if AI generation failed
    if (!roadmapData) {
      usedFallback = true
      roadmapData = FALLBACK_TEMPLATES[role] || FALLBACK_TEMPLATES['Software Engineer']
      roadmapData.readinessScore = 0
      console.log('📋 Using fallback roadmap template')
    }

    // Create roadmap in database
    const newRoadmap = await (prisma as any).roadmap.create({
      data: {
        userId: session.user.id,
        role,
        domain,
        estimatedCompletionMonths: roadmapData.estimatedCompletionMonths,
        readinessScore: roadmapData.readinessScore || 0,
      },
    })

    // Create nodes
    const nodes = roadmapData.nodes.map((node: any, index: number) => ({
      nodeId: node.id || `node_${index}`,
      title: node.title,
      description: node.description,
      type: node.type,
      difficulty: node.difficulty,
      estimatedHours: node.estimatedHours || 30,
      skillsGained: node.skillsGained || [],
      why: node.why,
      impactExecution: node.impact?.execution || 5,
      impactProblemSolving: node.impact?.problemSolving || 5,
      dependencies: node.dependencies || [],
      roadmapId: newRoadmap.id,
    }))

    await (prisma as any).roadmapNode.createMany({
      data: nodes,
    })

    // Fetch complete roadmap with nodes
    const completeRoadmap = await (prisma as any).roadmap.findUnique({
      where: { id: newRoadmap.id },
      include: { nodes: true },
    })

    return success({
      roadmap: completeRoadmap,
      usedFallback,
      message: usedFallback ? 'Generated using fallback template' : 'Generated with AI',
    })
  } catch (error) {
    console.error('Roadmap Generation Error:', error)
    return serverError()
  }
}
