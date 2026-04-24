/**
 * API: Job Description Comparison
 * Compare resume with job description and provide insights
 * Uses GROQ_RESUME_BUILDER_KEY for intelligent analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  compareResumeWithJob,
  JobComparisonRequest,
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

    const body = (await req.json()) as JobComparisonRequest;

    if (!body.resumeContent || !body.jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume content and job description required",
        },
        { status: 400 }
      );
    }

    const comparison = await compareResumeWithJob(body);

    if (!comparison) {
      return NextResponse.json(
        { success: false, error: "Failed to compare resume with job" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error("Error in job comparison:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to compare resume",
      },
      { status: 500 }
    );
  }
}
