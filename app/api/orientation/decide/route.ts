// app/api/orientation/decide/route.ts
// Save final orientation decision and activate systems

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoleById } from "@/lib/orientation/role-intelligence";
import { NextRequest, NextResponse } from "next/server";

interface DecisionPayload {
  sessionId: string;
  roleId: string;
  confidenceScore: number; // 0-100
  notes?: string;
}

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

    const body: DecisionPayload = await request.json();
    const { sessionId, roleId, confidenceScore, notes } = body;

    // Verify session
    const orientationSession = await prisma.orientationSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!orientationSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get role details
    const selectedRole = getRoleById(roleId);

    if (!selectedRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Create decision record
    const decision = await prisma.orientationDecision.create({
      data: {
        sessionId,
        userId: user.id,
        selectedRole: selectedRole.name,
        selectedDomain: selectedRole.domain,
        workflowUsed: orientationSession.workflowType,
        userSkills: orientationSession.userSkills,
        skillLevels: orientationSession.skillLevels,
        detectedTraits: orientationSession.detectedTraits,
        confidenceScore,
        userNotes: notes,
        alternativeRoles: orientationSession.selectedRoleIds,
      },
    });

    // Update orientation session as completed
    await prisma.orientationSession.update({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        currentStage: "completed",
        finalRoleId: roleId,
        finalDomain: selectedRole.domain,
        confidenceScore,
        completedAt: new Date(),
      },
    });

    // Update user with selected role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        selectedRole: selectedRole.name,
        selectedDomain: selectedRole.domain,
      },
    });

    // TODO: Trigger roadmap generation
    // TODO: Trigger labs initialization
    // TODO: Trigger dashboard activation

    return NextResponse.json({
      success: true,
      message: `Excellent! You've chosen ${selectedRole.name}. Let's build your path!`,
      decision: {
        roleId,
        roleName: selectedRole.name,
        domain: selectedRole.domain,
        confidenceScore,
      },
      nextSteps: {
        roadmap: "/dashboard/roadmap",
        labs: "/dashboard/labs",
        dashboard: "/dashboard",
      },
    });
  } catch (error) {
    console.error("Decision save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
