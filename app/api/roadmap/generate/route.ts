// app/api/roadmap/generate/route.ts
// Generate personalized roadmap based on role, skills, and duration
// ═══════════════════════════════════════════════════════════════════
// Uses ROLE-FIRST system: Structure determined by role + duration only
// User skills only affect userHasSkill personalization flag

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/ai/roadmap-generator-hybrid";

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
    const { role, userSkills = [], durationMonths } = body;

    // Validate input - MUST have role and duration
    if (!role || !durationMonths) {
      return NextResponse.json(
        { error: "Missing required fields: role, durationMonths" },
        { status: 400 }
      );
    }

    // Validate duration
    if (![1, 2, 3, 6, 12].includes(durationMonths)) {
      return NextResponse.json(
        { error: "Invalid duration. Must be 1, 2, 3, 6, or 12 months" },
        { status: 400 }
      );
    }

    console.log(`📍 [GENERATE] Roadmap for role: "${role}", duration: ${durationMonths}m, skills: ${userSkills.length}`);

    // Generate roadmap using ROLE-FIRST system
    let roadmapData;
    try {
      roadmapData = await generateRoadmap({
        role,
        userSkills: Array.isArray(userSkills) ? userSkills : [],
        durationMonths,
      });
    } catch (aiError) {
      console.error("❌ Roadmap generation failed:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate roadmap",
          details: aiError instanceof Error ? aiError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Validate that we have valid roadmap data
    if (!roadmapData?.phases || !Array.isArray(roadmapData.phases) || roadmapData.phases.length === 0) {
      console.error("❌ Generated roadmap is invalid:", roadmapData);
      return NextResponse.json(
        {
          success: false,
          error: "Generated roadmap is empty",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Valid roadmap: ${roadmapData.totalModules} modules, ${roadmapData.phases.length} phases`);

    // Store roadmap in database with proper error handling
    try {
      const roadmap = await prisma.roadmap.upsert({
        where: {
          userId_role: {
            userId: user.id,
            role: role,
          },
        },
        update: {
          userSkills: Array.isArray(userSkills) ? userSkills : [],
          durationMonths,
          roadmapData: JSON.stringify(roadmapData.phases),
          totalDuration: `${roadmapData.durationMonths} months`,
          intensityLevel: roadmapData.intensity,
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
          userSkills: Array.isArray(userSkills) ? userSkills : [],
          durationMonths,
          roadmapData: JSON.stringify(roadmapData.phases),
          totalDuration: `${roadmapData.durationMonths} months`,
          intensityLevel: roadmapData.intensity,
          reasoning: roadmapData.reasoning,
          completionPercentage: 0,
          estimatedCompletionMonths: durationMonths,
          readinessScore: 0,
        },
      });

      console.log(`✅ Roadmap saved: ${roadmap.id}`);

      // Return success response with consistent roadmap format
      const responseRoadmap = {
        id: roadmap.id,
        role: roadmap.role,
        userRole: role,
        domain: roadmap.domain,
        durationMonths: roadmap.durationMonths,
        roadmapData: roadmapData.phases,  // ✅ Consistent with GET endpoint
        totalDuration: roadmapData.durationMonths,
        intensityLevel: roadmapData.intensity,
        reasoning: roadmapData.reasoning,
        totalModules: roadmapData.totalModules,
        totalHours: roadmapData.totalHours,
      };

      return NextResponse.json(
        {
          success: true,
          message: "Roadmap generated successfully",
          roadmapId: roadmap.id,
          roadmap: responseRoadmap,
          durationMonths,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to store roadmap",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Roadmap generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate roadmap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
