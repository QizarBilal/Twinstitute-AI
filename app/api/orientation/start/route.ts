// app/api/orientation/start/route.ts
// Initialize orientation session for user

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    // Check if user already has orientation session
    const existingSession = await prisma.orientationSession.findUnique({
      where: { userId: user.id },
    });

    if (existingSession && existingSession.isCompleted) {
      return NextResponse.json(
        {
          message: "Orientation already completed",
          sessionId: existingSession.id,
          finalRole: existingSession.finalRoleId,
          status: "completed",
        },
        { status: 200 }
      );
    }

    // Create or resume orientation session
    const session_data = await prisma.orientationSession.upsert({
      where: { userId: user.id },
      update: { currentStage: "in-progress" },
      create: {
        userId: user.id,
        workflowType: "exploring",
        currentStage: "in-progress",
      },
    });

    return NextResponse.json({
      sessionId: session_data.id,
      status: "started",
      message: "Orientation session initialized. Let's explore your path!",
    });
  } catch (error) {
    console.error("Orientation start error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
