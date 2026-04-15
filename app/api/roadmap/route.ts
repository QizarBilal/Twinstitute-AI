import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/ai/roadmap-generator-hybrid";

// GET /api/roadmap - Fetch user's roadmap (ROLE-FIRST SYSTEM)
// ═══════════════════════════════════════════════════════════════════
// Roadmap structure is ONLY determined by:
// ✅ Finalized Role
// ✅ Selected Duration (1,2,3,6,12 months)
// ❌ User Skills (only used for personalization: userHasSkill flag)
// ═══════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        fullName: true,
        selectedRole: true,
        selectedDomain: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user hasn't selected a role yet
    if (!user.selectedRole) {
      return NextResponse.json(
        {
          success: false,
          message: "No role selected yet",
          roadmap: null,
          userRole: null,
        },
        { status: 200 }
      );
    }

    // Check if roadmap already exists for this user+role
    let roadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id, role: user.selectedRole },
    });

    // If no roadmap exists, generate one (ALWAYS 6-month default)
    if (!roadmap) {
      try {
        console.log(`📍 [API] Generating roadmap for user: ${user.id}, role: ${user.selectedRole}`);

        // Get user's current skills (empty if not set)
        const userSkills: string[] = [];

        // Generate roadmap using ROLE-FIRST system
        const roadmapData = await generateRoadmap({
          role: user.selectedRole,
          userSkills,
          durationMonths: 6, // Default: 6-month balanced pace
        });

        console.log(`✅ [API] Roadmap generated: ${roadmapData.totalModules} modules`);

        // Store in database
        roadmap = await prisma.roadmap.create({
          data: {
            userId: user.id,
            role: user.selectedRole,
            domain: user.selectedDomain || "General",
            durationMonths: 6,
            userSkills: userSkills,
            roadmapData: JSON.stringify(roadmapData.phases),
            totalDuration: `${roadmapData.durationMonths} months`,
            intensityLevel: roadmapData.intensity,
            reasoning: roadmapData.reasoning,
            estimatedCompletionMonths: 6,
            readinessScore: 0,
            completionPercentage: 0,
          },
        });

        console.log(`✅ [API] Roadmap saved to DB: ${roadmap.id}`);
      } catch (generationError) {
        console.error(`❌ [API] Roadmap generation failed:`, generationError);
        throw generationError;
      }
    }

    // Parse roadmap data
    let roadmapPhases = [];
    try {
      if (roadmap.roadmapData) {
        roadmapPhases = typeof roadmap.roadmapData === "string" ? JSON.parse(roadmap.roadmapData) : roadmap.roadmapData;
      }
    } catch (parseError) {
      console.error("Failed to parse roadmap data:", parseError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Roadmap loaded successfully",
        roadmap: {
          id: roadmap.id,
          role: roadmap.role,
          userRole: user.selectedRole,
          domain: roadmap.domain,
          durationMonths: roadmap.durationMonths,
          roadmapData: roadmapPhases,
          totalDuration: roadmap.totalDuration,
          intensityLevel: roadmap.intensityLevel,
          reasoning: roadmap.reasoning,
          completionPercentage: roadmap.completionPercentage,
          createdAt: roadmap.createdAt,
          updatedAt: roadmap.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [API] Roadmap fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch or generate roadmap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
