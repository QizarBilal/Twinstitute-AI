// app/api/orientation/workflow/route.ts
// Process orientation workflow responses

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  orchestrateWorkflow1_ClearGoal,
  orchestrateWorkflow2_Confused,
  orchestrateWorkflow3_Exploring,
} from "@/lib/orientation/workflow-orchestrator";
import { getAllRoles } from "@/lib/orientation/role-intelligence";
import { NextRequest, NextResponse } from "next/server";

interface WorkflowRequest {
  sessionId: string;
  workflowType: "clear-goal" | "confused" | "exploring";
  payload: any; // Different for each workflow type
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: WorkflowRequest = await request.json();
    const { sessionId, workflowType, payload } = body;

    // Verify session belongs to user
    const orientationSession = await prisma.orientationSession.findFirst({
      where: {
        id: sessionId,
        user: { email: session.user.email },
      },
    });

    if (!orientationSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    let response;

    // ====== WORKFLOW 1: CLEAR GOAL ======
    if (workflowType === "clear-goal") {
      const { targetRole, currentSkills, skillLevels } = payload;

      response = await orchestrateWorkflow1_ClearGoal(
        targetRole,
        currentSkills,
        skillLevels
      );

      // Update session
      await prisma.orientationSession.update({
        where: { id: sessionId },
        data: {
          workflowType: "clear-goal",
          selectedRoleIds: JSON.stringify([targetRole]),
          userSkills: JSON.stringify(currentSkills),
          skillLevels: JSON.stringify(skillLevels),
        },
      });
    }

    // ====== WORKFLOW 2: CONFUSED ======
    else if (workflowType === "confused") {
      const { selectedRoleIds } = payload;
      const allRoles = getAllRoles();

      response = orchestrateWorkflow2_Confused(selectedRoleIds, allRoles);

      // Update session
      await prisma.orientationSession.update({
        where: { id: sessionId },
        data: {
          workflowType: "confused",
          selectedRoleIds: JSON.stringify(selectedRoleIds),
        },
      });
    }

    // ====== WORKFLOW 3: EXPLORING ======
    else if (workflowType === "exploring") {
      const { interestScores } = payload;

      response = orchestrateWorkflow3_Exploring(interestScores);

      // Update session
      await prisma.orientationSession.update({
        where: { id: sessionId },
        data: {
          workflowType: "exploring",
          interestScores: JSON.stringify(interestScores),
          detectedTraits: JSON.stringify(response.insights.detectedTraits || []),
        },
      });
    }

    // Log conversation
    const conversationLog = JSON.parse(orientationSession.conversationLog || "[]");
    conversationLog.push({
      type: "workflow",
      workflowType,
      message: response.message,
      timestamp: new Date(),
    });

    await prisma.orientationSession.update({
      where: { id: sessionId },
      data: {
        conversationLog: JSON.stringify(conversationLog),
        messageCount: orientationSession.messageCount + 1,
      },
    });

    return NextResponse.json({
      message: response.message,
      ui: response.ui,
      insights: response.insights,
      nextAction: response.nextAction,
      sessionId,
    });
  } catch (error) {
    console.error("Workflow processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
