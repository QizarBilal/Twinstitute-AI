/**
 * API: AI Resume Enhancement
 * Real-time content enhancement while editing resume sections
 * Uses GROQ_RESUME_BUILDER_KEY for AI-powered suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  enhanceResumeContent,
  ResumeEnhancementRequest,
  ResumeEnhancementResponse,
} from "@/lib/ai/resume-agent";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ResumeEnhancementRequest;

    if (!body.section || !body.currentContent) {
      return NextResponse.json(
        { success: false, error: "Section and content required" },
        { status: 400 }
      );
    }

    const enhancement = await enhanceResumeContent(body);

    if (!enhancement) {
      return NextResponse.json(
        { success: false, error: "Failed to enhance content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enhancement,
    });
  } catch (error) {
    console.error("Error in AI enhancement:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to enhance",
      },
      { status: 500 }
    );
  }
}
