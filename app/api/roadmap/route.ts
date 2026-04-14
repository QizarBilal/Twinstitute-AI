import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/ai/roadmap-agent";

// GET /api/roadmap - Fetch user's roadmap based on their selected role
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

    // Check if roadmap already exists for this user
    let roadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id },
    });

    // If no roadmap exists, generate one
    if (!roadmap) {
      // Get user's current skills (from directionProfile or default to empty)
      const userSkills: string[] = [];

      // Generate roadmap
      const roadmapData = await generateRoadmap({
        role: user.selectedRole,
        userSkills,
        durationMonths: 6, // Default to 6 months
      });

      // Store in database
      roadmap = await prisma.roadmap.create({
        data: {
          userId: user.id,
          role: user.selectedRole,
          domain: user.selectedDomain || "General",
          durationMonths: 6,
          userSkills: userSkills,
          roadmapData: JSON.stringify(roadmapData.roadmap),
          totalDuration: roadmapData.totalDuration,
          intensityLevel: roadmapData.intensityLevel,
          reasoning: roadmapData.reasoning,
          estimatedCompletionMonths: 6,
          readinessScore: 0,
          completionPercentage: 0,
        },
      });
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
          roadmapData: roadmap.roadmapData ? JSON.parse(roadmap.roadmapData) : [],
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
    console.error("Roadmap fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch or generate roadmap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
