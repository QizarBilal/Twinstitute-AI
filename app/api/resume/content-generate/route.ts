/**
 * API: Resume Content Generation
 * AI-powered content generation for resume sections
 * Used while user is building/editing their resume
 * Uses GROQ_RESUME_BUILDER_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  generateResumeContent,
} from "@/lib/ai/resume-agent";

interface ContentGenerationRequest {
  role: string;
  targetPosition: string;
  yearsExperience: number;
  skills: string[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ContentGenerationRequest;

    if (!body.role || !body.targetPosition) {
      return NextResponse.json(
        {
          success: false,
          error: "Role and targetPosition required",
        },
        { status: 400 }
      );
    }

    const generated = await generateResumeContent({
      role: body.role,
      targetPosition: body.targetPosition,
      yearsExperience: body.yearsExperience || 0,
      skills: body.skills || [],
    });

    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Failed to generate content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}
